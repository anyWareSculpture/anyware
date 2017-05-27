const DEFAULT_TIME_OFFSET = 1000; // ms

export default class Frame {
  /**
   * Creates an instance of the Frame class
   * @param {Number} timeOffset - The time to wait before playing this frame
   * @constructor
   */
  constructor(runMethod, timeOffset=DEFAULT_TIME_OFFSET) {
    this.runMethod = runMethod;
    this.timeOffset = timeOffset;
  }

  /**
   * Runs the frame
   */
  run() {
    this.runMethod();
  }
}
