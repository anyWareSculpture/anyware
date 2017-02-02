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
    const payloadBody = {};
    if (position !== null) {
      payloadBody.position = position;
    }

    if (Object.keys(payloadBody).length > 0) {
      payloadBody.diskId = diskId;

      this._dispatch(DisksActionCreator.DISK_UPDATE, payloadBody);
    }
  }
}
