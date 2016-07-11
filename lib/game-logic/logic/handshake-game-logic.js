'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sculptureActionCreator = require('../actions/sculpture-action-creator');

var _sculptureActionCreator2 = _interopRequireDefault(_sculptureActionCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HandshakeGameLogic = function () {
  function HandshakeGameLogic(store, config) {
    _classCallCheck(this, HandshakeGameLogic);

    this.store = store;
    this.config = config;
    this.gameConfig = config.HANDSHAKE_GAME;

    this._complete = false;

    this.sculptureActionCreator = new _sculptureActionCreator2.default(this.store.dispatcher);
  }
  // These are automatically added to the sculpture store


  _createClass(HandshakeGameLogic, [{
    key: 'start',
    value: function start() {}
  }, {
    key: 'end',
    value: function end() {
      this.store.data.get('lights').deactivateAll();
    }
  }, {
    key: 'handleActionPayload',
    value: function handleActionPayload(payload) {
      if (this._complete) {
        return;
      }

      var actionHandlers = _defineProperty({}, _sculptureActionCreator2.default.HANDSHAKE_ACTIVATE, this._actionHandshakeActivate.bind(this));

      var actionHandler = actionHandlers[payload.actionType];
      if (actionHandler) {
        actionHandler(payload);
      }
    }
  }, {
    key: '_actionHandshakeActivate',
    value: function _actionHandshakeActivate(payload) {
      var _this = this;

      this._complete = true;
      // Only the receiving sculpture will manage the transition
      if (payload.user === this.store.username) {
        setTimeout(function () {
          return _this.sculptureActionCreator.sendStartNextGame();
        }, this.gameConfig.TRANSITION_OUT_TIME);
      }
    }
  }, {
    key: 'data',
    get: function get() {
      return this.store.data.get('handshake');
    }
  }]);

  return HandshakeGameLogic;
}();

HandshakeGameLogic.trackedProperties = {};
exports.default = HandshakeGameLogic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvbG9naWMvaGFuZHNoYWtlLWdhbWUtbG9naWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7OztJQUVxQixrQjtBQUtuQiw4QkFBWSxLQUFaLEVBQW1CLE1BQW5CLEVBQTJCO0FBQUE7O0FBQ3pCLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLE9BQU8sY0FBekI7O0FBRUEsU0FBSyxTQUFMLEdBQWlCLEtBQWpCOztBQUVBLFNBQUssc0JBQUwsR0FBOEIscUNBQTJCLEtBQUssS0FBTCxDQUFXLFVBQXRDLENBQTlCO0FBQ0Q7Ozs7Ozs0QkFNTyxDQUNQOzs7MEJBRUs7QUFDSixXQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEdBQWhCLENBQW9CLFFBQXBCLEVBQThCLGFBQTlCO0FBQ0Q7Ozt3Q0FFbUIsTyxFQUFTO0FBQzNCLFVBQUksS0FBSyxTQUFULEVBQW9CO0FBQ2xCO0FBQ0Q7O0FBRUQsVUFBTSxxQ0FDSCxpQ0FBdUIsa0JBRHBCLEVBQ3lDLEtBQUssd0JBQUwsQ0FBOEIsSUFBOUIsQ0FBbUMsSUFBbkMsQ0FEekMsQ0FBTjs7QUFJQSxVQUFNLGdCQUFnQixlQUFlLFFBQVEsVUFBdkIsQ0FBdEI7QUFDQSxVQUFJLGFBQUosRUFBbUI7QUFDakIsc0JBQWMsT0FBZDtBQUNEO0FBQ0Y7Ozs2Q0FFd0IsTyxFQUFTO0FBQUE7O0FBQ2hDLFdBQUssU0FBTCxHQUFpQixJQUFqQjs7QUFFQSxVQUFJLFFBQVEsSUFBUixLQUFpQixLQUFLLEtBQUwsQ0FBVyxRQUFoQyxFQUEwQztBQUN4QyxtQkFBVztBQUFBLGlCQUFNLE1BQUssc0JBQUwsQ0FBNEIsaUJBQTVCLEVBQU47QUFBQSxTQUFYLEVBQWtFLEtBQUssVUFBTCxDQUFnQixtQkFBbEY7QUFDRDtBQUNGOzs7d0JBaENVO0FBQ1QsYUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEdBQWhCLENBQW9CLFdBQXBCLENBQVA7QUFDRDs7Ozs7O0FBakJrQixrQixDQUVaLGlCLEdBQW9CLEU7a0JBRlIsa0IiLCJmaWxlIjoiZ2FtZS1sb2dpYy9sb2dpYy9oYW5kc2hha2UtZ2FtZS1sb2dpYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY3VscHR1cmVBY3Rpb25DcmVhdG9yIGZyb20gJy4uL2FjdGlvbnMvc2N1bHB0dXJlLWFjdGlvbi1jcmVhdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGFuZHNoYWtlR2FtZUxvZ2ljIHtcbiAgLy8gVGhlc2UgYXJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgdG8gdGhlIHNjdWxwdHVyZSBzdG9yZVxuICBzdGF0aWMgdHJhY2tlZFByb3BlcnRpZXMgPSB7XG4gIH07XG5cbiAgY29uc3RydWN0b3Ioc3RvcmUsIGNvbmZpZykge1xuICAgIHRoaXMuc3RvcmUgPSBzdG9yZTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmdhbWVDb25maWcgPSBjb25maWcuSEFORFNIQUtFX0dBTUU7XG5cbiAgICB0aGlzLl9jb21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5zY3VscHR1cmVBY3Rpb25DcmVhdG9yID0gbmV3IFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IodGhpcy5zdG9yZS5kaXNwYXRjaGVyKTtcbiAgfVxuXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdoYW5kc2hha2UnKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICB9XG5cbiAgZW5kKCkge1xuICAgIHRoaXMuc3RvcmUuZGF0YS5nZXQoJ2xpZ2h0cycpLmRlYWN0aXZhdGVBbGwoKTtcbiAgfVxuXG4gIGhhbmRsZUFjdGlvblBheWxvYWQocGF5bG9hZCkge1xuICAgIGlmICh0aGlzLl9jb21wbGV0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXJzID0ge1xuICAgICAgW1NjdWxwdHVyZUFjdGlvbkNyZWF0b3IuSEFORFNIQUtFX0FDVElWQVRFXTogdGhpcy5fYWN0aW9uSGFuZHNoYWtlQWN0aXZhdGUuYmluZCh0aGlzKVxuICAgIH07XG5cbiAgICBjb25zdCBhY3Rpb25IYW5kbGVyID0gYWN0aW9uSGFuZGxlcnNbcGF5bG9hZC5hY3Rpb25UeXBlXTtcbiAgICBpZiAoYWN0aW9uSGFuZGxlcikge1xuICAgICAgYWN0aW9uSGFuZGxlcihwYXlsb2FkKTtcbiAgICB9XG4gIH1cblxuICBfYWN0aW9uSGFuZHNoYWtlQWN0aXZhdGUocGF5bG9hZCkge1xuICAgIHRoaXMuX2NvbXBsZXRlID0gdHJ1ZTtcbiAgICAvLyBPbmx5IHRoZSByZWNlaXZpbmcgc2N1bHB0dXJlIHdpbGwgbWFuYWdlIHRoZSB0cmFuc2l0aW9uXG4gICAgaWYgKHBheWxvYWQudXNlciA9PT0gdGhpcy5zdG9yZS51c2VybmFtZSkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnNjdWxwdHVyZUFjdGlvbkNyZWF0b3Iuc2VuZFN0YXJ0TmV4dEdhbWUoKSwgdGhpcy5nYW1lQ29uZmlnLlRSQU5TSVRJT05fT1VUX1RJTUUpO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
