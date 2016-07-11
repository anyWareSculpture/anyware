'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SculptureActionCreator = require('../actions/sculpture-action-creator');

var HandshakeGameLogic = function () {
  function HandshakeGameLogic(store, config) {
    _classCallCheck(this, HandshakeGameLogic);

    this.store = store;
    this.config = config;
    this.gameConfig = config.HANDSHAKE_GAME;

    this._complete = false;

    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);
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

      var actionHandlers = _defineProperty({}, SculptureActionCreator.HANDSHAKE_ACTIVATE, this._actionHandshakeActivate.bind(this));

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvbG9naWMvaGFuZHNoYWtlLWdhbWUtbG9naWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTSx5QkFBeUIsUUFBUSxxQ0FBUixDQUEvQjs7SUFFcUIsa0I7QUFLbkIsOEJBQVksS0FBWixFQUFtQixNQUFuQixFQUEyQjtBQUFBOztBQUN6QixTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsU0FBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLFNBQUssVUFBTCxHQUFrQixPQUFPLGNBQXpCOztBQUVBLFNBQUssU0FBTCxHQUFpQixLQUFqQjs7QUFFQSxTQUFLLHNCQUFMLEdBQThCLElBQUksc0JBQUosQ0FBMkIsS0FBSyxLQUFMLENBQVcsVUFBdEMsQ0FBOUI7QUFDRDs7Ozs7OzRCQU1PLENBQ1A7OzswQkFFSztBQUNKLFdBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBb0IsUUFBcEIsRUFBOEIsYUFBOUI7QUFDRDs7O3dDQUVtQixPLEVBQVM7QUFDM0IsVUFBSSxLQUFLLFNBQVQsRUFBb0I7QUFDbEI7QUFDRDs7QUFFRCxVQUFNLHFDQUNILHVCQUF1QixrQkFEcEIsRUFDeUMsS0FBSyx3QkFBTCxDQUE4QixJQUE5QixDQUFtQyxJQUFuQyxDQUR6QyxDQUFOOztBQUlBLFVBQU0sZ0JBQWdCLGVBQWUsUUFBUSxVQUF2QixDQUF0QjtBQUNBLFVBQUksYUFBSixFQUFtQjtBQUNqQixzQkFBYyxPQUFkO0FBQ0Q7QUFDRjs7OzZDQUV3QixPLEVBQVM7QUFBQTs7QUFDaEMsV0FBSyxTQUFMLEdBQWlCLElBQWpCOztBQUVBLFVBQUksUUFBUSxJQUFSLEtBQWlCLEtBQUssS0FBTCxDQUFXLFFBQWhDLEVBQTBDO0FBQ3hDLG1CQUFXO0FBQUEsaUJBQU0sTUFBSyxzQkFBTCxDQUE0QixpQkFBNUIsRUFBTjtBQUFBLFNBQVgsRUFBa0UsS0FBSyxVQUFMLENBQWdCLG1CQUFsRjtBQUNEO0FBQ0Y7Ozt3QkFoQ1U7QUFDVCxhQUFPLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBb0IsV0FBcEIsQ0FBUDtBQUNEOzs7Ozs7QUFqQmtCLGtCLENBRVosaUIsR0FBb0IsRTtrQkFGUixrQiIsImZpbGUiOiJnYW1lLWxvZ2ljL2xvZ2ljL2hhbmRzaGFrZS1nYW1lLWxvZ2ljLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU2N1bHB0dXJlQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvc2N1bHB0dXJlLWFjdGlvbi1jcmVhdG9yJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhhbmRzaGFrZUdhbWVMb2dpYyB7XG4gIC8vIFRoZXNlIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzY3VscHR1cmUgc3RvcmVcbiAgc3RhdGljIHRyYWNrZWRQcm9wZXJ0aWVzID0ge1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JlLCBjb25maWcpIHtcbiAgICB0aGlzLnN0b3JlID0gc3RvcmU7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5nYW1lQ29uZmlnID0gY29uZmlnLkhBTkRTSEFLRV9HQU1FO1xuXG4gICAgdGhpcy5fY29tcGxldGUgPSBmYWxzZTtcblxuICAgIHRoaXMuc2N1bHB0dXJlQWN0aW9uQ3JlYXRvciA9IG5ldyBTY3VscHR1cmVBY3Rpb25DcmVhdG9yKHRoaXMuc3RvcmUuZGlzcGF0Y2hlcik7XG4gIH1cblxuICBnZXQgZGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5kYXRhLmdldCgnaGFuZHNoYWtlJyk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgfVxuXG4gIGVuZCgpIHtcbiAgICB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdsaWdodHMnKS5kZWFjdGl2YXRlQWxsKCk7XG4gIH1cblxuICBoYW5kbGVBY3Rpb25QYXlsb2FkKHBheWxvYWQpIHtcbiAgICBpZiAodGhpcy5fY29tcGxldGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhY3Rpb25IYW5kbGVycyA9IHtcbiAgICAgIFtTY3VscHR1cmVBY3Rpb25DcmVhdG9yLkhBTkRTSEFLRV9BQ1RJVkFURV06IHRoaXMuX2FjdGlvbkhhbmRzaGFrZUFjdGl2YXRlLmJpbmQodGhpcylcbiAgICB9O1xuXG4gICAgY29uc3QgYWN0aW9uSGFuZGxlciA9IGFjdGlvbkhhbmRsZXJzW3BheWxvYWQuYWN0aW9uVHlwZV07XG4gICAgaWYgKGFjdGlvbkhhbmRsZXIpIHtcbiAgICAgIGFjdGlvbkhhbmRsZXIocGF5bG9hZCk7XG4gICAgfVxuICB9XG5cbiAgX2FjdGlvbkhhbmRzaGFrZUFjdGl2YXRlKHBheWxvYWQpIHtcbiAgICB0aGlzLl9jb21wbGV0ZSA9IHRydWU7XG4gICAgLy8gT25seSB0aGUgcmVjZWl2aW5nIHNjdWxwdHVyZSB3aWxsIG1hbmFnZSB0aGUgdHJhbnNpdGlvblxuICAgIGlmIChwYXlsb2FkLnVzZXIgPT09IHRoaXMuc3RvcmUudXNlcm5hbWUpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zY3VscHR1cmVBY3Rpb25DcmVhdG9yLnNlbmRTdGFydE5leHRHYW1lKCksIHRoaXMuZ2FtZUNvbmZpZy5UUkFOU0lUSU9OX09VVF9USU1FKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
