import BaseActionCreator from './base-action-creator';

export default class DisksActionCreator extends BaseActionCreator {
  // Action types
  static DISK_UPDATE = "disk-update";

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
}
