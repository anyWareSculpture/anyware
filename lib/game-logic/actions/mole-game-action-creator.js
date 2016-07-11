"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseActionCreator = require('./base-action-creator');

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
}(BaseActionCreator);

MoleGameActionCreator.AVAIL_PANEL = "avail-panel";
MoleGameActionCreator.DEAVAIL_PANEL = "deavail-panel";
exports.default = MoleGameActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9tb2xlLWdhbWUtYWN0aW9uLWNyZWF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLG9CQUFvQixRQUFRLHVCQUFSLENBQTFCOztJQUVxQixxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O3lDQVFnQjtBQUFBLFVBQW5CLE9BQW1CLFFBQW5CLE9BQW1CO0FBQUEsVUFBVixPQUFVLFFBQVYsT0FBVTs7QUFDakMsV0FBSyxTQUFMLENBQWUsc0JBQXNCLFdBQXJDLEVBQWtELEVBQUMsZ0JBQUQsRUFBVSxnQkFBVixFQUFsRDtBQUNEOzs7Ozs7Ozs0Q0FLb0M7QUFBQSxVQUFuQixPQUFtQixTQUFuQixPQUFtQjtBQUFBLFVBQVYsT0FBVSxTQUFWLE9BQVU7O0FBQ25DLFdBQUssU0FBTCxDQUFlLHNCQUFzQixhQUFyQyxFQUFvRCxFQUFDLGdCQUFELEVBQVUsZ0JBQVYsRUFBcEQ7QUFDRDs7OztFQWpCZ0QsaUI7O0FBQTlCLHFCLENBRVosVyxHQUFjLGE7QUFGRixxQixDQUdaLGEsR0FBZ0IsZTtrQkFISixxQiIsImZpbGUiOiJnYW1lLWxvZ2ljL2FjdGlvbnMvbW9sZS1nYW1lLWFjdGlvbi1jcmVhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQmFzZUFjdGlvbkNyZWF0b3IgPSByZXF1aXJlKCcuL2Jhc2UtYWN0aW9uLWNyZWF0b3InKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9sZUdhbWVBY3Rpb25DcmVhdG9yIGV4dGVuZHMgQmFzZUFjdGlvbkNyZWF0b3Ige1xuICAvLyBBY3Rpb24gdHlwZXNcbiAgc3RhdGljIEFWQUlMX1BBTkVMID0gXCJhdmFpbC1wYW5lbFwiO1xuICBzdGF0aWMgREVBVkFJTF9QQU5FTCA9IFwiZGVhdmFpbC1wYW5lbFwiO1xuXG4gIC8qKlxuICAgKiBTaWduYWxzIHRoZSBtb2xlIGdhbWUgdG8gYXZhaWwgYSBwYW5lbCwgdHlwaWNhbGx5IGZyb20gYSB0aW1lclxuICAgKi9cbiAgc2VuZEF2YWlsUGFuZWwoe3N0cmlwSWQsIHBhbmVsSWR9KSB7XG4gICAgdGhpcy5fZGlzcGF0Y2goTW9sZUdhbWVBY3Rpb25DcmVhdG9yLkFWQUlMX1BBTkVMLCB7c3RyaXBJZCwgcGFuZWxJZH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25hbHMgdGhlIG1vbGUgZ2FtZSB0byBkZWF2YWlsIGEgcGFuZWwsIHR5cGljYWxseSBmcm9tIGEgdGltZXJcbiAgICovXG4gIHNlbmREZWF2YWlsUGFuZWwoe3N0cmlwSWQsIHBhbmVsSWR9KSB7XG4gICAgdGhpcy5fZGlzcGF0Y2goTW9sZUdhbWVBY3Rpb25DcmVhdG9yLkRFQVZBSUxfUEFORUwsIHtzdHJpcElkLCBwYW5lbElkfSk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
