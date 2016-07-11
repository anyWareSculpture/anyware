'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseActionCreator = require('./base-action-creator');

var GAMES = require('../constants/games');

var SculptureActionCreator = function (_BaseActionCreator) {
  _inherits(SculptureActionCreator, _BaseActionCreator);

  function SculptureActionCreator() {
    _classCallCheck(this, SculptureActionCreator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SculptureActionCreator).apply(this, arguments));
  }

  _createClass(SculptureActionCreator, [{
    key: 'sendMergeState',


    /**
     * Sends an action asking the sculpture to merge some state
     * @param {Object} state - The state update to merge
     */

    // Action types
    value: function sendMergeState(state) {
      this._dispatch(SculptureActionCreator.MERGE_STATE, state);
    }
  }, {
    key: 'sendStartGame',
    value: function sendStartGame(game) {
      this._dispatch(SculptureActionCreator.START_GAME, {
        game: game
      });
    }
  }, {
    key: 'sendStartNextGame',
    value: function sendStartNextGame(game) {
      this._dispatch(SculptureActionCreator.START_NEXT_GAME);
    }
  }, {
    key: 'sendStartMoleGame',
    value: function sendStartMoleGame() {
      this.sendStartGame(GAMES.MOLE);
    }
  }, {
    key: 'sendStartDiskGame',
    value: function sendStartDiskGame() {
      this.sendStartGame(GAMES.DISK);
    }
  }, {
    key: 'sendStartSimonGame',
    value: function sendStartSimonGame() {
      this.sendStartGame(GAMES.SIMON);
    }
  }, {
    key: 'sendRestoreStatus',
    value: function sendRestoreStatus() {
      this._dispatch(SculptureActionCreator.RESTORE_STATUS);
    }
  }, {
    key: 'sendAnimationFrame',
    value: function sendAnimationFrame(frameCallback) {
      this._dispatch(SculptureActionCreator.ANIMATION_FRAME, {
        callback: frameCallback
      });
    }
  }, {
    key: 'sendFinishStatusAnimation',
    value: function sendFinishStatusAnimation() {
      this._dispatch(SculptureActionCreator.FINISH_STATUS_ANIMATION);
    }
  }, {
    key: 'sendHandshakeActivate',
    value: function sendHandshakeActivate(user) {
      this._dispatch(SculptureActionCreator.HANDSHAKE_ACTIVATE, {
        user: user
      });
    }
  }, {
    key: 'sendHandshakeDeactivate',
    value: function sendHandshakeDeactivate(user) {
      this._dispatch(SculptureActionCreator.HANDSHAKE_DEACTIVATE, {
        user: user
      });
    }
  }]);

  return SculptureActionCreator;
}(BaseActionCreator);

