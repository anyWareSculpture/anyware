"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TrackedData = function () {
  /**
   * Keeps track of the last change made to any data that is stored
   * @constructor
   * @param {Object} [validProperties=null] - An object containing valid property names as keys and that property's default value as values. If not provided, no validation will occur on property names
   */

  function TrackedData() {
    var validProperties = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, TrackedData);

    this._data = Object.assign({}, validProperties || {});

    // {changedProperty: oldValue, ...}
    this._changes = {};

    this._validPropertiesNames = null;
    if (validProperties) {
      this._validPropertiesNames = new Set(Object.keys(validProperties));
    }
  }

  /**
   * Gets a copy of the value associated with the given name
   * @param {string} name - The name of the property to retrieve
   * @returns {*} a copy of the value of name
   */


  _createClass(TrackedData, [{
    key: "get",
    value: function get(name) {
      this._assertValidProperty(name);

      return this._data[name];
    }

    /**
     * Stores the given value and tracks its old value as changed
     * Even if the same value is stored twice, a change will still be registered
     * @param {string} name - The name of the property to set
     * @param {*} value - The value to store
     */

  }, {
    key: "set",
    value: function set(name, value) {
      this._assertValidProperty(name);

      if (value !== this._data[name]) {
        this._changes[name] = this._data[name];
      }

      this._data[name] = value;
    }

    /**
     * @returns {Boolean} Returns whether the given name is a valid name for this store. If no valid names were provided initially, this always returns true since then any name is valid
     * @param {String} name - The name of the property to check
     */

  }, {
    key: "has",
    value: function has(name) {
      return this._validPropertiesNames ? this._validPropertiesNames.has(name) : true;
    }

    /**
     * Iterates through the names of the properties that have changed
     */

  }, {
    key: "getChangedPropertyNames",
    value: regeneratorRuntime.mark(function getChangedPropertyNames() {
      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, propName;

      return regeneratorRuntime.wrap(function getChangedPropertyNames$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.delegateYield(Object.keys(this._changes), "t0", 1);

            case 1:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context.prev = 4;
              _iterator = this._changedTrackedDataProperties()[Symbol.iterator]();

            case 6:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context.next = 13;
                break;
              }

              propName = _step.value;
              _context.next = 10;
              return propName;

            case 10:
              _iteratorNormalCompletion = true;
              _context.next = 6;
              break;

            case 13:
              _context.next = 19;
              break;

            case 15:
              _context.prev = 15;
              _context.t1 = _context["catch"](4);
              _didIteratorError = true;
              _iteratorError = _context.t1;

            case 19:
              _context.prev = 19;
              _context.prev = 20;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 22:
              _context.prev = 22;

              if (!_didIteratorError) {
                _context.next = 25;
                break;
              }

              throw _iteratorError;

            case 25:
              return _context.finish(22);

            case 26:
              return _context.finish(19);

            case 27:
            case "end":
              return _context.stop();
          }
        }
      }, getChangedPropertyNames, this, [[4, 15, 19, 27], [20,, 22, 26]]);
    })

    /**
     * Retrieves an object containing the name and old value
     * of each property that has been changed
     * @returns {Object} - Object where keys are the names of each changed property and values are the previous value of that property
     */

  }, {
    key: "getChangedOldValues",
    value: function getChangedOldValues() {
      var changed = Object.assign({}, this._changes);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._changedTrackedDataProperties()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var propName = _step2.value;

          if (!changed.hasOwnProperty(propName)) {
            changed[propName] = this.get(propName).getChangedOldValues();
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return changed;
    }

    /**
     * Retrieves an object containing the name and current values
     * of each property that has been changed
     * @returns {Object} - Object where keys are the names of each changed property and the values are the current value of that property
     */

  }, {
    key: "getChangedCurrentValues",
    value: function getChangedCurrentValues() {
      var changed = {};

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this._changedTrackedDataProperties()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var propName = _step3.value;

          changed[propName] = this.get(propName).getChangedCurrentValues();
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = Object.keys(this._changes)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _propName = _step4.value;

          changed[_propName] = this.get(_propName);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return changed;
    }

    /**
     * Clears out any recorded changes
     */

  }, {
    key: "clearChanges",
    value: function clearChanges() {
      this._changes = {};

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this._changedTrackedDataProperties()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var propName = _step5.value;

          this.get(propName).clearChanges();
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }

    /**
     * Iterates through all the data property names currently defined
     */

  }, {
    key: Symbol.iterator,
    value: regeneratorRuntime.mark(function value() {
      var _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, name;

      return regeneratorRuntime.wrap(function value$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _iteratorNormalCompletion6 = true;
              _didIteratorError6 = false;
              _iteratorError6 = undefined;
              _context2.prev = 3;
              _iterator6 = Object.keys(this._data)[Symbol.iterator]();

            case 5:
              if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                _context2.next = 12;
                break;
              }

              name = _step6.value;
              _context2.next = 9;
              return name;

            case 9:
              _iteratorNormalCompletion6 = true;
              _context2.next = 5;
              break;

            case 12:
              _context2.next = 18;
              break;

            case 14:
              _context2.prev = 14;
              _context2.t0 = _context2["catch"](3);
              _didIteratorError6 = true;
              _iteratorError6 = _context2.t0;

            case 18:
              _context2.prev = 18;
              _context2.prev = 19;

              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }

            case 21:
              _context2.prev = 21;

              if (!_didIteratorError6) {
                _context2.next = 24;
                break;
              }

              throw _iteratorError6;

            case 24:
              return _context2.finish(21);

            case 25:
              return _context2.finish(18);

            case 26:
            case "end":
              return _context2.stop();
          }
        }
      }, value, this, [[3, 14, 18, 26], [19,, 21, 25]]);
    })
  }, {
    key: "_changedTrackedDataProperties",
    value: regeneratorRuntime.mark(function _changedTrackedDataProperties() {
      var _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, propName, _value;

      return regeneratorRuntime.wrap(function _changedTrackedDataProperties$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _iteratorNormalCompletion7 = true;
              _didIteratorError7 = false;
              _iteratorError7 = undefined;
              _context3.prev = 3;
              _iterator7 = Object.keys(this._data)[Symbol.iterator]();

            case 5:
              if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                _context3.next = 15;
                break;
              }

              propName = _step7.value;
              _value = this.get(propName);

              if (!(_value instanceof TrackedData)) {
                _context3.next = 12;
                break;
              }

              if (_value.getChangedPropertyNames().next().done) {
                _context3.next = 12;
                break;
              }

              _context3.next = 12;
              return propName;

            case 12:
              _iteratorNormalCompletion7 = true;
              _context3.next = 5;
              break;

            case 15:
              _context3.next = 21;
              break;

            case 17:
              _context3.prev = 17;
              _context3.t0 = _context3["catch"](3);
              _didIteratorError7 = true;
              _iteratorError7 = _context3.t0;

            case 21:
              _context3.prev = 21;
              _context3.prev = 22;

              if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
              }

            case 24:
              _context3.prev = 24;

              if (!_didIteratorError7) {
                _context3.next = 27;
                break;
              }

              throw _iteratorError7;

            case 27:
              return _context3.finish(24);

            case 28:
              return _context3.finish(21);

            case 29:
            case "end":
              return _context3.stop();
          }
        }
      }, _changedTrackedDataProperties, this, [[3, 17, 21, 29], [22,, 24, 28]]);
    })
  }, {
    key: "_assertValidProperty",
    value: function _assertValidProperty(name) {
      if (!this.has(name)) {
        throw new Error("Cannot retrieve property '" + name + "'");
      }
    }
  }]);

  return TrackedData;
}();

