import BaseActionCreator from './base-action-creator';

export default class DisksActionCreator extends BaseActionCreator {
  // Action types
  static DISK_UPDATE = "disk-update";
  static OWNERSHIP_TIMEOUT = "ownership-timeout";
  static TAP_TIMEOUT = "tap-timeout";

  /**
   * Sends an action to the dispatcher representing when a disk position changes.
   * Only sends action if an argument is provided to the object
   * @param {String} diskId - The ID of the disk that was updated
   */
  sendDiskUpdate(diskId, {position}) {
    if (position !== null) {
      this._dispatch(DisksActionCreator.DISK_UPDATE, { position, diskId });
    }
  }

  /**
   * Signals the disk game that ownership of a strip is relinguished
   */
  sendOwnershipTimeout({stripId}) {
    this._dispatch(DisksActionCreator.OWNERSHIP_TIMEOUT, { stripId });
  }

  /**
   * Signals the disk game that a tap action has timed out
   */
  sendTapTimeout({stripId, panelId}) {
    this._dispatch(DisksActionCreator.TAP_TIMEOUT, { stripId, panelId });
  }

}
