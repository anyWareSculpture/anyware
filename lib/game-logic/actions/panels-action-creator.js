"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseActionCreator = require('./base-action-creator');

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
}(BaseActionCreator);

PanelsActionCreator.PANEL_PRESSED = "panel-press";
exports.default = PanelsActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9wYW5lbHMtYWN0aW9uLWNyZWF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLG9CQUFvQixRQUFRLHVCQUFSLENBQTFCOztJQUVxQixtQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBV0YsTyxFQUFTLE8sRUFBb0I7QUFBQSxVQUFYLE9BQVcseURBQUgsQ0FBRzs7QUFDNUMsV0FBSyxTQUFMLENBQWUsb0JBQW9CLGFBQW5DLEVBQWtEO0FBQ2hELGlCQUFTLE9BRHVDO0FBRWhELGlCQUFTLE9BRnVDO0FBR2hELGlCQUFTO0FBSHVDLE9BQWxEO0FBS0Q7Ozs7OztFQWpCOEMsaUI7O0FBQTVCLG1CLENBRVosYSxHQUFnQixhO2tCQUZKLG1CIiwiZmlsZSI6ImdhbWUtbG9naWMvYWN0aW9ucy9wYW5lbHMtYWN0aW9uLWNyZWF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBCYXNlQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4vYmFzZS1hY3Rpb24tY3JlYXRvcicpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYW5lbHNBY3Rpb25DcmVhdG9yIGV4dGVuZHMgQmFzZUFjdGlvbkNyZWF0b3Ige1xuICAvLyBBY3Rpb24gdHlwZXNcbiAgc3RhdGljIFBBTkVMX1BSRVNTRUQgPSBcInBhbmVsLXByZXNzXCI7XG5cbiAgLyoqXG4gICAqIFNlbmRzIGFuIGFjdGlvbiByZXByZXNlbnRpbmcgd2hlbiBhIHBhbmVsIGlzIHByZXNzZWQgdG8gdGhlXG4gICAqIGRpc3BhdGNoZXIuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpcElkIC0gVGhlIElEIG9mIHRoZSBzdHJpcCB3aGVyZSB0aGUgcGFuZWwgd2FzIHByZXNzZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhbmVsSWQgLSBUaGUgSUQgb2YgdGhlIHBhbmVsIHRoYXQgd2FzIHByZXNzZWRcbiAgICogQHBhcmFtIHtCb29sZWFufE51bWJlcn0gcHJlc3NlZCAtIFdoZXRoZXIgdGhlIHBhbmVsIHdhcyBwcmVzc2VkIG9yIG5vdCAoMSBvciAwKVxuICAgKi9cbiAgc2VuZFBhbmVsUHJlc3NlZChzdHJpcElkLCBwYW5lbElkLCBwcmVzc2VkPTEpIHtcbiAgICB0aGlzLl9kaXNwYXRjaChQYW5lbHNBY3Rpb25DcmVhdG9yLlBBTkVMX1BSRVNTRUQsIHtcbiAgICAgIHN0cmlwSWQ6IHN0cmlwSWQsXG4gICAgICBwYW5lbElkOiBwYW5lbElkLFxuICAgICAgcHJlc3NlZDogcHJlc3NlZFxuICAgIH0pO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
