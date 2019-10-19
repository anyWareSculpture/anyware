import events from 'events';
import assert from 'assert';

import GAMES from './constants/games';
import HandshakeGameLogic from './logic/handshake-game-logic';
import MoleGameLogic from './logic/mole-game-logic';
import DiskGameLogic from './logic/disk-game-logic';
import SimonGameLogic from './logic/simon-game-logic';
import SculptureActionCreator from './actions/sculpture-action-creator';
import PanelsActionCreator from './actions/panels-action-creator';
import DisksActionCreator from './actions/disks-action-creator';
import TrackedData from './utils/tracked-data';
import LightArray from './utils/light-array';

const gameLogicClasses = {
  [GAMES.MOLE]: MoleGameLogic,
  [GAMES.DISK]: DiskGameLogic,
  [GAMES.SIMON]: SimonGameLogic
};

function getGameLogicClass(game) {
  const GameLogicClass = gameLogicClasses[game];
  if (!GameLogicClass) {
    throw new Error(`Unrecognized game: ${game}`);
  }
  return GameLogicClass;
}

export default class SculptureStore extends events.EventEmitter {
  static EVENT_CHANGE = "change";
  static EVENT_LOCAL_CHANGE = "local-change";

  static STATUS_NONE = "none"; // This is the constructor state. Will be changed to init once all subsystems are up
  static STATUS_INIT = "init"; // This is the bootup state. Can be reset to this state by dispatching the RESTART action
  static STATUS_READY = "ready";
  static STATUS_LOCKED = "locked";
  static STATUS_SUCCESS = "success";
  static STATUS_FAILURE = "failure";

  constructor(dispatcher, config) {
    super();

    this.dispatcher = dispatcher;
    this.config = config;

    this._me = this.config.me;
    this.panelAnimation = null;
    this.handshakeLogic = new HandshakeGameLogic(this, this.config);
    this.data = new TrackedData({
      status: SculptureStore.STATUS_NONE,
      currentGame: null,
      lights: new LightArray({
        // stripId : number of panels
        [this.config.LIGHTS.STRIP_A]: 10,
        [this.config.LIGHTS.STRIP_B]: 10,
        [this.config.LIGHTS.STRIP_C]: 10,
        [this.config.LIGHTS.RGB_STRIPS]: 2,
        [this.config.LIGHTS.HANDSHAKE_STRIP]: 4,
        [this.config.LIGHTS.ART_LIGHTS_STRIP]: 4,
      }),
      handshake: new TrackedData(HandshakeGameLogic.trackedProperties),
      mole: new TrackedData(MoleGameLogic.trackedProperties),
      disk: new TrackedData(DiskGameLogic.trackedProperties),
      simon: new TrackedData(SimonGameLogic.trackedProperties)
    });

    // This is a sub-store for local (non-shared) disk positions
    this.localData = {
      diskPositions: {
        disk0: 0,
        disk1: 0,
        disk2: 0,
      },
    };

    this._reassertChanges = false;
    this._master = false;
    this.dispatchToken = dispatcher.register(this._handleActionPayload.bind(this));
    this.sculptureActionCreator = new SculptureActionCreator(this.dispatcher);
  }

  // Synchronous init. Needs to be run on all sculptures to establish a common start state.
  init() {
    const game = this._getNextGame();
    this._setCurrentGame(game);
    const GameLogicClass = getGameLogicClass(game);
    this.currentGameLogic = new GameLogicClass(this, this.config);
  }

  iAmAlone() {
    return this.handshakeLogic.getMyHandshakeState() === HandshakeGameLogic.HANDSHAKE_OFF;
  }
    
  /**
   * @returns {Boolean} Returns whether the mole game is currently being played
   */
  get isPlayingMoleGame() {
    return this.currentGameLogic instanceof MoleGameLogic;
  }

