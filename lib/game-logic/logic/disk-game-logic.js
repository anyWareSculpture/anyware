'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _panelsActionCreator = require('../actions/panels-action-creator');

var _panelsActionCreator2 = _interopRequireDefault(_panelsActionCreator);

var _disksActionCreator = require('../actions/disks-action-creator');

var _disksActionCreator2 = _interopRequireDefault(_disksActionCreator);

var _sculptureActionCreator = require('../actions/sculpture-action-creator');

var _sculptureActionCreator2 = _interopRequireDefault(_sculptureActionCreator);

var _disk = require('../utils/disk');

var _disk2 = _interopRequireDefault(_disk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_LEVEL = 0;

var DiskGameLogic = function () {
  function DiskGameLogic(store, config) {
    _classCallCheck(this, DiskGameLogic);

    this.store = store;
    this.config = config;
    this.gameConfig = config.DISK_GAME;

    this._complete = false;
  }
  // These are automatically added to the sculpture store


  _createClass(DiskGameLogic, [{
    key: 'start',
    value: function start() {
      this._level = DEFAULT_LEVEL;
      this._complete = false;

      // Activate shadow lights
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(this.gameConfig.SHADOW_LIGHTS)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var stripId = _step.value;

          var panels = this.gameConfig.SHADOW_LIGHTS[stripId];
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = Object.keys(panels)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var panelId = _step4.value;

              this._lights.setIntensity(stripId, panelId, this.gameConfig.SHADOW_LIGHT_INTENSITY);
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

        // Indicate start of new level by setting perimeter lights
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

      this._setPerimeter(this._level, this.gameConfig.PERIMETER_COLOR, this.gameConfig.ACTIVE_PERIMETER_INTENSITY);

      // Activate UI indicators
      var controlMappings = this.gameConfig.CONTROL_MAPPINGS;
      // TODO: Clean this up
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.keys(controlMappings.CLOCKWISE_PANELS)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var diskId = _step2.value;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = controlMappings.CLOCKWISE_PANELS[diskId][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var _panelId = _step5.value;

              this._lights.setIntensity(controlMappings.CLOCKWISE_STRIP, _panelId, this.gameConfig.CONTROL_PANEL_INTENSITY);
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = Object.keys(controlMappings.COUNTERCLOCKWISE_PANELS)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _diskId = _step3.value;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = controlMappings.COUNTERCLOCKWISE_PANELS[_diskId][Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var _panelId2 = _step6.value;

              this._lights.setIntensity(controlMappings.COUNTERCLOCKWISE_STRIP, _panelId2, this.gameConfig.CONTROL_PANEL_INTENSITY);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
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

    // TODO: These end() methods may be obsolete now since everything is reset before every game anyway

  }, {
    key: 'end',
    value: function end() {
      var _this = this;

      this.config.LIGHTS.GAME_STRIPS.forEach(function (id) {
        return _this._lights.setIntensity(id, null, 0);
      });
      // Deactivate shadow lights
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = Object.keys(this.gameConfig.SHADOW_LIGHTS)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var stripId = _step7.value;

          var panels = this.gameConfig.SHADOW_LIGHTS[stripId];
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = Object.keys(panels)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var panelId = _step8.value;

              this._lights.setIntensity(stripId, panelId, 0);
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }
        // Deactivate perimeter lights (FIXME: This should be part of the end animation)
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      var _arr = ['0', '1', '2', '3', '4', '5'];
      for (var _i = 0; _i < _arr.length; _i++) {
        var _panelId3 = _arr[_i];
        this._lights.setIntensity(this.config.LIGHTS.PERIMETER_STRIP, _panelId3, 0);
        this._lights.setDefaultColor(this.config.LIGHTS.PERIMETER_STRIP, _panelId3);
      }
    }
  }, {
    key: 'handleActionPayload',
    value: function handleActionPayload(payload) {
      var _actionHandlers;

      var actionHandlers = (_actionHandlers = {}, _defineProperty(_actionHandlers, _panelsActionCreator2.default.PANEL_PRESSED, this._actionPanelPressed.bind(this)), _defineProperty(_actionHandlers, _disksActionCreator2.default.DISK_UPDATE, this._actionDiskUpdate.bind(this)), _defineProperty(_actionHandlers, _sculptureActionCreator2.default.FINISH_STATUS_ANIMATION, this._actionFinishStatusAnimation.bind(this)), _actionHandlers);

      var actionHandler = actionHandlers[payload.actionType];
      if (actionHandler) {
        actionHandler(payload);
      }
    }
  }, {
    key: '_actionPanelPressed',
    value: function _actionPanelPressed(payload) {
      // TODO: Break up this method
      if (this._complete) {
        return;
      }

      var controlMappings = this.gameConfig.CONTROL_MAPPINGS;
      var stripId = payload.stripId;
      var panelId = payload.panelId;


      var panels = void 0,
          direction = void 0;
      if (stripId === controlMappings.CLOCKWISE_STRIP) {
        panels = controlMappings.CLOCKWISE_PANELS;
        direction = _disk2.default.CLOCKWISE;
      } else if (stripId === controlMappings.COUNTERCLOCKWISE_STRIP) {
        panels = controlMappings.COUNTERCLOCKWISE_PANELS;
        direction = _disk2.default.COUNTERCLOCKWISE;
      } else {
        // just go with whatever default behaviour
        return;
      }

      var diskId = null,
          panelIds = void 0;
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = Object.keys(panels)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var panelsDiskId = _step9.value;

          panelIds = panels[panelsDiskId];
          if (panelIds.includes(panelId)) {
            diskId = panelsDiskId;
            break;
          }
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      var lightArray = this._lights;
      if (diskId === null) {
        // Override the default behaviour and keep this panel off because
        // it is still a special panel
        // It just doesn't do anything
        // TODO: Magic literal
        lightArray.setIntensity(stripId, panelId, 0);
        return;
      }
      var disks = this.store.data.get('disks');
      var disk = disks.get(diskId);

      var activePanels = panelIds.reduce(function (total, currPanelId) {
        return total + (lightArray.isActive(stripId, currPanelId) ? 1 : 0);
      }, 0);

      // Only need to activate/deactivate them once
      if (activePanels === 1) {
        this._activateDisk(diskId, direction, stripId, panelIds);
      } else if (activePanels === 0) {
        this._deactivateDisk(diskId, direction, stripId, panelIds);
      }

      if (disk.isConflicting) {
        this._setDiskControlsColor(diskId, this.config.COLORS.ERROR);
      }
    }
  }, {
    key: '_actionDiskUpdate',
    value: function _actionDiskUpdate(payload) {
      var diskId = payload.diskId;
      var position = payload.position;
      var direction = payload.direction;
      var state = payload.state;


      var disks = this.store.data.get('disks');
      var disk = disks.get(diskId);

      if (typeof position !== 'undefined') {
        disk.rotateTo(position);
      }
      if (typeof direction !== 'undefined') {
        disk.setDirection(direction);
      }
      if (typeof state !== 'undefined') {
        disk.setState(state);
      }

      if (!this.store.isStatusSuccess) {
        // FIXME:
        // Instead of just checking for the win condition, we want to:
        // - If Disk 0 or Disk 2 (the disks with the boundary part of the pattern) is in the
        //   correct location for a minimum amount of time, we trigger the Single Disk Success event

        // Single Disk Success Event
        // - Play success sounds (AudioView)
        // - UI LEDS and disk LED turns location color
        // - If Disk 1 or 2, turn perimeter LED to location color
        // - Lock this disk in position; disable any future interaction
        // - From now on, allow Disk 1 to trigger a Single Disk Success Event
        this._checkWinConditions(disks);
      }
    }
  }, {
    key: '_actionFinishStatusAnimation',
    value: function _actionFinishStatusAnimation(payload) {
      if (this._complete) {
        this.store.moveToNextGame();
      }
    }
  }, {
    key: '_activateDisk',
    value: function _activateDisk(diskId, direction, stripId, panelIds) {
      var _this2 = this;

      var disks = this.store.data.get('disks');
      var disk = disks.get(diskId);
      disk.setDirection(direction);

      panelIds.forEach(function (panelId) {
        _this2._lights.setIntensity(stripId, panelId, _this2.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY);
        _this2._lights.setColor(stripId, panelId, _this2.store.userColor);
      });
    }
  }, {
    key: '_deactivateDisk',
    value: function _deactivateDisk(diskId, direction, stripId, panelIds) {
      var _this3 = this;

      var disks = this.store.data.get('disks');
      var disk = disks.get(diskId);
      if (!disk.isStopped) {
        // This fixes a bug where a user wins the level with their hand on the
        // panel and then takes it off. We stop all the disks between levels so
        // all the disks are already off when they let go. This can cause errors
        // TODO: Determine if this check should actually be in Disk#unsetDirection
        disk.unsetDirection(direction);
      }

      panelIds.forEach(function (panelId) {
        // TODO: Only deactivate if both panels are inactive
        _this3._lights.setIntensity(stripId, panelId, _this3.gameConfig.CONTROL_PANEL_INTENSITY);
        _this3._lights.setDefaultColor(stripId, panelId);
      });
    }
  }, {
    key: '_setDiskControlsColor',
    value: function _setDiskControlsColor(diskId, color) {
      var controlMappings = this.gameConfig.CONTROL_MAPPINGS;

      var lightArray = this._lights;
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = controlMappings.CLOCKWISE_PANELS[diskId][Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var panelId = _step10.value;

          lightArray.setColor(controlMappings.CLOCKWISE_STRIP, panelId, color);
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = controlMappings.COUNTERCLOCKWISE_PANELS[diskId][Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var _panelId4 = _step11.value;

          lightArray.setColor(controlMappings.COUNTERCLOCKWISE_STRIP, _panelId4, color);
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }
    }

    /**
     * Win conditions:
     * - The three disks needs to be _relatively_ aligned within RELATIVE_TOLERANCE
     * - Any disk must be aligned within ABSOLUTE_TOLERANCE
     */

  }, {
    key: '_checkWinConditions',
    value: function _checkWinConditions(disks) {
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = Object.keys(this._targetPositions)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var diskId = _step12.value;

          var targetPos = this._targetPositions[diskId];
          var currDisk = disks.get(diskId);
          var diskPos = currDisk.getPosition();

          // Check position relative to neighbor disk
          // FIXME: We disabled this for now, as relative tolerance only makes sense
          // if we have better disk precision than the tolerance.
          //    let prevDiskId = null;
          //      if (prevDiskId) {
          //        if (Math.abs((targetPos - this._targetPositions[prevDiskId]) -
          //                     (diskPos - disks.get(prevDiskId).getPosition())) >
          //                     this.gameConfig.RELATIVE_TOLERANCE) {
          //          return false;
          //        }
          //      }
          // Check absolute position
          var d = Math.abs(diskPos - targetPos) % 360;
          var r = d > 180 ? 360 - d : d;
          console.debug(diskId + ' error: ' + r);
          if (Math.abs(r) > this.gameConfig.ABSOLUTE_TOLERANCE) {
            return false;
          }
          //      prevDiskId = diskId;
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12.return) {
            _iterator12.return();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
      }

      this._winGame();
    }

    // TODO: move these public methods up

  }, {
    key: 'getDiskScore',
    value: function getDiskScore(diskId) {
      // We cannot calculate the score of a complete game as we don't have a valid level
      if (this._complete) return 0;

      var disks = this.store.data.get('disks');
      var delta = this._targetPositions[diskId] - disks.get(diskId).getPosition();
      while (delta <= -180) {
        delta += 360;
      }while (delta > 180) {
        delta -= 360;
      }return Math.abs(delta);
    }
    /**
     * Current score (the total number of degrees away from solution).
     * For 3 disks, this will be between 0 and 540
     */

  }, {
    key: 'getScore',
    value: function getScore(disks) {
      // We cannot calculate the score of a complete game as we don't have a valid level
      if (this._complete) return 0;

      var distance = 0;
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = Object.keys(this._targetPositions)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var diskId = _step13.value;

          distance += this.getDiskScore(diskId);
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }

      return distance;
    }
  }, {
    key: '_winGame',
    value: function _winGame() {
      this.store.data.get('lights').deactivateAll();
      this._stopAllDisks();

      this.store.setSuccessStatus();

      // Indicate end of level by setting perimeter lights
      this._setPerimeter(this._level, this.store.userColor, this.gameConfig.INACTIVE_PERIMETER_INTENSITY);

      var level = this._level + 1;
      if (level >= this._levels) {
        this._complete = true;
      }

      this._level = level;

      // Indicate start of new level by setting perimeter lights
      if (!this._complete) {
        this._setPerimeter(level, this.gameConfig.PERIMETER_COLOR, this.gameConfig.ACTIVE_PERIMETER_INTENSITY);
      }
    }

    /**
     * Set perimeter lights for the given level to the given color and intensity
     */

  }, {
    key: '_setPerimeter',
    value: function _setPerimeter(level, color, intensity) {
      var perimeter = this.gameConfig.LEVELS[level].perimeter;
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = Object.keys(perimeter)[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var stripId = _step14.value;
          var _iteratorNormalCompletion15 = true;
          var _didIteratorError15 = false;
          var _iteratorError15 = undefined;

          try {
            for (var _iterator15 = perimeter[stripId][Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
              var panelId = _step15.value;

              this._lights.setColor(stripId, panelId, color);
              this._lights.setIntensity(stripId, panelId, intensity);
            }
          } catch (err) {
            _didIteratorError15 = true;
            _iteratorError15 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion15 && _iterator15.return) {
                _iterator15.return();
              }
            } finally {
              if (_didIteratorError15) {
                throw _iteratorError15;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14.return) {
            _iterator14.return();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }
    }
  }, {
    key: '_stopAllDisks',
    value: function _stopAllDisks() {
      var disks = this.store.data.get('disks');

      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = disks[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var diskId = _step16.value;

          disks.get(diskId).stop();
        }
      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16.return) {
            _iterator16.return();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }
    }
  }, {
    key: 'data',
    get: function get() {
      return this.store.data.get('disk');
    }
  }, {
    key: '_lights',
    get: function get() {
      return this.store.data.get('lights');
    }
  }, {
    key: '_targetPositions',
    get: function get() {
      var level = this._level;
      return this.gameConfig.LEVELS[level].disks;
    }
  }, {
    key: '_levels',
    get: function get() {
      return this.gameConfig.LEVELS.length;
    }
  }, {
    key: '_level',
    get: function get() {
      return this.data.get('level');
    },
    set: function set(value) {
      return this.data.set('level', value);
    }
  }]);

  return DiskGameLogic;
}();

DiskGameLogic.trackedProperties = {
  level: DEFAULT_LEVEL
};
exports.default = DiskGameLogic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvbG9naWMvZGlzay1nYW1lLWxvZ2ljLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxJQUFNLGdCQUFnQixDQUF0Qjs7SUFFcUIsYTtBQU1uQix5QkFBWSxLQUFaLEVBQW1CLE1BQW5CLEVBQTJCO0FBQUE7O0FBQ3pCLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLE9BQU8sU0FBekI7O0FBRUEsU0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0Q7Ozs7Ozs0QkFVTztBQUNOLFdBQUssTUFBTCxHQUFjLGFBQWQ7QUFDQSxXQUFLLFNBQUwsR0FBaUIsS0FBakI7OztBQUZNO0FBQUE7QUFBQTs7QUFBQTtBQUtOLDZCQUFvQixPQUFPLElBQVAsQ0FBWSxLQUFLLFVBQUwsQ0FBZ0IsYUFBNUIsQ0FBcEIsOEhBQWdFO0FBQUEsY0FBdkQsT0FBdUQ7O0FBQzlELGNBQU0sU0FBUyxLQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsQ0FBOEIsT0FBOUIsQ0FBZjtBQUQ4RDtBQUFBO0FBQUE7O0FBQUE7QUFFOUQsa0NBQW9CLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBcEIsbUlBQXlDO0FBQUEsa0JBQWhDLE9BQWdDOztBQUN2QyxtQkFBSyxPQUFMLENBQWEsWUFBYixDQUEwQixPQUExQixFQUFtQyxPQUFuQyxFQUE0QyxLQUFLLFVBQUwsQ0FBZ0Isc0JBQTVEO0FBQ0Q7QUFKNkQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUsvRDs7O0FBVks7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFhTixXQUFLLGFBQUwsQ0FBbUIsS0FBSyxNQUF4QixFQUFn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QUFnQixHQUFoQixDQUFvQixNQUFwQixDQUFQO0FBQ0Q7Ozt3QkFFYTtBQUNaLGFBQU8sS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixHQUFoQixDQUFvQixRQUFwQixDQUFQO0FBQ0Q7Ozt3QkFrVHNCO0FBQ3JCLFVBQU0sUUFBUSxLQUFLLE1BQW5CO0FBQ0EsYUFBTyxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsS0FBdkIsRUFBOEIsS0FBckM7QUFDRDs7O3dCQUVhO0FBQ1osYUFBTyxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsTUFBOUI7QUFDRDs7O3dCQUVZO0FBQ1gsYUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsT0FBZCxDQUFQO0FBQ0QsSztzQkFFVSxLLEVBQU87QUFDaEIsYUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsT0FBZCxFQUF1QixLQUF2QixDQUFQO0FBQ0Q7Ozs7OztBQXJWa0IsYSxDQUVaLGlCLEdBQW9CO0FBQ3pCLFNBQU87QUFEa0IsQztrQkFGUixhIiwiZmlsZSI6ImdhbWUtbG9naWMvbG9naWMvZGlzay1nYW1lLWxvZ2ljLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBhbmVsc0FjdGlvbkNyZWF0b3IgZnJvbSAnLi4vYWN0aW9ucy9wYW5lbHMtYWN0aW9uLWNyZWF0b3InO1xuaW1wb3J0IERpc2tzQWN0aW9uQ3JlYXRvciBmcm9tICcuLi9hY3Rpb25zL2Rpc2tzLWFjdGlvbi1jcmVhdG9yJztcbmltcG9ydCBTY3VscHR1cmVBY3Rpb25DcmVhdG9yIGZyb20gJy4uL2FjdGlvbnMvc2N1bHB0dXJlLWFjdGlvbi1jcmVhdG9yJztcbmltcG9ydCBEaXNrIGZyb20gJy4uL3V0aWxzL2Rpc2snO1xuXG5jb25zdCBERUZBVUxUX0xFVkVMID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlza0dhbWVMb2dpYyB7XG4gIC8vIFRoZXNlIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzY3VscHR1cmUgc3RvcmVcbiAgc3RhdGljIHRyYWNrZWRQcm9wZXJ0aWVzID0ge1xuICAgIGxldmVsOiBERUZBVUxUX0xFVkVMXG4gIH07XG5cbiAgY29uc3RydWN0b3Ioc3RvcmUsIGNvbmZpZykge1xuICAgIHRoaXMuc3RvcmUgPSBzdG9yZTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmdhbWVDb25maWcgPSBjb25maWcuRElTS19HQU1FO1xuXG4gICAgdGhpcy5fY29tcGxldGUgPSBmYWxzZTtcbiAgfVxuXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdkaXNrJyk7XG4gIH1cblxuICBnZXQgX2xpZ2h0cygpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5kYXRhLmdldCgnbGlnaHRzJyk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLl9sZXZlbCA9IERFRkFVTFRfTEVWRUw7XG4gICAgdGhpcy5fY29tcGxldGUgPSBmYWxzZTtcblxuICAgIC8vIEFjdGl2YXRlIHNoYWRvdyBsaWdodHNcbiAgICBmb3IgKGxldCBzdHJpcElkIG9mIE9iamVjdC5rZXlzKHRoaXMuZ2FtZUNvbmZpZy5TSEFET1dfTElHSFRTKSkge1xuICAgICAgY29uc3QgcGFuZWxzID0gdGhpcy5nYW1lQ29uZmlnLlNIQURPV19MSUdIVFNbc3RyaXBJZF07XG4gICAgICBmb3IgKGxldCBwYW5lbElkIG9mIE9iamVjdC5rZXlzKHBhbmVscykpIHtcbiAgICAgICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCB0aGlzLmdhbWVDb25maWcuU0hBRE9XX0xJR0hUX0lOVEVOU0lUWSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5kaWNhdGUgc3RhcnQgb2YgbmV3IGxldmVsIGJ5IHNldHRpbmcgcGVyaW1ldGVyIGxpZ2h0c1xuICAgIHRoaXMuX3NldFBlcmltZXRlcih0aGlzLl9sZXZlbCwgdGhpcy5nYW1lQ29uZmlnLlBFUklNRVRFUl9DT0xPUiwgdGhpcy5nYW1lQ29uZmlnLkFDVElWRV9QRVJJTUVURVJfSU5URU5TSVRZKTtcblxuICAgIC8vIEFjdGl2YXRlIFVJIGluZGljYXRvcnNcbiAgICBjb25zdCBjb250cm9sTWFwcGluZ3MgPSB0aGlzLmdhbWVDb25maWcuQ09OVFJPTF9NQVBQSU5HUztcbiAgICAvLyBUT0RPOiBDbGVhbiB0aGlzIHVwXG4gICAgZm9yIChsZXQgZGlza0lkIG9mIE9iamVjdC5rZXlzKGNvbnRyb2xNYXBwaW5ncy5DTE9DS1dJU0VfUEFORUxTKSkge1xuICAgICAgZm9yIChsZXQgcGFuZWxJZCBvZiBjb250cm9sTWFwcGluZ3MuQ0xPQ0tXSVNFX1BBTkVMU1tkaXNrSWRdKSB7XG4gICAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoY29udHJvbE1hcHBpbmdzLkNMT0NLV0lTRV9TVFJJUCwgcGFuZWxJZCwgdGhpcy5nYW1lQ29uZmlnLkNPTlRST0xfUEFORUxfSU5URU5TSVRZKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgZGlza0lkIG9mIE9iamVjdC5rZXlzKGNvbnRyb2xNYXBwaW5ncy5DT1VOVEVSQ0xPQ0tXSVNFX1BBTkVMUykpIHtcbiAgICAgIGZvciAobGV0IHBhbmVsSWQgb2YgY29udHJvbE1hcHBpbmdzLkNPVU5URVJDTE9DS1dJU0VfUEFORUxTW2Rpc2tJZF0pIHtcbiAgICAgICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShjb250cm9sTWFwcGluZ3MuQ09VTlRFUkNMT0NLV0lTRV9TVFJJUCwgcGFuZWxJZCwgdGhpcy5nYW1lQ29uZmlnLkNPTlRST0xfUEFORUxfSU5URU5TSVRZKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBUT0RPOiBUaGVzZSBlbmQoKSBtZXRob2RzIG1heSBiZSBvYnNvbGV0ZSBub3cgc2luY2UgZXZlcnl0aGluZyBpcyByZXNldCBiZWZvcmUgZXZlcnkgZ2FtZSBhbnl3YXlcbiAgZW5kKCkge1xuICAgIHRoaXMuY29uZmlnLkxJR0hUUy5HQU1FX1NUUklQUy5mb3JFYWNoKChpZCkgPT4gdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShpZCwgbnVsbCwgMCkpO1xuICAgIC8vIERlYWN0aXZhdGUgc2hhZG93IGxpZ2h0c1xuICAgIGZvciAobGV0IHN0cmlwSWQgb2YgT2JqZWN0LmtleXModGhpcy5nYW1lQ29uZmlnLlNIQURPV19MSUdIVFMpKSB7XG4gICAgICBjb25zdCBwYW5lbHMgPSB0aGlzLmdhbWVDb25maWcuU0hBRE9XX0xJR0hUU1tzdHJpcElkXTtcbiAgICAgIGZvciAobGV0IHBhbmVsSWQgb2YgT2JqZWN0LmtleXMocGFuZWxzKSkge1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQsIDApO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBEZWFjdGl2YXRlIHBlcmltZXRlciBsaWdodHMgKEZJWE1FOiBUaGlzIHNob3VsZCBiZSBwYXJ0IG9mIHRoZSBlbmQgYW5pbWF0aW9uKVxuICAgIGZvciAobGV0IHBhbmVsSWQgb2YgWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNSddKSB7XG4gICAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHRoaXMuY29uZmlnLkxJR0hUUy5QRVJJTUVURVJfU1RSSVAsIHBhbmVsSWQsIDApO1xuICAgICAgdGhpcy5fbGlnaHRzLnNldERlZmF1bHRDb2xvcih0aGlzLmNvbmZpZy5MSUdIVFMuUEVSSU1FVEVSX1NUUklQLCBwYW5lbElkKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVBY3Rpb25QYXlsb2FkKHBheWxvYWQpIHtcbiAgICBjb25zdCBhY3Rpb25IYW5kbGVycyA9IHtcbiAgICAgIFtQYW5lbHNBY3Rpb25DcmVhdG9yLlBBTkVMX1BSRVNTRURdOiB0aGlzLl9hY3Rpb25QYW5lbFByZXNzZWQuYmluZCh0aGlzKSxcbiAgICAgIFtEaXNrc0FjdGlvbkNyZWF0b3IuRElTS19VUERBVEVdOiB0aGlzLl9hY3Rpb25EaXNrVXBkYXRlLmJpbmQodGhpcyksXG4gICAgICBbU2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5GSU5JU0hfU1RBVFVTX0FOSU1BVElPTl06IHRoaXMuX2FjdGlvbkZpbmlzaFN0YXR1c0FuaW1hdGlvbi5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXIgPSBhY3Rpb25IYW5kbGVyc1twYXlsb2FkLmFjdGlvblR5cGVdO1xuICAgIGlmIChhY3Rpb25IYW5kbGVyKSB7XG4gICAgICBhY3Rpb25IYW5kbGVyKHBheWxvYWQpO1xuICAgIH1cbiAgfVxuXG4gIF9hY3Rpb25QYW5lbFByZXNzZWQocGF5bG9hZCkge1xuICAgIC8vIFRPRE86IEJyZWFrIHVwIHRoaXMgbWV0aG9kXG4gICAgaWYgKHRoaXMuX2NvbXBsZXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29udHJvbE1hcHBpbmdzID0gdGhpcy5nYW1lQ29uZmlnLkNPTlRST0xfTUFQUElOR1M7XG4gICAgY29uc3Qge3N0cmlwSWQsIHBhbmVsSWR9ID0gcGF5bG9hZDtcblxuICAgIGxldCBwYW5lbHMsIGRpcmVjdGlvbjtcbiAgICBpZiAoc3RyaXBJZCA9PT0gY29udHJvbE1hcHBpbmdzLkNMT0NLV0lTRV9TVFJJUCkge1xuICAgICAgcGFuZWxzID0gY29udHJvbE1hcHBpbmdzLkNMT0NLV0lTRV9QQU5FTFM7XG4gICAgICBkaXJlY3Rpb24gPSBEaXNrLkNMT0NLV0lTRTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc3RyaXBJZCA9PT0gY29udHJvbE1hcHBpbmdzLkNPVU5URVJDTE9DS1dJU0VfU1RSSVApIHtcbiAgICAgIHBhbmVscyA9IGNvbnRyb2xNYXBwaW5ncy5DT1VOVEVSQ0xPQ0tXSVNFX1BBTkVMUztcbiAgICAgIGRpcmVjdGlvbiA9IERpc2suQ09VTlRFUkNMT0NLV0lTRTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBqdXN0IGdvIHdpdGggd2hhdGV2ZXIgZGVmYXVsdCBiZWhhdmlvdXJcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZGlza0lkID0gbnVsbCwgcGFuZWxJZHM7XG4gICAgZm9yIChsZXQgcGFuZWxzRGlza0lkIG9mIE9iamVjdC5rZXlzKHBhbmVscykpIHtcbiAgICAgIHBhbmVsSWRzID0gcGFuZWxzW3BhbmVsc0Rpc2tJZF07XG4gICAgICBpZiAocGFuZWxJZHMuaW5jbHVkZXMocGFuZWxJZCkpIHtcbiAgICAgICAgZGlza0lkID0gcGFuZWxzRGlza0lkO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBsaWdodEFycmF5ID0gdGhpcy5fbGlnaHRzO1xuICAgIGlmIChkaXNrSWQgPT09IG51bGwpIHtcbiAgICAgIC8vIE92ZXJyaWRlIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBhbmQga2VlcCB0aGlzIHBhbmVsIG9mZiBiZWNhdXNlXG4gICAgICAvLyBpdCBpcyBzdGlsbCBhIHNwZWNpYWwgcGFuZWxcbiAgICAgIC8vIEl0IGp1c3QgZG9lc24ndCBkbyBhbnl0aGluZ1xuICAgICAgLy8gVE9ETzogTWFnaWMgbGl0ZXJhbFxuICAgICAgbGlnaHRBcnJheS5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGRpc2tzID0gdGhpcy5zdG9yZS5kYXRhLmdldCgnZGlza3MnKTtcbiAgICBjb25zdCBkaXNrID0gZGlza3MuZ2V0KGRpc2tJZCk7XG5cbiAgICBjb25zdCBhY3RpdmVQYW5lbHMgPSBwYW5lbElkcy5yZWR1Y2UoKHRvdGFsLCBjdXJyUGFuZWxJZCkgPT4ge1xuICAgICAgcmV0dXJuIHRvdGFsICsgKGxpZ2h0QXJyYXkuaXNBY3RpdmUoc3RyaXBJZCwgY3VyclBhbmVsSWQpID8gMSA6IDApO1xuICAgIH0sIDApO1xuXG4gICAgLy8gT25seSBuZWVkIHRvIGFjdGl2YXRlL2RlYWN0aXZhdGUgdGhlbSBvbmNlXG4gICAgaWYgKGFjdGl2ZVBhbmVscyA9PT0gMSkge1xuICAgICAgdGhpcy5fYWN0aXZhdGVEaXNrKGRpc2tJZCwgZGlyZWN0aW9uLCBzdHJpcElkLCBwYW5lbElkcyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGFjdGl2ZVBhbmVscyA9PT0gMCkge1xuICAgICAgdGhpcy5fZGVhY3RpdmF0ZURpc2soZGlza0lkLCBkaXJlY3Rpb24sIHN0cmlwSWQsIHBhbmVsSWRzKTtcbiAgICB9XG5cbiAgICBpZiAoZGlzay5pc0NvbmZsaWN0aW5nKSB7XG4gICAgICB0aGlzLl9zZXREaXNrQ29udHJvbHNDb2xvcihkaXNrSWQsIHRoaXMuY29uZmlnLkNPTE9SUy5FUlJPUik7XG4gICAgfVxuICB9XG5cbiAgX2FjdGlvbkRpc2tVcGRhdGUocGF5bG9hZCkge1xuICAgIGNvbnN0IHtkaXNrSWQsIHBvc2l0aW9uLCBkaXJlY3Rpb24sIHN0YXRlfSA9IHBheWxvYWQ7XG5cbiAgICBjb25zdCBkaXNrcyA9IHRoaXMuc3RvcmUuZGF0YS5nZXQoJ2Rpc2tzJyk7XG4gICAgY29uc3QgZGlzayA9IGRpc2tzLmdldChkaXNrSWQpO1xuXG4gICAgaWYgKHR5cGVvZiBwb3NpdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGRpc2sucm90YXRlVG8ocG9zaXRpb24pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGRpcmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGRpc2suc2V0RGlyZWN0aW9uKGRpcmVjdGlvbik7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3RhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBkaXNrLnNldFN0YXRlKHN0YXRlKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RvcmUuaXNTdGF0dXNTdWNjZXNzKSB7XG4gICAgICAvLyBGSVhNRTpcbiAgICAgIC8vIEluc3RlYWQgb2YganVzdCBjaGVja2luZyBmb3IgdGhlIHdpbiBjb25kaXRpb24sIHdlIHdhbnQgdG86XG4gICAgICAvLyAtIElmIERpc2sgMCBvciBEaXNrIDIgKHRoZSBkaXNrcyB3aXRoIHRoZSBib3VuZGFyeSBwYXJ0IG9mIHRoZSBwYXR0ZXJuKSBpcyBpbiB0aGVcbiAgICAgIC8vICAgY29ycmVjdCBsb2NhdGlvbiBmb3IgYSBtaW5pbXVtIGFtb3VudCBvZiB0aW1lLCB3ZSB0cmlnZ2VyIHRoZSBTaW5nbGUgRGlzayBTdWNjZXNzIGV2ZW50XG5cbiAgICAgIC8vIFNpbmdsZSBEaXNrIFN1Y2Nlc3MgRXZlbnRcbiAgICAgIC8vIC0gUGxheSBzdWNjZXNzIHNvdW5kcyAoQXVkaW9WaWV3KVxuICAgICAgLy8gLSBVSSBMRURTIGFuZCBkaXNrIExFRCB0dXJucyBsb2NhdGlvbiBjb2xvclxuICAgICAgLy8gLSBJZiBEaXNrIDEgb3IgMiwgdHVybiBwZXJpbWV0ZXIgTEVEIHRvIGxvY2F0aW9uIGNvbG9yXG4gICAgICAvLyAtIExvY2sgdGhpcyBkaXNrIGluIHBvc2l0aW9uOyBkaXNhYmxlIGFueSBmdXR1cmUgaW50ZXJhY3Rpb25cbiAgICAgIC8vIC0gRnJvbSBub3cgb24sIGFsbG93IERpc2sgMSB0byB0cmlnZ2VyIGEgU2luZ2xlIERpc2sgU3VjY2VzcyBFdmVudFxuICAgICAgdGhpcy5fY2hlY2tXaW5Db25kaXRpb25zKGRpc2tzKTtcbiAgICB9XG4gIH1cblxuICBfYWN0aW9uRmluaXNoU3RhdHVzQW5pbWF0aW9uKHBheWxvYWQpIHtcbiAgICBpZiAodGhpcy5fY29tcGxldGUpIHtcbiAgICAgIHRoaXMuc3RvcmUubW92ZVRvTmV4dEdhbWUoKTtcbiAgICB9XG4gIH1cblxuICBfYWN0aXZhdGVEaXNrKGRpc2tJZCwgZGlyZWN0aW9uLCBzdHJpcElkLCBwYW5lbElkcykge1xuICAgIGNvbnN0IGRpc2tzID0gdGhpcy5zdG9yZS5kYXRhLmdldCgnZGlza3MnKTtcbiAgICBjb25zdCBkaXNrID0gZGlza3MuZ2V0KGRpc2tJZCk7XG4gICAgZGlzay5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKTtcblxuICAgIHBhbmVsSWRzLmZvckVhY2goKHBhbmVsSWQpID0+IHtcbiAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5nYW1lQ29uZmlnLkFDVElWRV9DT05UUk9MX1BBTkVMX0lOVEVOU0lUWSk7XG4gICAgICB0aGlzLl9saWdodHMuc2V0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5zdG9yZS51c2VyQ29sb3IpO1xuICAgIH0pO1xuICB9XG5cbiAgX2RlYWN0aXZhdGVEaXNrKGRpc2tJZCwgZGlyZWN0aW9uLCBzdHJpcElkLCBwYW5lbElkcykge1xuICAgIGNvbnN0IGRpc2tzID0gdGhpcy5zdG9yZS5kYXRhLmdldCgnZGlza3MnKTtcbiAgICBjb25zdCBkaXNrID0gZGlza3MuZ2V0KGRpc2tJZCk7XG4gICAgaWYgKCFkaXNrLmlzU3RvcHBlZCkge1xuICAgICAgLy8gVGhpcyBmaXhlcyBhIGJ1ZyB3aGVyZSBhIHVzZXIgd2lucyB0aGUgbGV2ZWwgd2l0aCB0aGVpciBoYW5kIG9uIHRoZVxuICAgICAgLy8gcGFuZWwgYW5kIHRoZW4gdGFrZXMgaXQgb2ZmLiBXZSBzdG9wIGFsbCB0aGUgZGlza3MgYmV0d2VlbiBsZXZlbHMgc29cbiAgICAgIC8vIGFsbCB0aGUgZGlza3MgYXJlIGFscmVhZHkgb2ZmIHdoZW4gdGhleSBsZXQgZ28uIFRoaXMgY2FuIGNhdXNlIGVycm9yc1xuICAgICAgLy8gVE9ETzogRGV0ZXJtaW5lIGlmIHRoaXMgY2hlY2sgc2hvdWxkIGFjdHVhbGx5IGJlIGluIERpc2sjdW5zZXREaXJlY3Rpb25cbiAgICAgIGRpc2sudW5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICBwYW5lbElkcy5mb3JFYWNoKChwYW5lbElkKSA9PiB7XG4gICAgICAvLyBUT0RPOiBPbmx5IGRlYWN0aXZhdGUgaWYgYm90aCBwYW5lbHMgYXJlIGluYWN0aXZlXG4gICAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMuZ2FtZUNvbmZpZy5DT05UUk9MX1BBTkVMX0lOVEVOU0lUWSk7XG4gICAgICB0aGlzLl9saWdodHMuc2V0RGVmYXVsdENvbG9yKHN0cmlwSWQsIHBhbmVsSWQpO1xuICAgIH0pO1xuICB9XG5cbiAgX3NldERpc2tDb250cm9sc0NvbG9yKGRpc2tJZCwgY29sb3IpIHtcbiAgICBjb25zdCBjb250cm9sTWFwcGluZ3MgPSB0aGlzLmdhbWVDb25maWcuQ09OVFJPTF9NQVBQSU5HUztcblxuICAgIGNvbnN0IGxpZ2h0QXJyYXkgPSB0aGlzLl9saWdodHM7XG4gICAgZm9yIChsZXQgcGFuZWxJZCBvZiBjb250cm9sTWFwcGluZ3MuQ0xPQ0tXSVNFX1BBTkVMU1tkaXNrSWRdKSB7XG4gICAgICBsaWdodEFycmF5LnNldENvbG9yKGNvbnRyb2xNYXBwaW5ncy5DTE9DS1dJU0VfU1RSSVAsIHBhbmVsSWQsIGNvbG9yKTtcbiAgICB9XG4gICAgZm9yIChsZXQgcGFuZWxJZCBvZiBjb250cm9sTWFwcGluZ3MuQ09VTlRFUkNMT0NLV0lTRV9QQU5FTFNbZGlza0lkXSkge1xuICAgICAgbGlnaHRBcnJheS5zZXRDb2xvcihjb250cm9sTWFwcGluZ3MuQ09VTlRFUkNMT0NLV0lTRV9TVFJJUCwgcGFuZWxJZCwgY29sb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaW4gY29uZGl0aW9uczpcbiAgICogLSBUaGUgdGhyZWUgZGlza3MgbmVlZHMgdG8gYmUgX3JlbGF0aXZlbHlfIGFsaWduZWQgd2l0aGluIFJFTEFUSVZFX1RPTEVSQU5DRVxuICAgKiAtIEFueSBkaXNrIG11c3QgYmUgYWxpZ25lZCB3aXRoaW4gQUJTT0xVVEVfVE9MRVJBTkNFXG4gICAqL1xuICBfY2hlY2tXaW5Db25kaXRpb25zKGRpc2tzKSB7XG4gICAgZm9yIChsZXQgZGlza0lkIG9mIE9iamVjdC5rZXlzKHRoaXMuX3RhcmdldFBvc2l0aW9ucykpIHtcbiAgICAgIGNvbnN0IHRhcmdldFBvcyA9IHRoaXMuX3RhcmdldFBvc2l0aW9uc1tkaXNrSWRdO1xuICAgICAgY29uc3QgY3VyckRpc2sgPSBkaXNrcy5nZXQoZGlza0lkKTtcbiAgICAgIGNvbnN0IGRpc2tQb3MgPSBjdXJyRGlzay5nZXRQb3NpdGlvbigpO1xuXG4gICAgICAvLyBDaGVjayBwb3NpdGlvbiByZWxhdGl2ZSB0byBuZWlnaGJvciBkaXNrXG4vLyBGSVhNRTogV2UgZGlzYWJsZWQgdGhpcyBmb3Igbm93LCBhcyByZWxhdGl2ZSB0b2xlcmFuY2Ugb25seSBtYWtlcyBzZW5zZVxuLy8gaWYgd2UgaGF2ZSBiZXR0ZXIgZGlzayBwcmVjaXNpb24gdGhhbiB0aGUgdG9sZXJhbmNlLlxuLy8gICAgbGV0IHByZXZEaXNrSWQgPSBudWxsO1xuLy8gICAgICBpZiAocHJldkRpc2tJZCkge1xuLy8gICAgICAgIGlmIChNYXRoLmFicygodGFyZ2V0UG9zIC0gdGhpcy5fdGFyZ2V0UG9zaXRpb25zW3ByZXZEaXNrSWRdKSAtXG4vLyAgICAgICAgICAgICAgICAgICAgIChkaXNrUG9zIC0gZGlza3MuZ2V0KHByZXZEaXNrSWQpLmdldFBvc2l0aW9uKCkpKSA+XG4vLyAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUNvbmZpZy5SRUxBVElWRV9UT0xFUkFOQ0UpIHtcbi8vICAgICAgICAgIHJldHVybiBmYWxzZTtcbi8vICAgICAgICB9XG4vLyAgICAgIH1cbiAgICAgIC8vIENoZWNrIGFic29sdXRlIHBvc2l0aW9uXG4gICAgICBjb25zdCBkID0gTWF0aC5hYnMoZGlza1BvcyAtIHRhcmdldFBvcykgJSAzNjA7XG4gICAgICBjb25zdCByID0gZCA+IDE4MCA/IDM2MCAtIGQgOiBkO1xuICAgICAgY29uc29sZS5kZWJ1ZyhgJHtkaXNrSWR9IGVycm9yOiAke3J9YCk7XG4gICAgICBpZiAoTWF0aC5hYnMocikgPiB0aGlzLmdhbWVDb25maWcuQUJTT0xVVEVfVE9MRVJBTkNFKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbi8vICAgICAgcHJldkRpc2tJZCA9IGRpc2tJZDtcbiAgICB9XG5cbiAgICB0aGlzLl93aW5HYW1lKCk7XG4gIH1cblxuICAvLyBUT0RPOiBtb3ZlIHRoZXNlIHB1YmxpYyBtZXRob2RzIHVwXG4gIGdldERpc2tTY29yZShkaXNrSWQpIHtcbiAgICAvLyBXZSBjYW5ub3QgY2FsY3VsYXRlIHRoZSBzY29yZSBvZiBhIGNvbXBsZXRlIGdhbWUgYXMgd2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIGxldmVsXG4gICAgaWYgKHRoaXMuX2NvbXBsZXRlKSByZXR1cm4gMDtcblxuICAgIGNvbnN0IGRpc2tzID0gdGhpcy5zdG9yZS5kYXRhLmdldCgnZGlza3MnKTtcbiAgICBsZXQgZGVsdGEgPSB0aGlzLl90YXJnZXRQb3NpdGlvbnNbZGlza0lkXSAtIGRpc2tzLmdldChkaXNrSWQpLmdldFBvc2l0aW9uKCk7XG4gICAgd2hpbGUgKGRlbHRhIDw9IC0xODApIGRlbHRhICs9IDM2MDtcbiAgICB3aGlsZSAoZGVsdGEgPiAxODApIGRlbHRhIC09IDM2MDtcbiAgICByZXR1cm4gTWF0aC5hYnMoZGVsdGEpO1xuICB9XG4gIC8qKlxuICAgKiBDdXJyZW50IHNjb3JlICh0aGUgdG90YWwgbnVtYmVyIG9mIGRlZ3JlZXMgYXdheSBmcm9tIHNvbHV0aW9uKS5cbiAgICogRm9yIDMgZGlza3MsIHRoaXMgd2lsbCBiZSBiZXR3ZWVuIDAgYW5kIDU0MFxuICAgKi9cbiAgZ2V0U2NvcmUoZGlza3MpIHtcbiAgICAvLyBXZSBjYW5ub3QgY2FsY3VsYXRlIHRoZSBzY29yZSBvZiBhIGNvbXBsZXRlIGdhbWUgYXMgd2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIGxldmVsXG4gICAgaWYgKHRoaXMuX2NvbXBsZXRlKSByZXR1cm4gMDtcblxuICAgIGxldCBkaXN0YW5jZSA9IDA7XG4gICAgZm9yIChsZXQgZGlza0lkIG9mIE9iamVjdC5rZXlzKHRoaXMuX3RhcmdldFBvc2l0aW9ucykpIHtcbiAgICAgIGRpc3RhbmNlICs9IHRoaXMuZ2V0RGlza1Njb3JlKGRpc2tJZCk7XG4gICAgfVxuICAgIHJldHVybiBkaXN0YW5jZTtcbiAgfVxuXG4gIF93aW5HYW1lKCkge1xuICAgIHRoaXMuc3RvcmUuZGF0YS5nZXQoJ2xpZ2h0cycpLmRlYWN0aXZhdGVBbGwoKTtcbiAgICB0aGlzLl9zdG9wQWxsRGlza3MoKTtcblxuICAgIHRoaXMuc3RvcmUuc2V0U3VjY2Vzc1N0YXR1cygpO1xuXG4gICAgLy8gSW5kaWNhdGUgZW5kIG9mIGxldmVsIGJ5IHNldHRpbmcgcGVyaW1ldGVyIGxpZ2h0c1xuICAgIHRoaXMuX3NldFBlcmltZXRlcih0aGlzLl9sZXZlbCwgdGhpcy5zdG9yZS51c2VyQ29sb3IsIHRoaXMuZ2FtZUNvbmZpZy5JTkFDVElWRV9QRVJJTUVURVJfSU5URU5TSVRZKTtcblxuICAgIGxldCBsZXZlbCA9IHRoaXMuX2xldmVsICsgMTtcbiAgICBpZiAobGV2ZWwgPj0gdGhpcy5fbGV2ZWxzKSB7XG4gICAgICB0aGlzLl9jb21wbGV0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcblxuICAgIC8vIEluZGljYXRlIHN0YXJ0IG9mIG5ldyBsZXZlbCBieSBzZXR0aW5nIHBlcmltZXRlciBsaWdodHNcbiAgICBpZiAoIXRoaXMuX2NvbXBsZXRlKSB7XG4gICAgICB0aGlzLl9zZXRQZXJpbWV0ZXIobGV2ZWwsIHRoaXMuZ2FtZUNvbmZpZy5QRVJJTUVURVJfQ09MT1IsIHRoaXMuZ2FtZUNvbmZpZy5BQ1RJVkVfUEVSSU1FVEVSX0lOVEVOU0lUWSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwZXJpbWV0ZXIgbGlnaHRzIGZvciB0aGUgZ2l2ZW4gbGV2ZWwgdG8gdGhlIGdpdmVuIGNvbG9yIGFuZCBpbnRlbnNpdHlcbiAgICovXG4gIF9zZXRQZXJpbWV0ZXIobGV2ZWwsIGNvbG9yLCBpbnRlbnNpdHkpIHtcbiAgICBjb25zdCBwZXJpbWV0ZXIgPSB0aGlzLmdhbWVDb25maWcuTEVWRUxTW2xldmVsXS5wZXJpbWV0ZXI7XG4gICAgZm9yIChsZXQgc3RyaXBJZCBvZiBPYmplY3Qua2V5cyhwZXJpbWV0ZXIpKSB7XG4gICAgICBmb3IgKGxldCBwYW5lbElkIG9mIHBlcmltZXRlcltzdHJpcElkXSkge1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCwgY29sb3IpO1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQsIGludGVuc2l0eSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3N0b3BBbGxEaXNrcygpIHtcbiAgICBjb25zdCBkaXNrcyA9IHRoaXMuc3RvcmUuZGF0YS5nZXQoJ2Rpc2tzJyk7XG5cbiAgICBmb3IgKGxldCBkaXNrSWQgb2YgZGlza3MpIHtcbiAgICAgIGRpc2tzLmdldChkaXNrSWQpLnN0b3AoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgX3RhcmdldFBvc2l0aW9ucygpIHtcbiAgICBjb25zdCBsZXZlbCA9IHRoaXMuX2xldmVsO1xuICAgIHJldHVybiB0aGlzLmdhbWVDb25maWcuTEVWRUxTW2xldmVsXS5kaXNrcztcbiAgfVxuXG4gIGdldCBfbGV2ZWxzKCkge1xuICAgIHJldHVybiB0aGlzLmdhbWVDb25maWcuTEVWRUxTLmxlbmd0aDtcbiAgfVxuXG4gIGdldCBfbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXQoJ2xldmVsJyk7XG4gIH1cblxuICBzZXQgX2xldmVsKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5zZXQoJ2xldmVsJywgdmFsdWUpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
