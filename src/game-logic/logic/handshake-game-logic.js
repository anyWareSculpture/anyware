import assert from 'assert';
import SculptureStore from '../sculpture-store';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import TrackedData from '../utils/tracked-data';

export default class HandshakeGameLogic {
  static GLOBAL_ALONE = "alone";
  static GLOBAL_PRESENCE = "presence";

  static HANDSHAKE_OFF = "off";
  static HANDSHAKE_ACTIVATING = "activating";
  static HANDSHAKE_ACTIVE = "active";
  static HANDSHAKE_PRESENT = "present";

  // These are automatically added to the sculpture store
  static trackedProperties = {
    state: HandshakeGameLogic.GLOBAL_ALONE,
    handshakes: new TrackedData({
      sculpture1: HandshakeGameLogic.HANDSHAKE_OFF,
      sculpture2: HandshakeGameLogic.HANDSHAKE_OFF,
      sculpture3: HandshakeGameLogic.HANDSHAKE_OFF,
      anyware: HandshakeGameLogic.HANDSHAKE_OFF, // For off-line single player
    }),
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.handshakeConfig = config.HANDSHAKE;
    this.transitionTimeout = null;

    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);
  }

  reset() {
      this.data.set('state', HandshakeGameLogic.GLOBAL_ALONE);
      const handshakes = this.data.get('handshakes');
      Array.from(handshakes).forEach((sculptureId) => handshakes.set(sculptureId, HandshakeGameLogic.HANDSHAKE_OFF));
      if (this.transitionTimeout) {
          clearTimeout(this.transitionTimeout);
          this.transitionTimeout = null;
      }
  }

  get data() {
    return this.store.data.get('handshake');
  }

  _getHandshakeState(sculptureId) {
    return this.data.get('handshakes').get(sculptureId);
  }

  getMyHandshakeState() {
    return this._getHandshakeState(this.store.me);
  }

  _isGlobalAloneMode() {
    return this.data.get('state') === HandshakeGameLogic.GLOBAL_ALONE;
  }

  // Return true if all sculptures are off
  _noActiveSculptures() {
    const handshakes = this.data.get('handshakes');
    return Array.from(handshakes).every((sculptureId) => handshakes.get(sculptureId) === HandshakeGameLogic.HANDSHAKE_OFF);
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
   * Handle local handshake.
   */
  _actionHandshakeAction(payload) {
    const {sculptureId, state} = payload;
    let logicState = state;

    // On handshake
    if (state === HandshakeGameLogic.HANDSHAKE_ACTIVE) {
        this.store.restoreStatus();

      // If we were locally alone, set state to ACTIVATING. This allows us to
      // trigger sound only on the first handshake
      if (this.getMyHandshakeState() === HandshakeGameLogic.HANDSHAKE_OFF) {
        logicState = HandshakeGameLogic.HANDSHAKE_ACTIVATING;
      }

      // If we were globally alone, start game
      if (this._isGlobalAloneMode()) {
        this.data.set('state', HandshakeGameLogic.GLOBAL_PRESENCE);
        this.transitionTimeout = setTimeout(() => {
          this.transitionTimeout = null;
          this.sculptureActionCreator.sendStartGame();
        }, this.handshakeConfig.TRANSITION_OUT_TIME);
      }
      // If we are locally alone, resume local game
      else if (this.getMyHandshakeState() === HandshakeGameLogic.HANDSHAKE_OFF) {
        // FIXME:  (reactivate panels, reset sound volume, turn off pulse)
      }
    }

    // Persist handshakes
    this.data.get('handshakes').set(sculptureId, logicState);

    // On handshake timeout
    if (state === HandshakeGameLogic.HANDSHAKE_OFF) {
      // If we're now globally alone, reset the game after a delay
      if (this._noActiveSculptures()) {
        this.data.set('state', HandshakeGameLogic.GLOBAL_ALONE);
        if (this.store.isMaster()) {
          this.transitionTimeout = setTimeout(() => {
            this.transitionTimeout = null;
            this.sculptureActionCreator.sendResetGame();
          }, this.handshakeConfig.TRANSITION_OUT_TIME);
        }
      }
      else {
        // FIXME: Enter local alone mode; deactivate all inputs (except handshake), mute all sounds
      }
    }
  }

  /**
   * Merge handshake state
   */
  _actionMergeState(payload) {
    if (!payload.handshake) return; // Only handle handshake state

    // Merge state: Needs synchronization
    if (payload.handshake.hasOwnProperty('state')) {
      // Resolve race condition based on timestamp
      if (this.transitionTimeout && this.data.hasNewerValue('state', payload.handshake.state, payload.metadata.props.handshake.state)) {
        clearTimeout(this.transitionTimeout);
        this.transitionTimeout = null;
      }

      if (this.store.isMaster() &&
          this.data.get('state') === HandshakeGameLogic.GLOBAL_PRESENCE &&
          payload.handshake.state === HandshakeGameLogic.GLOBAL_ALONE) {
        this.transitionTimeout = setTimeout(() => {
          this.transitionTimeout = null;
          this.sculptureActionCreator.sendResetGame();
        }, this.handshakeConfig.TRANSITION_OUT_TIME);
      }

      this.data.set('state', payload.handshake.state, payload.metadata.props.handshake.state);
    }

    // Merge handshakes: Sculptures own their own handshakes[sculptureId] field, so we can merge directly.
    if (payload.handshake.hasOwnProperty('handshakes')) {
      const handshakesData = this.data.get('handshakes');
      const handshakesChanges = payload.handshake.handshakes;
      const handshakesProps = payload.metadata.props.handshake.handshakes;
      for (const sculptureId of Object.keys(handshakesChanges)) {
        handshakesData.set(sculptureId, handshakesChanges[sculptureId], handshakesProps[sculptureId]);
      }
    }
  }
}
