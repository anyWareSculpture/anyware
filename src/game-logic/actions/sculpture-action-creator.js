import BaseActionCreator from './base-action-creator';
import GAMES from '../constants/games';

export default class SculptureActionCreator extends BaseActionCreator {
  // Action types
  static LOGIN = "login";
  static MERGE_STATE = "merge-state";
  static START_GAME = "start-game";
  static START_NEXT_GAME = "start-next-game";
  static RESTORE_STATUS = "restore-status";
  static ANIMATION_FRAME = "animation-frame";
  static FINISH_STATUS_ANIMATION = "finish-status-animation";
  static HANDSHAKE_ACTIVATE = "handshake-activate";
  static HANDSHAKE_DEACTIVATE = "handshake-deactivate";

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

  sendStartGame(game) {
    this._dispatch(SculptureActionCreator.START_GAME, { game });
  }

  sendStartNextGame() {
    this._dispatch(SculptureActionCreator.START_NEXT_GAME);
  }

  sendRestoreStatus() {
    this._dispatch(SculptureActionCreator.RESTORE_STATUS);
  }

  sendAnimationFrame(callback) {
    this._dispatch(SculptureActionCreator.ANIMATION_FRAME, { callback });
  }

  sendFinishStatusAnimation() {
    this._dispatch(SculptureActionCreator.FINISH_STATUS_ANIMATION);
  }

  sendHandshakeActivate(sculptureId) {
    this._dispatch(SculptureActionCreator.HANDSHAKE_ACTIVATE, { sculptureId });
  }

  sendHandshakeDeactivate(sculptureId) {
    this._dispatch(SculptureActionCreator.HANDSHAKE_DEACTIVATE, { sculptureId });
  }
}

