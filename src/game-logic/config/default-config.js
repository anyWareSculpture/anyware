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
import GAMES from '../constants/games';

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

    // Local sculptures will time out after this number of seconds without interaction
    this.ACTIVITY_TIMEOUT = 60;

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
      GAMES.HANDSHAKE,
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

    /******* GAMES CONFIGURATION *******/

    this.HANDSHAKE_GAME = {
      TRANSITION_OUT_TIME: 4000 // Time (ms) from handshake is touched until we start the next game
    };
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
      // We don't use failure sounds in the default setup due to too many accidental touches
      ENABLE_FAILURE_SOUND: false
    };

    this.DISK_GAME = {
      MAX_SPEED: 360 / 5, // degrees/sec
      ABSOLUTE_TOLERANCE: 12, // sum of degrees tolerance for the absolute disk positions
      // The intensity of the panels that the user can use to play the sequence
      CONTROL_PANEL_COLOR: COLORS.WHITE,
      CONTROL_PANEL_INTENSITY: 20,
      CONFLICT_INTENSITY: 20,
      ACTIVE_CONTROL_PANEL_INTENSITY: 100,
      SHADOW_LIGHTS: {
        // stripId: [panelId..]
        '6': ['0', '1', '2']
      },
      SHADOW_LIGHT_INTENSITY: 100,
      LEVELS: [
        // level 0
        // disks: { diskId: initial position }
        { disk0: -90, disk1: 90, disk2: 120 },
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
          panelSequence: [['3'], ['5'], ['7']],
          frameDelay: 750 // Overriding default frame delay to make first level slower
        },
        // level 1 sequence
        {
          stripId: this.LIGHTS.STRIP_B,
          panelSequence: [['1'], ['8'], ['5']]
        },
        // level 2 sequence
        {
          stripId: this.LIGHTS.STRIP_A,
          panelSequence: [['3'], ['6'], ['2'], ['9']]
        }
      ],
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
      DEFAULT_SIMON_PANEL_COLOR: COLORS.WHITE,
      // Wait while playing final sound
      TRANSITION_OUT_TIME: 10000
    };
  }

  getLocationColor(loc) {
    return this.COLORS.LOCATIONS[loc];
  }
}

