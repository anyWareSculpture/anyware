'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Default Configuration
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Extend the class exported from this module to create your own local
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * configuration objects or use this directly.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A configuration file is any ES6 file that exports a single default
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * object containing all of the configuration options.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Avoid requiring this file into any file that might need this one.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * In general game logic should never need this, a config object should
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * be passed around through constructors.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Try to keep the structure as flat as possible while grouping things logically
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _colors = require('../constants/colors');

var _colors2 = _interopRequireDefault(_colors);

var _games = require('../constants/games');

var _games2 = _interopRequireDefault(_games);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DefaultConfig = function () {
  function DefaultConfig() {
    var _USERS, _PANELS;

    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$username = _ref.username;
    var username = _ref$username === undefined ? "" : _ref$username;
    var _ref$user = _ref.user0;
    var user0 = _ref$user === undefined ? "sculpture0" : _ref$user;
    var _ref$user2 = _ref.user1;
    var user1 = _ref$user2 === undefined ? "sculpture1" : _ref$user2;
    var _ref$user3 = _ref.user2;
    var user2 = _ref$user3 === undefined ? "sculpture2" : _ref$user3;

    _classCallCheck(this, DefaultConfig);

    this.user0 = user0;
    this.user1 = user1;
    this.user2 = user2;

    // The username of the current user
    this.username = username || user0;

    // A mapping between usernames and the colors that represent them
    this.COLORS = {
      USERS: (_USERS = {}, _defineProperty(_USERS, this.user0, _colors2.default.USER0), _defineProperty(_USERS, this.user1, _colors2.default.USER1), _defineProperty(_USERS, this.user2, _colors2.default.USER2), _USERS),
      ERROR: 'error'
    };

    // The sequence of the games to be run. The first game is run on startup
    this.GAMES_SEQUENCE = [_games2.default.HANDSHAKE, _games2.default.MOLE, _games2.default.DISK, _games2.default.SIMON];

    /******* LIGHTS  ********************/
    this.LIGHTS = {
      // Name : strip Id (corresponds to hardware)
      STRIP_A: '0',
      STRIP_B: '1',
      STRIP_C: '2',
      PERIMETER_STRIP: '3',
      DISK_LIGHT_STRIP: '4',
      HANDSHAKE_STRIP: '5',
      ART_LIGHTS_STRIP: '6'
    };
    this.LIGHTS.GAME_STRIPS = [this.LIGHTS.STRIP_A, this.LIGHTS.STRIP_B, this.LIGHTS.STRIP_C];
    this.PANELS = (_PANELS = {}, _defineProperty(_PANELS, this.LIGHTS.STRIP_A, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']), _defineProperty(_PANELS, this.LIGHTS.STRIP_B, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']), _defineProperty(_PANELS, this.LIGHTS.STRIP_C, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']), _PANELS);

    // These settings effect the default behaviour of panels outside of
    // any custom logic in any of the games
    this.PANEL_DEFAULTS = {
      ACTIVE_INTENSITY: 100,
      INACTIVE_INTENSITY: 0
    };

    /******* GAMES CONFIGURATION *******/

    this.HANDSHAKE_GAME = {
      TRANSITION_OUT_TIME: 4000 // Time (ms) from handshake is touched until we start the next game
    };
    this.MOLE_GAME = {
      GAME_END: 30,
      INITIAL_PANELS: [{ stripId: this.LIGHTS.STRIP_A, panelId: '3' }, { stripId: this.LIGHTS.STRIP_A, panelId: '7' }, { stripId: this.LIGHTS.STRIP_C, panelId: '6' }, { stripId: this.LIGHTS.STRIP_B, panelId: '5' }],
      NUM_ACTIVE_PANELS: {
        10: 1, // At panelCount of 10, increase # of simultaneusly active panels
        20: 1,
        25: -1, // At panelCount of 25, decrease # of simultaneusly active panels
        27: -1
      },
      PANEL_LIFETIME: [{ count: 0, range: [10, 10] }, // Initial timeout
      { count: 4, range: [4, 6] }, // At panelCount of 4, set panel lifetime to 4-6 seconds. Gradually interpolate to next timeout level
      { count: 20, range: [2, 3] }, { count: 30, range: [1.5, 2] }],
      // How long to wait before enabling the next panel, on success
      PANEL_SUCCESS_DELAY: 1000,
      // How long to wait before enabling the next panel, on automatic panel move
      PANEL_MOVE_DELAY: 200,
      // The intensity to use on active panels
      ACTIVE_PANEL_INTENSITY: 100,
      // The intensity to use on inactive panels
      INACTIVE_PANEL_INTENSITY: 0,
      // The intensity to use on ignored panels (panels turned to location color)
      COLORED_PANEL_INTENSITY: 75,
      // We don't use failure sounds in the default setup due to too many accidental touches
      ENABLE_FAILURE_SOUND: false
    };

    this.DISK_GAME = {
      // The user will wins when they reach these positions for each diskId.
      RELATIVE_TOLERANCE: 5, // degrees tolerance for disks relative to each other
      ABSOLUTE_TOLERANCE: 8, // degrees tolerance for the absolute disk positions
      // The intensity of the panels that the user can use to play the sequence
      CONTROL_PANEL_INTENSITY: 20,
      ACTIVE_CONTROL_PANEL_INTENSITY: 100,
      ACTIVE_PERIMETER_INTENSITY: 100,
      INACTIVE_PERIMETER_INTENSITY: 50, // Inactive: when turned to location color
      PERIMETER_COLOR: "white",
      SHADOW_LIGHTS: {
        // stripId: [panelId..]
        '6': ['0', '1', '2']
      },
      SHADOW_LIGHT_INTENSITY: 100,
      LEVELS: [
      // level 0
      // disks: { diskId: target position }
      // perimeter: { stripId: [panelIds..] }
      { disks: { disk2: 52, disk1: 317, disk0: 316 },
        perimeter: _defineProperty({}, this.LIGHTS.PERIMETER_STRIP, ['0', '4'])
      },
      // level 1
      { disks: { disk2: 66, disk1: 287, disk0: 308 },
        perimeter: _defineProperty({}, this.LIGHTS.PERIMETER_STRIP, ['1', '3'])
      },
      // level 2
      { disks: { disk2: 286, disk1: 335, disk0: 240 },
        perimeter: _defineProperty({}, this.LIGHTS.PERIMETER_STRIP, ['2', '5'])
      }],
      LIGHT_MAPPING: {
        // diskId: { stripId: panelId }
        disk0: _defineProperty({}, this.LIGHTS.DISK_LIGHT_STRIP, '0'),
        disk1: _defineProperty({}, this.LIGHTS.DISK_LIGHT_STRIP, '1'),
        disk2: _defineProperty({}, this.LIGHTS.DISK_LIGHT_STRIP, '2')
      },
      CONTROL_MAPPINGS: {
        CLOCKWISE_STRIP: this.LIGHTS.STRIP_C,
        COUNTERCLOCKWISE_STRIP: this.LIGHTS.STRIP_A,

        CLOCKWISE_PANELS: {
          // diskId : [panelId1, ...]
          disk0: ['1'],
          disk1: ['3'],
          disk2: ['5']
        },
        COUNTERCLOCKWISE_PANELS: {
          disk0: ['1'],
          disk1: ['3'],
          disk2: ['5']
        }
      }
    };

    this.SIMON_GAME = {
      PATTERN_LEVELS: [
      // level 0 sequence
      {
        stripId: this.LIGHTS.STRIP_A,
        // Each array of panel IDs is lit up one at a time
        // Each array within this array is called a "frame" in the "sequence"
        panelSequence: [['3'], ['5'], ['7']],
        frameDelay: 750 // Overriding default frame delay to make first level slower
      },
      // level 1 sequence
      {
        stripId: '1',
        panelSequence: [['1'], ['8'], ['5']]
      },
      // level 2 sequence
      {
        stripId: '2',
        panelSequence: [['3'], ['6'], ['2'], ['9']]
      }],
      // The intensity of the panels when they are pressed or when the sequence is playing
      TARGET_PANEL_INTENSITY: 100,
      // The intensity of the panels that the user can use to play the sequence
      AVAILABLE_PANEL_INTENSITY: 1,
      // The delay in ms between sequence frames
      SEQUENCE_ANIMATION_FRAME_DELAY: 500,
      // The delay in ms to wait before replaying the sequence
      // Only replayed if no input is received from the user
      DELAY_BETWEEN_PLAYS: 5000,
      // The time after input to wait for the user to finish the sequence
      INPUT_TIMEOUT: 10000,
      // The default color to set the panels to when
      DEFAULT_SIMON_PANEL_COLOR: "white",
      // Wait while playing final sound
      TRANSITION_OUT_TIME: 10000
    };
  }

  _createClass(DefaultConfig, [{
    key: 'getUserColor',
    value: function getUserColor(username) {
      return this.COLORS.USERS[username];
    }
  }]);

  return DefaultConfig;
}();

exports.default = DefaultConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhbWUtbG9naWMvY29uZmlnL2RlZmF1bHQtY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWVBOzs7O0FBQ0E7Ozs7Ozs7Ozs7SUFFcUIsYTtBQUNuQiwyQkFLUTtBQUFBOztBQUFBLHFFQUFKLEVBQUk7O0FBQUEsNkJBSkosUUFJSTtBQUFBLFFBSkosUUFJSSxpQ0FKSyxFQUlMO0FBQUEseUJBSEosS0FHSTtBQUFBLFFBSEosS0FHSSw2QkFIRSxZQUdGO0FBQUEsMEJBRkosS0FFSTtBQUFBLFFBRkosS0FFSSw4QkFGRSxZQUVGO0FBQUEsMEJBREosS0FDSTtBQUFBLFFBREosS0FDSSw4QkFERSxZQUNGOztBQUFBOztBQUNOLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsU0FBSyxLQUFMLEdBQWEsS0FBYjs7O0FBR0EsU0FBSyxRQUFMLEdBQWdCLFlBQVksS0FBNUI7OztBQUdBLFNBQUssTUFBTCxHQUFjO0FBQ1osbURBRUcsS0FBSyxLQUZSLEVBRWdCLGlCQUFPLEtBRnZCLDJCQUdHLEtBQUssS0FIUixFQUdnQixpQkFBTyxLQUh2QiwyQkFJRyxLQUFLLEtBSlIsRUFJZ0IsaUJBQU8sS0FKdkIsVUFEWTtBQU9aLGFBQU87QUFQSyxLQUFkOzs7QUFXQSxTQUFLLGNBQUwsR0FBc0IsQ0FDcEIsZ0JBQU0sU0FEYyxFQUVwQixnQkFBTSxJQUZjLEVBR3BCLGdCQUFNLElBSGMsRUFJcEIsZ0JBQU0sS0FKYyxDQUF0Qjs7O0FBUUEsU0FBSyxNQUFMLEdBQWM7O0FBRVosZUFBUyxHQUZHO0FBR1osZUFBUyxHQUhHO0FBSVosZUFBUyxHQUpHO0FBS1osdUJBQWlCLEdBTEw7QUFNWix3QkFBa0IsR0FOTjtBQU9aLHVCQUFpQixHQVBMO0FBUVosd0JBQWtCO0FBUk4sS0FBZDtBQVVBLFNBQUssTUFBTCxDQUFZLFdBQVosR0FBMEIsQ0FDeEIsS0FBSyxNQUFMLENBQVks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QUFELENBQWYsQ0FKakI7QUFLRSxvQkFBWSxHO0FBTGQsT0FGYzs7QUFVZDtBQUNFLGlCQUFTLEdBRFg7QUFFRSx1QkFBZSxDQUFDLENBQUMsR0FBRCxDQUFELEVBQVEsQ0FBQyxHQUFELENBQVIsRUFBZSxDQUFDLEdBQUQsQ0FBZjtBQUZqQixPQVZjOztBQWVkO0FBQ0UsaUJBQVMsR0FEWDtBQUVFLHVCQUFlLENBQUMsQ0FBQyxHQUFELENBQUQsRUFBUSxDQUFDLEdBQUQsQ0FBUixFQUFlLENBQUMsR0FBRCxDQUFmLEVBQXNCLENBQUMsR0FBRCxDQUF0QjtBQUZqQixPQWZjLENBREE7O0FBc0JoQiw4QkFBd0IsR0F0QlI7O0FBd0JoQixpQ0FBMkIsQ0F4Qlg7O0FBMEJoQixzQ0FBZ0MsR0ExQmhCOzs7QUE2QmhCLDJCQUFxQixJQTdCTDs7QUErQmhCLHFCQUFlLEtBL0JDOztBQWlDaEIsaUNBQTJCLE9BakNYOztBQW1DaEIsMkJBQXFCO0FBbkNMLEtBQWxCO0FBcUNEOzs7O2lDQUVZLFEsRUFBVTtBQUNyQixhQUFPLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsUUFBbEIsQ0FBUDtBQUNEOzs7Ozs7a0JBdE1rQixhIiwiZmlsZSI6ImdhbWUtbG9naWMvY29uZmlnL2RlZmF1bHQtY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBEZWZhdWx0IENvbmZpZ3VyYXRpb25cbiAqXG4gKiBFeHRlbmQgdGhlIGNsYXNzIGV4cG9ydGVkIGZyb20gdGhpcyBtb2R1bGUgdG8gY3JlYXRlIHlvdXIgb3duIGxvY2FsXG4gKiBjb25maWd1cmF0aW9uIG9iamVjdHMgb3IgdXNlIHRoaXMgZGlyZWN0bHkuXG4gKiBBIGNvbmZpZ3VyYXRpb24gZmlsZSBpcyBhbnkgRVM2IGZpbGUgdGhhdCBleHBvcnRzIGEgc2luZ2xlIGRlZmF1bHRcbiAqIG9iamVjdCBjb250YWluaW5nIGFsbCBvZiB0aGUgY29uZmlndXJhdGlvbiBvcHRpb25zLlxuICpcbiAqIEF2b2lkIHJlcXVpcmluZyB0aGlzIGZpbGUgaW50byBhbnkgZmlsZSB0aGF0IG1pZ2h0IG5lZWQgdGhpcyBvbmUuXG4gKiBJbiBnZW5lcmFsIGdhbWUgbG9naWMgc2hvdWxkIG5ldmVyIG5lZWQgdGhpcywgYSBjb25maWcgb2JqZWN0IHNob3VsZFxuICogYmUgcGFzc2VkIGFyb3VuZCB0aHJvdWdoIGNvbnN0cnVjdG9ycy5cbiAqXG4gKiBUcnkgdG8ga2VlcCB0aGUgc3RydWN0dXJlIGFzIGZsYXQgYXMgcG9zc2libGUgd2hpbGUgZ3JvdXBpbmcgdGhpbmdzIGxvZ2ljYWxseVxuICovXG5cbmltcG9ydCBDT0xPUlMgZnJvbSAnLi4vY29uc3RhbnRzL2NvbG9ycyc7XG5pbXBvcnQgR0FNRVMgZnJvbSAnLi4vY29uc3RhbnRzL2dhbWVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmYXVsdENvbmZpZyB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICAgIHVzZXJuYW1lPVwiXCIsXG4gICAgICB1c2VyMD1cInNjdWxwdHVyZTBcIixcbiAgICAgIHVzZXIxPVwic2N1bHB0dXJlMVwiLFxuICAgICAgdXNlcjI9XCJzY3VscHR1cmUyXCJcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy51c2VyMCA9IHVzZXIwO1xuICAgIHRoaXMudXNlcjEgPSB1c2VyMTtcbiAgICB0aGlzLnVzZXIyID0gdXNlcjI7XG5cbiAgICAvLyBUaGUgdXNlcm5hbWUgb2YgdGhlIGN1cnJlbnQgdXNlclxuICAgIHRoaXMudXNlcm5hbWUgPSB1c2VybmFtZSB8fCB1c2VyMDtcblxuICAgIC8vIEEgbWFwcGluZyBiZXR3ZWVuIHVzZXJuYW1lcyBhbmQgdGhlIGNvbG9ycyB0aGF0IHJlcHJlc2VudCB0aGVtXG4gICAgdGhpcy5DT0xPUlMgPSB7XG4gICAgICBVU0VSUzoge1xuICAgICAgICAvLyB1c2VybmFtZSA6IGNvbG9yXG4gICAgICAgIFt0aGlzLnVzZXIwXTogQ09MT1JTLlVTRVIwLFxuICAgICAgICBbdGhpcy51c2VyMV06IENPTE9SUy5VU0VSMSxcbiAgICAgICAgW3RoaXMudXNlcjJdOiBDT0xPUlMuVVNFUjJcbiAgICAgIH0sXG4gICAgICBFUlJPUjogJ2Vycm9yJ1xuICAgIH07XG5cbiAgICAvLyBUaGUgc2VxdWVuY2Ugb2YgdGhlIGdhbWVzIHRvIGJlIHJ1bi4gVGhlIGZpcnN0IGdhbWUgaXMgcnVuIG9uIHN0YXJ0dXBcbiAgICB0aGlzLkdBTUVTX1NFUVVFTkNFID0gW1xuICAgICAgR0FNRVMuSEFORFNIQUtFLFxuICAgICAgR0FNRVMuTU9MRSxcbiAgICAgIEdBTUVTLkRJU0ssXG4gICAgICBHQU1FUy5TSU1PTlxuICAgIF07XG5cbiAgICAvKioqKioqKiBMSUdIVFMgICoqKioqKioqKioqKioqKioqKioqL1xuICAgIHRoaXMuTElHSFRTID0ge1xuICAgICAgLy8gTmFtZSA6IHN0cmlwIElkIChjb3JyZXNwb25kcyB0byBoYXJkd2FyZSlcbiAgICAgIFNUUklQX0E6ICcwJyxcbiAgICAgIFNUUklQX0I6ICcxJyxcbiAgICAgIFNUUklQX0M6ICcyJyxcbiAgICAgIFBFUklNRVRFUl9TVFJJUDogJzMnLFxuICAgICAgRElTS19MSUdIVF9TVFJJUDogJzQnLFxuICAgICAgSEFORFNIQUtFX1NUUklQOiAnNScsXG4gICAgICBBUlRfTElHSFRTX1NUUklQOiAnNidcbiAgICB9O1xuICAgIHRoaXMuTElHSFRTLkdBTUVfU1RSSVBTID0gW1xuICAgICAgdGhpcy5MSUdIVFMuU1RSSVBfQSxcbiAgICAgIHRoaXMuTElHSFRTLlNUUklQX0IsXG4gICAgICB0aGlzLkxJR0hUUy5TVFJJUF9DXG4gICAgXTtcbiAgICB0aGlzLlBBTkVMUyA9IHtcbiAgICAgIC8vIHN0cmlwSWQgOiBbYWxsIGFzc29jaWF0ZWQgcGFuZWwgSWRzXVxuICAgICAgW3RoaXMuTElHSFRTLlNUUklQX0FdOiBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknXSxcbiAgICAgIFt0aGlzLkxJR0hUUy5TVFJJUF9CXTogWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5J10sXG4gICAgICBbdGhpcy5MSUdIVFMuU1RSSVBfQ106IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOSddXG4gICAgfTtcblxuICAgIC8vIFRoZXNlIHNldHRpbmdzIGVmZmVjdCB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgb2YgcGFuZWxzIG91dHNpZGUgb2ZcbiAgICAvLyBhbnkgY3VzdG9tIGxvZ2ljIGluIGFueSBvZiB0aGUgZ2FtZXNcbiAgICB0aGlzLlBBTkVMX0RFRkFVTFRTID0ge1xuICAgICAgQUNUSVZFX0lOVEVOU0lUWTogMTAwLFxuICAgICAgSU5BQ1RJVkVfSU5URU5TSVRZOiAwXG4gICAgfTtcblxuICAgIC8qKioqKioqIEdBTUVTIENPTkZJR1VSQVRJT04gKioqKioqKi9cblxuICAgIHRoaXMuSEFORFNIQUtFX0dBTUUgPSB7XG4gICAgICBUUkFOU0lUSU9OX09VVF9USU1FOiA0MDAwIC8vIFRpbWUgKG1zKSBmcm9tIGhhbmRzaGFrZSBpcyB0b3VjaGVkIHVudGlsIHdlIHN0YXJ0IHRoZSBuZXh0IGdhbWVcbiAgICB9O1xuICAgIHRoaXMuTU9MRV9HQU1FID0ge1xuICAgICAgR0FNRV9FTkQ6IDMwLFxuICAgICAgSU5JVElBTF9QQU5FTFM6IFtcbiAgICAgICAge3N0cmlwSWQ6IHRoaXMuTElHSFRTLlNUUklQX0EsIHBhbmVsSWQ6ICczJ30sXG4gICAgICAgIHtzdHJpcElkOiB0aGlzLkxJR0hUUy5TVFJJUF9BLCBwYW5lbElkOiAnNyd9LFxuICAgICAgICB7c3RyaXBJZDogdGhpcy5MSUdIVFMuU1RSSVBfQywgcGFuZWxJZDogJzYnfSxcbiAgICAgICAge3N0cmlwSWQ6IHRoaXMuTElHSFRTLlNUUklQX0IsIHBhbmVsSWQ6ICc1J31cbiAgICAgIF0sXG4gICAgICBOVU1fQUNUSVZFX1BBTkVMUzoge1xuICAgICAgICAxMDogMSwgLy8gQXQgcGFuZWxDb3VudCBvZiAxMCwgaW5jcmVhc2UgIyBvZiBzaW11bHRhbmV1c2x5IGFjdGl2ZSBwYW5lbHNcbiAgICAgICAgMjA6IDEsXG4gICAgICAgIDI1OiAtMSwgLy8gQXQgcGFuZWxDb3VudCBvZiAyNSwgZGVjcmVhc2UgIyBvZiBzaW11bHRhbmV1c2x5IGFjdGl2ZSBwYW5lbHNcbiAgICAgICAgMjc6IC0xXG4gICAgICB9LFxuICAgICAgUEFORUxfTElGRVRJTUU6IFtcbiAgICAgICAge2NvdW50OiAwLCByYW5nZTogWzEwLCAxMF19LCAvLyBJbml0aWFsIHRpbWVvdXRcbiAgICAgICAge2NvdW50OiA0LCByYW5nZTogWzQsIDZdfSwgLy8gQXQgcGFuZWxDb3VudCBvZiA0LCBzZXQgcGFuZWwgbGlmZXRpbWUgdG8gNC02IHNlY29uZHMuIEdyYWR1YWxseSBpbnRlcnBvbGF0ZSB0byBuZXh0IHRpbWVvdXQgbGV2ZWxcbiAgICAgICAge2NvdW50OiAyMCwgcmFuZ2U6IFsyLCAzXX0sXG4gICAgICAgIHtjb3VudDogMzAsIHJhbmdlOiBbMS41LCAyXX1cbiAgICAgIF0sXG4gICAgICAvLyBIb3cgbG9uZyB0byB3YWl0IGJlZm9yZSBlbmFibGluZyB0aGUgbmV4dCBwYW5lbCwgb24gc3VjY2Vzc1xuICAgICAgUEFORUxfU1VDQ0VTU19ERUxBWTogMTAwMCxcbiAgICAgIC8vIEhvdyBsb25nIHRvIHdhaXQgYmVmb3JlIGVuYWJsaW5nIHRoZSBuZXh0IHBhbmVsLCBvbiBhdXRvbWF0aWMgcGFuZWwgbW92ZVxuICAgICAgUEFORUxfTU9WRV9ERUxBWTogMjAwLFxuICAgICAgLy8gVGhlIGludGVuc2l0eSB0byB1c2Ugb24gYWN0aXZlIHBhbmVsc1xuICAgICAgQUNUSVZFX1BBTkVMX0lOVEVOU0lUWTogMTAwLFxuICAgICAgLy8gVGhlIGludGVuc2l0eSB0byB1c2Ugb24gaW5hY3RpdmUgcGFuZWxzXG4gICAgICBJTkFDVElWRV9QQU5FTF9JTlRFTlNJVFk6IDAsXG4gICAgICAvLyBUaGUgaW50ZW5zaXR5IHRvIHVzZSBvbiBpZ25vcmVkIHBhbmVscyAocGFuZWxzIHR1cm5lZCB0byBsb2NhdGlvbiBjb2xvcilcbiAgICAgIENPTE9SRURfUEFORUxfSU5URU5TSVRZOiA3NSxcbiAgICAgIC8vIFdlIGRvbid0IHVzZSBmYWlsdXJlIHNvdW5kcyBpbiB0aGUgZGVmYXVsdCBzZXR1cCBkdWUgdG8gdG9vIG1hbnkgYWNjaWRlbnRhbCB0b3VjaGVzXG4gICAgICBFTkFCTEVfRkFJTFVSRV9TT1VORDogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5ESVNLX0dBTUUgPSB7XG4gICAgICAvLyBUaGUgdXNlciB3aWxsIHdpbnMgd2hlbiB0aGV5IHJlYWNoIHRoZXNlIHBvc2l0aW9ucyBmb3IgZWFjaCBkaXNrSWQuXG4gICAgICBSRUxBVElWRV9UT0xFUkFOQ0U6IDUsIC8vIGRlZ3JlZXMgdG9sZXJhbmNlIGZvciBkaXNrcyByZWxhdGl2ZSB0byBlYWNoIG90aGVyXG4gICAgICBBQlNPTFVURV9UT0xFUkFOQ0U6IDgsIC8vIGRlZ3JlZXMgdG9sZXJhbmNlIGZvciB0aGUgYWJzb2x1dGUgZGlzayBwb3NpdGlvbnNcbiAgICAgIC8vIFRoZSBpbnRlbnNpdHkgb2YgdGhlIHBhbmVscyB0aGF0IHRoZSB1c2VyIGNhbiB1c2UgdG8gcGxheSB0aGUgc2VxdWVuY2VcbiAgICAgIENPTlRST0xfUEFORUxfSU5URU5TSVRZOiAyMCxcbiAgICAgIEFDVElWRV9DT05UUk9MX1BBTkVMX0lOVEVOU0lUWTogMTAwLFxuICAgICAgQUNUSVZFX1BFUklNRVRFUl9JTlRFTlNJVFk6IDEwMCxcbiAgICAgIElOQUNUSVZFX1BFUklNRVRFUl9JTlRFTlNJVFk6IDUwLCAvLyBJbmFjdGl2ZTogd2hlbiB0dXJuZWQgdG8gbG9jYXRpb24gY29sb3JcbiAgICAgIFBFUklNRVRFUl9DT0xPUjogXCJ3aGl0ZVwiLFxuICAgICAgU0hBRE9XX0xJR0hUUzoge1xuICAgICAgICAvLyBzdHJpcElkOiBbcGFuZWxJZC4uXVxuICAgICAgICAnNic6IFsnMCcsICcxJywgJzInXVxuICAgICAgfSxcbiAgICAgIFNIQURPV19MSUdIVF9JTlRFTlNJVFk6IDEwMCxcbiAgICAgIExFVkVMUzogW1xuICAgICAgICAvLyBsZXZlbCAwXG4gICAgICAgIC8vIGRpc2tzOiB7IGRpc2tJZDogdGFyZ2V0IHBvc2l0aW9uIH1cbiAgICAgICAgLy8gcGVyaW1ldGVyOiB7IHN0cmlwSWQ6IFtwYW5lbElkcy4uXSB9XG4gICAgICAgIHsgZGlza3M6ICAgICB7IGRpc2syOiA1MiwgZGlzazE6IDMxNywgZGlzazA6IDMxNiB9LFxuICAgICAgICAgIHBlcmltZXRlcjogeyBbdGhpcy5MSUdIVFMuUEVSSU1FVEVSX1NUUklQXTogWycwJywgJzQnXSB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIGxldmVsIDFcbiAgICAgICAgeyBkaXNrczogICAgIHsgZGlzazI6IDY2LCBkaXNrMTogMjg3LCBkaXNrMDogMzA4IH0sXG4gICAgICAgICAgcGVyaW1ldGVyOiB7IFt0aGlzLkxJR0hUUy5QRVJJTUVURVJfU1RSSVBdOiBbJzEnLCAnMyddIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gbGV2ZWwgMlxuICAgICAgICB7IGRpc2tzOiAgICAgeyBkaXNrMjogMjg2LCBkaXNrMTogMzM1LCBkaXNrMDogMjQwIH0sXG4gICAgICAgICAgcGVyaW1ldGVyOiB7IFt0aGlzLkxJR0hUUy5QRVJJTUVURVJfU1RSSVBdOiBbJzInLCAnNSddIH1cbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIExJR0hUX01BUFBJTkc6IHtcbiAgICAgICAgLy8gZGlza0lkOiB7IHN0cmlwSWQ6IHBhbmVsSWQgfVxuICAgICAgICBkaXNrMDogeyBbdGhpcy5MSUdIVFMuRElTS19MSUdIVF9TVFJJUF06ICcwJyB9LFxuICAgICAgICBkaXNrMTogeyBbdGhpcy5MSUdIVFMuRElTS19MSUdIVF9TVFJJUF06ICcxJyB9LFxuICAgICAgICBkaXNrMjogeyBbdGhpcy5MSUdIVFMuRElTS19MSUdIVF9TVFJJUF06ICcyJyB9XG4gICAgICB9LFxuICAgICAgQ09OVFJPTF9NQVBQSU5HUzoge1xuICAgICAgICBDTE9DS1dJU0VfU1RSSVA6IHRoaXMuTElHSFRTLlNUUklQX0MsXG4gICAgICAgIENPVU5URVJDTE9DS1dJU0VfU1RSSVA6IHRoaXMuTElHSFRTLlNUUklQX0EsXG5cbiAgICAgICAgQ0xPQ0tXSVNFX1BBTkVMUzoge1xuICAgICAgICAgIC8vIGRpc2tJZCA6IFtwYW5lbElkMSwgLi4uXVxuICAgICAgICAgIGRpc2swOiBbJzEnXSxcbiAgICAgICAgICBkaXNrMTogWyczJ10sXG4gICAgICAgICAgZGlzazI6IFsnNSddXG4gICAgICAgIH0sXG4gICAgICAgIENPVU5URVJDTE9DS1dJU0VfUEFORUxTOiB7XG4gICAgICAgICAgZGlzazA6IFsnMSddLFxuICAgICAgICAgIGRpc2sxOiBbJzMnXSxcbiAgICAgICAgICBkaXNrMjogWyc1J11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLlNJTU9OX0dBTUUgPSB7XG4gICAgICBQQVRURVJOX0xFVkVMUzogW1xuICAgICAgICAvLyBsZXZlbCAwIHNlcXVlbmNlXG4gICAgICAgIHtcbiAgICAgICAgICBzdHJpcElkOiB0aGlzLkxJR0hUUy5TVFJJUF9BLFxuICAgICAgICAgIC8vIEVhY2ggYXJyYXkgb2YgcGFuZWwgSURzIGlzIGxpdCB1cCBvbmUgYXQgYSB0aW1lXG4gICAgICAgICAgLy8gRWFjaCBhcnJheSB3aXRoaW4gdGhpcyBhcnJheSBpcyBjYWxsZWQgYSBcImZyYW1lXCIgaW4gdGhlIFwic2VxdWVuY2VcIlxuICAgICAgICAgIHBhbmVsU2VxdWVuY2U6IFtbJzMnXSwgWyc1J10sIFsnNyddXSxcbiAgICAgICAgICBmcmFtZURlbGF5OiA3NTAgLy8gT3ZlcnJpZGluZyBkZWZhdWx0IGZyYW1lIGRlbGF5IHRvIG1ha2UgZmlyc3QgbGV2ZWwgc2xvd2VyXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGxldmVsIDEgc2VxdWVuY2VcbiAgICAgICAge1xuICAgICAgICAgIHN0cmlwSWQ6ICcxJyxcbiAgICAgICAgICBwYW5lbFNlcXVlbmNlOiBbWycxJ10sIFsnOCddLCBbJzUnXV1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gbGV2ZWwgMiBzZXF1ZW5jZVxuICAgICAgICB7XG4gICAgICAgICAgc3RyaXBJZDogJzInLFxuICAgICAgICAgIHBhbmVsU2VxdWVuY2U6IFtbJzMnXSwgWyc2J10sIFsnMiddLCBbJzknXV1cbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIC8vIFRoZSBpbnRlbnNpdHkgb2YgdGhlIHBhbmVscyB3aGVuIHRoZXkgYXJlIHByZXNzZWQgb3Igd2hlbiB0aGUgc2VxdWVuY2UgaXMgcGxheWluZ1xuICAgICAgVEFSR0VUX1BBTkVMX0lOVEVOU0lUWTogMTAwLFxuICAgICAgLy8gVGhlIGludGVuc2l0eSBvZiB0aGUgcGFuZWxzIHRoYXQgdGhlIHVzZXIgY2FuIHVzZSB0byBwbGF5IHRoZSBzZXF1ZW5jZVxuICAgICAgQVZBSUxBQkxFX1BBTkVMX0lOVEVOU0lUWTogMSxcbiAgICAgIC8vIFRoZSBkZWxheSBpbiBtcyBiZXR3ZWVuIHNlcXVlbmNlIGZyYW1lc1xuICAgICAgU0VRVUVOQ0VfQU5JTUFUSU9OX0ZSQU1FX0RFTEFZOiA1MDAsXG4gICAgICAvLyBUaGUgZGVsYXkgaW4gbXMgdG8gd2FpdCBiZWZvcmUgcmVwbGF5aW5nIHRoZSBzZXF1ZW5jZVxuICAgICAgLy8gT25seSByZXBsYXllZCBpZiBubyBpbnB1dCBpcyByZWNlaXZlZCBmcm9tIHRoZSB1c2VyXG4gICAgICBERUxBWV9CRVRXRUVOX1BMQVlTOiA1MDAwLFxuICAgICAgLy8gVGhlIHRpbWUgYWZ0ZXIgaW5wdXQgdG8gd2FpdCBmb3IgdGhlIHVzZXIgdG8gZmluaXNoIHRoZSBzZXF1ZW5jZVxuICAgICAgSU5QVVRfVElNRU9VVDogMTAwMDAsXG4gICAgICAvLyBUaGUgZGVmYXVsdCBjb2xvciB0byBzZXQgdGhlIHBhbmVscyB0byB3aGVuXG4gICAgICBERUZBVUxUX1NJTU9OX1BBTkVMX0NPTE9SOiBcIndoaXRlXCIsXG4gICAgICAvLyBXYWl0IHdoaWxlIHBsYXlpbmcgZmluYWwgc291bmRcbiAgICAgIFRSQU5TSVRJT05fT1VUX1RJTUU6IDEwMDAwXG4gICAgfTtcbiAgfVxuXG4gIGdldFVzZXJDb2xvcih1c2VybmFtZSkge1xuICAgIHJldHVybiB0aGlzLkNPTE9SUy5VU0VSU1t1c2VybmFtZV07XG4gIH1cbn1cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
