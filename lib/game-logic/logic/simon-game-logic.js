'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PanelsActionCreator = require('../actions/panels-action-creator');
var SculptureActionCreator = require('../actions/sculpture-action-creator');
var SimonGameActionCreator = require('../actions/simon-game-action-creator');
var PanelAnimation = require('../animation/panel-animation');
var NormalizeStripFrame = require('../animation/normalize-strip-frame');

var DEFAULT_LEVEL = 0;

var SimonGameLogic = function () {
  function SimonGameLogic(store, config) {
    _classCallCheck(this, SimonGameLogic);

    this.store = store;
    this.config = config;
    this.gameConfig = this.config.SIMON_GAME;

    this.simonGameActionCreator = new SimonGameActionCreator(this.store.dispatcher);
    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);

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

      var actionHandlers = (_actionHandlers = {}, _defineProperty(_actionHandlers, PanelsActionCreator.PANEL_PRESSED, this._actionPanelPressed.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.FINISH_STATUS_ANIMATION, this._actionFinishStatusAnimation.bind(this)), _defineProperty(_actionHandlers, SimonGameActionCreator.REPLAY_SIMON_PATTERN, this._actionReplaySimonPattern.bind(this)), _actionHandlers);

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
      var animation = new PanelAnimation(frames, this._finishPlaySequence.bind(this));

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
      return new NormalizeStripFrame(this._lights, stripId, this.gameConfig.DEFAULT_SIMON_PANEL_COLOR, this.gameConfig.AVAILABLE_PANEL_INTENSITY, callback, frameDelay !== undefined ? frameDelay : this.gameConfig.SEQUENCE_ANIMATION_FRAME_DELAY);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvbG9naWMvc2ltb24tZ2FtZS1sb2dpYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLHNCQUFzQixRQUFRLGtDQUFSLENBQTVCO0FBQ0EsSUFBTSx5QkFBeUIsUUFBUSxxQ0FBUixDQUEvQjtBQUNBLElBQU0seUJBQXlCLFFBQVEsc0NBQVIsQ0FBL0I7QUFDQSxJQUFNLGlCQUFpQixRQUFRLDhCQUFSLENBQXZCO0FBQ0EsSUFBTSxzQkFBc0IsUUFBUSxvQ0FBUixDQUE1Qjs7QUFFQSxJQUFNLGdCQUFnQixDQUF0Qjs7SUFFcUIsYztBQU1uQiwwQkFBWSxLQUFaLEVBQW1CLE1BQW5CLEVBQTJCO0FBQUE7O0FBQ3pCLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEtBQUssTUFBTCxDQUFZLFVBQTlCOztBQUVBLFNBQUssc0JBQUwsR0FBOEIsSUFBSSxzQkFBSixDQUEyQixLQUFLLEtBQUwsQ0FBVyxVQUF0QyxDQUE5QjtBQUNBLFNBQUssc0JBQUwsR0FBOEIsSUFBSSxzQkFBSixDQUEyQixLQUFLLEtBQUwsQ0FBVyxVQUF0QyxDQUE5Qjs7QUFFQSxTQUFLLG9CQUFMLEdBQTRCLENBQTVCO0FBQ0EsU0FBSyxlQUFMLEdBQXVCLElBQXZCO0FBQ0EsU0FBSyxjQUFMLEdBQXNCLEtBQXRCOztBQUVBLFNBQUssYUFBTCxHQUFxQixJQUFyQjtBQUNBLFNBQUssY0FBTCxHQUFzQixJQUF0QjtBQUNEOzs7Ozs7NEJBVU87QUFDTixXQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsT0FBZCxFQUF1QixhQUF2QjtBQUNBLFdBQUssb0JBQUw7QUFDRDs7OzBCQUVLO0FBQ0osVUFBSSxTQUFTLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBb0IsUUFBcEIsQ0FBYjtBQUNBLGFBQU8sYUFBUDtBQUNBLFdBQUssTUFBTCxDQUFZLE1B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QUFVLEdBQVYsQ0FBYyxPQUFkLENBQVA7QUFDRCxLO3NCQUVVLEssRUFBTztBQUNoQixhQUFPLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxPQUFkLEVBQXVCLEtBQXZCLENBQVA7QUFDRDs7O3dCQUU0QjtBQUMzQixhQUFPLEtBQUssS0FBTCxDQUFXLE9BQVgsSUFBc0IsQ0FBQyxLQUFLLEtBQUwsQ0FBVyx1QkFBekM7QUFDRDs7Ozs7O0FBaE9rQixjLENBRVosaUIsR0FBb0I7QUFDekIsU0FBTztBQURrQixDO2tCQUZSLGMiLCJmaWxlIjoiZ2FtZS1sb2dpYy9sb2dpYy9zaW1vbi1nYW1lLWxvZ2ljLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGFuZWxzQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvcGFuZWxzLWFjdGlvbi1jcmVhdG9yJyk7XG5jb25zdCBTY3VscHR1cmVBY3Rpb25DcmVhdG9yID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9zY3VscHR1cmUtYWN0aW9uLWNyZWF0b3InKTtcbmNvbnN0IFNpbW9uR2FtZUFjdGlvbkNyZWF0b3IgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3NpbW9uLWdhbWUtYWN0aW9uLWNyZWF0b3InKTtcbmNvbnN0IFBhbmVsQW5pbWF0aW9uID0gcmVxdWlyZSgnLi4vYW5pbWF0aW9uL3BhbmVsLWFuaW1hdGlvbicpO1xuY29uc3QgTm9ybWFsaXplU3RyaXBGcmFtZSA9IHJlcXVpcmUoJy4uL2FuaW1hdGlvbi9ub3JtYWxpemUtc3RyaXAtZnJhbWUnKTtcblxuY29uc3QgREVGQVVMVF9MRVZFTCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbW9uR2FtZUxvZ2ljIHtcbiAgLy8gVGhlc2UgYXJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgdG8gdGhlIHNjdWxwdHVyZSBzdG9yZVxuICBzdGF0aWMgdHJhY2tlZFByb3BlcnRpZXMgPSB7XG4gICAgbGV2ZWw6IERFRkFVTFRfTEVWRUxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihzdG9yZSwgY29uZmlnKSB7XG4gICAgdGhpcy5zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuZ2FtZUNvbmZpZyA9IHRoaXMuY29uZmlnLlNJTU9OX0dBTUU7XG5cbiAgICB0aGlzLnNpbW9uR2FtZUFjdGlvbkNyZWF0b3IgPSBuZXcgU2ltb25HYW1lQWN0aW9uQ3JlYXRvcih0aGlzLnN0b3JlLmRpc3BhdGNoZXIpO1xuICAgIHRoaXMuc2N1bHB0dXJlQWN0aW9uQ3JlYXRvciA9IG5ldyBTY3VscHR1cmVBY3Rpb25DcmVhdG9yKHRoaXMuc3RvcmUuZGlzcGF0Y2hlcik7XG5cbiAgICB0aGlzLl90YXJnZXRTZXF1ZW5jZUluZGV4ID0gMDtcbiAgICB0aGlzLl90YXJnZXRTZXF1ZW5jZSA9IG51bGw7XG4gICAgdGhpcy5fcmVjZWl2ZWRJbnB1dCA9IGZhbHNlO1xuXG4gICAgdGhpcy5faW5wdXRUaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLl9yZXBsYXlUaW1lb3V0ID0gbnVsbDtcbiAgfVxuXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdzaW1vbicpO1xuICB9XG5cbiAgZ2V0IF9saWdodHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZGF0YS5nZXQoJ2xpZ2h0cycpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5kYXRhLnNldCgnbGV2ZWwnLCBERUZBVUxUX0xFVkVMKTtcbiAgICB0aGlzLl9wbGF5Q3VycmVudFNlcXVlbmNlKCk7XG4gIH1cblxuICBlbmQoKSB7XG4gICAgbGV0IGxpZ2h0cyA9IHRoaXMuc3RvcmUuZGF0YS5nZXQoJ2xpZ2h0cycpO1xuICAgIGxpZ2h0cy5kZWFjdGl2YXRlQWxsKCk7XG4gICAgdGhpcy5jb25maWcuTElHSFRTLkdBTUVfU1RSSVBTLmZvckVhY2goKGlkKSA9PiBsaWdodHMuc2V0SW50ZW5zaXR5KGlkLCBudWxsLCAwKSk7XG4gIH1cblxuICBnZXQgY29tcGxldGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBsZXRlO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRTdHJpcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudExldmVsRGF0YSAmJiB0aGlzLl9jdXJyZW50TGV2ZWxEYXRhLnN0cmlwSWQ7XG4gIH1cblxuICBoYW5kbGVBY3Rpb25QYXlsb2FkKHBheWxvYWQpIHtcbiAgICBjb25zdCBhY3Rpb25IYW5kbGVycyA9IHtcbiAgICAgIFtQYW5lbHNBY3Rpb25DcmVhdG9yLlBBTkVMX1BSRVNTRURdOiB0aGlzLl9hY3Rpb25QYW5lbFByZXNzZWQuYmluZCh0aGlzKSxcbiAgICAgIFtTY3VscHR1cmVBY3Rpb25DcmVhdG9yLkZJTklTSF9TVEFUVVNfQU5JTUFUSU9OXTogdGhpcy5fYWN0aW9uRmluaXNoU3RhdHVzQW5pbWF0aW9uLmJpbmQodGhpcyksXG4gICAgICBbU2ltb25HYW1lQWN0aW9uQ3JlYXRvci5SRVBMQVlfU0lNT05fUEFUVEVSTl06IHRoaXMuX2FjdGlvblJlcGxheVNpbW9uUGF0dGVybi5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXIgPSBhY3Rpb25IYW5kbGVyc1twYXlsb2FkLmFjdGlvblR5cGVdO1xuICAgIGlmIChhY3Rpb25IYW5kbGVyKSB7XG4gICAgICBhY3Rpb25IYW5kbGVyKHBheWxvYWQpO1xuICAgIH1cbiAgfVxuXG4gIF9hY3Rpb25SZXBsYXlTaW1vblBhdHRlcm4ocGF5bG9hZCkge1xuICAgIGlmICghdGhpcy5fY29tcGxldGUpIHtcbiAgICAgIHRoaXMuX3BsYXlDdXJyZW50U2VxdWVuY2UoKTtcbiAgICB9XG4gIH1cblxuICBfYWN0aW9uRmluaXNoU3RhdHVzQW5pbWF0aW9uKHBheWxvYWQpIHtcbiAgICBpZiAodGhpcy5fY29tcGxldGUpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zY3VscHR1cmVBY3Rpb25DcmVhdG9yLnNlbmRTdGFydE5leHRHYW1lKCksIHRoaXMuZ2FtZUNvbmZpZy5UUkFOU0lUSU9OX09VVF9USU1FKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9wbGF5Q3VycmVudFNlcXVlbmNlKCk7XG4gICAgfVxuICB9XG5cbiAgX2FjdGlvblBhbmVsUHJlc3NlZChwYXlsb2FkKSB7XG4gICAgaWYgKHRoaXMuX2NvbXBsZXRlIHx8ICF0aGlzLnN0b3JlLmlzUmVhZHkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7c3RyaXBJZCwgcGFuZWxJZCwgcHJlc3NlZH0gPSBwYXlsb2FkO1xuICAgIGNvbnN0IHtzdHJpcElkOiB0YXJnZXRTdHJpcElkLCBwYW5lbFNlcXVlbmNlfSA9IHRoaXMuX2N1cnJlbnRMZXZlbERhdGE7XG5cbiAgICBpZiAocHJlc3NlZCkge1xuICAgICAgdGhpcy5fbGlnaHRzLnNldENvbG9yKHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMudXNlckNvbG9yKTtcbiAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5jb25maWcuUEFORUxfREVGQVVMVFMuQUNUSVZFX0lOVEVOU0lUWSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fbGlnaHRzLnNldERlZmF1bHRDb2xvcihzdHJpcElkLCBwYW5lbElkKTtcbiAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5jb25maWcuUEFORUxfREVGQVVMVFMuSU5BQ1RJVkVfSU5URU5TSVRZKTtcbiAgICB9XG5cblxuICAgIGNvbnN0IHBhbmVsVXAgPSAhcHJlc3NlZDtcbiAgICBpZiAoIXBhbmVsVXAgfHwgdGFyZ2V0U3RyaXBJZCAhPT0gc3RyaXBJZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fcmVjZWl2ZWRJbnB1dCkge1xuICAgICAgdGhpcy5fcmVjZWl2ZWRJbnB1dCA9IHRydWU7XG4gICAgICB0aGlzLl90YXJnZXRTZXF1ZW5jZSA9IG5ldyBTZXQocGFuZWxTZXF1ZW5jZVt0aGlzLl90YXJnZXRTZXF1ZW5jZUluZGV4XSk7XG5cbiAgICAgIHRoaXMuX3NldElucHV0VGltZW91dCgpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fdGFyZ2V0U2VxdWVuY2UuaGFzKHBhbmVsSWQpKSB7XG4gICAgICB0aGlzLnN0b3JlLnNldEZhaWx1cmVTdGF0dXMoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl90YXJnZXRTZXF1ZW5jZS5kZWxldGUocGFuZWxJZCk7XG5cbiAgICBpZiAoIXRoaXMuX3RhcmdldFNlcXVlbmNlLmxlbmd0aCkge1xuICAgICAgdGhpcy5fdGFyZ2V0U2VxdWVuY2VJbmRleCArPSAxO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl90YXJnZXRTZXF1ZW5jZUluZGV4ID49IHBhbmVsU2VxdWVuY2UubGVuZ3RoKSB7XG4gICAgICB0aGlzLl93aW5MZXZlbCgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX3RhcmdldFNlcXVlbmNlID0gbmV3IFNldChwYW5lbFNlcXVlbmNlW3RoaXMuX3RhcmdldFNlcXVlbmNlSW5kZXhdKTtcbiAgICB9XG4gIH1cblxuICBfc2V0SW5wdXRUaW1lb3V0KCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pbnB1dFRpbWVvdXQpO1xuXG4gICAgY29uc3QgbGV2ZWwgPSB0aGlzLl9sZXZlbDtcbiAgICB0aGlzLl9pbnB1dFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzUmVhZHlBbmROb3RBbmltYXRpbmcgJiYgdGhpcy5fcmVjZWl2ZWRJbnB1dCAmJiB0aGlzLl9sZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgdGhpcy5zaW1vbkdhbWVBY3Rpb25DcmVhdG9yLnNlbmRSZXBsYXlTaW1vblBhdHRlcm4oKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzLmdhbWVDb25maWcuSU5QVVRfVElNRU9VVCk7XG4gIH1cblxuICBfZGlzY2FyZElucHV0KCkge1xuICAgIHRoaXMuX3RhcmdldFNlcXVlbmNlSW5kZXggPSAwO1xuICAgIHRoaXMuX3RhcmdldFNlcXVlbmNlID0gbnVsbDtcbiAgICB0aGlzLl9yZWNlaXZlZElucHV0ID0gZmFsc2U7XG4gIH1cblxuICBfd2luTGV2ZWwoKSB7XG4gICAgdGhpcy5zdG9yZS5kYXRhLmdldCgnbGlnaHRzJykuZGVhY3RpdmF0ZUFsbCgpO1xuICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkodGhpcy5fY3VycmVudExldmVsRGF0YS5zdHJpcElkLCBudWxsLCAwKTtcblxuICAgIHRoaXMuc3RvcmUuc2V0U3VjY2Vzc1N0YXR1cygpO1xuXG4gICAgbGV0IGxldmVsID0gdGhpcy5fbGV2ZWwgKyAxO1xuICAgIGlmIChsZXZlbCA+PSB0aGlzLl9sZXZlbHMpIHtcbiAgICAgIHRoaXMuX2NvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsO1xuICB9XG5cbiAgX3BsYXlDdXJyZW50U2VxdWVuY2UoKSB7XG4gICAgY29uc3Qge3N0cmlwSWQsIHBhbmVsU2VxdWVuY2UsIGZyYW1lRGVsYXl9ID0gdGhpcy5fY3VycmVudExldmVsRGF0YTtcblxuICAgIHRoaXMuX3BsYXlTZXF1ZW5jZShzdHJpcElkLCBwYW5lbFNlcXVlbmNlLCBmcmFtZURlbGF5KTtcbiAgfVxuXG4gIF9wbGF5U2VxdWVuY2Uoc3RyaXBJZCwgcGFuZWxTZXF1ZW5jZSwgZnJhbWVEZWxheSkge1xuICAgIHRoaXMuX2Rpc2NhcmRJbnB1dCgpO1xuXG4gICAgY29uc3QgZnJhbWVzID0gcGFuZWxTZXF1ZW5jZS5tYXAoKHBhbmVsSWRzKSA9PiB0aGlzLl9jcmVhdGVTZXF1ZW5jZUZyYW1lKHN0cmlwSWQsIHBhbmVsSWRzLCBmcmFtZURlbGF5KSk7XG4gICAgZnJhbWVzLnB1c2godGhpcy5fY3JlYXRlTGFzdFNlcXVlbmNlRnJhbWUoc3RyaXBJZCwgZnJhbWVEZWxheSkpO1xuICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5ldyBQYW5lbEFuaW1hdGlvbihmcmFtZXMsIHRoaXMuX2ZpbmlzaFBsYXlTZXF1ZW5jZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuc3RvcmUucGxheUFuaW1hdGlvbihhbmltYXRpb24pO1xuICB9XG5cbiAgX2NyZWF0ZVNlcXVlbmNlRnJhbWUoc3RyaXBJZCwgcGFuZWxJZHMsIGZyYW1lRGVsYXkpIHtcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlRnJhbWUoc3RyaXBJZCwgZnJhbWVEZWxheSwgKCkgPT4ge1xuICAgICAgZm9yIChsZXQgcGFuZWxJZCBvZiBwYW5lbElkcykge1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMuZ2FtZUNvbmZpZy5UQVJHRVRfUEFORUxfSU5URU5TSVRZKTtcbiAgICAgICAgdGhpcy5fbGlnaHRzLnNldENvbG9yKHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMuZ2FtZUNvbmZpZy5ERUZBVUxUX1NJTU9OX1BBTkVMX0NPTE9SKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9jcmVhdGVMYXN0U2VxdWVuY2VGcmFtZShzdHJpcElkLCBmcmFtZURlbGF5KSB7XG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUZyYW1lKHN0cmlwSWQsIGZyYW1lRGVsYXksICgpID0+IHt9KTtcbiAgfVxuXG4gIF9jcmVhdGVGcmFtZShzdHJpcElkLCBmcmFtZURlbGF5LCBjYWxsYmFjaykge1xuICAgIHJldHVybiBuZXcgTm9ybWFsaXplU3RyaXBGcmFtZSh0aGlzLl9saWdodHMsIHN0cmlwSWQsXG4gICAgICB0aGlzLmdhbWVDb25maWcuREVGQVVMVF9TSU1PTl9QQU5FTF9DT0xPUixcbiAgICAgIHRoaXMuZ2FtZUNvbmZpZy5BVkFJTEFCTEVfUEFORUxfSU5URU5TSVRZLFxuICAgICAgY2FsbGJhY2ssXG4gICAgICBmcmFtZURlbGF5ICE9PSB1bmRlZmluZWQgPyBmcmFtZURlbGF5IDogdGhpcy5nYW1lQ29uZmlnLlNFUVVFTkNFX0FOSU1BVElPTl9GUkFNRV9ERUxBWSk7XG4gIH1cblxuICBfZmluaXNoUGxheVNlcXVlbmNlKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZXBsYXlUaW1lb3V0KTtcblxuICAgIGNvbnN0IGxldmVsID0gdGhpcy5fbGV2ZWw7XG4gICAgdGhpcy5fcmVwbGF5VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNSZWFkeUFuZE5vdEFuaW1hdGluZyAmJiAhdGhpcy5fcmVjZWl2ZWRJbnB1dCAmJiB0aGlzLl9sZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgdGhpcy5zaW1vbkdhbWVBY3Rpb25DcmVhdG9yLnNlbmRSZXBsYXlTaW1vblBhdHRlcm4oKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzLmdhbWVDb25maWcuREVMQVlfQkVUV0VFTl9QTEFZUyk7XG4gIH1cblxuICBnZXQgX2xldmVscygpIHtcbiAgICByZXR1cm4gdGhpcy5nYW1lQ29uZmlnLlBBVFRFUk5fTEVWRUxTLmxlbmd0aDtcbiAgfVxuXG4gIGdldCBfY3VycmVudExldmVsRGF0YSgpIHtcbiAgICBjb25zdCBsZXZlbCA9IHRoaXMuX2xldmVsO1xuICAgIHJldHVybiB0aGlzLmdhbWVDb25maWcuUEFUVEVSTl9MRVZFTFNbbGV2ZWxdO1xuICB9XG5cbiAgZ2V0IF9sZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldCgnbGV2ZWwnKTtcbiAgfVxuXG4gIHNldCBfbGV2ZWwodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnNldCgnbGV2ZWwnLCB2YWx1ZSk7XG4gIH1cblxuICBnZXQgaXNSZWFkeUFuZE5vdEFuaW1hdGluZygpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5pc1JlYWR5ICYmICF0aGlzLnN0b3JlLmlzUGFuZWxBbmltYXRpb25SdW5uaW5nO1xuICB9XG59XG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
