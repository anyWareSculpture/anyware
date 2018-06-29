import BaseActionCreator from './base-action-creator';

export default class SculptureActionCreator extends BaseActionCreator {
  // Action types
  static LOGIN = "login";
  static MERGE_STATE = "merge-state";
  static START_GAME = "start-game";
  static START_NEXT_GAME = "start-next-game";
  static RESTARTED = "restarted";
  static RESTART = "restart";
  static RESET_GAME = "reset-game";
  static RESTORE_STATUS = "restore-status";
  static ANIMATION_FRAME = "animation-frame";
  static HANDSHAKE_ACTION = "handshake-action";

  sendLogin(sculptureId) {
    this._dispatch(SculptureActionCreator.LOGIN, { sculptureId });
  }

  /**
   * Sends an action asking the sculpture to merge some state
   * @param {Object} state - The state update to merge
   */
  sendMergeState(state) {
    this._dispatch(SculptureActionCreator.MERGE_STATE, state);
  }

  /**
   * Sends an action asking the sculpture to start a game
   * @param {String} game - Id of the game to start. If omitted will start the current game
   */
  sendStartGame(game) {
    this._dispatch(SculptureActionCreator.START_GAME, { game });
  }

  sendStartNextGame() {
    this._dispatch(SculptureActionCreator.START_NEXT_GAME);
  }

  /**
   * Sends an action asking sculptures to restart to the initial state (to synchronize)
   */
  sendRestart() {
    this._dispatch(SculptureActionCreator.RESTART);
  }

  /**
   * The local sculpture just restarted. This should move us to the INIT status
   */
  sendRestarted() {
    this._dispatch(SculptureActionCreator.RESTARTED);
  }

  /**
   * Sends an action asking the sculpture to reset the current game
   */
  sendResetGame() {
    this._dispatch(SculptureActionCreator.RESET_GAME);
  }

  sendRestoreStatus() {
    this._dispatch(SculptureActionCreator.RESTORE_STATUS);
  }

  sendAnimationFrame(callback) {
    this._dispatch(SculptureActionCreator.ANIMATION_FRAME, { callback });
  }

  sendHandshakeAction(sculptureId, state) {
    this._dispatch(SculptureActionCreator.HANDSHAKE_ACTION, { sculptureId, state });
  }

}