SculptureActionCreator.MERGE_STATE = "merge-state";
SculptureActionCreator.START_GAME = "start-game";
SculptureActionCreator.START_NEXT_GAME = "start-next-game";
SculptureActionCreator.RESTORE_STATUS = "restore-status";
SculptureActionCreator.ANIMATION_FRAME = "animation-frame";
SculptureActionCreator.FINISH_STATUS_ANIMATION = "finish-status-animation";
SculptureActionCreator.HANDSHAKE_ACTIVATE = "handshake-activate";
SculptureActionCreator.HANDSHAKE_DEACTIVATE = "handshake-deactivate";
exports.default = SculptureActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9zY3VscHR1cmUtYWN0aW9uLWNyZWF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLG9CQUFvQixRQUFRLHVCQUFSLENBQTFCOztBQUVBLElBQU0sUUFBUSxRQUFRLG9CQUFSLENBQWQ7O0lBRXFCLHNCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21DQWVKLEssRUFBTztBQUNwQixXQUFLLFNBQUwsQ0FBZSx1QkFBdUIsV0FBdEMsRUFBbUQsS0FBbkQ7QUFDRDs7O2tDQUVhLEksRUFBTTtBQUNsQixXQUFLLFNBQUwsQ0FBZSx1QkFBdUIsVUFBdEMsRUFBa0Q7QUFDaEQsY0FBTTtBQUQwQyxPQUFsRDtBQUdEOzs7c0NBRWlCLEksRUFBTTtBQUN0QixXQUFLLFNBQUwsQ0FBZSx1QkFBdUIsZUFBdEM7QUFDRDs7O3dDQUVtQjtBQUNsQixXQUFLLGFBQUwsQ0FBbUIsTUFBTSxJQUF6QjtBQUNEOzs7d0NBRW1CO0FBQ2xCLFdBQUssYUFBTCxDQUFtQixNQUFNLElBQXpCO0FBQ0Q7Ozt5Q0FFb0I7QUFDbkIsV0FBSyxhQUFMLENBQW1CLE1BQU0sS0FBekI7QUFDRDs7O3dDQUVtQjtBQUNsQixXQUFLLFNBQUwsQ0FBZSx1QkFBdUIsY0FBdEM7QUFDRDs7O3VDQUVrQixhLEVBQWU7QUFDaEMsV0FBSyxTQUFMLENBQWUsdUJBQXVCLGVBQXRDLEVBQXVEO0FBQ3JELGtCQUFVO0FBRDJDLE9BQXZEO0FBR0Q7OztnREFFMkI7QUFDMUIsV0FBSyxTQUFMLENBQWUsdUJBQXVCLHVCQUF0QztBQUNEOzs7MENBRXFCLEksRUFBTTtBQUMxQixXQUFLLFNBQUwsQ0FBZSx1QkFBdUIsa0JBQXRDLEVBQTBEO0FBQ3hELGNBQU07QUFEa0QsT0FBMUQ7QUFHRDs7OzRDQUV1QixJLEVBQU07QUFDNUIsV0FBSyxTQUFMLENBQWUsdUJBQXVCLG9CQUF0QyxFQUE0RDtBQUMxRCxjQUFNO0FBRG9ELE9BQTVEO0FBR0Q7Ozs7RUFqRWlELGlCOztBQUEvQixzQixDQUVaLFcsR0FBYyxhO0FBRkYsc0IsQ0FHWixVLEdBQWEsWTtBQUhELHNCLENBSVosZSxHQUFrQixpQjtBQUpOLHNCLENBS1osYyxHQUFpQixnQjtBQUxMLHNCLENBTVosZSxHQUFrQixpQjtBQU5OLHNCLENBT1osdUIsR0FBMEIseUI7QUFQZCxzQixDQVFaLGtCLEdBQXFCLG9CO0FBUlQsc0IsQ0FTWixvQixHQUF1QixzQjtrQkFUWCxzQiIsImZpbGUiOiJnYW1lLWxvZ2ljL2FjdGlvbnMvc2N1bHB0dXJlLWFjdGlvbi1jcmVhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQmFzZUFjdGlvbkNyZWF0b3IgPSByZXF1aXJlKCcuL2Jhc2UtYWN0aW9uLWNyZWF0b3InKTtcblxuY29uc3QgR0FNRVMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvZ2FtZXMnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2N1bHB0dXJlQWN0aW9uQ3JlYXRvciBleHRlbmRzIEJhc2VBY3Rpb25DcmVhdG9yIHtcbiAgLy8gQWN0aW9uIHR5cGVzXG4gIHN0YXRpYyBNRVJHRV9TVEFURSA9IFwibWVyZ2Utc3RhdGVcIjtcbiAgc3RhdGljIFNUQVJUX0dBTUUgPSBcInN0YXJ0LWdhbWVcIjtcbiAgc3RhdGljIFNUQVJUX05FWFRfR0FNRSA9IFwic3RhcnQtbmV4dC1nYW1lXCI7XG4gIHN0YXRpYyBSRVNUT1JFX1NUQVRVUyA9IFwicmVzdG9yZS1zdGF0dXNcIjtcbiAgc3RhdGljIEFOSU1BVElPTl9GUkFNRSA9IFwiYW5pbWF0aW9uLWZyYW1lXCI7XG4gIHN0YXRpYyBGSU5JU0hfU1RBVFVTX0FOSU1BVElPTiA9IFwiZmluaXNoLXN0YXR1cy1hbmltYXRpb25cIjtcbiAgc3RhdGljIEhBTkRTSEFLRV9BQ1RJVkFURSA9IFwiaGFuZHNoYWtlLWFjdGl2YXRlXCI7XG4gIHN0YXRpYyBIQU5EU0hBS0VfREVBQ1RJVkFURSA9IFwiaGFuZHNoYWtlLWRlYWN0aXZhdGVcIjtcblxuICAvKipcbiAgICogU2VuZHMgYW4gYWN0aW9uIGFza2luZyB0aGUgc2N1bHB0dXJlIHRvIG1lcmdlIHNvbWUgc3RhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIC0gVGhlIHN0YXRlIHVwZGF0ZSB0byBtZXJnZVxuICAgKi9cbiAgc2VuZE1lcmdlU3RhdGUoc3RhdGUpIHtcbiAgICB0aGlzLl9kaXNwYXRjaChTY3VscHR1cmVBY3Rpb25DcmVhdG9yLk1FUkdFX1NUQVRFLCBzdGF0ZSk7XG4gIH1cblxuICBzZW5kU3RhcnRHYW1lKGdhbWUpIHtcbiAgICB0aGlzLl9kaXNwYXRjaChTY3VscHR1cmVBY3Rpb25DcmVhdG9yLlNUQVJUX0dBTUUsIHtcbiAgICAgIGdhbWU6IGdhbWVcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmRTdGFydE5leHRHYW1lKGdhbWUpIHtcbiAgICB0aGlzLl9kaXNwYXRjaChTY3VscHR1cmVBY3Rpb25DcmVhdG9yLlNUQVJUX05FWFRfR0FNRSk7XG4gIH1cblxuICBzZW5kU3RhcnRNb2xlR2FtZSgpIHtcbiAgICB0aGlzLnNlbmRTdGFydEdhbWUoR0FNRVMuTU9MRSk7XG4gIH1cblxuICBzZW5kU3RhcnREaXNrR2FtZSgpIHtcbiAgICB0aGlzLnNlbmRTdGFydEdhbWUoR0FNRVMuRElTSyk7XG4gIH1cblxuICBzZW5kU3RhcnRTaW1vbkdhbWUoKSB7XG4gICAgdGhpcy5zZW5kU3RhcnRHYW1lKEdBTUVTLlNJTU9OKTtcbiAgfVxuXG4gIHNlbmRSZXN0b3JlU3RhdHVzKCkge1xuICAgIHRoaXMuX2Rpc3BhdGNoKFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IuUkVTVE9SRV9TVEFUVVMpO1xuICB9XG5cbiAgc2VuZEFuaW1hdGlvbkZyYW1lKGZyYW1lQ2FsbGJhY2spIHtcbiAgICB0aGlzLl9kaXNwYXRjaChTY3VscHR1cmVBY3Rpb25DcmVhdG9yLkFOSU1BVElPTl9GUkFNRSwge1xuICAgICAgY2FsbGJhY2s6IGZyYW1lQ2FsbGJhY2tcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmRGaW5pc2hTdGF0dXNBbmltYXRpb24oKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2goU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5GSU5JU0hfU1RBVFVTX0FOSU1BVElPTik7XG4gIH1cblxuICBzZW5kSGFuZHNoYWtlQWN0aXZhdGUodXNlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoKFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IuSEFORFNIQUtFX0FDVElWQVRFLCB7XG4gICAgICB1c2VyOiB1c2VyXG4gICAgfSk7XG4gIH1cblxuICBzZW5kSGFuZHNoYWtlRGVhY3RpdmF0ZSh1c2VyKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2goU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5IQU5EU0hBS0VfREVBQ1RJVkFURSwge1xuICAgICAgdXNlcjogdXNlclxuICAgIH0pO1xuICB9XG59XG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
