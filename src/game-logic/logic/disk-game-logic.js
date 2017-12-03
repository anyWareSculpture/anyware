import PanelsActionCreator from '../actions/panels-action-creator';
import DisksActionCreator from '../actions/disks-action-creator';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import Disk from '../utils/disk';
import TrackedData from '../utils/tracked-data';
import DiskModel from '../utils/DiskModel';
import PanelAnimation from '../animation/panel-animation';
import Frame from '../animation/frame';

const positivePanels = ['5','6','7','8','9'];
const negativePanels = ['4','3','2','1','0'];

/**
 * Handles both the Shadow State (transitions) and the Disk Game Logic
 */
export default class DiskGameLogic {
  static STATE_OFF = "off";               // Not playing
  static STATE_INIT = "init";             // (currently not in use)
  static STATE_FADE_IN = "fade-in";       // Level is fading in
  static STATE_SHUFFLE = "shuffle";       // DISKS MOVEMENT STARTS. Level is shuffling. 
  static STATE_ACTIVE = "active";         // User interaction is available
  static STATE_LOCKING = "locking";       // Locking final disk
  static STATE_WINNING = "winning";       // DISKS MOVEMENT STOPS. Level is won, pause before starting win animation.
  static STATE_POST_LEVEL = "post-level"; // Playing end-of-level animation, then go back to FADE_IN next level
  static STATE_COMPLETE = "complete";     // Game is complete

  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0,
    state: DiskGameLogic.STATE_OFF,
    disks: new TrackedData({
      disk0: new Disk(),
      disk1: new Disk(),
      disk2: new Disk()
    }),
  };

  /*
   * The constructor manages transition _into_ the Shadow State
   */
  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.DISK_GAME;

    this.physicalDisks = {
      disk0: new DiskModel(),
      disk1: new DiskModel(),
      disk2: new DiskModel(),
    };
    this.physicalDisksEnabled = false;

    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);
    this.diskActions = new DisksActionCreator(this.store.dispatcher);

    this._initLevelFrames = [
      new Frame(() => {
        // Activate UI indicators
        for (const stripId of Object.keys(this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK)) {
          for (let i=0;i<5;i++) {
            this._lights.setIntensity(stripId, positivePanels[i], this.gameConfig.CONTROL_PANEL_INTENSITIES[i]);
            this._lights.setIntensity(stripId, negativePanels[i], this.gameConfig.CONTROL_PANEL_INTENSITIES[i]);
          }
        }
        this.fadeInLevel();
      }, 0),
      new Frame(() => {
        this.shuffleLevel();
      }, 3000),
      new Frame(() => {
        this.activateLevel();
      }, 3000),
    ];
  }

  get data() {
    return this.store.data.get('disk');
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  /**
   * Transitions into this game. Calls callback when done.
   */
  transition(callback) {
    const lightArray = this._lights;
    const initFrames = [
      new Frame(() => {
        lightArray.setIntensity('6', '0', this.gameConfig.SHADOW_LIGHT_INTENSITY);
        lightArray.setIntensity('6', '2', this.gameConfig.SHADOW_LIGHT_INTENSITY);
      }, 0),
      new Frame(() => {
        lightArray.setIntensity('6', '1', this.gameConfig.SHADOW_LIGHT_INTENSITY);
      }, 1000),
      new Frame(() => {
        lightArray.setIntensity('6', '3', this.gameConfig.SHADOW_LIGHT_INTENSITY);
      }, 1000),
      new Frame(() => {
      }, 2000),
    ];

    this.resetDisks();
    this.store.playAnimation(new PanelAnimation(initFrames, callback));
  }

  /*!
   * Called by SculptureStore immediately after becoming master, to start the game
   */
  start() {
    this._level = 0;
    this.store.playAnimation(new PanelAnimation(this._initLevelFrames));
  }

  /**
   * Reset game. Will reset the game to the beginning, without starting the game.
   * Only master should call this function.
   */
  reset() {
    console.log(`disk.reset()`);
    this._level = 0;
    this._state = DiskGameLogic.STATE_OFF;
    setTimeout(() => this.resetDisks(), 0);
  }

  fadeInLevel() {
    this._state = DiskGameLogic.STATE_FADE_IN;
  }

  shuffleLevel() {
    this._state = DiskGameLogic.STATE_SHUFFLE;

    this.enablePhysicalDisks();
    // Set initial position
    this._forEachDisk((disk, diskId) => {
      const pos = this._levelConfig.disks[diskId];
      disk.setAutoPosition(pos);
      this.physicalDisks[diskId].autoPosition = pos;
    });
  }

  activateLevel() {
    this._state = DiskGameLogic.STATE_ACTIVE;
    this._forEachDisk((disk) => disk.setAutoPosition(false));
  }

  // Start physical disk model
  enablePhysicalDisks() {
    if (!this.physicalDisksEnabled) {
      Object.keys(this.physicalDisks).forEach((diskId) => {
        this.physicalDisks[diskId].start();
        this.physicalDisks[diskId].on('position', (position) => {
          this.diskActions.sendDiskUpdate(diskId, { position });
        });
      });
      this.interval = setInterval(() => {
        Object.keys(this.physicalDisks).forEach((key) => this.physicalDisks[key].tick());
      }, 30);
      this.physicalDisksEnabled = true;
    }
  }

  disablePhysicalDisks() {
    if (this.physicalDisksEnabled) {
      // FIXME: Disable on next tick, to let position update?
      clearInterval(this.interval);
      delete this.interval;
      Object.keys(this.physicalDisks).forEach((diskId) => {
        this.physicalDisks[diskId].removeAllListeners('position');
        this.physicalDisks[diskId].stop();
      });
      this.physicalDisksEnabled = false;
    }
  }

  end() {
    this.disablePhysicalDisks();
    this.config.GAME_STRIPS.forEach((id) => this._lights.setIntensity(id, null, 0));
    // Deactivate shadow lights
    for (let stripId of Object.keys(this.gameConfig.SHADOW_LIGHTS)) {
      const panels = this.gameConfig.SHADOW_LIGHTS[stripId];
      for (let panelId of Object.keys(panels)) {
        this._lights.setIntensity(stripId, panelId, 0);
      }
    }
  }

  handleActionPayload(payload) {
    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [DisksActionCreator.DISK_UPDATE]: this._actionDiskUpdate.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this),
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  resetDisks() {
    const disks = this.data.get('disks');
    this._forEachDisk((disk, diskId) => {
      disk.setPosition(0);
      this.physicalDisks[diskId].stop();
      this.physicalDisks[diskId].targetPosition = 0;
    });
  }

  /**
   * Called on any change in panel state
   */
  _actionPanelPressed(payload) {
    // FIXME: Break up this method
    if (this.store.iAmAlone() || this._state !== DiskGameLogic.STATE_ACTIVE) return;

    const {stripId, panelId} = payload;
    
    const diskId = this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK[stripId];
    // The event doesn't concern us - use default behavior
    if (diskId === undefined) return; 

    const disk = this._getDisk(diskId);

    // Ignore non-owner interactions
    if (disk.getUser() !== "" && disk.getUser() !== this.store.me) {
      return;
    }

    // Ignore disks in autoPosition mode
    if (disk.hasAutoPosition()) return;


    // For each strip change:
    //   Find highest positive activated panel
    //   Find highest negative activated panel
    //   if both positive and negative:
    //     Set conflict
    //   else 
    //     set target speed, or 0 if no panels are active

    const lightArray = this._lights;
    const panels = lightArray.get(stripId).get('panels');
    const isActive = (panelId) => panels.get(panelId).get('active');
    let positivePanel = positivePanels.findIndex(isActive);
    let negativePanel = negativePanels.findIndex(isActive);

    if (positivePanel >= 0 && negativePanel >= 0) {
      // FIXME: Set conflict
      this._setDiskColor(stripId, this.gameConfig.CONFLICT_INTENSITY, this.config.COLORS.ERROR);
    }
    else {
      let speed = 0;
      let sign = 1;
      let panelIds = [];
      if (positivePanel === -1 && negativePanel === -1) {
        speed = 0;
      }
      else if (positivePanel >= 0) {
        speed = (positivePanel + 1);
        for (let i=0;i<=positivePanel;i++) panelIds.push(positivePanels[i]);
      }
      else {
        speed = (negativePanel + 1);
        sign = -1;
        for (let i=0;i<=negativePanel;i++) panelIds.push(negativePanels[i]);
      }

      const newspeed = speed === 0 ? 0 : sign * this.gameConfig.SPEEDS[speed - 1];

      // Check win condition if master
      if (this.store.isMaster() && this.store.isReady) {
        this._checkWinConditions();
      }

      if (newspeed !== 0 && !disk.hasAutoPosition()) {

        disk.setUser(this.store.me);
      }
      else {
        disk.setUser('');
      }
      if (!disk.hasAutoPosition()) {
        disk.setTargetSpeed(newspeed);
        this.physicalDisks[diskId].targetSpeed = newspeed;
      }

      // Publish position on any interaction
      disk.setPosition(this.store.getDiskPosition(diskId));

      const lightArray = this._lights;
      const setPanels = (panels, index) => {
        for (let i=0;i<5;i++) {
          if (index >= i && !disk.hasAutoPosition()) {
            lightArray.setIntensity(stripId, panels[i], this.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY);
            lightArray.setColor(stripId, panels[i], this.store.locationColor);
          }
          else {
            lightArray.setIntensity(stripId, panels[i], this.gameConfig.CONTROL_PANEL_INTENSITIES[i]);
            lightArray.setColor(stripId, panels[i], this.gameConfig.CONTROL_PANEL_COLOR);
          }
        }
      };
      setPanels(positivePanels, sign > 0 ? positivePanel : -1);
      setPanels(negativePanels, sign < 0 ? negativePanel : -1);
    }
  }

  /**
   * Called when disks move (comes from the physical disk model)
   */
  _actionDiskUpdate(payload) {
//    if (this._state !== DiskGameLogic.STATE_ACTIVE) return;
//    // FIXME: Only needed for emulator?
//    const {diskId, position} = payload;
//    this.physicalDisks[diskId].targetPosition = position;
//    if (this.store.isMaster() && this.store.isReady) {
//      this._checkWinConditions();
//    }
  }

  /*!
   * Merge remote state
   */
  _actionMergeState(payload) {
    if (!payload.disk) return; // Only handle disk state

    const diskChanges = payload.disk;
    const diskProps = payload.metadata.props.disk;

    // Master owns the fields: level, state
    if (!this.store.isMaster()) {
      const fields = ['level', 'state'];
      fields.forEach((field) => {
        if (diskChanges.hasOwnProperty(field)) {
          this.data.set(field, diskChanges[field], diskProps[field]);
        }
      });
    }
    if (diskChanges.state === DiskGameLogic.STATE_SHUFFLE) {
      this.enablePhysicalDisks();
    }
    if (diskChanges.state === DiskGameLogic.STATE_ACTIVE) {
      this.enablePhysicalDisks();
    }
    if (diskChanges.state === DiskGameLogic.STATE_POST_LEVEL) {
      this.disablePhysicalDisks();
    }

    if (!diskChanges.disks) return;
    // Master controls disk states, unless in active mode
    if (!this.store.isMaster() || this._state === DiskGameLogic.STATE_ACTIVE) {
      // Normal merge
      const disksChanges = diskChanges.disks;
      const disksProps = diskProps.disks;
  
      for (let diskId of Object.keys(disksChanges)) {
        const currDisk = this._getDisk(diskId);
        const changedDisk = disksChanges[diskId];
        const changedDiskProps = disksProps[diskId];

        if (changedDisk.hasOwnProperty('autoPosition')) {
          currDisk.setAutoPosition(changedDisk.autoPosition, changedDiskProps.autoPosition);
          this.physicalDisks[diskId].autoPosition = changedDisk.autoPosition;
        }

        // Ignore disks in autoPosition mode
        if (currDisk.hasAutoPosition()) {
          continue;
        }

        if (changedDisk.hasOwnProperty('position')) {
          currDisk.setPosition(changedDisk.position, changedDiskProps.position);
          this.physicalDisks[diskId].targetPosition = changedDisk.position;
          if (this.store.isMaster() && this.store.isReady) {
            this._checkWinConditions();
          }
        }
        if (changedDisk.hasOwnProperty('user')) {
          currDisk.setUser(changedDisk.user, changedDiskProps.user);
        }
        if (changedDisk.hasOwnProperty('targetSpeed')) {
          currDisk.setTargetSpeed(changedDisk.targetSpeed, changedDiskProps.targetSpeed);
          this.physicalDisks[diskId].targetSpeed = changedDisk.targetSpeed;
        }
      }
    }
    else {
      // Master control; revert any remote changes
      this._forEachDisk((disk) => {
        disk.setPosition(disk.getPosition());
        disk.setTargetSpeed(disk.getTargetSpeed());
        disk.setUser(disk.getUser());
      });
    }
  }

  _actionFinishStatusAnimation() {
    if (this._state === DiskGameLogic.STATE_COMPLETE) {
      setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), 4000);
    }
  }

  _setDiskColor(stripId, intensity, color) {
    const lightArray = this._lights;
    lightArray.setIntensity(stripId, null, intensity);
    lightArray.setColor(stripId, null, color);
  }

  /**
   * Calculates how far away from the correct zone the current disk position is.
   */
  _distanceFromZone(pos, zone) {

    const angle = (zone[1] - zone[0] + 360) % 360;
    const d = angle / 2;
    const c = (zone[0] + d) % 360;

    // Smallest difference between two angles
    const e = 180 - Math.abs(Math.abs(pos - c) - 180);

    const err = Math.max(e-d, 0);
    return err;
  }

  _lockDisk(diskId) {
    this._getDisk(diskId).setAutoPosition(0);
    this.physicalDisks[diskId].autoPosition = 0;
  }

  /**
   * Win conditions:
   * - Each marker must have its rules match against the position range of all 3 disks
   * 
   * Should only be called by master
   */
  _checkWinConditions() {
    const disks = this.data.get('disks');
    this._forEachDisk((disk, diskId) => {
      if (!disk.hasAutoPosition()) {
        const correctPos = this._levelConfig.disks[diskId];
        if (this.getDiskError(diskId) <= this.gameConfig.SINGLE_DISK_TOLERANCE) {
          this._lockDisk(diskId);
        }
      }
    });

    const allLocked = Array.from(disks).every((diskId) => disks.get(diskId).hasAutoPosition());
    if (allLocked) this._playLevelAnimation();
  }

  // FIXME: move these public methods up
  getDiskError(diskId) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._state === DiskGameLogic.STATE_COMPLETE) return 0;

    if (this._levelConfig.rule === 'absolute') {
      let pos = this.getLocalDiskPosition(diskId);
      if (pos > 180) pos -= 360;
      return Math.abs(pos);
    }
    else { // this._levelConfig.rule === 'relative'
      // Central and outer disk: get angle to middle disk
      // Middle disk: get smallest of angles to central and outer disks

      let pos = 0;
      if (diskId === 'disk1') { // Middle disk
        pos = Math.min.apply(Math, [
          Math.abs(this.getLocalDiskPosition(diskId) - this.getLocalDiskPosition('disk0')),
          Math.abs(this.getLocalDiskPosition(diskId) - this.getLocalDiskPosition('disk2'))
        ].map((pos) => pos > 180 ? 360 - pos : pos));
      }
      else { // Central or Outer disk
        pos = Math.abs(this.getLocalDiskPosition(diskId) - this.getLocalDiskPosition('disk1'));
        if (pos > 180) pos = 360 - pos;
      }
      return pos;
    }
  }

  getDiskSpeed(diskId) {
    return this._getDisk(diskId).getTargetSpeed();
  }

  /**
   * Current score (the total number of degrees away from solution).
   * For 3 disks, this will be between 0 and 540
   */
  getScore(disks) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._state === DiskGameLogic.STATE_COMPLETE) return 0;

    let score = 0;
    if (this._levelConfig.rule === 'absolute') {
      for (let diskId of disks) {
        const err = this.getDiskError(diskId);
        score += err;
      }
    }
    else { // this._levelConfig.rule === 'relative'
      score = Math.max.apply(Math, [
        Math.abs(this.getLocalDiskPosition('disk0') - this.getLocalDiskPosition('disk1')),
        Math.abs(this.getLocalDiskPosition('disk0') - this.getLocalDiskPosition('disk2'))
      ]);
    }

    return score;
  }

  /**
   * Should only be called by master
   */
  _playLevelAnimation() {
    console.log(`Playing level animation for ${this._level}`);

    const postLevelFrames = [
      new Frame(() => {
        this._state = DiskGameLogic.STATE_LOCKING;
      }, 0),
      new Frame(() => {
        this.store.data.get('lights').deactivateAll();
        this._stopAllDisks();
        this.disablePhysicalDisks();
        this._state = DiskGameLogic.STATE_WINNING;
      }, 500),
      new Frame(() => {
        this._state = DiskGameLogic.STATE_POST_LEVEL;
      }, 3000),
    ];

    const lightArray = this._lights;
    const numFrames = {0: 3, 1: 6, 2: 10}[this._level];
    const panelFrames = Array.from(Array(numFrames)).map((val, index) => new Frame(() => {
      for (const stripId of Object.keys(this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK)) {
        lightArray.setIntensity(stripId, '' + index, this.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY);
      }
    }, 200));

    let nextLevelFrames;
    console.log(`Increasing level...`);
    let level = this._level + 1;
    if (level === this._levels) {
      console.log(`Game complete`);
      nextLevelFrames = [
        new Frame(() => {
          this._level = level;
          this._state = DiskGameLogic.STATE_COMPLETE;
          for (const stripId of Object.keys(this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK)) {
            for (let i=0;i<10;i++) {
              this._lights.setIntensity(stripId, positivePanels[i], 0);
            }
          }
          for (let i=0;i<4;i++) {
            this._lights.setIntensity('6', '' + i, 0);
          }
        }, 2000),
        new Frame(() => {
          setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), 0);
        }, 5000),
      ];
    }
    else {
      nextLevelFrames = [
        new Frame(() => {
          this._level = level;
        }, 2000),
        ...this._initLevelFrames,
      ];
    }
    const levelFrames = [
      ...postLevelFrames,
      ...panelFrames,
      ...nextLevelFrames,
    ];

    const levelAnimation = new PanelAnimation(levelFrames);
    this.store.playAnimation(levelAnimation);
  }

  get _levelConfig() {
    return this.gameConfig.LEVELS[this._level];
  }

  get _levels() {
    return this.gameConfig.LEVELS.length;
  }

  get _level() {
    return this.data.get('level');
  }

  set _level(value) {
    return this.data.set('level', value);
  }

  set _state(value) {
    return this.data.set('state', value);
  }

  get _state() {
    return this.data.get('state');
  }

  getLocalDiskPosition(diskId) {
    return this.physicalDisks[diskId].position;
  }

  _stopAllDisks() {
    this._forEachDisk((disk) => disk.stop());
  }

  /**
   * Call func(disk, diskId) for each Disk in tracked data
   */
  _forEachDisk(func) {
    const disks = this.data.get('disks');
    for (const diskId of disks) func(disks.get(diskId), diskId);
  }

  _getDisk(diskId) {
    return this.data.get('disks').get(diskId);
  }

}
