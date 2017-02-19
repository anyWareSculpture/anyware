import events from 'events';

const MAX_ACCEL = 100;      // degrees/sec^2

const between = (num, first, last) => (first < last ? num >= first && num <= last : num >= last && num <= first);

export default class DiskModel extends events.EventEmitter {
  static MAX_SPEED = 360 / 15; // degrees/sec

  constructor() {
    super();
    this.pos = 0; // clockwise degrees
    this.lasttick = 0;
    this.stop();
  }

  start() {
    this.lasttick = Date.now();
  }

  stop() {
    this.acceleration = 0;
    this.speed = 0;
    this.targetSpeed = 0; // Wanted speed (signed; positive is clockwise)
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
//    let newpos = (this.pos + this.speed * dt) % 360;
//    if (newpos < 0) newpos += 360;

    // With acceleration

    // ds = v0 * t + 1/2 * a * t^2
    let newpos = this.pos + this.speed * dt + 0.5 * this.acceleration * dt*dt;
    if (newpos < 0) newpos += 360;
    newpos = newpos % 360;
    if (this.targetPos !== undefined && between(this.targetPos, this.pos, newpos)) {
      newpos = this.targetPos;
      delete this.targetPos;
      this.acceleration = 0;
      this.speed = 0;
    }
    else {
      // v = v0 + a * t
      const newspeed = this.speed + this.acceleration * dt;
      
      // Clamp on overshoot
      if (between(this.targetSpeed, this.speed, newspeed)) {
        this.speed = this.targetSpeed;
        this.acceleration = 0;
      }
      else {
        this.speed = newspeed;
      }
    }

    // Emit position if it changed.
    // Positions are quantized prior to emitting to avoid flooding with events
    if (newpos !== this.pos) {
      const quantizedNew = Math.round(newpos);
      const quantizedPos = Math.round(this.pos);

      this.pos = newpos;
      if (quantizedNew !== quantizedPos) this.emit('position', this.pos);
    }
  }

  get position() {
    return this.pos;
  }

  // NB! Sets absolute position, overriding the physical model
  set position(pos) {
    this.pos = pos;
  }

  /**
   * Set target speed in degrees/sec.
   * Positive values is clockwise speed, negative values is counter-clockwise speed
   */
  setTargetSpeed(targetSpeed) {
    this.targetSpeed = targetSpeed;
    this.acceleration = targetSpeed === this.speed ? 0 : targetSpeed > this.speed ? MAX_ACCEL : -MAX_ACCEL;
  }

  // Set target position. This will override direction and move towards the given position
  setTargetPosition(targetPos) {
    this.targetPos = targetPos;
    // Find shortest target position, and accelerate in that direction
    const diff = (targetPos - this.pos + 180 + 360) % 360 - 180;
    this.acceleration = Math.sign(diff) * MAX_ACCEL;
    this.targetSpeed = Math.sign(diff) * DiskModel.MAX_SPEED;
  }

  clearTargetPosition() {
    delete this.targetPos;
  }
}
