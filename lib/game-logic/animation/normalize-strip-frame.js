"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_TIME_OFFSET = 1000; // ms

var NormalizeStripFrame = function () {
  /**
   * Creates a frame that normalizes the entire strip to a single color and intensity
   * @param {LightArray} lightArray - The store's light array
   * @param {String} stripId - The stripId to normalize
   * @param {String} color - The color to set the entire strip to
   * @param {String} intensity - The intensity to set the entire strip to
   * @param {Function} runMethod - The method to run once the strip has been normalized
   * @param {Number} timeOffset - The time to wait before playing this frame
   * @constructor
   */

  function NormalizeStripFrame(lightArray, stripId, color, intensity, runMethod) {
    var timeOffset = arguments.length <= 5 || arguments[5] === undefined ? DEFAULT_TIME_OFFSET : arguments[5];

    _classCallCheck(this, NormalizeStripFrame);

    this.lightArray = lightArray;
    this.stripId = stripId;
    this.color = color;
    this.intensity = intensity;
    this.runMethod = runMethod;
    this.timeOffset = timeOffset;
  }

  /**
   * Runs the frame
   */


  _createClass(NormalizeStripFrame, [{
    key: "run",
    value: function run() {
      this.lightArray.setColor(this.stripId, null, this.color);
      this.lightArray.setIntensity(this.stripId, null, this.intensity);

      this.runMethod();
    }
  }]);

  return NormalizeStripFrame;
}();

exports.default = NormalizeStripFrame;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYW5pbWF0aW9uL25vcm1hbGl6ZS1zdHJpcC1mcmFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTSxzQkFBc0IsSUFBNUIsQzs7SUFFcUIsbUI7Ozs7Ozs7Ozs7OztBQVduQiwrQkFBWSxVQUFaLEVBQXdCLE9BQXhCLEVBQWlDLEtBQWpDLEVBQXdDLFNBQXhDLEVBQW1ELFNBQW5ELEVBQThGO0FBQUEsUUFBaEMsVUFBZ0MseURBQXJCLG1CQUFxQjs7QUFBQTs7QUFDNUYsU0FBSyxVQUFMLEdBQWtCLFVBQWxCO0FBQ0EsU0FBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFDQSxTQUFLLFVBQUwsR0FBa0IsVUFBbEI7QUFDRDs7Ozs7Ozs7OzBCQUtLO0FBQ0osV0FBSyxVQUFMLENBQWdCLFFBQWhCLENBQXlCLEtBQUssT0FBOUIsRUFBdUMsSUFBdkMsRUFBNkMsS0FBSyxLQUFsRDtBQUNBLFdBQUssVUFBTCxDQUFnQixZQUFoQixDQUE2QixLQUFLLE9BQWxDLEVBQTJDLElBQTNDLEVBQWlELEtBQUssU0FBdEQ7O0FBRUEsV0FBSyxTQUFMO0FBQ0Q7Ozs7OztrQkE1QmtCLG1CIiwiZmlsZSI6ImdhbWUtbG9naWMvYW5pbWF0aW9uL25vcm1hbGl6ZS1zdHJpcC1mcmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IERFRkFVTFRfVElNRV9PRkZTRVQgPSAxMDAwOyAvLyBtc1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb3JtYWxpemVTdHJpcEZyYW1lIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBmcmFtZSB0aGF0IG5vcm1hbGl6ZXMgdGhlIGVudGlyZSBzdHJpcCB0byBhIHNpbmdsZSBjb2xvciBhbmQgaW50ZW5zaXR5XG4gICAqIEBwYXJhbSB7TGlnaHRBcnJheX0gbGlnaHRBcnJheSAtIFRoZSBzdG9yZSdzIGxpZ2h0IGFycmF5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpcElkIC0gVGhlIHN0cmlwSWQgdG8gbm9ybWFsaXplXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciAtIFRoZSBjb2xvciB0byBzZXQgdGhlIGVudGlyZSBzdHJpcCB0b1xuICAgKiBAcGFyYW0ge1N0cmluZ30gaW50ZW5zaXR5IC0gVGhlIGludGVuc2l0eSB0byBzZXQgdGhlIGVudGlyZSBzdHJpcCB0b1xuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBydW5NZXRob2QgLSBUaGUgbWV0aG9kIHRvIHJ1biBvbmNlIHRoZSBzdHJpcCBoYXMgYmVlbiBub3JtYWxpemVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lT2Zmc2V0IC0gVGhlIHRpbWUgdG8gd2FpdCBiZWZvcmUgcGxheWluZyB0aGlzIGZyYW1lXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IobGlnaHRBcnJheSwgc3RyaXBJZCwgY29sb3IsIGludGVuc2l0eSwgcnVuTWV0aG9kLCB0aW1lT2Zmc2V0PURFRkFVTFRfVElNRV9PRkZTRVQpIHtcbiAgICB0aGlzLmxpZ2h0QXJyYXkgPSBsaWdodEFycmF5O1xuICAgIHRoaXMuc3RyaXBJZCA9IHN0cmlwSWQ7XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgIHRoaXMuaW50ZW5zaXR5ID0gaW50ZW5zaXR5O1xuICAgIHRoaXMucnVuTWV0aG9kID0gcnVuTWV0aG9kO1xuICAgIHRoaXMudGltZU9mZnNldCA9IHRpbWVPZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogUnVucyB0aGUgZnJhbWVcbiAgICovXG4gIHJ1bigpIHtcbiAgICB0aGlzLmxpZ2h0QXJyYXkuc2V0Q29sb3IodGhpcy5zdHJpcElkLCBudWxsLCB0aGlzLmNvbG9yKTtcbiAgICB0aGlzLmxpZ2h0QXJyYXkuc2V0SW50ZW5zaXR5KHRoaXMuc3RyaXBJZCwgbnVsbCwgdGhpcy5pbnRlbnNpdHkpO1xuXG4gICAgdGhpcy5ydW5NZXRob2QoKTtcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
