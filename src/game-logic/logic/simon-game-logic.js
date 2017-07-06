import PanelsActionCreator from '../actions/panels-action-creator';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import SimonGameActionCreator from '../actions/simon-game-action-creator';
import PanelAnimation from '../animation/panel-animation';
import NormalizeStripFrame from '../animation/normalize-strip-frame';

export default class SimonGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0,
    targetPanel: null,
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = this.config.SIMON_GAME;

    this.simonGameActionCreator = new SimonGameActionCreator(this.store.dispatcher);
    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);

    this._targetSequenceIndex = 0;
    this._receivedInput = false;

    this._inputTimeout = null;
    this._replayTimeout = null;
  }

  get data() {
    return this.store.data.get('simon');
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  /**
   * Start game - only run by master
   */
  start() {
    // Activate RGB Strips
    if (this.gameConfig.RGB_STRIP) {
      this._lights.setIntensity(this.gameConfig.RGB_STRIP, '0', 100);
      this._lights.setColor(this.gameConfig.RGB_STRIP, '0', 'rgb0');
      this._lights.setIntensity(this.gameConfig.RGB_STRIP, '1', 100);
      this._lights.setColor(this.gameConfig.RGB_STRIP, '1', 'rgb1');
    }
    this.data.set('level', 0);
    this._playCurrentSequence();
  }

  /**
   * End game - only run by master
   */
  end() {
    let lights = this.store.data.get('lights');
    lights.deactivateAll();
    this.config.GAME_STRIPS.forEach((id) => lights.setIntensity(id, null, 0));
    if (this.gameConfig.RGB_STRIP) {
      lights.setIntensity(this.gameConfig.RGB_STRIP, null, 0);
    }
  }

  get complete() {
    return this._complete;
  }

  get currentStrip() {
    return this._currentLevelData && this._currentLevelData.stripId;
  }

  handleActionPayload(payload) {
    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this),
      [SimonGameActionCreator.REPLAY_SIMON_PATTERN]: this._actionReplaySimonPattern.bind(this),
      [SimonGameActionCreator.LEVEL_WON]: this._actionLevelWon.bind(this),
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionReplaySimonPattern() {
    if (!this._complete) this._playCurrentSequence();
  }

  /**
   * Upon finishing a status animation, the master will take over again
   * FIXME: Handle the final status animation separately?
   */
  _actionFinishStatusAnimation() {
    if (!this.store.isMaster()) return;

    if (this._complete) {
      setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), this.gameConfig.TRANSITION_OUT_TIME);
    }
    else {
      this._playCurrentSequence();
    }
  }

  _actionPanelPressed(payload) {
    if (this._complete || !this.store.isReady) return;

    const {stripId, panelId, pressed} = payload;
    const targetStripId = this._currentLevelData.stripId;

    // Presses on current strip stays on, other strips are free play
    if (pressed) {
      this._lights.setColor(stripId, panelId, this.store.locationColor);
      this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);
    }
    else if (targetStripId !== stripId) {
      this._lights.setToDefaultColor(stripId, panelId);
      this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.INACTIVE_INTENSITY);
    }

    if (this.store.isMaster() && pressed) this._handlePanelPress(stripId, panelId);
  }

  /**
   * Handle panel press (locally or through merge) - master only
   */
  _handlePanelPress(stripId, panelId) {
    const {stripId: targetStripId, panelSequence} = this._currentLevelData;

    // Only handle current game strips from here on
    if (targetStripId !== stripId) return;

    if (!this._receivedInput) {
      this._receivedInput = true;
      this._setInputTimeout();
    }

    if (this._targetPanel !== panelId) {
      this.store.setFailureStatus();
      return;
    }

    this._targetSequenceIndex += 1;

    if (this._targetSequenceIndex >= panelSequence.length) {
      setTimeout(() => this.simonGameActionCreator.sendLevelWon(), 1000);
    }
    else {
      this._targetPanel = panelSequence[this._targetSequenceIndex];
    }
  }

  /*!
   * Remote action
   */
  _actionMergeState(payload) {
    if (payload.simon) this._mergeSimon(payload.simon, payload.metadata.props.simon);
    if (payload.lights) this._mergeLights(payload.lights, payload.metadata.props.lights);
  }

  _mergeSimon(simonChanges, props) {
    // Master owns all local fields
    if (!this.store.isMaster()) {
      if (simonChanges.hasOwnProperty('level')) {
        this.data.set('level', simonChanges.level, props.level);
      }
      if (simonChanges.hasOwnProperty('targetPanel')) {
        this.data.set('targetPanel', simonChanges.targetPanel, props.targetPanel);
      }
    }
  }

  _mergeLights(lightsChanges, props) {
    // Master is responsible for merging panel actions
    if (this.store.isMaster()) {
      for (let stripId of Object.keys(lightsChanges)) {
        const changedPanels = lightsChanges[stripId].panels;
        for (let panelId of Object.keys(changedPanels)) {
          const changedPanel = changedPanels[panelId];
          const panelProps = props[stripId].panels[panelId];
          if (changedPanel.hasOwnProperty("active") && changedPanel.active) {
            // Accept this as a panel press if it's recorded as a change
            const panel = this._lights.getPanel(stripId, panelId);
            if (panel._changes.hasOwnProperty('active')) {
              // Simon-specific merge on panel activity changes
              this._handlePanelPress(stripId, panelId);
            }
          }
        }
      }
    }
  }


  _setInputTimeout() {
    clearTimeout(this._inputTimeout);

    const level = this._level;
    this._inputTimeout = setTimeout(() => {
      if (this.isReadyAndNotAnimating && this._receivedInput && this._level === level) {
        this.simonGameActionCreator.sendReplaySimonPattern();
      }
    }, this.gameConfig.INPUT_TIMEOUT);
  }

  _discardInput() {
    this._targetSequenceIndex = 0;
    this._targetPanel = null;
    this._receivedInput = false;
  }

  _actionLevelWon() {
    this.store.data.get('lights').deactivateAll();
    this._lights.setIntensity(this._currentLevelData.stripId, null, 0);

    this.store.setSuccessStatus();

    let level = this._level + 1;
    if (level >= this._levels) {
      this._complete = true;
    }

    this._level = level;
    // Make sure changes are merged by all slaves
    this.store.reassertChanges();
  }

  _playCurrentSequence() {
    const {stripId, panelSequence, frameDelay} = this._currentLevelData;

    this._playSequence(stripId, panelSequence, frameDelay);
    this._targetPanel = panelSequence[this._targetSequenceIndex];
  }

  _playSequence(stripId, panelSequence, frameDelay) {
    this._discardInput();

    const frames = panelSequence.map((panelId) => this._createSequenceFrame(stripId, panelId, frameDelay));
    frames.push(this._createLastSequenceFrame(stripId, frameDelay));
    const animation = new PanelAnimation(frames, this._finishPlaySequence.bind(this));

    this.store.playAnimation(animation);
  }

  _createSequenceFrame(stripId, panelId, frameDelay) {
    return this._createFrame(stripId, frameDelay, () => {
      this._lights.setIntensity(stripId, panelId, this.gameConfig.TARGET_PANEL_INTENSITY);
      this._lights.setColor(stripId, panelId, this.gameConfig.DEFAULT_SIMON_PANEL_COLOR);
    });
  }

  _createLastSequenceFrame(stripId, frameDelay) {
    return this._createFrame(stripId, frameDelay, () => {});
  }

  _createFrame(stripId, frameDelay, callback) {
    return new NormalizeStripFrame(this._lights, stripId,
      this.gameConfig.DEFAULT_SIMON_PANEL_COLOR,
      this.gameConfig.AVAILABLE_PANEL_INTENSITY,
      callback,
      frameDelay !== undefined ? frameDelay : this.gameConfig.SEQUENCE_ANIMATION_FRAME_DELAY);
  }

  _finishPlaySequence() {
    clearTimeout(this._replayTimeout);

    const level = this._level;
    this._replayTimeout = setTimeout(() => {
      if (this.isReadyAndNotAnimating && !this._receivedInput && this._level === level) {
        this.simonGameActionCreator.sendReplaySimonPattern();
      }
    }, this.gameConfig.DELAY_BETWEEN_PLAYS);
  }

  get _levels() {
    return this.gameConfig.PATTERN_LEVELS.length;
  }

  get _currentLevelData() {
    const level = this._level;
    return this.gameConfig.PATTERN_LEVELS[level];
  }

  get _level() {
    return this.data.get('level');
  }

  set _level(value) {
    this.store.reassertChanges(); // Make sure changes are merged by all slaves
    return this.data.set('level', value);
  }

  get _targetPanel() {
    return this.data.get('targetPanel');
  }

  set _targetPanel(value) {
    this.store.reassertChanges(); // Make sure changes are merged by all slaves
    return this.data.set('targetPanel', value);
  }

  get isReadyAndNotAnimating() {
    return this.store.isReady && !this.store.isPanelAnimationRunning;
  }
}

