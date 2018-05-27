import events from 'events';

const MAX_ACCEL = 100;      // degrees/sec^2
const MAX_DECEL = 300;      // degrees/sec^2
const AUTO_SPEED = 36;      // degrees/sec

const between = (num, first, last) => (first < last ? num >= first && num <= last : num >= last && num <= first);

// Check if @param num is between @param first and @param last
const isAngleBetween = (num, first, last) => {
  // Make angles relative to num and normalize to [-180,180]
  let df = (first - num) % 360;
  let dl = (last - num) % 360;
  if (Math.abs(df) > 180) df -= 360*Math.sign(df);
  if (Math.abs(dl) > 180) dl -= 360*Math.sign(dl);
  return Math.sign(df) !== Math.sign(dl);
};

/**
 * A physical model for disk movement.
 * There are 3 mutually exclusive ways of making this work:
 * 1) Set targetPosition: Will jump to this position on next tick
 * 2) Set targetSpeed: Will accelerate towards the given speed (positive = clockwise)
 * 3) Set autoPosition: Will move towards the given position
 */
export default class DiskModel extends events.EventEmitter {
  constructor() {
    super();
    this._pos = 0; // clockwise degrees
    this._autoPos = false;
    this.lasttick = 0;
    this.stop();
  }

  start() {
    this.lasttick = Date.now();
  }

  stop() {
    this.acceleration = 0;
    this.speed = 0;
    this._targetSpeed = 0; // Wanted speed (signed; positive is clockwise)
  }

  tick() {
    let newpos;

    if (this._targetPos !== undefined) {
      newpos = this._targetPos;
      delete this._targetPos;
    }
    else {
      // dtms = ms since last tick
      const now = Date.now();
      const dtms = now - this.lasttick;
      this.lasttick = now;
      
      // dt = sec since last tick
      const dt = dtms / 1000;
      
      // Without acceleration
      
      // ds = v * dt;
      //    let newpos = (this._pos + this.speed * dt) % 360;
      //    if (newpos < 0) newpos += 360;
      
      // With acceleration
      
      // v = v0 + a * t
      const oldspeed = this.speed;
      const newspeed = this.speed + this.acceleration * dt;
        
      // Clamp on overshoot
      if (between(this._targetSpeed, this.speed, newspeed)) {
        this.speed = this._targetSpeed;
        this.acceleration = 0;
      }
      else {
        this.speed = newspeed;
      }

      // ds = v0 * t + 1/2 * dv * dt
      newpos = this._pos + this.speed * dt + 0.5 * (this.speed - oldspeed) * dt;

      if (this._autoPos !== false && isAngleBetween(this._autoPos, this._pos, newpos)) {
        newpos = this._autoPos;
        this._autoPos = false;
        this.stop();
        this.emit('autoPositionReached', newpos);
      }
    }

    if (newpos < 0) newpos += 360;
    newpos = newpos % 360;

    // Emit position if it changed.
    // Positions are quantized prior to emitting to avoid flooding with events
    if (newpos !== this._pos) {
      const quantizedNew = Math.round(newpos*2)/2;
      const quantizedPos = Math.round(this._pos*2)/2;

      this._pos = newpos;
      if (quantizedNew !== quantizedPos) {
        this.emit('position', this._pos);
      }
    }
  }

  get position() {
    return this._pos;
  }

  /**
   * Sets absolute position, overriding the physical model
   * Will be updated on the next tick
   */
  set targetPosition(pos) {
    this._targetPos = pos;
    this._autoPos = false;
  }

  get targetPosition() {
    return this._targetPos;
  }

  clearTargetPosition() {
    delete this._targetPos;
  }

  /**
   * Set target speed in degrees/sec.
   * Positive values is clockwise speed, negative values is counter-clockwise speed
   */
  set targetSpeed(targetSpeed) {
    console.log(`DiskModel: set targetSpeed(${targetSpeed})`);
    this._targetSpeed = targetSpeed;
    if (targetSpeed === this.speed) {
      this.acceleration = 0;
    }
    else {
      const direction = Math.sign(targetSpeed - this.speed);
      this.acceleration = direction * (targetSpeed === 0 ? MAX_DECEL : MAX_ACCEL);
    }
  }

  get targetSpeed() {
    return this._targetSpeed;
  }

  /**
   * Sets auto position, will make the physical model move towards this position
   */
  set autoPosition(pos) {
    if (pos === false) {
      this._autoPos = false;
      this.targetSpeed = 0; // Kill any speed since targetSpeed is automated by autoPos
      return;
    }
    this._autoPos = (pos + 360) % 360;
    let delta = this._autoPos - this._pos;
    this.targetSpeed = Math.sign(delta) * AUTO_SPEED * ((Math.abs(delta) < 180) ? 1 : -1);
    this.clearTargetPosition();
  }

  get autoPosition() {
    return this._autoPos;
  }
}
