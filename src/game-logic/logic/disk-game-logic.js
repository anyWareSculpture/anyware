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
    const controlMappings = this.gameConfig.CONTROL_MAPPINGS;
    // FIXME: Clean this up
    for (let diskId of Object.keys(controlMappings.CLOCKWISE_PANELS)) {
      for (let panelId of controlMappings.CLOCKWISE_PANELS[diskId]) {
        this._lights.setIntensity(controlMappings.CLOCKWISE_STRIP, panelId, this.gameConfig.CONTROL_PANEL_INTENSITY);
      }
    }
    for (let diskId of Object.keys(controlMappings.COUNTERCLOCKWISE_PANELS)) {
      for (let panelId of controlMappings.COUNTERCLOCKWISE_PANELS[diskId]) {
        this._lights.setIntensity(controlMappings.COUNTERCLOCKWISE_STRIP, panelId, this.gameConfig.CONTROL_PANEL_INTENSITY);
      }
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

  _actionPanelPressed(payload) {
    // FIXME: Break up this method
    if (this._complete) {
      return;
    }

    const controlMappings = this.gameConfig.CONTROL_MAPPINGS;
    const {stripId, panelId} = payload;

    let panels, direction;
    if (stripId === controlMappings.CLOCKWISE_STRIP) {
      panels = controlMappings.CLOCKWISE_PANELS;
      direction = Disk.CLOCKWISE;
    }
    else if (stripId === controlMappings.COUNTERCLOCKWISE_STRIP) {
      panels = controlMappings.COUNTERCLOCKWISE_PANELS;
      direction = Disk.COUNTERCLOCKWISE;
    }
    else {
      // just go with whatever default behaviour
      return;
    }

    let diskId = null, panelIds;
    for (let panelsDiskId of Object.keys(panels)) {
      panelIds = panels[panelsDiskId];
      if (panelIds.includes(panelId)) {
        diskId = panelsDiskId;
        break;
      }
    }

    const lightArray = this._lights;
    if (diskId === null) {
      // Override the default behaviour and keep this panel off because
      // it is still a special panel
      // It just doesn't do anything
      // FIXME: Magic literal
      lightArray.setIntensity(stripId, panelId, 0);
      return;
    }
    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);

    const activePanels = panelIds.reduce((total, currPanelId) => {
      return total + (lightArray.isActive(stripId, currPanelId) ? 1 : 0);
    }, 0);

    // Only need to activate/deactivate them once
    if (activePanels === 1) {
      this._activateDisk(diskId, direction, stripId, panelIds);
    }
    else if (activePanels === 0) {
      this._deactivateDisk(diskId, direction, stripId, panelIds);
    }

    if (disk.isConflicting) {
      this._setDiskControlsColor(diskId, this.config.COLORS.ERROR);
    }
  }

  _actionDiskUpdate(payload) {
    const {diskId, position, direction, state} = payload;

    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);

    if (typeof position !== 'undefined') {
      disk.rotateTo(position);
    }
    if (typeof direction !== 'undefined') {
      disk.setDirection(direction);
    }
    if (typeof state !== 'undefined') {
      disk.setState(state);
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
      this._checkWinConditions(disks);
    }
  }

  _actionFinishStatusAnimation() {
    if (this._complete) this.store.moveToNextGame();
  }

  _activateDisk(diskId, direction, stripId, panelIds) {
    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);
    disk.setDirection(direction);

    panelIds.forEach((panelId) => {
      this._lights.setIntensity(stripId, panelId, this.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY);
      this._lights.setColor(stripId, panelId, this.store.userColor);
    });
  }

  _deactivateDisk(diskId, direction, stripId, panelIds) {
    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);
    if (!disk.isStopped) {
      // This fixes a bug where a user wins the level with their hand on the
      // panel and then takes it off. We stop all the disks between levels so
      // all the disks are already off when they let go. This can cause errors
      // FIXME: Determine if this check should actually be in Disk#unsetDirection
      disk.unsetDirection(direction);
    }

    panelIds.forEach((panelId) => {
      // FIXME: Only deactivate if both panels are inactive
      this._lights.setIntensity(stripId, panelId, this.gameConfig.CONTROL_PANEL_INTENSITY);
      this._lights.setDefaultColor(stripId, panelId);
    });
  }

  _setDiskControlsColor(diskId, color) {
    const controlMappings = this.gameConfig.CONTROL_MAPPINGS;

    const lightArray = this._lights;
    for (let panelId of controlMappings.CLOCKWISE_PANELS[diskId]) {
      lightArray.setColor(controlMappings.CLOCKWISE_STRIP, panelId, color);
    }
    for (let panelId of controlMappings.COUNTERCLOCKWISE_PANELS[diskId]) {
      lightArray.setColor(controlMappings.COUNTERCLOCKWISE_STRIP, panelId, color);
    }
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
  _checkWinConditions(disks) {
    let totalError = 0;
    let correctdisks = {};
    for (let markerId of Object.keys(this._levelConfig)) {
      correctdisks[markerId] = 0;
      const markerConfig = this._levelConfig[markerId];
      let markerError = 0;
      for (let diskId of Object.keys(markerConfig)) {
        const zone = markerConfig[diskId];
        const diskPos = disks.get(diskId).getPosition();
        const diskError = this._distanceFromZone(diskPos, zone);
        if (diskError === 0) correctdisks[markerId]++;
        console.debug(`${markerId} ${diskId}: ${diskError}`);
        markerError += diskError;
      }
      console.debug(`${markerId}: ${markerError}`);
      totalError += markerError;
    }
    console.debug(`Total error: ${totalError}`);

    if (correctdisks.marker0 === 3 &&
        (correctdisks.marker1 === 1 || correctdisks.marker1 === 2) &&
        correctdisks.marker2 === 3) {
      this._winGame();
    }
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
