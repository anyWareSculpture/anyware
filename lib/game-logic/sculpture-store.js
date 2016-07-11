'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var events = require('events');

var GAMES = require('./constants/games');
var HandshakeGameLogic = require('./logic/handshake-game-logic');
var MoleGameLogic = require('./logic/mole-game-logic');
var DiskGameLogic = require('./logic/disk-game-logic');
var SimonGameLogic = require('./logic/simon-game-logic');
var SculptureActionCreator = require('./actions/sculpture-action-creator');
var PanelsActionCreator = require('./actions/panels-action-creator');
var DisksActionCreator = require('./actions/disks-action-creator');
var TrackedData = require('./utils/tracked-data');
var TrackedSet = require('./utils/tracked-set');
var LightArray = require('./utils/light-array');
var Disk = require('./utils/disk');

var SculptureStore = function (_events$EventEmitter) {
  _inherits(SculptureStore, _events$EventEmitter);

  function SculptureStore(dispatcher, config) {
    var _ref;

    _classCallCheck(this, SculptureStore);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SculptureStore).call(this));

    _this.dispatcher = dispatcher;
    _this.config = config;

    _this.data = new TrackedData({
      status: SculptureStore.STATUS_READY,
      panelAnimation: null,
      currentGame: null,
      handshakes: new TrackedSet(),
      lights: new LightArray((_ref = {}, _defineProperty(_ref, _this.config.LIGHTS.STRIP_A, 10), _defineProperty(_ref, _this.config.LIGHTS.STRIP_B, 10), _defineProperty(_ref, _this.config.LIGHTS.STRIP_C, 10), _defineProperty(_ref, _this.config.LIGHTS.PERIMETER_STRIP, 6), _defineProperty(_ref, _this.config.LIGHTS.DISK_LIGHT_STRIP, 3), _defineProperty(_ref, _this.config.LIGHTS.HANDSHAKE_STRIP, 4), _defineProperty(_ref, _this.config.LIGHTS.ART_LIGHTS_STRIP, 3), _ref)),
      disks: new TrackedData({
        disk0: new Disk(),
        disk1: new Disk(),
        disk2: new Disk()
      }),
      handshake: new TrackedData(HandshakeGameLogic.trackedProperties),
      mole: new TrackedData(MoleGameLogic.trackedProperties),
      disk: new TrackedData(DiskGameLogic.trackedProperties),
      simon: new TrackedData(SimonGameLogic.trackedProperties)
    });

    _this.currentGameLogic = null;
    _this.dispatchToken = _this._registerDispatcher(_this.dispatcher);
    _this.sculptureActionCreator = new SculptureActionCreator(_this.dispatcher);
    return _this;
  }

  /**
   * @returns {Boolean} Returns whether the handshake game is currently being played
   */


  _createClass(SculptureStore, [{
    key: 'restoreStatus',


    /**
     * Restores the sculpture's status back to ready
     * Make sure to publish changes after calling this -- not necessary if an action is currently being handled already
     */
    value: function restoreStatus() {
      this.data.set('status', SculptureStore.STATUS_READY);
    }

    /**
     * Locks the sculpture from any input
     * Make sure to publish changes after calling this -- not necessary if an action is currently being handled already
     */

  }, {
    key: 'lock',
    value: function lock() {
      this.data.set('status', SculptureStore.STATUS_LOCKED);
    }

    /**
     * Sets the sculpture's status to success
     */

  }, {
    key: 'setSuccessStatus',
    value: function setSuccessStatus() {
      this.data.set('status', SculptureStore.STATUS_SUCCESS);
    }

    /**
     * Sets the sculpture's status to failure
     */

  }, {
    key: 'setFailureStatus',
    value: function setFailureStatus() {
      this.data.set('status', SculptureStore.STATUS_FAILURE);
    }

    /**
     * Returns whether the sculpture's current status is ready
     */

  }, {
    key: 'playAnimation',


    /**
     * Plays the given animation
     */
    value: function playAnimation(animation) {
      this.data.set('panelAnimation', animation);
      animation.play(this.dispatcher);
    }

    /**
     * Starts the next game in the game sequence
     */

  }, {
    key: 'moveToNextGame',
    value: function moveToNextGame() {
      this._startGame(this._getNextGame());
    }
  }, {
    key: '_startGame',
    value: function _startGame(game) {
      var _gameLogicClasses;

      var gameLogicClasses = (_gameLogicClasses = {}, _defineProperty(_gameLogicClasses, GAMES.HANDSHAKE, HandshakeGameLogic), _defineProperty(_gameLogicClasses, GAMES.MOLE, MoleGameLogic), _defineProperty(_gameLogicClasses, GAMES.DISK, DiskGameLogic), _defineProperty(_gameLogicClasses, GAMES.SIMON, SimonGameLogic), _gameLogicClasses);
      var GameLogic = gameLogicClasses[game];
      if (!GameLogic) {
        throw new Error('Unrecognized game: ' + game);
      }

      // end any previous game
      if (this.currentGameLogic) {
        this.currentGameLogic.end();
      }
      this._resetGamePanels();

      this.data.set('currentGame', game);
      this.currentGameLogic = new GameLogic(this, this.config);
      this.currentGameLogic.start();
    }
  }, {
    key: '_resetGamePanels',
    value: function _resetGamePanels() {
      var lightArray = this.data.get('lights');
      this.config.LIGHTS.GAME_STRIPS.forEach(function (stripId) {
        lightArray.setDefaultColor(stripId);
        lightArray.setDefaultIntensity(stripId);
      });
    }
  }, {
    key: '_publishChanges',
    value: function _publishChanges() {
      var changes = this.data.getChangedCurrentValues();

      if (Object.keys(changes).length) {
        this.emit(SculptureStore.EVENT_CHANGE, changes);
      }

      this.data.clearChanges();
    }
  }, {
    key: '_registerDispatcher',
    value: function _registerDispatcher(dispatcher) {
      return dispatcher.register(this._handleActionPayload.bind(this));
    }
  }, {
    key: '_handleActionPayload',
    value: function _handleActionPayload(payload) {
      if (this.isLocked && !this._actionCanRunWhenLocked(payload.actionType)) {
        return;
      }

      this._delegateAction(payload);

      if (this.currentGameLogic !== null) {
        this.currentGameLogic.handleActionPayload(payload);
      }

      this._publishChanges();
    }
  }, {
    key: '_actionCanRunWhenLocked',
    value: function _actionCanRunWhenLocked(actionType) {
      var enabledActions = new Set([SculptureActionCreator.MERGE_STATE]);
      return enabledActions.has(actionType);
    }
  }, {
    key: '_delegateAction',
    value: function _delegateAction(payload) {
      var _actionHandlers;

      var actionHandlers = (_actionHandlers = {}, _defineProperty(_actionHandlers, SculptureActionCreator.START_GAME, this._actionStartGame.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.START_NEXT_GAME, this._actionStartNextGame.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.MERGE_STATE, this._actionMergeState.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.RESTORE_STATUS, this._actionRestoreStatus.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.ANIMATION_FRAME, this._actionAnimationFrame.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.FINISH_STATUS_ANIMATION, this._actionFinishStatusAnimation.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.HANDSHAKE_ACTIVATE, this._actionHandshakeActivate.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.HANDSHAKE_DEACTIVATE, this._actionHandshakeDeactivate.bind(this)), _defineProperty(_actionHandlers, PanelsActionCreator.PANEL_PRESSED, this._actionPanelPressed.bind(this)), _defineProperty(_actionHandlers, DisksActionCreator.DISK_UPDATE, this._actionDiskUpdate.bind(this)), _actionHandlers);

      var actionHandler = actionHandlers[payload.actionType];
      if (actionHandler) {
        actionHandler(payload);
      }
    }
  }, {
    key: '_actionStartGame',
    value: function _actionStartGame(payload) {
      var game = payload.game;
      if (!game) {
        throw new Error('Unrecognized game: ' + payload.game);
      }

      this._startGame(game);
    }
  }, {
    key: '_actionStartNextGame',
    value: function _actionStartNextGame() {
      this.moveToNextGame();
    }
  }, {
    key: '_actionMergeState',
    value: function _actionMergeState(payload) {
      if (payload.metadata.from === this.username) {
        return;
      }

      var mergeFunctions = {
        status: this._mergeStatus.bind(this),
        lights: this._mergeLights.bind(this),
        disks: this._mergeDisks.bind(this),
        mole: this._mergeMole.bind(this)
      };

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(payload)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var propName = _step.value;

          var mergeFunction = mergeFunctions[propName];
          if (mergeFunction) {
            mergeFunction(payload[propName]);
          }
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
    }
  }, {
    key: '_actionRestoreStatus',
    value: function _actionRestoreStatus(payload) {
      this.restoreStatus();
    }
  }, {
    key: '_actionAnimationFrame',
    value: function _actionAnimationFrame(payload) {
      var callback = payload.callback;


      callback();
    }
  }, {
    key: '_actionFinishStatusAnimation',
    value: function _actionFinishStatusAnimation(payload) {
      this.restoreStatus();
    }
  }, {
    key: '_actionHandshakeActivate',
    value: function _actionHandshakeActivate(payload) {
      this.data.get('handshakes').add(payload.user);
    }
  }, {
    key: '_actionHandshakeDeactivate',
    value: function _actionHandshakeDeactivate(payload) {
      this.data.get('handshakes').delete(payload.user);
    }
  }, {
    key: '_actionPanelPressed',
    value: function _actionPanelPressed(payload) {
      if (!this.isReady) {
        return;
      }

      var lightArray = this.data.get('lights');
      var stripId = payload.stripId;
      var panelId = payload.panelId;
      var pressed = payload.pressed;

      lightArray.activate(stripId, panelId, pressed);
    }
  }, {
    key: '_actionDiskUpdate',
    value: function _actionDiskUpdate(payload) {
      var diskId = payload.diskId;
      var position = payload.position;
      var direction = payload.direction;
      var user = payload.user;


      if (typeof diskId === 'undefined') {
        return;
      }

      var disk = this.data.get('disks').get(diskId);

      if (typeof position !== 'undefined') {
        disk.rotateTo(position);
      }

      if (typeof direction !== 'undefined') {
        disk.setDirection(direction);
      }

      if (typeof user !== 'undefined' && user !== null) {
        disk.setUser(user);
      }
    }
  }, {
    key: '_mergeStatus',
    value: function _mergeStatus(newStatus) {
      this.data.set('status', newStatus);
    }
  }, {
    key: '_mergeLights',
    value: function _mergeLights(lightChanges) {
      var lightArray = this.data.get('lights');

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.keys(lightChanges)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var stripId = _step2.value;

          var panels = lightChanges[stripId].panels;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = Object.keys(panels)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var panelId = _step3.value;

              var panelChanges = panels[panelId];
              if (panelChanges.hasOwnProperty("intensity")) {
                lightArray.setIntensity(stripId, panelId, panelChanges.intensity);
              }
              if (panelChanges.hasOwnProperty("active")) {
                // TODO: Set color based on metadata
                lightArray.activate(stripId, panelId, panelChanges.active);
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: '_mergeDisks',
    value: function _mergeDisks(diskChanges) {
      // TODO
      console.log(diskChanges);
    }
  }, {
    key: '_mergeMole',
    value: function _mergeMole(moleChanges) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = Object.keys(moleChanges)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var propName = _step4.value;

          this.data.get('mole').set(propName, moleChanges[propName]);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: '_getNextGame',
    value: function _getNextGame() {
      var currentGame = this.data.get("currentGame");
      var index = this.config.GAMES_SEQUENCE.indexOf(currentGame);
      index = (index + 1) % this.config.GAMES_SEQUENCE.length;

      return this.config.GAMES_SEQUENCE[index];
    }
  }, {
    key: 'isPlayingHandshakeGame',
    get: function get() {
      return this.currentGameLogic instanceof HandshakeGameLogic;
    }

    /**
     * @returns {Boolean} Returns whether the mole game is currently being played
     */

  }, {
    key: 'isPlayingMoleGame',
    get: function get() {
      return this.currentGameLogic instanceof MoleGameLogic;
    }

    /**
     * @returns {Boolean} Returns whether the disk game is currently being played
     */

  }, {
    key: 'isPlayingDiskGame',
    get: function get() {
      return this.currentGameLogic instanceof DiskGameLogic;
    }

    /**
     * @returns {Boolean} Returns whether the simon game is currently being played
     */

  }, {
    key: 'isPlayingSimonGame',
    get: function get() {
      return this.currentGameLogic instanceof SimonGameLogic;
    }

    /**
     * @returns {Boolean} Returns true if no game is currently being played
     */

  }, {
    key: 'isPlayingNoGame',
    get: function get() {
      return !this.currentGame;
    }

    /**
     * @returns {String} Returns the current user's username
     */

  }, {
    key: 'username',
    get: function get() {
      return this.config.username;
    }

    /**
     *
     */

  }, {
    key: 'userColor',
    get: function get() {
      return this.config.getUserColor(this.config.username);
    }

    /**
     * @returns {Boolean} Returns whether a panel animation is running
     */

  }, {
    key: 'isPanelAnimationRunning',
    get: function get() {
      var panelAnimation = this.data.get('panelAnimation');
      return panelAnimation ? panelAnimation.isRunning : false;
    }
  }, {
    key: 'isReady',
    get: function get() {
      return this.data.get('status') === SculptureStore.STATUS_READY;
    }

    /**
     * Returns whether the sculpture's current status is locked
     */

  }, {
    key: 'isLocked',
    get: function get() {
      return this.data.get('status') === SculptureStore.STATUS_LOCKED;
    }

    /**
     * Returns whether the sculpture's current status is success
     */

  }, {
    key: 'isStatusSuccess',
    get: function get() {
      return this.data.get('status') === SculptureStore.STATUS_SUCCESS;
    }
  }]);

  return SculptureStore;
}(events.EventEmitter);

SculptureStore.EVENT_CHANGE = "change";
SculptureStore.STATUS_READY = "ready";
SculptureStore.STATUS_LOCKED = "locked";
SculptureStore.STATUS_SUCCESS = "success";
SculptureStore.STATUS_FAILURE = "failure";
exports.default = SculptureStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvc2N1bHB0dXJlLXN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxRQUFRLFFBQVEsbUJBQVIsQ0FBZDtBQUNBLElBQU0scUJBQXFCLFFBQVEsOEJBQVIsQ0FBM0I7QUFDQSxJQUFNLGdCQUFnQixRQUFRLHlCQUFSLENBQXRCO0FBQ0EsSUFBTSxnQkFBZ0IsUUFBUSx5QkFBUixDQUF0QjtBQUNBLElBQU0saUJBQWlCLFFBQVEsMEJBQVIsQ0FBdkI7QUFDQSxJQUFNLHlCQUF5QixRQUFRLG9DQUFSLENBQS9CO0FBQ0EsSUFBTSxzQkFBc0IsUUFBUSxpQ0FBUixDQUE1QjtBQUNBLElBQU0scUJBQXFCLFFBQVEsZ0NBQVIsQ0FBM0I7QUFDQSxJQUFNLGNBQWMsUUFBUSxzQkFBUixDQUFwQjtBQUNBLElBQU0sYUFBYSxRQUFRLHFCQUFSLENBQW5CO0FBQ0EsSUFBTSxhQUFhLFFBQVEscUJBQVIsQ0FBbkI7QUFDQSxJQUFNLE9BQU8sUUFBUSxjQUFSLENBQWI7O0lBRXFCLGM7OztBQVFuQiwwQkFBWSxVQUFaLEVBQXdCLE1BQXhCLEVBQWdDO0FBQUE7O0FBQUE7O0FBQUE7O0FBRzlCLFVBQUssVUFBTCxHQUFrQixVQUFsQjtBQUNBLFVBQUssTUFBTCxHQUFjLE1BQWQ7O0FBRUEsVUFBSyxJQUFMLEdBQVksSUFBSSxXQUFKLENBQWdCO0FBQzFCLGNBQVEsZUFBZSxZQURHO0FBRTFCLHNCQUFnQixJQUZVO0FBRzFCLG1CQUFhLElBSGE7QUFJMUIsa0JBQVksSUFBSSxVQUFKLEVBSmM7QUFLMUIsY0FBUSxJQUFJLFVBQUosbUNBRUwsTUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixPQUZkLEVBRXdCLEVBRnhCLHlCQUdMLE1BQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsT0FIZCxFQUd3QixFQUh4Qix5QkFJTCxNQUFLLE1BQUwsQ0FBWSxN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R1osWSxHQUFlLE87QUFISCxjLENBSVosYSxHQUFnQixRO0FBSkosYyxDQUtaLGMsR0FBaUIsUztBQUxMLGMsQ0FNWixjLEdBQWlCLFM7a0JBTkwsYyIsImZpbGUiOiJnYW1lLWxvZ2ljL3NjdWxwdHVyZS1zdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5jb25zdCBHQU1FUyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL2dhbWVzJyk7XG5jb25zdCBIYW5kc2hha2VHYW1lTG9naWMgPSByZXF1aXJlKCcuL2xvZ2ljL2hhbmRzaGFrZS1nYW1lLWxvZ2ljJyk7XG5jb25zdCBNb2xlR2FtZUxvZ2ljID0gcmVxdWlyZSgnLi9sb2dpYy9tb2xlLWdhbWUtbG9naWMnKTtcbmNvbnN0IERpc2tHYW1lTG9naWMgPSByZXF1aXJlKCcuL2xvZ2ljL2Rpc2stZ2FtZS1sb2dpYycpO1xuY29uc3QgU2ltb25HYW1lTG9naWMgPSByZXF1aXJlKCcuL2xvZ2ljL3NpbW9uLWdhbWUtbG9naWMnKTtcbmNvbnN0IFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IgPSByZXF1aXJlKCcuL2FjdGlvbnMvc2N1bHB0dXJlLWFjdGlvbi1jcmVhdG9yJyk7XG5jb25zdCBQYW5lbHNBY3Rpb25DcmVhdG9yID0gcmVxdWlyZSgnLi9hY3Rpb25zL3BhbmVscy1hY3Rpb24tY3JlYXRvcicpO1xuY29uc3QgRGlza3NBY3Rpb25DcmVhdG9yID0gcmVxdWlyZSgnLi9hY3Rpb25zL2Rpc2tzLWFjdGlvbi1jcmVhdG9yJyk7XG5jb25zdCBUcmFja2VkRGF0YSA9IHJlcXVpcmUoJy4vdXRpbHMvdHJhY2tlZC1kYXRhJyk7XG5jb25zdCBUcmFja2VkU2V0ID0gcmVxdWlyZSgnLi91dGlscy90cmFja2VkLXNldCcpO1xuY29uc3QgTGlnaHRBcnJheSA9IHJlcXVpcmUoJy4vdXRpbHMvbGlnaHQtYXJyYXknKTtcbmNvbnN0IERpc2sgPSByZXF1aXJlKCcuL3V0aWxzL2Rpc2snKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2N1bHB0dXJlU3RvcmUgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcbiAgc3RhdGljIEVWRU5UX0NIQU5HRSA9IFwiY2hhbmdlXCI7XG5cbiAgc3RhdGljIFNUQVRVU19SRUFEWSA9IFwicmVhZHlcIjtcbiAgc3RhdGljIFNUQVRVU19MT0NLRUQgPSBcImxvY2tlZFwiO1xuICBzdGF0aWMgU1RBVFVTX1NVQ0NFU1MgPSBcInN1Y2Nlc3NcIjtcbiAgc3RhdGljIFNUQVRVU19GQUlMVVJFID0gXCJmYWlsdXJlXCI7XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlciwgY29uZmlnKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG5cbiAgICB0aGlzLmRhdGEgPSBuZXcgVHJhY2tlZERhdGEoe1xuICAgICAgc3RhdHVzOiBTY3VscHR1cmVTdG9yZS5TVEFUVVNfUkVBRFksXG4gICAgICBwYW5lbEFuaW1hdGlvbjogbnVsbCxcbiAgICAgIGN1cnJlbnRHYW1lOiBudWxsLFxuICAgICAgaGFuZHNoYWtlczogbmV3IFRyYWNrZWRTZXQoKSxcbiAgICAgIGxpZ2h0czogbmV3IExpZ2h0QXJyYXkoe1xuICAgICAgICAvLyBzdHJpcElkIDogbnVtYmVyIG9mIHBhbmVsc1xuICAgICAgICBbdGhpcy5jb25maWcuTElHSFRTLlNUUklQX0FdOiAxMCxcbiAgICAgICAgW3RoaXMuY29uZmlnLkxJR0hUUy5TVFJJUF9CXTogMTAsXG4gICAgICAgIFt0aGlzLmNvbmZpZy5MSUdIVFMuU1RSSVBfQ106IDEwLFxuICAgICAgICBbdGhpcy5jb25maWcuTElHSFRTLlBFUklNRVRFUl9TVFJJUF06IDYsXG4gICAgICAgIFt0aGlzLmNvbmZpZy5MSUdIVFMuRElTS19MSUdIVF9TVFJJUF06IDMsXG4gICAgICAgIFt0aGlzLmNvbmZpZy5MSUdIVFMuSEFORFNIQUtFX1NUUklQXTogNCxcbiAgICAgICAgW3RoaXMuY29uZmlnLkxJR0hUUy5BUlRfTElHSFRTX1NUUklQXTogM1xuICAgICAgfSksXG4gICAgICBkaXNrczogbmV3IFRyYWNrZWREYXRhKHtcbiAgICAgICAgZGlzazA6IG5ldyBEaXNrKCksXG4gICAgICAgIGRpc2sxOiBuZXcgRGlzaygpLFxuICAgICAgICBkaXNrMjogbmV3IERpc2soKVxuICAgICAgfSksXG4gICAgICBoYW5kc2hha2U6IG5ldyBUcmFja2VkRGF0YShIYW5kc2hha2VHYW1lTG9naWMudHJhY2tlZFByb3BlcnRpZXMpLFxuICAgICAgbW9sZTogbmV3IFRyYWNrZWREYXRhKE1vbGVHYW1lTG9naWMudHJhY2tlZFByb3BlcnRpZXMpLFxuICAgICAgZGlzazogbmV3IFRyYWNrZWREYXRhKERpc2tHYW1lTG9naWMudHJhY2tlZFByb3BlcnRpZXMpLFxuICAgICAgc2ltb246IG5ldyBUcmFja2VkRGF0YShTaW1vbkdhbWVMb2dpYy50cmFja2VkUHJvcGVydGllcylcbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudEdhbWVMb2dpYyA9IG51bGw7XG4gICAgdGhpcy5kaXNwYXRjaFRva2VuID0gdGhpcy5fcmVnaXN0ZXJEaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgdGhpcy5zY3VscHR1cmVBY3Rpb25DcmVhdG9yID0gbmV3IFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IodGhpcy5kaXNwYXRjaGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyB3aGV0aGVyIHRoZSBoYW5kc2hha2UgZ2FtZSBpcyBjdXJyZW50bHkgYmVpbmcgcGxheWVkXG4gICAqL1xuICBnZXQgaXNQbGF5aW5nSGFuZHNoYWtlR2FtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50R2FtZUxvZ2ljIGluc3RhbmNlb2YgSGFuZHNoYWtlR2FtZUxvZ2ljO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIHdoZXRoZXIgdGhlIG1vbGUgZ2FtZSBpcyBjdXJyZW50bHkgYmVpbmcgcGxheWVkXG4gICAqL1xuICBnZXQgaXNQbGF5aW5nTW9sZUdhbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEdhbWVMb2dpYyBpbnN0YW5jZW9mIE1vbGVHYW1lTG9naWM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge0Jvb2xlYW59IFJldHVybnMgd2hldGhlciB0aGUgZGlzayBnYW1lIGlzIGN1cnJlbnRseSBiZWluZyBwbGF5ZWRcbiAgICovXG4gIGdldCBpc1BsYXlpbmdEaXNrR2FtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50R2FtZUxvZ2ljIGluc3RhbmNlb2YgRGlza0dhbWVMb2dpYztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyB3aGV0aGVyIHRoZSBzaW1vbiBnYW1lIGlzIGN1cnJlbnRseSBiZWluZyBwbGF5ZWRcbiAgICovXG4gIGdldCBpc1BsYXlpbmdTaW1vbkdhbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEdhbWVMb2dpYyBpbnN0YW5jZW9mIFNpbW9uR2FtZUxvZ2ljO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgbm8gZ2FtZSBpcyBjdXJyZW50bHkgYmVpbmcgcGxheWVkXG4gICAqL1xuICBnZXQgaXNQbGF5aW5nTm9HYW1lKCkge1xuICAgIHJldHVybiAhdGhpcy5jdXJyZW50R2FtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBSZXR1cm5zIHRoZSBjdXJyZW50IHVzZXIncyB1c2VybmFtZVxuICAgKi9cbiAgZ2V0IHVzZXJuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy51c2VybmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgZ2V0IHVzZXJDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0VXNlckNvbG9yKHRoaXMuY29uZmlnLnVzZXJuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyB3aGV0aGVyIGEgcGFuZWwgYW5pbWF0aW9uIGlzIHJ1bm5pbmdcbiAgICovXG4gIGdldCBpc1BhbmVsQW5pbWF0aW9uUnVubmluZygpIHtcbiAgICBjb25zdCBwYW5lbEFuaW1hdGlvbiA9IHRoaXMuZGF0YS5nZXQoJ3BhbmVsQW5pbWF0aW9uJyk7XG4gICAgcmV0dXJuIHBhbmVsQW5pbWF0aW9uID8gcGFuZWxBbmltYXRpb24uaXNSdW5uaW5nIDogZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZXMgdGhlIHNjdWxwdHVyZSdzIHN0YXR1cyBiYWNrIHRvIHJlYWR5XG4gICAqIE1ha2Ugc3VyZSB0byBwdWJsaXNoIGNoYW5nZXMgYWZ0ZXIgY2FsbGluZyB0aGlzIC0tIG5vdCBuZWNlc3NhcnkgaWYgYW4gYWN0aW9uIGlzIGN1cnJlbnRseSBiZWluZyBoYW5kbGVkIGFscmVhZHlcbiAgICovXG4gIHJlc3RvcmVTdGF0dXMoKSB7XG4gICAgdGhpcy5kYXRhLnNldCgnc3RhdHVzJywgU2N1bHB0dXJlU3RvcmUuU1RBVFVTX1JFQURZKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2NrcyB0aGUgc2N1bHB0dXJlIGZyb20gYW55IGlucHV0XG4gICAqIE1ha2Ugc3VyZSB0byBwdWJsaXNoIGNoYW5nZXMgYWZ0ZXIgY2FsbGluZyB0aGlzIC0tIG5vdCBuZWNlc3NhcnkgaWYgYW4gYWN0aW9uIGlzIGN1cnJlbnRseSBiZWluZyBoYW5kbGVkIGFscmVhZHlcbiAgICovXG4gIGxvY2soKSB7XG4gICAgdGhpcy5kYXRhLnNldCgnc3RhdHVzJywgU2N1bHB0dXJlU3RvcmUuU1RBVFVTX0xPQ0tFRCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2N1bHB0dXJlJ3Mgc3RhdHVzIHRvIHN1Y2Nlc3NcbiAgICovXG4gIHNldFN1Y2Nlc3NTdGF0dXMoKSB7XG4gICAgdGhpcy5kYXRhLnNldCgnc3RhdHVzJywgU2N1bHB0dXJlU3RvcmUuU1RBVFVTX1NVQ0NFU1MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNjdWxwdHVyZSdzIHN0YXR1cyB0byBmYWlsdXJlXG4gICAqL1xuICBzZXRGYWlsdXJlU3RhdHVzKCkge1xuICAgIHRoaXMuZGF0YS5zZXQoJ3N0YXR1cycsIFNjdWxwdHVyZVN0b3JlLlNUQVRVU19GQUlMVVJFKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNjdWxwdHVyZSdzIGN1cnJlbnQgc3RhdHVzIGlzIHJlYWR5XG4gICAqL1xuICBnZXQgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldCgnc3RhdHVzJykgPT09IFNjdWxwdHVyZVN0b3JlLlNUQVRVU19SRUFEWTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNjdWxwdHVyZSdzIGN1cnJlbnQgc3RhdHVzIGlzIGxvY2tlZFxuICAgKi9cbiAgZ2V0IGlzTG9ja2VkKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0KCdzdGF0dXMnKSA9PT0gU2N1bHB0dXJlU3RvcmUuU1RBVFVTX0xPQ0tFRDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNjdWxwdHVyZSdzIGN1cnJlbnQgc3RhdHVzIGlzIHN1Y2Nlc3NcbiAgICovXG4gIGdldCBpc1N0YXR1c1N1Y2Nlc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXQoJ3N0YXR1cycpID09PSBTY3VscHR1cmVTdG9yZS5TVEFUVVNfU1VDQ0VTUztcbiAgfVxuXG4gIC8qKlxuICAgKiBQbGF5cyB0aGUgZ2l2ZW4gYW5pbWF0aW9uXG4gICAqL1xuICBwbGF5QW5pbWF0aW9uKGFuaW1hdGlvbikge1xuICAgIHRoaXMuZGF0YS5zZXQoJ3BhbmVsQW5pbWF0aW9uJywgYW5pbWF0aW9uKTtcbiAgICBhbmltYXRpb24ucGxheSh0aGlzLmRpc3BhdGNoZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgbmV4dCBnYW1lIGluIHRoZSBnYW1lIHNlcXVlbmNlXG4gICAqL1xuICBtb3ZlVG9OZXh0R2FtZSgpIHtcbiAgICB0aGlzLl9zdGFydEdhbWUodGhpcy5fZ2V0TmV4dEdhbWUoKSk7XG4gIH1cblxuICBfc3RhcnRHYW1lKGdhbWUpIHtcbiAgICBjb25zdCBnYW1lTG9naWNDbGFzc2VzID0ge1xuICAgICAgW0dBTUVTLkhBTkRTSEFLRV06IEhhbmRzaGFrZUdhbWVMb2dpYyxcbiAgICAgIFtHQU1FUy5NT0xFXTogTW9sZUdhbWVMb2dpYyxcbiAgICAgIFtHQU1FUy5ESVNLXTogRGlza0dhbWVMb2dpYyxcbiAgICAgIFtHQU1FUy5TSU1PTl06IFNpbW9uR2FtZUxvZ2ljXG4gICAgfTtcbiAgICBjb25zdCBHYW1lTG9naWMgPSBnYW1lTG9naWNDbGFzc2VzW2dhbWVdO1xuICAgIGlmICghR2FtZUxvZ2ljKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBnYW1lOiAke2dhbWV9YCk7XG4gICAgfVxuXG4gICAgLy8gZW5kIGFueSBwcmV2aW91cyBnYW1lXG4gICAgaWYgKHRoaXMuY3VycmVudEdhbWVMb2dpYykge1xuICAgICAgdGhpcy5jdXJyZW50R2FtZUxvZ2ljLmVuZCgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXNldEdhbWVQYW5lbHMoKTtcblxuICAgIHRoaXMuZGF0YS5zZXQoJ2N1cnJlbnRHYW1lJywgZ2FtZSk7XG4gICAgdGhpcy5jdXJyZW50R2FtZUxvZ2ljID0gbmV3IEdhbWVMb2dpYyh0aGlzLCB0aGlzLmNvbmZpZyk7XG4gICAgdGhpcy5jdXJyZW50R2FtZUxvZ2ljLnN0YXJ0KCk7XG4gIH1cblxuICBfcmVzZXRHYW1lUGFuZWxzKCkge1xuICAgIGNvbnN0IGxpZ2h0QXJyYXkgPSB0aGlzLmRhdGEuZ2V0KCdsaWdodHMnKTtcbiAgICB0aGlzLmNvbmZpZy5MSUdIVFMuR0FNRV9TVFJJUFMuZm9yRWFjaCgoc3RyaXBJZCkgPT4ge1xuICAgICAgbGlnaHRBcnJheS5zZXREZWZhdWx0Q29sb3Ioc3RyaXBJZCk7XG4gICAgICBsaWdodEFycmF5LnNldERlZmF1bHRJbnRlbnNpdHkoc3RyaXBJZCk7XG4gICAgfSk7XG4gIH1cblxuICBfcHVibGlzaENoYW5nZXMoKSB7XG4gICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuZGF0YS5nZXRDaGFuZ2VkQ3VycmVudFZhbHVlcygpO1xuXG4gICAgaWYgKE9iamVjdC5rZXlzKGNoYW5nZXMpLmxlbmd0aCkge1xuICAgICAgdGhpcy5lbWl0KFNjdWxwdHVyZVN0b3JlLkVWRU5UX0NIQU5HRSwgY2hhbmdlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLmNsZWFyQ2hhbmdlcygpO1xuICB9XG5cbiAgX3JlZ2lzdGVyRGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5faGFuZGxlQWN0aW9uUGF5bG9hZC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIF9oYW5kbGVBY3Rpb25QYXlsb2FkKHBheWxvYWQpIHtcbiAgICBpZiAodGhpcy5pc0xvY2tlZCAmJiAhdGhpcy5fYWN0aW9uQ2FuUnVuV2hlbkxvY2tlZChwYXlsb2FkLmFjdGlvblR5cGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZGVsZWdhdGVBY3Rpb24ocGF5bG9hZCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50R2FtZUxvZ2ljICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmN1cnJlbnRHYW1lTG9naWMuaGFuZGxlQWN0aW9uUGF5bG9hZChwYXlsb2FkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wdWJsaXNoQ2hhbmdlcygpO1xuICB9XG5cbiAgX2FjdGlvbkNhblJ1bldoZW5Mb2NrZWQoYWN0aW9uVHlwZSkge1xuICAgIGNvbnN0IGVuYWJsZWRBY3Rpb25zID0gbmV3IFNldChbXG4gICAgICBTY3VscHR1cmVBY3Rpb25DcmVhdG9yLk1FUkdFX1NUQVRFXG4gICAgXSk7XG4gICAgcmV0dXJuIGVuYWJsZWRBY3Rpb25zLmhhcyhhY3Rpb25UeXBlKTtcbiAgfVxuXG4gIF9kZWxlZ2F0ZUFjdGlvbihwYXlsb2FkKSB7XG4gICAgY29uc3QgYWN0aW9uSGFuZGxlcnMgPSB7XG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5TVEFSVF9HQU1FXTogdGhpcy5fYWN0aW9uU3RhcnRHYW1lLmJpbmQodGhpcyksXG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5TVEFSVF9ORVhUX0dBTUVdOiB0aGlzLl9hY3Rpb25TdGFydE5leHRHYW1lLmJpbmQodGhpcyksXG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5NRVJHRV9TVEFURV06IHRoaXMuX2FjdGlvbk1lcmdlU3RhdGUuYmluZCh0aGlzKSxcbiAgICAgIFtTY3VscHR1cmVBY3Rpb25DcmVhdG9yLlJFU1RPUkVfU1RBVFVTXTogdGhpcy5fYWN0aW9uUmVzdG9yZVN0YXR1cy5iaW5kKHRoaXMpLFxuICAgICAgW1NjdWxwdHVyZUFjdGlvbkNyZWF0b3IuQU5JTUFUSU9OX0ZSQU1FXTogdGhpcy5fYWN0aW9uQW5pbWF0aW9uRnJhbWUuYmluZCh0aGlzKSxcbiAgICAgIFtTY3VscHR1cmVBY3Rpb25DcmVhdG9yLkZJTklTSF9TVEFUVVNfQU5JTUFUSU9OXTogdGhpcy5fYWN0aW9uRmluaXNoU3RhdHVzQW5pbWF0aW9uLmJpbmQodGhpcyksXG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5IQU5EU0hBS0VfQUNUSVZBVEVdOiB0aGlzLl9hY3Rpb25IYW5kc2hha2VBY3RpdmF0ZS5iaW5kKHRoaXMpLFxuICAgICAgW1NjdWxwdHVyZUFjdGlvbkNyZWF0b3IuSEFORFNIQUtFX0RFQUNUSVZBVEVdOiB0aGlzLl9hY3Rpb25IYW5kc2hha2VEZWFjdGl2YXRlLmJpbmQodGhpcyksXG4gICAgICBbUGFuZWxzQWN0aW9uQ3JlYXRvci5QQU5FTF9QUkVTU0VEXTogdGhpcy5fYWN0aW9uUGFuZWxQcmVzc2VkLmJpbmQodGhpcyksXG4gICAgICBbRGlza3NBY3Rpb25DcmVhdG9yLkRJU0tfVVBEQVRFXTogdGhpcy5fYWN0aW9uRGlza1VwZGF0ZS5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXIgPSBhY3Rpb25IYW5kbGVyc1twYXlsb2FkLmFjdGlvblR5cGVdO1xuICAgIGlmIChhY3Rpb25IYW5kbGVyKSB7XG4gICAgICBhY3Rpb25IYW5kbGVyKHBheWxvYWQpO1xuICAgIH1cbiAgfVxuXG4gIF9hY3Rpb25TdGFydEdhbWUocGF5bG9hZCkge1xuICAgIGNvbnN0IGdhbWUgPSBwYXlsb2FkLmdhbWU7XG4gICAgaWYgKCFnYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBnYW1lOiAke3BheWxvYWQuZ2FtZX1gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdGFydEdhbWUoZ2FtZSk7XG4gIH1cblxuICBfYWN0aW9uU3RhcnROZXh0R2FtZSgpIHtcbiAgICB0aGlzLm1vdmVUb05leHRHYW1lKCk7XG4gIH1cblxuICBfYWN0aW9uTWVyZ2VTdGF0ZShwYXlsb2FkKSB7XG4gICAgaWYgKHBheWxvYWQubWV0YWRhdGEuZnJvbSA9PT0gdGhpcy51c2VybmFtZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1lcmdlRnVuY3Rpb25zID0ge1xuICAgICAgc3RhdHVzOiB0aGlzLl9tZXJnZVN0YXR1cy5iaW5kKHRoaXMpLFxuICAgICAgbGlnaHRzOiB0aGlzLl9tZXJnZUxpZ2h0cy5iaW5kKHRoaXMpLFxuICAgICAgZGlza3M6IHRoaXMuX21lcmdlRGlza3MuYmluZCh0aGlzKSxcbiAgICAgIG1vbGU6IHRoaXMuX21lcmdlTW9sZS5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIGZvciAobGV0IHByb3BOYW1lIG9mIE9iamVjdC5rZXlzKHBheWxvYWQpKSB7XG4gICAgICBjb25zdCBtZXJnZUZ1bmN0aW9uID0gbWVyZ2VGdW5jdGlvbnNbcHJvcE5hbWVdO1xuICAgICAgaWYgKG1lcmdlRnVuY3Rpb24pIHtcbiAgICAgICAgbWVyZ2VGdW5jdGlvbihwYXlsb2FkW3Byb3BOYW1lXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2FjdGlvblJlc3RvcmVTdGF0dXMocGF5bG9hZCkge1xuICAgIHRoaXMucmVzdG9yZVN0YXR1cygpO1xuICB9XG5cbiAgX2FjdGlvbkFuaW1hdGlvbkZyYW1lKHBheWxvYWQpIHtcbiAgICBjb25zdCB7Y2FsbGJhY2t9ID0gcGF5bG9hZDtcblxuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBfYWN0aW9uRmluaXNoU3RhdHVzQW5pbWF0aW9uKHBheWxvYWQpIHtcbiAgICB0aGlzLnJlc3RvcmVTdGF0dXMoKTtcbiAgfVxuXG4gIF9hY3Rpb25IYW5kc2hha2VBY3RpdmF0ZShwYXlsb2FkKSB7XG4gICAgdGhpcy5kYXRhLmdldCgnaGFuZHNoYWtlcycpLmFkZChwYXlsb2FkLnVzZXIpO1xuICB9XG5cbiAgX2FjdGlvbkhhbmRzaGFrZURlYWN0aXZhdGUocGF5bG9hZCkge1xuICAgIHRoaXMuZGF0YS5nZXQoJ2hhbmRzaGFrZXMnKS5kZWxldGUocGF5bG9hZC51c2VyKTtcbiAgfVxuXG4gIF9hY3Rpb25QYW5lbFByZXNzZWQocGF5bG9hZCkge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGlnaHRBcnJheSA9IHRoaXMuZGF0YS5nZXQoJ2xpZ2h0cycpO1xuICAgIGNvbnN0IHtzdHJpcElkLCBwYW5lbElkLCBwcmVzc2VkfSA9IHBheWxvYWQ7XG4gICAgbGlnaHRBcnJheS5hY3RpdmF0ZShzdHJpcElkLCBwYW5lbElkLCBwcmVzc2VkKTtcbiAgfVxuXG4gIF9hY3Rpb25EaXNrVXBkYXRlKHBheWxvYWQpIHtcbiAgICBsZXQge2Rpc2tJZCwgcG9zaXRpb24sIGRpcmVjdGlvbiwgdXNlcn0gPSBwYXlsb2FkO1xuXG4gICAgaWYgKHR5cGVvZiBkaXNrSWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGlzayA9IHRoaXMuZGF0YS5nZXQoJ2Rpc2tzJykuZ2V0KGRpc2tJZCk7XG5cbiAgICBpZiAodHlwZW9mIHBvc2l0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZGlzay5yb3RhdGVUbyhwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkaXJlY3Rpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBkaXNrLnNldERpcmVjdGlvbihkaXJlY3Rpb24pO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdXNlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdXNlciAhPT0gbnVsbCkge1xuICAgICAgZGlzay5zZXRVc2VyKHVzZXIpO1xuICAgIH1cbiAgfVxuXG4gIF9tZXJnZVN0YXR1cyhuZXdTdGF0dXMpIHtcbiAgICB0aGlzLmRhdGEuc2V0KCdzdGF0dXMnLCBuZXdTdGF0dXMpO1xuICB9XG5cbiAgX21lcmdlTGlnaHRzKGxpZ2h0Q2hhbmdlcykge1xuICAgIGNvbnN0IGxpZ2h0QXJyYXkgPSB0aGlzLmRhdGEuZ2V0KCdsaWdodHMnKTtcblxuICAgIGZvciAobGV0IHN0cmlwSWQgb2YgT2JqZWN0LmtleXMobGlnaHRDaGFuZ2VzKSkge1xuICAgICAgY29uc3QgcGFuZWxzID0gbGlnaHRDaGFuZ2VzW3N0cmlwSWRdLnBhbmVscztcbiAgICAgIGZvciAobGV0IHBhbmVsSWQgb2YgT2JqZWN0LmtleXMocGFuZWxzKSkge1xuICAgICAgICBjb25zdCBwYW5lbENoYW5nZXMgPSBwYW5lbHNbcGFuZWxJZF07XG4gICAgICAgIGlmIChwYW5lbENoYW5nZXMuaGFzT3duUHJvcGVydHkoXCJpbnRlbnNpdHlcIikpIHtcbiAgICAgICAgICBsaWdodEFycmF5LnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCBwYW5lbENoYW5nZXMuaW50ZW5zaXR5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFuZWxDaGFuZ2VzLmhhc093blByb3BlcnR5KFwiYWN0aXZlXCIpKSB7XG4gICAgICAgICAgLy8gVE9ETzogU2V0IGNvbG9yIGJhc2VkIG9uIG1ldGFkYXRhXG4gICAgICAgICAgbGlnaHRBcnJheS5hY3RpdmF0ZShzdHJpcElkLCBwYW5lbElkLCBwYW5lbENoYW5nZXMuYWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9tZXJnZURpc2tzKGRpc2tDaGFuZ2VzKSB7XG4gICAgLy8gVE9ET1xuICAgIGNvbnNvbGUubG9nKGRpc2tDaGFuZ2VzKTtcbiAgfVxuXG4gIF9tZXJnZU1vbGUobW9sZUNoYW5nZXMpIHtcbiAgICBmb3IgKGxldCBwcm9wTmFtZSBvZiBPYmplY3Qua2V5cyhtb2xlQ2hhbmdlcykpIHtcbiAgICAgIHRoaXMuZGF0YS5nZXQoJ21vbGUnKS5zZXQocHJvcE5hbWUsIG1vbGVDaGFuZ2VzW3Byb3BOYW1lXSk7XG4gICAgfVxuICB9XG5cbiAgX2dldE5leHRHYW1lKCkge1xuICAgIGNvbnN0IGN1cnJlbnRHYW1lID0gdGhpcy5kYXRhLmdldChcImN1cnJlbnRHYW1lXCIpO1xuICAgIGxldCBpbmRleCA9IHRoaXMuY29uZmlnLkdBTUVTX1NFUVVFTkNFLmluZGV4T2YoY3VycmVudEdhbWUpO1xuICAgIGluZGV4ID0gKGluZGV4ICsgMSkgJSB0aGlzLmNvbmZpZy5HQU1FU19TRVFVRU5DRS5sZW5ndGg7XG5cbiAgICByZXR1cm4gdGhpcy5jb25maWcuR0FNRVNfU0VRVUVOQ0VbaW5kZXhdO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
