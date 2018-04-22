import PanelsActionCreator from '../actions/panels-action-creator';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import SimonGameActionCreator from '../actions/simon-game-action-creator';
import PanelAnimation from '../animation/panel-animation';
import NormalizeStripFrame from '../animation/normalize-strip-frame';
import Frame from '../animation/frame';

/**
 * Handles both the Colour State (transitions) and the Simon Game Logic
 */
export default class SimonGameLogic {
  static STATE_NONE = 'none';         // Initial state
  static STATE_INTRO = 'intro';       // Intro: Turn on colors
  static STATE_NORMAL = 'normal';     // Normal game play logic
  static STATE_COMPLETE = 'complete'; // End of game

  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0,
    pattern: 0,
    targetPanel: null,
    state: SimonGameLogic.STATE_NONE,
  };

  /*
   * The constructor manages transition _into_ the Colour State
   */
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
    this._replayCount = 0;
  }

  get data() {
    return this.store.data.get('simon');
  }

  get lights() {
    return this.store.data.get('lights');
  }

  /**
   * Transitions into this game. Calls callback when done.
   */
  transition(callback) {
    const initFrames = [
      new Frame(() => {
        this.data.set('state', SimonGameLogic.STATE_INTRO);
        // Activate RGB Strips
        if (this.gameConfig.RGB_STRIP) {
          this.lights.setIntensity(this.gameConfig.RGB_STRIP, '0', 100);
          this.lights.setColor(this.gameConfig.RGB_STRIP, '0', 'rgb0');
          this.lights.setIntensity(this.gameConfig.RGB_STRIP, '1', 100);
          this.lights.setColor(this.gameConfig.RGB_STRIP, '1', 'rgb1');
        }
      }, 0),
      new Frame(() => {
      }, 5000),
    ];
    this.store.playAnimation(new PanelAnimation(initFrames, callback));
  }

  /**
   * Start game - only run by master
   */
  start() {
    this.data.set('state', SimonGameLogic.STATE_NORMAL);
    this.data.set('level', 0);
    this.data.set('pattern', 0);
    this._playCurrentSequence();
  }

  /**
   * Reset game. Will reset the game to the beginning, without starting the game.
   * Only master should call this function.
   */
  reset() {
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

  isComplete() {
    return this.data.get('state') === SimonGameLogic.STATE_COMPLETE;
  }

  getCurrentStrip() {
    const {stripId} = this.getCurrentLevelData();
    return stripId;
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
    if (!this.isComplete()) this._playCurrentSequence();
  }

  /**
   * Upon finishing a status animation, the master will take over again
   * FIXME: Handle the final status animation separately?
   */
  _actionFinishStatusAnimation() {
    if (!this.store.isMaster()) return;

    if (this.isComplete()) {
      setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), this.gameConfig.TRANSITION_OUT_TIME);
    }
    else {
      this._playCurrentSequence();
    }
  }

  _actionPanelPressed(payload) {
    if (this.store.iAmAlone()) return;

    if (this.isComplete() || !this.store.isReady) return;

    const {stripId, panelId, pressed} = payload;
    this.lights.setActive(stripId, panelId, pressed);

    // Presses on current strip stays on, other strips are free play
    if (pressed) {
      this.lights.setColor(stripId, panelId, this.store.locationColor);
      this.lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);
    }
    else if (stripId !== this.getCurrentStrip()) {
      this.lights.setToDefaultColor(stripId, panelId);
      this.lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.INACTIVE_INTENSITY);
    }

    if (this.store.isMaster() && pressed) this._handlePanelPress(stripId, panelId);
  }

  /**
   * Handle panel press (locally or through merge) - master only
   */
  _handlePanelPress(stripId, panelId) {
    const {stripId: targetStripId, panelSequences} = this.getCurrentLevelData();
    const panelSequence = panelSequences[this.getPattern()];

    // Only handle current game strips from here on
    if (targetStripId !== stripId) return;

    if (!this._receivedInput) {
      this._replayCount = 0;
      this._receivedInput = true;
      this._setInputTimeout();
    }

    if (this.getTargetPanel() !== panelId) {
      this.store.setFailureStatus();
      return;
    }

    this._targetSequenceIndex += 1;

    if (this._targetSequenceIndex >= panelSequence.length) {
      // FIXME: If we hit the last panel twice, we trigger sendLevelWon() twice, skipping a level
      setTimeout(() => this.simonGameActionCreator.sendLevelWon(), 1000);
    }
    else {
      this.setTargetPanel(panelSequence[this._targetSequenceIndex]);
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
      if (simonChanges.hasOwnProperty('pattern')) {
        this.data.set('pattern', simonChanges.pattern, props.pattern);
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
            const panel = this.lights.getPanel(stripId, panelId);
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

    const level = this.getLevel();
    this._inputTimeout = setTimeout(() => {
      if (this.isReadyAndNotAnimating() && this._receivedInput && this.getLevel() === level) {
        this.simonGameActionCreator.sendReplaySimonPattern();
      }
    }, this.gameConfig.INPUT_TIMEOUT);
  }

  _discardInput() {
    this._targetSequenceIndex = 0;
    this.setTargetPanel(null);
    this._receivedInput = false;
  }

  _actionLevelWon() {
    this.store.data.get('lights').deactivateAll();
    this.lights.setIntensity(this.getCurrentLevelData().stripId, null, 0);

    this.store.setSuccessStatus();

    const level = this.getLevel() + 1;
    if (level >= this.getNumLevels()) {
      this.data.set('state', SimonGameLogic.STATE_COMPLETE);
    }

    this.setLevel(level);
    this.setPattern(0);
    // Make sure changes are merged by all slaves
    this.store.reassertChanges();
  }

  _playCurrentSequence() {
    const {stripId, panelSequences, frameDelay} = this.getCurrentLevelData();
    const panelSequence = panelSequences[this.getPattern()];

    this._playSequence(stripId, panelSequence, frameDelay);
    this.setTargetPanel(panelSequence[this._targetSequenceIndex]);
  }

  _playSequence(stripId, panelSequence, frameDelay) {
    this._discardInput();

    const frames = [
      new NormalizeStripFrame(this.lights, stripId,
                              this.gameConfig.DEFAULT_SIMON_PANEL_COLOR,
                              this.gameConfig.AVAILABLE_PANEL_INTENSITY),
      ...panelSequence.map((panelId) => {
        return new Frame(() => {
          this.lights.setIntensity(stripId, panelId, this.gameConfig.TARGET_PANEL_INTENSITY);
          this.lights.setColor(stripId, panelId, this.gameConfig.DEFAULT_SIMON_PANEL_COLOR);
        }, frameDelay !== undefined ? frameDelay : this.gameConfig.SEQUENCE_ANIMATION_FRAME_DELAY);
      }),
    ];
    const animation = new PanelAnimation(frames, this._finishPlaySequence.bind(this));

    this.store.playAnimation(animation);
  }

  _finishPlaySequence() {
    clearTimeout(this._replayTimeout);
    this._replayCount += 1;
    if (this._replayCount >= 3) {
      this.setPattern((this.getPattern() + 1) % this.getNumPatterns());
      this._replayCount = 0;
    }

    const level = this.getLevel();
    this._replayTimeout = setTimeout(() => {
      if (this.isReadyAndNotAnimating() && !this._receivedInput && this.getLevel() === level) {
        this.simonGameActionCreator.sendReplaySimonPattern();
      }
    }, this.gameConfig.DELAY_BETWEEN_PLAYS);
  }

  getCurrentLevelData() {
    return this.gameConfig.PATTERN_LEVELS[this.getLevel()];
  }

  getNumLevels() {
    return this.gameConfig.PATTERN_LEVELS.length;
  }

  getLevel() {
    return this.data.get('level');
  }

  setLevel(value) {
    this.store.reassertChanges(); // Make sure changes are merged by all slaves
    return this.data.set('level', value);
  }

  getNumPatterns() {
    return this.gameConfig.PATTERN_LEVELS[this.getLevel()].panelSequences.length;
  }

  getPattern() {
    return this.data.get('pattern');
  }

  setPattern(pattern) {
    this.store.reassertChanges(); // Make sure changes are merged by all slaves
    return this.data.set('pattern', pattern);
  }

  getTargetPanel() {
    return this.data.get('targetPanel');
  }

  setTargetPanel(value) {
    this.store.reassertChanges(); // Make sure changes are merged by all slaves
    return this.data.set('targetPanel', value);
  }

  isReadyAndNotAnimating() {
    return this.store.isReady && !this.store.isPanelAnimationRunning;
  }
}

