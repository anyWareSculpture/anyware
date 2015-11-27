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

const COLORS = require('../constants/colors');
const GAMES = require('../constants/games');

const Disk = require('../utils/disk');

export default class DefaultConfig {
  constructor({
      username="",
      user0="sculpture0",
      user1="sculpture1",
      user2="sculpture2"
  } = {}) {
    this.user0 = user0;
    this.user1 = user1;
    this.user2 = user2;

    // The username of the current user
    this.username = username || user0;

    // A mapping between usernames and the colors that represent them
    this.USER_COLORS = {
      // username : color
      [this.user0]: COLORS.USER0,
      [this.user1]: COLORS.USER1,
      [this.user2]: COLORS.USER2
    };

    // The sequence of the games to be run. The first game is run on startup
    this.GAMES_SEQUENCE = [
      GAMES.HANDSHAKE,
      GAMES.MOLE,
      GAMES.DISK,
      GAMES.SIMON
    ];

    /******* LIGHTS ********************/
    this.LIGHTS = {
      GAME_STRIPS: ['0','1','2'],
      PERIMETER_STRIP: '3',
      DISK_LIGHT_STRIP: '4',
      HANDSHAKE_STRIP: '5',
      ENVIRONMENT_STRIP: '6'
    }

    /******* GAMES CONFIGURATION *******/

    this.HANDSHAKE_GAME = {
      TRANSITION_OUT_TIME: 4000
    },
    this.MOLE_GAME = {
      INITIAL_PANELS: [
        {stripId: '0', panelId: '3'},
        {stripId: '0', panelId: '7'},
        {stripId: '2', panelId: '6'}
      ],
      NUM_ACTIVE_PANELS: {
        10: 1, // At panelCount of 10, increase # of simultaneusly active panels
        20: 1,
        25: -1, // At panelCount of 25, decrease # of simultaneusly active panels
        27: -1
      },
      PANEL_LIFETIME: [
        {count: 4, range: [4, 6]}, // At panelCount of 4, set panel lifetime to 4-6 seconds. Gradually interpolate to next timeout level
        {count: 20, range: [2, 3]},
        {count: 30, range: [1.5, 2]}
      ],
      PANEL_SUCCESS_DELAY: 1000,
      // The intensity to use on the active panels
      ACTIVE_PANEL_INTENSITY: 100,
      // The intensity to use on the active panels
      INACTIVE_PANEL_INTENSITY: 0,
      // The intensity to use on the inactive panels (panels turned to location color)
      COLORED_PANEL_INTENSITY: 75
    };

    this.DISK_GAME = {
      // The user will wins when they reach these positions for each diskId.
      RELATIVE_TOLERANCE: 3, // degrees tolerance for disks relative to each other
      ABSOLUTE_TOLERANCE: 5, // degrees tolerance for the absolute disk positions
      // The intensity of the panels that the user can use to play the sequence
      AVAILABLE_PANEL_INTENSITY: 20,
      ACTIVE_PERIMETER_INTENSITY: 100,
      INACTIVE_PERIMETER_INTENSITY: 50,
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
        { disks:     { disk2: 63, disk1: 111, disk0: 333 },
          perimeter: { [this.LIGHTS.PERIMETER_STRIP]: ['0', '2']  }
        },
        // level 1
        { disks:     { disk2: 331,  disk1: 25, disk0: 51 },
          perimeter: { [this.LIGHTS.PERIMETER_STRIP]: ['1', '4']  }
        },
        // level 2
        { disks:     { disk2: 0, disk1: 77,  disk0: 314 },
          perimeter: { [this.LIGHTS.PERIMETER_STRIP]: ['3', '5']  }
        }
      ],
      LIGHT_MAPPING: {
        // diskId: { stripId: panelId }
        disk0: { [this.LIGHTS.DISK_LIGHT_STRIP]: '0' },
        disk1: { [this.LIGHTS.DISK_LIGHT_STRIP]: '1' },
        disk2: { [this.LIGHTS.DISK_LIGHT_STRIP]: '2' }
      },
      CONTROL_MAPPINGS: {
        // stripId
        '0': {
          // panelId -- diskId
          '1': { disk0: Disk.COUNTERCLOCKWISE },
          '2': { disk0: Disk.COUNTERCLOCKWISE },
          '4': { disk1: Disk.COUNTERCLOCKWISE },
          '5': { disk1: Disk.COUNTERCLOCKWISE },
          '7': { disk2: Disk.COUNTERCLOCKWISE },
          '8': { disk2: Disk.COUNTERCLOCKWISE }
        },
        '2': {
          // panelId -- diskId
          '1': { disk0: Disk.CLOCKWISE },
          '2': { disk0: Disk.CLOCKWISE },
          '4': { disk1: Disk.CLOCKWISE },
          '5': { disk1: Disk.CLOCKWISE },
          '7': { disk2: Disk.CLOCKWISE },
          '8': { disk2: Disk.CLOCKWISE }
        }
      }
    };

    this.SIMON_GAME = {
      PATTERN_LEVELS: [
        // level 0 sequence
        {
          stripId: '0',
          // Each array of panel IDs is lit up one at a time
          // Each array within this array is called a "frame" in the "sequence"
          panelSequence: [['3'], ['5'], ['7']]
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
        }
      ],
      // The intensity of the panels when they are pressed or when the sequence is playing
      TARGET_PANEL_INTENSITY: 100,
      // The intensity of the panels that the user can use to play the sequence
      AVAILABLE_PANEL_INTENSITY: 20,
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

  getUserColor(username) {
    return this.USER_COLORS[username];
  }
}

