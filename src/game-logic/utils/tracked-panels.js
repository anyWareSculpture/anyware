import TrackedData from './tracked-data';

/**
 * Tracks panel state.
 * Since we don't support removing tracked data, we need to introduce an OFF state
 * This is currently meant for the mole game, where we want to know if an "on" state 
 * is active or turned to location color (and thus ignored)
 * 
 * Note: Since we require a string key, we use the combined stripId and panelId
 * as a key.
 */

export default class TrackedPanels extends TrackedData {

  static STATE_ON = "on";
  static STATE_OFF = "off"; // default
  static STATE_IGNORED = "ignored";

  constructor() {
    super();
  }

  clear() {
    for (let key of this) {
      this.set(key, TrackedPanels.STATE_OFF);
    }
  }

  setPanelState(stripId, panelId, state, timestamp = null) {
    this.set(this._hash(stripId, panelId), state, timestamp);
  }

  setPanelStateByKey(key, state, timestamp = null) {
    this.set(key, state, timestamp);
  }

  getPanelState(stripId, panelId) {
    return this.get(this._hash(stripId, panelId)) || TrackedPanels.STATE_OFF;
  }

  get numPanels() {
    return Object.keys(this._data).length;
  }

  _hash(stripId, panelId) {
    return `${stripId},${panelId}`;
  }
}
