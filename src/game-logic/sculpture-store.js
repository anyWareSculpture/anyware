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
import TrackedSet from './utils/tracked-set';
import LightArray from './utils/light-array';
import Disk from './utils/disk';

export default class SculptureStore extends events.EventEmitter {
  static EVENT_CHANGE = "change";

  static STATUS_READY = "ready";
  static STATUS_LOCKED = "locked";
  static STATUS_SUCCESS = "success";
  static STATUS_FAILURE = "failure";

  constructor(dispatcher, config) {
    super();

    this.dispatcher = dispatcher;
    this.config = config;

    this._username = this.config.username;
    this.data = new TrackedData({
      status: SculptureStore.STATUS_READY,
      panelAnimation: null,
      currentGame: null,
      handshakes: new TrackedSet(),
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
      // FIXME: Move perimeter and disk light strip status somewhere, e.g. disks:
      // [this.config.LIGHTS.PERIMETER_STRIP]: 6,
      // [this.config.LIGHTS.DISK_LIGHT_STRIP]: 3,
      handshake: new TrackedData(HandshakeGameLogic.trackedProperties),
      mole: new TrackedData(MoleGameLogic.trackedProperties),
      disk: new TrackedData(DiskGameLogic.trackedProperties),
      simon: new TrackedData(SimonGameLogic.trackedProperties)
    });

    this.currentGameLogic = null;
    this.dispatchToken = this._registerDispatcher(this.dispatcher);
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

  /**
   * @returns {String} Returns the current user's username
   */
  get username() {
    return this._username;
  }

  /**
   *
   */
  get userColor() {
    return this.config.getUserColor(this._username);
  }

  /**
   * @returns {Boolean} Returns whether a panel animation is running
   */
  get isPanelAnimationRunning() {
    const panelAnimation = this.data.get('panelAnimation');
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
    this.data.set('panelAnimation', animation);
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
    }
    this._resetGamePanels();

    this.data.set('currentGame', game);
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

  _publishChanges() {
    const changes = this.data.getChangedCurrentValues();

    if (Object.keys(changes).length) {
      this.emit(SculptureStore.EVENT_CHANGE, changes);
    }

    this.data.clearChanges();
  }

  _registerDispatcher(dispatcher) {
    return dispatcher.register(this._handleActionPayload.bind(this));
  }

  _handleActionPayload(payload) {
    if (this.isLocked && !this._actionCanRunWhenLocked(payload.actionType)) {
      return;
    }

    this._delegateAction(payload);

    if (this.currentGameLogic) this.currentGameLogic.handleActionPayload(payload);

    this._publishChanges();
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
      [SculptureActionCreator.HANDSHAKE_ACTIVATE]: this._actionHandshakeActivate.bind(this),
      [SculptureActionCreator.HANDSHAKE_DEACTIVATE]: this._actionHandshakeDeactivate.bind(this),
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [DisksActionCreator.DISK_UPDATE]: this._actionDiskUpdate.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionLogin({username}) {
    this._username = username;
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
    if (payload.metadata.from === this._username) {
      return;
    }

    const mergeFunctions = {
      status: this._mergeStatus.bind(this),
      lights: this._mergeLights.bind(this),
      disks: this._mergeDisks.bind(this),
      mole: this._mergeMole.bind(this)
    };

    for (let propName of Object.keys(payload)) {
      const mergeFunction = mergeFunctions[propName];
      if (mergeFunction) {
        mergeFunction(payload[propName]);
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

  _actionHandshakeActivate(payload) {
    this.data.get('handshakes').add(payload.user);
  }

  _actionHandshakeDeactivate(payload) {
    this.data.get('handshakes').delete(payload.user);
  }

  _actionPanelPressed(payload) {
    if (!this.isReady) return;

    const lightArray = this.data.get('lights');
    const {stripId, panelId, pressed} = payload;

    lightArray.activate(stripId, panelId, pressed);
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

  _mergeLights(lightChanges) {
    const lightArray = this.data.get('lights');

    for (let stripId of Object.keys(lightChanges)) {
      const panels = lightChanges[stripId].panels;
      for (let panelId of Object.keys(panels)) {
        const panelChanges = panels[panelId];
        if (panelChanges.hasOwnProperty("intensity")) {
          lightArray.setIntensity(stripId, panelId, panelChanges.intensity);
        }
        if (panelChanges.hasOwnProperty("active")) {
          // FIXME: Set color based on metadata
          lightArray.activate(stripId, panelId, panelChanges.active);
        }
      }
    }
  }

  _mergeDisks(diskChanges) {
    // FIXME:
    console.log(diskChanges);
  }

  _mergeMole(moleChanges) {
    for (let propName of Object.keys(moleChanges)) {
      this.data.get('mole').set(propName, moleChanges[propName]);
    }
  }

  _getNextGame() {
    const currentGame = this.data.get("currentGame");
    let index = this.config.GAMES_SEQUENCE.indexOf(currentGame);
    index = (index + 1) % this.config.GAMES_SEQUENCE.length;

    return this.config.GAMES_SEQUENCE[index];
  }
}
