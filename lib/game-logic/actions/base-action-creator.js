"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseActionCreator = function () {
  /**
   * Creates an action creator that sends all of its messages
   * to the provided dispatcher
   * @param {Dispatcher} dispatcher - A dispatcher that implements flux's dispatcher API
   */

  function BaseActionCreator(dispatcher) {
    _classCallCheck(this, BaseActionCreator);

    this._dispatcher = dispatcher;
  }

  _createClass(BaseActionCreator, [{
    key: "_dispatch",
    value: function _dispatch(actionType) {
      var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this._dispatcher.dispatch(Object.assign({
        actionType: actionType
      }, data));
    }
  }]);

  return BaseActionCreator;
}();

exports.default = BaseActionCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYWN0aW9ucy9iYXNlLWFjdGlvbi1jcmVhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBcUIsaUI7Ozs7Ozs7QUFNbkIsNkJBQVksVUFBWixFQUF3QjtBQUFBOztBQUN0QixTQUFLLFdBQUwsR0FBbUIsVUFBbkI7QUFDRDs7Ozs4QkFFUyxVLEVBQXFCO0FBQUEsVUFBVCxJQUFTLHlEQUFKLEVBQUk7O0FBQzdCLFdBQUssV0FBTCxDQUFpQixRQUFqQixDQUEwQixPQUFPLE1BQVAsQ0FBYztBQUN0QyxvQkFBWTtBQUQwQixPQUFkLEVBRXZCLElBRnVCLENBQTFCO0FBR0Q7Ozs7OztrQkFka0IsaUIiLCJmaWxlIjoiZ2FtZS1sb2dpYy9hY3Rpb25zL2Jhc2UtYWN0aW9uLWNyZWF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlQWN0aW9uQ3JlYXRvciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFjdGlvbiBjcmVhdG9yIHRoYXQgc2VuZHMgYWxsIG9mIGl0cyBtZXNzYWdlc1xuICAgKiB0byB0aGUgcHJvdmlkZWQgZGlzcGF0Y2hlclxuICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXIgLSBBIGRpc3BhdGNoZXIgdGhhdCBpbXBsZW1lbnRzIGZsdXgncyBkaXNwYXRjaGVyIEFQSVxuICAgKi9cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICB9XG5cbiAgX2Rpc3BhdGNoKGFjdGlvblR5cGUsIGRhdGE9e30pIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKE9iamVjdC5hc3NpZ24oe1xuICAgICAgYWN0aW9uVHlwZTogYWN0aW9uVHlwZVxuICAgIH0sIGRhdGEpKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
