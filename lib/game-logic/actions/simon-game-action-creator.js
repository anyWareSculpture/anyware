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

var SimonGameActionCreator = function (_BaseActionCreator) {
  _inherits(SimonGameActionCreator, _BaseActionCreator);

  function SimonGameActionCreator() {
    _classCallCheck(this, SimonGameActionCreator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SimonGameActionCreator).apply(this, arguments));
  }

  _createClass(SimonGameActionCreator, [{
    key: "sendReplaySimonPattern",


    /**
     * Signals the simon game to replay the simon pattern
     */
    value: function sendReplaySimonPattern() {
      this._dispatch(SimonGameActionCreator.REPLAY_SIMON_PATTERN);
    }
    // Action types

  }]);

  return SimonGameActionCreator;
}(_baseActionCreator2.default);

SimonGameActionCreator.REPLAY_SIMON_PATTERN = "replay-simon-pattern";
exports.default = SimonGameActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9zaW1vbi1nYW1lLWFjdGlvbi1jcmVhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7OztJQUVxQixzQjs7Ozs7Ozs7Ozs7Ozs7Ozs2Q0FPTTtBQUN2QixXQUFLLFNBQUwsQ0FBZSx1QkFBdUIsb0JBQXRDO0FBQ0Q7Ozs7Ozs7O0FBVGtCLHNCLENBRVosb0IsR0FBdUIsc0I7a0JBRlgsc0IiLCJmaWxlIjoiZ2FtZS1sb2dpYy9hY3Rpb25zL3NpbW9uLWdhbWUtYWN0aW9uLWNyZWF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUFjdGlvbkNyZWF0b3IgZnJvbSAnLi9iYXNlLWFjdGlvbi1jcmVhdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2ltb25HYW1lQWN0aW9uQ3JlYXRvciBleHRlbmRzIEJhc2VBY3Rpb25DcmVhdG9yIHtcbiAgLy8gQWN0aW9uIHR5cGVzXG4gIHN0YXRpYyBSRVBMQVlfU0lNT05fUEFUVEVSTiA9IFwicmVwbGF5LXNpbW9uLXBhdHRlcm5cIjtcblxuICAvKipcbiAgICogU2lnbmFscyB0aGUgc2ltb24gZ2FtZSB0byByZXBsYXkgdGhlIHNpbW9uIHBhdHRlcm5cbiAgICovXG4gIHNlbmRSZXBsYXlTaW1vblBhdHRlcm4oKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2goU2ltb25HYW1lQWN0aW9uQ3JlYXRvci5SRVBMQVlfU0lNT05fUEFUVEVSTik7XG4gIH1cbn1cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