  /**
   * @returns {Boolean} Returns whether the disk game is currently being played
   */
  get isPlayingDiskGame() {
    return this.currentGameLogic instanceof DiskGameLogic;
  }

  /**
   * @returns {Boolean} Returns whether the simon game is currently being played
   */
  get isPlayingSimonGame() {
    return this.currentGameLogic instanceof SimonGameLogic;
  }

  isMaster() {
    return this._master;
  }

  setMaster(master) {
    this._master = master;
    this.emit(SculptureStore.EVENT_LOCAL_CHANGE);
  }

  /**
   * @returns {String} Returns the current sculpture ID
   */
  get me() {
    return this._me;
  }

  /**
   *
   */
  get locationColor() {
    return this.config.getLocationColor(this._me);
  }

  /**
   * @returns {Boolean} Returns whether a panel animation is running
   */
  isPanelAnimationRunning() {
    return this.panelAnimation ? this.panelAnimation.isRunning() : false;
  }

  getStatus() {
    return this.data.get('status');
  }

  /**
   * Restores the sculpture's status back to ready
   * Make sure to publish changes after calling this -- not necessary if an action is currently being handled already
   */
  restoreStatus() {
    this.data.set('status', SculptureStore.STATUS_READY);
  }

  /**
   * Locks the sculpture from any input
   * Make sure to publish changes after calling this -- not necessary if an action is currently being handled already
   */
  lock() {
    this.data.set('status', SculptureStore.STATUS_LOCKED);
  }

  /**
   * Sets the sculpture's status to success
   */
  setSuccessStatus() {
    this.data.set('status', SculptureStore.STATUS_SUCCESS);
  }

  /**
   * Sets the sculpture's status to failure
   */
  setFailureStatus() {
    this.data.set('status', SculptureStore.STATUS_FAILURE);
  }

  /**
   * Returns whether the sculpture's current status is READY
   */
  get isReady() {
    return this.data.get('status') === SculptureStore.STATUS_READY;
  }

  /**
   * Returns whether the sculpture's current status is INIT
   */
  get isInit() {
    return this.data.get('status') === SculptureStore.STATUS_INIT;
  }

  /**
   * Returns whether the sculpture's current status is NONE
   */
  get isNone() {
    return this.data.get('status') === SculptureStore.STATUS_NONE;
  }

  /**
   * Returns whether the sculpture's current status is locked
   */
  get isLocked() {
    return this.data.get('status') === SculptureStore.STATUS_LOCKED;
  }

  /**
   * Returns whether the sculpture's current status is success
   */
  get isStatusSuccess() {
    return this.data.get('status') === SculptureStore.STATUS_SUCCESS;
  }

  /**
   * Plays the given animation. Will cancel any existing animation
   */
  playAnimation(animation) {
    this.cancelAnimations();
    this.panelAnimation = animation;
    animation.play(this.dispatcher);
  }

  /**
   * Will cancel any existing animation and not call their completion function
   */
  cancelAnimations() {
    if (this.isPanelAnimationRunning()) {
      console.log('Cancelling existing animation');
      this.panelAnimation.cancel();
    }
    else console.log('cancelAnimations(): No animations running');
  }

  _startGame(game) {
    const startGame = () => {
      this.currentGameLogic.start();
      this.setMaster(true);
    };

    if (!game) {
      assert(this.currentGameLogic);
      startGame();
    }
    else {
      const GameLogicClass = getGameLogicClass(game);

      // end any previous game
      if (this.currentGameLogic) {
        this.currentGameLogic.end();
        this.setMaster(false);
      }
      this._resetGamePanels();

      this._setCurrentGame(game);
      this.currentGameLogic = new GameLogicClass(this, this.config);
      this.currentGameLogic.transition(startGame);
    }
  }

  _resetGamePanels() {
    const lightArray = this.data.get('lights');
    this.config.GAME_STRIPS.forEach((stripId) => {
      lightArray.setToDefaultColor(stripId);
      lightArray.setToDefaultIntensity(stripId);
    });
  }

