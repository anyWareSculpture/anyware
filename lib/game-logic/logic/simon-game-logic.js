'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _panelsActionCreator = require('../actions/panels-action-creator');

var _panelsActionCreator2 = _interopRequireDefault(_panelsActionCreator);

var _sculptureActionCreator = require('../actions/sculpture-action-creator');

var _sculptureActionCreator2 = _interopRequireDefault(_sculptureActionCreator);

var _simonGameActionCreator = require('../actions/simon-game-action-creator');

var _simonGameActionCreator2 = _interopRequireDefault(_simonGameActionCreator);

var _panelAnimation = require('../animation/panel-animation');

var _panelAnimation2 = _interopRequireDefault(_panelAnimation);

var _normalizeStripFrame = require('../animation/normalize-strip-frame');

var _normalizeStripFrame2 = _interopRequireDefault(_normalizeStripFrame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_LEVEL = 0;

var SimonGameLogic = function () {
  function SimonGameLogic(store, config) {
    _classCallCheck(this, SimonGameLogic);

    this.store = store;
    this.config = config;
    this.gameConfig = this.config.SIMON_GAME;

    this.simonGameActionCreator = new _simonGameActionCreator2.default(this.store.dispatcher);
    this.sculptureActionCreator = new _sculptureActionCreator2.default(this.store.dispatcher);

    this._targetSequenceIndex = 0;
    this._targetSequence = null;
    this._receivedInput = false;

    this._inputTimeout = null;
    this._replayTimeout = null;
  }
  // These are automatically added to the sculpture store


  _createClass(SimonGameLogic, [{
    key: 'start',
    value: function start() {
      this.data.set('level', DEFAULT_LEVEL);
      this._playCurrentSequence();
    }
  }, {
    key: 'end',
    value: function end() {
      var lights = this.store.data.get('lights');
      lights.deactivateAll();
      this.config.LIGHTS.GAME_STRIPS.forEach(function (id) {
        return lights.setIntensity(id, null, 0);
      });
    }
  }, {
    key: 'handleActionPayload',
    value: function handleActionPayload(payload) {
      var _actionHandlers;

      var actionHandlers = (_actionHandlers = {}, _defineProperty(_actionHandlers, _panelsActionCreator2.default.PANEL_PRESSED, this._actionPanelPressed.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.FINISH_STATUS_ANIMATION, this._actionFinishStatusAnimation.bind(this)), _defineProperty(_actionHandlers, _simonGameActionCreator2.default.REPLAY_SIMON_PATTERN, this._actionReplaySimonPattern.bind(this)), _actionHandlers);

      var actionHandler = actionHandlers[payload.actionType];
      if (actionHandler) {
        actionHandler(payload);
      }
    }
  }, {
    key: '_actionReplaySimonPattern',
    value: function _actionReplaySimonPattern(payload) {
      if (!this._complete) {
        this._playCurrentSequence();
      }
    }
  }, {
    key: '_actionFinishStatusAnimation',
    value: function _actionFinishStatusAnimation(payload) {
      var _this = this;

      if (this._complete) {
        setTimeout(function () {
          return _this.sculptureActionCreator.sendStartNextGame();
        }, this.gameConfig.TRANSITION_OUT_TIME);
      } else {
        this._playCurrentSequence();
      }
    }
  }, {
    key: '_actionPanelPressed',
    value: function _actionPanelPressed(payload) {
      if (this._complete || !this.store.isReady) {
        return;
      }

      var stripId = payload.stripId;
      var panelId = payload.panelId;
      var pressed = payload.pressed;
      var _currentLevelData = this._currentLevelData;
      var targetStripId = _currentLevelData.stripId;
      var panelSequence = _currentLevelData.panelSequence;


      if (pressed) {
        this._lights.setColor(stripId, panelId, this.userColor);
        this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);
      } else {
        this._lights.setDefaultColor(stripId, panelId);
        this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.INACTIVE_INTENSITY);
      }

      var panelUp = !pressed;
      if (!panelUp || targetStripId !== stripId) {
        return;
      }

      if (!this._receivedInput) {
        this._receivedInput = true;
        this._targetSequence = new Set(panelSequence[this._targetSequenceIndex]);

        this._setInputTimeout();
      }

      if (!this._targetSequence.has(panelId)) {
        this.store.setFailureStatus();
        return;
      }

      this._targetSequence.delete(panelId);

      if (!this._targetSequence.length) {
        this._targetSequenceIndex += 1;
      }

      if (this._targetSequenceIndex >= panelSequence.length) {
        this._winLevel();
      } else {
        this._targetSequence = new Set(panelSequence[this._targetSequenceIndex]);
      }
    }
  }, {
    key: '_setInputTimeout',
    value: function _setInputTimeout() {
      var _this2 = this;

      clearTimeout(this._inputTimeout);

      var level = this._level;
      this._inputTimeout = setTimeout(function () {
        if (_this2.isReadyAndNotAnimating && _this2._receivedInput && _this2._level === level) {
          _this2.simonGameActionCreator.sendReplaySimonPattern();
        }
      }, this.gameConfig.INPUT_TIMEOUT);
    }
  }, {
    key: '_discardInput',
    value: function _discardInput() {
      this._targetSequenceIndex = 0;
      this._targetSequence = null;
      this._receivedInput = false;
    }
  }, {
    key: '_winLevel',
    value: function _winLevel() {
      this.store.data.get('lights').deactivateAll();
      this._lights.setIntensity(this._currentLevelData.stripId, null, 0);

      this.store.setSuccessStatus();

      var level = this._level + 1;
      if (level >= this._levels) {
        this._complete = true;
      }

      this._level = level;
    }
  }, {
    key: '_playCurrentSequence',
    value: function _playCurrentSequence() {
      var _currentLevelData2 = this._currentLevelData;
      var stripId = _currentLevelData2.stripId;
      var panelSequence = _currentLevelData2.panelSequence;
      var frameDelay = _currentLevelData2.frameDelay;


      this._playSequence(stripId, panelSequence, frameDelay);
    }
  }, {
    key: '_playSequence',
    value: function _playSequence(stripId, panelSequence, frameDelay) {
      var _this3 = this;

      this._discardInput();

      var frames = panelSequence.map(function (panelIds) {
        return _this3._createSequenceFrame(stripId, panelIds, frameDelay);
      });
      frames.push(this._createLastSequenceFrame(stripId, frameDelay));
      var animation = new _panelAnimation2.default(frames, this._finishPlaySequence.bind(this));

      this.store.playAnimation(animation);
    }
  }, {
    key: '_createSequenceFrame',
    value: function _createSequenceFrame(stripId, panelIds, frameDelay) {
      var _this4 = this;

      return this._createFrame(stripId, frameDelay, function () {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = panelIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var panelId = _step.value;

            _this4._lights.setIntensity(stripId, panelId, _this4.gameConfig.TARGET_PANEL_INTENSITY);
            _this4._lights.setColor(stripId, panelId, _this4.gameConfig.DEFAULT_SIMON_PANEL_COLOR);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
    }
  }, {
    key: '_createLastSequenceFrame',
    value: function _createLastSequenceFrame(stripId, frameDelay) {
      return this._createFrame(stripId, frameDelay, function () {});
    }
  }, {
    key: '_createFrame',
    value: function _createFrame(stripId, frameDelay, callback) {
      return new _normalizeStripFrame2.default(this._lights, stripId, this.gameConfig.DEFAULT_SIMON_PANEL_COLOR, this.gameConfig.AVAILABLE_PANEL_INTENSITY, callback, frameDelay !== undefined ? frameDelay : this.gameConfig.SEQUENCE_ANIMATION_FRAME_DELAY);
    }
  }, {
    key: '_finishPlaySequence',
    value: function _finishPlaySequence() {
      var _this5 = this;

      clearTimeout(this._replayTimeout);

      var level = this._level;
      this._replayTimeout = setTimeout(function () {
        if (_this5.isReadyAndNotAnimating && !_this5._receivedInput && _this5._level === level) {
          _this5.simonGameActionCreator.sendReplaySimonPattern();
        }
      }, this.gameConfig.DELAY_BETWEEN_PLAYS);
    }
  }, {
    key: 'data',
    get: function get() {
      return this.store.data.get('simon');
    }
  }, {
    key: '_lights',
    get: function get() {
      return this.store.data.get('lights');
    }
  }, {
    key: 'complete',
    get: function get() {
      return this._complete;
    }
  }, {
    key: 'currentStrip',
    get: function get() {
      return this._currentLevelData && this._currentLevelData.stripId;
    }
  }, {
    key: '_levels',
    get: function get() {
      return this.gameConfig.PATTERN_LEVELS.length;
    }
  }, {
    key: '_currentLevelData',
    get: function get() {
      var level = this._level;
      return this.gameConfig.PATTERN_LEVELS[level];
    }
  }, {
    key: '_level',
    get: function get() {
      return this.data.get('level');
    },
    set: function set(value) {
      return this.data.set('level', value);
    }
  }, {
    key: 'isReadyAndNotAnimating',
    get: function get() {
      return this.store.isReady && !this.store.isPanelAnimationRunning;
    }
  }]);

  return SimonGameLogic;
}();

SimonGameLogic.trackedProperties = {
  level: DEFAULT_LEVEL
};
exports.default = SimonGameLogic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvbG9naWMvc2ltb24tZ2FtZS1sb2dpYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxJQUFNLGdCQUFnQixDQUF0Qjs7SUFFcUIsYztBQU1uQiwwQkFBWSxLQUFaLEVBQW1CLE1BQW5CLEVBQTJCO0FBQUE7O0FBQ3pCLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEtBQUssTUFBTCxDQUFZLFVBQTlCOztBQUVBLFNBQUssc0JBQUwsR0FBOEIscUNBQTJCLEtBQUssS0FBTCxDQUFXLFVBQXRDLENBQTlCO0FBQ0EsU0FBSyxzQkFBTCxHQUE4QixxQ0FBMkIsS0FBSyxLQUFMLENBQVcsVUFBdEMsQ0FBOUI7O0FBRUEsU0FBSyxvQkFBTCxHQUE0QixDQUE1QjtBQUNBLFNBQUssZUFBTCxHQUF1QixJQUF2QjtBQUNBLFNBQUssY0FBTCxHQUFzQixLQUF0Qjs7QUFFQSxTQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxTQUFLLGNBQUwsR0FBc0IsSUFBdEI7QUFDRDs7Ozs7OzRCQVVPO0FBQ04sV0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLE9BQWQsRUFBdUIsYUFBdkI7QUFDQSxXQUFLLG9CQUFMO0FBQ0Q7OzswQkFFSztBQUNKLFVBQUksU0FBUyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEdBQWhCLENBQW9CLFFBQXBCLENBQWI7QUFDQSxhQUFPLGFBQVA7QUFDQSxXQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLFdBQW5CLENBQStCLE9BQS9CLENBQXVDLFVBQUMsRUFBRDtBQUFBLGVBQVEsT0FBTyxZQUFQLENBQW9CLEVBQXBCLEVBQXdCLElBQXhCLEVBQThCLENBQTlCLENBQVI7QUFBQSxPQUF2QztBQUNEOzs7d0NBVW1CLE8sRUFBUztBQUFBOztBQUMzQixV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Q0FBVyx1QkFBekM7QUFDRDs7Ozs7O0FBaE9rQixjLENBRVosaUIsR0FBb0I7QUFDekIsU0FBTztBQURrQixDO2tCQUZSLGMiLCJmaWxlIjoiZ2FtZS1sb2dpYy9sb2dpYy9zaW1vbi1nYW1lLWxvZ2ljLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBhbmVsc0FjdGlvbkNyZWF0b3IgZnJvbSAnLi4vYWN0aW9ucy9wYW5lbHMtYWN0aW9uLWNyZWF0b3InO1xuaW1wb3J0IFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IgZnJvbSAnLi4vYWN0aW9ucy9zY3VscHR1cmUtYWN0aW9uLWNyZWF0b3InO1xuaW1wb3J0IFNpbW9uR2FtZUFjdGlvbkNyZWF0b3IgZnJvbSAnLi4vYWN0aW9ucy9zaW1vbi1nYW1lLWFjdGlvbi1jcmVhdG9yJztcbmltcG9ydCBQYW5lbEFuaW1hdGlvbiBmcm9tICcuLi9hbmltYXRpb24vcGFuZWwtYW5pbWF0aW9uJztcbmltcG9ydCBOb3JtYWxpemVTdHJpcEZyYW1lIGZyb20gJy4uL2FuaW1hdGlvbi9ub3JtYWxpemUtc3RyaXAtZnJhbWUnO1xuXG5jb25zdCBERUZBVUxUX0xFVkVMID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2ltb25HYW1lTG9naWMge1xuICAvLyBUaGVzZSBhcmUgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgc2N1bHB0dXJlIHN0b3JlXG4gIHN0YXRpYyB0cmFja2VkUHJvcGVydGllcyA9IHtcbiAgICBsZXZlbDogREVGQVVMVF9MRVZFTFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JlLCBjb25maWcpIHtcbiAgICB0aGlzLnN0b3JlID0gc3RvcmU7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5nYW1lQ29uZmlnID0gdGhpcy5jb25maWcuU0lNT05fR0FNRTtcblxuICAgIHRoaXMuc2ltb25HYW1lQWN0aW9uQ3JlYXRvciA9IG5ldyBTaW1vbkdhbWVBY3Rpb25DcmVhdG9yKHRoaXMuc3RvcmUuZGlzcGF0Y2hlcik7XG4gICAgdGhpcy5zY3VscHR1cmVBY3Rpb25DcmVhdG9yID0gbmV3IFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IodGhpcy5zdG9yZS5kaXNwYXRjaGVyKTtcblxuICAgIHRoaXMuX3RhcmdldFNlcXVlbmNlSW5kZXggPSAwO1xuICAgIHRoaXMuX3RhcmdldFNlcXVlbmNlID0gbnVsbDtcbiAgICB0aGlzLl9yZWNlaXZlZElucHV0ID0gZmFsc2U7XG5cbiAgICB0aGlzLl9pbnB1dFRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMuX3JlcGxheVRpbWVvdXQgPSBudWxsO1xuICB9XG5cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZGF0YS5nZXQoJ3NpbW9uJyk7XG4gIH1cblxuICBnZXQgX2xpZ2h0cygpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5kYXRhLmdldCgnbGlnaHRzJyk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLmRhdGEuc2V0KCdsZXZlbCcsIERFRkFVTFRfTEVWRUwpO1xuICAgIHRoaXMuX3BsYXlDdXJyZW50U2VxdWVuY2UoKTtcbiAgfVxuXG4gIGVuZCgpIHtcbiAgICBsZXQgbGlnaHRzID0gdGhpcy5zdG9yZS5kYXRhLmdldCgnbGlnaHRzJyk7XG4gICAgbGlnaHRzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICB0aGlzLmNvbmZpZy5MSUdIVFMuR0FNRV9TVFJJUFMuZm9yRWFjaCgoaWQpID0+IGxpZ2h0cy5zZXRJbnRlbnNpdHkoaWQsIG51bGwsIDApKTtcbiAgfVxuXG4gIGdldCBjb21wbGV0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGxldGU7XG4gIH1cblxuICBnZXQgY3VycmVudFN0cmlwKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TGV2ZWxEYXRhICYmIHRoaXMuX2N1cnJlbnRMZXZlbERhdGEuc3RyaXBJZDtcbiAgfVxuXG4gIGhhbmRsZUFjdGlvblBheWxvYWQocGF5bG9hZCkge1xuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXJzID0ge1xuICAgICAgW1BhbmVsc0FjdGlvbkNyZWF0b3IuUEFORUxfUFJFU1NFRF06IHRoaXMuX2FjdGlvblBhbmVsUHJlc3NlZC5iaW5kKHRoaXMpLFxuICAgICAgW1NjdWxwdHVyZUFjdGlvbkNyZWF0b3IuRklOSVNIX1NUQVRVU19BTklNQVRJT05dOiB0aGlzLl9hY3Rpb25GaW5pc2hTdGF0dXNBbmltYXRpb24uYmluZCh0aGlzKSxcbiAgICAgIFtTaW1vbkdhbWVBY3Rpb25DcmVhdG9yLlJFUExBWV9TSU1PTl9QQVRURVJOXTogdGhpcy5fYWN0aW9uUmVwbGF5U2ltb25QYXR0ZXJuLmJpbmQodGhpcylcbiAgICB9O1xuXG4gICAgY29uc3QgYWN0aW9uSGFuZGxlciA9IGFjdGlvbkhhbmRsZXJzW3BheWxvYWQuYWN0aW9uVHlwZV07XG4gICAgaWYgKGFjdGlvbkhhbmRsZXIpIHtcbiAgICAgIGFjdGlvbkhhbmRsZXIocGF5bG9hZCk7XG4gICAgfVxuICB9XG5cbiAgX2FjdGlvblJlcGxheVNpbW9uUGF0dGVybihwYXlsb2FkKSB7XG4gICAgaWYgKCF0aGlzLl9jb21wbGV0ZSkge1xuICAgICAgdGhpcy5fcGxheUN1cnJlbnRTZXF1ZW5jZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9hY3Rpb25GaW5pc2hTdGF0dXNBbmltYXRpb24ocGF5bG9hZCkge1xuICAgIGlmICh0aGlzLl9jb21wbGV0ZSkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnNjdWxwdHVyZUFjdGlvbkNyZWF0b3Iuc2VuZFN0YXJ0TmV4dEdhbWUoKSwgdGhpcy5nYW1lQ29uZmlnLlRSQU5TSVRJT05fT1VUX1RJTUUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX3BsYXlDdXJyZW50U2VxdWVuY2UoKTtcbiAgICB9XG4gIH1cblxuICBfYWN0aW9uUGFuZWxQcmVzc2VkKHBheWxvYWQpIHtcbiAgICBpZiAodGhpcy5fY29tcGxldGUgfHwgIXRoaXMuc3RvcmUuaXNSZWFkeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtzdHJpcElkLCBwYW5lbElkLCBwcmVzc2VkfSA9IHBheWxvYWQ7XG4gICAgY29uc3Qge3N0cmlwSWQ6IHRhcmdldFN0cmlwSWQsIHBhbmVsU2VxdWVuY2V9ID0gdGhpcy5fY3VycmVudExldmVsRGF0YTtcblxuICAgIGlmIChwcmVzc2VkKSB7XG4gICAgICB0aGlzLl9saWdodHMuc2V0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy51c2VyQ29sb3IpO1xuICAgICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCB0aGlzLmNvbmZpZy5QQU5FTF9ERUZBVUxUUy5BQ1RJVkVfSU5URU5TSVRZKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9saWdodHMuc2V0RGVmYXVsdENvbG9yKHN0cmlwSWQsIHBhbmVsSWQpO1xuICAgICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCB0aGlzLmNvbmZpZy5QQU5FTF9ERUZBVUxUUy5JTkFDVElWRV9JTlRFTlNJVFkpO1xuICAgIH1cblxuXG4gICAgY29uc3QgcGFuZWxVcCA9ICFwcmVzc2VkO1xuICAgIGlmICghcGFuZWxVcCB8fCB0YXJnZXRTdHJpcElkICE9PSBzdHJpcElkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9yZWNlaXZlZElucHV0KSB7XG4gICAgICB0aGlzLl9yZWNlaXZlZElucHV0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3RhcmdldFNlcXVlbmNlID0gbmV3IFNldChwYW5lbFNlcXVlbmNlW3RoaXMuX3RhcmdldFNlcXVlbmNlSW5kZXhdKTtcblxuICAgICAgdGhpcy5fc2V0SW5wdXRUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl90YXJnZXRTZXF1ZW5jZS5oYXMocGFuZWxJZCkpIHtcbiAgICAgIHRoaXMuc3RvcmUuc2V0RmFpbHVyZVN0YXR1cygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3RhcmdldFNlcXVlbmNlLmRlbGV0ZShwYW5lbElkKTtcblxuICAgIGlmICghdGhpcy5fdGFyZ2V0U2VxdWVuY2UubGVuZ3RoKSB7XG4gICAgICB0aGlzLl90YXJnZXRTZXF1ZW5jZUluZGV4ICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3RhcmdldFNlcXVlbmNlSW5kZXggPj0gcGFuZWxTZXF1ZW5jZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX3dpbkxldmVsKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fdGFyZ2V0U2VxdWVuY2UgPSBuZXcgU2V0KHBhbmVsU2VxdWVuY2VbdGhpcy5fdGFyZ2V0U2VxdWVuY2VJbmRleF0pO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRJbnB1dFRpbWVvdXQoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lucHV0VGltZW91dCk7XG5cbiAgICBjb25zdCBsZXZlbCA9IHRoaXMuX2xldmVsO1xuICAgIHRoaXMuX2lucHV0VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNSZWFkeUFuZE5vdEFuaW1hdGluZyAmJiB0aGlzLl9yZWNlaXZlZElucHV0ICYmIHRoaXMuX2xldmVsID09PSBsZXZlbCkge1xuICAgICAgICB0aGlzLnNpbW9uR2FtZUFjdGlvbkNyZWF0b3Iuc2VuZFJlcGxheVNpbW9uUGF0dGVybigpO1xuICAgICAgfVxuICAgIH0sIHRoaXMuZ2FtZUNvbmZpZy5JTlBVVF9USU1FT1VUKTtcbiAgfVxuXG4gIF9kaXNjYXJkSW5wdXQoKSB7XG4gICAgdGhpcy5fdGFyZ2V0U2VxdWVuY2VJbmRleCA9IDA7XG4gICAgdGhpcy5fdGFyZ2V0U2VxdWVuY2UgPSBudWxsO1xuICAgIHRoaXMuX3JlY2VpdmVkSW5wdXQgPSBmYWxzZTtcbiAgfVxuXG4gIF93aW5MZXZlbCgpIHtcbiAgICB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdsaWdodHMnKS5kZWFjdGl2YXRlQWxsKCk7XG4gICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eSh0aGlzLl9jdXJyZW50TGV2ZWxEYXRhLnN0cmlwSWQsIG51bGwsIDApO1xuXG4gICAgdGhpcy5zdG9yZS5zZXRTdWNjZXNzU3RhdHVzKCk7XG5cbiAgICBsZXQgbGV2ZWwgPSB0aGlzLl9sZXZlbCArIDE7XG4gICAgaWYgKGxldmVsID49IHRoaXMuX2xldmVscykge1xuICAgICAgdGhpcy5fY29tcGxldGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX2xldmVsID0gbGV2ZWw7XG4gIH1cblxuICBfcGxheUN1cnJlbnRTZXF1ZW5jZSgpIHtcbiAgICBjb25zdCB7c3RyaXBJZCwgcGFuZWxTZXF1ZW5jZSwgZnJhbWVEZWxheX0gPSB0aGlzLl9jdXJyZW50TGV2ZWxEYXRhO1xuXG4gICAgdGhpcy5fcGxheVNlcXVlbmNlKHN0cmlwSWQsIHBhbmVsU2VxdWVuY2UsIGZyYW1lRGVsYXkpO1xuICB9XG5cbiAgX3BsYXlTZXF1ZW5jZShzdHJpcElkLCBwYW5lbFNlcXVlbmNlLCBmcmFtZURlbGF5KSB7XG4gICAgdGhpcy5fZGlzY2FyZElucHV0KCk7XG5cbiAgICBjb25zdCBmcmFtZXMgPSBwYW5lbFNlcXVlbmNlLm1hcCgocGFuZWxJZHMpID0+IHRoaXMuX2NyZWF0ZVNlcXVlbmNlRnJhbWUoc3RyaXBJZCwgcGFuZWxJZHMsIGZyYW1lRGVsYXkpKTtcbiAgICBmcmFtZXMucHVzaCh0aGlzLl9jcmVhdGVMYXN0U2VxdWVuY2VGcmFtZShzdHJpcElkLCBmcmFtZURlbGF5KSk7XG4gICAgY29uc3QgYW5pbWF0aW9uID0gbmV3IFBhbmVsQW5pbWF0aW9uKGZyYW1lcywgdGhpcy5fZmluaXNoUGxheVNlcXVlbmNlLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5zdG9yZS5wbGF5QW5pbWF0aW9uKGFuaW1hdGlvbik7XG4gIH1cblxuICBfY3JlYXRlU2VxdWVuY2VGcmFtZShzdHJpcElkLCBwYW5lbElkcywgZnJhbWVEZWxheSkge1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVGcmFtZShzdHJpcElkLCBmcmFtZURlbGF5LCAoKSA9PiB7XG4gICAgICBmb3IgKGxldCBwYW5lbElkIG9mIHBhbmVsSWRzKSB7XG4gICAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5nYW1lQ29uZmlnLlRBUkdFVF9QQU5FTF9JTlRFTlNJVFkpO1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5nYW1lQ29uZmlnLkRFRkFVTFRfU0lNT05fUEFORUxfQ09MT1IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2NyZWF0ZUxhc3RTZXF1ZW5jZUZyYW1lKHN0cmlwSWQsIGZyYW1lRGVsYXkpIHtcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRnJhbWUoc3RyaXBJZCwgZnJhbWVEZWxheSwgKCkgPT4ge30pO1xuICB9XG5cbiAgX2NyZWF0ZUZyYW1lKHN0cmlwSWQsIGZyYW1lRGVsYXksIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBOb3JtYWxpemVTdHJpcEZyYW1lKHRoaXMuX2xpZ2h0cywgc3RyaXBJZCxcbiAgICAgIHRoaXMuZ2FtZUNvbmZpZy5ERUZBVUxUX1NJTU9OX1BBTkVMX0NPTE9SLFxuICAgICAgdGhpcy5nYW1lQ29uZmlnLkFWQUlMQUJMRV9QQU5FTF9JTlRFTlNJVFksXG4gICAgICBjYWxsYmFjayxcbiAgICAgIGZyYW1lRGVsYXkgIT09IHVuZGVmaW5lZCA/IGZyYW1lRGVsYXkgOiB0aGlzLmdhbWVDb25maWcuU0VRVUVOQ0VfQU5JTUFUSU9OX0ZSQU1FX0RFTEFZKTtcbiAgfVxuXG4gIF9maW5pc2hQbGF5U2VxdWVuY2UoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlcGxheVRpbWVvdXQpO1xuXG4gICAgY29uc3QgbGV2ZWwgPSB0aGlzLl9sZXZlbDtcbiAgICB0aGlzLl9yZXBsYXlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1JlYWR5QW5kTm90QW5pbWF0aW5nICYmICF0aGlzLl9yZWNlaXZlZElucHV0ICYmIHRoaXMuX2xldmVsID09PSBsZXZlbCkge1xuICAgICAgICB0aGlzLnNpbW9uR2FtZUFjdGlvbkNyZWF0b3Iuc2VuZFJlcGxheVNpbW9uUGF0dGVybigpO1xuICAgICAgfVxuICAgIH0sIHRoaXMuZ2FtZUNvbmZpZy5ERUxBWV9CRVRXRUVOX1BMQVlTKTtcbiAgfVxuXG4gIGdldCBfbGV2ZWxzKCkge1xuICAgIHJldHVybiB0aGlzLmdhbWVDb25maWcuUEFUVEVSTl9MRVZFTFMubGVuZ3RoO1xuICB9XG5cbiAgZ2V0IF9jdXJyZW50TGV2ZWxEYXRhKCkge1xuICAgIGNvbnN0IGxldmVsID0gdGhpcy5fbGV2ZWw7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZUNvbmZpZy5QQVRURVJOX0xFVkVMU1tsZXZlbF07XG4gIH1cblxuICBnZXQgX2xldmVsKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0KCdsZXZlbCcpO1xuICB9XG5cbiAgc2V0IF9sZXZlbCh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuc2V0KCdsZXZlbCcsIHZhbHVlKTtcbiAgfVxuXG4gIGdldCBpc1JlYWR5QW5kTm90QW5pbWF0aW5nKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmlzUmVhZHkgJiYgIXRoaXMuc3RvcmUuaXNQYW5lbEFuaW1hdGlvblJ1bm5pbmc7XG4gIH1cbn1cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
