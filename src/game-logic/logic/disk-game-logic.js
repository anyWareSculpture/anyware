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
    this._ownershipTimeouts = {};

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
          this._lights.setIntensity(stripId, null, this.gameConfig.CONTROL_PANEL_INTENSITY);
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
        lightArray.setIntensity(this.config.LIGHTS.ART_LIGHTS_STRIP, '0', this.gameConfig.SHADOW_LIGHT_INTENSITY);
        lightArray.setIntensity(this.config.LIGHTS.ART_LIGHTS_STRIP, '2', this.gameConfig.SHADOW_LIGHT_INTENSITY);
      }, 0),
      new Frame(() => {
        lightArray.setIntensity(this.config.LIGHTS.ART_LIGHTS_STRIP, '1', this.gameConfig.SHADOW_LIGHT_INTENSITY);
      }, 1000),
      new Frame(() => {
        lightArray.setIntensity(this.config.LIGHTS.ART_LIGHTS_STRIP, '3', this.gameConfig.SHADOW_LIGHT_INTENSITY);
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
// FIXME: Don't do this, as it may broadcast the intention to stop disk which are still auto-positioning
//        this.physicalDisks[diskId].on('autoPositionReached', (position) => {
//          const disk = this.data.get('disks').get(diskId);
//          if (!disk.getLocked() && this.store.isMaster()) {
//            disk.setTargetSpeed(0);
//            disk.setAutoPosition(false);
//          }
//        });
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
      [DisksActionCreator.OWNERSHIP_TIMEOUT]: this._relinguishOwnership.bind(this),
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
   * Called on any change in local panel state
   */
  _actionPanelPressed(payload) {
    // FIXME: Break up this method
    if (this.store.iAmAlone() || this._state !== DiskGameLogic.STATE_ACTIVE) return;

    const {stripId, panelId, pressed} = payload;
    
    const diskId = this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK[stripId];
    // The event doesn't concern us - use default behavior
    if (diskId === undefined) return; 

    const disk = this._getDisk(diskId);

    // Ignore non-owner interactions
    if (disk.getUser() !== '' && disk.getUser() !== this.store.me) {
      return;
    }

    // Active flag only set by the owner
    this._lights.setActive(stripId, panelId, pressed);

    // Ignore disks in autoPosition mode
    // FIXME: Instead of ignoring, we should deactivate and turn off (or otherwise highlight) these panels
    if (disk.hasAutoPosition()) return;


    const lightArray = this._lights;
    const panels = lightArray.get(stripId).get('panels');
    const isActive = (panelId) => panels.get(panelId).get('active');
    const isPositiveActive = positivePanels.some(isActive);
    const isNegativeActive = negativePanels.some(isActive);
    const conflict = isPositiveActive && isNegativeActive;

    let speed = 0;
    if (isPositiveActive ^ isNegativeActive) {
      speed = (isNegativeActive ? -1 : 1) * this.gameConfig.SPEED;
      // Manage ownership
      if (!disk.hasAutoPosition()) {
        disk.setUser(this.store.me);
      }
    }
    // Manage ownership
    if (this.store.isMaster()) {
        this._manageOwnership(isPositiveActive || isNegativeActive, stripId, disk);
    }

    // Check win condition if master
    if (this.store.isMaster() && this.store.isReady) {
      // FIXME: We need to also check win condition whenever a disk updates as deceleration after the user lets go may move it close enough
      console.log(`_checkWinConditions() from actionPanelPressed(${JSON.stringify(payload)})`);
      this._checkWinConditions();
    }

    if (!disk.hasAutoPosition()) {
      disk.setTargetSpeed(speed);
      this.physicalDisks[diskId].targetSpeed = speed;
    }

    // Publish position on any interaction
    disk.setPosition(this.store.getDiskPosition(diskId));

    // If a disk was locked during this function, don't set panel lights
    // FIXME: This could be solved in a nicer way
    if (disk.hasAutoPosition()) return;

    this._updatePanels(stripId, disk.getUser() !== '', conflict, isPositiveActive, isNegativeActive);
  }

  _updatePanels(stripId, hasOwner, conflict, isPositiveActive, isNegativeActive) {
    if (conflict) {
      // On conflict, set the entire strip to the location color
      this._setStripColor(stripId, this.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY, this.store.locationColor);
    }
    else {
      const setPanels = (lightArray, panels, on) => {
        panels.forEach((panel) => {
          lightArray.setIntensity(stripId, panel, on ? this.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY : this.gameConfig.CONTROL_PANEL_INTENSITY);
          lightArray.setColor(stripId, panel, hasOwner ? this.store.locationColor : this.gameConfig.CONTROL_PANEL_COLOR);
        });
      };
      setPanels(this._lights, positivePanels, isPositiveActive);
      setPanels(this._lights, negativePanels, isNegativeActive);
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

  _relinguishOwnership(payload) {
    this._updatePanels(payload.stripId, false, false, false, false);
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

    // Master owns all disk fields if this._state is not STATE_ACTIVE
    // Master owns the disk fields: autoPosition and locked
    // Master owns all disk fields for disks that are locked
    // Master owns the 'user' field if it's set

    // Master controls disk states, unless (STATE_ACTIVE && !locked)
    if (!this.store.isMaster() || this._state === DiskGameLogic.STATE_ACTIVE) {
      // Normal merge
      const disksChanges = diskChanges.disks;
      const disksProps = diskProps.disks;
  
      for (let diskId of Object.keys(disksChanges)) {
        const currDisk = this._getDisk(diskId);
        const changedDisk = disksChanges[diskId];
        const changedDiskProps = disksProps[diskId];

        // Manage locked flag first
        if (!this.store.isMaster() && changedDisk.hasOwnProperty('locked')) {
          currDisk.setLocked(changedDisk.locked, changedDiskProps.locked);
        }

        // locked disks
        const test = (!this.store.isMaster() || !currDisk.getLocked());
        if (!this.store.isMaster() || !currDisk.getLocked()) {
          if (changedDisk.hasOwnProperty('user')) {
            const oldUser = currDisk.hasUser();
            if (!this.store.isMaster() || !currDisk.hasUser()) {
                currDisk.setUser(changedDisk.user, changedDiskProps.user);
            }
          }
            
          if (changedDisk.hasOwnProperty('targetSpeed')) {
            currDisk.setTargetSpeed(changedDisk.targetSpeed, changedDiskProps.targetSpeed);
            this.physicalDisks[diskId].targetSpeed = changedDisk.targetSpeed;
          }

          if (changedDisk.hasOwnProperty('position')) {
            currDisk.setPosition(changedDisk.position, changedDiskProps.position);
            // Locked disks cannot have target positions as they're either stopped or having an autoPosition
            if (!currDisk.getLocked()) this.physicalDisks[diskId].targetPosition = changedDisk.position;
            if (this.store.isMaster() && this.store.isReady) {
              this._checkWinConditions();
            }
          }
        }

        // Note: If we're merging multiple fields, we need to set autoPosition last as 
        // this will implicitly change the speed of a physical disk.
        if (!this.store.isMaster() && changedDisk.hasOwnProperty('autoPosition')) {
          currDisk.setAutoPosition(changedDisk.autoPosition, changedDiskProps.autoPosition);
          this.physicalDisks[diskId].autoPosition = changedDisk.autoPosition;
        }

        if (this.store.isMaster() && !currDisk.getLocked()) {
          const stripId = this._diskIdToStripId(diskId);
          const isAnyPanelActive = this._lights.get(stripId).panelIds.some((panelId) => this._lights.isActive(stripId, panelId));
          this._manageOwnership(isAnyPanelActive, stripId, currDisk);
        }
      }
    }
    else {
      // Master control; revert any remote changes
      this._forEachDisk((disk, diskId) => {
        disk.setPosition(disk.getPosition());
        disk.setTargetSpeed(disk.getTargetSpeed());
        this.physicalDisks[diskId].targetSpeed = disk.getTargetSpeed();
        disk.setUser(disk.getUser());
      });
    }
  }

  /**
   * Called by master when it's time to start relinguishing ownership over a panel
   */
  _manageOwnership(hasOwner, stripId, disk) {
    if (hasOwner) {
      this._cancelTimeout(stripId);
    }
    else if (!this._ownershipTimeouts[stripId]) {
      this._ownershipTimeouts[stripId] = setTimeout(() => {
        disk.setUser('');
        this.diskActions.sendOwnershipTimeout({stripId});
      }, this.gameConfig.OWNERSHIP_TIMEOUT);
    }
  }

  _cancelTimeout(stripId) {
    if (this._ownershipTimeouts[stripId]) {
      clearTimeout(this._ownershipTimeouts[stripId]);
      this._ownershipTimeouts[stripId] = null;
    }
  }

  _actionFinishStatusAnimation() {
    if (this._state === DiskGameLogic.STATE_COMPLETE) {
      setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), 4000);
    }
  }

  _setStripColor(stripId, intensity, color) {
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


  /**
   * FIXME: Since the actual lights are merged by sculpture-store, we may end up merging
   * lights _after_ disks are locked if a slave presses a panel while the locked state is being
   * propagated.
   * 
   * Should only be called by master
   */
  _lockDisk(diskId) {
    this._cancelTimeout(this._diskIdToStripId(diskId));
    const disk = this._getDisk(diskId);
    disk.setLocked(true);
    disk.setAutoPosition(0);
    disk.setUser('');
    this.physicalDisks[diskId].autoPosition = 0;
    // Set UI indicators to location color
    const winningUser = disk.getLastUser() || disk.getUser();
    const winningColor = this.config.getLocationColor(winningUser);
    for (const stripId of Object.keys(this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK)) {
      if (this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK[stripId] === diskId) {
        this._setStripColor(stripId, this.gameConfig.WON_CONTROL_PANEL_INTENSITY, winningColor);
      }
    }
    // Make sure changes are merged by all slaves
    this.store.reassertChanges();
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
        this._forEachDisk((disk) => {
          disk.stop();
          disk.setPosition(0);
          disk.setUser('');
          disk.setLocked(false);
        });
        this.disablePhysicalDisks();
        this._state = DiskGameLogic.STATE_WINNING;
      }, 1000),
      new Frame(() => {
        this._state = DiskGameLogic.STATE_POST_LEVEL;
      }, 2500),
    ];

    const lightArray = this._lights;
    const numLights = {0: 3, 1: 6, 2: 10}[this._level];
    const panelFrames = Array.from(Array(10)).map((val, index) => new Frame(() => {
      for (const stripId of Object.keys(this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK)) {
        lightArray.setIntensity(stripId, '' + index, index < numLights ? this.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY : 0);
        lightArray.setColor(stripId, '' + index, this.gameConfig.CONTROL_PANEL_COLOR);
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
            this._lights.setIntensity(this.config.LIGHTS.ART_LIGHTS_STRIP, '' + i, 0);
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

  _diskIdToStripId(diskId) {
    return Object.keys(this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK).find((key) => this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK[key] === diskId);
  }

}
