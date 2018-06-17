import PanelsActionCreator from '../actions/panels-action-creator';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import SimonGameActionCreator from '../actions/simon-game-action-creator';
import PanelAnimation from '../animation/panel-animation';
import NormalizeStripFrame from '../animation/normalize-strip-frame';
import Frame from '../animation/frame';
import COLORS from '../constants/colors';

/**
 * Handles both the Colour State (transitions) and the Simon Game Logic
 */
export default class SimonGameLogic {
  static STATE_NONE = 'none';         // Initial state
  static STATE_INTRO = 'intro';       // Intro: Turn on colors and play intro sound
  static STATE_OFF = 'off';           // In art state, but not playing
  static STATE_PLAYING = 'playing';   // Normal game play logic
  static STATE_FAILING = 'failing';   // Failure state: Sad sound
  static STATE_WINNING = 'winning';   // Level won: Happy sound
  static STATE_GAMEWON = 'gamewon';   // Game won: Very happy sound
  static STATE_COMPLETE = 'complete'; // End of game state: projector color
  static STATE_DONE = 'done';         // Game done, turn off lights and play exit sound

  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0,
    pattern: 0,
    targetPanel: null,
    state: SimonGameLogic.STATE_NONE,
    user: '',
    strip0Color: COLORS.BLACK,
    strip0Intensity: 0,
    strip1Color: COLORS.BLACK,
    strip1Intensity: 0,
    strip2Color: COLORS.BLACK,
    strip2Intensity: 0,
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

