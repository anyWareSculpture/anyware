import SculptureActionCreator from '../actions/sculpture-action-creator';

export default class PanelAnimation {
  static NONE = "none";
  static RUNNING = "running";
  static CANCELLED = "cancelled";
  static COMPLETED = "completed";

  constructor(frames, completeCallback) {
    this.frames = frames;
    if (completeCallback) {
      this.completeCallback = completeCallback;
      this.runCompleteCallback = true;
    }
    this.state = PanelAnimation.NONE;
  }

  /**
   * @returns {Boolean} If the animation is currently running
   */
  isRunning() {
    return this.state === PanelAnimation.RUNNING;
  }

  /**
   * @returns {Boolean} If the animation is currently stopped
   */
  isCancelled() {
    return this.state === PanelAnimation.CANCELLED;
  }

  /**
   * Cancels the animation wherever it is, will take effect on the next frame.
   * If runCompletionCallback is true, the complete callback will still be called
   * (with its cancelled argument set to true).
   */
  cancel(runCompletionCallback) {
    this.state = PanelAnimation.CANCELLED;
    this.runCompleteCallback = runCompletionCallback;
  }

  /**
   * Any setup work before the animation begins
   */
  before() {
    this.state = PanelAnimation.RUNNING;
  }

  /**
   * Goes through each frame and asynchronously plays each frame
   * The default behaviour is usually sufficient for most cases
   * @param {Dispatcher} dispatcher - The dispatcher instance
   */
  play(dispatcher) {
    this.before();
    this.currentFrame = -1;
    this.sculptureActionCreator = new SculptureActionCreator(dispatcher);

    this.playNextFrame();
  }

  /**
   * Any teardown work to be done after the animation finishes
   * By default this sets state to stopped and calls the complete callback
   */
  after() {
    const wasCancelled = this.isCancelled()
    if (!wasCancelled) this.state = PanelAnimation.COMPLETED;
    if (this.runCompleteCallback) this.completeCallback(wasCancelled);
  }

  /**
   * Called by play to run the next frame
   * Usually it isn't necessary to override this
   */
  playNextFrame() {
    this.currentFrame = this.currentFrame + 1;

    if (this.currentFrame >= this.frames.length || this.isCancelled()) {
      this.executeAsAction(() => this.after());
    }
    else {
      const frame = this.frames[this.currentFrame];
      setTimeout(() => {
        if (this.isRunning()) this.executeAsAction(() => frame.run());
        this.playNextFrame();
      }, frame.timeOffset);
    }
  }

  executeAsAction(callback) {
    this.sculptureActionCreator.sendAnimationFrame(callback);
  }
}
