"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sculptureActionCreator = require("../actions/sculpture-action-creator");

var _sculptureActionCreator2 = _interopRequireDefault(_sculptureActionCreator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      this.sculptureActionCreator = new _sculptureActionCreator2.default(dispatcher);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvYW5pbWF0aW9uL3BhbmVsLWFuaW1hdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7OztJQUVxQixjO0FBSW5CLDBCQUFZLE1BQVosRUFBb0IsZ0JBQXBCLEVBQXNDO0FBQUE7O0FBQ3BDLFNBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxTQUFLLGdCQUFMLEdBQXdCLGdCQUF4QjtBQUNBLFNBQUssc0JBQUwsR0FBOEIsSUFBOUI7O0FBRUEsU0FBSyxZQUFMLEdBQW9CLENBQUMsQ0FBckI7QUFDQSxTQUFLLEtBQUwsR0FBYSxlQUFlLE9BQTVCO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7OzJCQW1CTTtBQUNMLFdBQUssS0FBTCxHQUFhLGVBQWUsT0FBNUI7QUFDRDs7Ozs7Ozs7NkJBS1EsQ0FDUjs7Ozs7Ozs7Ozt5QkFPSSxVLEVBQVk7QUFDZixXQUFLLE1BQUw7QUFDQSxXQUFLLEtBQUwsR0FBYSxlQUFlLE9BQTVCO0FBQ0EsV0FBSyxzQkFBTCxHQUE4QixxQ0FBMkIsVUFBM0IsQ0FBOUI7O0FBRUEsV0FBSyxhQUFMO0FBQ0Q7Ozs7Ozs7Ozs0QkFNTztBQUNOLFdBQUssSUFBTDtBQUNBLFdBQUssZ0JBQUw7QUFDRDs7Ozs7Ozs7O29DQU1lO0FBQUE7O0FBQ2QsV0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxHQUFvQixDQUF4Qzs7QUFFQSxVQUFJLEtBQUssWUFBTCxJQUFxQixLQUFLLE1BQUwsQ0FBWSxNQUFqQyxJQUEyQyxLQUFLLFNBQXBELEVBQStEO0FBQzdELGFBQUssZUFBTCxDQUFxQjtBQUFBLGlCQUFNLE1BQUssS0FBTCxFQUFOO0FBQUEsU0FBckI7QUFDRCxPQUZELE1BR0s7QUFBQTtBQUNILGNBQU0sUUFBUSxNQUFLLE1BQUwsQ0FBWSxNQUFLLFlBQWpCLENBQWQ7QUFDQSxxQkFBVyxZQUFNO0FBQ2Ysa0JBQUssZUFBTCxDQUFxQjtBQUFBLHFCQUFNLE1BQU0sR0FBTixFQUFOO0FBQUEsYUFBckI7O0FBRUEsa0JBQUssYUFBTDtBQUNELFdBSkQsRUFJRyxNQUFNLFVBSlQ7QUFGRztBQU9KO0FBQ0Y7OztvQ0FFZSxRLEVBQVU7QUFDeEIsV0FBSyxzQkFBTCxDQUE0QixrQkFBNUIsQ0FBK0MsUUFBL0M7QUFDRDs7O3dCQXBFZTtBQUNkLGFBQU8sS0FBSyxLQUFMLEtBQWUsZUFBZSxPQUFyQztBQUNEOzs7Ozs7Ozt3QkFLZTtBQUNkLGFBQU8sS0FBSyxLQUFMLEtBQWUsZUFBZSxPQUFyQztBQUNEOzs7Ozs7QUF6QmtCLGMsQ0FDWixPLEdBQVUsUztBQURFLGMsQ0FFWixPLEdBQVUsUztrQkFGRSxjIiwiZmlsZSI6ImdhbWUtbG9naWMvYW5pbWF0aW9uL3BhbmVsLWFuaW1hdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY3VscHR1cmVBY3Rpb25DcmVhdG9yIGZyb20gJy4uL2FjdGlvbnMvc2N1bHB0dXJlLWFjdGlvbi1jcmVhdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFuZWxBbmltYXRpb24ge1xuICBzdGF0aWMgU1RPUFBFRCA9IFwic3RvcHBlZFwiO1xuICBzdGF0aWMgUlVOTklORyA9IFwicnVubmluZ1wiO1xuXG4gIGNvbnN0cnVjdG9yKGZyYW1lcywgY29tcGxldGVDYWxsYmFjaykge1xuICAgIHRoaXMuZnJhbWVzID0gZnJhbWVzO1xuICAgIHRoaXMuY29tcGxldGVDYWxsYmFjayA9IGNvbXBsZXRlQ2FsbGJhY2s7XG4gICAgdGhpcy5zY3VscHR1cmVBY3Rpb25DcmVhdG9yID0gbnVsbDtcblxuICAgIHRoaXMuY3VycmVudEZyYW1lID0gLTE7XG4gICAgdGhpcy5zdGF0ZSA9IFBhbmVsQW5pbWF0aW9uLlNUT1BQRUQ7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge0Jvb2xlYW59IElmIHRoZSBhbmltYXRpb24gaXMgY3VycmVudGx5IHJ1bm5pbmdcbiAgICovXG4gIGdldCBpc1J1bm5pbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IFBhbmVsQW5pbWF0aW9uLlJVTk5JTkc7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge0Jvb2xlYW59IElmIHRoZSBhbmltYXRpb24gaXMgY3VycmVudGx5IHN0b3BwZWRcbiAgICovXG4gIGdldCBpc1N0b3BwZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IFBhbmVsQW5pbWF0aW9uLlNUT1BQRUQ7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIGFuaW1hdGlvbiB3aGVyZXZlciBpdCBpc1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB0aGlzLnN0YXRlID0gUGFuZWxBbmltYXRpb24uU1RPUFBFRDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbnkgc2V0dXAgd29yayBiZWZvcmUgdGhlIGFuaW1hdGlvbiBiZWdpbnNcbiAgICovXG4gIGJlZm9yZSgpIHtcbiAgfVxuXG4gIC8qKlxuICAgKiBHb2VzIHRocm91Z2ggZWFjaCBmcmFtZSBhbmQgYXN5bmNocm9ub3VzbHkgcGxheXMgZWFjaCBmcmFtZVxuICAgKiBUaGUgZGVmYXVsdCBiZWhhdmlvdXIgaXMgdXN1YWxseSBzdWZmaWNpZW50IGZvciBtb3N0IGNhc2VzXG4gICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlciAtIFRoZSBkaXNwYXRjaGVyIGluc3RhbmNlXG4gICAqL1xuICBwbGF5KGRpc3BhdGNoZXIpIHtcbiAgICB0aGlzLmJlZm9yZSgpO1xuICAgIHRoaXMuc3RhdGUgPSBQYW5lbEFuaW1hdGlvbi5SVU5OSU5HO1xuICAgIHRoaXMuc2N1bHB0dXJlQWN0aW9uQ3JlYXRvciA9IG5ldyBTY3VscHR1cmVBY3Rpb25DcmVhdG9yKGRpc3BhdGNoZXIpO1xuXG4gICAgdGhpcy5wbGF5TmV4dEZyYW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogQW55IHRlYXJkb3duIHdvcmsgdG8gYmUgZG9uZSBhZnRlciB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXG4gICAqIEJ5IGRlZmF1bHQgdGhpcyBzZXRzIHN0YXRlIHRvIHN0b3BwZWQgYW5kIGNhbGxzIHRoZSBjb21wbGV0ZSBjYWxsYmFja1xuICAgKi9cbiAgYWZ0ZXIoKSB7XG4gICAgdGhpcy5zdG9wKCk7XG4gICAgdGhpcy5jb21wbGV0ZUNhbGxiYWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHBsYXkgdG8gcnVuIHRoZSBuZXh0IGZyYW1lXG4gICAqIFVzdWFsbHkgaXQgaXNuJ3QgbmVjZXNzYXJ5IHRvIG92ZXJyaWRlIHRoaXNcbiAgICovXG4gIHBsYXlOZXh0RnJhbWUoKSB7XG4gICAgdGhpcy5jdXJyZW50RnJhbWUgPSB0aGlzLmN1cnJlbnRGcmFtZSArIDE7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50RnJhbWUgPj0gdGhpcy5mcmFtZXMubGVuZ3RoIHx8IHRoaXMuaXNTdG9wcGVkKSB7XG4gICAgICB0aGlzLmV4ZWN1dGVBc0FjdGlvbigoKSA9PiB0aGlzLmFmdGVyKCkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGZyYW1lID0gdGhpcy5mcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVdO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZXhlY3V0ZUFzQWN0aW9uKCgpID0+IGZyYW1lLnJ1bigpKTtcblxuICAgICAgICB0aGlzLnBsYXlOZXh0RnJhbWUoKTtcbiAgICAgIH0sIGZyYW1lLnRpbWVPZmZzZXQpO1xuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGVBc0FjdGlvbihjYWxsYmFjaykge1xuICAgIHRoaXMuc2N1bHB0dXJlQWN0aW9uQ3JlYXRvci5zZW5kQW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spO1xuICB9XG59XG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
