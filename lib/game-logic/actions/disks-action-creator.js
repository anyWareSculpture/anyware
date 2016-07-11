"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseActionCreator = require('./base-action-creator');

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
}(BaseActionCreator);

DisksActionCreator.DISK_UPDATE = "disk-update";
exports.default = DisksActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9kaXNrcy1hY3Rpb24tY3JlYXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLElBQU0sb0JBQW9CLFFBQVEsdUJBQVIsQ0FBMUI7O0lBRXFCLGtCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUNBU0osTSxRQUFxRDtBQUFBLCtCQUE1QyxRQUE0QztBQUFBLFVBQTVDLFFBQTRDLGlDQUFuQyxJQUFtQztBQUFBLGdDQUE3QixTQUE2QjtBQUFBLFVBQTdCLFNBQTZCLGtDQUFuQixJQUFtQjtBQUFBLDRCQUFiLEtBQWE7QUFBQSxVQUFiLEtBQWEsOEJBQVAsSUFBTzs7QUFDbEUsVUFBTSxjQUFjLEVBQXBCO0FBQ0EsVUFBSSxhQUFhLElBQWpCLEVBQXVCO0FBQ3JCLG9CQUFZLFFBQVosR0FBdUIsUUFBdkI7QUFDRDs7QUFFRCxVQUFJLGNBQWMsSUFBbEIsRUFBd0I7QUFDdEIsb0JBQVksU0FBWixHQUF3QixTQUF4QjtBQUNEOztBQUVELFVBQUksVUFBVSxJQUFkLEVBQW9CO0FBQ2xCLG9CQUFZLEtBQVosR0FBb0IsS0FBcEI7QUFDRDs7QUFFRCxVQUFJLE9BQU8sSUFBUCxDQUFZLFdBQVosRUFBeUIsTUFBekIsR0FBa0MsQ0FBdEMsRUFBeUM7QUFDdkMsb0JBQVksTUFBWixHQUFxQixNQUFyQjs7QUFFQSxhQUFLLFNBQUwsQ0FBZSxtQkFBbUIsV0FBbEMsRUFBK0MsV0FBL0M7QUFDRDtBQUNGOzs7Ozs7RUE1QjZDLGlCOztBQUEzQixrQixDQUVaLFcsR0FBYyxhO2tCQUZGLGtCIiwiZmlsZSI6ImdhbWUtbG9naWMvYWN0aW9ucy9kaXNrcy1hY3Rpb24tY3JlYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEJhc2VBY3Rpb25DcmVhdG9yID0gcmVxdWlyZSgnLi9iYXNlLWFjdGlvbi1jcmVhdG9yJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc2tzQWN0aW9uQ3JlYXRvciBleHRlbmRzIEJhc2VBY3Rpb25DcmVhdG9yIHtcbiAgLy8gQWN0aW9uIHR5cGVzXG4gIHN0YXRpYyBESVNLX1VQREFURSA9IFwiZGlzay11cGRhdGVcIjtcblxuICAvKipcbiAgICogU2VuZHMgYW4gYWN0aW9uIHRvIHRoZSBkaXNwYXRjaGVyIHJlcHJlc2VudGluZyB3aGVuIGEgZGlzayBwb3NpdGlvbiwgZGlyZWN0aW9uLCBvciBzdGF0ZSBjaGFuZ2VzLlxuICAgKiBPbmx5IHNlbmRzIGFjdGlvbiBpZiBhdCBsZWFzdCBvbmUgYXJndW1lbnQgaXMgcHJvdmlkZWQgdG8gdGhlIG9iamVjdFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGlza0lkIC0gVGhlIElEIG9mIHRoZSBkaXNrIHRoYXQgd2FzIHVwZGF0ZWRcbiAgICovXG4gIHNlbmREaXNrVXBkYXRlKGRpc2tJZCwge3Bvc2l0aW9uPW51bGwsIGRpcmVjdGlvbj1udWxsLCBzdGF0ZT1udWxsfSkge1xuICAgIGNvbnN0IHBheWxvYWRCb2R5ID0ge307XG4gICAgaWYgKHBvc2l0aW9uICE9PSBudWxsKSB7XG4gICAgICBwYXlsb2FkQm9keS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIH1cblxuICAgIGlmIChkaXJlY3Rpb24gIT09IG51bGwpIHtcbiAgICAgIHBheWxvYWRCb2R5LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUgIT09IG51bGwpIHtcbiAgICAgIHBheWxvYWRCb2R5LnN0YXRlID0gc3RhdGU7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5rZXlzKHBheWxvYWRCb2R5KS5sZW5ndGggPiAwKSB7XG4gICAgICBwYXlsb2FkQm9keS5kaXNrSWQgPSBkaXNrSWQ7XG5cbiAgICAgIHRoaXMuX2Rpc3BhdGNoKERpc2tzQWN0aW9uQ3JlYXRvci5ESVNLX1VQREFURSwgcGF5bG9hZEJvZHkpO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