  _assertNoChanges() {
    if (this.data.hasChanges()) {
      throw new Error(`Store was changed outside of an action: ${JSON.stringify(this.data.getChangedCurrentValues())}`);
    }
  }

  _publishChanges(metadata) {
    const {changes, props} = this.data.getChangedCurrentValues();
    if (Object.keys(changes).length) {
      this.emit(SculptureStore.EVENT_CHANGE, changes, {...metadata, props});
    }

    this._clearChanges();
  }

  _clearChanges() {
    this.data.clearChanges();
    this._reassertChanges = false;
  }

  reassertChanges() {
    this._reassertChanges = true;
  }

  _handleActionPayload(payload) {
    // Protects against accidentally modifying the store outside of an action
    // FIXME: We had to temporarily disable this as we don't have a mechanism for queuing
    // up changes which hasn't yet been published due to a Streaming Client lost connection.
    //    this._assertNoChanges();

    if (this.isLocked && !this._actionCanRunWhenLocked(payload.actionType)) {
      return;
    }

    // Merge Rule: Ignore self-responses
    if (payload.actionType === SculptureActionCreator.MERGE_STATE && 
        (payload.metadata.from === this.me || payload.metadata.mergedFrom === this.me)) {
      return;
    }

    this._delegateAction(payload);

    this.handshakeLogic.handleActionPayload(payload);
    if (this.currentGameLogic) this.currentGameLogic.handleActionPayload(payload);

    // If we're responding after a merge, set the 'mergedFrom' metadata field accordingly:
    // o Natural merge: Use the original sender
    // o Preferred or modified merge: Reset sender
    let metadata;
    if (payload.actionType === SculptureActionCreator.MERGE_STATE) {
      metadata = {
        mergedFrom: this._reassertChanges ? this.me : payload.metadata.from,
      };
    }
    this._publishChanges(metadata);
  }

  _actionCanRunWhenLocked(actionType) {
    return actionType === SculptureActionCreator.MERGE_STATE;
  }

  _delegateAction(payload) {
    const actionHandlers = {
      [SculptureActionCreator.LOGIN]: this._actionLogin.bind(this),
      [SculptureActionCreator.START_GAME]: this._actionStartGame.bind(this),
      [SculptureActionCreator.START_NEXT_GAME]: this._actionStartNextGame.bind(this),
      [SculptureActionCreator.RESET_GAME]: this._actionResetGame.bind(this),
      [SculptureActionCreator.RESTART]: this._actionRestart.bind(this),
      [SculptureActionCreator.RESTARTED]: this._actionRestarted.bind(this),
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
      [SculptureActionCreator.RESTORE_STATUS]: this._actionRestoreStatus.bind(this),
      [SculptureActionCreator.ANIMATION_FRAME]: this._actionAnimationFrame.bind(this),
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [DisksActionCreator.DISK_UPDATE]: this._actionDiskUpdate.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) actionHandler(payload);
  }

  _actionLogin({sculptureId}) {
    this._me = sculptureId;
  }

  _actionStartGame(payload) {
    const { game } = payload;
    if (!game && !this._getCurrentGame()) {
      throw new Error(`START_GAME: No startable game`);
    }
    this._startGame(game);
  }

  /**
   * Starts the next game in the game sequence
   */
  _actionStartNextGame() {
    this._startGame(this._getNextGame());
  }

  _actionResetGame() {
    if (this.currentGameLogic) {
      this._resetGamePanels();
      this.currentGameLogic.reset();
    }
    this.setMaster(false);
  }

  _actionRestart() {
    if (this.config.SYNCHRONIZED_RESTART) {
      if (chrome && chrome.runtime) {
        chrome.runtime.reload();
      }
      else {
        window.location.reload();
      }
    }
    else {
      window.location.reload();
    }
  }

  _actionRestarted() {
    this.data.set('status', SculptureStore.STATUS_INIT);
  }

