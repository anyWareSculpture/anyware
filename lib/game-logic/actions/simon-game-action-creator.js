"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseActionCreator = require('./base-action-creator');

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
}(BaseActionCreator);

SimonGameActionCreator.REPLAY_SIMON_PATTERN = "replay-simon-pattern";
exports.default = SimonGameActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9zaW1vbi1nYW1lLWFjdGlvbi1jcmVhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTSxvQkFBb0IsUUFBUSx1QkFBUixDQUExQjs7SUFFcUIsc0I7Ozs7Ozs7Ozs7Ozs7Ozs7NkNBT007QUFDdkIsV0FBSyxTQUFMLENBQWUsdUJBQXVCLG9CQUF0QztBQUNEOzs7Ozs7RUFUaUQsaUI7O0FBQS9CLHNCLENBRVosb0IsR0FBdUIsc0I7a0JBRlgsc0IiLCJmaWxlIjoiZ2FtZS1sb2dpYy9hY3Rpb25zL3NpbW9uLWdhbWUtYWN0aW9uLWNyZWF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBCYXNlQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4vYmFzZS1hY3Rpb24tY3JlYXRvcicpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaW1vbkdhbWVBY3Rpb25DcmVhdG9yIGV4dGVuZHMgQmFzZUFjdGlvbkNyZWF0b3Ige1xuICAvLyBBY3Rpb24gdHlwZXNcbiAgc3RhdGljIFJFUExBWV9TSU1PTl9QQVRURVJOID0gXCJyZXBsYXktc2ltb24tcGF0dGVyblwiO1xuXG4gIC8qKlxuICAgKiBTaWduYWxzIHRoZSBzaW1vbiBnYW1lIHRvIHJlcGxheSB0aGUgc2ltb24gcGF0dGVyblxuICAgKi9cbiAgc2VuZFJlcGxheVNpbW9uUGF0dGVybigpIHtcbiAgICB0aGlzLl9kaXNwYXRjaChTaW1vbkdhbWVBY3Rpb25DcmVhdG9yLlJFUExBWV9TSU1PTl9QQVRURVJOKTtcbiAgfVxufVxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
