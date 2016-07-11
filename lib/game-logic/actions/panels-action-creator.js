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

var PanelsActionCreator = function (_BaseActionCreator) {
  _inherits(PanelsActionCreator, _BaseActionCreator);

  function PanelsActionCreator() {
    _classCallCheck(this, PanelsActionCreator);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PanelsActionCreator).apply(this, arguments));
  }

  _createClass(PanelsActionCreator, [{
    key: "sendPanelPressed",


    /**
     * Sends an action representing when a panel is pressed to the
     * dispatcher.
     * @param {String} stripId - The ID of the strip where the panel was pressed
     * @param {String} panelId - The ID of the panel that was pressed
     * @param {Boolean|Number} pressed - Whether the panel was pressed or not (1 or 0)
     */
    value: function sendPanelPressed(stripId, panelId) {
      var pressed = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

      this._dispatch(PanelsActionCreator.PANEL_PRESSED, {
        stripId: stripId,
        panelId: panelId,
        pressed: pressed
      });
    }
    // Action types

  }]);

  return PanelsActionCreator;
}(_baseActionCreator2.default);

PanelsActionCreator.PANEL_PRESSED = "panel-press";
exports.default = PanelsActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9wYW5lbHMtYWN0aW9uLWNyZWF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7O0lBRXFCLG1COzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQ0FXRixPLEVBQVMsTyxFQUFvQjtBQUFBLFVBQVgsT0FBVyx5REFBSCxDQUFHOztBQUM1QyxXQUFLLFNBQUwsQ0FBZSxvQkFBb0IsYUFBbkMsRUFBa0Q7QUFDaEQsaUJBQVMsT0FEdUM7QUFFaEQsaUJBQVMsT0FGdUM7QUFHaEQsaUJBQVM7QUFIdUMsT0FBbEQ7QUFLRDs7Ozs7Ozs7QUFqQmtCLG1CLENBRVosYSxHQUFnQixhO2tCQUZKLG1CIiwiZmlsZSI6ImdhbWUtbG9naWMvYWN0aW9ucy9wYW5lbHMtYWN0aW9uLWNyZWF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUFjdGlvbkNyZWF0b3IgZnJvbSAnLi9iYXNlLWFjdGlvbi1jcmVhdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFuZWxzQWN0aW9uQ3JlYXRvciBleHRlbmRzIEJhc2VBY3Rpb25DcmVhdG9yIHtcbiAgLy8gQWN0aW9uIHR5cGVzXG4gIHN0YXRpYyBQQU5FTF9QUkVTU0VEID0gXCJwYW5lbC1wcmVzc1wiO1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhbiBhY3Rpb24gcmVwcmVzZW50aW5nIHdoZW4gYSBwYW5lbCBpcyBwcmVzc2VkIHRvIHRoZVxuICAgKiBkaXNwYXRjaGVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyaXBJZCAtIFRoZSBJRCBvZiB0aGUgc3RyaXAgd2hlcmUgdGhlIHBhbmVsIHdhcyBwcmVzc2VkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYW5lbElkIC0gVGhlIElEIG9mIHRoZSBwYW5lbCB0aGF0IHdhcyBwcmVzc2VkXG4gICAqIEBwYXJhbSB7Qm9vbGVhbnxOdW1iZXJ9IHByZXNzZWQgLSBXaGV0aGVyIHRoZSBwYW5lbCB3YXMgcHJlc3NlZCBvciBub3QgKDEgb3IgMClcbiAgICovXG4gIHNlbmRQYW5lbFByZXNzZWQoc3RyaXBJZCwgcGFuZWxJZCwgcHJlc3NlZD0xKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2goUGFuZWxzQWN0aW9uQ3JlYXRvci5QQU5FTF9QUkVTU0VELCB7XG4gICAgICBzdHJpcElkOiBzdHJpcElkLFxuICAgICAgcGFuZWxJZDogcGFuZWxJZCxcbiAgICAgIHByZXNzZWQ6IHByZXNzZWRcbiAgICB9KTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
