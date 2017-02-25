import events from 'events';

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
import Disk from './utils/disk';

export default class SculptureStore extends events.EventEmitter {
  static EVENT_CHANGE = "change";

  static STATUS_READY = "ready";
  static STATUS_LOCKED = "locked";
  static STATUS_SUCCESS = "success";
  static STATUS_FAILURE = "failure";

  static HANDSHAKE_OFF = "off";
  static HANDSHAKE_ACTIVE = "active";
  static HANDSHAKE_PRESENT = "present";

  constructor(dispatcher, config) {
    super();

    this.dispatcher = dispatcher;
    this.config = config;

    this._me = this.config.me;
    this.panelAnimation = null;
    this.data = new TrackedData({
      status: SculptureStore.STATUS_READY,
      currentGame: null,
      handshakes: new TrackedData({ // off, active, present
        sculpture1: SculptureStore.HANDSHAKE_OFF,
        sculpture2: SculptureStore.HANDSHAKE_OFF,
        sculpture3: SculptureStore.HANDSHAKE_OFF,
        anyware: SculptureStore.HANDSHAKE_OFF, // For off-line single player
      }),
      lights: new LightArray({
        // stripId : number of panels
        [this.config.LIGHTS.STRIP_A]: 10,
        [this.config.LIGHTS.STRIP_B]: 10,
        [this.config.LIGHTS.STRIP_C]: 10,
        [this.config.LIGHTS.RGB_STRIPS]: 2,
        [this.config.LIGHTS.HANDSHAKE_STRIP]: 4,
        [this.config.LIGHTS.ART_LIGHTS_STRIP]: 3
      }),
      disks: new TrackedData({
        disk0: new Disk(),
        disk1: new Disk(),
        disk2: new Disk()
      }),
      handshake: new TrackedData(HandshakeGameLogic.trackedProperties),
      mole: new TrackedData(MoleGameLogic.trackedProperties),
      disk: new TrackedData(DiskGameLogic.trackedProperties),
      simon: new TrackedData(SimonGameLogic.trackedProperties)
    });

    this._reassertChanges = false;
    this._master = false;
    this.currentGameLogic = null;
    this.dispatchToken = dispatcher.register(this._handleActionPayload.bind(this));
    this.sculptureActionCreator = new SculptureActionCreator(this.dispatcher);
  }

