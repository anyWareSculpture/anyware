import TrackedData from './tracked-data';

export default class Disk extends TrackedData {

  constructor(position = 0) {
    super({
      position: position,
      user: "",
      targetSpeed: 0,
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

  stop() {
    this.setTargetSpeed(0);
  }

  setUser(user, props) {
    this.set('user', user, props);
  }

  getUser() {
    return this.get('user');
  }
}
