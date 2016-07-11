'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _games = require('./constants/games');

var _games2 = _interopRequireDefault(_games);

var _handshakeGameLogic = require('./logic/handshake-game-logic');

var _handshakeGameLogic2 = _interopRequireDefault(_handshakeGameLogic);

var _moleGameLogic = require('./logic/mole-game-logic');

var _moleGameLogic2 = _interopRequireDefault(_moleGameLogic);

var _diskGameLogic = require('./logic/disk-game-logic');

var _diskGameLogic2 = _interopRequireDefault(_diskGameLogic);

var _simonGameLogic = require('./logic/simon-game-logic');

var _simonGameLogic2 = _interopRequireDefault(_simonGameLogic);

var _sculptureActionCreator = require('./actions/sculpture-action-creator');

var _sculptureActionCreator2 = _interopRequireDefault(_sculptureActionCreator);

var _panelsActionCreator = require('./actions/panels-action-creator');

var _panelsActionCreator2 = _interopRequireDefault(_panelsActionCreator);

var _disksActionCreator = require('./actions/disks-action-creator');

var _disksActionCreator2 = _interopRequireDefault(_disksActionCreator);

var _trackedData = require('./utils/tracked-data');

var _trackedData2 = _interopRequireDefault(_trackedData);

var _trackedSet = require('./utils/tracked-set');

var _trackedSet2 = _interopRequireDefault(_trackedSet);

var _lightArray = require('./utils/light-array');

var _lightArray2 = _interopRequireDefault(_lightArray);

var _disk = require('./utils/disk');

