"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _baseActionCreator = require("./base-action-creator");

var _baseActionCreator2 = _interopRequireDefault(_baseActionCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MoleGameActionCreator = function (_BaseActionCreator) {
  _inherits(MoleGameActionCreator, _BaseActionCreator);

  function MoleGameActionCreator() {
    _classCallCheck(this, MoleGameActionCreator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MoleGameActionCreator).apply(this, arguments));
  }

  _createClass(MoleGameActionCreator, [{
    key: "sendAvailPanel",


    /**
     * Signals the mole game to avail a panel, typically from a timer
     */

    // Action types
    value: function sendAvailPanel(_ref) {
      var stripId = _ref.stripId;
      var panelId = _ref.panelId;

      this._dispatch(MoleGameActionCreator.AVAIL_PANEL, { stripId: stripId, panelId: panelId });
    }

    /**
     * Signals the mole game to deavail a panel, typically from a timer
     */

  }, {
    key: "sendDeavailPanel",
    value: function sendDeavailPanel(_ref2) {
      var stripId = _ref2.stripId;
      var panelId = _ref2.panelId;

      this._dispatch(MoleGameActionCreator.DEAVAIL_PANEL, { stripId: stripId, panelId: panelId });
    }
  }]);

  return MoleGameActionCreator;
}(_baseActionCreator2.default);

MoleGameActionCreator.AVAIL_PANEL = "avail-panel";
MoleGameActionCreator.DEAVAIL_PANEL = "deavail-panel";
exports.default = MoleGameActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9tb2xlLWdhbWUtYWN0aW9uLWNyZWF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7O0lBRXFCLHFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7eUNBUWdCO0FBQUEsVUFBbkIsT0FBbUIsUUFBbkIsT0FBbUI7QUFBQSxVQUFWLE9BQVUsUUFBVixPQUFVOztBQUNqQyxXQUFLLFNBQUwsQ0FBZSxzQkFBc0IsV0FBckMsRUFBa0QsRUFBQyxnQkFBRCxFQUFVLGdCQUFWLEVBQWxEO0FBQ0Q7Ozs7Ozs7OzRDQUtvQztBQUFBLFVBQW5CLE9BQW1CLFNBQW5CLE9BQW1CO0FBQUEsVUFBVixPQUFVLFNBQVYsT0FBVTs7QUFDbkMsV0FBSyxTQUFMLENBQWUsc0JBQXNCLGFBQXJDLEVBQW9ELEVBQUMsZ0JBQUQsRUFBVSxnQkFBVixFQUFwRDtBQUNEOzs7Ozs7QUFqQmtCLHFCLENBRVosVyxHQUFjLGE7QUFGRixxQixDQUdaLGEsR0FBZ0IsZTtrQkFISixxQiIsImZpbGUiOiJnYW1lLWxvZ2ljL2FjdGlvbnMvbW9sZS1nYW1lLWFjdGlvbi1jcmVhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VBY3Rpb25DcmVhdG9yIGZyb20gJy4vYmFzZS1hY3Rpb24tY3JlYXRvcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vbGVHYW1lQWN0aW9uQ3JlYXRvciBleHRlbmRzIEJhc2VBY3Rpb25DcmVhdG9yIHtcbiAgLy8gQWN0aW9uIHR5cGVzXG4gIHN0YXRpYyBBVkFJTF9QQU5FTCA9IFwiYXZhaWwtcGFuZWxcIjtcbiAgc3RhdGljIERFQVZBSUxfUEFORUwgPSBcImRlYXZhaWwtcGFuZWxcIjtcblxuICAvKipcbiAgICogU2lnbmFscyB0aGUgbW9sZSBnYW1lIHRvIGF2YWlsIGEgcGFuZWwsIHR5cGljYWxseSBmcm9tIGEgdGltZXJcbiAgICovXG4gIHNlbmRBdmFpbFBhbmVsKHtzdHJpcElkLCBwYW5lbElkfSkge1xuICAgIHRoaXMuX2Rpc3BhdGNoKE1vbGVHYW1lQWN0aW9uQ3JlYXRvci5BVkFJTF9QQU5FTCwge3N0cmlwSWQsIHBhbmVsSWR9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWduYWxzIHRoZSBtb2xlIGdhbWUgdG8gZGVhdmFpbCBhIHBhbmVsLCB0eXBpY2FsbHkgZnJvbSBhIHRpbWVyXG4gICAqL1xuICBzZW5kRGVhdmFpbFBhbmVsKHtzdHJpcElkLCBwYW5lbElkfSkge1xuICAgIHRoaXMuX2Rpc3BhdGNoKE1vbGVHYW1lQWN0aW9uQ3JlYXRvci5ERUFWQUlMX1BBTkVMLCB7c3RyaXBJZCwgcGFuZWxJZH0pO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
