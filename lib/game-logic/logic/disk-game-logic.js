'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PanelsActionCreator = require('../actions/panels-action-creator');
var DisksActionCreator = require('../actions/disks-action-creator');
var SculptureActionCreator = require('../actions/sculpture-action-creator');

var Disk = require('../utils/disk');

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

      var actionHandlers = (_actionHandlers = {}, _defineProperty(_actionHandlers, PanelsActionCreator.PANEL_PRESSED, this._actionPanelPressed.bind(this)), _defineProperty(_actionHandlers, DisksActionCreator.DISK_UPDATE, this._actionDiskUpdate.bind(this)), _defineProperty(_actionHandlers, SculptureActionCreator.FINISH_STATUS_ANIMATION, this._actionFinishStatusAnimation.bind(this)), _actionHandlers);

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
        direction = Disk.CLOCKWISE;
      } else if (stripId === controlMappings.COUNTERCLOCKWISE_STRIP) {
        panels = controlMappings.COUNTERCLOCKWISE_PANELS;
        direction = Disk.COUNTERCLOCKWISE;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvbG9naWMvZGlzay1nYW1lLWxvZ2ljLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLElBQU0sc0JBQXNCLFFBQVEsa0NBQVIsQ0FBNUI7QUFDQSxJQUFNLHFCQUFxQixRQUFRLGlDQUFSLENBQTNCO0FBQ0EsSUFBTSx5QkFBeUIsUUFBUSxxQ0FBUixDQUEvQjs7QUFFQSxJQUFNLE9BQU8sUUFBUSxlQUFSLENBQWI7O0FBRUEsSUFBTSxnQkFBZ0IsQ0FBdEI7O0lBRXFCLGE7QUFNbkIseUJBQVksS0FBWixFQUFtQixNQUFuQixFQUEyQjtBQUFBOztBQUN6QixTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsU0FBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLFNBQUssVUFBTCxHQUFrQixPQUFPLFNBQXpCOztBQUVBLFNBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNEOzs7Ozs7NEJBVU87QUFDTixXQUFLLE1BQUwsR0FBYyxhQUFkO0FBQ0EsV0FBSyxTQUFMLEdBQWlCLEtBQWpCOzs7QUFGTTtBQUFBO0FBQUE7O0FBQUE7QUFLTiw2QkFBb0IsT0FBTyxJQUFQLENBQVksS0FBSyxVQUFMLENBQWdCLGFBQTVCLENBQXBCLDhIQUFnRTtBQUFBLGNBQXZELE9BQXVEOztBQUM5RCxjQUFNLFNBQVMsS0FBSyxVQUFMLENBQWdCLGFBQWhCLENBQThCLE9BQTlCLENBQWY7QUFEOEQ7QUFBQTtBQUFBOztBQUFBO0FBRTlELGtDQUFvQixPQUFPLElBQVAsQ0FBWSxNQUFaLENBQXBCLG1JQUF5QztBQUFBLGtCQUFoQyxPQUFnQzs7QUFDdkMsbUJBQUssT0FBTCxDQUFhLFlBQWIsQ0FBMEIsT0FBMUIsRUFBbUMsT0FBbkMsRUFBNEMsS0FBSyxVQUFMLENBQWdCLHNCQUE1RDtBQUNEO0FBSjZEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLL0Q7OztBQVZLO0FB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QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTWY7Ozt3QkF0VFU7QUFDVCxhQUFPLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBb0IsTUFBcEIsQ0FBUDtBQUNEOzs7d0JBRWE7QUFDWixhQUFPLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBb0IsUUFBcEIsQ0FBUDtBQUNEOzs7d0JBa1RzQjtBQUNyQixVQUFNLFFBQVEsS0FBSyxNQUFuQjtBQUNBLGFBQU8sS0FBSyxVQUFMLENBQWdCLE1BQWhCLENBQXVCLEtBQXZCLEVBQThCLEtBQXJDO0FBQ0Q7Ozt3QkFFYTtBQUNaLGFBQU8sS0FBSyxVQUFMLENBQWdCLE1BQWhCLENBQXVCLE1BQTlCO0FBQ0Q7Ozt3QkFFWTtBQUNYLGFBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLE9BQWQsQ0FBUDtBQUNELEs7c0JBRVUsSyxFQUFPO0FBQ2hCLGFBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLE9BQWQsRUFBdUIsS0FBdkIsQ0FBUDtBQUNEOzs7Ozs7QUFyVmtCLGEsQ0FFWixpQixHQUFvQjtBQUN6QixTQUFPO0FBRGtCLEM7a0JBRlIsYSIsImZpbGUiOiJnYW1lLWxvZ2ljL2xvZ2ljL2Rpc2stZ2FtZS1sb2dpYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBhbmVsc0FjdGlvbkNyZWF0b3IgPSByZXF1aXJlKCcuLi9hY3Rpb25zL3BhbmVscy1hY3Rpb24tY3JlYXRvcicpO1xuY29uc3QgRGlza3NBY3Rpb25DcmVhdG9yID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9kaXNrcy1hY3Rpb24tY3JlYXRvcicpO1xuY29uc3QgU2N1bHB0dXJlQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvc2N1bHB0dXJlLWFjdGlvbi1jcmVhdG9yJyk7XG5cbmNvbnN0IERpc2sgPSByZXF1aXJlKCcuLi91dGlscy9kaXNrJyk7XG5cbmNvbnN0IERFRkFVTFRfTEVWRUwgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNrR2FtZUxvZ2ljIHtcbiAgLy8gVGhlc2UgYXJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgdG8gdGhlIHNjdWxwdHVyZSBzdG9yZVxuICBzdGF0aWMgdHJhY2tlZFByb3BlcnRpZXMgPSB7XG4gICAgbGV2ZWw6IERFRkFVTFRfTEVWRUxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihzdG9yZSwgY29uZmlnKSB7XG4gICAgdGhpcy5zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuZ2FtZUNvbmZpZyA9IGNvbmZpZy5ESVNLX0dBTUU7XG5cbiAgICB0aGlzLl9jb21wbGV0ZSA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZGF0YS5nZXQoJ2Rpc2snKTtcbiAgfVxuXG4gIGdldCBfbGlnaHRzKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdsaWdodHMnKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX2xldmVsID0gREVGQVVMVF9MRVZFTDtcbiAgICB0aGlzLl9jb21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgLy8gQWN0aXZhdGUgc2hhZG93IGxpZ2h0c1xuICAgIGZvciAobGV0IHN0cmlwSWQgb2YgT2JqZWN0LmtleXModGhpcy5nYW1lQ29uZmlnLlNIQURPV19MSUdIVFMpKSB7XG4gICAgICBjb25zdCBwYW5lbHMgPSB0aGlzLmdhbWVDb25maWcuU0hBRE9XX0xJR0hUU1tzdHJpcElkXTtcbiAgICAgIGZvciAobGV0IHBhbmVsSWQgb2YgT2JqZWN0LmtleXMocGFuZWxzKSkge1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMuZ2FtZUNvbmZpZy5TSEFET1dfTElHSFRfSU5URU5TSVRZKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbmRpY2F0ZSBzdGFydCBvZiBuZXcgbGV2ZWwgYnkgc2V0dGluZyBwZXJpbWV0ZXIgbGlnaHRzXG4gICAgdGhpcy5fc2V0UGVyaW1ldGVyKHRoaXMuX2xldmVsLCB0aGlzLmdhbWVDb25maWcuUEVSSU1FVEVSX0NPTE9SLCB0aGlzLmdhbWVDb25maWcuQUNUSVZFX1BFUklNRVRFUl9JTlRFTlNJVFkpO1xuXG4gICAgLy8gQWN0aXZhdGUgVUkgaW5kaWNhdG9yc1xuICAgIGNvbnN0IGNvbnRyb2xNYXBwaW5ncyA9IHRoaXMuZ2FtZUNvbmZpZy5DT05UUk9MX01BUFBJTkdTO1xuICAgIC8vIFRPRE86IENsZWFuIHRoaXMgdXBcbiAgICBmb3IgKGxldCBkaXNrSWQgb2YgT2JqZWN0LmtleXMoY29udHJvbE1hcHBpbmdzLkNMT0NLV0lTRV9QQU5FTFMpKSB7XG4gICAgICBmb3IgKGxldCBwYW5lbElkIG9mIGNvbnRyb2xNYXBwaW5ncy5DTE9DS1dJU0VfUEFORUxTW2Rpc2tJZF0pIHtcbiAgICAgICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShjb250cm9sTWFwcGluZ3MuQ0xPQ0tXSVNFX1NUUklQLCBwYW5lbElkLCB0aGlzLmdhbWVDb25maWcuQ09OVFJPTF9QQU5FTF9JTlRFTlNJVFkpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBkaXNrSWQgb2YgT2JqZWN0LmtleXMoY29udHJvbE1hcHBpbmdzLkNPVU5URVJDTE9DS1dJU0VfUEFORUxTKSkge1xuICAgICAgZm9yIChsZXQgcGFuZWxJZCBvZiBjb250cm9sTWFwcGluZ3MuQ09VTlRFUkNMT0NLV0lTRV9QQU5FTFNbZGlza0lkXSkge1xuICAgICAgICB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KGNvbnRyb2xNYXBwaW5ncy5DT1VOVEVSQ0xPQ0tXSVNFX1NUUklQLCBwYW5lbElkLCB0aGlzLmdhbWVDb25maWcuQ09OVFJPTF9QQU5FTF9JTlRFTlNJVFkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE86IFRoZXNlIGVuZCgpIG1ldGhvZHMgbWF5IGJlIG9ic29sZXRlIG5vdyBzaW5jZSBldmVyeXRoaW5nIGlzIHJlc2V0IGJlZm9yZSBldmVyeSBnYW1lIGFueXdheVxuICBlbmQoKSB7XG4gICAgdGhpcy5jb25maWcuTElHSFRTLkdBTUVfU1RSSVBTLmZvckVhY2goKGlkKSA9PiB0aGlzLl9saWdodHMuc2V0SW50ZW5zaXR5KGlkLCBudWxsLCAwKSk7XG4gICAgLy8gRGVhY3RpdmF0ZSBzaGFkb3cgbGlnaHRzXG4gICAgZm9yIChsZXQgc3RyaXBJZCBvZiBPYmplY3Qua2V5cyh0aGlzLmdhbWVDb25maWcuU0hBRE9XX0xJR0hUUykpIHtcbiAgICAgIGNvbnN0IHBhbmVscyA9IHRoaXMuZ2FtZUNvbmZpZy5TSEFET1dfTElHSFRTW3N0cmlwSWRdO1xuICAgICAgZm9yIChsZXQgcGFuZWxJZCBvZiBPYmplY3Qua2V5cyhwYW5lbHMpKSB7XG4gICAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIERlYWN0aXZhdGUgcGVyaW1ldGVyIGxpZ2h0cyAoRklYTUU6IFRoaXMgc2hvdWxkIGJlIHBhcnQgb2YgdGhlIGVuZCBhbmltYXRpb24pXG4gICAgZm9yIChsZXQgcGFuZWxJZCBvZiBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1J10pIHtcbiAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkodGhpcy5jb25maWcuTElHSFRTLlBFUklNRVRFUl9TVFJJUCwgcGFuZWxJZCwgMCk7XG4gICAgICB0aGlzLl9saWdodHMuc2V0RGVmYXVsdENvbG9yKHRoaXMuY29uZmlnLkxJR0hUUy5QRVJJTUVURVJfU1RSSVAsIHBhbmVsSWQpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUFjdGlvblBheWxvYWQocGF5bG9hZCkge1xuICAgIGNvbnN0IGFjdGlvbkhhbmRsZXJzID0ge1xuICAgICAgW1BhbmVsc0FjdGlvbkNyZWF0b3IuUEFORUxfUFJFU1NFRF06IHRoaXMuX2FjdGlvblBhbmVsUHJlc3NlZC5iaW5kKHRoaXMpLFxuICAgICAgW0Rpc2tzQWN0aW9uQ3JlYXRvci5ESVNLX1VQREFURV06IHRoaXMuX2FjdGlvbkRpc2tVcGRhdGUuYmluZCh0aGlzKSxcbiAgICAgIFtTY3VscHR1cmVBY3Rpb25DcmVhdG9yLkZJTklTSF9TVEFUVVNfQU5JTUFUSU9OXTogdGhpcy5fYWN0aW9uRmluaXNoU3RhdHVzQW5pbWF0aW9uLmJpbmQodGhpcylcbiAgICB9O1xuXG4gICAgY29uc3QgYWN0aW9uSGFuZGxlciA9IGFjdGlvbkhhbmRsZXJzW3BheWxvYWQuYWN0aW9uVHlwZV07XG4gICAgaWYgKGFjdGlvbkhhbmRsZXIpIHtcbiAgICAgIGFjdGlvbkhhbmRsZXIocGF5bG9hZCk7XG4gICAgfVxuICB9XG5cbiAgX2FjdGlvblBhbmVsUHJlc3NlZChwYXlsb2FkKSB7XG4gICAgLy8gVE9ETzogQnJlYWsgdXAgdGhpcyBtZXRob2RcbiAgICBpZiAodGhpcy5fY29tcGxldGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250cm9sTWFwcGluZ3MgPSB0aGlzLmdhbWVDb25maWcuQ09OVFJPTF9NQVBQSU5HUztcbiAgICBjb25zdCB7c3RyaXBJZCwgcGFuZWxJZH0gPSBwYXlsb2FkO1xuXG4gICAgbGV0IHBhbmVscywgZGlyZWN0aW9uO1xuICAgIGlmIChzdHJpcElkID09PSBjb250cm9sTWFwcGluZ3MuQ0xPQ0tXSVNFX1NUUklQKSB7XG4gICAgICBwYW5lbHMgPSBjb250cm9sTWFwcGluZ3MuQ0xPQ0tXSVNFX1BBTkVMUztcbiAgICAgIGRpcmVjdGlvbiA9IERpc2suQ0xPQ0tXSVNFO1xuICAgIH1cbiAgICBlbHNlIGlmIChzdHJpcElkID09PSBjb250cm9sTWFwcGluZ3MuQ09VTlRFUkNMT0NLV0lTRV9TVFJJUCkge1xuICAgICAgcGFuZWxzID0gY29udHJvbE1hcHBpbmdzLkNPVU5URVJDTE9DS1dJU0VfUEFORUxTO1xuICAgICAgZGlyZWN0aW9uID0gRGlzay5DT1VOVEVSQ0xPQ0tXSVNFO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGp1c3QgZ28gd2l0aCB3aGF0ZXZlciBkZWZhdWx0IGJlaGF2aW91clxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBkaXNrSWQgPSBudWxsLCBwYW5lbElkcztcbiAgICBmb3IgKGxldCBwYW5lbHNEaXNrSWQgb2YgT2JqZWN0LmtleXMocGFuZWxzKSkge1xuICAgICAgcGFuZWxJZHMgPSBwYW5lbHNbcGFuZWxzRGlza0lkXTtcbiAgICAgIGlmIChwYW5lbElkcy5pbmNsdWRlcyhwYW5lbElkKSkge1xuICAgICAgICBkaXNrSWQgPSBwYW5lbHNEaXNrSWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGxpZ2h0QXJyYXkgPSB0aGlzLl9saWdodHM7XG4gICAgaWYgKGRpc2tJZCA9PT0gbnVsbCkge1xuICAgICAgLy8gT3ZlcnJpZGUgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGFuZCBrZWVwIHRoaXMgcGFuZWwgb2ZmIGJlY2F1c2VcbiAgICAgIC8vIGl0IGlzIHN0aWxsIGEgc3BlY2lhbCBwYW5lbFxuICAgICAgLy8gSXQganVzdCBkb2Vzbid0IGRvIGFueXRoaW5nXG4gICAgICAvLyBUT0RPOiBNYWdpYyBsaXRlcmFsXG4gICAgICBsaWdodEFycmF5LnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGlza3MgPSB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdkaXNrcycpO1xuICAgIGNvbnN0IGRpc2sgPSBkaXNrcy5nZXQoZGlza0lkKTtcblxuICAgIGNvbnN0IGFjdGl2ZVBhbmVscyA9IHBhbmVsSWRzLnJlZHVjZSgodG90YWwsIGN1cnJQYW5lbElkKSA9PiB7XG4gICAgICByZXR1cm4gdG90YWwgKyAobGlnaHRBcnJheS5pc0FjdGl2ZShzdHJpcElkLCBjdXJyUGFuZWxJZCkgPyAxIDogMCk7XG4gICAgfSwgMCk7XG5cbiAgICAvLyBPbmx5IG5lZWQgdG8gYWN0aXZhdGUvZGVhY3RpdmF0ZSB0aGVtIG9uY2VcbiAgICBpZiAoYWN0aXZlUGFuZWxzID09PSAxKSB7XG4gICAgICB0aGlzLl9hY3RpdmF0ZURpc2soZGlza0lkLCBkaXJlY3Rpb24sIHN0cmlwSWQsIHBhbmVsSWRzKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYWN0aXZlUGFuZWxzID09PSAwKSB7XG4gICAgICB0aGlzLl9kZWFjdGl2YXRlRGlzayhkaXNrSWQsIGRpcmVjdGlvbiwgc3RyaXBJZCwgcGFuZWxJZHMpO1xuICAgIH1cblxuICAgIGlmIChkaXNrLmlzQ29uZmxpY3RpbmcpIHtcbiAgICAgIHRoaXMuX3NldERpc2tDb250cm9sc0NvbG9yKGRpc2tJZCwgdGhpcy5jb25maWcuQ09MT1JTLkVSUk9SKTtcbiAgICB9XG4gIH1cblxuICBfYWN0aW9uRGlza1VwZGF0ZShwYXlsb2FkKSB7XG4gICAgY29uc3Qge2Rpc2tJZCwgcG9zaXRpb24sIGRpcmVjdGlvbiwgc3RhdGV9ID0gcGF5bG9hZDtcblxuICAgIGNvbnN0IGRpc2tzID0gdGhpcy5zdG9yZS5kYXRhLmdldCgnZGlza3MnKTtcbiAgICBjb25zdCBkaXNrID0gZGlza3MuZ2V0KGRpc2tJZCk7XG5cbiAgICBpZiAodHlwZW9mIHBvc2l0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZGlzay5yb3RhdGVUbyhwb3NpdGlvbik7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGlyZWN0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZGlzay5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzdGF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGRpc2suc2V0U3RhdGUoc3RhdGUpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zdG9yZS5pc1N0YXR1c1N1Y2Nlc3MpIHtcbiAgICAgIC8vIEZJWE1FOlxuICAgICAgLy8gSW5zdGVhZCBvZiBqdXN0IGNoZWNraW5nIGZvciB0aGUgd2luIGNvbmRpdGlvbiwgd2Ugd2FudCB0bzpcbiAgICAgIC8vIC0gSWYgRGlzayAwIG9yIERpc2sgMiAodGhlIGRpc2tzIHdpdGggdGhlIGJvdW5kYXJ5IHBhcnQgb2YgdGhlIHBhdHRlcm4pIGlzIGluIHRoZVxuICAgICAgLy8gICBjb3JyZWN0IGxvY2F0aW9uIGZvciBhIG1pbmltdW0gYW1vdW50IG9mIHRpbWUsIHdlIHRyaWdnZXIgdGhlIFNpbmdsZSBEaXNrIFN1Y2Nlc3MgZXZlbnRcblxuICAgICAgLy8gU2luZ2xlIERpc2sgU3VjY2VzcyBFdmVudFxuICAgICAgLy8gLSBQbGF5IHN1Y2Nlc3Mgc291bmRzIChBdWRpb1ZpZXcpXG4gICAgICAvLyAtIFVJIExFRFMgYW5kIGRpc2sgTEVEIHR1cm5zIGxvY2F0aW9uIGNvbG9yXG4gICAgICAvLyAtIElmIERpc2sgMSBvciAyLCB0dXJuIHBlcmltZXRlciBMRUQgdG8gbG9jYXRpb24gY29sb3JcbiAgICAgIC8vIC0gTG9jayB0aGlzIGRpc2sgaW4gcG9zaXRpb247IGRpc2FibGUgYW55IGZ1dHVyZSBpbnRlcmFjdGlvblxuICAgICAgLy8gLSBGcm9tIG5vdyBvbiwgYWxsb3cgRGlzayAxIHRvIHRyaWdnZXIgYSBTaW5nbGUgRGlzayBTdWNjZXNzIEV2ZW50XG4gICAgICB0aGlzLl9jaGVja1dpbkNvbmRpdGlvbnMoZGlza3MpO1xuICAgIH1cbiAgfVxuXG4gIF9hY3Rpb25GaW5pc2hTdGF0dXNBbmltYXRpb24ocGF5bG9hZCkge1xuICAgIGlmICh0aGlzLl9jb21wbGV0ZSkge1xuICAgICAgdGhpcy5zdG9yZS5tb3ZlVG9OZXh0R2FtZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9hY3RpdmF0ZURpc2soZGlza0lkLCBkaXJlY3Rpb24sIHN0cmlwSWQsIHBhbmVsSWRzKSB7XG4gICAgY29uc3QgZGlza3MgPSB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdkaXNrcycpO1xuICAgIGNvbnN0IGRpc2sgPSBkaXNrcy5nZXQoZGlza0lkKTtcbiAgICBkaXNrLnNldERpcmVjdGlvbihkaXJlY3Rpb24pO1xuXG4gICAgcGFuZWxJZHMuZm9yRWFjaCgocGFuZWxJZCkgPT4ge1xuICAgICAgdGhpcy5fbGlnaHRzLnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCB0aGlzLmdhbWVDb25maWcuQUNUSVZFX0NPTlRST0xfUEFORUxfSU5URU5TSVRZKTtcbiAgICAgIHRoaXMuX2xpZ2h0cy5zZXRDb2xvcihzdHJpcElkLCBwYW5lbElkLCB0aGlzLnN0b3JlLnVzZXJDb2xvcik7XG4gICAgfSk7XG4gIH1cblxuICBfZGVhY3RpdmF0ZURpc2soZGlza0lkLCBkaXJlY3Rpb24sIHN0cmlwSWQsIHBhbmVsSWRzKSB7XG4gICAgY29uc3QgZGlza3MgPSB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdkaXNrcycpO1xuICAgIGNvbnN0IGRpc2sgPSBkaXNrcy5nZXQoZGlza0lkKTtcbiAgICBpZiAoIWRpc2suaXNTdG9wcGVkKSB7XG4gICAgICAvLyBUaGlzIGZpeGVzIGEgYnVnIHdoZXJlIGEgdXNlciB3aW5zIHRoZSBsZXZlbCB3aXRoIHRoZWlyIGhhbmQgb24gdGhlXG4gICAgICAvLyBwYW5lbCBhbmQgdGhlbiB0YWtlcyBpdCBvZmYuIFdlIHN0b3AgYWxsIHRoZSBkaXNrcyBiZXR3ZWVuIGxldmVscyBzb1xuICAgICAgLy8gYWxsIHRoZSBkaXNrcyBhcmUgYWxyZWFkeSBvZmYgd2hlbiB0aGV5IGxldCBnby4gVGhpcyBjYW4gY2F1c2UgZXJyb3JzXG4gICAgICAvLyBUT0RPOiBEZXRlcm1pbmUgaWYgdGhpcyBjaGVjayBzaG91bGQgYWN0dWFsbHkgYmUgaW4gRGlzayN1bnNldERpcmVjdGlvblxuICAgICAgZGlzay51bnNldERpcmVjdGlvbihkaXJlY3Rpb24pO1xuICAgIH1cblxuICAgIHBhbmVsSWRzLmZvckVhY2goKHBhbmVsSWQpID0+IHtcbiAgICAgIC8vIFRPRE86IE9ubHkgZGVhY3RpdmF0ZSBpZiBib3RoIHBhbmVscyBhcmUgaW5hY3RpdmVcbiAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5nYW1lQ29uZmlnLkNPTlRST0xfUEFORUxfSU5URU5TSVRZKTtcbiAgICAgIHRoaXMuX2xpZ2h0cy5zZXREZWZhdWx0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0RGlza0NvbnRyb2xzQ29sb3IoZGlza0lkLCBjb2xvcikge1xuICAgIGNvbnN0IGNvbnRyb2xNYXBwaW5ncyA9IHRoaXMuZ2FtZUNvbmZpZy5DT05UUk9MX01BUFBJTkdTO1xuXG4gICAgY29uc3QgbGlnaHRBcnJheSA9IHRoaXMuX2xpZ2h0cztcbiAgICBmb3IgKGxldCBwYW5lbElkIG9mIGNvbnRyb2xNYXBwaW5ncy5DTE9DS1dJU0VfUEFORUxTW2Rpc2tJZF0pIHtcbiAgICAgIGxpZ2h0QXJyYXkuc2V0Q29sb3IoY29udHJvbE1hcHBpbmdzLkNMT0NLV0lTRV9TVFJJUCwgcGFuZWxJZCwgY29sb3IpO1xuICAgIH1cbiAgICBmb3IgKGxldCBwYW5lbElkIG9mIGNvbnRyb2xNYXBwaW5ncy5DT1VOVEVSQ0xPQ0tXSVNFX1BBTkVMU1tkaXNrSWRdKSB7XG4gICAgICBsaWdodEFycmF5LnNldENvbG9yKGNvbnRyb2xNYXBwaW5ncy5DT1VOVEVSQ0xPQ0tXSVNFX1NUUklQLCBwYW5lbElkLCBjb2xvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdpbiBjb25kaXRpb25zOlxuICAgKiAtIFRoZSB0aHJlZSBkaXNrcyBuZWVkcyB0byBiZSBfcmVsYXRpdmVseV8gYWxpZ25lZCB3aXRoaW4gUkVMQVRJVkVfVE9MRVJBTkNFXG4gICAqIC0gQW55IGRpc2sgbXVzdCBiZSBhbGlnbmVkIHdpdGhpbiBBQlNPTFVURV9UT0xFUkFOQ0VcbiAgICovXG4gIF9jaGVja1dpbkNvbmRpdGlvbnMoZGlza3MpIHtcbiAgICBmb3IgKGxldCBkaXNrSWQgb2YgT2JqZWN0LmtleXModGhpcy5fdGFyZ2V0UG9zaXRpb25zKSkge1xuICAgICAgY29uc3QgdGFyZ2V0UG9zID0gdGhpcy5fdGFyZ2V0UG9zaXRpb25zW2Rpc2tJZF07XG4gICAgICBjb25zdCBjdXJyRGlzayA9IGRpc2tzLmdldChkaXNrSWQpO1xuICAgICAgY29uc3QgZGlza1BvcyA9IGN1cnJEaXNrLmdldFBvc2l0aW9uKCk7XG5cbiAgICAgIC8vIENoZWNrIHBvc2l0aW9uIHJlbGF0aXZlIHRvIG5laWdoYm9yIGRpc2tcbi8vIEZJWE1FOiBXZSBkaXNhYmxlZCB0aGlzIGZvciBub3csIGFzIHJlbGF0aXZlIHRvbGVyYW5jZSBvbmx5IG1ha2VzIHNlbnNlXG4vLyBpZiB3ZSBoYXZlIGJldHRlciBkaXNrIHByZWNpc2lvbiB0aGFuIHRoZSB0b2xlcmFuY2UuXG4vLyAgICBsZXQgcHJldkRpc2tJZCA9IG51bGw7XG4vLyAgICAgIGlmIChwcmV2RGlza0lkKSB7XG4vLyAgICAgICAgaWYgKE1hdGguYWJzKCh0YXJnZXRQb3MgLSB0aGlzLl90YXJnZXRQb3NpdGlvbnNbcHJldkRpc2tJZF0pIC1cbi8vICAgICAgICAgICAgICAgICAgICAgKGRpc2tQb3MgLSBkaXNrcy5nZXQocHJldkRpc2tJZCkuZ2V0UG9zaXRpb24oKSkpID5cbi8vICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lQ29uZmlnLlJFTEFUSVZFX1RPTEVSQU5DRSkge1xuLy8gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuLy8gICAgICAgIH1cbi8vICAgICAgfVxuICAgICAgLy8gQ2hlY2sgYWJzb2x1dGUgcG9zaXRpb25cbiAgICAgIGNvbnN0IGQgPSBNYXRoLmFicyhkaXNrUG9zIC0gdGFyZ2V0UG9zKSAlIDM2MDtcbiAgICAgIGNvbnN0IHIgPSBkID4gMTgwID8gMzYwIC0gZCA6IGQ7XG4gICAgICBjb25zb2xlLmRlYnVnKGAke2Rpc2tJZH0gZXJyb3I6ICR7cn1gKTtcbiAgICAgIGlmIChNYXRoLmFicyhyKSA+IHRoaXMuZ2FtZUNvbmZpZy5BQlNPTFVURV9UT0xFUkFOQ0UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuLy8gICAgICBwcmV2RGlza0lkID0gZGlza0lkO1xuICAgIH1cblxuICAgIHRoaXMuX3dpbkdhbWUoKTtcbiAgfVxuXG4gIC8vIFRPRE86IG1vdmUgdGhlc2UgcHVibGljIG1ldGhvZHMgdXBcbiAgZ2V0RGlza1Njb3JlKGRpc2tJZCkge1xuICAgIC8vIFdlIGNhbm5vdCBjYWxjdWxhdGUgdGhlIHNjb3JlIG9mIGEgY29tcGxldGUgZ2FtZSBhcyB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgbGV2ZWxcbiAgICBpZiAodGhpcy5fY29tcGxldGUpIHJldHVybiAwO1xuXG4gICAgY29uc3QgZGlza3MgPSB0aGlzLnN0b3JlLmRhdGEuZ2V0KCdkaXNrcycpO1xuICAgIGxldCBkZWx0YSA9IHRoaXMuX3RhcmdldFBvc2l0aW9uc1tkaXNrSWRdIC0gZGlza3MuZ2V0KGRpc2tJZCkuZ2V0UG9zaXRpb24oKTtcbiAgICB3aGlsZSAoZGVsdGEgPD0gLTE4MCkgZGVsdGEgKz0gMzYwO1xuICAgIHdoaWxlIChkZWx0YSA+IDE4MCkgZGVsdGEgLT0gMzYwO1xuICAgIHJldHVybiBNYXRoLmFicyhkZWx0YSk7XG4gIH1cbiAgLyoqXG4gICAqIEN1cnJlbnQgc2NvcmUgKHRoZSB0b3RhbCBudW1iZXIgb2YgZGVncmVlcyBhd2F5IGZyb20gc29sdXRpb24pLlxuICAgKiBGb3IgMyBkaXNrcywgdGhpcyB3aWxsIGJlIGJldHdlZW4gMCBhbmQgNTQwXG4gICAqL1xuICBnZXRTY29yZShkaXNrcykge1xuICAgIC8vIFdlIGNhbm5vdCBjYWxjdWxhdGUgdGhlIHNjb3JlIG9mIGEgY29tcGxldGUgZ2FtZSBhcyB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgbGV2ZWxcbiAgICBpZiAodGhpcy5fY29tcGxldGUpIHJldHVybiAwO1xuXG4gICAgbGV0IGRpc3RhbmNlID0gMDtcbiAgICBmb3IgKGxldCBkaXNrSWQgb2YgT2JqZWN0LmtleXModGhpcy5fdGFyZ2V0UG9zaXRpb25zKSkge1xuICAgICAgZGlzdGFuY2UgKz0gdGhpcy5nZXREaXNrU2NvcmUoZGlza0lkKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpc3RhbmNlO1xuICB9XG5cbiAgX3dpbkdhbWUoKSB7XG4gICAgdGhpcy5zdG9yZS5kYXRhLmdldCgnbGlnaHRzJykuZGVhY3RpdmF0ZUFsbCgpO1xuICAgIHRoaXMuX3N0b3BBbGxEaXNrcygpO1xuXG4gICAgdGhpcy5zdG9yZS5zZXRTdWNjZXNzU3RhdHVzKCk7XG5cbiAgICAvLyBJbmRpY2F0ZSBlbmQgb2YgbGV2ZWwgYnkgc2V0dGluZyBwZXJpbWV0ZXIgbGlnaHRzXG4gICAgdGhpcy5fc2V0UGVyaW1ldGVyKHRoaXMuX2xldmVsLCB0aGlzLnN0b3JlLnVzZXJDb2xvciwgdGhpcy5nYW1lQ29uZmlnLklOQUNUSVZFX1BFUklNRVRFUl9JTlRFTlNJVFkpO1xuXG4gICAgbGV0IGxldmVsID0gdGhpcy5fbGV2ZWwgKyAxO1xuICAgIGlmIChsZXZlbCA+PSB0aGlzLl9sZXZlbHMpIHtcbiAgICAgIHRoaXMuX2NvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsO1xuXG4gICAgLy8gSW5kaWNhdGUgc3RhcnQgb2YgbmV3IGxldmVsIGJ5IHNldHRpbmcgcGVyaW1ldGVyIGxpZ2h0c1xuICAgIGlmICghdGhpcy5fY29tcGxldGUpIHtcbiAgICAgIHRoaXMuX3NldFBlcmltZXRlcihsZXZlbCwgdGhpcy5nYW1lQ29uZmlnLlBFUklNRVRFUl9DT0xPUiwgdGhpcy5nYW1lQ29uZmlnLkFDVElWRV9QRVJJTUVURVJfSU5URU5TSVRZKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBlcmltZXRlciBsaWdodHMgZm9yIHRoZSBnaXZlbiBsZXZlbCB0byB0aGUgZ2l2ZW4gY29sb3IgYW5kIGludGVuc2l0eVxuICAgKi9cbiAgX3NldFBlcmltZXRlcihsZXZlbCwgY29sb3IsIGludGVuc2l0eSkge1xuICAgIGNvbnN0IHBlcmltZXRlciA9IHRoaXMuZ2FtZUNvbmZpZy5MRVZFTFNbbGV2ZWxdLnBlcmltZXRlcjtcbiAgICBmb3IgKGxldCBzdHJpcElkIG9mIE9iamVjdC5rZXlzKHBlcmltZXRlcikpIHtcbiAgICAgIGZvciAobGV0IHBhbmVsSWQgb2YgcGVyaW1ldGVyW3N0cmlwSWRdKSB7XG4gICAgICAgIHRoaXMuX2xpZ2h0cy5zZXRDb2xvcihzdHJpcElkLCBwYW5lbElkLCBjb2xvcik7XG4gICAgICAgIHRoaXMuX2xpZ2h0cy5zZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgaW50ZW5zaXR5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfc3RvcEFsbERpc2tzKCkge1xuICAgIGNvbnN0IGRpc2tzID0gdGhpcy5zdG9yZS5kYXRhLmdldCgnZGlza3MnKTtcblxuICAgIGZvciAobGV0IGRpc2tJZCBvZiBkaXNrcykge1xuICAgICAgZGlza3MuZ2V0KGRpc2tJZCkuc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBfdGFyZ2V0UG9zaXRpb25zKCkge1xuICAgIGNvbnN0IGxldmVsID0gdGhpcy5fbGV2ZWw7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZUNvbmZpZy5MRVZFTFNbbGV2ZWxdLmRpc2tzO1xuICB9XG5cbiAgZ2V0IF9sZXZlbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZUNvbmZpZy5MRVZFTFMubGVuZ3RoO1xuICB9XG5cbiAgZ2V0IF9sZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldCgnbGV2ZWwnKTtcbiAgfVxuXG4gIHNldCBfbGV2ZWwodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnNldCgnbGV2ZWwnLCB2YWx1ZSk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
