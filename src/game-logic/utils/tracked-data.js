export default class TrackedData {
  /**
   * Keeps track of the last change made to any data that is stored
   * @constructor
   * @param {Object} [validProperties=null] - An object containing valid property names as keys and that property's default value as values. If not provided, no validation will occur on property names
   */
  constructor(validProperties = null) {
    this._data = {
      ...validProperties
    };

    // Per-field timestamps. Note: Only for POJO fields
    this._timestamps = {};

    // {changedProperty: oldValue, ...}
    this._changes = {};

    this._validPropertiesNames = validProperties ? new Set(Object.keys(validProperties)) : null;
  }

  /**
   * Gets a copy of the value associated with the given name
   * @param {string} name - The name of the property to retrieve
   * @returns {*} a copy of the value of name
   */
  get(name) {
    this._assertValidProperty(name);

    return this._data[name];
  }

  /**
   * Stores the given value and tracks its old value as changed
   * 
   * If the given timestamp is older or equal to the currently set timestamp,
   * the new value will be ignored.
   * 
   * @param {string} name - The name of the property to set
   * @param {*} value - The value to store
   * @param {Number} timestamp - The timestamp to use (defaults to null, meaning Date.now())
   */
  set(name, value, timestamp = null) {
    this._assertValidProperty(name);

    if (value === this._data[name] || timestamp && timestamp <= this._timestamps[name]) return;

    this._changes[name] = this._data[name];
    this._data[name] = value;
    if (!timestamp) timestamp = Date.now();
    this._timestamps[name] = timestamp;
  }

  /**
   * @returns {Boolean} Returns whether the given name is a valid name for this store. If no valid names were provided initially, this always returns true since then any name is valid
   * @param {String} name - The name of the property to check
   */
  has(name) {
    return this._validPropertiesNames ? this._validPropertiesNames.has(name) : true;
  }

  /**
   * @returns {Boolean} Returns true if there is at least one changed property
   */
  hasChanges() {
    const changedNames = this.getChangedPropertyNames();
    return !changedNames.next().done;
  }

  /**
   * Iterates through the names of the properties that have changed
   */
  *getChangedPropertyNames() {
    yield* Object.keys(this._changes);
    yield* this._changedTrackedDataProperties();
  }

  /**
   * Retrieves an object containing the name and old value
   * of each property that has been changed
   * @returns {Object} - Object where keys are the names of each changed property and values are the previous value of that property
   */
  getChangedOldValues() {
    const changed = {
      ...this._changes
    };

    for (let propName of this._changedTrackedDataProperties()) {
      if (!changed.hasOwnProperty(propName)) {
        changed[propName] = this.get(propName).getChangedOldValues();
      }
    }

    return changed;
  }

  /**
   * Retrieves an object containing the name and current values
   * of each property that has been changed
   * @returns {changes:, timestamps:} - changes is an object where keys are the names of each changed property and the values are the current value of that property, timestamp has the same keys, but with the timestamp of the stored value
   */
  getChangedCurrentValues() {
    const changes = {};
    const timestamps = {};

    for (let propName of this._changedTrackedDataProperties()) {
      const datachanged = this.get(propName).getChangedCurrentValues();
      changes[propName] = datachanged.changes;
      timestamps[propName] = datachanged.timestamps;
    }

    for (let propName of Object.keys(this._changes)) {
      changes[propName] = this.get(propName);
      timestamps[propName] = this._timestamps[propName];
    }

    return {changes, timestamps};
  }

  /**
   * Clears out any recorded changes
   */
  clearChanges() {
    this._changes = {};

    for (let propName of this._changedTrackedDataProperties()) {
      this.get(propName).clearChanges();
    }
  }

  /**
   * Iterates through all the data property names currently defined
   */
  *[Symbol.iterator]() {
    for (let name of Object.keys(this._data)) {
      yield name;
    }
  }

  pretty() {
    const obj = {};
    for (let key of this) {
      const value = this.get(key);
      if (value instanceof TrackedData) {
        obj[key] = value.pretty();
      }
      else {
        obj[key] = value;
      }
    }
    return obj;
  }

  *_changedTrackedDataProperties() {
    for (let propName of Object.keys(this._data)) {
      const value = this.get(propName);
      if (value instanceof TrackedData) {
        if (!value.getChangedPropertyNames().next().done) {
          yield propName;
        }
      }
    }
  }

  _assertValidProperty(name) {
    if (!this.has(name)) {
      throw new Error("Cannot retrieve property '" + name + "'");
    }
  }
}
