import TrackedData from './tracked-data';

export default class Disk extends TrackedData {

  constructor(position = 0) {
    super({
      position: position,
      user: "",
      targetSpeed: 0,
      autoPosition: undefined, // Used for auto-moveTo (shuffle, lock)
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
    this.set('user', user, props);
  }

  getUser() {
    return this.get('user');
  }

  // Set to undefined to remove target positioning
  setAutoPosition(autoPosition, props) {
    return this.set('autoPosition', autoPosition, props);
  }

  getAutoPosition() {
    return this.get('autoPosition');
  }

  stop() {
    this.setTargetSpeed(0);
    this.setAutoPosition(undefined);
  }

}
