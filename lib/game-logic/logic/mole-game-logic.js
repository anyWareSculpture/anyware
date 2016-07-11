'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _panelsActionCreator = require('../actions/panels-action-creator');

var _panelsActionCreator2 = _interopRequireDefault(_panelsActionCreator);

var _sculptureActionCreator = require('../actions/sculpture-action-creator');

var _sculptureActionCreator2 = _interopRequireDefault(_sculptureActionCreator);

var _moleGameActionCreator = require('../actions/mole-game-action-creator');

var _moleGameActionCreator2 = _interopRequireDefault(_moleGameActionCreator);

var _trackedPanels = require('../utils/tracked-panels');

var _trackedPanels2 = _interopRequireDefault(_trackedPanels);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MoleGameLogic = function () {
  function MoleGameLogic(store, config) {
    var _this = this;

    _classCallCheck(this, MoleGameLogic);

    this.store = store;
    this.config = config;
    this.gameConfig = config.MOLE_GAME;

    this._complete = false;

    // _remainingPanels are used to select random panels
    this._panels = {}; // Unique panel objects. These can be used in the _remainingPanels Set
    this._remainingPanels = new Set();
    this.config.LIGHTS.GAME_STRIPS.forEach(function (stripId) {
      _this._lights.get(stripId).panelIds.forEach(function (panelId) {
        var panel = { stripId: stripId, panelId: panelId, key: _this._hash(stripId, panelId) };
        _this._panels[panel.key] = panel;
        _this._remainingPanels.add(panel);
      });
    });

    this._activeTimeouts = {};

    this.moleGameActionCreator = new _moleGameActionCreator2.default(this.store.dispatcher);
  }
  // These are automatically added to the sculpture store


  _createClass(MoleGameLogic, [{
    key: 'start',
    value: function start() {
      this._complete = false;
      this.data.set('panelCount', 0);
      this.data.set('panels', new _trackedPanels2.default());
      this._registerTimeout(0); // Request a new active panel immediately
    }
  }, {
    key: 'end',
    value: function end() {
      var _this2 = this;

      this.config.LIGHTS.GAME_STRIPS.forEach(function (stripId) {
        return _this2._lights.deactivateAll(stripId);
      });
    }

    /**
     * handleActionPayload must _synchronously_ change tracked data in sculpture store.
     * Any asynchronous behavior must happen by dispatching actions.
     * We're _not_ allowed to dispatch actions synchronously.
     */

  }, {
    key: 'handleActionPayload',
    value: function handleActionPayload(payload) {
      var _actionHandlers;

      if (this._complete) return;

      var actionHandlers = (_actionHandlers = {}, _defineProperty(_actionHandlers, _panelsActionCreator2.default.PANEL_PRESSED, this._actionPanelPressed.bind(this)), _defineProperty(_actionHandlers, _moleGameActionCreator2.default.AVAIL_PANEL, this._actionAvailPanel.bind(this)), _defineProperty(_actionHandlers, _moleGameActionCreator2.default.DEAVAIL_PANEL, this._actionDeavailPanel.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.FINISH_STATUS_ANIMATION, this._actionFinishStatusAnimation.bind(this)), _actionHandlers);

      var actionHandler = actionHandlers[payload.actionType];
      if (actionHandler) actionHandler(payload);
    }

    /**
     * We only have a status animation at the end of the game
     */

  }, {
    key: '_actionFinishStatusAnimation',
    value: function _actionFinishStatusAnimation(payload) {
      this._complete = true;
      // There is currently no transition out, so we can synchronously start the next game
      this.store.moveToNextGame();
    }

    /**
     * Asynchronous panel activation
     */

  }, {
    key: '_actionAvailPanel',
    value: function _actionAvailPanel(panel) {
      this._availPanel(panel);
    }

    /**
     * Asynchronous panel deactivation
     */

  }, {
    key: '_actionDeavailPanel',
    value: function _actionDeavailPanel(panel) {
      this._deavailPanel(panel);
    }

    /**
     * If an active panel is pressed:
     * 1) Turn panel to location color
     * 2) Wait a short moment
     * 3) Avail the next panel
     * 4) increase/decrease # of simulaneously active panels
     */

  }, {
    key: '_actionPanelPressed',
    value: function _actionPanelPressed(payload) {
      var stripId = payload.stripId;
      var panelId = payload.panelId;
      var pressed = payload.pressed;


      var state = this.data.get('panels').getPanelState(stripId, panelId);
      if (!state || state === _trackedPanels2.default.STATE_OFF) {
        if (pressed) {
          this._lights.setColor(stripId, panelId, this.userColor);
          this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);
        } else {
          this._lights.setDefaultColor(stripId, panelId);
          this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.INACTIVE_INTENSITY);
        }
        return;
      }

      // If we have a timeout on this panel, kill the timeout
      var key = this._getPanelKey(payload);
      if (this._activeTimeouts.hasOwnProperty(key)) {
        clearTimeout(this._activeTimeouts[key]);
        delete this._activeTimeouts[key];
      }

      // If an active panel was touched
      if (state === _trackedPanels2.default.STATE_ON) {
        this._colorPanel({ stripId: stripId, panelId: panelId });

        // Advance game
        var panelCount = this.data.get("panelCount") + 1;
        if (panelCount === this.gameConfig.GAME_END) {
          this._winGame();
        } else {
          this.data.set('panelCount', panelCount);
          // Determine whether to add, remove of keep # of simultaneous panels
          var addPanels = 1 + (this.gameConfig.NUM_ACTIVE_PANELS[panelCount] ? this.gameConfig.NUM_ACTIVE_PANELS[panelCount] : 0);

          for (var i = 0; i < addPanels; i++) {
            this._registerTimeout(this.gameConfig.PANEL_SUCCESS_DELAY); // Wait before next panel
          }
        }
      }
    }
  }, {
    key: '_hash',
    value: function _hash(stripId, panelId) {
      return stripId + ',' + panelId;
    }
  }, {
    key: '_getPanelKey',
    value: function _getPanelKey(_ref) {
      var stripId = _ref.stripId;
      var panelId = _ref.panelId;

      return this._hash(stripId, panelId);
    }
  }, {
    key: '_getPanel',
    value: function _getPanel(_ref2) {
      var stripId = _ref2.stripId;
      var panelId = _ref2.panelId;

      return this._panels[this._hash(stripId, panelId)];
    }

    /**
     * Request the next active panel, as the game progresses
     * Returns {panel, lifetime}
     */

  }, {
    key: '_nextActivePanel',
    value: function _nextActivePanel(count) {
      if (count < this.gameConfig.INITIAL_PANELS.length) {
        var panel = this.gameConfig.INITIAL_PANELS[count];
        return { panel: panel, lifetime: this._getPanelLifetime(count) }; // No timeout
      }
      return { panel: this._getRandomPanel(count), lifetime: this._getPanelLifetime(count) };
    }
  }, {
    key: '_getRandomPanel',
    value: function _getRandomPanel(count) {
      var idx = Math.floor(Math.random() * this._remainingPanels.size);
      var iter = this._remainingPanels.values();
      var curr = iter.next();
      for (var i = 0; i < idx; i++) {
        curr = iter.next();
      }return curr.value;
    }
  }, {
    key: '_getPanelLifetime',
    value: function _getPanelLifetime(count) {
      // find last and next lifetime values for interpolation
      var last = void 0,
          next = void 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.gameConfig.PANEL_LIFETIME[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var elem = _step.value;

          if (!last || elem.count <= count) last = elem;
          next = elem;
          if (elem.count > count) break;
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

      var min = void 0,
          max = void 0;
      if (last === next) {
        min = last.range[0];
        max = last.range[1];
      } else {
        min = last.range[0] + (next.range[0] - last.range[0]) * (count - last.count) / (next.count - last.count);
        max = last.range[1] + (next.range[1] - last.range[1]) * (count - last.count) / (next.count - last.count);
      }
      return 1000 * (Math.random() * (max - min) + min);
    }

    /**
     * If called with a panel, we'll move the panel (deavail+pause+avail).
     * If called without a panel we'll immediately avail a new panel
     */

  }, {
    key: '_panelTimeout',
    value: function _panelTimeout(oldPanel) {
      if (oldPanel) {
        var key = this._getPanelKey(oldPanel);
        delete this._activeTimeouts[key];
        this.moleGameActionCreator.sendDeavailPanel(oldPanel);
        this._registerTimeout(this.gameConfig.PANEL_MOVE_DELAY);
      } else {
        var _nextActivePanel2 = this._nextActivePanel(this.data.get("panelCount"));

        var panel = _nextActivePanel2.panel;
        var lifetime = _nextActivePanel2.lifetime;

        this.moleGameActionCreator.sendAvailPanel(panel);
        this._registerTimeout(lifetime, panel);
      }
    }

    /**
     * Call without panel to request a new panel after the given timeout
     * Call with panel to turn off the panel after the given timeout
     */

  }, {
    key: '_registerTimeout',
    value: function _registerTimeout(timeout) {
      var panel = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      var tid = setTimeout(this._panelTimeout.bind(this, panel), timeout);
      if (panel) this._activeTimeouts[this._getPanelKey(panel)] = tid;
    }

    // FIXME: The panel should also pulse. Should the pulsating state be part of tracked data, or should each view deduce this from the current game and state?

  }, {
    key: '_availPanel',
    value: function _availPanel(panel) {
      this._setPanelState(panel, _trackedPanels2.default.STATE_ON);
      this._remainingPanels.delete(this._getPanel(panel));
      this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.ACTIVE_PANEL_INTENSITY);
    }
  }, {
    key: '_deavailPanel',
    value: function _deavailPanel(panel) {
      this._remainingPanels.add(this._getPanel(panel));
      this._setPanelState(panel, _trackedPanels2.default.STATE_OFF);
      this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.INACTIVE_PANEL_INTENSITY);
    }
  }, {
    key: '_colorPanel',
    value: function _colorPanel(panel) {
      this._setPanelState(panel, _trackedPanels2.default.STATE_IGNORED);
      this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.COLORED_PANEL_INTENSITY);
      this._lights.setColor(panel.stripId, panel.panelId, this.store.userColor);
    }
  }, {
    key: '_winGame',
    value: function _winGame() {
      this._lights.deactivateAll();
      this.store.setSuccessStatus();
    }
  }, {
    key: '_setPanelState',
    value: function _setPanelState(_ref3, state) {
      var stripId = _ref3.stripId;
      var panelId = _ref3.panelId;

      this.data.get('panels').setPanelState(stripId, panelId, state);
    }
  }, {
    key: 'data',
    get: function get() {
      return this.store.data.get('mole');
    }
  }, {
    key: '_lights',
    get: function get() {
      return this.store.data.get('lights');
    }
  }]);

  return MoleGameLogic;
}();

