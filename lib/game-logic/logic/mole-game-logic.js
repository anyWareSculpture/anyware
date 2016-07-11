'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PanelsActionCreator = require('../actions/panels-action-creator');
var SculptureActionCreator = require('../actions/sculpture-action-creator');
var MoleGameActionCreator = require('../actions/mole-game-action-creator');

var _require = require('../utils/tracked-panels');

var TrackedPanels = _require.TrackedPanels;

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

    this.moleGameActionCreator = new MoleGameActionCreator(this.store.dispatcher);
  }
  // These are automatically added to the sculpture store


  _createClass(MoleGameLogic, [{
    key: 'start',
    value: function start() {
      this._complete = false;
      this.data.set('panelCount', 0);
      this.data.set('panels', new TrackedPanels());
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

      var actionHandlers = (_actionHandlers = {}, _defineProperty(_actionHandlers, PanelsActionCreator.PANEL_PRESSED, this._actionPanelPressed.bind(this)), _defineProperty(_actionHandlers, MoleGameActionCreator.AVAIL_PANEL, this._actionAvailPanel.bind(this)), _defineProperty(_actionHandlers, MoleGameActionCreator.DEAVAIL_PANEL, this._actionDeavailPanel.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.FINISH_STATUS_ANIMATION, this._actionFinishStatusAnimation.bind(this)), _actionHandlers);

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
      if (!state || state === TrackedPanels.STATE_OFF) {
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
      if (state === TrackedPanels.STATE_ON) {
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
      this._setPanelState(panel, TrackedPanels.STATE_ON);
      this._remainingPanels.delete(this._getPanel(panel));
      this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.ACTIVE_PANEL_INTENSITY);
    }
  }, {
    key: '_deavailPanel',
    value: function _deavailPanel(panel) {
      this._remainingPanels.add(this._getPanel(panel));
      this._setPanelState(panel, TrackedPanels.STATE_OFF);
      this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.INACTIVE_PANEL_INTENSITY);
    }
  }, {
    key: '_colorPanel',
    value: function _colorPanel(panel) {
      this._setPanelState(panel, TrackedPanels.STATE_IGNORED);
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
  panels: new TrackedPanels() // panel -> state
};
exports.default = MoleGameLogic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvbG9naWMvbW9sZS1nYW1lLWxvZ2ljLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLElBQU0sc0JBQXNCLFFBQVEsa0NBQVIsQ0FBNUI7QUFDQSxJQUFNLHlCQUF5QixRQUFRLHFDQUFSLENBQS9CO0FBQ0EsSUFBTSx3QkFBd0IsUUFBUSxxQ0FBUixDQUE5Qjs7ZUFDd0IsUUFBUSx5QkFBUixDOztJQUFqQixhLFlBQUEsYTs7SUFFYyxhO0FBT25CLHlCQUFZLEtBQVosRUFBbUIsTUFBbkIsRUFBMkI7QUFBQTs7QUFBQTs7QUFDekIsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxTQUFLLFVBQUwsR0FBa0IsT0FBTyxTQUF6Qjs7QUFFQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7OztBQUdBLFNBQUssT0FBTCxHQUFlLEVBQWYsQztBQUNBLFNBQUssZ0JBQUwsR0FBd0IsSUFBSSxHQUFKLEVBQXhCO0FBQ0EsU0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixXQUFuQixDQUErQixPQUEvQixDQUF1QyxtQkFBVztBQUNoRCxZQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLE9BQWpCLEVBQTBCLFFBQTFCLENBQW1DLE9BQW5DLENBQTJDLG1CQUFXO0FBQ3BELFlBQU0sUUFBUSxFQUFFLGdCQUFGLEVBQVcsZ0JBQVgsRUFBb0IsS0FBSyxNQUFLLEtBQUwsQ0FBVyxPQUFYLEVBQW9CLE9BQXBCLENBQXpCLEVBQWQ7QUFDQSxjQUFLLE9BQUwsQ0FBYSxNQUFNLEdBQW5CLElBQTBCLEtBQTFCO0FBQ0EsY0FBSyxnQkFBTCxDQUFzQixHQUF0QixDQUEwQixLQUExQjtBQUNELE9BSkQ7QUFLRCxLQU5EOztBQVFBLFNBQUssZUFBTCxHQUF1QixFQUF2Qjs7QUFFQSxTQUFLLHFCQUFMLEdBQTZCLElBQUkscUJBQUosQ0FBMEIsS0FBSyxLQUFMLENBQVcsVUFBckMsQ0FBN0I7QUFDRDs7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LE9BQWlCOztBQUN4QyxXQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsUUFBZCxFQUF3QixhQUF4QixDQUFzQyxPQUF0QyxFQUErQyxPQUEvQyxFQUF3RCxLQUF4RDtBQUNEOzs7d0JBMU5VO0FBQ1QsYUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEdBQWhCLENBQW9CLE1BQXBCLENBQVA7QUFDRDs7O3dCQWtOYTtBQUNaLGFBQU8sS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixHQUFoQixDQUFvQixRQUFwQixDQUFQO0FBQ0Q7Ozs7OztBQXBQa0IsYSxDQUVaLGlCLEdBQW9CO0FBQ3pCLGNBQVksQ0FEYSxFO0FBRXpCLFVBQVEsSUFBSSxhQUFKLEU7QUFGaUIsQztrQkFGUixhIiwiZmlsZSI6ImdhbWUtbG9naWMvbG9naWMvbW9sZS1nYW1lLWxvZ2ljLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGFuZWxzQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvcGFuZWxzLWFjdGlvbi1jcmVhdG9yJyk7XG5jb25zdCBTY3VscHR1cmVBY3Rpb25DcmVhdG9yID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9zY3VscHR1cmUtYWN0aW9uLWNyZWF0b3InKTtcbmNvbnN0IE1vbGVHYW1lQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvbW9sZS1nYW1lLWFjdGlvbi1jcmVhdG9yJyk7XG5jb25zdCB7VHJhY2tlZFBhbmVsc30gPSByZXF1aXJlKCcuLi91dGlscy90cmFja2VkLXBhbmVscycpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2xlR2FtZUxvZ2ljIHtcbiAgLy8gVGhlc2UgYXJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgdG8gdGhlIHNjdWxwdHVyZSBzdG9yZVxuICBzdGF0aWMgdHJhY2tlZFByb3BlcnRpZXMgPSB7XG4gICAgcGFuZWxDb3VudDogMCwgLy8gR2FtZSBwcm9ncmVzcyAoMC4uMzApXG4gICAgcGFuZWxzOiBuZXcgVHJhY2tlZFBhbmVscygpICAvLyBwYW5lbCAtPiBzdGF0ZVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JlLCBjb25maWcpIHtcbiAgICB0aGlzLnN0b3JlID0gc3RvcmU7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5nYW1lQ29uZmlnID0gY29uZmlnLk1PTEVfR0FNRTtcblxuICAgIHRoaXMuX2NvbXBsZXRlID0gZmFsc2U7XG5cbiAgICAvLyBfcmVtYWluaW5nUGFuZWxzIGFyZSB1c2VkIHRvIHNlbGVjdCByYW5kb20gcGFuZWxzXG4gICAgdGhpcy5fcGFuZWxzID0ge307IC8vIFVuaXF1ZSBwYW5lbCBvYmplY3RzLiBUaGVzZSBjYW4gYmUgdXNlZCBpbiB0aGUgX3JlbWFpbmluZ1BhbmVscyBTZXRcbiAgICB0aGlzLl9yZW1haW5pbmdQYW5lbHMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5jb25maWcuTElHSFRTLkdBTUVfU1RSSVBTLmZvckVhY2goc3RyaXBJZCA9PiB7XG4gICAgICB0aGlzLl9saWdodHMuZ2V0KHN0cmlwSWQpLnBhbmVsSWRzLmZvckVhY2gocGFuZWxJZCA9PiB7XG4gICAgICAgIGNvbnN0IHBhbmVsID0geyBzdHJpcElkLCBwYW5lbElkLCBrZXk6IHRoaXMuX2hhc2goc3RyaXBJZCwgcGFuZWxJZCkgfTtcbiAgICAgICAgdGhpcy5fcGFuZWxzW3BhbmVsLmtleV0gPSBwYW5lbDtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nUGFuZWxzLmFkZChwYW5lbCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2FjdGl2ZVRpbWVvdXRzID0ge307XG5cbiAgICB0aGlzLm1vbGVHYW1lQWN0aW9uQ3JlYXRvciA9IG5ldyBNb2xlR2FtZUFjdGlvbkNyZWF0b3IodGhpcy5zdG9yZS5kaXNwYXRjaGVyKTtcbiAgfVxuXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdtb2xlJyk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLl9jb21wbGV0ZSA9IGZhbHNlO1xuICAgIHRoaXMuZGF0YS5zZXQoJ3BhbmVsQ291bnQnLCAwKTtcbiAgICB0aGlzLmRhdGEuc2V0KCdwYW5lbHMnLCBuZXcgVHJhY2tlZFBhbmVscygpKTtcbiAgICB0aGlzLl9yZWdpc3RlclRpbWVvdXQoMCk7IC8vIFJlcXVlc3QgYSBuZXcgYWN0aXZlIHBhbmVsIGltbWVkaWF0ZWx5XG4gIH1cblxuICBlbmQoKSB7XG4gICAgdGhpcy5jb25maWcuTElHSFRTLkdBTUVfU1RSSVBTLmZvckVhY2goc3RyaXBJZCA9PiB0aGlzLl9saWdodHMuZGVhY3RpdmF0ZUFsbChzdHJpcElkKSk7XG4gIH1cblxuICAvKipcbiAgICogaGFuZGxlQWN0aW9uUGF5bG9hZCBtdXN0IF9zeW5jaHJvbm91c2x5XyBjaGFuZ2UgdHJhY2tlZCBkYXRhIGluIHNjdWxwdHVyZSBzdG9yZS5cbiAgICogQW55IGFzeW5jaHJvbm91cyBiZWhhdmlvciBtdXN0IGhhcHBlbiBieSBkaXNwYXRjaGluZyBhY3Rpb25zLlxuICAgKiBXZSdyZSBfbm90XyBhbGxvd2VkIHRvIGRpc3BhdGNoIGFjdGlvbnMgc3luY2hyb25vdXNseS5cbiAgICovXG4gIGhhbmRsZUFjdGlvblBheWxvYWQocGF5bG9hZCkge1xuICAgIGlmICh0aGlzLl9jb21wbGV0ZSkgcmV0dXJuO1xuXG4gICAgY29uc3QgYWN0aW9uSGFuZGxlcnMgPSB7XG4gICAgICBbUGFuZWxzQWN0aW9uQ3JlYXRvci5QQU5FTF9QUkVTU0VEXTogdGhpcy5fYWN0aW9uUGFuZWxQcmVzc2VkLmJpbmQodGhpcyksXG4gICAgICBbTW9sZUdhbWVBY3Rpb25DcmVhdG9yLkFWQUlMX1BBTkVMXTogdGhpcy5fYWN0aW9uQXZhaWxQYW5lbC5iaW5kKHRoaXMpLFxuICAgICAgW01vbGVHYW1lQWN0aW9uQ3JlYXRvci5ERUFWQUlMX1BBTkVMXTogdGhpcy5fYWN0aW9uRGVhdmFpbFBhbmVsLmJpbmQodGhpcyksXG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5GSU5JU0hfU1RBVFVTX0FOSU1BVElPTl06IHRoaXMuX2FjdGlvbkZpbmlzaFN0YXR1c0FuaW1hdGlvbi5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXIgPSBhY3Rpb25IYW5kbGVyc1twYXlsb2FkLmFjdGlvblR5cGVdO1xuICAgIGlmIChhY3Rpb25IYW5kbGVyKSBhY3Rpb25IYW5kbGVyKHBheWxvYWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdlIG9ubHkgaGF2ZSBhIHN0YXR1cyBhbmltYXRpb24gYXQgdGhlIGVuZCBvZiB0aGUgZ2FtZVxuICAgKi9cbiAgX2FjdGlvbkZpbmlzaFN0YXR1c0FuaW1hdGlvbihwYXlsb2FkKSB7XG4gICAgdGhpcy5fY29tcGxldGUgPSB0cnVlO1xuICAgIC8vIFRoZXJlIGlzIGN1cnJlbnRseSBubyB0cmFuc2l0aW9uIG91dCwgc28gd2UgY2FuIHN5bmNocm9ub3VzbHkgc3RhcnQgdGhlIG5leHQgZ2FtZVxuICAgIHRoaXMuc3RvcmUubW92ZVRvTmV4dEdhbWUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3luY2hyb25vdXMgcGFuZWwgYWN0aXZhdGlvblxuICAgKi9cbiAgX2FjdGlvbkF2YWlsUGFuZWwocGFuZWwpIHtcbiAgICB0aGlzLl9hdmFpbFBhbmVsKHBhbmVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3luY2hyb25vdXMgcGFuZWwgZGVhY3RpdmF0aW9uXG4gICAqL1xuICBfYWN0aW9uRGVhdmFpbFBhbmVsKHBhbmVsKSB7XG4gICAgdGhpcy5fZGVhdmFpbFBhbmVsKHBhbmVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBhbiBhY3RpdmUgcGFuZWwgaXMgcHJlc3NlZDpcbiAgICogMSkgVHVybiBwYW5lbCB0byBsb2NhdGlvbiBjb2xvclxuICAgKiAyKSBXYWl0IGEgc2hvcnQgbW9tZW50XG4gICAqIDMpIEF2YWlsIHRoZSBuZXh0IHBhbmVsXG4gICAqIDQpIGluY3JlYXNlL2RlY3JlYXNlICMgb2Ygc2ltdWxhbmVvdXNseSBhY3RpdmUgcGFuZWxzXG4gICAqL1xuICBfYWN0aW9uUGFuZWxQcmVzc2VkKHBheWxvYWQpIHtcbiAgICBsZXQge3N0cmlwSWQsIHBhbmVsSWQsIHByZXNzZWR9ID0gcGF5bG9hZDtcblxuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5kYXRhLmdldCgncGFuZWxzJykuZ2V0UGFuZWxTdGF0ZShzdHJpcElkLCBwYW5lbElkKTtcbiAgICBpZiAoIXN0YXRlIHx8IHN0YXRlID09PSBUcmFja2VkUGFuZWxzLlNUQVRFX09GRikge1xuICAgICAgaWYgKHByZXNzZWQpIHtcbiAgICAgICAgdGhpcy5fbGlnaHRzLnNldENvbG9yKHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMudXNlckNvbG9yKTtcbiAgICAgICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCB0aGlzLmNvbmZpZy5QQU5FTF9ERUZBVUxUUy5BQ1RJVkVfSU5URU5TSVRZKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0RGVmYXVsdENvbG9yKHN0cmlwSWQsIHBhbmVsSWQpO1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMuY29uZmlnLlBBTkVMX0RFRkFVTFRTLklOQUNUSVZFX0lOVEVOU0lUWSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgaGF2ZSBhIHRpbWVvdXQgb24gdGhpcyBwYW5lbCwga2lsbCB0aGUgdGltZW91dFxuICAgIGNvbnN0IGtleSA9IHRoaXMuX2dldFBhbmVsS2V5KHBheWxvYWQpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVUaW1lb3V0cy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fYWN0aXZlVGltZW91dHNba2V5XSk7XG4gICAgICBkZWxldGUgdGhpcy5fYWN0aXZlVGltZW91dHNba2V5XTtcbiAgICB9XG5cbiAgICAvLyBJZiBhbiBhY3RpdmUgcGFuZWwgd2FzIHRvdWNoZWRcbiAgICBpZiAoc3RhdGUgPT09IFRyYWNrZWRQYW5lbHMuU1RBVEVfT04pIHtcbiAgICAgIHRoaXMuX2NvbG9yUGFuZWwoe3N0cmlwSWQsIHBhbmVsSWR9KTtcblxuICAgICAgLy8gQWR2YW5jZSBnYW1lXG4gICAgICBsZXQgcGFuZWxDb3VudCA9IHRoaXMuZGF0YS5nZXQoXCJwYW5lbENvdW50XCIpICsgMTtcbiAgICAgIGlmIChwYW5lbENvdW50ID09PSB0aGlzLmdhbWVDb25maWcuR0FNRV9FTkQpIHtcbiAgICAgICAgdGhpcy5fd2luR2FtZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuZGF0YS5zZXQoJ3BhbmVsQ291bnQnLCBwYW5lbENvdW50KTtcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdG8gYWRkLCByZW1vdmUgb2Yga2VlcCAjIG9mIHNpbXVsdGFuZW91cyBwYW5lbHNcbiAgICAgICAgY29uc3QgYWRkUGFuZWxzID0gMSArICh0aGlzLmdhbWVDb25maWcuTlVNX0FDVElWRV9QQU5FTFNbcGFuZWxDb3VudF0gPyB0aGlzLmdhbWVDb25maWcuTlVNX0FDVElWRV9QQU5FTFNbcGFuZWxDb3VudF0gOiAwKTtcblxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8YWRkUGFuZWxzOyBpKyspIHtcbiAgICAgICAgICB0aGlzLl9yZWdpc3RlclRpbWVvdXQodGhpcy5nYW1lQ29uZmlnLlBBTkVMX1NVQ0NFU1NfREVMQVkpOyAvLyBXYWl0IGJlZm9yZSBuZXh0IHBhbmVsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaGFzaChzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgcmV0dXJuIGAke3N0cmlwSWR9LCR7cGFuZWxJZH1gO1xuICB9XG5cbiAgX2dldFBhbmVsS2V5KHtzdHJpcElkLCBwYW5lbElkfSkge1xuICAgIHJldHVybiB0aGlzLl9oYXNoKHN0cmlwSWQsIHBhbmVsSWQpO1xuICB9XG5cbiAgX2dldFBhbmVsKHtzdHJpcElkLCBwYW5lbElkfSkge1xuICAgIHJldHVybiB0aGlzLl9wYW5lbHNbdGhpcy5faGFzaChzdHJpcElkLCBwYW5lbElkKV07XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0aGUgbmV4dCBhY3RpdmUgcGFuZWwsIGFzIHRoZSBnYW1lIHByb2dyZXNzZXNcbiAgICogUmV0dXJucyB7cGFuZWwsIGxpZmV0aW1lfVxuICAgKi9cbiAgX25leHRBY3RpdmVQYW5lbChjb3VudCkge1xuICAgIGlmIChjb3VudCA8IHRoaXMuZ2FtZUNvbmZpZy5JTklUSUFMX1BBTkVMUy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHBhbmVsID0gdGhpcy5nYW1lQ29uZmlnLklOSVRJQUxfUEFORUxTW2NvdW50XTtcbiAgICAgIHJldHVybiB7IHBhbmVsLCBsaWZldGltZTogdGhpcy5fZ2V0UGFuZWxMaWZldGltZShjb3VudCkgfTsgLy8gTm8gdGltZW91dFxuICAgIH1cbiAgICByZXR1cm4geyBwYW5lbDogdGhpcy5fZ2V0UmFuZG9tUGFuZWwoY291bnQpLCBsaWZldGltZTogdGhpcy5fZ2V0UGFuZWxMaWZldGltZShjb3VudCl9O1xuICB9XG5cbiAgX2dldFJhbmRvbVBhbmVsKGNvdW50KSB7XG4gICAgY29uc3QgaWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fcmVtYWluaW5nUGFuZWxzLnNpemUpO1xuICAgIGNvbnN0IGl0ZXIgPSB0aGlzLl9yZW1haW5pbmdQYW5lbHMudmFsdWVzKCk7XG4gICAgbGV0IGN1cnIgPSBpdGVyLm5leHQoKTtcbiAgICBmb3IgKGxldCBpPTA7IGk8aWR4OyBpKyspIGN1cnIgPSBpdGVyLm5leHQoKTtcbiAgICByZXR1cm4gY3Vyci52YWx1ZTtcbiAgfVxuXG4gIF9nZXRQYW5lbExpZmV0aW1lKGNvdW50KSB7XG4gICAgLy8gZmluZCBsYXN0IGFuZCBuZXh0IGxpZmV0aW1lIHZhbHVlcyBmb3IgaW50ZXJwb2xhdGlvblxuICAgIGxldCBsYXN0LCBuZXh0O1xuICAgIGZvciAobGV0IGVsZW0gb2YgdGhpcy5nYW1lQ29uZmlnLlBBTkVMX0xJRkVUSU1FKSB7XG4gICAgICBpZiAoIWxhc3QgfHwgZWxlbS5jb3VudCA8PSBjb3VudCkgbGFzdCA9IGVsZW07XG4gICAgICBuZXh0ID0gZWxlbTtcbiAgICAgIGlmIChlbGVtLmNvdW50ID4gY291bnQpIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBtaW4sIG1heDtcbiAgICBpZiAobGFzdCA9PT0gbmV4dCkge1xuICAgICAgbWluID0gbGFzdC5yYW5nZVswXTtcbiAgICAgIG1heCA9IGxhc3QucmFuZ2VbMV07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbWluID0gbGFzdC5yYW5nZVswXSArIChuZXh0LnJhbmdlWzBdIC0gbGFzdC5yYW5nZVswXSkgKiAoY291bnQgLSBsYXN0LmNvdW50KSAvIChuZXh0LmNvdW50IC0gbGFzdC5jb3VudCk7XG4gICAgICBtYXggPSBsYXN0LnJhbmdlWzFdICsgKG5leHQucmFuZ2VbMV0gLSBsYXN0LnJhbmdlWzFdKSAqIChjb3VudCAtIGxhc3QuY291bnQpIC8gKG5leHQuY291bnQgLSBsYXN0LmNvdW50KTtcbiAgICB9XG4gICAgcmV0dXJuIDEwMDAgKiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBjYWxsZWQgd2l0aCBhIHBhbmVsLCB3ZSdsbCBtb3ZlIHRoZSBwYW5lbCAoZGVhdmFpbCtwYXVzZSthdmFpbCkuXG4gICAqIElmIGNhbGxlZCB3aXRob3V0IGEgcGFuZWwgd2UnbGwgaW1tZWRpYXRlbHkgYXZhaWwgYSBuZXcgcGFuZWxcbiAgICovXG4gIF9wYW5lbFRpbWVvdXQob2xkUGFuZWwpIHtcbiAgICBpZiAob2xkUGFuZWwpIHtcbiAgICAgIGNvbnN0IGtleSA9IHRoaXMuX2dldFBhbmVsS2V5KG9sZFBhbmVsKTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9hY3RpdmVUaW1lb3V0c1trZXldO1xuICAgICAgdGhpcy5tb2xlR2FtZUFjdGlvbkNyZWF0b3Iuc2VuZERlYXZhaWxQYW5lbChvbGRQYW5lbCk7XG4gICAgICB0aGlzLl9yZWdpc3RlclRpbWVvdXQodGhpcy5nYW1lQ29uZmlnLlBBTkVMX01PVkVfREVMQVkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IHtwYW5lbCwgbGlmZXRpbWV9ID0gdGhpcy5fbmV4dEFjdGl2ZVBhbmVsKHRoaXMuZGF0YS5nZXQoXCJwYW5lbENvdW50XCIpKTtcbiAgICAgIHRoaXMubW9sZUdhbWVBY3Rpb25DcmVhdG9yLnNlbmRBdmFpbFBhbmVsKHBhbmVsKTtcbiAgICAgIHRoaXMuX3JlZ2lzdGVyVGltZW91dChsaWZldGltZSwgcGFuZWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIHdpdGhvdXQgcGFuZWwgdG8gcmVxdWVzdCBhIG5ldyBwYW5lbCBhZnRlciB0aGUgZ2l2ZW4gdGltZW91dFxuICAgKiBDYWxsIHdpdGggcGFuZWwgdG8gdHVybiBvZmYgdGhlIHBhbmVsIGFmdGVyIHRoZSBnaXZlbiB0aW1lb3V0XG4gICAqL1xuICBfcmVnaXN0ZXJUaW1lb3V0KHRpbWVvdXQsIHBhbmVsID0gbnVsbCkge1xuICAgIGNvbnN0IHRpZCA9IHNldFRpbWVvdXQodGhpcy5fcGFuZWxUaW1lb3V0LmJpbmQodGhpcywgcGFuZWwpLCB0aW1lb3V0KTtcbiAgICBpZiAocGFuZWwpIHRoaXMuX2FjdGl2ZVRpbWVvdXRzW3RoaXMuX2dldFBhbmVsS2V5KHBhbmVsKV0gPSB0aWQ7XG4gIH1cblxuICAvLyBGSVhNRTogVGhlIHBhbmVsIHNob3VsZCBhbHNvIHB1bHNlLiBTaG91bGQgdGhlIHB1bHNhdGluZyBzdGF0ZSBiZSBwYXJ0IG9mIHRyYWNrZWQgZGF0YSwgb3Igc2hvdWxkIGVhY2ggdmlldyBkZWR1Y2UgdGhpcyBmcm9tIHRoZSBjdXJyZW50IGdhbWUgYW5kIHN0YXRlP1xuICBfYXZhaWxQYW5lbChwYW5lbCkge1xuICAgIHRoaXMuX3NldFBhbmVsU3RhdGUocGFuZWwsIFRyYWNrZWRQYW5lbHMuU1RBVEVfT04pO1xuICAgIHRoaXMuX3JlbWFpbmluZ1BhbmVscy5kZWxldGUodGhpcy5fZ2V0UGFuZWwocGFuZWwpKTtcbiAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHBhbmVsLnN0cmlwSWQsIHBhbmVsLnBhbmVsSWQsIHRoaXMuZ2FtZUNvbmZpZy5BQ1RJVkVfUEFORUxfSU5URU5TSVRZKTtcbiAgfVxuXG4gIF9kZWF2YWlsUGFuZWwocGFuZWwpIHtcbiAgICB0aGlzLl9yZW1haW5pbmdQYW5lbHMuYWRkKHRoaXMuX2dldFBhbmVsKHBhbmVsKSk7XG4gICAgdGhpcy5fc2V0UGFuZWxTdGF0ZShwYW5lbCwgVHJhY2tlZFBhbmVscy5TVEFURV9PRkYpO1xuICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkocGFuZWwuc3RyaXBJZCwgcGFuZWwucGFuZWxJZCwgdGhpcy5nYW1lQ29uZmlnLklOQUNUSVZFX1BBTkVMX0lOVEVOU0lUWSk7XG4gIH1cblxuICBfY29sb3JQYW5lbChwYW5lbCkge1xuICAgIHRoaXMuX3NldFBhbmVsU3RhdGUocGFuZWwsIFRyYWNrZWRQYW5lbHMuU1RBVEVfSUdOT1JFRCk7XG4gICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShwYW5lbC5zdHJpcElkLCBwYW5lbC5wYW5lbElkLCB0aGlzLmdhbWVDb25maWcuQ09MT1JFRF9QQU5FTF9JTlRFTlNJVFkpO1xuICAgIHRoaXMuX2xpZ2h0cy5zZXRDb2xvcihwYW5lbC5zdHJpcElkLCBwYW5lbC5wYW5lbElkLCB0aGlzLnN0b3JlLnVzZXJDb2xvcik7XG4gIH1cblxuICBfd2luR2FtZSgpIHtcbiAgICB0aGlzLl9saWdodHMuZGVhY3RpdmF0ZUFsbCgpO1xuICAgIHRoaXMuc3RvcmUuc2V0U3VjY2Vzc1N0YXR1cygpO1xuICB9XG5cbiAgZ2V0IF9saWdodHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZGF0YS5nZXQoJ2xpZ2h0cycpO1xuICB9XG5cbiAgX3NldFBhbmVsU3RhdGUoe3N0cmlwSWQsIHBhbmVsSWR9LCBzdGF0ZSkge1xuICAgIHRoaXMuZGF0YS5nZXQoJ3BhbmVscycpLnNldFBhbmVsU3RhdGUoc3RyaXBJZCwgcGFuZWxJZCwgc3RhdGUpO1xuICB9XG5cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
