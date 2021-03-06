/**
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

import COLORS from '../constants/colors';
import WEBCOLORS from '../constants/webColors';
import GAMES from '../constants/games';
import assign from 'assign-deep';

export default class DefaultConfig {
  constructor({
    me = "",
    sculpture1 = "sculpture1",
    sculpture2 = "sculpture2",
    sculpture3 = "sculpture3",
  } = {}) {
    this.defaultSculptureId = 'anyware'; // Read-only sculpture
    this.sculpture1 = sculpture1;
    this.sculpture2 = sculpture2;
    this.sculpture3 = sculpture3;

    // The ID of this sculpture
    this.me = me || this.defaultSculptureId;

    this.DEBUG = {
      status: false,     // Persistent status icons
      console: false,    // Console debug output
    };

    // Set this to true to enable synchronized restart
    this.SYNCHRONIZED_RESTART = true;

    // Will enter alone mode after this number of seconds
    this.ALONE_MODE_SECONDS = 60;
    // Alone mode volume (0-1)
    this.ALONE_MODE_VOLUME = 0.15;

    // Space between games (in black/off state)
    this.SPACE_BETWEEN_GAMES_SECONDS = 5;
    // Space after transitioning into art state
    this.ART_STATE_SPACE_SECONDS = 5;

    // A mapping between sculpture IDs and the colors that represent them
    this.COLORS = {
      LOCATIONS: {
        // sculpture : color
        [this.sculpture1]: COLORS.SCULPTURE1,
        [this.sculpture2]: COLORS.SCULPTURE2,
        [this.sculpture3]: COLORS.SCULPTURE3
      },
      ERROR: 'error'
    };

    // The sequence of the games to be run. The first game is run on startup
    this.GAMES_SEQUENCE = [
      GAMES.MOLE,
      GAMES.DISK,
      GAMES.SIMON
    ];

    /******* LIGHTS  ********************/
    this.LIGHTS = {
      // Name : strip Id (corresponds to hardware)
      STRIP_A: '0',
      STRIP_B: '1',
      STRIP_C: '2',
      RGB_STRIPS: '3',
      HANDSHAKE_STRIP: '5',
      ART_LIGHTS_STRIP: '6'
    };
    this.GAME_STRIPS = [
      this.LIGHTS.STRIP_A,
      this.LIGHTS.STRIP_B,
      this.LIGHTS.STRIP_C
    ];
    this.PANELS = {
      // stripId : [all associated panel Ids]
      [this.LIGHTS.STRIP_A]: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      [this.LIGHTS.STRIP_B]: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      [this.LIGHTS.STRIP_C]: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    };

    // These settings effect the default behaviour of panels outside of
    // any custom logic in any of the games
    this.PANEL_DEFAULTS = {
      ACTIVE_INTENSITY: 100,
      INACTIVE_INTENSITY: 0
    };

    this.HANDSHAKE = {
      TRANSITION_OUT_TIME: 4000 // Time (ms) from handshake is touched until we start the next game
    };

    /******* GAMES CONFIGURATION *******/

    this.MOLE_GAME = {
      GAME_END: 30,
      INITIAL_PANELS: [
        {stripId: this.LIGHTS.STRIP_C, panelId: '3'},
        {stripId: this.LIGHTS.STRIP_C, panelId: '7'},
        {stripId: this.LIGHTS.STRIP_B, panelId: '6'},
        {stripId: this.LIGHTS.STRIP_A, panelId: '5'}
      ],
      NUM_ACTIVE_PANELS: {
//        10: 1, // At panelCount of 10, increase # of simultaneusly active panels
//        20: 1,
//        25: -1, // At panelCount of 25, decrease # of simultaneusly active panels
//        27: -1
      },
      PANEL_LIFETIME: [
        {count: 0, range: [10, 10]}, // Initial timeout
        {count: 4, range: [4, 6]}, // At panelCount of 4, set panel lifetime to 4-6 seconds. Gradually interpolate to next timeout level
        {count: 20, range: [2, 3]},
        {count: 30, range: [1.5, 2]}
      ],
      // How long to wait before enabling the next panel, on success
      PANEL_SUCCESS_DELAY: 1000,
      // How long to wait before enabling the next panel, on automatic panel move
      PANEL_MOVE_DELAY: 500,
      // The intensity to use on active panels
      ACTIVE_PANEL_INTENSITY: 100,
      // The intensity to use on inactive panels
      INACTIVE_PANEL_INTENSITY: 0,
      // The intensity to use on ignored panels (panels turned to location color)
      COLORED_PANEL_INTENSITY: 75,
    };

    this.DISK_GAME = {
      OWNERSHIP_TIMEOUT: 2000, // milliseconds
      TAP_TIMEOUT: 1500, // milliseconds
      SPEED: 21, // degrees/sec
      SINGLE_DISK_TOLERANCE: 15, // tolerance (in degrees) for locking a single disk into place
      // The intensity of the panels that the user can use to play the sequence
      CONTROL_PANEL_COLOR: COLORS.WHITE,
      CONTROL_PANEL_INTENSITY: 10,
      ACTIVE_CONTROL_PANEL_INTENSITY: 100,
      WON_CONTROL_PANEL_INTENSITY: 100,
      SHADOW_LIGHTS: {
        // stripId: [panelId..]
        [this.LIGHTS.ART_LIGHTS_STRIP]: ['0', '1', '2', '3']
      },
      SHADOW_LIGHT_INTENSITY: 100,
      LEVELS: [
        // rule: 'absolute' or 'relative'
        // disks: { diskId: initial position }

        // level 0
        { rule: 'absolute', disks: { disk0: -60, disk1: 160, disk2: 120 } },

        // level 1
        { rule: 'absolute', disks: { disk0: 45, disk1: -100, disk2: -130 } },

        // level 2
        { rule: 'absolute', disks: { disk0: 170, disk1: 45, disk2: -80 } },

      ],
      CONTROL_MAPPINGS: {
        STRIP_TO_DISK: {
          [this.LIGHTS.STRIP_A]: 'disk0',
          [this.LIGHTS.STRIP_B]: 'disk1',
          [this.LIGHTS.STRIP_C]: 'disk2',
        },
      }
    };

    this.SIMON_GAME = {
      PATTERN_LEVELS: [
        // level 0 sequence
        {
          stripId: this.LIGHTS.STRIP_C,
          // Each array of panel IDs is lit up one at a time
          // Each array within this array is called a "frame" in the "sequence"
          panelSequences: [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
          ],
          frameDelay: 750 // Overriding default frame delay to make first level slower
        },
        // level 1 sequence
        {
          stripId: this.LIGHTS.STRIP_B,
          panelSequences: [
            ['1', '8', '6'],
            ['2', '7', '0'],
            ['4', '9', '5'],
          ],
        },
        // level 2 sequence
        {
          stripId: this.LIGHTS.STRIP_A,
          panelSequences: [
            ['3', '6', '2', '9'],
            ['5', '1', '8', '7'],
            ['0', '4', '7', '6'],
          ],
        }
      ],
      // Can be set to null to disable the RGB strips
      RGB_STRIP: this.LIGHTS.RGB_STRIPS,
      // The intensity of the panels when they are pressed or when the sequence is playing
      TARGET_PANEL_INTENSITY: 100,
      // The intensity of ownership indication
      INDICATOR_PANEL_INTENSITY: 10,
      // The delay in ms between sequence frames
      SEQUENCE_ANIMATION_FRAME_DELAY: 500,
      // The delay in ms to wait before replaying the sequence
      // Only replayed if no input is received from the user
      DELAY_BETWEEN_PLAYS: 5000,
      // The time after input to wait for the user to finish the sequence
      INPUT_TIMEOUT: 10000,
      // The default color to set the panels to when
      DEFAULT_SIMON_PANEL_COLOR: COLORS.WHITE,
      // How long the free play period will last
      FREEPLAY_TIMEOUT: 90000,
    };
  }

  getLocationColor(loc) {
    return this.COLORS.LOCATIONS[loc] || COLORS.BLACK;
  }

  getWebColor(name) {
    return WEBCOLORS[name];
  }

  applyLocalConfig(config) {
    assign(this, config);
  }
}

