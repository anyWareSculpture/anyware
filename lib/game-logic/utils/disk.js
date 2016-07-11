"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _trackedData = require("./tracked-data");

var _trackedData2 = _interopRequireDefault(_trackedData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Disk = function (_TrackedData) {
  _inherits(Disk, _TrackedData);

  function Disk() {
    var position = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var direction = arguments.length <= 1 || arguments[1] === undefined ? Disk.STOPPED : arguments[1];

    _classCallCheck(this, Disk);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Disk).call(this, {
      position: position,
      direction: direction,
      user: "",
      state: Disk.STATE_READY
    }));
  }

  _createClass(Disk, [{
    key: "rotateTo",
    value: function rotateTo(position) {
      this.set('position', position);
    }
  }, {
    key: "getPosition",
    value: function getPosition() {
      return this.get('position');
    }

    /**
     * Applies the given direction to the disk, sometimes resulting in a conflict if direction opposes the current direction
     * @param {String} direction - Static direction constant from Disk
     */

  }, {
    key: "setDirection",
    value: function setDirection(direction) {
      var currentDirection = this.getDirection();
      if (Disk.conflictsWith(currentDirection, direction)) {
        this.setDirectionConflict();
      } else if (direction !== Disk.STOPPED && currentDirection === Disk.CONFLICT) {
        // No other direction can be set while conflicting except for stop
        return;
      } else {
        this.set('direction', direction);
      }
    }

    /**
     * Un-applies a direction (instead of directly setting it)
     * Resolves conflicts when they are present
     * @param {String} direction - Static direction constant from Disk
     *    In general, this function should only be used with the
     *    CLOCKWISE and COUNTERCLOCKWISE directions
     */

  }, {
    key: "unsetDirection",
    value: function unsetDirection(direction) {
      var currentDirection = this.getDirection();
      if (currentDirection === direction) {
        this.stop();
      } else if (currentDirection === Disk.CONFLICT) {
        var opposite = Disk.oppositeDirection(direction);
        this.set('direction', opposite);
      } else {
        throw new Error("Could not reason about how to unset direction '" + direction + "' from current direction '" + currentDirection + "'");
      }
    }
  }, {
    key: "turnClockwise",
    value: function turnClockwise() {
      this.setDirection(Disk.CLOCKWISE);
    }
  }, {
    key: "turnCounterclockwise",
    value: function turnCounterclockwise() {
      this.setDirection(Disk.COUNTERCLOCKWISE);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.setDirection(Disk.STOPPED);
    }
  }, {
    key: "setDirectionConflict",
    value: function setDirectionConflict() {
      this.setDirection(Disk.CONFLICT);
    }
  }, {
    key: "getDirection",
    value: function getDirection() {
      return this.get('direction');
    }
  }, {
    key: "setUser",
    value: function setUser(user) {
      this.set('user', user);
    }
  }, {
    key: "getUser",
    value: function getUser() {
      return this.get('user');
    }
  }, {
    key: "setState",
    value: function setState(state) {
      this.set('state', state);
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.get('state');
    }
  }, {
    key: "isStopped",
    get: function get() {
      return this.getDirection() === Disk.STOPPED;
    }
  }, {
    key: "isConflicting",
    get: function get() {
      return this.getDirection() === Disk.CONFLICT;
    }
  }, {
    key: "isTurningClockwise",
    get: function get() {
      return this.getDirection() === Disk.CLOCKWISE;
    }
  }, {
    key: "isTurningCounterclockwise",
    get: function get() {
      return this.getDirection() === Disk.COUNTERCLOCKWISE;
    }
  }, {
    key: "isHoming",
    get: function get() {
      return this.getState() === Disk.STATE_HOMING;
    }
  }, {
    key: "isReady",
    get: function get() {
      return this.getState() === Disk.STATE_READY;
    }
  }], [{
    key: "conflictsWith",
    value: function conflictsWith(direction1, direction2) {
      return direction1 === Disk.CLOCKWISE && direction2 === Disk.COUNTERCLOCKWISE || direction1 === Disk.COUNTERCLOCKWISE && direction2 === Disk.CLOCKWISE;
    }
  }, {
    key: "oppositeDirection",
    value: function oppositeDirection(direction) {
      if (direction === Disk.CLOCKWISE) {
        return Disk.COUNTERCLOCKWISE;
      } else if (direction === Disk.COUNTERCLOCKWISE) {
        return Disk.CLOCKWISE;
      } else {
        throw new Error("Cannot resolve opposite for direction '" + direction + "'");
      }
    }
  }]);

  return Disk;
}(_trackedData2.default);

