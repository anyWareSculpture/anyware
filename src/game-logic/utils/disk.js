import TrackedData from './tracked-data';

export default class Disk extends TrackedData {

  constructor(position = 0) {
    super({
      position: position,
      user: "",
      targetSpeed: 0,
    });
  }

  setTargetSpeed(speed) {
    return this.set('targetSpeed', speed);
  }

  getTargetSpeed() {
    return this.get('targetSpeed');
  }

  rotateTo(position) {
    this.set('position', position);
  }

  getPosition() {
    return this.get('position');
  }

  stop() {
    this.setTargetSpeed(0);
  }

  setUser(user) {
    this.set('user', user);
  }

  getUser() {
    return this.get('user');
  }
}