    this._targetSequenceIndex = 0; // Our current position in the sequence
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
        this.data.set('state', SimonGameLogic.STATE_OFF);
      }, 5000),
    ];
    this.store.playAnimation(new PanelAnimation(initFrames, callback));
  }

  /**
   * Start game - only run by master
   */
  start() {
    this.data.set('state', SimonGameLogic.STATE_PLAYING);
    this.data.set('level', 0);
    this.data.set('pattern', 0);
    for (let i=0;i<3;i++) {
      this.data.set(`strip${i}Color`, COLORS.BLACK);
      this.data.set(`strip${i}Intensity`, 0);
    }
    this._playCurrentSequence();
  }

  /**
   * Reset game. Will reset the game to the beginning, without starting the game.
   * Only master should call this function.
   */
  reset() {
    console.log(`simon.reset()`);
    const lights = this.store.data.get('lights');
    this._discardInput();
    lights.deactivateAll();
    this.config.GAME_STRIPS.forEach((id) => lights.setIntensity(id, null, 0));
    this.data.set('state', SimonGameLogic.STATE_OFF);
    this.store.cancelAnimations();
    
  }

  /**
   * End game - only run by master
   */
  end() {
  }

  /**
   * Turn off all lights
   */
  turnOffEverything() {
    this.lights.deactivateAll();
    this.config.GAME_STRIPS.forEach((stripId) => this.lights.setIntensity(stripId, null, 0));
    if (this.gameConfig.RGB_STRIP) {
      this.lights.setIntensity(this.gameConfig.RGB_STRIP, null, 0);
    }
  }

  isFreePlayAllowed() {
    const state = this.data.get('state');
    return(state === SimonGameLogic.STATE_PLAYING ||
           state === SimonGameLogic.STATE_FAILING ||
           state === SimonGameLogic.STATE_WINNING ||
           state === SimonGameLogic.STATE_GAMEWON ||
           state === SimonGameLogic.STATE_COMPLETE);
  }

  isPlaying() {
    return this.data.get('state') === SimonGameLogic.STATE_PLAYING;
  }

  isWinning() {
    return this.data.get('state') === SimonGameLogic.STATE_WINNING;
  }

  isWinningGame() {
    return this.data.get('state') === SimonGameLogic.STATE_GAMEWON;
  }

  // Returns the current strip, or undefined if there isn't a current level
  getCurrentStrip() {
    const {stripId} = this.getCurrentLevelData() || {};
    return stripId;
  }

  handleActionPayload(payload) {
    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [SimonGameActionCreator.REPLAY_SIMON_PATTERN]: this._actionReplaySimonPattern.bind(this),
      [SimonGameActionCreator.LEVEL_WON]: this._actionLevelWon.bind(this),
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  // master only
  _actionReplaySimonPattern() {
    // FIXME: This check may be unnecessary
    if (this.isPlaying()) this._playCurrentSequence();
  }

  _actionPanelPressed(payload) {
    if (this.store.iAmAlone()) return;

    console.log(`_actionPanelPressed(${JSON.stringify(payload)})`);
    const {stripId, panelId, pressed} = payload;
    this.lights.setActive(stripId, panelId, pressed);

    if (!this.isFreePlayAllowed() || !this.store.isReady) return;

    //
    // Handle non-current strip actions: Free play
    //
    if (stripId !== this.getCurrentStrip()) {
      if (pressed) {
        this.lights.setColor(stripId, panelId, this.store.locationColor);
        this.lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);
      }
      else {
        this.lights.setColor(stripId, panelId, this.data.get(`strip${stripId}Color`));
        this.lights.setIntensity(stripId, panelId, this.data.get(`strip${stripId}Intensity`));
      }
      return;
    }

    // From here on only handle the PLAYING state
    if (!this.isPlaying()) return;

    //
    // Handle current strip actions
    //

    // Ignore non-owner interactions
    if (this.hasUser() && this.getUser() !== this.store.me) {
      if (pressed) {
        this.lights.setColor(stripId, panelId, this.store.locationColor);
        this.lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);
      }
      else {
        this._resetColor(stripId, panelId);
      }
      return;
    }
    // Ignore one-off touches
    if (!this.hasUser() || this.getUser() === this.store.me) {
      if (panelId !== this.getTargetPanel() && this._shouldBeIgnored(panelId)) {
        return;
      }
    }

    if (pressed) {
      // Owner presses on current strip -> use location color
      this.lights.setColor(stripId, panelId, this.store.locationColor);
      this.lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);

      // Master owns the 'user' field only if it has been set
      if (!this.hasUser()) {
        this.setUser(this.store.me);
        this._setOwnerColor(stripId);
      }
      // Master owns all other fields
      if (this.store.isMaster()) this._handlePanelPress(stripId, panelId);
    }
  }

  _resetColor(stripId, panelId) {
    const {stripId: targetStripId, panelSequences} = this.getCurrentLevelData();
    const panelSequence = panelSequences[this.getPattern()];
    const panelIdx = panelSequence.indexOf(panelId);
    if (panelIdx < 0) {
      if (this.hasUser()) {
        this.lights.setColor(stripId, panelId, this.config.getLocationColor(this.getUser()));
        this.lights.setIntensity(stripId, panelId, this.gameConfig.INDICATOR_PANEL_INTENSITY);
      }
      else {
        this.lights.setColor(stripId, panelId, this.gameConfig.DEFAULT_SIMON_PANEL_COLOR);
        this.lights.setIntensity(stripId, panelId, 0);
      }
    }
    else {
      const targetSequenceIndex = panelSequence.indexOf(this.getTargetPanel());
      let color;
      if (panelIdx >= targetSequenceIndex) {
        color = this.gameConfig.DEFAULT_SIMON_PANEL_COLOR;
      }
      else {
        color = this.config.getLocationColor(this.getUser());
      }
      this.lights.setColor(stripId, panelId, color);
      this.lights.setIntensity(stripId, panelId, this.gameConfig.TARGET_PANEL_INTENSITY);
    }
  }

  /**
   * This is a bit of a hack; it checks if the given panel has a color corresponding to the location color
   * of the owner of this strip.
   */
  _isOwner(stripId, panelId) {
    const user = this.getUser();
    const color = this.lights.getColor(stripId, panelId);
    return this.config.getLocationColor(user) === color;
  }

  /**
   * Handle panel press (locally or through merge) - master only
   */
  _handlePanelPress(stripId, panelId) {
    console.log(`handlePanelPress(${stripId}, ${panelId})`);
    const {stripId: targetStripId, panelSequences} = this.getCurrentLevelData();

    // Only handle current game strips from here on
    if (targetStripId !== stripId) return;

    // If the press was not performed by the owner, this is a no-op
    if (!this._isOwner(stripId, panelId)) return;

    if (!this._receivedInput) {
      this._replayCount = 0;
      this._receivedInput = true;
      clearTimeout(this._replayTimeout);
      this._replayTimeout = null;
    }

    const panelSequence = panelSequences[this.getPattern()];
    if (this.getTargetPanel() !== panelId) {
      // Ignore touches on already solved panels
      if ([...Array(this._targetSequenceIndex).keys()].some((idx) => panelId === panelSequence[idx])) {
        return;
      }
      // Ignore one-off touches
      if (this._shouldBeIgnored(panelId)) {
        return;
      }
      return this._handleFailure();
    }

    this._resetInputTimer();
    this._targetSequenceIndex += 1;

    if (this._targetSequenceIndex >= panelSequence.length) {
      // FIXME: If we hit the last panel multiple times before the first animation frame is triggered,
      // we may call trigger _actionLevelWon() multiple times, restarting the animation.
      // This may be harmless, but would be nice to fix.
      this._actionLevelWon();
    }
    else {
      this.setTargetPanel(panelSequence[this._targetSequenceIndex]);
    }
  }

  _handleFailure() {
    console.log(`_handleFailure()`);
    clearTimeout(this._replayTimeout);
    this._replayTimeout = null;
    clearTimeout(this._inputTimeout);
    this._inputTimeout = null;
    const failureFrames = [
      new Frame(() => {
        this.data.set('state', SimonGameLogic.STATE_FAILING);
        this.clearUser();
      }, 0),
      new Frame(() => {
        this.data.set('state', SimonGameLogic.STATE_PLAYING);
        this._playCurrentSequence();
      }, 2000),
    ];

    const failureAnimation = new PanelAnimation(failureFrames);
    this.store.playAnimation(failureAnimation);
  }

  /*!
   * Remote action
   */
  _actionMergeState(payload) {
    if (payload.simon) this._mergeSimon(payload.simon, payload.metadata.props.simon);
    if (payload.lights) this._mergeLights(payload.lights, payload.metadata.props.lights);
  }

  _mergeFields(fieldNames, changes, props) {
    for (const fieldName of fieldNames) {
      if (changes.hasOwnProperty(fieldName)) {
        this.data.set(fieldName, changes[fieldName], props[fieldName]);
      }
    }
  }

  _mergeSimon(simonChanges, props) {
    // Master owns all local fields, except user if it hasn't been set
    if (!this.store.isMaster()) {
      this._mergeFields([
        'level', 'pattern', 'targetPanel', 'state',
        'strip0Color', 'strip0Intensity',
        'strip1Color', 'strip1Intensity',
        'strip2Color', 'strip2Intensity'], simonChanges, props);
    }
    if (simonChanges.hasOwnProperty('user')) {
      if (!this.store.isMaster() || !this.hasUser()) {
        this.setUser(simonChanges.user, props.user);
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
            const panel = this.lights.getPanel(stripId, panelId);
            console.log(changedPanel);
            console.log(panel._changes);
            // Simon-specific merge on panel activity changes
            console.log(`should handlePanelPress(${stripId}, ${panelId})`);
            if (!this.isPlaying() || !this.store.isReady) return;
            this._handlePanelPress(stripId, panelId);
          }
        }
      }
    }
  }


  _resetInputTimer() {
    clearTimeout(this._inputTimeout);

    const level = this.getLevel();
    this._inputTimeout = setTimeout(() => {
      if (this.isPlaying() && this.getLevel() === level) {
        this._handleFailure();
      }
    }, this.gameConfig.INPUT_TIMEOUT);
  }

  // master only
  _discardInput() {
    this._targetSequenceIndex = 0;
    this.setTargetPanel(null);
    this._receivedInput = false;
    clearTimeout(this._inputTimeout);
    this._inputTimeout = null;
  }

  /**
   * Master only
   */
  _actionLevelWon() {

    const stripId = this.getCurrentLevelData().stripId;
    // Set UI indicators to location color
    const winningUser = this.getUser();
    const winningColor = this.config.getLocationColor(winningUser);
    console.log(`_actionLevelWon(): stripId=${stripId}, winningUser=${winningUser}`);

    this.lights.deactivateAll(stripId);
    this.lights.setIntensity(stripId, null, 50);
    this.lights.setColor(stripId, null, winningColor);
    this.data.set(`strip${stripId}Color`, winningColor);
    this.data.set(`strip${stripId}Intensity`, 50);

    this.clearUser();
    const level = this.getLevel() + 1;
    if (level >= this.getNumLevels()) {
      this.data.set('state', SimonGameLogic.STATE_GAMEWON);
    }
    else {
      this.data.set('state', SimonGameLogic.STATE_WINNING);
    }
    this.setLevel(level);
    this.setPattern(0);
    // Make sure changes are merged by all slaves
    this.store.reassertChanges();

    this._playTransition();
  }

  _playTransition() {
    const successFrames = [
      new Frame(() => {
        this.data.set('state', SimonGameLogic.STATE_PLAYING);
        this._playCurrentSequence();
      }, 3000),
    ];

    const transitionFrames = [
      new Frame(() => {
        this.data.set('state', SimonGameLogic.STATE_COMPLETE);
      }, 3000),
      new Frame(() => {
        this.turnOffEverything();
        this.data.set('state', SimonGameLogic.STATE_DONE);
        setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), this.config.SPACE_BETWEEN_GAMES_SECONDS * 1000);
      }, 10000),
    ];

    this.store.playAnimation(new PanelAnimation(this.isWinningGame() ? transitionFrames : successFrames));
  }

  // master only
  _playCurrentSequence() {
    const {stripId, panelSequences, frameDelay} = this.getCurrentLevelData();
    const panelSequence = panelSequences[this.getPattern()];

    this._playSequence(stripId, panelSequence, frameDelay);
    this.setTargetPanel(panelSequence[this._targetSequenceIndex]);
  }
 
  // master only
  _playSequence(stripId, panelSequence, frameDelay) {
    this._discardInput();

    const frames = [
      new NormalizeStripFrame(this.lights, stripId,
                              this.gameConfig.DEFAULT_SIMON_PANEL_COLOR,
                              0),
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

  // master only
  _finishPlaySequence() {
    clearTimeout(this._replayTimeout);
    this._replayCount += 1;
    if (this._replayCount >= 3) {
      this.setPattern((this.getPattern() + 1) % this.getNumPatterns());
      this._replayCount = 0;
    }

    if (this.isPlaying()) {
      const level = this.getLevel();
      this._replayTimeout = setTimeout(() => {
        if (this.isPlaying() && this.getLevel() === level) {
          this.simonGameActionCreator.sendReplaySimonPattern();
        }
      }, this.gameConfig.DELAY_BETWEEN_PLAYS);
    }
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

  // Get the pattern index (index into the panelSequences array)
  getPattern() {
    return this.data.get('pattern');
  }

  // Set the pattern index (index into the panelSequences array)
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

  /**
   * Make all "off" panels the owner color
   */
  _setOwnerColor(stripId) {
    for (let panelId=0;panelId<10;panelId++) {
      if (this.lights.getIntensity(stripId, `${panelId}`) === 0) {
        this.lights.setColor(stripId, `${panelId}`, this.store.locationColor);
        this.lights.setIntensity(stripId, `${panelId}`, this.gameConfig.INDICATOR_PANEL_INTENSITY);
      }
    }
  }

  _shouldBeIgnored(panelId) {
    const {panelSequences} = this.getCurrentLevelData();
    const panelSequence = panelSequences[this.getPattern()];
    const targetSequenceIndex = panelSequence.indexOf(this.getTargetPanel());
    const ignores = [this.getTargetPanel()];
    if (targetSequenceIndex > 0) ignores.push(panelSequence[targetSequenceIndex-1]);
    if (ignores.some((ignoredPanelId) => Math.abs(panelId - ignoredPanelId) === 1)) return true;
    return false;
  }

  setUser(user, props) {
    return this.data.set('user', user, props);
  }

  getUser() {
    return this.data.get('user');
  }

  hasUser() {
    return this.getUser() !== '';
  }

  clearUser() {
    return this.setUser('');
  }
}

