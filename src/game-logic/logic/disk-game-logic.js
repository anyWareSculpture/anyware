import PanelsActionCreator from '../actions/panels-action-creator';
import DisksActionCreator from '../actions/disks-action-creator';
import SculptureActionCreator from '../actions/sculpture-action-creator';
import Disk from '../utils/disk';

const DEFAULT_LEVEL = 0;

export default class DiskGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: DEFAULT_LEVEL
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.DISK_GAME;

    this._complete = false;
  }

  get data() {
    return this.store.data.get('disk');
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  start() {
    this._level = DEFAULT_LEVEL;
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
      this._setDiskColor(stripId, this.gameConfig.CONTROL_PANEL_INTENSITY, this.gameConfig.CONTROL_PANEL_COLOR);
    }
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
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
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

    const disk = this.store.data.get('disks').get(diskId);

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
    const positivePanels = ['5','6','7','8','9'];
    const negativePanels = ['4','3','2','1','0'];
    let positivePanel = positivePanels.findIndex(isActive);
    let negativePanel = negativePanels.findIndex(isActive);

    if (positivePanel >= 0 && negativePanel >= 0) {
      // FIXME: Set conflict
      this._setDiskColor(stripId, this.gameConfig.CONFLICT_INTENSITY, this.config.COLORS.ERROR);
    }
    else {
      let speed = 0;
      let panelIds = [];
      if (positivePanel === -1 && negativePanel === -1) {
        speed = 0;
      }
      else if (positivePanel >= 0) {
        speed = (positivePanel + 1);
        for (let i=0;i<=positivePanel;i++) panelIds.push(positivePanels[i]);
      }
      else {
        speed = -(negativePanel + 1);
        for (let i=0;i<=negativePanel;i++) panelIds.push(negativePanels[i]);
      }

      disk.setTargetSpeed(speed * this.gameConfig.MAX_SPEED / 5);

      const lightArray = this._lights;
      lightArray.setIntensity(stripId, null, this.gameConfig.CONTROL_PANEL_INTENSITY);
      lightArray.setColor(stripId, null, this.gameConfig.CONTROL_PANEL_COLOR);
      const setPanels = (panels, index) => {
        for (let i=0;i<5;i++) {
          if (index >= i) {
            lightArray.setIntensity(stripId, panels[i], this.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY);
            lightArray.setColor(stripId, panels[i], this.store.userColor);
          }
        }
      };
      if (speed > 0) setPanels(positivePanels, positivePanel);
      else if (speed < 0) setPanels(negativePanels, negativePanel);
    }
  }

  /**
   * Called when disks move (comes from the physical disk model)
   */
  _actionDiskUpdate(payload) {
    const {diskId, position} = payload;

    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);

    if (typeof position !== 'undefined') {
      disk.rotateTo(position);
    }

    if (!this.store.isStatusSuccess) {
      // FIXME:
      // Instead of just checking for the win condition, we want to:
      // - If Disk 0 or Disk 2 (the disks with the boundary part of the pattern) is in the
      //   correct location for a minimum amount of time, we trigger the Single Disk Success event

      // Single Disk Success Event
      // - Play success sounds (AudioView)
      // - UI LEDS and disk LED turns location color
      // - Lock this disk in position; disable any future interaction
      // - From now on, allow Disk 1 to trigger a Single Disk Success Event
      this._checkWinConditions();
    }
  }

  _actionFinishStatusAnimation() {
    if (this._complete) this.store.moveToNextGame();
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
    let totalError = 0;
    let correctdisks = {};
    const disks = this.store.data.get('disks');
    for (let markerId of Object.keys(this._levelConfig)) {
      correctdisks[markerId] = 0;
      const markerConfig = this._levelConfig[markerId];
      let markerError = 0;
      for (let diskId of Object.keys(markerConfig)) {
        const zone = markerConfig[diskId];
        const diskPos = disks.get(diskId).getPosition();
        const diskError = this._distanceFromZone(diskPos, zone);
        if (diskError === 0) correctdisks[markerId]++;
//        console.debug(`${markerId} ${diskId}: ${diskError}`);
        markerError += diskError;
      }
//      console.debug(`${markerId}: ${markerError}`);
      totalError += markerError;
    }
//    console.debug(`Total error: ${totalError}`);

    if (correctdisks.marker0 === 3 &&
        (correctdisks.marker1 === 1 || correctdisks.marker1 === 2) &&
        correctdisks.marker2 === 3) {
      this._winGame();
    }
  }

  // FIXME: move these public methods up
  getMarkerScore(markerId) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._complete) return 0;

    const disks = this.store.data.get('disks');
    const markerConfig = this._levelConfig[markerId];
    let markerError = 0;
    for (let diskId of Object.keys(markerConfig)) {
      const zone = markerConfig[diskId];
      const diskPos = disks.get(diskId).getPosition();
      markerError += this._distanceFromZone(diskPos, zone);
    }
    return markerError;
  }

  // FIXME: move these public methods up
  getDiskScore(diskId) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._complete) return 0;

    const disks = this.store.data.get('disks');
    let delta = this._targetPositions[diskId] - disks.get(diskId).getPosition();
    while (delta <= -180) delta += 360;
    while (delta > 180) delta -= 360;
    return Math.abs(delta);
  }

  /**
   * Current score (the total number of degrees away from solution).
   * For 3 disks, this will be between 0 and 540
   */
  getScore(disks) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._complete) return 0;

    let distance = 0;
    for (let diskId of Object.keys(this._targetPositions)) {
      distance += this.getDiskScore(diskId);
    }
    return distance;
  }

  _winGame() {
    this.store.data.get('lights').deactivateAll();
    this._stopAllDisks();

    this.store.setSuccessStatus();

    let level = this._level + 1;
    if (level >= this._levels) {
      this._complete = true;
    }

    this._level = level;
  }

  _stopAllDisks() {
    const disks = this.store.data.get('disks');

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
}
