import TrackedData from './tracked-data';

export default class Disk extends TrackedData {

  constructor(position = 0) {
    super({
      position: position,
      user: '',
      lastUser: '',
      targetSpeed: 0,
      // Used for auto-moveTo (shuffle, lock). false if no auto position is set 
      // Note: false since we need a real value to make the streaming client transport this value
      autoPosition: false,
      locked: false, // disk is locked (implies master-controlled)
    });
  }

  setTargetSpeed(speed, props) {
    return this.set('targetSpeed', speed, props);
  }

  getTargetSpeed() {
    return this.get('targetSpeed');
  }

  setPosition(position, props) {
    this.set('position', position, props);
  }

  getPosition() {
    return this.get('position');
  }

  setUser(user, props) {
    const lastUser = this.getUser();
    if (lastUser !== '') this.set('lastUser', lastUser, props);
    return this.set('user', user, props);
  }

  getUser() {
    return this.get('user');
  }

  hasUser() {
    return this.getUser() !== '';
  }

  getLastUser() {
    return this.get('lastUser');
  }

  // Set to undefined to remove target positioning
  setAutoPosition(autoPosition, props) {
    return this.set('autoPosition', autoPosition, props);
  }

  hasAutoPosition() {
    return this.get('autoPosition') !== false;
  }

  getAutoPosition() {
    return this.get('autoPosition');
  }

  setLocked(locked, props) {
    return this.set('locked', locked, props);
  }

  getLocked() {
    return this.get('locked');
  }

  stop() {
    this.setTargetSpeed(0);
    this.setAutoPosition(false);
  }

}
