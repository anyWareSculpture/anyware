/* global XMLHttpRequest, AudioContext, NodeAudioContext */

import assert from 'assert';
import path from 'path';

let context = null;
let isNode = false;

// FIXME: Mostly to optimize memory usage, consider caching the buffer to allow reuse of buffers using the same URL

/**
 * Simple Sound, supports looping
 */
export class Sound {
  constructor({ url, loop = false, fadeIn = 0, fadeOut = fadeIn, rate = 1, loopFreq = 0, gain = 1, name = path.basename(url, '.wav') } = {}) {
    assert(url);

    this.url = url;
    this.params = {
      loop,
      fadeIn,
      fadeOut,
      rate,
      loopFreq,
      gain
    };
    this.name = name;
    this.gain = context.createGain();
    this.head = this.gain;
    if (!isNode) this.gain.connect(context.destination);
  }

  /**
   *  @returns {Promise} a promise to fully load all needed assets for this sound
   */
  load() {
    // FIXME: Node support:
    //    if (isNode) fetch = promisify(fs.readFile)(__dirname + '/../' + this.url).then(buffer => buffer);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        if (xhr.status === 200) resolve(xhr.response);
        else reject(xhr.response);
      };
      xhr.onerror = e => reject(e);
      xhr.send();
    })
     .then(buffer => {
       // console.debug(`loaded ${this.url} - ${buffer.byteLength} bytes`);
       if (!buffer) console.log(`Buffer error: ${this.url}`);
       return context.decodeAudioData(buffer);
     })
      .then(soundBuffer => {
        // console.debug(`decoded ${this.url}`);
        this.buffer = soundBuffer;
        return this;
      });
  }

  // Allows overriding parameters
  play(parameters = {}) {

    const params = Object.assign({}, this.params, parameters);

    // Failsafe: If we're playing a looped sound twice, make sure the previous one is stopped
    // This is to work around an issue where disk game sounds are started multiple times
    // (due to network congestion?)
    if (params.loop && this.source) this.stop();

    if (params.fadeIn > 0) {
      this.gain.gain.setValueAtTime(0, context.currentTime);
      this.gain.gain.linearRampToValueAtTime(params.gain, context.currentTime + params.fadeIn);
    }

    this.source = context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = params.loop;
    if (params.rate !== 1) this.source.playbackRate.value = params.rate;
    if (params.loop) this.source.loopEnd = params.loopFreq === 0 ? 0 : 1/params.loopFreq;
    this.gain.gain.value = params.gain;
    this.source.connect(this.head);
    if (isNode) this.gain.connect(context.destination);
    this.source.start(context.currentTime);
  }

  // Allows overriding parameters
  stop(parameters = {}) {
    const params = Object.assign({}, this.params, parameters);
    if (params.fadeOut > 0) {
      const volume = this.gain.gain.value;
      this.gain.gain.cancelScheduledValues(context.currentTime);
      this.gain.gain.setValueAtTime(volume, context.currentTime);
      this.gain.gain.linearRampToValueAtTime(0, context.currentTime + volume*params.fadeOut);
      this.gain.gain.setValueAtTime(1, context.currentTime + volume*params.fadeOut);
      if (this.source) {
        this.source.stop(context.currentTime + volume*params.fadeOut);
        delete this.source;
      }
    }
    else {
      if (this.source) {
        this.source.stop();
        delete this.source;
      }
    }
  }

  // Must start first
  fadeIn() {
    if (this.params.fadeIn > 0) {
      const volume = this.gain.gain.value;
      this.gain.gain.cancelScheduledValues(context.currentTime);
      this.gain.gain.setValueAtTime(volume, context.currentTime);
      this.gain.gain.linearRampToValueAtTime(this.params.gain, context.currentTime + this.params.fadeIn);
    }
    else {
      this.gain.gain.value = this.params.gain;
    }
  }

  // Will wait <delay> seconds before starting to fade out
  fadeOut({delay = 0} = {}) {
    if (this.params.fadeOut > 0) {
      const volume = this.gain.gain.value;
      this.gain.gain.cancelScheduledValues(context.currentTime);
      this.gain.gain.setValueAtTime(volume, context.currentTime);
      this.gain.gain.setValueAtTime(volume, context.currentTime + delay);
      this.gain.gain.linearRampToValueAtTime(0, context.currentTime + delay + volume*this.params.fadeOut);
    }
    else {
      this.gain.gain.value = 0;
    }
  }
}

/**
 * Sound with a VCF (Voltage Controlled Filter).
 * The VCF is currently hardcoded since we only use it once
 */
export class VCFSound extends Sound {
  constructor({ url, lfoFreq = 0.333, fadeIn = 0, fadeOut = fadeIn, gain = 1, name = path.basename(url, '.wav') } = {}) {
    super({url, loop: true, fadeIn, fadeOut, gain, name});
    this.params.lfoFreq = lfoFreq;
  }

  play() {
    // FIXME: If running on node.js we might not have BiquadFilter support
    if (!context.createBiquadFilter) return super.play();

    const lowpass = context.createBiquadFilter();
    lowpass.Q.value = 2;
    lowpass.frequency.value = 2200;
    lowpass.type = 'lowpass';
    lowpass.connect(this.head);
    this.head = lowpass;

    const lfogain = context.createGain();
    lfogain.gain.value = 2000;

    const lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = this.params.lfoFreq;
    lfogain.connect(lowpass.frequency);
    lfo.connect(lfogain);
    lfo.start(context.currentTime);

    super.play();
  }

  stop() {
    super.stop();
  }
}

export function init() {
  if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
  }
  else if (typeof NodeAudioContext !== "undefined") {
    isNode = true;
    context = new NodeAudioContext();
  }
  else {
    throw new Error('AudioContext not supported. :(');
  }
  return context;
}
