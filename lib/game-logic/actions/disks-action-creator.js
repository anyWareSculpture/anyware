"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _baseActionCreator = require("./base-action-creator");

var _baseActionCreator2 = _interopRequireDefault(_baseActionCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DisksActionCreator = function (_BaseActionCreator) {
  _inherits(DisksActionCreator, _BaseActionCreator);

  function DisksActionCreator() {
    _classCallCheck(this, DisksActionCreator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(DisksActionCreator).apply(this, arguments));
  }

  _createClass(DisksActionCreator, [{
    key: "sendDiskUpdate",


    /**
     * Sends an action to the dispatcher representing when a disk position, direction, or state changes.
     * Only sends action if at least one argument is provided to the object
     * @param {String} diskId - The ID of the disk that was updated
     */
    value: function sendDiskUpdate(diskId, _ref) {
      var _ref$position = _ref.position;
      var position = _ref$position === undefined ? null : _ref$position;
      var _ref$direction = _ref.direction;
      var direction = _ref$direction === undefined ? null : _ref$direction;
      var _ref$state = _ref.state;
      var state = _ref$state === undefined ? null : _ref$state;

      var payloadBody = {};
      if (position !== null) {
        payloadBody.position = position;
      }

      if (direction !== null) {
        payloadBody.direction = direction;
      }

      if (state !== null) {
        payloadBody.state = state;
      }

      if (Object.keys(payloadBody).length > 0) {
        payloadBody.diskId = diskId;

        this._dispatch(DisksActionCreator.DISK_UPDATE, payloadBody);
      }
    }
    // Action types

  }]);

  return DisksActionCreator;
}(_baseActionCreator2.default);

DisksActionCreator.DISK_UPDATE = "disk-update";
exports.default = DisksActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9kaXNrcy1hY3Rpb24tY3JlYXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7SUFFcUIsa0I7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0FTSixNLFFBQXFEO0FBQUEsK0JBQTVDLFFBQTRDO0FBQUEsVUFBNUMsUUFBNEMsaUNBQW5DLElBQW1DO0FBQUEsZ0NBQTdCLFNBQTZCO0FBQUEsVUFBN0IsU0FBNkIsa0NBQW5CLElBQW1CO0FBQUEsNEJBQWIsS0FBYTtBQUFBLFVBQWIsS0FBYSw4QkFBUCxJQUFPOztBQUNsRSxVQUFNLGNBQWMsRUFBcEI7QUFDQSxVQUFJLGFBQWEsSUFBakIsRUFBdUI7QUFDckIsb0JBQVksUUFBWixHQUF1QixRQUF2QjtBQUNEOztBQUVELFVBQUksY0FBYyxJQUFsQixFQUF3QjtBQUN0QixvQkFBWSxTQUFaLEdBQXdCLFNBQXhCO0FBQ0Q7O0FBRUQsVUFBSSxVQUFVLElBQWQsRUFBb0I7QUFDbEIsb0JBQVksS0FBWixHQUFvQixLQUFwQjtBQUNEOztBQUVELFVBQUksT0FBTyxJQUFQLENBQVksV0FBWixFQUF5QixNQUF6QixHQUFrQyxDQUF0QyxFQUF5QztBQUN2QyxvQkFBWSxNQUFaLEdBQXFCLE1BQXJCOztBQUVBLGFBQUssU0FBTCxDQUFlLG1CQUFtQixXQUFsQyxFQUErQyxXQUEvQztBQUNEO0FBQ0Y7Ozs7Ozs7O0FBNUJrQixrQixDQUVaLFcsR0FBYyxhO2tCQUZGLGtCIiwiZmlsZSI6ImdhbWUtbG9naWMvYWN0aW9ucy9kaXNrcy1hY3Rpb24tY3JlYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCYXNlQWN0aW9uQ3JlYXRvciBmcm9tICcuL2Jhc2UtYWN0aW9uLWNyZWF0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNrc0FjdGlvbkNyZWF0b3IgZXh0ZW5kcyBCYXNlQWN0aW9uQ3JlYXRvciB7XG4gIC8vIEFjdGlvbiB0eXBlc1xuICBzdGF0aWMgRElTS19VUERBVEUgPSBcImRpc2stdXBkYXRlXCI7XG5cbiAgLyoqXG4gICAqIFNlbmRzIGFuIGFjdGlvbiB0byB0aGUgZGlzcGF0Y2hlciByZXByZXNlbnRpbmcgd2hlbiBhIGRpc2sgcG9zaXRpb24sIGRpcmVjdGlvbiwgb3Igc3RhdGUgY2hhbmdlcy5cbiAgICogT25seSBzZW5kcyBhY3Rpb24gaWYgYXQgbGVhc3Qgb25lIGFyZ3VtZW50IGlzIHByb3ZpZGVkIHRvIHRoZSBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRpc2tJZCAtIFRoZSBJRCBvZiB0aGUgZGlzayB0aGF0IHdhcyB1cGRhdGVkXG4gICAqL1xuICBzZW5kRGlza1VwZGF0ZShkaXNrSWQsIHtwb3NpdGlvbj1udWxsLCBkaXJlY3Rpb249bnVsbCwgc3RhdGU9bnVsbH0pIHtcbiAgICBjb25zdCBwYXlsb2FkQm9keSA9IHt9O1xuICAgIGlmIChwb3NpdGlvbiAhPT0gbnVsbCkge1xuICAgICAgcGF5bG9hZEJvZHkucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoZGlyZWN0aW9uICE9PSBudWxsKSB7XG4gICAgICBwYXlsb2FkQm9keS5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgfVxuXG4gICAgaWYgKHN0YXRlICE9PSBudWxsKSB7XG4gICAgICBwYXlsb2FkQm9keS5zdGF0ZSA9IHN0YXRlO1xuICAgIH1cblxuICAgIGlmIChPYmplY3Qua2V5cyhwYXlsb2FkQm9keSkubGVuZ3RoID4gMCkge1xuICAgICAgcGF5bG9hZEJvZHkuZGlza0lkID0gZGlza0lkO1xuXG4gICAgICB0aGlzLl9kaXNwYXRjaChEaXNrc0FjdGlvbkNyZWF0b3IuRElTS19VUERBVEUsIHBheWxvYWRCb2R5KTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
