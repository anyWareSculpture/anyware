'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _colors = require('../constants/colors');

var _colors2 = _interopRequireDefault(_colors);

var _trackedData = require('./tracked-data');

var _trackedData2 = _interopRequireDefault(_trackedData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_INTENSITY = 0;
var DEFAULT_COLOR = _colors2.default.WHITE;

var LightArray = function (_TrackedData) {
  _inherits(LightArray, _TrackedData);

  function LightArray(stripLengths) {
    var defaultIntensity = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_INTENSITY : arguments[1];
    var defaultColor = arguments.length <= 2 || arguments[2] === undefined ? DEFAULT_COLOR : arguments[2];

    _classCallCheck(this, LightArray);

    var properties = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(stripLengths)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var stripId = _step.value;

        var strip = {};
        var panelIds = [];
        for (var panelId = 0; panelId < stripLengths[stripId]; panelId++) {
          panelId = '' + panelId;

          strip[panelId] = new _trackedData2.default({
            intensity: defaultIntensity,
            color: defaultColor,
            active: false
          });

          panelIds.push(panelId);
        }
        properties[stripId] = new _trackedData2.default({
          maxIntensity: 100,
          panels: new _trackedData2.default(strip)
        });
        properties[stripId].panelIds = panelIds;
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

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LightArray).call(this, properties));

    _this.stripIds = Object.keys(stripLengths);

    _this.defaultIntensity = defaultIntensity;
    _this.defaultColor = defaultColor;
    return _this;
  }

  _createClass(LightArray, [{
    key: 'setMaxIntensity',
    value: function setMaxIntensity(intensity) {
      var stripId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      var stripsToModify = stripId === null ? this.stripIds : [stripId];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = stripsToModify[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var targetStripId = _step2.value;

          var strip = this.get(targetStripId);
          strip.set("maxIntensity", intensity);
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
    key: 'getMaxIntensity',
    value: function getMaxIntensity(stripId) {
      return this.get(stripId).get("maxIntensity");
    }
  }, {
    key: 'getPanel',
    value: function getPanel(stripId, panelId) {
      return this.get(stripId).get("panels").get(panelId);
    }
  }, {
    key: 'setDefaultColor',
    value: function setDefaultColor(stripId, panelId) {
      return this.setColor(stripId, panelId, this.defaultColor);
    }
  }, {
    key: 'setColor',
    value: function setColor(stripId, panelId, color) {
      this._applyToOnePanelOrAll(function (panel) {
        return panel.set("color", color);
      }, stripId, panelId);
    }
  }, {
    key: 'getColor',
    value: function getColor(stripId, panelId) {
      var panel = this.getPanel(stripId, panelId);

      return panel.get("color");
    }
  }, {
    key: 'getIntensity',
    value: function getIntensity(stripId, panelId) {
      var panel = this.getPanel(stripId, panelId);

      return panel.get("intensity");
    }
  }, {
    key: 'setDefaultIntensity',
    value: function setDefaultIntensity(stripId, panelId) {
      return this.setIntensity(stripId, panelId, this.defaultIntensity);
    }
  }, {
    key: 'setIntensity',
    value: function setIntensity(stripId, panelId, intensity) {
      this._applyToOnePanelOrAll(function (panel) {
        return panel.set("intensity", intensity);
      }, stripId, panelId);
    }
  }, {
    key: 'isActive',
    value: function isActive(stripId, panelId) {
      var panel = this.getPanel(stripId, panelId);

      return panel.get("active");
    }
  }, {
    key: 'activate',
    value: function activate(stripId, panelId) {
      var active = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      var panel = this.getPanel(stripId, panelId);

      panel.set("active", active);
    }
  }, {
    key: 'deactivate',
    value: function deactivate(stripId, panelId) {
      this.activate(stripId, panelId, false);
    }
  }, {
    key: 'deactivateAll',
    value: function deactivateAll() {
      var stripId = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var targetStripIds = stripId === null ? this.stripIds : [stripId];

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = targetStripIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var targetStripId = _step3.value;
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = this.get(targetStripId).panelIds[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var panelId = _step4.value;

              this.deactivate(targetStripId, panelId);
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
  }, {
    key: '_applyToOnePanelOrAll',
    value: function _applyToOnePanelOrAll(panelFunc, stripId) {
      var panelId = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var panels = this._getOnePanelOrAll(stripId, panelId);

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = panels[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var panel = _step5.value;

          panelFunc(panel);
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
  }, {
    key: '_getOnePanelOrAll',
    value: function _getOnePanelOrAll(stripId, panelId) {
      var _this2 = this;

      if (panelId === null) {
        var _ret = function () {
          // this code is necessary because there is no Object.values() function
          var stripPanels = _this2.get(stripId).get("panels");
          // Old code
          // return [for (stripPanelId of stripPanels) stripPanels.get(stripPanelId)];
          // FIXME: New code, untested
          return {
            v: Array.from(stripPanels).map(function (id) {
              return stripPanels.get(id);
            })
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else {
        return [this.getPanel(stripId, panelId)];
      }
    }
  }]);

  return LightArray;
}(_trackedData2.default);

exports.default = LightArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvbGlnaHQtYXJyYXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sb0JBQW9CLENBQTFCO0FBQ0EsSUFBTSxnQkFBZ0IsaUJBQU8sS0FBN0I7O0lBRXFCLFU7OztBQUNuQixzQkFBWSxZQUFaLEVBQTBGO0FBQUEsUUFBaEUsZ0JBQWdFLHlEQUEvQyxpQkFBK0M7QUFBQSxRQUE1QixZQUE0Qix5REFBZixhQUFlOztBQUFBOztBQUN4RixRQUFNLGFBQWEsRUFBbkI7QUFEd0Y7QUFBQTtBQUFBOztBQUFBO0FBRXhGLDJCQUFvQixPQUFPLElBQVAsQ0FBWSxZQUFaLENBQXBCLDhIQUErQztBQUFBLFlBQXRDLE9BQXNDOztBQUM3QyxZQUFNLFFBQVEsRUFBZDtBQUNBLFlBQU0sV0FBVyxFQUFqQjtBQUNBLGFBQUssSUFBSSxVQUFVLENBQW5CLEVBQXNCLFVBQVUsYUFBYSxPQUFiLENBQWhDLEVBQXVELFNBQXZELEVBQWtFO0FBQ2hFLG9CQUFVLEtBQUssT0FBZjs7QUFFQSxnQkFBTSxPQUFOLElBQWlCLDBCQUFnQjtBQUMvQix1QkFBVyxnQkFEb0I7QUFFL0IsbUJBQU8sWUFGd0I7QUFHL0Isb0JBQVE7QUFIdUIsV0FBaEIsQ0FBakI7O0FBTUEsbUJBQVMsSUFBVCxDQUFjLE9BQWQ7QUFDRDtBQUNELG1CQUFXLE9BQVgsSUFBc0IsMEJBQWdCO0FBQ3BDLHdCQUFjLEdBRHNCO0FBRXBDLGtCQUFRLDBCQUFnQixLQUFoQjtBQUY0QixTQUFoQixDQUF0QjtBQUlBLG1CQUFXLE9BQVgsRUFBb0IsUUFBcEIsR0FBK0IsUUFBL0I7QUFDRDtBQXJCdUY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQSw4RkFzQmxGLFVBdEJrRjs7QUF3QnhGLFVBQUssUUFBTCxHQUFnQixPQUFPLElB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QUMsS0FBSyxRQUFMLENBQWMsT0FBZCxFQUF1QixPQUF2QixDQUFELENBQVA7QUFDRDtBQUNGOzs7Ozs7a0JBMUhrQixVIiwiZmlsZSI6ImdhbWUtbG9naWMvdXRpbHMvbGlnaHQtYXJyYXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ09MT1JTIGZyb20gJy4uL2NvbnN0YW50cy9jb2xvcnMnO1xuaW1wb3J0IFRyYWNrZWREYXRhIGZyb20gJy4vdHJhY2tlZC1kYXRhJztcblxuY29uc3QgREVGQVVMVF9JTlRFTlNJVFkgPSAwO1xuY29uc3QgREVGQVVMVF9DT0xPUiA9IENPTE9SUy5XSElURTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlnaHRBcnJheSBleHRlbmRzIFRyYWNrZWREYXRhIHtcbiAgY29uc3RydWN0b3Ioc3RyaXBMZW5ndGhzLCBkZWZhdWx0SW50ZW5zaXR5PURFRkFVTFRfSU5URU5TSVRZLCBkZWZhdWx0Q29sb3I9REVGQVVMVF9DT0xPUikge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7fTtcbiAgICBmb3IgKGxldCBzdHJpcElkIG9mIE9iamVjdC5rZXlzKHN0cmlwTGVuZ3RocykpIHtcbiAgICAgIGNvbnN0IHN0cmlwID0ge307XG4gICAgICBjb25zdCBwYW5lbElkcyA9IFtdO1xuICAgICAgZm9yIChsZXQgcGFuZWxJZCA9IDA7IHBhbmVsSWQgPCBzdHJpcExlbmd0aHNbc3RyaXBJZF07IHBhbmVsSWQrKykge1xuICAgICAgICBwYW5lbElkID0gJycgKyBwYW5lbElkO1xuXG4gICAgICAgIHN0cmlwW3BhbmVsSWRdID0gbmV3IFRyYWNrZWREYXRhKHtcbiAgICAgICAgICBpbnRlbnNpdHk6IGRlZmF1bHRJbnRlbnNpdHksXG4gICAgICAgICAgY29sb3I6IGRlZmF1bHRDb2xvcixcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBhbmVsSWRzLnB1c2gocGFuZWxJZCk7XG4gICAgICB9XG4gICAgICBwcm9wZXJ0aWVzW3N0cmlwSWRdID0gbmV3IFRyYWNrZWREYXRhKHtcbiAgICAgICAgbWF4SW50ZW5zaXR5OiAxMDAsXG4gICAgICAgIHBhbmVsczogbmV3IFRyYWNrZWREYXRhKHN0cmlwKVxuICAgICAgfSk7XG4gICAgICBwcm9wZXJ0aWVzW3N0cmlwSWRdLnBhbmVsSWRzID0gcGFuZWxJZHM7XG4gICAgfVxuICAgIHN1cGVyKHByb3BlcnRpZXMpO1xuXG4gICAgdGhpcy5zdHJpcElkcyA9IE9iamVjdC5rZXlzKHN0cmlwTGVuZ3Rocyk7XG5cbiAgICB0aGlzLmRlZmF1bHRJbnRlbnNpdHkgPSBkZWZhdWx0SW50ZW5zaXR5O1xuICAgIHRoaXMuZGVmYXVsdENvbG9yID0gZGVmYXVsdENvbG9yO1xuICB9XG5cbiAgc2V0TWF4SW50ZW5zaXR5KGludGVuc2l0eSwgc3RyaXBJZD1udWxsKSB7XG4gICAgY29uc3Qgc3RyaXBzVG9Nb2RpZnkgPSBzdHJpcElkID09PSBudWxsID8gdGhpcy5zdHJpcElkcyA6IFtzdHJpcElkXTtcblxuICAgIGZvciAobGV0IHRhcmdldFN0cmlwSWQgb2Ygc3RyaXBzVG9Nb2RpZnkpIHtcbiAgICAgIGNvbnN0IHN0cmlwID0gdGhpcy5nZXQodGFyZ2V0U3RyaXBJZCk7XG4gICAgICBzdHJpcC5zZXQoXCJtYXhJbnRlbnNpdHlcIiwgaW50ZW5zaXR5KTtcbiAgICB9XG4gIH1cblxuICBnZXRNYXhJbnRlbnNpdHkoc3RyaXBJZCkge1xuICAgIHJldHVybiB0aGlzLmdldChzdHJpcElkKS5nZXQoXCJtYXhJbnRlbnNpdHlcIik7XG4gIH1cblxuICBnZXRQYW5lbChzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KHN0cmlwSWQpLmdldChcInBhbmVsc1wiKS5nZXQocGFuZWxJZCk7XG4gIH1cblxuICBzZXREZWZhdWx0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCkge1xuICAgIHJldHVybiB0aGlzLnNldENvbG9yKHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMuZGVmYXVsdENvbG9yKTtcbiAgfVxuXG4gIHNldENvbG9yKHN0cmlwSWQsIHBhbmVsSWQsIGNvbG9yKSB7XG4gICAgdGhpcy5fYXBwbHlUb09uZVBhbmVsT3JBbGwoKHBhbmVsKSA9PiBwYW5lbC5zZXQoXCJjb2xvclwiLCBjb2xvciksIHN0cmlwSWQsIHBhbmVsSWQpO1xuICB9XG5cbiAgZ2V0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCkge1xuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5nZXRQYW5lbChzdHJpcElkLCBwYW5lbElkKTtcblxuICAgIHJldHVybiBwYW5lbC5nZXQoXCJjb2xvclwiKTtcbiAgfVxuXG4gIGdldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLmdldFBhbmVsKHN0cmlwSWQsIHBhbmVsSWQpO1xuXG4gICAgcmV0dXJuIHBhbmVsLmdldChcImludGVuc2l0eVwiKTtcbiAgfVxuXG4gIHNldERlZmF1bHRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCkge1xuICAgIHJldHVybiB0aGlzLnNldEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkLCB0aGlzLmRlZmF1bHRJbnRlbnNpdHkpO1xuICB9XG5cbiAgc2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQsIGludGVuc2l0eSkge1xuICAgIHRoaXMuX2FwcGx5VG9PbmVQYW5lbE9yQWxsKChwYW5lbCkgPT4gcGFuZWwuc2V0KFwiaW50ZW5zaXR5XCIsIGludGVuc2l0eSksIHN0cmlwSWQsIHBhbmVsSWQpO1xuICB9XG5cbiAgaXNBY3RpdmUoc3RyaXBJZCwgcGFuZWxJZCkge1xuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5nZXRQYW5lbChzdHJpcElkLCBwYW5lbElkKTtcblxuICAgIHJldHVybiBwYW5lbC5nZXQoXCJhY3RpdmVcIik7XG4gIH1cblxuICBhY3RpdmF0ZShzdHJpcElkLCBwYW5lbElkLCBhY3RpdmU9dHJ1ZSkge1xuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5nZXRQYW5lbChzdHJpcElkLCBwYW5lbElkKTtcblxuICAgIHBhbmVsLnNldChcImFjdGl2ZVwiLCBhY3RpdmUpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZShzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgdGhpcy5hY3RpdmF0ZShzdHJpcElkLCBwYW5lbElkLCBmYWxzZSk7XG4gIH1cblxuICBkZWFjdGl2YXRlQWxsKHN0cmlwSWQ9bnVsbCkge1xuICAgIGNvbnN0IHRhcmdldFN0cmlwSWRzID0gc3RyaXBJZCA9PT0gbnVsbCA/IHRoaXMuc3RyaXBJZHMgOiBbc3RyaXBJZF07XG5cbiAgICBmb3IgKGxldCB0YXJnZXRTdHJpcElkIG9mIHRhcmdldFN0cmlwSWRzKSB7XG4gICAgICBmb3IgKGxldCBwYW5lbElkIG9mIHRoaXMuZ2V0KHRhcmdldFN0cmlwSWQpLnBhbmVsSWRzKSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZSh0YXJnZXRTdHJpcElkLCBwYW5lbElkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYXBwbHlUb09uZVBhbmVsT3JBbGwocGFuZWxGdW5jLCBzdHJpcElkLCBwYW5lbElkPW51bGwpIHtcbiAgICBjb25zdCBwYW5lbHMgPSB0aGlzLl9nZXRPbmVQYW5lbE9yQWxsKHN0cmlwSWQsIHBhbmVsSWQpO1xuXG4gICAgZm9yIChsZXQgcGFuZWwgb2YgcGFuZWxzKSB7XG4gICAgICBwYW5lbEZ1bmMocGFuZWwpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRPbmVQYW5lbE9yQWxsKHN0cmlwSWQsIHBhbmVsSWQpIHtcbiAgICBpZiAocGFuZWxJZCA9PT0gbnVsbCkge1xuICAgICAgLy8gdGhpcyBjb2RlIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZXJlIGlzIG5vIE9iamVjdC52YWx1ZXMoKSBmdW5jdGlvblxuICAgICAgY29uc3Qgc3RyaXBQYW5lbHMgPSB0aGlzLmdldChzdHJpcElkKS5nZXQoXCJwYW5lbHNcIik7XG4gICAgICAvLyBPbGQgY29kZVxuICAgICAgLy8gcmV0dXJuIFtmb3IgKHN0cmlwUGFuZWxJZCBvZiBzdHJpcFBhbmVscykgc3RyaXBQYW5lbHMuZ2V0KHN0cmlwUGFuZWxJZCldO1xuICAgICAgLy8gRklYTUU6IE5ldyBjb2RlLCB1bnRlc3RlZFxuICAgICAgcmV0dXJuIEFycmF5LmZyb20oc3RyaXBQYW5lbHMpLm1hcCgoaWQpID0+IHN0cmlwUGFuZWxzLmdldChpZCkpO1xuICAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0UGFuZWwoc3RyaXBJZCwgcGFuZWxJZCldO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
