'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _trackedData = require('./tracked-data');

var _trackedData2 = _interopRequireDefault(_trackedData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
}(_trackedData2.default);

exports.default = TrackedSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvdHJhY2tlZC1zZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQVFxQixVOzs7QUFDbkIsd0JBQWM7QUFBQTs7QUFBQTtBQUViOzs7O3dCQUVHLEssRUFBTztBQUNULFdBQUssR0FBTCxDQUFTLEtBQVQsRUFBZ0IsSUFBaEI7QUFDRDs7OzRCQUVPO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ04sNkJBQWtCLElBQWxCLDhIQUF3QjtBQUFBLGNBQWYsS0FBZTs7QUFDdEIsZUFBSyxNQUFMLENBQVksS0FBWjtBQUNEO0FBSEs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUlQOzs7NEJBRU0sSyxFQUFPO0FBQ1osV0FBSyxHQUFMLENBQVMsS0FBVCxFQUFnQixLQUFoQjtBQUNEOzs7Ozs7a0JBakJrQixVIiwiZmlsZSI6ImdhbWUtbG9naWMvdXRpbHMvdHJhY2tlZC1zZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVHJhY2tlZERhdGEgZnJvbSAnLi90cmFja2VkLWRhdGEnO1xuXG4vKipcbiAqIEltcGxlbWVudHMgYSBzdWItc2V0IG9mIHRoZSBKYXZhU2NyaXB0IFNldCBBUEkgaW5jbHVkaW5nIGFkZGluZyxcbiAqIHJlbW92aW5nIGFuZCBjaGVja2luZyBmb3IgaXRlbSBleGlzdGVuY2UuXG4gKlxuICogVHJhY2tzIGNoYW5nZXMgbWFkZSB0byB0aGUgc2V0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYWNrZWRTZXQgZXh0ZW5kcyBUcmFja2VkRGF0YSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhZGQodmFsdWUpIHtcbiAgICB0aGlzLnNldCh2YWx1ZSwgdHJ1ZSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB0aGlzKSB7XG4gICAgICB0aGlzLmRlbGV0ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZGVsZXRlKHZhbHVlKSB7XG4gICAgdGhpcy5zZXQodmFsdWUsIGZhbHNlKTtcbiAgfVxufVxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
