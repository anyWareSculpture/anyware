import assert from 'assert';
import PanelsActionCreator from '../actions/panels-action-creator';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import MoleGameActionCreator from '../actions/mole-game-action-creator';
import TrackedPanels from '../utils/tracked-panels';
import COLORS from '../constants/colors';
import PanelAnimation from '../animation/panel-animation';
import Frame from '../animation/frame';

/**
 * Handles both the Minimal State (transitions) and the Mole Game Logic
 */
export default class MoleGameLogic {
  static STATE_NORMAL = 'normal';     // Game playing
  static STATE_FADE = 'fade';         // Fade non-winning colors
  static STATE_COMPLETE = 'complete'; // End of game, turn to black, play ping

  // These are automatically added to the sculpture store
  static trackedProperties = {
    panelCount: 0, // Game progress (0..30)
    panels: new TrackedPanels(),  // panel -> state
    state: MoleGameLogic.STATE_NORMAL,
  };

  /*
   * The constructor manages transition _into_ the Minimal State
   */
  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.MOLE_GAME;
    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);
    this.moleGameActionCreator = new MoleGameActionCreator(this.store.dispatcher);

    // Unique panel objects: panelKey -> panel
    this._panels = {};
    this.config.GAME_STRIPS.forEach(stripId => {
      this._lights.get(stripId).panelIds.forEach((panelId) => {
        const key = this._hash(stripId, panelId);
        this._panels[key] = { stripId, panelId, key };
      });
    });

    // Force RGB strips to black.
    // FIXME: This is a temporary fix for a firmware bug not respecting intensity
    this._lights.setColor(this.config.LIGHTS.RGB_STRIPS, null, COLORS.BLACK);
    this._turnOffAllGameStrips();
  }

  get data() {
    return this.store.data.get('mole');
  }

  /**
   * Transitions into this game. Calls callback when done.
   */
  transition(callback) {
    if (callback) callback();
  }

  /*!
   * Starts the game logic. Only the master should call this method.
   */
  start() {
    console.log('mole.start()');
    this._initRemainingPanels();
    this.data.set('state', MoleGameLogic.STATE_NORMAL);
    this.data.set('panelCount', 0);
    this.data.get('panels').clear();
    this._registerMoveDelay(0); // Request a new active panel immediately
  }

  /**
   * Reset game. Will reset the game to the beginning, without starting the game.
   * Only master should call this function.
   */
  reset() {
    console.log('mole.reset()');
    this._turnOffAllGameStrips();
    for (const panelkey of Object.keys(this._panels)) {
      this._removeTimeout(panelkey);
      const panel = this._panels[panelkey];
      if (panel.moveDelay !== undefined) {
        clearTimeout(panel.moveDelay);
        delete panel.moveDelay;
      }
    }
  }

  _turnOffAllGameStrips() {
    this.config.GAME_STRIPS.forEach(stripId => this._lights.setIntensity(stripId, null, 0));
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
    this.reset();
    this.config.GAME_STRIPS.forEach(stripId => this._lights.deactivateAll(stripId));
  }

  /**
   * handleActionPayload must _synchronously_ change tracked data in sculpture store.
   * Any asynchronous behavior must happen by dispatching actions.
   * We're _not_ allowed to dispatch actions synchronously.
   */
  handleActionPayload(payload) {
    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [MoleGameActionCreator.AVAIL_PANEL]: this._actionAvailPanel.bind(this),
      [MoleGameActionCreator.DEAVAIL_PANEL]: this._actionDeavailPanel.bind(this),
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) actionHandler(payload);
  }

  /**
   * Asynchronous panel activation
   */
  _actionAvailPanel(panel) {
    if (this.data.get('state') !== MoleGameLogic.STATE_NORMAL) return;
    this._availPanel(panel);
  }

  /**
   * Asynchronous panel deactivation
   */
  _actionDeavailPanel(panel) {
    if (this.data.get('state') !== MoleGameLogic.STATE_NORMAL) return;
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
    if (this.store.iAmAlone() || this.data.get('state') !== MoleGameLogic.STATE_NORMAL) {
        return;
    }

    let {stripId, panelId, pressed} = payload;
    this._lights.setActive(stripId, panelId, pressed);

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
      this._colorPanel(payload);

      // Only for master:
      if (this.store.isMaster()) {
        this._remainingPanels.delete(this._getPanelKey(payload));
        // If we have a timeout on this panel, kill the timeout
        this._removeTimeout(this._getPanelKey(payload));
        this._advanceGame();
      }
    }
  }

  /**
   * Trigger winning of game. Should only be called by master
   */
  _winGame() {
    // Count all panel colors
    const colorCount = { };
    this.config.GAME_STRIPS.forEach(stripId => {
      const panelIds = this._lights.get(stripId).panelIds;
      panelIds.forEach((panelId) => {
        const col = this._lights.getColor(stripId, panelId);
        colorCount[col] = (colorCount[col] || 0) + 1;
      });
    });

    // Determine winning color
    const winningColor = Object.entries(colorCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    console.log(`Winning color: ${winningColor}`);

    // Transition animation: 
    const transitionFrames = [
      // Disable interaction
      new Frame(() => {
        this._lights.deactivateAll();
      }, 0),
    // 1) Turn off non-winning colors
      new Frame(() => {
        this.data.set('state', MoleGameLogic.STATE_FADE);
        this.config.GAME_STRIPS.forEach(stripId => {
          const panelIds = this._lights.get(stripId).panelIds;
          panelIds.forEach((panelId) => {
            if (this._lights.getColor(stripId, panelId) !== winningColor) {
              this._lights.setIntensity(stripId, panelId, 0);
            }
          });
        });
      }, 4500),
    // 2) Turn off all remaining colors and start next game
      new Frame(() => {
        this.data.set('state', MoleGameLogic.STATE_COMPLETE);
        this._turnOffAllGameStrips();
        setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), this.config.SPACE_BETWEEN_GAMES_SECONDS * 1000);
      }, 5000),
    ];

    const transitionAnimation = new PanelAnimation(transitionFrames);
    this.store.playAnimation(transitionAnimation);
  }

  /**
   * Advance game. Should only be called by master
   */
  _advanceGame() {
    let panelCount = this.data.get('panelCount') + 1;
    this.data.set('panelCount', panelCount);
    if (panelCount === this.gameConfig.GAME_END) {
      this._winGame();
    }
    else {
      // Determine whether to add, remove of keep # of simultaneous panels
      const addPanels = 1 + (this.gameConfig.NUM_ACTIVE_PANELS[panelCount] ? this.gameConfig.NUM_ACTIVE_PANELS[panelCount] : 0);
      
      for (let i=0; i<addPanels; i++) {
        // Wait before next panel
        this._registerMoveDelay(this.gameConfig.PANEL_SUCCESS_DELAY);
      }
    }
  }

  _mergeFields(fieldNames, changes, props) {
    for (const fieldName of fieldNames) {
      if (changes.hasOwnProperty(fieldName)) {
        this.data.set(fieldName, changes[fieldName], props[fieldName]);
      }
    }
  }

  /*!
   * Remote action
   * If we're master, we're responsible for correctly advancing the game
   */
  _actionMergeState(payload) {
    if (!payload.mole) return; // Only handle mole state

    const moleData = this.data;
    const moleChanges = payload.mole;
    const moleProps = payload.metadata.props.mole;

    // Master owns the panelCount and state fields
    if (!this.store.isMaster()) {
      this._mergeFields(['panelCount', 'state'], moleChanges, moleProps);
    }

    // Iterate over changed panel states
    if (moleChanges.hasOwnProperty('panels')) {
      const panels = moleData.get('panels');
      const changedPanels = moleChanges.panels;
      for (let panelKey of Object.keys(changedPanels)) {
        const newstate = changedPanels[panelKey];
        const oldstate = panels.getPanelStateByKey(panelKey);

        // Slaves just merge
        if (!this.store.isMaster()) {
          panels.setPanelStateByKey(panelKey, newstate, moleProps.panels[panelKey]);
        }
        else {
          // Master will only accept state modification to STATE_IGNORED
          if (newstate !== oldstate && newstate === TrackedPanels.STATE_IGNORED) {
            panels.setPanelStateByKey(panelKey, newstate);

            // oldstate was ON
            // Normal situation (no race condition): oldstate === ON
            if (this._hasTimeout(panelKey)) { // Normal situation (no race condition): oldstate === ON
              console.log('Merge normal (after new panel)');
              if (oldstate !== TrackedPanels.STATE_ON) {
                assert('state must be STATE_ON');
              }
              
              this._remainingPanels.delete(panelKey);
              this._removeTimeout(panelKey);
              this._advanceGame();
            }
            // oldstate was OFF
            else {
              if (oldstate !== TrackedPanels.STATE_OFF) {
                assert('state must be STATE_OFF');
              }
              
              // If we don't have a timeout any longer, we have a race condition.
              // We could be in a few states:
              // 1_ PANEL_SUCCESS_TIMER is active
              // Master already hit the panel => Master wins.
              // This is a NOP since master will pass on the correct colors automatically
              
              // 2) PANEL_MOVE_DELAY timer is active
              // Master just deactivated the panel, waiting to activate the next one
              // => Kill timer and advance the game
              if (oldstate === TrackedPanels.STATE_OFF && this._panels[panelKey].moveDelay) {
                console.log('merged during MOVE_DELAY');
                clearTimeout(this._panels[panelKey].moveDelay);
                delete this._panels[panelKey].moveDelay;
                this._remainingPanels.delete(panelKey);
                this._advanceGame();
              }
              
              // 3) The next panel was already made active
              // Accept the change. We also need to reset the intensity
              // 
              // Note: This can never be the last move, as the last panel would then be 
              // reactivated, not OFF.
              else if (oldstate === TrackedPanels.STATE_OFF && !this._panels[panelKey].moveDelay) {
                console.log('merged after new panel');
                this._remainingPanels.delete(panelKey);
                // FIXME: If this is the last panel, we may need to go to _winGame()
                this.data.set('panelCount', this.data.get('panelCount') + 1);
                this._lights.setIntensity(this._panels[panelKey].stripId, this._panels[panelKey].panelId, this.gameConfig.COLORED_PANEL_INTENSITY);
              }
              else {
                console.log('merge: Master wins - slave is late');
              }
            }
            // Make sure changes are merged by all slaves
            this.store.reassertChanges();
          }
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
    console.log(`mole._panelTimeout(${key})`);
    delete this._panels[key].timeout;
    this.moleGameActionCreator.sendDeavailPanel(oldPanel);
    this._registerMoveDelay(this.gameConfig.PANEL_MOVE_DELAY, key);
  }

  _requestPanel(oldPanelKey = null) {
    console.log(`mole._requestPanel(${oldPanelKey})`);
    if (oldPanelKey) delete this._panels[oldPanelKey].moveDelay;
    const {panelkey, lifetime} = this._nextActivePanel(this.data.get('panelCount'));
    if (!panelkey) {
      console.error('No panel key!');
    }
    this.moleGameActionCreator.sendAvailPanel(this._panels[panelkey]);
    this._panels[panelkey].timeout = setTimeout(() => this._panelTimeout(this._panels[panelkey]), lifetime);
  }

  _registerMoveDelay(delay, panelKey = null) {
    console.log(`mole._registerMoveDelay(${panelKey})`);
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