exports.default = TrackedData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvdHJhY2tlZC1kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBcUIsVzs7Ozs7OztBQU1uQix5QkFBa0M7QUFBQSxRQUF0QixlQUFzQix5REFBTixJQUFNOztBQUFBOztBQUNoQyxTQUFLLEtBQUwsR0FBYSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLG1CQUFtQixFQUFyQyxDQUFiOzs7QUFHQSxTQUFLLFFBQUwsR0FBZ0IsRUFBaEI7O0FBRUEsU0FBSyxxQkFBTCxHQUE2QixJQUE3QjtBQUNBLFFBQUksZUFBSixFQUFxQjtBQUNuQixXQUFLLHFCQUFMLEdBQTZCLElBQUksR0FBSixDQUFRLE9BQU8sSUFBUCxDQUFZLGVBQVosQ0FBUixDQUE3QjtBQUNEO0FBQ0Y7Ozs7Ozs7Ozs7O3dCQU9HLEksRUFBTTtBQUNSLFdBQUssb0JBQUwsQ0FBMEIsSUFBMUI7O0FBRUEsYUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQVA7QUFDRDs7Ozs7Ozs7Ozs7d0JBUUcsSSxFQUFNLEssRUFBTztBQUNmLFdBQUssb0JBQUwsQ0FBMEIsSUFBMUI7O0FBRUEsVUFBSSxVQUFVLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZCxFQUFnQztBQUM5QixhQUFLLFFBQUwsQ0FBYyxJQUFkLElBQXNCLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBdEI7QUFDRDs7QUFFRCxXQUFLLEtBQUwsQ0FBVyxJQUFYLElBQW1CLEtBQW5CO0FBQ0Q7Ozs7Ozs7Ozt3QkFNRyxJLEVBQU07QUFDUixhQUFPLEtBQUsscUJBQUwsR0FBNkIsS0FBSyxxQkFBTCxDQUEyQixHQUEzQixDQUErQixJQUEvQixDQUE3QixHQUFvRSxJQUEzRTtBQUNEOzs7Ozs7Ozs7MEZBT1UsUTs7Ozs7OzRDQURGLE9BQU8sSUFBUCxDQUFZLEtBQUssUUFBakIsQzs7Ozs7OzswQkFDYyxLQUFLLDZCQUFMLEU7Ozs7Ozs7O0FBQVosc0I7O3FCQUNELFE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQ0FTWTtBQUNwQixVQUFNLFVBQVUsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixLQUFLLFFBQXZCLENBQWhCOztBQURvQjtBQUFBO0FBQUE7O0FBQUE7QUFHcEIsOEJBQXFCLEtBQUssNkJBQUwsRUFBckIsbUlBQTJEO0FBQUEsY0FBbEQsUUFBa0Q7O0FBQ3pELGNBQUksQ0FBQyxRQUFRLGNBQVIsQ0FBdUIsUUFBdkIsQ0FBTCxFQUF1QztBQUNyQyxvQkFBUSxRQUFSLElBQW9CLEtBQUssR0FBTCxDQUFTLFFBQVQsRUFBbUIsbUJBQW5CLEVBQXBCO0FBQ0Q7QUFDRjtBQVBtQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVNwQixhQUFPLE9BQVA7QUFDRDs7Ozs7Ozs7Ozs4Q0FPeUI7QUFDeEIsVUFBTSxVQUFVLEVBQWhCOztBQUR3QjtBQUFBO0FBQUE7O0FBQUE7QUFHeEIsOEJBQXFCLEtBQUssNkJBQUwsRUFBckIsbUlBQTJEO0FBQUEsY0FBbEQsUUFBa0Q7O0FBQ3pELGtCQUFRLFFBQVIsSUFBb0IsS0FBSyxHQUFMLENBQVMsUUFBVCxFQUFtQix1QkFBbkIsRUFBcEI7QUFDRDtBQUx1QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQU94Qiw4QkFBcUIsT0FBTyxJQUFQLENBQVksS0FBSyxRQUFqQixDQUFyQixtSUFBaUQ7QUFBQSxjQUF4QyxTQUF3Qzs7QUFDL0Msa0JBQVEsU0FBUixJQUFvQixLQUFLLEdBQUwsQ0FBUyxTQUFULENBQXBCO0FBQ0Q7QUFUdUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFXeEIsYUFBTyxPQUFQO0FBQ0Q7Ozs7Ozs7O21DQUtjO0FBQ2IsV0FBSyxRQUFMLEdBQWdCLEVBQWhCOztBQURhO0FBQUE7QUFBQTs7QUFBQTtBQUdiLDhCQUFxQixLQUFLLDZCQUFMLEVBQXJCLG1JQUEyRDtBQUFBLGNBQWxELFFBQWtEOztBQUN6RCxlQUFLLEdBQUwsQ0FBUyxRQUFULEVBQW1CLFlBQW5CO0FBQ0Q7QUFMWTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTWQ7Ozs7Ozs7U0FLQyxPQUFPLFE7OytGQUNFLEk7Ozs7Ozs7Ozs7MkJBQVEsT0FBTyxJQUFQLENBQVksS0FBSyxLQUFqQixDOzs7Ozs7OztBQUFSLGtCOztxQkFDRCxJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0ZBS0MsUSxFQUNELE07Ozs7Ozs7Ozs7MkJBRGEsT0FBTyxJQUFQLENBQVksS0FBSyxLQUFqQixDOzs7Ozs7OztBQUFaLHNCO0FBQ0Qsb0IsR0FBUSxLQUFLLEdBQUwsQ0FBUyxRQUFULEM7O29CQUNWLGtCQUFpQixXOzs7OztrQkFDZCxPQUFNLHVCQUFOLEdBQWdDLElBQWhDLEdBQXVDLEk7Ozs7OztxQkFDcEMsUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUNBTU8sSSxFQUFNO0FBQ3pCLFVBQUksQ0FBQyxLQUFLLEdBQUwsQ0FBUyxJQUFULENBQUwsRUFBcUI7QUFDbkIsY0FBTSxJQUFJLEtBQUosQ0FBVSwrQkFBK0IsSUFBL0IsR0FBc0MsR0FBaEQsQ0FBTjtBQUNEO0FBQ0Y7Ozs7OztrQkF0SWtCLFciLCJmaWxlIjoiZ2FtZS1sb2dpYy91dGlscy90cmFja2VkLWRhdGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFja2VkRGF0YSB7XG4gIC8qKlxuICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbGFzdCBjaGFuZ2UgbWFkZSB0byBhbnkgZGF0YSB0aGF0IGlzIHN0b3JlZFxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtPYmplY3R9IFt2YWxpZFByb3BlcnRpZXM9bnVsbF0gLSBBbiBvYmplY3QgY29udGFpbmluZyB2YWxpZCBwcm9wZXJ0eSBuYW1lcyBhcyBrZXlzIGFuZCB0aGF0IHByb3BlcnR5J3MgZGVmYXVsdCB2YWx1ZSBhcyB2YWx1ZXMuIElmIG5vdCBwcm92aWRlZCwgbm8gdmFsaWRhdGlvbiB3aWxsIG9jY3VyIG9uIHByb3BlcnR5IG5hbWVzXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih2YWxpZFByb3BlcnRpZXM9bnVsbCkge1xuICAgIHRoaXMuX2RhdGEgPSBPYmplY3QuYXNzaWduKHt9LCB2YWxpZFByb3BlcnRpZXMgfHwge30pO1xuXG4gICAgLy8ge2NoYW5nZWRQcm9wZXJ0eTogb2xkVmFsdWUsIC4uLn1cbiAgICB0aGlzLl9jaGFuZ2VzID0ge307XG5cbiAgICB0aGlzLl92YWxpZFByb3BlcnRpZXNOYW1lcyA9IG51bGw7XG4gICAgaWYgKHZhbGlkUHJvcGVydGllcykge1xuICAgICAgdGhpcy5fdmFsaWRQcm9wZXJ0aWVzTmFtZXMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKHZhbGlkUHJvcGVydGllcykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgY29weSBvZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHJldHJpZXZlXG4gICAqIEByZXR1cm5zIHsqfSBhIGNvcHkgb2YgdGhlIHZhbHVlIG9mIG5hbWVcbiAgICovXG4gIGdldChuYW1lKSB7XG4gICAgdGhpcy5fYXNzZXJ0VmFsaWRQcm9wZXJ0eShuYW1lKTtcblxuICAgIHJldHVybiB0aGlzLl9kYXRhW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgZ2l2ZW4gdmFsdWUgYW5kIHRyYWNrcyBpdHMgb2xkIHZhbHVlIGFzIGNoYW5nZWRcbiAgICogRXZlbiBpZiB0aGUgc2FtZSB2YWx1ZSBpcyBzdG9yZWQgdHdpY2UsIGEgY2hhbmdlIHdpbGwgc3RpbGwgYmUgcmVnaXN0ZXJlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBzZXRcbiAgICogQHBhcmFtIHsqfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzdG9yZVxuICAgKi9cbiAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5fYXNzZXJ0VmFsaWRQcm9wZXJ0eShuYW1lKTtcblxuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fZGF0YVtuYW1lXSkge1xuICAgICAgdGhpcy5fY2hhbmdlc1tuYW1lXSA9IHRoaXMuX2RhdGFbbmFtZV07XG4gICAgfVxuXG4gICAgdGhpcy5fZGF0YVtuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG5hbWUgaXMgYSB2YWxpZCBuYW1lIGZvciB0aGlzIHN0b3JlLiBJZiBubyB2YWxpZCBuYW1lcyB3ZXJlIHByb3ZpZGVkIGluaXRpYWxseSwgdGhpcyBhbHdheXMgcmV0dXJucyB0cnVlIHNpbmNlIHRoZW4gYW55IG5hbWUgaXMgdmFsaWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gY2hlY2tcbiAgICovXG4gIGhhcyhuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkUHJvcGVydGllc05hbWVzID8gdGhpcy5fdmFsaWRQcm9wZXJ0aWVzTmFtZXMuaGFzKG5hbWUpIDogdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBuYW1lcyBvZiB0aGUgcHJvcGVydGllcyB0aGF0IGhhdmUgY2hhbmdlZFxuICAgKi9cbiAgKmdldENoYW5nZWRQcm9wZXJ0eU5hbWVzKCkge1xuICAgIHlpZWxkKiBPYmplY3Qua2V5cyh0aGlzLl9jaGFuZ2VzKTtcbiAgICBmb3IgKGxldCBwcm9wTmFtZSBvZiB0aGlzLl9jaGFuZ2VkVHJhY2tlZERhdGFQcm9wZXJ0aWVzKCkpIHtcbiAgICAgIHlpZWxkIHByb3BOYW1lO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG5hbWUgYW5kIG9sZCB2YWx1ZVxuICAgKiBvZiBlYWNoIHByb3BlcnR5IHRoYXQgaGFzIGJlZW4gY2hhbmdlZFxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIE9iamVjdCB3aGVyZSBrZXlzIGFyZSB0aGUgbmFtZXMgb2YgZWFjaCBjaGFuZ2VkIHByb3BlcnR5IGFuZCB2YWx1ZXMgYXJlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGF0IHByb3BlcnR5XG4gICAqL1xuICBnZXRDaGFuZ2VkT2xkVmFsdWVzKCkge1xuICAgIGNvbnN0IGNoYW5nZWQgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9jaGFuZ2VzKTtcblxuICAgIGZvciAobGV0IHByb3BOYW1lIG9mIHRoaXMuX2NoYW5nZWRUcmFja2VkRGF0YVByb3BlcnRpZXMoKSkge1xuICAgICAgaWYgKCFjaGFuZ2VkLmhhc093blByb3BlcnR5KHByb3BOYW1lKSkge1xuICAgICAgICBjaGFuZ2VkW3Byb3BOYW1lXSA9IHRoaXMuZ2V0KHByb3BOYW1lKS5nZXRDaGFuZ2VkT2xkVmFsdWVzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBuYW1lIGFuZCBjdXJyZW50IHZhbHVlc1xuICAgKiBvZiBlYWNoIHByb3BlcnR5IHRoYXQgaGFzIGJlZW4gY2hhbmdlZFxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIE9iamVjdCB3aGVyZSBrZXlzIGFyZSB0aGUgbmFtZXMgb2YgZWFjaCBjaGFuZ2VkIHByb3BlcnR5IGFuZCB0aGUgdmFsdWVzIGFyZSB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGF0IHByb3BlcnR5XG4gICAqL1xuICBnZXRDaGFuZ2VkQ3VycmVudFZhbHVlcygpIHtcbiAgICBjb25zdCBjaGFuZ2VkID0ge307XG5cbiAgICBmb3IgKGxldCBwcm9wTmFtZSBvZiB0aGlzLl9jaGFuZ2VkVHJhY2tlZERhdGFQcm9wZXJ0aWVzKCkpIHtcbiAgICAgIGNoYW5nZWRbcHJvcE5hbWVdID0gdGhpcy5nZXQocHJvcE5hbWUpLmdldENoYW5nZWRDdXJyZW50VmFsdWVzKCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgcHJvcE5hbWUgb2YgT2JqZWN0LmtleXModGhpcy5fY2hhbmdlcykpIHtcbiAgICAgIGNoYW5nZWRbcHJvcE5hbWVdID0gdGhpcy5nZXQocHJvcE5hbWUpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBvdXQgYW55IHJlY29yZGVkIGNoYW5nZXNcbiAgICovXG4gIGNsZWFyQ2hhbmdlcygpIHtcbiAgICB0aGlzLl9jaGFuZ2VzID0ge307XG5cbiAgICBmb3IgKGxldCBwcm9wTmFtZSBvZiB0aGlzLl9jaGFuZ2VkVHJhY2tlZERhdGFQcm9wZXJ0aWVzKCkpIHtcbiAgICAgIHRoaXMuZ2V0KHByb3BOYW1lKS5jbGVhckNoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZXMgdGhyb3VnaCBhbGwgdGhlIGRhdGEgcHJvcGVydHkgbmFtZXMgY3VycmVudGx5IGRlZmluZWRcbiAgICovXG4gICpbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICBmb3IgKGxldCBuYW1lIG9mIE9iamVjdC5rZXlzKHRoaXMuX2RhdGEpKSB7XG4gICAgICB5aWVsZCBuYW1lO1xuICAgIH1cbiAgfVxuXG4gICpfY2hhbmdlZFRyYWNrZWREYXRhUHJvcGVydGllcygpIHtcbiAgICBmb3IgKGxldCBwcm9wTmFtZSBvZiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmdldChwcm9wTmFtZSk7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUcmFja2VkRGF0YSkge1xuICAgICAgICBpZiAoIXZhbHVlLmdldENoYW5nZWRQcm9wZXJ0eU5hbWVzKCkubmV4dCgpLmRvbmUpIHtcbiAgICAgICAgICB5aWVsZCBwcm9wTmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hc3NlcnRWYWxpZFByb3BlcnR5KG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuaGFzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmV0cmlldmUgcHJvcGVydHkgJ1wiICsgbmFtZSArIFwiJ1wiKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
