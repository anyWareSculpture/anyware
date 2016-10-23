import events from 'events';
import Disk from './disk';

const MAX_SPEED = 360 / 15; // degrees/sec
const MAX_ACCEL = 100;      // degrees/sec^2

const clamp = (x, min, max) => Math.max(min, Math.min(x, max));

export default class DiskModel extends events.EventEmitter {
  constructor() {
    super();
    this.acceleration = 0; // Signed acceleration
    this.dir = Disk.STOPPED;
    this.pos = 0; // clockwise degrees
    this.speed = 0; // Unsigned speed
    this.speedsign = 1; // -1 or 1. negative means counterclockwise
    this.lasttick = 0;
  }

  start() {
    this.lasttick = Date.now();
  }

  tick() {
    // dtms = ms since last tick
    const now = Date.now();
    const dtms = now - this.lasttick;
    this.lasttick = now;

    // dt = sec since last tick
    const dt = dtms / 1000;

    // Without acceleration

    // ds = v * dt;
    let newpos = (this.pos + this.speedsign * this.speed * dt) % 360;
    if (newpos < 0) newpos += 360;

    // FIXME: With acceleration
/*
    // ds = v0 * t + 1/2 * a * t^2
    const newpos = this.pos + this.speedsign * this.speed * dt + 0.5 * this.acceleration * dt*dt;
    // FIXME: If we overshot target position, stop at target position

    // v = v0 + a * t
    this.speed = this.speedsign * this.speed + this.acceleration * dt;
    // If we're breaking, clamp to 0
    if (this.acceleration < 0) {
      this.speed = Math.max(this.speed, 0);
    }
    // If we're accelerating, handle speed sign changes
    else if (this.speed < 0) {
      this.speedsign *= -1;
    }
    this.speed = clamp(this.speed, 0, MAX_SPEED);
*/

    // Emit position if it changed.
    // FIXME: enforce a precision to avoid too many events?
    if (newpos !== this.pos) {
      this.pos = newpos;
      this.emit('position', this.pos);
    }
  }

  get direction() {
    return this.dir;
  }

  set direction(direction) {
    this.dir = direction;
    switch (direction) {
    case Disk.COUNTERCLOCKWISE:
//      this.acceleration = -MAX_ACCEL;
      this.speed = MAX_SPEED;
      this.speedsign = -1;
      break;
    case Disk.CLOCKWISE:
//      this.acceleration = MAX_ACCEL;
      this.speed = MAX_SPEED;
      this.speedsign = 1;
      break;
    default:
      this.speed = 0;
//      this.acceleration = this.speed > 0 ? -MAX_ACCEL : this.speed < 0 ? MAX_ACCEL : 0;
    }
  }

  get position() {
    return this.pos;
  }

  // NB! Sets absolute position, overriding the physical model
  set position(pos) {
    this.pos = pos;
  }

  // Set target position. This will override direction and move towards the given position
  setTargetPosition(targetPos) {
    this.targetPos = targetPos;
    // Find shortest target position, and accelerate in that direction
    const diff = (targetPos - this.pos + 180 + 360) % 360 - 180;
    this.acceleration = Math.sign(diff) * MAX_ACCEL;
  }

  clearTargetPosition() {
    delete this.targetPos;
  }
}
