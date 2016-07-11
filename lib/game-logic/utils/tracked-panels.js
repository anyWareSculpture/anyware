"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TrackedData = require('./tracked-data');

/**
 * Tracks panel state.
 * Since we don't support removing tracked data, we need to introduce an OFF state
 * This is currently meant for the mole game, where we want to know if an "on" state 
 * is active or turned to location color (and thus ignored)
 * 
 * Note: Since we require a string key, we use the combined stripId and panelId
 * as a key.
 */

var TrackedPanels = exports.TrackedPanels = function (_TrackedData) {
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
      return this.get(this._hash(stripId, panelId)) || TrackedData.STATE_OFF;
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
}(TrackedData);

TrackedPanels.STATE_ON = "on";
TrackedPanels.STATE_OFF = "off";
TrackedPanels.STATE_IGNORED = "ignored";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvdHJhY2tlZC1wYW5lbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLGNBQWMsUUFBUSxnQkFBUixDQUFwQjs7Ozs7Ozs7Ozs7O0lBV2EsYSxXQUFBLGE7OztBQU1YLDJCQUFjO0FBQUE7O0FBQUE7QUFFYixHOzs7OztrQ0FFYSxPLEVBQVMsTyxFQUFTLEssRUFBTztBQUNyQyxXQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQUwsQ0FBVyxPQUFYLEVBQW9CLE9BQXBCLENBQVQsRUFBdUMsS0FBdkM7QUFDRDs7O2tDQUVhLE8sRUFBUyxPLEVBQVM7QUFDOUIsYUFBTyxLQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQUwsQ0FBVyxPQUFYLEVBQW9CLE9BQXBCLENBQVQsS0FBMEMsWUFBWSxTQUE3RDtBQUNEOzs7MEJBTUssTyxFQUFTLE8sRUFBUztBQUN0QixhQUFVLE9BQVYsU0FBcUIsT0FBckI7QUFDRDs7O3dCQU5lO0FBQ2QsYUFBTyxPQUFPLElBQVAsQ0FBWSxLQUFLLEtBQWpCLEVBQXdCLE1BQS9CO0FBQ0Q7Ozs7RUFwQmdDLFc7O0FBQXRCLGEsQ0FFSixRLEdBQVcsSTtBQUZQLGEsQ0FHSixTLEdBQVksSztBQUhSLGEsQ0FJSixhLEdBQWdCLFMiLCJmaWxlIjoiZ2FtZS1sb2dpYy91dGlscy90cmFja2VkLXBhbmVscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFRyYWNrZWREYXRhID0gcmVxdWlyZSgnLi90cmFja2VkLWRhdGEnKTtcblxuLyoqXG4gKiBUcmFja3MgcGFuZWwgc3RhdGUuXG4gKiBTaW5jZSB3ZSBkb24ndCBzdXBwb3J0IHJlbW92aW5nIHRyYWNrZWQgZGF0YSwgd2UgbmVlZCB0byBpbnRyb2R1Y2UgYW4gT0ZGIHN0YXRlXG4gKiBUaGlzIGlzIGN1cnJlbnRseSBtZWFudCBmb3IgdGhlIG1vbGUgZ2FtZSwgd2hlcmUgd2Ugd2FudCB0byBrbm93IGlmIGFuIFwib25cIiBzdGF0ZSBcbiAqIGlzIGFjdGl2ZSBvciB0dXJuZWQgdG8gbG9jYXRpb24gY29sb3IgKGFuZCB0aHVzIGlnbm9yZWQpXG4gKiBcbiAqIE5vdGU6IFNpbmNlIHdlIHJlcXVpcmUgYSBzdHJpbmcga2V5LCB3ZSB1c2UgdGhlIGNvbWJpbmVkIHN0cmlwSWQgYW5kIHBhbmVsSWRcbiAqIGFzIGEga2V5LlxuICovXG5leHBvcnQgY2xhc3MgVHJhY2tlZFBhbmVscyBleHRlbmRzIFRyYWNrZWREYXRhIHtcblxuICBzdGF0aWMgU1RBVEVfT04gPSBcIm9uXCI7XG4gIHN0YXRpYyBTVEFURV9PRkYgPSBcIm9mZlwiOyAvLyBkZWZhdWx0XG4gIHN0YXRpYyBTVEFURV9JR05PUkVEID0gXCJpZ25vcmVkXCI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHNldFBhbmVsU3RhdGUoc3RyaXBJZCwgcGFuZWxJZCwgc3RhdGUpIHtcbiAgICB0aGlzLnNldCh0aGlzLl9oYXNoKHN0cmlwSWQsIHBhbmVsSWQpLCBzdGF0ZSk7XG4gIH1cblxuICBnZXRQYW5lbFN0YXRlKHN0cmlwSWQsIHBhbmVsSWQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQodGhpcy5faGFzaChzdHJpcElkLCBwYW5lbElkKSkgfHwgVHJhY2tlZERhdGEuU1RBVEVfT0ZGO1xuICB9XG5cbiAgZ2V0IG51bVBhbmVscygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZGF0YSkubGVuZ3RoO1xuICB9XG5cbiAgX2hhc2goc3RyaXBJZCwgcGFuZWxJZCkge1xuICAgIHJldHVybiBgJHtzdHJpcElkfSwke3BhbmVsSWR9YDtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