  _actionMergeState(payload) {
    const metadata = payload.metadata;

    const mergeFunctions = {
      status: this._mergeStatus.bind(this),
      currentGame: this._mergeCurrentGame.bind(this),
      lights: this._mergeLights.bind(this),
    };

    for (let propName of Object.keys(payload)) {
      const mergeFunction = mergeFunctions[propName];
      if (mergeFunction) {
        mergeFunction(payload[propName], metadata.props[propName] || {});
      }
    }
  }

  _actionRestoreStatus() {
    this.restoreStatus();
  }

  _actionAnimationFrame(payload) {
    const {callback} = payload;

    callback();
  }

  _actionPanelPressed(payload) {
    if (this.iAmAlone()) return;
    if (!this.isReady) return;

    const lightArray = this.data.get('lights');
    const {stripId, panelId, pressed} = payload;

    // This is a reasonable default behaviour that can be overridden in
    // a game logic class if necessary.
    // FIXME: This is mostly for testing, and could/should be removed later
//    lightArray.setActive(stripId, panelId, pressed);
//    if (pressed) {
//      lightArray.setColor(stripId, panelId, this.locationColor);
//    }
//    else {
//      lightArray.setToDefaultColor(stripId, panelId);
//    }
  }

  /**
   * This is only called by local disk position changes and represents the actually 
   * displayed disk state.
   */
  _actionDiskUpdate(payload) {
    const {diskId, position} = payload;
    this.localData.diskPositions[diskId] = position;
    this.emit(SculptureStore.EVENT_LOCAL_CHANGE);
  }

  _mergeStatus(status, props) {
    if (status === SculptureStore.STATUS_INIT) {
      // If one sculpture enters the INIT status, all sculptures must enter this status
      if (!this.isInit && !this.isNone) {
        setTimeout(() => this.sculptureActionCreator.sendRestart(), 0);
      }
    }
    else if (!this.isMaster()) {
      this.data.set('status', status, props);
    }
  }

  _mergeCurrentGame(currentGame, props) {
    const GameLogicClass = getGameLogicClass(currentGame);

    this._setCurrentGame(currentGame, props.currentGame);

    if (!(this.currentGameLogic instanceof GameLogicClass)) {
      this.setMaster(false);
      this.currentGameLogic = new GameLogicClass(this, this.config);
    }
  }

  _mergeLights(changedLights, props) {
    const lights = this.data.get('lights');
    for (let stripId of Object.keys(changedLights)) {
      const changedPanels = changedLights[stripId].panels;
      for (let panelId of Object.keys(changedPanels)) {
        const changedPanel = changedPanels[panelId];
        const panelProps = props[stripId].panels[panelId];
        if (changedPanel.hasOwnProperty("intensity")) {
          lights.setIntensity(stripId, panelId, changedPanel.intensity, panelProps.intensity);
        }
        if (changedPanel.hasOwnProperty("color")) {
          lights.setColor(stripId, panelId, changedPanel.color, panelProps.color);
        }
        if (changedPanel.hasOwnProperty("active")) {
          lights.setActive(stripId, panelId, changedPanel.active, panelProps.active);
        }
      }
    }
  }

  _getCurrentGame() {
    return this.data.get("currentGame");
  }

  _setCurrentGame(newGame, newProps) {
    return this.data.set("currentGame", newGame, newProps);
  }

  /**
   * Returns the name of the next game.
   * Note: This works also when the current game is null, since indexOf() returns -1 when not found.
   */
  _getNextGame() {
    let index = this.config.GAMES_SEQUENCE.indexOf(this._getCurrentGame());
    index = (index + 1) % this.config.GAMES_SEQUENCE.length;
    return this.config.GAMES_SEQUENCE[index];
  }

  /**
   * Getter for the local disk position state. Use this to get the actual position to display
   */
  getDiskPosition(diskId) {
    return this.localData.diskPositions[diskId];
  }
}
