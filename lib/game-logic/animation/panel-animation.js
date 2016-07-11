"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SculptureActionCreator = require('../actions/sculpture-action-creator');

var PanelAnimation = function () {
  function PanelAnimation(frames, completeCallback) {
    _classCallCheck(this, PanelAnimation);

    this.frames = frames;
    this.completeCallback = completeCallback;
    this.sculptureActionCreator = null;

    this.currentFrame = -1;
    this.state = PanelAnimation.STOPPED;
  }

  /**
   * @returns {Boolean} If the animation is currently running
   */


  _createClass(PanelAnimation, [{
    key: "stop",


    /**
     * Stops the animation wherever it is
     */
    value: function stop() {
      this.state = PanelAnimation.STOPPED;
    }

    /**
     * Any setup work before the animation begins
     */

  }, {
    key: "before",
    value: function before() {}

    /**
     * Goes through each frame and asynchronously plays each frame
     * The default behaviour is usually sufficient for most cases
     * @param {Dispatcher} dispatcher - The dispatcher instance
     */

  }, {
    key: "play",
    value: function play(dispatcher) {
      this.before();
      this.state = PanelAnimation.RUNNING;
      this.sculptureActionCreator = new SculptureActionCreator(dispatcher);

      this.playNextFrame();
    }

    /**
     * Any teardown work to be done after the animation finishes
     * By default this sets state to stopped and calls the complete callback
     */

  }, {
    key: "after",
    value: function after() {
      this.stop();
      this.completeCallback();
    }

    /**
     * Called by play to run the next frame
     * Usually it isn't necessary to override this
     */

  }, {
    key: "playNextFrame",
    value: function playNextFrame() {
      var _this = this;

      this.currentFrame = this.currentFrame + 1;

      if (this.currentFrame >= this.frames.length || this.isStopped) {
        this.executeAsAction(function () {
          return _this.after();
        });
      } else {
        (function () {
          var frame = _this.frames[_this.currentFrame];
          setTimeout(function () {
            _this.executeAsAction(function () {
              return frame.run();
            });

            _this.playNextFrame();
          }, frame.timeOffset);
        })();
      }
    }
  }, {
    key: "executeAsAction",
    value: function executeAsAction(callback) {
      this.sculptureActionCreator.sendAnimationFrame(callback);
    }
  }, {
    key: "isRunning",
    get: function get() {
      return this.state === PanelAnimation.RUNNING;
    }

    /**
     * @returns {Boolean} If the animation is currently stopped
     */

  }, {
    key: "isStopped",
    get: function get() {
      return this.state === PanelAnimation.STOPPED;
    }
  }]);

  return PanelAnimation;
}();

