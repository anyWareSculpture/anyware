"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _trackedData = require("./tracked-data");

var _trackedData2 = _interopRequireDefault(_trackedData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Tracks panel state.
 * Since we don't support removing tracked data, we need to introduce an OFF state
 * This is currently meant for the mole game, where we want to know if an "on" state 
 * is active or turned to location color (and thus ignored)
 * 
 * Note: Since we require a string key, we use the combined stripId and panelId
 * as a key.
 */

var TrackedPanels = function (_TrackedData) {
  _inherits(TrackedPanels, _TrackedData);

  function TrackedPanels() {
    _classCallCheck(this, TrackedPanels);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TrackedPanels).call(this));
  } // default


  _createClass(TrackedPanels, [{
    key: "setPanelState",
    value: function setPanelState(stripId, panelId, state) {
      this.set(this._hash(stripId, panelId), state);
    }
  }, {
    key: "getPanelState",
    value: function getPanelState(stripId, panelId) {
      return this.get(this._hash(stripId, panelId)) || _trackedData2.default.STATE_OFF;
    }
  }, {
    key: "_hash",
    value: function _hash(stripId, panelId) {
      return stripId + "," + panelId;
    }
  }, {
    key: "numPanels",
    get: function get() {
      return Object.keys(this._data).length;
    }
  }]);

  return TrackedPanels;
}(_trackedData2.default);

TrackedPanels.STATE_ON = "on";
TrackedPanels.STATE_OFF = "off";
TrackedPanels.STATE_IGNORED = "ignored";
exports.default = TrackedPanels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvdHJhY2tlZC1wYW5lbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQVdxQixhOzs7QUFNbkIsMkJBQWM7QUFBQTs7QUFBQTtBQUViLEc7Ozs7O2tDQUVhLE8sRUFBUyxPLEVBQVMsSyxFQUFPO0FBQ3JDLFdBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxDQUFXLE9BQVgsRUFBb0IsT0FBcEIsQ0FBVCxFQUF1QyxLQUF2QztBQUNEOzs7a0NBRWEsTyxFQUFTLE8sRUFBUztBQUM5QixhQUFPLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxDQUFXLE9BQVgsRUFBb0IsT0FBcEIsQ0FBVCxLQUEwQyxzQkFBWSxTQUE3RDtBQUNEOzs7MEJBTUssTyxFQUFTLE8sRUFBUztBQUN0QixhQUFVLE9BQVYsU0FBcUIsT0FBckI7QUFDRDs7O3dCQU5lO0FBQ2QsYUFBTyxPQUFPLElBQVAsQ0FBWSxLQUFLLEtBQWpCLEVBQXdCLE1BQS9CO0FBQ0Q7Ozs7OztBQXBCa0IsYSxDQUVaLFEsR0FBVyxJO0FBRkMsYSxDQUdaLFMsR0FBWSxLO0FBSEEsYSxDQUlaLGEsR0FBZ0IsUztrQkFKSixhIiwiZmlsZSI6ImdhbWUtbG9naWMvdXRpbHMvdHJhY2tlZC1wYW5lbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVHJhY2tlZERhdGEgZnJvbSAnLi90cmFja2VkLWRhdGEnO1xuXG4vKipcbiAqIFRyYWNrcyBwYW5lbCBzdGF0ZS5cbiAqIFNpbmNlIHdlIGRvbid0IHN1cHBvcnQgcmVtb3ZpbmcgdHJhY2tlZCBkYXRhLCB3ZSBuZWVkIHRvIGludHJvZHVjZSBhbiBPRkYgc3RhdGVcbiAqIFRoaXMgaXMgY3VycmVudGx5IG1lYW50IGZvciB0aGUgbW9sZSBnYW1lLCB3aGVyZSB3ZSB3YW50IHRvIGtub3cgaWYgYW4gXCJvblwiIHN0YXRlIFxuICogaXMgYWN0aXZlIG9yIHR1cm5lZCB0byBsb2NhdGlvbiBjb2xvciAoYW5kIHRodXMgaWdub3JlZClcbiAqIFxuICogTm90ZTogU2luY2Ugd2UgcmVxdWlyZSBhIHN0cmluZyBrZXksIHdlIHVzZSB0aGUgY29tYmluZWQgc3RyaXBJZCBhbmQgcGFuZWxJZFxuICogYXMgYSBrZXkuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYWNrZWRQYW5lbHMgZXh0ZW5kcyBUcmFja2VkRGF0YSB7XG5cbiAgc3RhdGljIFNUQVRFX09OID0gXCJvblwiO1xuICBzdGF0aWMgU1RBVEVfT0ZGID0gXCJvZmZcIjsgLy8gZGVmYXVsdFxuICBzdGF0aWMgU1RBVEVfSUdOT1JFRCA9IFwiaWdub3JlZFwiO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBzZXRQYW5lbFN0YXRlKHN0cmlwSWQsIHBhbmVsSWQsIHN0YXRlKSB7XG4gICAgdGhpcy5zZXQodGhpcy5faGFzaChzdHJpcElkLCBwYW5lbElkKSwgc3RhdGUpO1xuICB9XG5cbiAgZ2V0UGFuZWxTdGF0ZShzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMuX2hhc2goc3RyaXBJZCwgcGFuZWxJZCkpIHx8IFRyYWNrZWREYXRhLlNUQVRFX09GRjtcbiAgfVxuXG4gIGdldCBudW1QYW5lbHMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2RhdGEpLmxlbmd0aDtcbiAgfVxuXG4gIF9oYXNoKHN0cmlwSWQsIHBhbmVsSWQpIHtcbiAgICByZXR1cm4gYCR7c3RyaXBJZH0sJHtwYW5lbElkfWA7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
