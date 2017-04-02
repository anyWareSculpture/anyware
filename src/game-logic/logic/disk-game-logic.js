import PanelsActionCreator from '../actions/panels-action-creator';
import DisksActionCreator from '../actions/disks-action-creator';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import Disk from '../utils/disk';
import TrackedData from '../utils/tracked-data';
import DiskModel from '../utils/DiskModel';

const positivePanels = ['5','6','7','8','9'];
const negativePanels = ['4','3','2','1','0'];

export default class DiskGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0,
    disks: new TrackedData({
      disk0: new Disk(),
      disk1: new Disk(),
      disk2: new Disk()
    }),
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.DISK_GAME;

    this.physicalDisks = {
      disk0: new DiskModel(),
      disk1: new DiskModel(),
      disk2: new DiskModel(),
    };

    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);
    this.diskActions = new DisksActionCreator(this.store.dispatcher);

    this._complete = false;

    this.startDisks();
  }

  get data() {
    return this.store.data.get('disk');
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  start() {
    this._level = 0;
    this._complete = false;

    // Activate shadow lights
    for (let stripId of Object.keys(this.gameConfig.SHADOW_LIGHTS)) {
      const panels = this.gameConfig.SHADOW_LIGHTS[stripId];
      for (let panelId of Object.keys(panels)) {
        this._lights.setIntensity(stripId, panelId, this.gameConfig.SHADOW_LIGHT_INTENSITY);
      }
    }

    // Activate UI indicators
    const lightArray = this._lights;
    for (const stripId of Object.keys(this.gameConfig.CONTROL_MAPPINGS.STRIP_TO_DISK)) {
      lightArray.setColor(stripId, null, this.gameConfig.CONTROL_PANEL_COLOR);
      for (let i=0;i<5;i++) {
        lightArray.setIntensity(stripId, positivePanels[i], this.gameConfig.CONTROL_PANEL_INTENSITIES[i]);
        lightArray.setIntensity(stripId, negativePanels[i], this.gameConfig.CONTROL_PANEL_INTENSITIES[i]);
      }
    }

    this.startLevel();
  }

  startLevel() {
    // Set initial position
    const disks = this.data.get('disks');
    for (let diskId of Object.keys(this._levelConfig.disks)) {
      const disk = disks.get(diskId);
      const pos = this._levelConfig.disks[diskId];
      disk.setPosition(pos);
      this.physicalDisks[diskId].targetPosition = pos;
    }
  }

  // Start physical disk model
  startDisks() {
    Object.keys(this.physicalDisks).forEach((diskId) => {
      this.physicalDisks[diskId].start();
      this.physicalDisks[diskId].on('position', (pos) => {
        this.sendDiskUpdate(diskId, pos);
      });
    });
    this.interval = setInterval(() => {
      Object.keys(this.physicalDisks).forEach((key) => this.physicalDisks[key].tick());
    }, 30);
  }

  endDisks() {
    clearInterval(this.interval);
    delete this.interval;
    Object.keys(this.physicalDisks).forEach((key) => this.physicalDisks[key].removeAllListeners('position'));
  }

  // FIXME: These end() methods may be obsolete now since everything is reset before every game anyway
  end() {
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

  /* FIXME: Handle start of game

    // Handle game changes
    if (changes.hasOwnProperty('currentGame')) {
      // Reset on start of playing the disk game and on start of games cycle
      if (changes.currentGame === GAMES.DISK || changes.currentGame === GAMES.HANDSHAKE) {
        setTimeout(this.resetDisks.bind(this), 0);
      }
    }
  
   */


  resetDisks() {
    Object.keys(this.physicalDisks).forEach((diskId) => {
      this.physicalDisks[diskId].stop();
      const pos = this.disks.get(diskId).get('position');
      this.physicalDisks[diskId].targetPosition = pos;
      this.sendDiskUpdate(diskId, pos);
    });
  }

  sendDiskUpdate(diskId, position) {
    this.diskActions.sendDiskUpdate(diskId, { position });
  }

  /**
   * Called on any change in panel state
   */
  _actionPanelPressed(payload) {
    // FIXME: Break up this method
    if (this._complete) return;

    const controlMappings = this.gameConfig.CONTROL_MAPPINGS;
    const {stripId, panelId} = payload;
    
    const diskId = controlMappings.STRIP_TO_DISK[stripId];
    // The event doesn't concern us - use default behavior
    if (diskId === undefined) return; 

    const disk = this.data.get('disks').get(diskId);

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
      disk.setTargetSpeed(newspeed);
      this.physicalDisks[diskId].targetSpeed = newspeed;

      // On speed changes, publish position
      disk.setPosition(this.store.getDiskPosition(diskId));
      // ..and check win condition if master
      if (this.store.isMaster && !this.store.isStatusSuccess) {
        this._checkWinConditions();
      }

      const lightArray = this._lights;
      const setPanels = (panels, index) => {
        for (let i=0;i<5;i++) {
          if (index >= i) {
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
    if (this._complete) return;
    // FIXME: Only needed for emulator?
    const {diskId, position} = payload;
    this.physicalDisks[diskId].targetPosition = position;
    if (this.store.isMaster && !this.store.isStatusSuccess) {
      this._checkWinConditions();
    }
  }

  /*!
   * Merge remote state
   */
  _actionMergeState(payload) {
    if (payload.hasOwnProperty('disk')) this._mergeDisk(payload.disk, payload.metadata.props.disk);
  }

  _mergeDisk(diskChanges, props = {}) {
    // Master owns the level field
    if (!this.store.isMaster) {
      if (diskChanges.hasOwnProperty('level')) {
        this.data.set('level', diskChanges.level, props.level);
      }
    }

    if (!diskChanges.disks) return;

    const disksChanges = diskChanges.disks;
    const disksProps = props.disks;

    const currDisks = this.data.get('disks');

    for (let diskId of Object.keys(disksChanges)) {
      const changedDisk = disksChanges[diskId];
      const diskProps = disksProps[diskId];
      const currDisk = currDisks.get(diskId);
      if (changedDisk.hasOwnProperty('position')) {
        currDisk.setPosition(changedDisk.position, diskProps.position);
        this.physicalDisks[diskId].targetPosition = changedDisk.position;
        if (this.store.isMaster && !this.store.isStatusSuccess) {
          this._checkWinConditions();
        }
      }
      if (changedDisk.hasOwnProperty('user')) {
        currDisk.setUser(changedDisk.user, diskProps.user);
      }
      if (changedDisk.hasOwnProperty('targetSpeed')) {
        currDisk.setTargetSpeed(changedDisk.targetSpeed, diskProps.targetSpeed);
        this.physicalDisks[diskId].targetSpeed = changedDisk.targetSpeed;
      }
    }
  }

  _actionFinishStatusAnimation() {
    if (this._complete) {
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

  /**
   * Win conditions:
   * - Each marker must have it's rules match against the position range of all 3 disks
   */
  _checkWinConditions() {
    const disks = this.data.get('disks');
    const score = this.getScore(disks);
    const isMoving = Array.from(disks).some((diskId) => Math.abs(this.getDiskSpeed(diskId)) > 0);
    
//    console.debug(`Total error: ${totalError}`);
    if (!isMoving && score <= this.gameConfig.ABSOLUTE_TOLERANCE) {
      this._winGame();
    }
  }

  // FIXME: move these public methods up
  getDiskError(diskId) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._complete) return 0;

    if (this._levelConfig.rule === 'absolute') {
      let pos = this.getLocalDiskPosition(diskId);
      if (pos > 180) pos -= 360;
      return Math.abs(pos);
    }
    else { // this._levelConfig.rule === 'relative'
      // Central and outer disk: get angle to middle disk
      // Middle disk: get smallest of angles to central and outer disks

      let pos = 0;
      if (diskId == 'disk1') { // Middle disk
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
    const disks = this.data.get('disks');
    return disks.get(diskId).getTargetSpeed();
  }

  /**
   * Current score (the total number of degrees away from solution).
   * For 3 disks, this will be between 0 and 540
   */
  getScore(disks) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._complete) return 0;

    let score = 0;
    if (this._levelConfig.rule === 'absolute') {
      for (let diskId of disks) {
        const err = this.getDiskError(diskId);
        score += err;
      }
    }
    else { // this._levelConfig.rule === 'relative'
      score = Math.max.apply(Math, [Math.abs(this.getLocalDiskPosition('disk0') - this.getLocalDiskPosition('disk1')),
                            Math.abs(this.getLocalDiskPosition('disk0') - this.getLocalDiskPosition('disk2'))]);
    }

    return score;
  }

  _winGame() {
    if (this.store.isStatusSuccess) return;

    this.store.data.get('lights').deactivateAll();
    this._stopAllDisks();

    this.store.setSuccessStatus();

    let level = this._level + 1;
    if (level >= this._levels) {
      this._complete = true;
    }
    else {
      this.startLevel();
    }

    this._level = level;
  }

  _stopAllDisks() {
    const disks = this.data.get('disks');

    for (let diskId of disks) {
      disks.get(diskId).stop();
    }
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

  getLocalDiskPosition(diskId) {
    return this.physicalDisks[diskId].position;
  }

}
