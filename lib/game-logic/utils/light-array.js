'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var COLORS = require('../constants/colors');
var TrackedData = require('./tracked-data');

var DEFAULT_INTENSITY = 0;
var DEFAULT_COLOR = COLORS.WHITE;

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

          strip[panelId] = new TrackedData({
            intensity: defaultIntensity,
            color: defaultColor,
            active: false
          });

          panelIds.push(panelId);
        }
        properties[stripId] = new TrackedData({
          maxIntensity: 100,
          panels: new TrackedData(strip)
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
}(TrackedData);

exports.default = LightArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvbGlnaHQtYXJyYXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQU0sU0FBUyxRQUFRLHFCQUFSLENBQWY7QUFDQSxJQUFNLGNBQWMsUUFBUSxnQkFBUixDQUFwQjs7QUFFQSxJQUFNLG9CQUFvQixDQUExQjtBQUNBLElBQU0sZ0JBQWdCLE9BQU8sS0FBN0I7O0lBRXFCLFU7OztBQUNuQixzQkFBWSxZQUFaLEVBQTBGO0FBQUEsUUFBaEUsZ0JBQWdFLHlEQUEvQyxpQkFBK0M7QUFBQSxRQUE1QixZQUE0Qix5REFBZixhQUFlOztBQUFBOztBQUN4RixRQUFNLGFBQWEsRUFBbkI7QUFEd0Y7QUFBQTtBQUFBOztBQUFBO0FBRXhGLDJCQUFvQixPQUFPLElBQVAsQ0FBWSxZQUFaLENBQXBCLDhIQUErQztBQUFBLFlBQXRDLE9BQXNDOztBQUM3QyxZQUFNLFFBQVEsRUFBZDtBQUNBLFlBQU0sV0FBVyxFQUFqQjtBQUNBLGFBQUssSUFBSSxVQUFVLENBQW5CLEVBQXNCLFVBQVUsYUFBYSxPQUFiLENBQWhDLEVBQXVELFNBQXZELEVBQWtFO0FBQ2hFLG9CQUFVLEtBQUssT0FBZjs7QUFFQSxnQkFBTSxPQUFOLElBQWlCLElBQUksV0FBSixDQUFnQjtBQUMvQix1QkFBVyxnQkFEb0I7QUFFL0IsbUJBQU8sWUFGd0I7QUFHL0Isb0JBQVE7QUFIdUIsV0FBaEIsQ0FBakI7O0FBTUEsbUJBQVMsSUFBVCxDQUFjLE9BQWQ7QUFDRDtBQUNELG1CQUFXLE9BQVgsSUFBc0IsSUFBSSxXQUFKLENBQWdCO0FBQ3BDLHdCQUFjLEdBRHNCO0FBRXBDLGtCQUFRLElBQUksV0FBSixDQUFnQixLQUFoQjtBQUY0QixTQUFoQixDQUF0QjtBQUlBLG1CQUFXLE9BQVgsRUFBb0IsUUFBcEIsR0FBK0IsUUFBL0I7QUFDRDtBQXJCdUY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7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QUFnQixFQUFoQixDQUFSO0FBQUEsYUFBNUI7QUFBUDtBQU5vQjs7QUFBQTtBQU9wQixPQVBGLE1BUUs7QUFDSCxlQUFPLENBQUMsS0FBSyxRQUFMLENBQWMsT0FBZCxFQUF1QixPQUF2QixDQUFELENBQVA7QUFDRDtBQUNGOzs7O0VBMUhxQyxXOztrQkFBbkIsVSIsImZpbGUiOiJnYW1lLWxvZ2ljL3V0aWxzL2xpZ2h0LWFycmF5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQ09MT1JTID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL2NvbG9ycycpO1xuY29uc3QgVHJhY2tlZERhdGEgPSByZXF1aXJlKCcuL3RyYWNrZWQtZGF0YScpO1xuXG5jb25zdCBERUZBVUxUX0lOVEVOU0lUWSA9IDA7XG5jb25zdCBERUZBVUxUX0NPTE9SID0gQ09MT1JTLldISVRFO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaWdodEFycmF5IGV4dGVuZHMgVHJhY2tlZERhdGEge1xuICBjb25zdHJ1Y3RvcihzdHJpcExlbmd0aHMsIGRlZmF1bHRJbnRlbnNpdHk9REVGQVVMVF9JTlRFTlNJVFksIGRlZmF1bHRDb2xvcj1ERUZBVUxUX0NPTE9SKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHt9O1xuICAgIGZvciAobGV0IHN0cmlwSWQgb2YgT2JqZWN0LmtleXMoc3RyaXBMZW5ndGhzKSkge1xuICAgICAgY29uc3Qgc3RyaXAgPSB7fTtcbiAgICAgIGNvbnN0IHBhbmVsSWRzID0gW107XG4gICAgICBmb3IgKGxldCBwYW5lbElkID0gMDsgcGFuZWxJZCA8IHN0cmlwTGVuZ3Roc1tzdHJpcElkXTsgcGFuZWxJZCsrKSB7XG4gICAgICAgIHBhbmVsSWQgPSAnJyArIHBhbmVsSWQ7XG5cbiAgICAgICAgc3RyaXBbcGFuZWxJZF0gPSBuZXcgVHJhY2tlZERhdGEoe1xuICAgICAgICAgIGludGVuc2l0eTogZGVmYXVsdEludGVuc2l0eSxcbiAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbG9yLFxuICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcGFuZWxJZHMucHVzaChwYW5lbElkKTtcbiAgICAgIH1cbiAgICAgIHByb3BlcnRpZXNbc3RyaXBJZF0gPSBuZXcgVHJhY2tlZERhdGEoe1xuICAgICAgICBtYXhJbnRlbnNpdHk6IDEwMCxcbiAgICAgICAgcGFuZWxzOiBuZXcgVHJhY2tlZERhdGEoc3RyaXApXG4gICAgICB9KTtcbiAgICAgIHByb3BlcnRpZXNbc3RyaXBJZF0ucGFuZWxJZHMgPSBwYW5lbElkcztcbiAgICB9XG4gICAgc3VwZXIocHJvcGVydGllcyk7XG5cbiAgICB0aGlzLnN0cmlwSWRzID0gT2JqZWN0LmtleXMoc3RyaXBMZW5ndGhzKTtcblxuICAgIHRoaXMuZGVmYXVsdEludGVuc2l0eSA9IGRlZmF1bHRJbnRlbnNpdHk7XG4gICAgdGhpcy5kZWZhdWx0Q29sb3IgPSBkZWZhdWx0Q29sb3I7XG4gIH1cblxuICBzZXRNYXhJbnRlbnNpdHkoaW50ZW5zaXR5LCBzdHJpcElkPW51bGwpIHtcbiAgICBjb25zdCBzdHJpcHNUb01vZGlmeSA9IHN0cmlwSWQgPT09IG51bGwgPyB0aGlzLnN0cmlwSWRzIDogW3N0cmlwSWRdO1xuXG4gICAgZm9yIChsZXQgdGFyZ2V0U3RyaXBJZCBvZiBzdHJpcHNUb01vZGlmeSkge1xuICAgICAgY29uc3Qgc3RyaXAgPSB0aGlzLmdldCh0YXJnZXRTdHJpcElkKTtcbiAgICAgIHN0cmlwLnNldChcIm1heEludGVuc2l0eVwiLCBpbnRlbnNpdHkpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1heEludGVuc2l0eShzdHJpcElkKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KHN0cmlwSWQpLmdldChcIm1heEludGVuc2l0eVwiKTtcbiAgfVxuXG4gIGdldFBhbmVsKHN0cmlwSWQsIHBhbmVsSWQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoc3RyaXBJZCkuZ2V0KFwicGFuZWxzXCIpLmdldChwYW5lbElkKTtcbiAgfVxuXG4gIHNldERlZmF1bHRDb2xvcihzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCwgdGhpcy5kZWZhdWx0Q29sb3IpO1xuICB9XG5cbiAgc2V0Q29sb3Ioc3RyaXBJZCwgcGFuZWxJZCwgY29sb3IpIHtcbiAgICB0aGlzLl9hcHBseVRvT25lUGFuZWxPckFsbCgocGFuZWwpID0+IHBhbmVsLnNldChcImNvbG9yXCIsIGNvbG9yKSwgc3RyaXBJZCwgcGFuZWxJZCk7XG4gIH1cblxuICBnZXRDb2xvcihzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLmdldFBhbmVsKHN0cmlwSWQsIHBhbmVsSWQpO1xuXG4gICAgcmV0dXJuIHBhbmVsLmdldChcImNvbG9yXCIpO1xuICB9XG5cbiAgZ2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQpIHtcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMuZ2V0UGFuZWwoc3RyaXBJZCwgcGFuZWxJZCk7XG5cbiAgICByZXR1cm4gcGFuZWwuZ2V0KFwiaW50ZW5zaXR5XCIpO1xuICB9XG5cbiAgc2V0RGVmYXVsdEludGVuc2l0eShzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0SW50ZW5zaXR5KHN0cmlwSWQsIHBhbmVsSWQsIHRoaXMuZGVmYXVsdEludGVuc2l0eSk7XG4gIH1cblxuICBzZXRJbnRlbnNpdHkoc3RyaXBJZCwgcGFuZWxJZCwgaW50ZW5zaXR5KSB7XG4gICAgdGhpcy5fYXBwbHlUb09uZVBhbmVsT3JBbGwoKHBhbmVsKSA9PiBwYW5lbC5zZXQoXCJpbnRlbnNpdHlcIiwgaW50ZW5zaXR5KSwgc3RyaXBJZCwgcGFuZWxJZCk7XG4gIH1cblxuICBpc0FjdGl2ZShzdHJpcElkLCBwYW5lbElkKSB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLmdldFBhbmVsKHN0cmlwSWQsIHBhbmVsSWQpO1xuXG4gICAgcmV0dXJuIHBhbmVsLmdldChcImFjdGl2ZVwiKTtcbiAgfVxuXG4gIGFjdGl2YXRlKHN0cmlwSWQsIHBhbmVsSWQsIGFjdGl2ZT10cnVlKSB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLmdldFBhbmVsKHN0cmlwSWQsIHBhbmVsSWQpO1xuXG4gICAgcGFuZWwuc2V0KFwiYWN0aXZlXCIsIGFjdGl2ZSk7XG4gIH1cblxuICBkZWFjdGl2YXRlKHN0cmlwSWQsIHBhbmVsSWQpIHtcbiAgICB0aGlzLmFjdGl2YXRlKHN0cmlwSWQsIHBhbmVsSWQsIGZhbHNlKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGVBbGwoc3RyaXBJZD1udWxsKSB7XG4gICAgY29uc3QgdGFyZ2V0U3RyaXBJZHMgPSBzdHJpcElkID09PSBudWxsID8gdGhpcy5zdHJpcElkcyA6IFtzdHJpcElkXTtcblxuICAgIGZvciAobGV0IHRhcmdldFN0cmlwSWQgb2YgdGFyZ2V0U3RyaXBJZHMpIHtcbiAgICAgIGZvciAobGV0IHBhbmVsSWQgb2YgdGhpcy5nZXQodGFyZ2V0U3RyaXBJZCkucGFuZWxJZHMpIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlKHRhcmdldFN0cmlwSWQsIHBhbmVsSWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hcHBseVRvT25lUGFuZWxPckFsbChwYW5lbEZ1bmMsIHN0cmlwSWQsIHBhbmVsSWQ9bnVsbCkge1xuICAgIGNvbnN0IHBhbmVscyA9IHRoaXMuX2dldE9uZVBhbmVsT3JBbGwoc3RyaXBJZCwgcGFuZWxJZCk7XG5cbiAgICBmb3IgKGxldCBwYW5lbCBvZiBwYW5lbHMpIHtcbiAgICAgIHBhbmVsRnVuYyhwYW5lbCk7XG4gICAgfVxuICB9XG5cbiAgX2dldE9uZVBhbmVsT3JBbGwoc3RyaXBJZCwgcGFuZWxJZCkge1xuICAgIGlmIChwYW5lbElkID09PSBudWxsKSB7XG4gICAgICAvLyB0aGlzIGNvZGUgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlcmUgaXMgbm8gT2JqZWN0LnZhbHVlcygpIGZ1bmN0aW9uXG4gICAgICBjb25zdCBzdHJpcFBhbmVscyA9IHRoaXMuZ2V0KHN0cmlwSWQpLmdldChcInBhbmVsc1wiKTtcbiAgICAgIC8vIE9sZCBjb2RlXG4gICAgICAvLyByZXR1cm4gW2ZvciAoc3RyaXBQYW5lbElkIG9mIHN0cmlwUGFuZWxzKSBzdHJpcFBhbmVscy5nZXQoc3RyaXBQYW5lbElkKV07XG4gICAgICAvLyBGSVhNRTogTmV3IGNvZGUsIHVudGVzdGVkXG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShzdHJpcFBhbmVscykubWFwKChpZCkgPT4gc3RyaXBQYW5lbHMuZ2V0KGlkKSk7XG4gICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBbdGhpcy5nZXRQYW5lbChzdHJpcElkLCBwYW5lbElkKV07XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