var _disk2 = _interopRequireDefault(_disk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var events = require('events');

var SculptureStore = function (_events$EventEmitter) {
  _inherits(SculptureStore, _events$EventEmitter);

  function SculptureStore(dispatcher, config) {
    var _ref;

    _classCallCheck(this, SculptureStore);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SculptureStore).call(this));

    _this.dispatcher = dispatcher;
    _this.config = config;

    _this.data = new _trackedData2.default({
      status: SculptureStore.STATUS_READY,
      panelAnimation: null,
      currentGame: null,
      handshakes: new _trackedSet2.default(),
      lights: new _lightArray2.default((_ref = {}, _defineProperty(_ref, _this.config.LIGHTS.STRIP_A, 10), _defineProperty(_ref, _this.config.LIGHTS.STRIP_B, 10), _defineProperty(_ref, _this.config.LIGHTS.STRIP_C, 10), _defineProperty(_ref, _this.config.LIGHTS.PERIMETER_STRIP, 6), _defineProperty(_ref, _this.config.LIGHTS.DISK_LIGHT_STRIP, 3), _defineProperty(_ref, _this.config.LIGHTS.HANDSHAKE_STRIP, 4), _defineProperty(_ref, _this.config.LIGHTS.ART_LIGHTS_STRIP, 3), _ref)),
      disks: new _trackedData2.default({
        disk0: new _disk2.default(),
        disk1: new _disk2.default(),
        disk2: new _disk2.default()
      }),
      handshake: new _trackedData2.default(_handshakeGameLogic2.default.trackedProperties),
      mole: new _trackedData2.default(_moleGameLogic2.default.trackedProperties),
      disk: new _trackedData2.default(_diskGameLogic2.default.trackedProperties),
      simon: new _trackedData2.default(_simonGameLogic2.default.trackedProperties)
    });

    _this.currentGameLogic = null;
    _this.dispatchToken = _this._registerDispatcher(_this.dispatcher);
    _this.sculptureActionCreator = new _sculptureActionCreator2.default(_this.dispatcher);
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

      var gameLogicClasses = (_gameLogicClasses = {}, _defineProperty(_gameLogicClasses, _games2.default.HANDSHAKE, _handshakeGameLogic2.default), _defineProperty(_gameLogicClasses, _games2.default.MOLE, _moleGameLogic2.default), _defineProperty(_gameLogicClasses, _games2.default.DISK, _diskGameLogic2.default), _defineProperty(_gameLogicClasses, _games2.default.SIMON, _simonGameLogic2.default), _gameLogicClasses);
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
      var enabledActions = new Set([_sculptureActionCreator2.default.MERGE_STATE]);
      return enabledActions.has(actionType);
    }
  }, {
    key: '_delegateAction',
    value: function _delegateAction(payload) {
      var _actionHandlers;

      var actionHandlers = (_actionHandlers = {}, _defineProperty(_actionHandlers, _sculptureActionCreator2.default.START_GAME, this._actionStartGame.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.START_NEXT_GAME, this._actionStartNextGame.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.MERGE_STATE, this._actionMergeState.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.RESTORE_STATUS, this._actionRestoreStatus.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.ANIMATION_FRAME, this._actionAnimationFrame.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.FINISH_STATUS_ANIMATION, this._actionFinishStatusAnimation.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.HANDSHAKE_ACTIVATE, this._actionHandshakeActivate.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.HANDSHAKE_DEACTIVATE, this._actionHandshakeDeactivate.bind(this)), _defineProperty(_actionHandlers, _panelsActionCreator2.default.PANEL_PRESSED, this._actionPanelPressed.bind(this)), _defineProperty(_actionHandlers, _disksActionCreator2.default.DISK_UPDATE, this._actionDiskUpdate.bind(this)), _actionHandlers);

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
      return this.currentGameLogic instanceof _handshakeGameLogic2.default;
    }

    /**
     * @returns {Boolean} Returns whether the mole game is currently being played
     */

  }, {
    key: 'isPlayingMoleGame',
    get: function get() {
      return this.currentGameLogic instanceof _moleGameLogic2.default;
    }

    /**
     * @returns {Boolean} Returns whether the disk game is currently being played
     */

  }, {
    key: 'isPlayingDiskGame',
    get: function get() {
      return this.currentGameLogic instanceof _diskGameLogic2.default;
    }

    /**
     * @returns {Boolean} Returns whether the simon game is currently being played
     */

  }, {
    key: 'isPlayingSimonGame',
    get: function get() {
      return this.currentGameLogic instanceof _simonGameLogic2.default;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvc2N1bHB0dXJlLXN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7OztBQWJBLElBQU0sU0FBUyxRQUFRLFFBQVIsQ0FBZjs7SUFlcUIsYzs7O0FBUW5CLDBCQUFZLFVBQVosRUFBd0IsTUFBeEIsRUFBZ0M7QUFBQTs7QUFBQTs7QUFBQTs7QUFHOUIsVUFBSyxVQUFMLEdBQWtCLFVBQWxCO0FBQ0EsVUFBSyxNQUFMLEdBQWMsTUFBZDs7QUFFQSxVQUFLLElBQUwsR0FBWSwwQkFBZ0I7QUFDMUIsY0FBUSxlQUFlLFlBREc7QUFFMUIsc0JBQWdCLElBRlU7QUFHMUIsbUJBQWEsSUFIYTtBQUkxQixrQkFBWSwwQkFKYztBQUsxQixjQUFRLDJEQUVMLE1BQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsT0FGZCxFQUV3QixFQUZ4Qix5QkFHTCxNQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLE9BSGQsRUFHd0IsRUFIeEIseUJBSUwsTUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixPQUpkLEVBSXdCLEVBSnhCLHlCQUtMLE1BQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsZUFMZCxFQUtnQyxDQUxoQyx5QkFNTCxNQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLGdCQU5kLEVBTWlDLENBTmpDLHlCQU9MLE1BQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsZUFQZCxFQU9nQyxDQVBoQyx5QkFRTCxNQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLGdCQVJkLEVBUWlDLENBUmpDLFNBTGtCO0FBZTFCLGFBQU8sMEJBQWdCO0FBQ3JCLGVBQU8sb0JBRGM7QUFFckIsZUFBTyxvQkFGYztBQUdyQixlQUFPO0FBSGMsT0FBaEIsQ0FmbUI7QUFvQjFCLGlCQUFXLDBC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QUFZLFlBQVosQ0FBeUIsS0FBSyxNQUFMLENBQVksUUFBckMsQ0FBUDtBQUNEOzs7Ozs7Ozt3QkFLNkI7QUFDNUIsVUFBTSxpQkFBaUIsS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLGdCQUFkLENBQXZCO0FBQ0EsYUFBTyxpQkFBaUIsZUFBZSxTQUFoQyxHQUE0QyxLQUFuRDtBQUNEOzs7d0JBbUNhO0FBQ1osYUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsUUFBZCxNQUE0QixlQUFlLFlBQWxEO0FBQ0Q7Ozs7Ozs7O3dCQUtjO0FBQ2IsYUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsUUFBZCxNQUE0QixlQUFlLGFBQWxEO0FBQ0Q7Ozs7Ozs7O3dCQUtxQjtBQUNwQixhQUFPLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxRQUFkLE1BQTRCLGVBQWUsY0FBbEQ7QUFDRDs7OztFQXZKeUMsT0FBTyxZOztBQUE5QixjLENBQ1osWSxHQUFlLFE7QUFESCxjLENBR1osWSxHQUFlLE87QUFISCxjLENBSVosYSxHQUFnQixRO0FBSkosYyxDQUtaLGMsR0FBaUIsUztBQUxMLGMsQ0FNWixjLEdBQWlCLFM7a0JBTkwsYyIsImZpbGUiOiJnYW1lLWxvZ2ljL3NjdWxwdHVyZS1zdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5pbXBvcnQgR0FNRVMgZnJvbSAnLi9jb25zdGFudHMvZ2FtZXMnO1xuaW1wb3J0IEhhbmRzaGFrZUdhbWVMb2dpYyBmcm9tICcuL2xvZ2ljL2hhbmRzaGFrZS1nYW1lLWxvZ2ljJztcbmltcG9ydCBNb2xlR2FtZUxvZ2ljIGZyb20gJy4vbG9naWMvbW9sZS1nYW1lLWxvZ2ljJztcbmltcG9ydCBEaXNrR2FtZUxvZ2ljIGZyb20gJy4vbG9naWMvZGlzay1nYW1lLWxvZ2ljJztcbmltcG9ydCBTaW1vbkdhbWVMb2dpYyBmcm9tICcuL2xvZ2ljL3NpbW9uLWdhbWUtbG9naWMnO1xuaW1wb3J0IFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IgZnJvbSAnLi9hY3Rpb25zL3NjdWxwdHVyZS1hY3Rpb24tY3JlYXRvcic7XG5pbXBvcnQgUGFuZWxzQWN0aW9uQ3JlYXRvciBmcm9tICcuL2FjdGlvbnMvcGFuZWxzLWFjdGlvbi1jcmVhdG9yJztcbmltcG9ydCBEaXNrc0FjdGlvbkNyZWF0b3IgZnJvbSAnLi9hY3Rpb25zL2Rpc2tzLWFjdGlvbi1jcmVhdG9yJztcbmltcG9ydCBUcmFja2VkRGF0YSBmcm9tICcuL3V0aWxzL3RyYWNrZWQtZGF0YSc7XG5pbXBvcnQgVHJhY2tlZFNldCBmcm9tICcuL3V0aWxzL3RyYWNrZWQtc2V0JztcbmltcG9ydCBMaWdodEFycmF5IGZyb20gJy4vdXRpbHMvbGlnaHQtYXJyYXknO1xuaW1wb3J0IERpc2sgZnJvbSAnLi91dGlscy9kaXNrJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2N1bHB0dXJlU3RvcmUgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcbiAgc3RhdGljIEVWRU5UX0NIQU5HRSA9IFwiY2hhbmdlXCI7XG5cbiAgc3RhdGljIFNUQVRVU19SRUFEWSA9IFwicmVhZHlcIjtcbiAgc3RhdGljIFNUQVRVU19MT0NLRUQgPSBcImxvY2tlZFwiO1xuICBzdGF0aWMgU1RBVFVTX1NVQ0NFU1MgPSBcInN1Y2Nlc3NcIjtcbiAgc3RhdGljIFNUQVRVU19GQUlMVVJFID0gXCJmYWlsdXJlXCI7XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlciwgY29uZmlnKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG5cbiAgICB0aGlzLmRhdGEgPSBuZXcgVHJhY2tlZERhdGEoe1xuICAgICAgc3RhdHVzOiBTY3VscHR1cmVTdG9yZS5TVEFUVVNfUkVBRFksXG4gICAgICBwYW5lbEFuaW1hdGlvbjogbnVsbCxcbiAgICAgIGN1cnJlbnRHYW1lOiBudWxsLFxuICAgICAgaGFuZHNoYWtlczogbmV3IFRyYWNrZWRTZXQoKSxcbiAgICAgIGxpZ2h0czogbmV3IExpZ2h0QXJyYXkoe1xuICAgICAgICAvLyBzdHJpcElkIDogbnVtYmVyIG9mIHBhbmVsc1xuICAgICAgICBbdGhpcy5jb25maWcuTElHSFRTLlNUUklQX0FdOiAxMCxcbiAgICAgICAgW3RoaXMuY29uZmlnLkxJR0hUUy5TVFJJUF9CXTogMTAsXG4gICAgICAgIFt0aGlzLmNvbmZpZy5MSUdIVFMuU1RSSVBfQ106IDEwLFxuICAgICAgICBbdGhpcy5jb25maWcuTElHSFRTLlBFUklNRVRFUl9TVFJJUF06IDYsXG4gICAgICAgIFt0aGlzLmNvbmZpZy5MSUdIVFMuRElTS19MSUdIVF9TVFJJUF06IDMsXG4gICAgICAgIFt0aGlzLmNvbmZpZy5MSUdIVFMuSEFORFNIQUtFX1NUUklQXTogNCxcbiAgICAgICAgW3RoaXMuY29uZmlnLkxJR0hUUy5BUlRfTElHSFRTX1NUUklQXTogM1xuICAgICAgfSksXG4gICAgICBkaXNrczogbmV3IFRyYWNrZWREYXRhKHtcbiAgICAgICAgZGlzazA6IG5ldyBEaXNrKCksXG4gICAgICAgIGRpc2sxOiBuZXcgRGlzaygpLFxuICAgICAgICBkaXNrMjogbmV3IERpc2soKVxuICAgICAgfSksXG4gICAgICBoYW5kc2hha2U6IG5ldyBUcmFja2VkRGF0YShIYW5kc2hha2VHYW1lTG9naWMudHJhY2tlZFByb3BlcnRpZXMpLFxuICAgICAgbW9sZTogbmV3IFRyYWNrZWREYXRhKE1vbGVHYW1lTG9naWMudHJhY2tlZFByb3BlcnRpZXMpLFxuICAgICAgZGlzazogbmV3IFRyYWNrZWREYXRhKERpc2tHYW1lTG9naWMudHJhY2tlZFByb3BlcnRpZXMpLFxuICAgICAgc2ltb246IG5ldyBUcmFja2VkRGF0YShTaW1vbkdhbWVMb2dpYy50cmFja2VkUHJvcGVydGllcylcbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudEdhbWVMb2dpYyA9IG51bGw7XG4gICAgdGhpcy5kaXNwYXRjaFRva2VuID0gdGhpcy5fcmVnaXN0ZXJEaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgdGhpcy5zY3VscHR1cmVBY3Rpb25DcmVhdG9yID0gbmV3IFNjdWxwdHVyZUFjdGlvbkNyZWF0b3IodGhpcy5kaXNwYXRjaGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyB3aGV0aGVyIHRoZSBoYW5kc2hha2UgZ2FtZSBpcyBjdXJyZW50bHkgYmVpbmcgcGxheWVkXG4gICAqL1xuICBnZXQgaXNQbGF5aW5nSGFuZHNoYWtlR2FtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50R2FtZUxvZ2ljIGluc3RhbmNlb2YgSGFuZHNoYWtlR2FtZUxvZ2ljO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIHdoZXRoZXIgdGhlIG1vbGUgZ2FtZSBpcyBjdXJyZW50bHkgYmVpbmcgcGxheWVkXG4gICAqL1xuICBnZXQgaXNQbGF5aW5nTW9sZUdhbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEdhbWVMb2dpYyBpbnN0YW5jZW9mIE1vbGVHYW1lTG9naWM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge0Jvb2xlYW59IFJldHVybnMgd2hldGhlciB0aGUgZGlzayBnYW1lIGlzIGN1cnJlbnRseSBiZWluZyBwbGF5ZWRcbiAgICovXG4gIGdldCBpc1BsYXlpbmdEaXNrR2FtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50R2FtZUxvZ2ljIGluc3RhbmNlb2YgRGlza0dhbWVMb2dpYztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyB3aGV0aGVyIHRoZSBzaW1vbiBnYW1lIGlzIGN1cnJlbnRseSBiZWluZyBwbGF5ZWRcbiAgICovXG4gIGdldCBpc1BsYXlpbmdTaW1vbkdhbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEdhbWVMb2dpYyBpbnN0YW5jZW9mIFNpbW9uR2FtZUxvZ2ljO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgbm8gZ2FtZSBpcyBjdXJyZW50bHkgYmVpbmcgcGxheWVkXG4gICAqL1xuICBnZXQgaXNQbGF5aW5nTm9HYW1lKCkge1xuICAgIHJldHVybiAhdGhpcy5jdXJyZW50R2FtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBSZXR1cm5zIHRoZSBjdXJyZW50IHVzZXIncyB1c2VybmFtZVxuICAgKi9cbiAgZ2V0IHVzZXJuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy51c2VybmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgZ2V0IHVzZXJDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0VXNlckNvbG9yKHRoaXMuY29uZmlnLnVzZXJuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gUmV0dXJucyB3aGV0aGVyIGEgcGFuZWwgYW5pbWF0aW9uIGlzIHJ1bm5pbmdcbiAgICovXG4gIGdldCBpc1BhbmVsQW5pbWF0aW9uUnVubmluZygpIHtcbiAgICBjb25zdCBwYW5lbEFuaW1hdGlvbiA9IHRoaXMuZGF0YS5nZXQoJ3BhbmVsQW5pbWF0aW9uJyk7XG4gICAgcmV0dXJuIHBhbmVsQW5pbWF0aW9uID8gcGFuZWxBbmltYXRpb24uaXNSdW5uaW5nIDogZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZXMgdGhlIHNjdWxwdHVyZSdzIHN0YXR1cyBiYWNrIHRvIHJlYWR5XG4gICAqIE1ha2Ugc3VyZSB0byBwdWJsaXNoIGNoYW5nZXMgYWZ0ZXIgY2FsbGluZyB0aGlzIC0tIG5vdCBuZWNlc3NhcnkgaWYgYW4gYWN0aW9uIGlzIGN1cnJlbnRseSBiZWluZyBoYW5kbGVkIGFscmVhZHlcbiAgICovXG4gIHJlc3RvcmVTdGF0dXMoKSB7XG4gICAgdGhpcy5kYXRhLnNldCgnc3RhdHVzJywgU2N1bHB0dXJlU3RvcmUuU1RBVFVTX1JFQURZKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2NrcyB0aGUgc2N1bHB0dXJlIGZyb20gYW55IGlucHV0XG4gICAqIE1ha2Ugc3VyZSB0byBwdWJsaXNoIGNoYW5nZXMgYWZ0ZXIgY2FsbGluZyB0aGlzIC0tIG5vdCBuZWNlc3NhcnkgaWYgYW4gYWN0aW9uIGlzIGN1cnJlbnRseSBiZWluZyBoYW5kbGVkIGFscmVhZHlcbiAgICovXG4gIGxvY2soKSB7XG4gICAgdGhpcy5kYXRhLnNldCgnc3RhdHVzJywgU2N1bHB0dXJlU3RvcmUuU1RBVFVTX0xPQ0tFRCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2N1bHB0dXJlJ3Mgc3RhdHVzIHRvIHN1Y2Nlc3NcbiAgICovXG4gIHNldFN1Y2Nlc3NTdGF0dXMoKSB7XG4gICAgdGhpcy5kYXRhLnNldCgnc3RhdHVzJywgU2N1bHB0dXJlU3RvcmUuU1RBVFVTX1NVQ0NFU1MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNjdWxwdHVyZSdzIHN0YXR1cyB0byBmYWlsdXJlXG4gICAqL1xuICBzZXRGYWlsdXJlU3RhdHVzKCkge1xuICAgIHRoaXMuZGF0YS5zZXQoJ3N0YXR1cycsIFNjdWxwdHVyZVN0b3JlLlNUQVRVU19GQUlMVVJFKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNjdWxwdHVyZSdzIGN1cnJlbnQgc3RhdHVzIGlzIHJlYWR5XG4gICAqL1xuICBnZXQgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldCgnc3RhdHVzJykgPT09IFNjdWxwdHVyZVN0b3JlLlNUQVRVU19SRUFEWTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNjdWxwdHVyZSdzIGN1cnJlbnQgc3RhdHVzIGlzIGxvY2tlZFxuICAgKi9cbiAgZ2V0IGlzTG9ja2VkKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0KCdzdGF0dXMnKSA9PT0gU2N1bHB0dXJlU3RvcmUuU1RBVFVTX0xPQ0tFRDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNjdWxwdHVyZSdzIGN1cnJlbnQgc3RhdHVzIGlzIHN1Y2Nlc3NcbiAgICovXG4gIGdldCBpc1N0YXR1c1N1Y2Nlc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXQoJ3N0YXR1cycpID09PSBTY3VscHR1cmVTdG9yZS5TVEFUVVNfU1VDQ0VTUztcbiAgfVxuXG4gIC8qKlxuICAgKiBQbGF5cyB0aGUgZ2l2ZW4gYW5pbWF0aW9uXG4gICAqL1xuICBwbGF5QW5pbWF0aW9uKGFuaW1hdGlvbikge1xuICAgIHRoaXMuZGF0YS5zZXQoJ3BhbmVsQW5pbWF0aW9uJywgYW5pbWF0aW9uKTtcbiAgICBhbmltYXRpb24ucGxheSh0aGlzLmRpc3BhdGNoZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgbmV4dCBnYW1lIGluIHRoZSBnYW1lIHNlcXVlbmNlXG4gICAqL1xuICBtb3ZlVG9OZXh0R2FtZSgpIHtcbiAgICB0aGlzLl9zdGFydEdhbWUodGhpcy5fZ2V0TmV4dEdhbWUoKSk7XG4gIH1cblxuICBfc3RhcnRHYW1lKGdhbWUpIHtcbiAgICBjb25zdCBnYW1lTG9naWNDbGFzc2VzID0ge1xuICAgICAgW0dBTUVTLkhBTkRTSEFLRV06IEhhbmRzaGFrZUdhbWVMb2dpYyxcbiAgICAgIFtHQU1FUy5NT0xFXTogTW9sZUdhbWVMb2dpYyxcbiAgICAgIFtHQU1FUy5ESVNLXTogRGlza0dhbWVMb2dpYyxcbiAgICAgIFtHQU1FUy5TSU1PTl06IFNpbW9uR2FtZUxvZ2ljXG4gICAgfTtcbiAgICBjb25zdCBHYW1lTG9naWMgPSBnYW1lTG9naWNDbGFzc2VzW2dhbWVdO1xuICAgIGlmICghR2FtZUxvZ2ljKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBnYW1lOiAke2dhbWV9YCk7XG4gICAgfVxuXG4gICAgLy8gZW5kIGFueSBwcmV2aW91cyBnYW1lXG4gICAgaWYgKHRoaXMuY3VycmVudEdhbWVMb2dpYykge1xuICAgICAgdGhpcy5jdXJyZW50R2FtZUxvZ2ljLmVuZCgpO1xuICAgIH1cbiAgICB0aGlzLl9yZXNldEdhbWVQYW5lbHMoKTtcblxuICAgIHRoaXMuZGF0YS5zZXQoJ2N1cnJlbnRHYW1lJywgZ2FtZSk7XG4gICAgdGhpcy5jdXJyZW50R2FtZUxvZ2ljID0gbmV3IEdhbWVMb2dpYyh0aGlzLCB0aGlzLmNvbmZpZyk7XG4gICAgdGhpcy5jdXJyZW50R2FtZUxvZ2ljLnN0YXJ0KCk7XG4gIH1cblxuICBfcmVzZXRHYW1lUGFuZWxzKCkge1xuICAgIGNvbnN0IGxpZ2h0QXJyYXkgPSB0aGlzLmRhdGEuZ2V0KCdsaWdodHMnKTtcbiAgICB0aGlzLmNvbmZpZy5MSUdIVFMuR0FNRV9TVFJJUFMuZm9yRWFjaCgoc3RyaXBJZCkgPT4ge1xuICAgICAgbGlnaHRBcnJheS5zZXREZWZhdWx0Q29sb3Ioc3RyaXBJZCk7XG4gICAgICBsaWdodEFycmF5LnNldERlZmF1bHRJbnRlbnNpdHkoc3RyaXBJZCk7XG4gICAgfSk7XG4gIH1cblxuICBfcHVibGlzaENoYW5nZXMoKSB7XG4gICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuZGF0YS5nZXRDaGFuZ2VkQ3VycmVudFZhbHVlcygpO1xuXG4gICAgaWYgKE9iamVjdC5rZXlzKGNoYW5nZXMpLmxlbmd0aCkge1xuICAgICAgdGhpcy5lbWl0KFNjdWxwdHVyZVN0b3JlLkVWRU5UX0NIQU5HRSwgY2hhbmdlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLmNsZWFyQ2hhbmdlcygpO1xuICB9XG5cbiAgX3JlZ2lzdGVyRGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5faGFuZGxlQWN0aW9uUGF5bG9hZC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIF9oYW5kbGVBY3Rpb25QYXlsb2FkKHBheWxvYWQpIHtcbiAgICBpZiAodGhpcy5pc0xvY2tlZCAmJiAhdGhpcy5fYWN0aW9uQ2FuUnVuV2hlbkxvY2tlZChwYXlsb2FkLmFjdGlvblR5cGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZGVsZWdhdGVBY3Rpb24ocGF5bG9hZCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50R2FtZUxvZ2ljICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmN1cnJlbnRHYW1lTG9naWMuaGFuZGxlQWN0aW9uUGF5bG9hZChwYXlsb2FkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wdWJsaXNoQ2hhbmdlcygpO1xuICB9XG5cbiAgX2FjdGlvbkNhblJ1bldoZW5Mb2NrZWQoYWN0aW9uVHlwZSkge1xuICAgIGNvbnN0IGVuYWJsZWRBY3Rpb25zID0gbmV3IFNldChbXG4gICAgICBTY3VscHR1cmVBY3Rpb25DcmVhdG9yLk1FUkdFX1NUQVRFXG4gICAgXSk7XG4gICAgcmV0dXJuIGVuYWJsZWRBY3Rpb25zLmhhcyhhY3Rpb25UeXBlKTtcbiAgfVxuXG4gIF9kZWxlZ2F0ZUFjdGlvbihwYXlsb2FkKSB7XG4gICAgY29uc3QgYWN0aW9uSGFuZGxlcnMgPSB7XG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5TVEFSVF9HQU1FXTogdGhpcy5fYWN0aW9uU3RhcnRHYW1lLmJpbmQodGhpcyksXG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5TVEFSVF9ORVhUX0dBTUVdOiB0aGlzLl9hY3Rpb25TdGFydE5leHRHYW1lLmJpbmQodGhpcyksXG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5NRVJHRV9TVEFURV06IHRoaXMuX2FjdGlvbk1lcmdlU3RhdGUuYmluZCh0aGlzKSxcbiAgICAgIFtTY3VscHR1cmVBY3Rpb25DcmVhdG9yLlJFU1RPUkVfU1RBVFVTXTogdGhpcy5fYWN0aW9uUmVzdG9yZVN0YXR1cy5iaW5kKHRoaXMpLFxuICAgICAgW1NjdWxwdHVyZUFjdGlvbkNyZWF0b3IuQU5JTUFUSU9OX0ZSQU1FXTogdGhpcy5fYWN0aW9uQW5pbWF0aW9uRnJhbWUuYmluZCh0aGlzKSxcbiAgICAgIFtTY3VscHR1cmVBY3Rpb25DcmVhdG9yLkZJTklTSF9TVEFUVVNfQU5JTUFUSU9OXTogdGhpcy5fYWN0aW9uRmluaXNoU3RhdHVzQW5pbWF0aW9uLmJpbmQodGhpcyksXG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5IQU5EU0hBS0VfQUNUSVZBVEVdOiB0aGlzLl9hY3Rpb25IYW5kc2hha2VBY3RpdmF0ZS5iaW5kKHRoaXMpLFxuICAgICAgW1NjdWxwdHVyZUFjdGlvbkNyZWF0b3IuSEFORFNIQUtFX0RFQUNUSVZBVEVdOiB0aGlzLl9hY3Rpb25IYW5kc2hha2VEZWFjdGl2YXRlLmJpbmQodGhpcyksXG4gICAgICBbUGFuZWxzQWN0aW9uQ3JlYXRvci5QQU5FTF9QUkVTU0VEXTogdGhpcy5fYWN0aW9uUGFuZWxQcmVzc2VkLmJpbmQodGhpcyksXG4gICAgICBbRGlza3NBY3Rpb25DcmVhdG9yLkRJU0tfVVBEQVRFXTogdGhpcy5fYWN0aW9uRGlza1VwZGF0ZS5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXIgPSBhY3Rpb25IYW5kbGVyc1twYXlsb2FkLmFjdGlvblR5cGVdO1xuICAgIGlmIChhY3Rpb25IYW5kbGVyKSB7XG4gICAgICBhY3Rpb25IYW5kbGVyKHBheWxvYWQpO1xuICAgIH1cbiAgfVxuXG4gIF9hY3Rpb25TdGFydEdhbWUocGF5bG9hZCkge1xuICAgIGNvbnN0IGdhbWUgPSBwYXlsb2FkLmdhbWU7XG4gICAgaWYgKCFnYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBnYW1lOiAke3BheWxvYWQuZ2FtZX1gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdGFydEdhbWUoZ2FtZSk7XG4gIH1cblxuICBfYWN0aW9uU3RhcnROZXh0R2FtZSgpIHtcbiAgICB0aGlzLm1vdmVUb05leHRHYW1lKCk7XG4gIH1cblxuICBfYWN0aW9uTWVyZ2VTdGF0ZShwYXlsb2FkKSB7XG4gICAgaWYgKHBheWxvYWQubWV0YWRhdGEuZnJvbSA9PT0gdGhpcy51c2VybmFtZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1lcmdlRnVuY3Rpb25zID0ge1xuICAgICAgc3RhdHVzOiB0aGlzLl9tZXJnZVN0YXR1cy5iaW5kKHRoaXMpLFxuICAgICAgbGlnaHRzOiB0aGlzLl9tZXJnZUxpZ2h0cy5iaW5kKHRoaXMpLFxuICAgICAgZGlza3M6IHRoaXMuX21lcmdlRGlza3MuYmluZCh0aGlzKSxcbiAgICAgIG1vbGU6IHRoaXMuX21lcmdlTW9sZS5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIGZvciAobGV0IHByb3BOYW1lIG9mIE9iamVjdC5rZXlzKHBheWxvYWQpKSB7XG4gICAgICBjb25zdCBtZXJnZUZ1bmN0aW9uID0gbWVyZ2VGdW5jdGlvbnNbcHJvcE5hbWVdO1xuICAgICAgaWYgKG1lcmdlRnVuY3Rpb24pIHtcbiAgICAgICAgbWVyZ2VGdW5jdGlvbihwYXlsb2FkW3Byb3BOYW1lXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2FjdGlvblJlc3RvcmVTdGF0dXMocGF5bG9hZCkge1xuICAgIHRoaXMucmVzdG9yZVN0YXR1cygpO1xuICB9XG5cbiAgX2FjdGlvbkFuaW1hdGlvbkZyYW1lKHBheWxvYWQpIHtcbiAgICBjb25zdCB7Y2FsbGJhY2t9ID0gcGF5bG9hZDtcblxuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBfYWN0aW9uRmluaXNoU3RhdHVzQW5pbWF0aW9uKHBheWxvYWQpIHtcbiAgICB0aGlzLnJlc3RvcmVTdGF0dXMoKTtcbiAgfVxuXG4gIF9hY3Rpb25IYW5kc2hha2VBY3RpdmF0ZShwYXlsb2FkKSB7XG4gICAgdGhpcy5kYXRhLmdldCgnaGFuZHNoYWtlcycpLmFkZChwYXlsb2FkLnVzZXIpO1xuICB9XG5cbiAgX2FjdGlvbkhhbmRzaGFrZURlYWN0aXZhdGUocGF5bG9hZCkge1xuICAgIHRoaXMuZGF0YS5nZXQoJ2hhbmRzaGFrZXMnKS5kZWxldGUocGF5bG9hZC51c2VyKTtcbiAgfVxuXG4gIF9hY3Rpb25QYW5lbFByZXNzZWQocGF5bG9hZCkge1xuICAgIGlmICghdGhpcy5pc1JlYWR5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGlnaHRBcnJheSA9IHRoaXMuZGF0YS5nZXQoJ2xpZ2h0cycpO1xuICAgIGNvbnN0IHtzdHJpcElkLCBwYW5lbElkLCBwcmVzc2VkfSA9IHBheWxvYWQ7XG4gICAgbGlnaHRBcnJheS5hY3RpdmF0ZShzdHJpcElkLCBwYW5lbElkLCBwcmVzc2VkKTtcbiAgfVxuXG4gIF9hY3Rpb25EaXNrVXBkYXRlKHBheWxvYWQpIHtcbiAgICBsZXQge2Rpc2tJZCwgcG9zaXRpb24sIGRpcmVjdGlvbiwgdXNlcn0gPSBwYXlsb2FkO1xuXG4gICAgaWYgKHR5cGVvZiBkaXNrSWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGlzayA9IHRoaXMuZGF0YS5nZXQoJ2Rpc2tzJykuZ2V0KGRpc2tJZCk7XG5cbiAgICBpZiAodHlwZW9mIHBvc2l0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZGlzay5yb3RhdGVUbyhwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkaXJlY3Rpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBkaXNrLnNldERpcmVjdGlvbihkaXJlY3Rpb24pO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdXNlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdXNlciAhPT0gbnVsbCkge1xuICAgICAgZGlzay5zZXRVc2VyKHVzZXIpO1xuICAgIH1cbiAgfVxuXG4gIF9tZXJnZVN0YXR1cyhuZXdTdGF0dXMpIHtcbiAgICB0aGlzLmRhdGEuc2V0KCdzdGF0dXMnLCBuZXdTdGF0dXMpO1xuICB9XG5cbiAgX21lcmdlTGlnaHRzKGxpZ2h0Q2hhbmdlcykge1xuICAgIGNvbnN0IGxpZ2h0QXJyYXkgPSB0aGlzLmRhdGEuZ2V0KCdsaWdodHMnKTtcblxuICAgIGZvciAobGV0IHN0cmlwSWQgb2YgT2JqZWN0LmtleXMobGlnaHRDaGFuZ2VzKSkge1xuICAgICAgY29uc3QgcGFuZWxzID0gbGlnaHRDaGFuZ2VzW3N0cmlwSWRdLnBhbmVscztcbiAgICAgIGZvciAobGV0IHBhbmVsSWQgb2YgT2JqZWN0LmtleXMocGFuZWxzKSkge1xuICAgICAgICBjb25zdCBwYW5lbENoYW5nZXMgPSBwYW5lbHNbcGFuZWxJZF07XG4gICAgICAgIGlmIChwYW5lbENoYW5nZXMuaGFzT3duUHJvcGVydHkoXCJpbnRlbnNpdHlcIikpIHtcbiAgICAgICAgICBsaWdodEFycmF5LnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCBwYW5lbENoYW5nZXMuaW50ZW5zaXR5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFuZWxDaGFuZ2VzLmhhc093blByb3BlcnR5KFwiYWN0aXZlXCIpKSB7XG4gICAgICAgICAgLy8gVE9ETzogU2V0IGNvbG9yIGJhc2VkIG9uIG1ldGFkYXRhXG4gICAgICAgICAgbGlnaHRBcnJheS5hY3RpdmF0ZShzdHJpcElkLCBwYW5lbElkLCBwYW5lbENoYW5nZXMuYWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9tZXJnZURpc2tzKGRpc2tDaGFuZ2VzKSB7XG4gICAgLy8gVE9ET1xuICAgIGNvbnNvbGUubG9nKGRpc2tDaGFuZ2VzKTtcbiAgfVxuXG4gIF9tZXJnZU1vbGUobW9sZUNoYW5nZXMpIHtcbiAgICBmb3IgKGxldCBwcm9wTmFtZSBvZiBPYmplY3Qua2V5cyhtb2xlQ2hhbmdlcykpIHtcbiAgICAgIHRoaXMuZGF0YS5nZXQoJ21vbGUnKS5zZXQocHJvcE5hbWUsIG1vbGVDaGFuZ2VzW3Byb3BOYW1lXSk7XG4gICAgfVxuICB9XG5cbiAgX2dldE5leHRHYW1lKCkge1xuICAgIGNvbnN0IGN1cnJlbnRHYW1lID0gdGhpcy5kYXRhLmdldChcImN1cnJlbnRHYW1lXCIpO1xuICAgIGxldCBpbmRleCA9IHRoaXMuY29uZmlnLkdBTUVTX1NFUVVFTkNFLmluZGV4T2YoY3VycmVudEdhbWUpO1xuICAgIGluZGV4ID0gKGluZGV4ICsgMSkgJSB0aGlzLmNvbmZpZy5HQU1FU19TRVFVRU5DRS5sZW5ndGg7XG5cbiAgICByZXR1cm4gdGhpcy5jb25maWcuR0FNRVNfU0VRVUVOQ0VbaW5kZXhdO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