  /**
   * @returns {Boolean} Returns whether the handshake game is currently being played
   */
  get isPlayingHandshakeGame() {
    return this.currentGameLogic instanceof HandshakeGameLogic;
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

  /**
   * @returns {Boolean} Returns true if no game is currently being played
   */
  get isPlayingNoGame() {
    return !this.currentGame;
  }

  get isMaster() {
    return this._master;
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
  get isPanelAnimationRunning() {
    const panelAnimation = this.panelAnimation;
    return panelAnimation ? panelAnimation.isRunning : false;
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
   * Returns whether the sculpture's current status is ready
   */
  get isReady() {
    return this.data.get('status') === SculptureStore.STATUS_READY;
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
   * Plays the given animation
   */
  playAnimation(animation) {
    this.panelAnimation = animation;
    animation.play(this.dispatcher);
  }

  /**
   * Starts the next game in the game sequence
   */
  moveToNextGame() {
    this._startGame(this._getNextGame());
  }

  _startGame(game) {
    const gameLogicClasses = {
      [GAMES.HANDSHAKE]: HandshakeGameLogic,
      [GAMES.MOLE]: MoleGameLogic,
      [GAMES.DISK]: DiskGameLogic,
      [GAMES.SIMON]: SimonGameLogic
    };
    const GameLogic = gameLogicClasses[game];
    if (!GameLogic) {
      throw new Error(`Unrecognized game: ${game}`);
    }

    // end any previous game
    if (this.currentGameLogic) {
      this.currentGameLogic.end();
      this._master = false;
    }
    this._resetGamePanels();

    this.data.set('currentGame', game);
    this._master = true;
    this.currentGameLogic = new GameLogic(this, this.config);
    this.currentGameLogic.start();
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
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
      [SculptureActionCreator.RESTORE_STATUS]: this._actionRestoreStatus.bind(this),
      [SculptureActionCreator.ANIMATION_FRAME]: this._actionAnimationFrame.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this),
      [SculptureActionCreator.HANDSHAKE_ACTION]: this._actionHandshakeAction.bind(this),
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [DisksActionCreator.DISK_UPDATE]: this._actionDiskUpdate.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionLogin({sculptureId}) {
    this._me = sculptureId;
  }

  _actionStartGame(payload) {
    const game = payload.game;
    if (!game) {
      throw new Error(`Unrecognized game: ${payload.game}`);
    }

    this._startGame(game);
  }

  _actionStartNextGame() {
    this.moveToNextGame();
  }

  _actionMergeState(payload) {
    const metadata = payload.metadata;

    const mergeFunctions = {
      status: this._mergeStatus.bind(this),
      currentGame: this._mergeCurrentGame.bind(this),
      handshakes: this._mergeHandshakes.bind(this),
      lights: this._mergeLights.bind(this),
//      disks: this._mergeDisks.bind(this),
//      disk: this._mergeDiskGame.bind(this),
//      simon: this._mergeSimonGame.bind(this),
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

  _actionFinishStatusAnimation() {
    this.restoreStatus();
  }

  _actionHandshakeAction(payload) {
    this.data.get('handshakes').set(payload.sculptureId, payload.state);
  }

  _actionPanelPressed(payload) {
    if (!this.isReady) return;

    const lightArray = this.data.get('lights');
    const {stripId, panelId, pressed} = payload;

    // This is a reasonable default behaviour that can be overridden in
    // a game logic class if necessary.
    // FIXME: This is mostly for testing, and could/should be removed later
    lightArray.setActive(stripId, panelId, pressed);
//    if (pressed) {
//      lightArray.setColor(stripId, panelId, this.locationColor);
//    }
//    else {
//      lightArray.setToDefaultColor(stripId, panelId);
//    }
  }

  _actionDiskUpdate(payload) {
    let {diskId, position} = payload;

    if (typeof diskId === 'undefined') return;

    if (typeof position !== 'undefined') {
      this.data.get('disks').get(diskId).rotateTo(position);
    }
  }

  _mergeStatus(newStatus) {
    this.data.set('status', newStatus);
  }

  _mergeCurrentGame(currentGame, props) {
    const gameLogicClasses = {
      [GAMES.HANDSHAKE]: HandshakeGameLogic,
      [GAMES.MOLE]: MoleGameLogic,
      [GAMES.DISK]: DiskGameLogic,
      [GAMES.SIMON]: SimonGameLogic
    };
    const GameLogic = gameLogicClasses[currentGame];
    if (!GameLogic) {
      throw new Error(`Unrecognized game: ${currentGame}`);
    }

    this.data.set('currentGame', currentGame, props.currentGame);

    if (!(this.currentGameLogic instanceof GameLogic)) {
      this._master = false;
      this.currentGameLogic = new GameLogic(this, this.config);
    }
  }

  /**
   * Sculptures own their own handshakes[sculptureId] field, so we can
   * merge directly.
   */
  _mergeHandshakes(handshakes, props) {
    for (let sculptureId of Object.keys(handshakes)) {
      this.data.get('handshakes').set(sculptureId, handshakes[sculptureId], props[sculptureId]);
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

  _mergeDisks(disks) {
    const currDisks = this.data.get('disks');

    for (let diskId of Object.keys(disks)) {
      const disk = disks[diskId];
      const currDisk = currDisks.get(diskId);
      if (disk.hasOwnProperty('position')) {
        currDisk.rotateTo(disk.position);
      }
      if (disk.hasOwnProperty('user')) {
        currDisk.setUser(disk.user);
      }
      if (disk.hasOwnProperty('targetSpeed')) {
        currDisk.setTargetSpeed(disk.targetSpeed);
      }
    }
  }

  _mergeDiskGame(disk) {
    // FIXME: Implement
  }

  _mergeSimonGame(simon) {
    // FIXME: Implement
  }

  _getNextGame() {
    const currentGame = this.data.get("currentGame");
    let index = this.config.GAMES_SEQUENCE.indexOf(currentGame);
    index = (index + 1) % this.config.GAMES_SEQUENCE.length;

    return this.config.GAMES_SEQUENCE[index];
  }
}
