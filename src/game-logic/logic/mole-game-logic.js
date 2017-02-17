import PanelsActionCreator from '../actions/panels-action-creator';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import MoleGameActionCreator from '../actions/mole-game-action-creator';
import TrackedPanels from '../utils/tracked-panels';

export default class MoleGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    panelCount: 0, // Game progress (0..30)
    panels: new TrackedPanels()  // panel -> state
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.MOLE_GAME;

    this._complete = false;
    this._master = false;

    // Unique panel objects: panelKey -> panel
    this._panels = {};
    this.config.GAME_STRIPS.forEach(stripId => {
      this._lights.get(stripId).panelIds.forEach((panelId) => {
        const key = this._hash(stripId, panelId);
        this._panels[key] = { stripId, panelId, key };
      });
    });

    this.moleGameActionCreator = new MoleGameActionCreator(this.store.dispatcher);
  }

  get data() {
    return this.store.data.get('mole');
  }

  /*!
   * Starts the game logic. Only one of the sculptures should call this method.
   */
  start() {
    this._initRemainingPanels();
    this._complete = false;
    this._master = true;
    this.data.set('panelCount', 0);
    this.data.get('panels').clear();
    this._registerMoveDelay(0); // Request a new active panel immediately
  }

  /**
   * _remainingPanels is a set of panel keys for panels with STATE_OFF,
   * and are used to select random panels.
   */
  _initRemainingPanels() {
    this._remainingPanels = new Set();
    Object.keys(this._panels).forEach((panelkey) => this._remainingPanels.add(panelkey));
  }

  end() {
    this.config.GAME_STRIPS.forEach(stripId => this._lights.deactivateAll(stripId));
    this._master = false;
  }

  /**
   * handleActionPayload must _synchronously_ change tracked data in sculpture store.
   * Any asynchronous behavior must happen by dispatching actions.
   * We're _not_ allowed to dispatch actions synchronously.
   */
  handleActionPayload(payload) {
    if (this._complete) return;

    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [MoleGameActionCreator.AVAIL_PANEL]: this._actionAvailPanel.bind(this),
      [MoleGameActionCreator.DEAVAIL_PANEL]: this._actionDeavailPanel.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) actionHandler(payload);
  }

  /**
   * We only have a status animation at the end of the game
   */
  _actionFinishStatusAnimation() {
    this._complete = true;
    // There is currently no transition out, so we can synchronously start the next game
    this.store.moveToNextGame();
  }

  /**
   * Asynchronous panel activation
   */
  _actionAvailPanel(panel) {
    this._availPanel(panel);
  }

  /**
   * Asynchronous panel deactivation
   */
  _actionDeavailPanel(panel) {
    this._deavailPanel(panel);
  }

  /**
   * Local action:
   * 
   * If an active panel is pressed:
   * 1) Turn panel to location color
   * 2) Wait a short moment
   * 3) Avail the next panel
   * 4) increase/decrease # of simulaneously active panels
   */
  _actionPanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;

    const state = this.data.get('panels').getPanelState(stripId, panelId);
    if (state === TrackedPanels.STATE_OFF) {
      if (pressed) {
        this._lights.setColor(stripId, panelId, this.store.locationColor);
        this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);
      }
      else {
        this._lights.setToDefaultColor(stripId, panelId);
        this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.INACTIVE_INTENSITY);
      }
      return;
    }

    // If an active panel was touched
    if (state === TrackedPanels.STATE_ON) {
      this._colorPanel({stripId, panelId});

      // Only for master:
      if (this._master) {
        // If we have a timeout on this panel, kill the timeout
        this._removeTimeout(this._getPanelKey(payload));
        this._advanceGame();
      }
    }
  }

  /**
   * Advance game. Should only be called by one of the sculptures.
   */
  _advanceGame() {
    let panelCount = this.data.get("panelCount") + 1;
    if (panelCount === this.gameConfig.GAME_END) {
      this._lights.deactivateAll();
      this.store.setSuccessStatus();
    }
    else {
      this.data.set('panelCount', panelCount);
      // Determine whether to add, remove of keep # of simultaneous panels
      const addPanels = 1 + (this.gameConfig.NUM_ACTIVE_PANELS[panelCount] ? this.gameConfig.NUM_ACTIVE_PANELS[panelCount] : 0);
      
      for (let i=0; i<addPanels; i++) {
        // Wait before next panel
        this._registerMoveDelay(this.gameConfig.PANEL_SUCCESS_DELAY);
      }
    }
  }

  /*!
   * Remote action
   * If we're master, we're responsible for correctly advancing the game
   */
  mergeState(moleChanges, timestamps) {
    const moleData = this.data;

    if (moleChanges.hasOwnProperty('panelCount')) {
      moleData.set('panelCount', moleChanges.panelCount, timestamps.panelCount);
    }
    if (moleChanges.hasOwnProperty('panels')) {
      const panels = moleData.get('panels');
      const changedPanels = moleChanges.panels;
      for (let panelKey of Object.keys(changedPanels)) {
        const newstate = changedPanels[panelKey];
        const oldstate = panels.getPanelStateByKey(panelKey);
        // Only advance game when the state actually changes!
        if (newstate !== oldstate && newstate === TrackedPanels.STATE_IGNORED) {
          if (this._master) {
            // Make sure the panel is removed
            this._remainingPanels.delete(panelKey);
            // Make sure state is correct
            this._lights.setIntensity(this._panels[panelKey].stripId, this._panels[panelKey].panelId, this.gameConfig.COLORED_PANEL_INTENSITY);

            if (this._hasTimeout(panelKey)) { // Normal situation (no race condition): oldstate === ON
              this._removeTimeout(panelKey);
              this._advanceGame();
            }
            else {
              // If we don't have a timeout any longer, we have a race condition.
              // We could be in a few states:
              // * PANEL_SUCCESS_TIMER is active

              // PANEL_MOVE_DELAY timer is active
              if (oldstate === TrackedPanels.STATE_OFF && this._panels[panelKey].moveDelay) {
                clearTimeout(this._panels[panelKey].moveDelay);
                delete this._panels[panelKey].moveDelay;
                this._advanceGame();
                console.log('merged during MOVE_DELAY');
              }
              // The next panel was already made active
              else if (oldstate === TrackedPanels.STATE_OFF && !this._panels[panelKey].moveDelay) {
                // Note This can never be the last move, as the last panel would then be 
                // reactivated, not OFF.
                console.log('merged after new panel');
                // "Silent advance": Just update panelCount
                this.data.set('panelCount', this.data.get("panelCount") + 1);
              }
            }
          }
        }
        // IGNORED always wins. FIXME: We need to be able to restart the game
        if (oldstate !== TrackedPanels.STATE_IGNORED) {
          panels.setPanelStateByKey(panelKey, newstate, timestamps.panels[panelKey]);
        }
      }
    }
  }

  _hash(stripId, panelId) {
    return `${stripId},${panelId}`;
  }

  _getPanelKey({stripId, panelId}) {
    return this._hash(stripId, panelId);
  }

  /**
   * Request the next active panel, as the game progresses
   * Returns {panel, lifetime}
   */
  _nextActivePanel(count) {
    if (count < this.gameConfig.INITIAL_PANELS.length) {
      const panel = this.gameConfig.INITIAL_PANELS[count];
      const panelkey = this._getPanelKey(panel);
      return { panelkey, lifetime: this._getPanelLifetime(count) }; // No timeout
    }
    return { panelkey: this._getRandomPanel(), lifetime: this._getPanelLifetime(count)};
  }

  /**
   * Selects and returns a random panelkey from _remainingPanels
   */
  _getRandomPanel() {
    const idx = Math.floor(Math.random() * this._remainingPanels.size);
    const iter = this._remainingPanels.values();
    let curr = iter.next();
    for (let i=0; i<idx; i++) curr = iter.next();
    return curr.value;
  }

  _getPanelLifetime(count) {
    // find last and next lifetime values for interpolation
    let last, next;
    for (let elem of this.gameConfig.PANEL_LIFETIME) {
      if (!last || elem.count <= count) last = elem;
      next = elem;
      if (elem.count > count) break;
    }

    let min, max;
    if (last === next) {
      min = last.range[0];
      max = last.range[1];
    }
    else {
      min = last.range[0] + (next.range[0] - last.range[0]) * (count - last.count) / (next.count - last.count);
      max = last.range[1] + (next.range[1] - last.range[1]) * (count - last.count) / (next.count - last.count);
    }
    return 1000 * (Math.random() * (max - min) + min);
  }

  /**
   * Called if an active panel times out: We'll move the panel (deavail+pause+avail).
   */
  _panelTimeout(oldPanel) {
    const key = this._getPanelKey(oldPanel);
    delete this._panels[key].timeout;
    this.moleGameActionCreator.sendDeavailPanel(oldPanel);
    this._registerMoveDelay(this.gameConfig.PANEL_MOVE_DELAY, key);
  }

  _requestPanel(oldPanelKey = null) {
    if (oldPanelKey) delete this._panels[oldPanelKey].moveDelay;
    const {panelkey, lifetime} = this._nextActivePanel(this.data.get("panelCount"));
    this.moleGameActionCreator.sendAvailPanel(this._panels[panelkey]);
    this._panels[panelkey].timeout = setTimeout(this._panelTimeout.bind(this, this._panels[panelkey]), lifetime);
  }

  _registerMoveDelay(delay, panelKey = null) {
    const tid = setTimeout(this._requestPanel.bind(this, panelKey), delay);
    if (panelKey) this._panels[panelKey].moveDelay = tid;
  }

  /**
   * Check if we have a timeout registered on the given panel
   */
  _hasTimeout(key) {
    return this._panels[key].timeout !== undefined;
  }

  /**
   * Removes a timeout with the given panel key
   */
  _removeTimeout(key) {
    if (this._hasTimeout(key)) {
      clearTimeout(this._panels[key].timeout);
      delete this._panels[key].timeout;
    }
  }

  /**
   * Only called from a timeout
   */
  _availPanel(panel) {
    this._setPanelState(panel, TrackedPanels.STATE_ON);
    this._remainingPanels.delete(this._getPanelKey(panel));
    this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.ACTIVE_PANEL_INTENSITY);
  }

  /**
   * Only called from a timeout
   */
  _deavailPanel(panel) {
    this._remainingPanels.add(this._getPanelKey(panel));
    this._setPanelState(panel, TrackedPanels.STATE_OFF);
    this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.INACTIVE_PANEL_INTENSITY);
  }

  /**
   * Called by the sculpture first hitting an ON panel
   */
  _colorPanel(panel) {
    this._setPanelState(panel, TrackedPanels.STATE_IGNORED);
    this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.COLORED_PANEL_INTENSITY);
    this._lights.setColor(panel.stripId, panel.panelId, this.store.locationColor);
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  _setPanelState({stripId, panelId}, state) {
    this.data.get('panels').setPanelState(stripId, panelId, state);
  }

}
