import COLORS from '../constants/colors';
import TrackedData from './tracked-data';

const DEFAULT_INTENSITY = 0;
const DEFAULT_COLOR = COLORS.WHITE;

export default class LightArray extends TrackedData {
  constructor(stripLengths, defaultIntensity = DEFAULT_INTENSITY, defaultColor = DEFAULT_COLOR) {
    const properties = {};
    const stripIds = Object.keys(stripLengths);
    for (let stripId of stripIds) {
      const strip = {};
      const panelIds = [];
      for (let panelId = 0; panelId < stripLengths[stripId]; panelId++) {
        panelId = '' + panelId;

        strip[panelId] = new TrackedData({
          intensity: defaultIntensity,
          color: defaultColor,
          active: false
        });

        panelIds.push(panelId);
      }
      properties[stripId] = new TrackedData({
        maxIntensity: 100,
        panels: new TrackedData(strip)
      });
      properties[stripId].panelIds = panelIds;
    }
    super(properties);

    this.stripIds = stripIds;
    this.defaultIntensity = defaultIntensity;
    this.defaultColor = defaultColor;
  }

  /**
   * Sets the max intensity for the given strip.
   * If stripId is null, sets the max intensity for all strips
   */
  setMaxIntensity(intensity, stripId = null, timestamp) {
    const stripsToModify = stripId === null ? this.stripIds : [stripId];

    for (let targetStripId of stripsToModify) {
      const strip = this.get(targetStripId);
      strip.set("maxIntensity", intensity, timestamp);
    }
  }

  getMaxIntensity(stripId) {
    return this.get(stripId).get("maxIntensity");
  }

  getPanel(stripId, panelId) {
    return this.get(stripId).get("panels").get(panelId);
  }

  setToDefaultColor(stripId, panelId) {
    return this.setColor(stripId, panelId, this.defaultColor);
  }

  /**
   *  If panelId is null, we'll set the color for all panels in the given strip.
   */
  setColor(stripId, panelId, color, timestamp) {
    this._applyToOnePanelOrAll(stripId, panelId, (panel) => panel.set("color", color, timestamp));
  }

  getColor(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("color");
  }

  getIntensity(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("intensity");
  }

  setToDefaultIntensity(stripId, panelId) {
    return this.setIntensity(stripId, panelId, this.defaultIntensity);
  }

  /**
   *  If panelId is null, we'll set the color for all panels in the given strip.
   */
  setIntensity(stripId, panelId, intensity, timestamp) {
    this._applyToOnePanelOrAll(stripId, panelId, (panel) => panel.set("intensity", intensity, timestamp));
  }

  isActive(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("active");
  }

  setActive(stripId, panelId, active = true, timestamp) {
    const panel = this.getPanel(stripId, panelId);

    panel.set("active", active, timestamp);
  }

  deactivateAll(stripId = null) {
    const targetStripIds = stripId === null ? this.stripIds : [stripId];

    for (let targetStripId of targetStripIds) {
      for (let panelId of this.get(targetStripId).panelIds) {
        this.setActive(targetStripId, panelId, false);
      }
    }
  }

  _applyToOnePanelOrAll(stripId, panelId = null, panelFunc) {
    const panels = this._getOnePanelOrAll(stripId, panelId);
    panels.forEach(panelFunc);
  }

  _getOnePanelOrAll(stripId, panelId) {
    if (panelId === null) {
      // this code is necessary because there is no Object.values() function
      // FIXME: ES2017 added Object.values(). Make sure we polyfill correctly before enabling that
      const stripPanels = this.get(stripId).get("panels");
      // Old code
      // return [for (stripPanelId of stripPanels) stripPanels.get(stripPanelId)];
      // FIXME: New code, untested
      return Array.from(stripPanels).map((id) => stripPanels.get(id));
    }
    else {
      return [this.getPanel(stripId, panelId)];
    }
  }
}
