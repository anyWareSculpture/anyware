'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TrackedData = require('./tracked-data');

/**
 * Implements a sub-set of the JavaScript Set API including adding,
 * removing and checking for item existence.
 *
 * Tracks changes made to the set
 */

var TrackedSet = function (_TrackedData) {
  _inherits(TrackedSet, _TrackedData);

  function TrackedSet() {
    _classCallCheck(this, TrackedSet);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TrackedSet).call(this));
  }

  _createClass(TrackedSet, [{
    key: 'add',
    value: function add(value) {
      this.set(value, true);
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var value = _step.value;

          this.delete(value);
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
    key: 'delete',
    value: function _delete(value) {
      this.set(value, false);
    }
  }]);

  return TrackedSet;
}(TrackedData);

exports.default = TrackedSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvdHJhY2tlZC1zZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLGNBQWMsUUFBUSxnQkFBUixDQUFwQjs7Ozs7Ozs7O0lBUXFCLFU7OztBQUNuQix3QkFBYztBQUFBOztBQUFBO0FBRWI7Ozs7d0JBRUcsSyxFQUFPO0FBQ1QsV0FBSyxHQUFMLENBQVMsS0FBVCxFQUFnQixJQUFoQjtBQUNEOzs7NEJBRU87QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDTiw2QkFBa0IsSUFBbEIsOEhBQXdCO0FBQUEsY0FBZixLQUFlOztBQUN0QixlQUFLLE1BQUwsQ0FBWSxLQUFaO0FBQ0Q7QUFISztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSVA7Ozs0QkFFTSxLLEVBQU87QUFDWixXQUFLLEdBQUwsQ0FBUyxLQUFULEVBQWdCLEtBQWhCO0FBQ0Q7Ozs7RUFqQnFDLFc7O2tCQUFuQixVIiwiZmlsZSI6ImdhbWUtbG9naWMvdXRpbHMvdHJhY2tlZC1zZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBUcmFja2VkRGF0YSA9IHJlcXVpcmUoJy4vdHJhY2tlZC1kYXRhJyk7XG5cbi8qKlxuICogSW1wbGVtZW50cyBhIHN1Yi1zZXQgb2YgdGhlIEphdmFTY3JpcHQgU2V0IEFQSSBpbmNsdWRpbmcgYWRkaW5nLFxuICogcmVtb3ZpbmcgYW5kIGNoZWNraW5nIGZvciBpdGVtIGV4aXN0ZW5jZS5cbiAqXG4gKiBUcmFja3MgY2hhbmdlcyBtYWRlIHRvIHRoZSBzZXRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhY2tlZFNldCBleHRlbmRzIFRyYWNrZWREYXRhIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGFkZCh2YWx1ZSkge1xuICAgIHRoaXMuc2V0KHZhbHVlLCB0cnVlKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHRoaXMpIHtcbiAgICAgIHRoaXMuZGVsZXRlKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBkZWxldGUodmFsdWUpIHtcbiAgICB0aGlzLnNldCh2YWx1ZSwgZmFsc2UpO1xuICB9XG59XG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
