import SculptureStore from '../sculpture-store';
import SculptureActionCreator from '../actions/sculpture-action-creator';

export default class HandshakeGameLogic {
  static STATE_WAITING = "waiting";
  static STATE_ACTIVATING = "activating";

  // These are automatically added to the sculpture store
  static trackedProperties = {
    state: HandshakeGameLogic.STATE_WAITING,
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.HANDSHAKE_GAME;

    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);
  }

  get data() {
    return this.store.data.get('handshake');
  }

  start() {
    this.data.set('state', HandshakeGameLogic.STATE_WAITING);
  }

  end() {
    this.store.data.get('lights').deactivateAll();
  }

  get _complete() {
    this.data.get('state') === HandshakeGameLogic.STATE_ACTIVATING;
  }

  handleActionPayload(payload) {
    if (this._complete) return;

    const actionHandlers = {
      [SculptureActionCreator.HANDSHAKE_ACTION]: this._actionHandshakeAction.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) actionHandler(payload);
  }

  _actionHandshakeAction(payload) {
    if (payload.state === SculptureStore.HANDSHAKE_ACTIVE) {
      this.data.set('state', HandshakeGameLogic.STATE_ACTIVATING);
      setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), this.gameConfig.TRANSITION_OUT_TIME);
    }
  }
}