Disk.STOPPED = "stopped";
Disk.CLOCKWISE = "clockwise";
Disk.COUNTERCLOCKWISE = "counterclockwise";
Disk.CONFLICT = "conflict";
Disk.STATE_HOMING = "homing";
Disk.STATE_READY = "ready";
exports.default = Disk;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvZGlzay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7SUFFcUIsSTs7O0FBU25CLGtCQUFnRDtBQUFBLFFBQXBDLFFBQW9DLHlEQUEzQixDQUEyQjtBQUFBLFFBQXhCLFNBQXdCLHlEQUFkLEtBQUssT0FBUzs7QUFBQTs7QUFBQSxtRkFDeEM7QUFDSixnQkFBVSxRQUROO0FBRUosaUJBQVcsU0FGUDtBQUdKLFlBQU0sRUFIRjtBQUlKLGFBQU8sS0FBSztBQUpSLEtBRHdDO0FBTy9DOzs7OzZCQUVRLFEsRUFBVTtBQUNqQixXQUFLLEdBQUwsQ0FBUyxVQUFULEVBQXFCLFFBQXJCO0FBQ0Q7OztrQ0FFYTtBQUNaLGFBQU8sS0FBSyxHQUFMLENBQVMsVUFBVCxDQUFQO0FBQ0Q7Ozs7Ozs7OztpQ0FNWSxTLEVBQVc7QUFDdEIsVUFBTSxtQkFBbUIsS0FBSyxZQUFMLEVBQXpCO0FBQ0EsVUFBSSxLQUFLLGFBQUwsQ0FBbUIsZ0JBQW5CLEVBQXFDLFNBQXJDLENBQUosRUFBcUQ7QUFDbkQsYUFBSyxvQkFBTDtBQUNELE9BRkQsTUFHSyxJQUFJLGNBQWMsS0FBSyxPQUFuQixJQUE4QixxQkFBcUIsS0FBSyxRQUE1RCxFQUFzRTs7QUFFekU7QUFDRCxPQUhJLE1BSUE7QUFDSCxhQUFLLEdBQUwsQ0FBUyxXQUFULEVBQXNCLFNBQXRCO0FBQ0Q7QUFDRjs7Ozs7Ozs7Ozs7O21DQVNjLFMsRUFBVztBQUN4QixVQUFNLG1CQUFtQixLQUFLLFlBQUwsRUFBekI7QUFDQSxVQUFJLHFCQUFxQixTQUF6QixFQUFvQztBQUNsQyxhQUFLLElBQUw7QUFDRCxPQUZELE1BR0ssSUFBSSxxQkFBcUIsS0FBSyxRQUE5QixFQUF3QztBQUMzQyxZQUFNLFdBQVcsS0FBSyxpQkFBTCxDQUF1QixTQUF2QixDQUFqQjtBQUNBLGFBQUssR0FBTCxDQUFTLFdBQVQsRUFBc0IsUUFBdEI7QUFDRCxPQUhJLE1BSUE7QUFDSCxjQUFNLElBQUksS0FBSixxREFBNEQsU0FBNUQsa0NBQWtHLGdCQUFsRyxPQUFOO0FBQ0Q7QUFDRjs7O29DQUVlO0FBQ2QsV0FBSyxZQUFMLENBQWtCLEtBQUssU0FBdkI7QUFDRDs7OzJDQUVzQjtBQUNyQixXQUFLLFlBQUwsQ0FBa0IsS0FBSyxnQkFBdkI7QUFDRDs7OzJCQUVNO0FBQ0wsV0FBSyxZQUFMLENBQWtCLEtBQUssT0FBdkI7QUFDRDs7OzJDQUVzQjtBQUNyQixXQUFLLFlBQUwsQ0FBa0IsS0FBSyxRQUF2QjtBQUNEOzs7bUNBa0JjO0FBQ2IsYUFBTyxLQUFLLEdBQUwsQ0FBUyxXQUFULENBQVA7QUFDRDs7OzRCQUVPLEksRUFBTTtBQUNaLFdBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakI7QUFDRDs7OzhCQUVTO0FBQ1IsYUFBTyxLQUFLLEdBQUwsQ0FBUyxNQUFULENBQVA7QUFDRDs7OzZCQUVRLEssRUFBTztBQUNkLFdBQUssR0FBTCxDQUFTLE9BQVQsRUFBa0IsS0FBbEI7QUFDRDs7OytCQVVVO0FBQ1QsYUFBTyxLQUFLLEdBQUwsQ0FBUyxPQUFULENBQVA7QUFDRDs7O3dCQTFDZTtBQUNkLGFBQU8sS0FBSyxZQUFMLE9BQXdCLEtBQUssT0FBcEM7QUFDRDs7O3dCQUVtQjtBQUNsQixhQUFPLEtBQUssWUFBTCxPQUF3QixLQUFLLFFBQXBDO0FBQ0Q7Ozt3QkFFd0I7QUFDdkIsYUFBTyxLQUFLLFlBQUwsT0FBd0IsS0FBSyxTQUFwQztBQUNEOzs7d0JBRStCO0FBQzlCLGFBQU8sS0FBSyxZQUFMLE9BQXdCLEtBQUssZ0JBQXBDO0FBQ0Q7Ozt3QkFrQmM7QUFDYixhQUFPLEtBQUssUUFBTCxPQUFvQixLQUFLLFlBQWhDO0FBQ0Q7Ozt3QkFFYTtBQUNaLGFBQU8sS0FBSyxRQUFMLE9BQW9CLEtBQUssV0FBaEM7QUFDRDs7O2tDQU1vQixVLEVBQVksVSxFQUFZO0FBQzNDLGFBQVEsZUFBZSxLQUFLLFNBQXBCLElBQWlDLGVBQWUsS0FBSyxnQkFBdEQsSUFBNEUsZUFBZSxLQUFLLGdCQUFwQixJQUF3QyxlQUFlLEtBQUssU0FBL0k7QUFDRDs7O3NDQUV3QixTLEVBQVc7QUFDbEMsVUFBSSxjQUFjLEtBQUssU0FBdkIsRUFBa0M7QUFDaEMsZUFBTyxLQUFLLGdCQUFaO0FBQ0QsT0FGRCxNQUdLLElBQUksY0FBYyxLQUFLLGdCQUF2QixFQUF5QztBQUM1QyxlQUFPLEtBQUssU0FBWjtBQUNELE9BRkksTUFHQTtBQUNILGNBQU0sSUFBSSxLQUFKLDZDQUFvRCxTQUFwRCxPQUFOO0FBQ0Q7QUFDRjs7Ozs7O0FBM0lrQixJLENBQ1osTyxHQUFVLFM7QUFERSxJLENBRVosUyxHQUFZLFc7QUFGQSxJLENBR1osZ0IsR0FBbUIsa0I7QUFIUCxJLENBSVosUSxHQUFXLFU7QUFKQyxJLENBTVosWSxHQUFlLFE7QUFOSCxJLENBT1osVyxHQUFjLE87a0JBUEYsSSIsImZpbGUiOiJnYW1lLWxvZ2ljL3V0aWxzL2Rpc2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVHJhY2tlZERhdGEgZnJvbSAnLi90cmFja2VkLWRhdGEnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNrIGV4dGVuZHMgVHJhY2tlZERhdGEge1xuICBzdGF0aWMgU1RPUFBFRCA9IFwic3RvcHBlZFwiO1xuICBzdGF0aWMgQ0xPQ0tXSVNFID0gXCJjbG9ja3dpc2VcIjtcbiAgc3RhdGljIENPVU5URVJDTE9DS1dJU0UgPSBcImNvdW50ZXJjbG9ja3dpc2VcIjtcbiAgc3RhdGljIENPTkZMSUNUID0gXCJjb25mbGljdFwiXG5cbiAgc3RhdGljIFNUQVRFX0hPTUlORyA9IFwiaG9taW5nXCI7XG4gIHN0YXRpYyBTVEFURV9SRUFEWSA9IFwicmVhZHlcIjtcblxuICBjb25zdHJ1Y3Rvcihwb3NpdGlvbj0wLCBkaXJlY3Rpb249RGlzay5TVE9QUEVEKSB7XG4gICAgc3VwZXIoe1xuICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb24sXG4gICAgICB1c2VyOiBcIlwiLFxuICAgICAgc3RhdGU6IERpc2suU1RBVEVfUkVBRFlcbiAgICB9KTtcbiAgfVxuXG4gIHJvdGF0ZVRvKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5zZXQoJ3Bvc2l0aW9uJywgcG9zaXRpb24pO1xuICB9XG5cbiAgZ2V0UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwb3NpdGlvbicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIGdpdmVuIGRpcmVjdGlvbiB0byB0aGUgZGlzaywgc29tZXRpbWVzIHJlc3VsdGluZyBpbiBhIGNvbmZsaWN0IGlmIGRpcmVjdGlvbiBvcHBvc2VzIHRoZSBjdXJyZW50IGRpcmVjdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIC0gU3RhdGljIGRpcmVjdGlvbiBjb25zdGFudCBmcm9tIERpc2tcbiAgICovXG4gIHNldERpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICBjb25zdCBjdXJyZW50RGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb24oKTtcbiAgICBpZiAoRGlzay5jb25mbGljdHNXaXRoKGN1cnJlbnREaXJlY3Rpb24sIGRpcmVjdGlvbikpIHtcbiAgICAgIHRoaXMuc2V0RGlyZWN0aW9uQ29uZmxpY3QoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZGlyZWN0aW9uICE9PSBEaXNrLlNUT1BQRUQgJiYgY3VycmVudERpcmVjdGlvbiA9PT0gRGlzay5DT05GTElDVCkge1xuICAgICAgLy8gTm8gb3RoZXIgZGlyZWN0aW9uIGNhbiBiZSBzZXQgd2hpbGUgY29uZmxpY3RpbmcgZXhjZXB0IGZvciBzdG9wXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zZXQoJ2RpcmVjdGlvbicsIGRpcmVjdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVuLWFwcGxpZXMgYSBkaXJlY3Rpb24gKGluc3RlYWQgb2YgZGlyZWN0bHkgc2V0dGluZyBpdClcbiAgICogUmVzb2x2ZXMgY29uZmxpY3RzIHdoZW4gdGhleSBhcmUgcHJlc2VudFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIC0gU3RhdGljIGRpcmVjdGlvbiBjb25zdGFudCBmcm9tIERpc2tcbiAgICogICAgSW4gZ2VuZXJhbCwgdGhpcyBmdW5jdGlvbiBzaG91bGQgb25seSBiZSB1c2VkIHdpdGggdGhlXG4gICAqICAgIENMT0NLV0lTRSBhbmQgQ09VTlRFUkNMT0NLV0lTRSBkaXJlY3Rpb25zXG4gICAqL1xuICB1bnNldERpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICBjb25zdCBjdXJyZW50RGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb24oKTtcbiAgICBpZiAoY3VycmVudERpcmVjdGlvbiA9PT0gZGlyZWN0aW9uKSB7XG4gICAgICB0aGlzLnN0b3AoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY3VycmVudERpcmVjdGlvbiA9PT0gRGlzay5DT05GTElDVCkge1xuICAgICAgY29uc3Qgb3Bwb3NpdGUgPSBEaXNrLm9wcG9zaXRlRGlyZWN0aW9uKGRpcmVjdGlvbik7XG4gICAgICB0aGlzLnNldCgnZGlyZWN0aW9uJywgb3Bwb3NpdGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHJlYXNvbiBhYm91dCBob3cgdG8gdW5zZXQgZGlyZWN0aW9uICcke2RpcmVjdGlvbn0nIGZyb20gY3VycmVudCBkaXJlY3Rpb24gJyR7Y3VycmVudERpcmVjdGlvbn0nYCk7XG4gICAgfVxuICB9XG5cbiAgdHVybkNsb2Nrd2lzZSgpIHtcbiAgICB0aGlzLnNldERpcmVjdGlvbihEaXNrLkNMT0NLV0lTRSk7XG4gIH1cblxuICB0dXJuQ291bnRlcmNsb2Nrd2lzZSgpIHtcbiAgICB0aGlzLnNldERpcmVjdGlvbihEaXNrLkNPVU5URVJDTE9DS1dJU0UpO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLnNldERpcmVjdGlvbihEaXNrLlNUT1BQRUQpO1xuICB9XG5cbiAgc2V0RGlyZWN0aW9uQ29uZmxpY3QoKSB7XG4gICAgdGhpcy5zZXREaXJlY3Rpb24oRGlzay5DT05GTElDVCk7XG4gIH1cblxuICBnZXQgaXNTdG9wcGVkKCkge1xuICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbigpID09PSBEaXNrLlNUT1BQRUQ7XG4gIH1cblxuICBnZXQgaXNDb25mbGljdGluZygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXREaXJlY3Rpb24oKSA9PT0gRGlzay5DT05GTElDVDtcbiAgfVxuXG4gIGdldCBpc1R1cm5pbmdDbG9ja3dpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlyZWN0aW9uKCkgPT09IERpc2suQ0xPQ0tXSVNFO1xuICB9XG5cbiAgZ2V0IGlzVHVybmluZ0NvdW50ZXJjbG9ja3dpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlyZWN0aW9uKCkgPT09IERpc2suQ09VTlRFUkNMT0NLV0lTRTtcbiAgfVxuXG4gIGdldERpcmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2RpcmVjdGlvbicpO1xuICB9XG5cbiAgc2V0VXNlcih1c2VyKSB7XG4gICAgdGhpcy5zZXQoJ3VzZXInLCB1c2VyKTtcbiAgfVxuXG4gIGdldFVzZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJyk7XG4gIH1cblxuICBzZXRTdGF0ZShzdGF0ZSkge1xuICAgIHRoaXMuc2V0KCdzdGF0ZScsIHN0YXRlKTtcbiAgfVxuXG4gIGdldCBpc0hvbWluZygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpID09PSBEaXNrLlNUQVRFX0hPTUlORztcbiAgfVxuXG4gIGdldCBpc1JlYWR5KCkge1xuICAgIHJldHVybiB0aGlzLmdldFN0YXRlKCkgPT09IERpc2suU1RBVEVfUkVBRFk7XG4gIH1cblxuICBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3N0YXRlJyk7XG4gIH1cblxuICBzdGF0aWMgY29uZmxpY3RzV2l0aChkaXJlY3Rpb24xLCBkaXJlY3Rpb24yKSB7XG4gICAgcmV0dXJuIChkaXJlY3Rpb24xID09PSBEaXNrLkNMT0NLV0lTRSAmJiBkaXJlY3Rpb24yID09PSBEaXNrLkNPVU5URVJDTE9DS1dJU0UpIHx8IChkaXJlY3Rpb24xID09PSBEaXNrLkNPVU5URVJDTE9DS1dJU0UgJiYgZGlyZWN0aW9uMiA9PT0gRGlzay5DTE9DS1dJU0UpO1xuICB9XG5cbiAgc3RhdGljIG9wcG9zaXRlRGlyZWN0aW9uKGRpcmVjdGlvbikge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IERpc2suQ0xPQ0tXSVNFKSB7XG4gICAgICByZXR1cm4gRGlzay5DT1VOVEVSQ0xPQ0tXSVNFO1xuICAgIH1cbiAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT09IERpc2suQ09VTlRFUkNMT0NLV0lTRSkge1xuICAgICAgcmV0dXJuIERpc2suQ0xPQ0tXSVNFO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlc29sdmUgb3Bwb3NpdGUgZm9yIGRpcmVjdGlvbiAnJHtkaXJlY3Rpb259J2ApO1xuICAgIH1cbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
