import assert from 'assert';
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
    this.transitionTimeout = null;

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

  isComplete() {
    return this.data.get('state') === HandshakeGameLogic.STATE_ACTIVATING;
  }

  handleActionPayload(payload) {
    const actionHandlers = {
      [SculptureActionCreator.HANDSHAKE_ACTION]: this._actionHandshakeAction.bind(this),
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) actionHandler(payload);
  }

  /**
   * Handle local handshake. We can only transition from WAITING to ACTIVATING, not back.
   */
  _actionHandshakeAction(payload) {
    if (payload.state === SculptureStore.HANDSHAKE_ACTIVE && !this.isComplete()) {
      assert(!this.transitionTimeout);
      this.data.set('state', HandshakeGameLogic.STATE_ACTIVATING);
      this.transitionTimeout = setTimeout(() => {
        this.transitionTimeout = null;
        this.sculptureActionCreator.sendStartNextGame();
      }, this.gameConfig.TRANSITION_OUT_TIME);
    }
  }

  /**
   * Merge handshake state
   */
  _actionMergeState(payload) {
    if (!payload.handshake) return; // Only handle handshake state

    const handshakeData = this.data;
    const handshakeChanges = payload.handshake;
    const handshakeProps = payload.metadata.props.handshake;

    if (handshakeChanges.hasOwnProperty('state')) {
      // Resolve race condition based on timestamp
      if (this.transitionTimeout && handshakeData.hasNewerValue('state', handshakeChanges.state, handshakeProps.state)) {
        clearTimeout(this.transitionTimeout);
        this.transitionTimeout = null;
      }
      handshakeData.set('state', handshakeChanges.state, handshakeProps.state);
    }
  }
}