MoleGameLogic.trackedProperties = {
  panelCount: 0, // Game progress (0..30)
  panels: new _trackedPanels2.default() // panel -> state
};
exports.default = MoleGameLogic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvbG9naWMvbW9sZS1nYW1lLWxvZ2ljLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7SUFFcUIsYTtBQU9uQix5QkFBWSxLQUFaLEVBQW1CLE1BQW5CLEVBQTJCO0FBQUE7O0FBQUE7O0FBQ3pCLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLE9BQU8sU0FBekI7O0FBRUEsU0FBSyxTQUFMLEdBQWlCLEtBQWpCOzs7QUFHQSxTQUFLLE9BQUwsR0FBZSxFQUFmLEM7QUFDQSxTQUFLLGdCQUFMLEdBQXdCLElBQUksR0FBSixFQUF4QjtBQUNBLFNBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsV0FBbkIsQ0FBK0IsT0FBL0IsQ0FBdUMsbUJBQVc7QUFDaEQsWUFBSyxPQUFMLENBQWEsR0FBYixDQUFpQixPQUFqQixFQUEwQixRQUExQixDQUFtQyxPQUFuQyxDQUEyQyxtQkFBVztBQUNwRCxZQUFNLFFBQVEsRUFBRSxnQkFBRixFQUFXLGdCQUFYLEVBQW9CLEtBQUssTUFBSyxLQUFMLENBQVcsT0FBWCxFQUFvQixPQUFwQixDQUF6QixFQUFkO0FBQ0EsY0FBSyxPQUFMLENBQWEsTUFBTSxHQUFuQixJQUEwQixLQUExQjtBQUNBLGNBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsQ0FBMEIsS0FBMUI7QUFDRCxPQUpEO0FBS0QsS0FORDs7QUFRQSxTQUFLLGVBQUwsR0FBdUIsRUFBdkI7O0FBRUEsU0FBSyxxQkFBTCxHQUE2QixvQ0FBMEIsS0FBSyxLQUFMLENBQVcsVUFBckMsQ0FBN0I7QUFDRDs7Ozs7OzRCQU1PO0FBQ04sV0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsV0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLFlBQWQsRUFBNEIsQ0FBNUI7QUFDQSxXQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMs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QUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBb0IsTUFBcEIsQ0FBUDtBQUNEOzs7d0JBa05hO0FBQ1osYUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEdBQWhCLENBQW9CLFFBQXBCLENBQVA7QUFDRDs7Ozs7O0FBcFBrQixhLENBRVosaUIsR0FBb0I7QUFDekIsY0FBWSxDQURhLEU7QUFFekIsVUFBUSw2QjtBQUZpQixDO2tCQUZSLGEiLCJmaWxlIjoiZ2FtZS1sb2dpYy9sb2dpYy9tb2xlLWdhbWUtbG9naWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUGFuZWxzQWN0aW9uQ3JlYXRvciBmcm9tICcuLi9hY3Rpb25zL3BhbmVscy1hY3Rpb24tY3JlYXRvcic7XG5pbXBvcnQgU2N1bHB0dXJlQWN0aW9uQ3JlYXRvciBmcm9tICcuLi9hY3Rpb25zL3NjdWxwdHVyZS1hY3Rpb24tY3JlYXRvcic7XG5pbXBvcnQgTW9sZUdhbWVBY3Rpb25DcmVhdG9yIGZyb20gJy4uL2FjdGlvbnMvbW9sZS1nYW1lLWFjdGlvbi1jcmVhdG9yJztcbmltcG9ydCBUcmFja2VkUGFuZWxzIGZyb20gJy4uL3V0aWxzL3RyYWNrZWQtcGFuZWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9sZUdhbWVMb2dpYyB7XG4gIC8vIFRoZXNlIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzY3VscHR1cmUgc3RvcmVcbiAgc3RhdGljIHRyYWNrZWRQcm9wZXJ0aWVzID0ge1xuICAgIHBhbmVsQ291bnQ6IDAsIC8vIEdhbWUgcHJvZ3Jlc3MgKDAuLjMwKVxuICAgIHBhbmVsczogbmV3IFRyYWNrZWRQYW5lbHMoKSAgLy8gcGFuZWwgLT4gc3RhdGVcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihzdG9yZSwgY29uZmlnKSB7XG4gICAgdGhpcy5zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuZ2FtZUNvbmZpZyA9IGNvbmZpZy5NT0xFX0dBTUU7XG5cbiAgICB0aGlzLl9jb21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgLy8gX3JlbWFpbmluZ1BhbmVscyBhcmUgdXNlZCB0byBzZWxlY3QgcmFuZG9tIHBhbmVsc1xuICAgIHRoaXMuX3BhbmVscyA9IHt9OyAvLyBVbmlxdWUgcGFuZWwgb2JqZWN0cy4gVGhlc2UgY2FuIGJlIHVzZWQgaW4gdGhlIF9yZW1haW5pbmdQYW5lbHMgU2V0XG4gICAgdGhpcy5fcmVtYWluaW5nUGFuZWxzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuY29uZmlnLkxJR0hUUy5HQU1FX1NUUklQUy5mb3JFYWNoKHN0cmlwSWQgPT4ge1xuICAgICAgdGhpcy5fbGlnaHRzLmdldChzdHJpcElkKS5wYW5lbElkcy5mb3JFYWNoKHBhbmVsSWQgPT4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IHsgc3RyaXBJZCwgcGFuZWxJZCwga2V5OiB0aGlzLl9oYXNoKHN0cmlwSWQsIHBhbmVsSWQpIH07XG4gICAgICAgIHRoaXMuX3BhbmVsc1twYW5lbC5rZXldID0gcGFuZWw7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZ1BhbmVscy5hZGQocGFuZWwpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9hY3RpdmVUaW1lb3V0cyA9IHt9O1xuXG4gICAgdGhpcy5tb2xlR2FtZUFjdGlvbkNyZWF0b3IgPSBuZXcgTW9sZUdhbWVBY3Rpb25DcmVhdG9yKHRoaXMuc3RvcmUuZGlzcGF0Y2hlcik7XG4gIH1cblxuICBnZXQgZGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5kYXRhLmdldCgnbW9sZScpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5fY29tcGxldGUgPSBmYWxzZTtcbiAgICB0aGlzLmRhdGEuc2V0KCdwYW5lbENvdW50JywgMCk7XG4gICAgdGhpcy5kYXRhLnNldCgncGFuZWxzJywgbmV3IFRyYWNrZWRQYW5lbHMoKSk7XG4gICAgdGhpcy5fcmVnaXN0ZXJUaW1lb3V0KDApOyAvLyBSZXF1ZXN0IGEgbmV3IGFjdGl2ZSBwYW5lbCBpbW1lZGlhdGVseVxuICB9XG5cbiAgZW5kKCkge1xuICAgIHRoaXMuY29uZmlnLkxJR0hUUy5HQU1FX1NUUklQUy5mb3JFYWNoKHN0cmlwSWQgPT4gdGhpcy5fbGlnaHRzLmRlYWN0aXZhdGVBbGwoc3RyaXBJZCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIGhhbmRsZUFjdGlvblBheWxvYWQgbXVzdCBfc3luY2hyb25vdXNseV8gY2hhbmdlIHRyYWNrZWQgZGF0YSBpbiBzY3VscHR1cmUgc3RvcmUuXG4gICAqIEFueSBhc3luY2hyb25vdXMgYmVoYXZpb3IgbXVzdCBoYXBwZW4gYnkgZGlzcGF0Y2hpbmcgYWN0aW9ucy5cbiAgICogV2UncmUgX25vdF8gYWxsb3dlZCB0byBkaXNwYXRjaCBhY3Rpb25zIHN5bmNocm9ub3VzbHkuXG4gICAqL1xuICBoYW5kbGVBY3Rpb25QYXlsb2FkKHBheWxvYWQpIHtcbiAgICBpZiAodGhpcy5fY29tcGxldGUpIHJldHVybjtcblxuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXJzID0ge1xuICAgICAgW1BhbmVsc0FjdGlvbkNyZWF0b3IuUEFORUxfUFJFU1NFRF06IHRoaXMuX2FjdGlvblBhbmVsUHJlc3NlZC5iaW5kKHRoaXMpLFxuICAgICAgW01vbGVHYW1lQWN0aW9uQ3JlYXRvci5BVkFJTF9QQU5FTF06IHRoaXMuX2FjdGlvbkF2YWlsUGFuZWwuYmluZCh0aGlzKSxcbiAgICAgIFtNb2xlR2FtZUFjdGlvbkNyZWF0b3IuREVBVkFJTF9QQU5FTF06IHRoaXMuX2FjdGlvbkRlYXZhaWxQYW5lbC5iaW5kKHRoaXMpLFxuICAgICAgW1NjdWxwdHVyZUFjdGlvbkNyZWF0b3IuRklOSVNIX1NUQVRVU19BTklNQVRJT05dOiB0aGlzLl9hY3Rpb25GaW5pc2hTdGF0dXNBbmltYXRpb24uYmluZCh0aGlzKVxuICAgIH07XG5cbiAgICBjb25zdCBhY3Rpb25IYW5kbGVyID0gYWN0aW9uSGFuZGxlcnNbcGF5bG9hZC5hY3Rpb25UeXBlXTtcbiAgICBpZiAoYWN0aW9uSGFuZGxlcikgYWN0aW9uSGFuZGxlcihwYXlsb2FkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBvbmx5IGhhdmUgYSBzdGF0dXMgYW5pbWF0aW9uIGF0IHRoZSBlbmQgb2YgdGhlIGdhbWVcbiAgICovXG4gIF9hY3Rpb25GaW5pc2hTdGF0dXNBbmltYXRpb24ocGF5bG9hZCkge1xuICAgIHRoaXMuX2NvbXBsZXRlID0gdHJ1ZTtcbiAgICAvLyBUaGVyZSBpcyBjdXJyZW50bHkgbm8gdHJhbnNpdGlvbiBvdXQsIHNvIHdlIGNhbiBzeW5jaHJvbm91c2x5IHN0YXJ0IHRoZSBuZXh0IGdhbWVcbiAgICB0aGlzLnN0b3JlLm1vdmVUb05leHRHYW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogQXN5bmNocm9ub3VzIHBhbmVsIGFjdGl2YXRpb25cbiAgICovXG4gIF9hY3Rpb25BdmFpbFBhbmVsKHBhbmVsKSB7XG4gICAgdGhpcy5fYXZhaWxQYW5lbChwYW5lbCk7XG4gIH1cblxuICAvKipcbiAgICogQXN5bmNocm9ub3VzIHBhbmVsIGRlYWN0aXZhdGlvblxuICAgKi9cbiAgX2FjdGlvbkRlYXZhaWxQYW5lbChwYW5lbCkge1xuICAgIHRoaXMuX2RlYXZhaWxQYW5lbChwYW5lbCk7XG4gIH1cblxuICAvKipcbiAgICogSWYgYW4gYWN0aXZlIHBhbmVsIGlzIHByZXNzZWQ6XG4gICAqIDEpIFR1cm4gcGFuZWwgdG8gbG9jYXRpb24gY29sb3JcbiAgICogMikgV2FpdCBhIHNob3J0IG1vbWVudFxuICAgKiAzKSBBdmFpbCB0aGUgbmV4dCBwYW5lbFxuICAgKiA0KSBpbmNyZWFzZS9kZWNyZWFzZSAjIG9mIHNpbXVsYW5lb3VzbHkgYWN0aXZlIHBhbmVsc1xuICAgKi9cbiAgX2FjdGlvblBhbmVsUHJlc3NlZChwYXlsb2FkKSB7XG4gICAgbGV0IHtzdHJpcElkLCBwYW5lbElkLCBwcmVzc2VkfSA9IHBheWxvYWQ7XG5cbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZGF0YS5nZXQoJ3BhbmVscycpLmdldFBhbmVsU3RhdGUoc3RyaXBJZCwgcGFuZWxJZCk7XG4gICAgaWYgKCFzdGF0ZSB8fCBzdGF0ZSA9PT0gVHJhY2tlZFBhbmVscy5TVEFURV9PRkYpIHtcbiAgICAgIGlmIChwcmVzc2VkKSB7XG4gICAgICAgIHRoaXMuX2xpZ2h0cy5zZXRDb2xvcihzdHJpcElkLCBwYW5lbElkLCB0aGlzLnVzZXJDb2xvcik7XG4gICAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5jb25maWcuUEFORUxfREVGQVVMVFMuQUNUSVZFX0lOVEVOU0lUWSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fbGlnaHRzLnNldERlZmF1bHRDb2xvcihzdHJpcElkLCBwYW5lbElkKTtcbiAgICAgICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCB0aGlzLmNvbmZpZy5QQU5FTF9ERUZBVUxUUy5JTkFDVElWRV9JTlRFTlNJVFkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGhhdmUgYSB0aW1lb3V0IG9uIHRoaXMgcGFuZWwsIGtpbGwgdGhlIHRpbWVvdXRcbiAgICBjb25zdCBrZXkgPSB0aGlzLl9nZXRQYW5lbEtleShwYXlsb2FkKTtcbiAgICBpZiAodGhpcy5fYWN0aXZlVGltZW91dHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2FjdGl2ZVRpbWVvdXRzW2tleV0pO1xuICAgICAgZGVsZXRlIHRoaXMuX2FjdGl2ZVRpbWVvdXRzW2tleV07XG4gICAgfVxuXG4gICAgLy8gSWYgYW4gYWN0aXZlIHBhbmVsIHdhcyB0b3VjaGVkXG4gICAgaWYgKHN0YXRlID09PSBUcmFja2VkUGFuZWxzLlNUQVRFX09OKSB7XG4gICAgICB0aGlzLl9jb2xvclBhbmVsKHtzdHJpcElkLCBwYW5lbElkfSk7XG5cbiAgICAgIC8vIEFkdmFuY2UgZ2FtZVxuICAgICAgbGV0IHBhbmVsQ291bnQgPSB0aGlzLmRhdGEuZ2V0KFwicGFuZWxDb3VudFwiKSArIDE7XG4gICAgICBpZiAocGFuZWxDb3VudCA9PT0gdGhpcy5nYW1lQ29uZmlnLkdBTUVfRU5EKSB7XG4gICAgICAgIHRoaXMuX3dpbkdhbWUoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmRhdGEuc2V0KCdwYW5lbENvdW50JywgcGFuZWxDb3VudCk7XG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGFkZCwgcmVtb3ZlIG9mIGtlZXAgIyBvZiBzaW11bHRhbmVvdXMgcGFuZWxzXG4gICAgICAgIGNvbnN0IGFkZFBhbmVscyA9IDEgKyAodGhpcy5nYW1lQ29uZmlnLk5VTV9BQ1RJVkVfUEFORUxTW3BhbmVsQ291bnRdID8gdGhpcy5nYW1lQ29uZmlnLk5VTV9BQ1RJVkVfUEFORUxTW3BhbmVsQ291bnRdIDogMCk7XG5cbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPGFkZFBhbmVsczsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5fcmVnaXN0ZXJUaW1lb3V0KHRoaXMuZ2FtZUNvbmZpZy5QQU5FTF9TVUNDRVNTX0RFTEFZKTsgLy8gV2FpdCBiZWZvcmUgbmV4dCBwYW5lbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2hhc2goc3RyaXBJZCwgcGFuZWxJZCkge1xuICAgIHJldHVybiBgJHtzdHJpcElkfSwke3BhbmVsSWR9YDtcbiAgfVxuXG4gIF9nZXRQYW5lbEtleSh7c3RyaXBJZCwgcGFuZWxJZH0pIHtcbiAgICByZXR1cm4gdGhpcy5faGFzaChzdHJpcElkLCBwYW5lbElkKTtcbiAgfVxuXG4gIF9nZXRQYW5lbCh7c3RyaXBJZCwgcGFuZWxJZH0pIHtcbiAgICByZXR1cm4gdGhpcy5fcGFuZWxzW3RoaXMuX2hhc2goc3RyaXBJZCwgcGFuZWxJZCldO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgdGhlIG5leHQgYWN0aXZlIHBhbmVsLCBhcyB0aGUgZ2FtZSBwcm9ncmVzc2VzXG4gICAqIFJldHVybnMge3BhbmVsLCBsaWZldGltZX1cbiAgICovXG4gIF9uZXh0QWN0aXZlUGFuZWwoY291bnQpIHtcbiAgICBpZiAoY291bnQgPCB0aGlzLmdhbWVDb25maWcuSU5JVElBTF9QQU5FTFMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwYW5lbCA9IHRoaXMuZ2FtZUNvbmZpZy5JTklUSUFMX1BBTkVMU1tjb3VudF07XG4gICAgICByZXR1cm4geyBwYW5lbCwgbGlmZXRpbWU6IHRoaXMuX2dldFBhbmVsTGlmZXRpbWUoY291bnQpIH07IC8vIE5vIHRpbWVvdXRcbiAgICB9XG4gICAgcmV0dXJuIHsgcGFuZWw6IHRoaXMuX2dldFJhbmRvbVBhbmVsKGNvdW50KSwgbGlmZXRpbWU6IHRoaXMuX2dldFBhbmVsTGlmZXRpbWUoY291bnQpfTtcbiAgfVxuXG4gIF9nZXRSYW5kb21QYW5lbChjb3VudCkge1xuICAgIGNvbnN0IGlkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuX3JlbWFpbmluZ1BhbmVscy5zaXplKTtcbiAgICBjb25zdCBpdGVyID0gdGhpcy5fcmVtYWluaW5nUGFuZWxzLnZhbHVlcygpO1xuICAgIGxldCBjdXJyID0gaXRlci5uZXh0KCk7XG4gICAgZm9yIChsZXQgaT0wOyBpPGlkeDsgaSsrKSBjdXJyID0gaXRlci5uZXh0KCk7XG4gICAgcmV0dXJuIGN1cnIudmFsdWU7XG4gIH1cblxuICBfZ2V0UGFuZWxMaWZldGltZShjb3VudCkge1xuICAgIC8vIGZpbmQgbGFzdCBhbmQgbmV4dCBsaWZldGltZSB2YWx1ZXMgZm9yIGludGVycG9sYXRpb25cbiAgICBsZXQgbGFzdCwgbmV4dDtcbiAgICBmb3IgKGxldCBlbGVtIG9mIHRoaXMuZ2FtZUNvbmZpZy5QQU5FTF9MSUZFVElNRSkge1xuICAgICAgaWYgKCFsYXN0IHx8IGVsZW0uY291bnQgPD0gY291bnQpIGxhc3QgPSBlbGVtO1xuICAgICAgbmV4dCA9IGVsZW07XG4gICAgICBpZiAoZWxlbS5jb3VudCA+IGNvdW50KSBicmVhaztcbiAgICB9XG5cbiAgICBsZXQgbWluLCBtYXg7XG4gICAgaWYgKGxhc3QgPT09IG5leHQpIHtcbiAgICAgIG1pbiA9IGxhc3QucmFuZ2VbMF07XG4gICAgICBtYXggPSBsYXN0LnJhbmdlWzFdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG1pbiA9IGxhc3QucmFuZ2VbMF0gKyAobmV4dC5yYW5nZVswXSAtIGxhc3QucmFuZ2VbMF0pICogKGNvdW50IC0gbGFzdC5jb3VudCkgLyAobmV4dC5jb3VudCAtIGxhc3QuY291bnQpO1xuICAgICAgbWF4ID0gbGFzdC5yYW5nZVsxXSArIChuZXh0LnJhbmdlWzFdIC0gbGFzdC5yYW5nZVsxXSkgKiAoY291bnQgLSBsYXN0LmNvdW50KSAvIChuZXh0LmNvdW50IC0gbGFzdC5jb3VudCk7XG4gICAgfVxuICAgIHJldHVybiAxMDAwICogKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XG4gIH1cblxuICAvKipcbiAgICogSWYgY2FsbGVkIHdpdGggYSBwYW5lbCwgd2UnbGwgbW92ZSB0aGUgcGFuZWwgKGRlYXZhaWwrcGF1c2UrYXZhaWwpLlxuICAgKiBJZiBjYWxsZWQgd2l0aG91dCBhIHBhbmVsIHdlJ2xsIGltbWVkaWF0ZWx5IGF2YWlsIGEgbmV3IHBhbmVsXG4gICAqL1xuICBfcGFuZWxUaW1lb3V0KG9sZFBhbmVsKSB7XG4gICAgaWYgKG9sZFBhbmVsKSB7XG4gICAgICBjb25zdCBrZXkgPSB0aGlzLl9nZXRQYW5lbEtleShvbGRQYW5lbCk7XG4gICAgICBkZWxldGUgdGhpcy5fYWN0aXZlVGltZW91dHNba2V5XTtcbiAgICAgIHRoaXMubW9sZUdhbWVBY3Rpb25DcmVhdG9yLnNlbmREZWF2YWlsUGFuZWwob2xkUGFuZWwpO1xuICAgICAgdGhpcy5fcmVnaXN0ZXJUaW1lb3V0KHRoaXMuZ2FtZUNvbmZpZy5QQU5FTF9NT1ZFX0RFTEFZKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCB7cGFuZWwsIGxpZmV0aW1lfSA9IHRoaXMuX25leHRBY3RpdmVQYW5lbCh0aGlzLmRhdGEuZ2V0KFwicGFuZWxDb3VudFwiKSk7XG4gICAgICB0aGlzLm1vbGVHYW1lQWN0aW9uQ3JlYXRvci5zZW5kQXZhaWxQYW5lbChwYW5lbCk7XG4gICAgICB0aGlzLl9yZWdpc3RlclRpbWVvdXQobGlmZXRpbWUsIHBhbmVsKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCB3aXRob3V0IHBhbmVsIHRvIHJlcXVlc3QgYSBuZXcgcGFuZWwgYWZ0ZXIgdGhlIGdpdmVuIHRpbWVvdXRcbiAgICogQ2FsbCB3aXRoIHBhbmVsIHRvIHR1cm4gb2ZmIHRoZSBwYW5lbCBhZnRlciB0aGUgZ2l2ZW4gdGltZW91dFxuICAgKi9cbiAgX3JlZ2lzdGVyVGltZW91dCh0aW1lb3V0LCBwYW5lbCA9IG51bGwpIHtcbiAgICBjb25zdCB0aWQgPSBzZXRUaW1lb3V0KHRoaXMuX3BhbmVsVGltZW91dC5iaW5kKHRoaXMsIHBhbmVsKSwgdGltZW91dCk7XG4gICAgaWYgKHBhbmVsKSB0aGlzLl9hY3RpdmVUaW1lb3V0c1t0aGlzLl9nZXRQYW5lbEtleShwYW5lbCldID0gdGlkO1xuICB9XG5cbiAgLy8gRklYTUU6IFRoZSBwYW5lbCBzaG91bGQgYWxzbyBwdWxzZS4gU2hvdWxkIHRoZSBwdWxzYXRpbmcgc3RhdGUgYmUgcGFydCBvZiB0cmFja2VkIGRhdGEsIG9yIHNob3VsZCBlYWNoIHZpZXcgZGVkdWNlIHRoaXMgZnJvbSB0aGUgY3VycmVudCBnYW1lIGFuZCBzdGF0ZT9cbiAgX2F2YWlsUGFuZWwocGFuZWwpIHtcbiAgICB0aGlzLl9zZXRQYW5lbFN0YXRlKHBhbmVsLCBUcmFja2VkUGFuZWxzLlNUQVRFX09OKTtcbiAgICB0aGlzLl9yZW1haW5pbmdQYW5lbHMuZGVsZXRlKHRoaXMuX2dldFBhbmVsKHBhbmVsKSk7XG4gICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShwYW5lbC5zdHJpcElkLCBwYW5lbC5wYW5lbElkLCB0aGlzLmdhbWVDb25maWcuQUNUSVZFX1BBTkVMX0lOVEVOU0lUWSk7XG4gIH1cblxuICBfZGVhdmFpbFBhbmVsKHBhbmVsKSB7XG4gICAgdGhpcy5fcmVtYWluaW5nUGFuZWxzLmFkZCh0aGlzLl9nZXRQYW5lbChwYW5lbCkpO1xuICAgIHRoaXMuX3NldFBhbmVsU3RhdGUocGFuZWwsIFRyYWNrZWRQYW5lbHMuU1RBVEVfT0ZGKTtcbiAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHBhbmVsLnN0cmlwSWQsIHBhbmVsLnBhbmVsSWQsIHRoaXMuZ2FtZUNvbmZpZy5JTkFDVElWRV9QQU5FTF9JTlRFTlNJVFkpO1xuICB9XG5cbiAgX2NvbG9yUGFuZWwocGFuZWwpIHtcbiAgICB0aGlzLl9zZXRQYW5lbFN0YXRlKHBhbmVsLCBUcmFja2VkUGFuZWxzLlNUQVRFX0lHTk9SRUQpO1xuICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkocGFuZWwuc3RyaXBJZCwgcGFuZWwucGFuZWxJZCwgdGhpcy5nYW1lQ29uZmlnLkNPTE9SRURfUEFORUxfSU5URU5TSVRZKTtcbiAgICB0aGlzLl9saWdodHMuc2V0Q29sb3IocGFuZWwuc3RyaXBJZCwgcGFuZWwucGFuZWxJZCwgdGhpcy5zdG9yZS51c2VyQ29sb3IpO1xuICB9XG5cbiAgX3dpbkdhbWUoKSB7XG4gICAgdGhpcy5fbGlnaHRzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICB0aGlzLnN0b3JlLnNldFN1Y2Nlc3NTdGF0dXMoKTtcbiAgfVxuXG4gIGdldCBfbGlnaHRzKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdsaWdodHMnKTtcbiAgfVxuXG4gIF9zZXRQYW5lbFN0YXRlKHtzdHJpcElkLCBwYW5lbElkfSwgc3RhdGUpIHtcbiAgICB0aGlzLmRhdGEuZ2V0KCdwYW5lbHMnKS5zZXRQYW5lbFN0YXRlKHN0cmlwSWQsIHBhbmVsSWQsIHN0YXRlKTtcbiAgfVxuXG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