PanelAnimation.STOPPED = "stopped";
PanelAnimation.RUNNING = "running";
exports.default = PanelAnimation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYW5pbWF0aW9uL3BhbmVsLWFuaW1hdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTSx5QkFBeUIsUUFBUSxxQ0FBUixDQUEvQjs7SUFFcUIsYztBQUluQiwwQkFBWSxNQUFaLEVBQW9CLGdCQUFwQixFQUFzQztBQUFBOztBQUNwQyxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxnQkFBTCxHQUF3QixnQkFBeEI7QUFDQSxTQUFLLHNCQUFMLEdBQThCLElBQTlCOztBQUVBLFNBQUssWUFBTCxHQUFvQixDQUFDLENBQXJCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsZUFBZSxPQUE1QjtBQUNEOzs7Ozs7Ozs7Ozs7OzsyQkFtQk07QUFDTCxXQUFLLEtBQUwsR0FBYSxlQUFlLE9BQTVCO0FBQ0Q7Ozs7Ozs7OzZCQUtRLENBQ1I7Ozs7Ozs7Ozs7eUJBT0ksVSxFQUFZO0FBQ2YsV0FBSyxNQUFMO0FBQ0EsV0FBSyxLQUFMLEdBQWEsZUFBZSxPQUE1QjtBQUNBLFdBQUssc0JBQUwsR0FBOEIsSUFBSSxzQkFBSixDQUEyQixVQUEzQixDQUE5Qjs7QUFFQSxXQUFLLGFBQUw7QUFDRDs7Ozs7Ozs7OzRCQU1PO0FBQ04sV0FBSyxJQUFMO0FBQ0EsV0FBSyxnQkFBTDtBQUNEOzs7Ozs7Ozs7b0NBTWU7QUFBQTs7QUFDZCxXQUFLLFlBQUwsR0FBb0IsS0FBSyxZQUFMLEdBQW9CLENBQXhDOztBQUVBLFVBQUksS0FBSyxZQUFMLElBQXFCLEtBQUssTUFBTCxDQUFZLE1BQWpDLElBQTJDLEtBQUssU0FBcEQsRUFBK0Q7QUFDN0QsYUFBSyxlQUFMLENBQXFCO0FBQUEsaUJBQU0sTUFBSyxLQUFMLEVBQU47QUFBQSxTQUFyQjtBQUNELE9BRkQsTUFHSztBQUFBO0FBQ0gsY0FBTSxRQUFRLE1BQUssTUFBTCxDQUFZLE1BQUssWUFBakIsQ0FBZDtBQUNBLHFCQUFXLFlBQU07QUFDZixrQkFBSyxlQUFMLENBQXFCO0FBQUEscUJBQU0sTUFBTSxHQUFOLEVBQU47QUFBQSxhQUFyQjs7QUFFQSxrQkFBSyxhQUFMO0FBQ0QsV0FKRCxFQUlHLE1BQU0sVUFKVDtBQUZHO0FBT0o7QUFDRjs7O29DQUVlLFEsRUFBVTtBQUN4QixXQUFLLHNCQUFMLENBQTRCLGtCQUE1QixDQUErQyxRQUEvQztBQUNEOzs7d0JBcEVlO0FBQ2QsYUFBTyxLQUFLLEtBQUwsS0FBZSxlQUFlLE9BQXJDO0FBQ0Q7Ozs7Ozs7O3dCQUtlO0FBQ2QsYUFBTyxLQUFLLEtBQUwsS0FBZSxlQUFlLE9BQXJDO0FBQ0Q7Ozs7OztBQXpCa0IsYyxDQUNaLE8sR0FBVSxTO0FBREUsYyxDQUVaLE8sR0FBVSxTO2tCQUZFLGMiLCJmaWxlIjoiZ2FtZS1sb2dpYy9hbmltYXRpb24vcGFuZWwtYW5pbWF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU2N1bHB0dXJlQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvc2N1bHB0dXJlLWFjdGlvbi1jcmVhdG9yJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhbmVsQW5pbWF0aW9uIHtcbiAgc3RhdGljIFNUT1BQRUQgPSBcInN0b3BwZWRcIjtcbiAgc3RhdGljIFJVTk5JTkcgPSBcInJ1bm5pbmdcIjtcblxuICBjb25zdHJ1Y3RvcihmcmFtZXMsIGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICB0aGlzLmZyYW1lcyA9IGZyYW1lcztcbiAgICB0aGlzLmNvbXBsZXRlQ2FsbGJhY2sgPSBjb21wbGV0ZUNhbGxiYWNrO1xuICAgIHRoaXMuc2N1bHB0dXJlQWN0aW9uQ3JlYXRvciA9IG51bGw7XG5cbiAgICB0aGlzLmN1cnJlbnRGcmFtZSA9IC0xO1xuICAgIHRoaXMuc3RhdGUgPSBQYW5lbEFuaW1hdGlvbi5TVE9QUEVEO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBJZiB0aGUgYW5pbWF0aW9uIGlzIGN1cnJlbnRseSBydW5uaW5nXG4gICAqL1xuICBnZXQgaXNSdW5uaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBQYW5lbEFuaW1hdGlvbi5SVU5OSU5HO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBJZiB0aGUgYW5pbWF0aW9uIGlzIGN1cnJlbnRseSBzdG9wcGVkXG4gICAqL1xuICBnZXQgaXNTdG9wcGVkKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBQYW5lbEFuaW1hdGlvbi5TVE9QUEVEO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIHRoZSBhbmltYXRpb24gd2hlcmV2ZXIgaXQgaXNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IFBhbmVsQW5pbWF0aW9uLlNUT1BQRUQ7XG4gIH1cblxuICAvKipcbiAgICogQW55IHNldHVwIHdvcmsgYmVmb3JlIHRoZSBhbmltYXRpb24gYmVnaW5zXG4gICAqL1xuICBiZWZvcmUoKSB7XG4gIH1cblxuICAvKipcbiAgICogR29lcyB0aHJvdWdoIGVhY2ggZnJhbWUgYW5kIGFzeW5jaHJvbm91c2x5IHBsYXlzIGVhY2ggZnJhbWVcbiAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3VyIGlzIHVzdWFsbHkgc3VmZmljaWVudCBmb3IgbW9zdCBjYXNlc1xuICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXIgLSBUaGUgZGlzcGF0Y2hlciBpbnN0YW5jZVxuICAgKi9cbiAgcGxheShkaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5iZWZvcmUoKTtcbiAgICB0aGlzLnN0YXRlID0gUGFuZWxBbmltYXRpb24uUlVOTklORztcbiAgICB0aGlzLnNjdWxwdHVyZUFjdGlvbkNyZWF0b3IgPSBuZXcgU2N1bHB0dXJlQWN0aW9uQ3JlYXRvcihkaXNwYXRjaGVyKTtcblxuICAgIHRoaXMucGxheU5leHRGcmFtZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFueSB0ZWFyZG93biB3b3JrIHRvIGJlIGRvbmUgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBmaW5pc2hlc1xuICAgKiBCeSBkZWZhdWx0IHRoaXMgc2V0cyBzdGF0ZSB0byBzdG9wcGVkIGFuZCBjYWxscyB0aGUgY29tcGxldGUgY2FsbGJhY2tcbiAgICovXG4gIGFmdGVyKCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMuY29tcGxldGVDYWxsYmFjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSBwbGF5IHRvIHJ1biB0aGUgbmV4dCBmcmFtZVxuICAgKiBVc3VhbGx5IGl0IGlzbid0IG5lY2Vzc2FyeSB0byBvdmVycmlkZSB0aGlzXG4gICAqL1xuICBwbGF5TmV4dEZyYW1lKCkge1xuICAgIHRoaXMuY3VycmVudEZyYW1lID0gdGhpcy5jdXJyZW50RnJhbWUgKyAxO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudEZyYW1lID49IHRoaXMuZnJhbWVzLmxlbmd0aCB8fCB0aGlzLmlzU3RvcHBlZCkge1xuICAgICAgdGhpcy5leGVjdXRlQXNBY3Rpb24oKCkgPT4gdGhpcy5hZnRlcigpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBmcmFtZSA9IHRoaXMuZnJhbWVzW3RoaXMuY3VycmVudEZyYW1lXTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmV4ZWN1dGVBc0FjdGlvbigoKSA9PiBmcmFtZS5ydW4oKSk7XG5cbiAgICAgICAgdGhpcy5wbGF5TmV4dEZyYW1lKCk7XG4gICAgICB9LCBmcmFtZS50aW1lT2Zmc2V0KTtcbiAgICB9XG4gIH1cblxuICBleGVjdXRlQXNBY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLnNjdWxwdHVyZUFjdGlvbkNyZWF0b3Iuc2VuZEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKTtcbiAgfVxufVxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
