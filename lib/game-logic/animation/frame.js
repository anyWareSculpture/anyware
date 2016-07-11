"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_TIME_OFFSET = 1000; // ms

var Frame = function () {
  /**
   * Creates an instance of the Frame class
   * @param {Number} timeOffset - The time to wait before playing this frame
   * @constructor
   */

  function Frame() {
    var timeOffset = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_TIME_OFFSET : arguments[0];

    _classCallCheck(this, Frame);

    this.timeOffset = timeOffset;
  }

  /**
   * Runs the frame
   */


  _createClass(Frame, [{
    key: "run",
    value: function run() {}
  }]);

  return Frame;
}();

exports.default = Frame;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYW5pbWF0aW9uL2ZyYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNLHNCQUFzQixJQUE1QixDOztJQUVxQixLOzs7Ozs7O0FBTW5CLG1CQUE0QztBQUFBLFFBQWhDLFVBQWdDLHlEQUFyQixtQkFBcUI7O0FBQUE7O0FBQzFDLFNBQUssVUFBTCxHQUFrQixVQUFsQjtBQUNEOzs7Ozs7Ozs7MEJBS0ssQ0FDTDs7Ozs7O2tCQWRrQixLIiwiZmlsZSI6ImdhbWUtbG9naWMvYW5pbWF0aW9uL2ZyYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgREVGQVVMVF9USU1FX09GRlNFVCA9IDEwMDA7IC8vIG1zXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZyYW1lIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgdGhlIEZyYW1lIGNsYXNzXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lT2Zmc2V0IC0gVGhlIHRpbWUgdG8gd2FpdCBiZWZvcmUgcGxheWluZyB0aGlzIGZyYW1lXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IodGltZU9mZnNldD1ERUZBVUxUX1RJTUVfT0ZGU0VUKSB7XG4gICAgdGhpcy50aW1lT2Zmc2V0ID0gdGltZU9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIHRoZSBmcmFtZVxuICAgKi9cbiAgcnVuKCkge1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
