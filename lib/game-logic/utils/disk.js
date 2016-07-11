"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TrackedData = require('./tracked-data');

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
}(TrackedData);

Disk.STOPPED = "stopped";
Disk.CLOCKWISE = "clockwise";
Disk.COUNTERCLOCKWISE = "counterclockwise";
Disk.CONFLICT = "conflict";
Disk.STATE_HOMING = "homing";
Disk.STATE_READY = "ready";
exports.default = Disk;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvdXRpbHMvZGlzay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLElBQU0sY0FBYyxRQUFRLGdCQUFSLENBQXBCOztJQUVxQixJOzs7QUFTbkIsa0JBQWdEO0FBQUEsUUFBcEMsUUFBb0MseURBQTNCLENBQTJCO0FBQUEsUUFBeEIsU0FBd0IseURBQWQsS0FBSyxPQUFTOztBQUFBOztBQUFBLG1GQUN4QztBQUNKLGdCQUFVLFFBRE47QUFFSixpQkFBVyxTQUZQO0FBR0osWUFBTSxFQUhGO0FBSUosYUFBTyxLQUFLO0FBSlIsS0FEd0M7QUFPL0M7Ozs7NkJBRVEsUSxFQUFVO0FBQ2pCLFdBQUssR0FBTCxDQUFTLFVBQVQsRUFBcUIsUUFBckI7QUFDRDs7O2tDQUVhO0FBQ1osYUFBTyxLQUFLLEdBQUwsQ0FBUyxVQUFULENBQVA7QUFDRDs7Ozs7Ozs7O2lDQU1ZLFMsRUFBVztBQUN0QixVQUFNLG1CQUFtQixLQUFLLFlBQUwsRUFBekI7QUFDQSxVQUFJLEtBQUssYUFBTCxDQUFtQixnQkFBbkIsRUFBcUMsU0FBckMsQ0FBSixFQUFxRDtBQUNuRCxhQUFLLG9CQUFMO0FBQ0QsT0FGRCxNQUdLLElBQUksY0FBYyxLQUFLLE9BQW5CLElBQThCLHFCQUFxQixLQUFLLFFBQTVELEVBQXNFOztBQUV6RTtBQUNELE9BSEksTUFJQTtBQUNILGFBQUssR0FBTCxDQUFTLFdBQVQsRUFBc0IsU0FBdEI7QUFDRDtBQUNGOzs7Ozs7Ozs7Ozs7bUNBU2MsUyxFQUFXO0FBQ3hCLFVBQU0sbUJBQW1CLEtBQUssWUFBTCxFQUF6QjtBQUNBLFVBQUkscUJBQXFCLFNBQXpCLEVBQW9DO0FBQ2xDLGFBQUssSUFBTDtBQUNELE9BRkQsTUFHSyxJQUFJLHFCQUFxQixLQUFLLFFBQTlCLEVBQXdDO0FBQzNDLFlBQU0sV0FBVyxLQUFLLGlCQUFMLENBQXVCLFNBQXZCLENBQWpCO0FBQ0EsYUFBSyxHQUFMLENBQVMsV0FBVCxFQUFzQixRQUF0QjtBQUNELE9BSEksTUFJQTtBQUNILGNBQU0sSUFBSSxLQUFKLHFEQUE0RCxTQUE1RCxrQ0FBa0csZ0JBQWxHLE9BQU47QUFDRDtBQUNGOzs7b0NBRWU7QUFDZCxXQUFLLFlBQUwsQ0FBa0IsS0FBSyxTQUF2QjtBQUNEOzs7MkNBRXNCO0FBQ3JCLFdBQUssWUFBTCxDQUFrQixLQUFLLGdCQUF2QjtBQUNEOzs7MkJBRU07QUFDTCxXQUFLLFlBQUwsQ0FBa0IsS0FBSyxPQUF2QjtBQUNEOzs7MkNBRXNCO0FBQ3JCLFdBQUssWUFBTCxDQUFrQixLQUFLLFFBQXZCO0FBQ0Q7OzttQ0FrQmM7QUFDYixhQUFPLEtBQUssR0FBTCxDQUFTLFdBQVQsQ0FBUDtBQUNEOzs7NEJBRU8sSSxFQUFNO0FBQ1osV0FBSyxHQUFMLENBQVMsTUFBVCxFQUFpQixJQUFqQjtBQUNEOzs7OEJBRVM7QUFDUixhQUFPLEtBQUssR0FBTCxDQUFTLE1BQVQsQ0FBUDtBQUNEOzs7NkJBRVEsSyxFQUFPO0FBQ2QsV0FBSyxHQUFMLENBQVMsT0FBVCxFQUFrQixLQUFsQjtBQUNEOzs7K0JBVVU7QUFDVCxhQUFPLEtBQUssR0FBTCxDQUFTLE9BQVQsQ0FBUDtBQUNEOzs7d0JBMUNlO0FBQ2QsYUFBTyxLQUFLLFlBQUwsT0FBd0IsS0FBSyxPQUFwQztBQUNEOzs7d0JBRW1CO0FBQ2xCLGFBQU8sS0FBSyxZQUFMLE9BQXdCLEtBQUssUUFBcEM7QUFDRDs7O3dCQUV3QjtBQUN2QixhQUFPLEtBQUssWUFBTCxPQUF3QixLQUFLLFNBQXBDO0FBQ0Q7Ozt3QkFFK0I7QUFDOUIsYUFBTyxLQUFLLFlBQUwsT0FBd0IsS0FBSyxnQkFBcEM7QUFDRDs7O3dCQWtCYztBQUNiLGFBQU8sS0FBSyxRQUFMLE9BQW9CLEtBQUssWUFBaEM7QUFDRDs7O3dCQUVhO0FBQ1osYUFBTyxLQUFLLFFBQUwsT0FBb0IsS0FBSyxXQUFoQztBQUNEOzs7a0NBTW9CLFUsRUFBWSxVLEVBQVk7QUFDM0MsYUFBUSxlQUFlLEtBQUssU0FBcEIsSUFBaUMsZUFBZSxLQUFLLGdCQUF0RCxJQUE0RSxlQUFlLEtBQUssZ0JBQXBCLElBQXdDLGVBQWUsS0FBSyxTQUEvSTtBQUNEOzs7c0NBRXdCLFMsRUFBVztBQUNsQyxVQUFJLGNBQWMsS0FBSyxTQUF2QixFQUFrQztBQUNoQyxlQUFPLEtBQUssZ0JBQVo7QUFDRCxPQUZELE1BR0ssSUFBSSxjQUFjLEtBQUssZ0JBQXZCLEVBQXlDO0FBQzVDLGVBQU8sS0FBSyxTQUFaO0FBQ0QsT0FGSSxNQUdBO0FBQ0gsY0FBTSxJQUFJLEtBQUosNkNBQW9ELFNBQXBELE9BQU47QUFDRDtBQUNGOzs7O0VBM0krQixXOztBQUFiLEksQ0FDWixPLEdBQVUsUztBQURFLEksQ0FFWixTLEdBQVksVztBQUZBLEksQ0FHWixnQixHQUFtQixrQjtBQUhQLEksQ0FJWixRLEdBQVcsVTtBQUpDLEksQ0FNWixZLEdBQWUsUTtBQU5ILEksQ0FPWixXLEdBQWMsTztrQkFQRixJIiwiZmlsZSI6ImdhbWUtbG9naWMvdXRpbHMvZGlzay5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFRyYWNrZWREYXRhID0gcmVxdWlyZSgnLi90cmFja2VkLWRhdGEnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzayBleHRlbmRzIFRyYWNrZWREYXRhIHtcbiAgc3RhdGljIFNUT1BQRUQgPSBcInN0b3BwZWRcIjtcbiAgc3RhdGljIENMT0NLV0lTRSA9IFwiY2xvY2t3aXNlXCI7XG4gIHN0YXRpYyBDT1VOVEVSQ0xPQ0tXSVNFID0gXCJjb3VudGVyY2xvY2t3aXNlXCI7XG4gIHN0YXRpYyBDT05GTElDVCA9IFwiY29uZmxpY3RcIlxuXG4gIHN0YXRpYyBTVEFURV9IT01JTkcgPSBcImhvbWluZ1wiO1xuICBzdGF0aWMgU1RBVEVfUkVBRFkgPSBcInJlYWR5XCI7XG5cbiAgY29uc3RydWN0b3IocG9zaXRpb249MCwgZGlyZWN0aW9uPURpc2suU1RPUFBFRCkge1xuICAgIHN1cGVyKHtcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uLFxuICAgICAgdXNlcjogXCJcIixcbiAgICAgIHN0YXRlOiBEaXNrLlNUQVRFX1JFQURZXG4gICAgfSk7XG4gIH1cblxuICByb3RhdGVUbyhwb3NpdGlvbikge1xuICAgIHRoaXMuc2V0KCdwb3NpdGlvbicsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIGdldFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncG9zaXRpb24nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSBnaXZlbiBkaXJlY3Rpb24gdG8gdGhlIGRpc2ssIHNvbWV0aW1lcyByZXN1bHRpbmcgaW4gYSBjb25mbGljdCBpZiBkaXJlY3Rpb24gb3Bwb3NlcyB0aGUgY3VycmVudCBkaXJlY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvbiAtIFN0YXRpYyBkaXJlY3Rpb24gY29uc3RhbnQgZnJvbSBEaXNrXG4gICAqL1xuICBzZXREaXJlY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgY29uc3QgY3VycmVudERpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uKCk7XG4gICAgaWYgKERpc2suY29uZmxpY3RzV2l0aChjdXJyZW50RGlyZWN0aW9uLCBkaXJlY3Rpb24pKSB7XG4gICAgICB0aGlzLnNldERpcmVjdGlvbkNvbmZsaWN0KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGRpcmVjdGlvbiAhPT0gRGlzay5TVE9QUEVEICYmIGN1cnJlbnREaXJlY3Rpb24gPT09IERpc2suQ09ORkxJQ1QpIHtcbiAgICAgIC8vIE5vIG90aGVyIGRpcmVjdGlvbiBjYW4gYmUgc2V0IHdoaWxlIGNvbmZsaWN0aW5nIGV4Y2VwdCBmb3Igc3RvcFxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KCdkaXJlY3Rpb24nLCBkaXJlY3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVbi1hcHBsaWVzIGEgZGlyZWN0aW9uIChpbnN0ZWFkIG9mIGRpcmVjdGx5IHNldHRpbmcgaXQpXG4gICAqIFJlc29sdmVzIGNvbmZsaWN0cyB3aGVuIHRoZXkgYXJlIHByZXNlbnRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvbiAtIFN0YXRpYyBkaXJlY3Rpb24gY29uc3RhbnQgZnJvbSBEaXNrXG4gICAqICAgIEluIGdlbmVyYWwsIHRoaXMgZnVuY3Rpb24gc2hvdWxkIG9ubHkgYmUgdXNlZCB3aXRoIHRoZVxuICAgKiAgICBDTE9DS1dJU0UgYW5kIENPVU5URVJDTE9DS1dJU0UgZGlyZWN0aW9uc1xuICAgKi9cbiAgdW5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgY29uc3QgY3VycmVudERpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uKCk7XG4gICAgaWYgKGN1cnJlbnREaXJlY3Rpb24gPT09IGRpcmVjdGlvbikge1xuICAgICAgdGhpcy5zdG9wKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN1cnJlbnREaXJlY3Rpb24gPT09IERpc2suQ09ORkxJQ1QpIHtcbiAgICAgIGNvbnN0IG9wcG9zaXRlID0gRGlzay5vcHBvc2l0ZURpcmVjdGlvbihkaXJlY3Rpb24pO1xuICAgICAgdGhpcy5zZXQoJ2RpcmVjdGlvbicsIG9wcG9zaXRlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCByZWFzb24gYWJvdXQgaG93IHRvIHVuc2V0IGRpcmVjdGlvbiAnJHtkaXJlY3Rpb259JyBmcm9tIGN1cnJlbnQgZGlyZWN0aW9uICcke2N1cnJlbnREaXJlY3Rpb259J2ApO1xuICAgIH1cbiAgfVxuXG4gIHR1cm5DbG9ja3dpc2UoKSB7XG4gICAgdGhpcy5zZXREaXJlY3Rpb24oRGlzay5DTE9DS1dJU0UpO1xuICB9XG5cbiAgdHVybkNvdW50ZXJjbG9ja3dpc2UoKSB7XG4gICAgdGhpcy5zZXREaXJlY3Rpb24oRGlzay5DT1VOVEVSQ0xPQ0tXSVNFKTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5zZXREaXJlY3Rpb24oRGlzay5TVE9QUEVEKTtcbiAgfVxuXG4gIHNldERpcmVjdGlvbkNvbmZsaWN0KCkge1xuICAgIHRoaXMuc2V0RGlyZWN0aW9uKERpc2suQ09ORkxJQ1QpO1xuICB9XG5cbiAgZ2V0IGlzU3RvcHBlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXREaXJlY3Rpb24oKSA9PT0gRGlzay5TVE9QUEVEO1xuICB9XG5cbiAgZ2V0IGlzQ29uZmxpY3RpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlyZWN0aW9uKCkgPT09IERpc2suQ09ORkxJQ1Q7XG4gIH1cblxuICBnZXQgaXNUdXJuaW5nQ2xvY2t3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbigpID09PSBEaXNrLkNMT0NLV0lTRTtcbiAgfVxuXG4gIGdldCBpc1R1cm5pbmdDb3VudGVyY2xvY2t3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbigpID09PSBEaXNrLkNPVU5URVJDTE9DS1dJU0U7XG4gIH1cblxuICBnZXREaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkaXJlY3Rpb24nKTtcbiAgfVxuXG4gIHNldFVzZXIodXNlcikge1xuICAgIHRoaXMuc2V0KCd1c2VyJywgdXNlcik7XG4gIH1cblxuICBnZXRVc2VyKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpO1xuICB9XG5cbiAgc2V0U3RhdGUoc3RhdGUpIHtcbiAgICB0aGlzLnNldCgnc3RhdGUnLCBzdGF0ZSk7XG4gIH1cblxuICBnZXQgaXNIb21pbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKSA9PT0gRGlzay5TVEFURV9IT01JTkc7XG4gIH1cblxuICBnZXQgaXNSZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpID09PSBEaXNrLlNUQVRFX1JFQURZO1xuICB9XG5cbiAgZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdzdGF0ZScpO1xuICB9XG5cbiAgc3RhdGljIGNvbmZsaWN0c1dpdGgoZGlyZWN0aW9uMSwgZGlyZWN0aW9uMikge1xuICAgIHJldHVybiAoZGlyZWN0aW9uMSA9PT0gRGlzay5DTE9DS1dJU0UgJiYgZGlyZWN0aW9uMiA9PT0gRGlzay5DT1VOVEVSQ0xPQ0tXSVNFKSB8fCAoZGlyZWN0aW9uMSA9PT0gRGlzay5DT1VOVEVSQ0xPQ0tXSVNFICYmIGRpcmVjdGlvbjIgPT09IERpc2suQ0xPQ0tXSVNFKTtcbiAgfVxuXG4gIHN0YXRpYyBvcHBvc2l0ZURpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBEaXNrLkNMT0NLV0lTRSkge1xuICAgICAgcmV0dXJuIERpc2suQ09VTlRFUkNMT0NLV0lTRTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSBEaXNrLkNPVU5URVJDTE9DS1dJU0UpIHtcbiAgICAgIHJldHVybiBEaXNrLkNMT0NLV0lTRTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXNvbHZlIG9wcG9zaXRlIGZvciBkaXJlY3Rpb24gJyR7ZGlyZWN0aW9ufSdgKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
