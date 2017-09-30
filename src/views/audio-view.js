import _ from 'lodash';

import SculptureStore from '../game-logic/sculpture-store';
import HandshakeGameLogic from '../game-logic/logic/handshake-game-logic';
import GAMES from '../game-logic/constants/games';
import TrackedPanels from '../game-logic/utils/tracked-panels';
import Disk from '../game-logic/utils/disk';
import * as AudioAPI from './audio-api';
const {Sound, VCFSound} = AudioAPI;

export default class AudioView {
  constructor(store, config) {
    this.store = store;
    this.config = config;
    AudioAPI.init();
  }

  reset() {
  }

  /**
   * Loads all sounds.
   * @param {function(err)} callback Called when done
   */
  load(callback) {
    let lfoFreq = 1/3;
    if (this.config.hasOwnProperty('HANDSHAKE_HARDWARE') &&
        this.config.HANDSHAKE_HARDWARE.hasOwnProperty('PULSE_DELAY')) {
      lfoFreq = 1000/this.config.HANDSHAKE_HARDWARE.PULSE_DELAY;
    }

    // Maps logical sound identifiers to filenames. We'll load these sounds next.
    this.sounds = {
      alone: {
        ambient: new VCFSound({url: 'sounds/Alone_Mode/Pulse_Amb_Loop.wav', lfoFreq, fadeIn: 3, gain: 0.4}),
        handshake: new Sound({url: 'sounds/Alone_Mode/Hand_Shake_01.wav'})
      },
      mole: {
        success: new Sound({url: 'sounds/Game_01/G01_Success_01.wav', gain: 0.5}),
        lastPanelSuccess: new Sound({url: 'sounds/Game_01/G01_Success_30e.wav', gain: 0.5}),
        ping: new Sound({url: 'sounds/Game_01/G01_Success_01b.wav', gain: 0.5}),
        panels: [0, 1, 2].map(stripId => _.range(10).map(panelId => new Sound({url: `sounds/Game_01/G01_LED_${("0"+(stripId*10+panelId+1)).slice(-2)}.wav`, gain: 0.33})))
      },
      disk: {
        fadein: new Sound({url: 'sounds/Game_02/G02_Apparition_01.wav'}),
        disk2: new Sound({url: 'sounds/Game_02/G02_Disk_Loop_C2.wav', loop: true, gain: 0.3, fadeIn: 2}),
        disk1: new Sound({url: 'sounds/Game_02/G02_Disk_Loop_Eb2.wav', loop: true, gain: 0.3, fadeIn: 2}),
        disk0: new Sound({url: 'sounds/Game_02/G02_Disk_Loop_G2.wav', loop: true, gain: 0.3, fadeIn: 2}),
        success: new Sound({url: 'sounds/Game_02/G02_Success_01.wav'}),
        show: new Sound({url: 'sounds/Game_02/G02_Success_final_01.wav', gain: 0.5}),
      },
      simon: {
        panels: [0, 1, 2].map(stripId => _.range(10).map(panelId => new Sound({url: `sounds/Game_03/G03_LED_${("0"+(stripId*10+panelId+1)).slice(-2)}.wav`, gain: 0.5}))),
        success: new Sound({url: 'sounds/Game_03/G03_Success_01.wav', gain: 0.5}),
        failure: new Sound({url: 'sounds/Game_03/G03_Negative_01.wav', gain: 0.5}),
        show: new Sound({url: 'sounds/Game_03/G03_Light_Show_01.wav', gain: 1})
      }
    };

    // Traverses this.sounds and replace the filenames with valid sound objects.
    // Populates this._promises
    this._promises = [];
    this._traverse(this.sounds, this._promises);

    // _traverse() will create promises. We call the callback once all promises resolve
    console.log(`${this._promises.length} promises created`);
    Promise.all(this._promises)
      // Don't listen to events until we've loaded all sounds
      .then(() => {
        this.store.on(SculptureStore.EVENT_CHANGE, this._handleChanges.bind(this));
        this.store.on(SculptureStore.EVENT_LOCAL_CHANGE, this._handleLocalChanges.bind(this));
      })
      .then(() => callback(null))
      .catch((reason) => callback(reason));
  }

  /*
   * Traverses sound config objects and replaces nodes with valid, loaded, sounds
   * populates the given promises array with promises of loaded sounds
   */
  _traverse(soundconf, promises) {
    for (let key in soundconf) {
      const value = soundconf[key];
      let sound;
      if (typeof value === 'string') sound = soundconf[key] = new Sound({url: value});
      else if (value instanceof Sound) sound = value;

      if (sound) promises.push(sound.load());
      else this._traverse(value, promises);
    }
  }

  _handleChanges(changes) {
    if (this.store.isPlayingHandshakeGame) this._handleHandshakeGame(changes);
    if (this.store.isPlayingMoleGame) this._handleMoleGame(changes);
    if (this.store.isPlayingDiskGame) this._handleDiskGame(changes);
    if (this.store.isPlayingSimonGame) this._handleSimonGame(changes);
  }

  _handleLocalChanges() {
    if (this.store.isPlayingDiskGame) this._handleLocalDiskGame();
  }

  _handleHandshakeGame(changes) {
    // On startup, or when Start State becomes active, play ambient sound
    if (changes.currentGame === GAMES.HANDSHAKE) this.sounds.alone.ambient.play();

    if (changes.handshake && changes.handshake.state === HandshakeGameLogic.STATE_ACTIVATING) {
      // FIXME: Determine volume based on if _our_ hand initiated the handshake
//      if (changes.handshakes[this.store.me]) -> max volume, else low volume
//      gain: (stripId === simongame.currentStrip) ? 1 : 0.1

      this.sounds.alone.ambient.stop();
      this.sounds.alone.handshake.play();
    }
  }

  _handleMoleGame(changes) {
    const lightChanges = changes.lights;
    const moleChanges = changes.mole;
    if (!lightChanges && !moleChanges || !this.store.isReady) return;

    const molegame = this.store.currentGameLogic;

    /*
      Mole game sounds:
      o Panel activated (white light -> ping)
      o Correct panel touched (location color -> success)
      o Last panel touched (final sound)
      o End of game sound (remaining lights off -> ping)
    */

    // Correct panel touched
    if (moleChanges && moleChanges.panelCount > 0) {
      if (moleChanges.panelCount === this.config.MOLE_GAME.GAME_END) {
        // Last panel
        this.sounds.mole.lastPanelSuccess.play();
      }
      else {
        // Mid-game panel
        this.sounds.mole.success.play();
      }
      return;
    }

    if (moleChanges && moleChanges.complete) {
      this.sounds.mole.ping.play();
    }

    // If a panel got activated (changes.lights.<stripId>.panels.<panelId>.active === true)
    for (let stripId in lightChanges) {
      for (let panelId in lightChanges[stripId].panels) {
        const panelChange = lightChanges[stripId].panels[panelId];
        if (panelChange.active !== true && panelChange.intensity > 90) {
          this.sounds.mole.panels[stripId][panelId].play();
        }
      }
    }
  }

  _handleDiskGame(changes) {
    // Level activated (fading in starts)
    if (changes.disk && changes.disk.active) {
        this.sounds.disk.fadein.play();
    }
    if (changes.disk && changes.disk.hasOwnProperty('winning')) {
      console.log(`Sound Winning: ${changes.disk.winning}`);
    }
    if (changes.disk && changes.disk.hasOwnProperty('winning') && changes.disk.winning) {
      // End of game
      if (this.store.data.get('disk').get('level') >= this.config.DISK_GAME.LEVELS.length) {
        this.sounds.disk.disk0.stop();
        this.sounds.disk.disk1.stop();
        this.sounds.disk.disk2.stop();
        this.sounds.disk.show.play();
      }
      // End of level
      else {
        this.sounds.disk.success.play();
      }
    }

    // On start of disk game
    // FIXME: Is transition part of the disk game?
    if (changes.currentGame === GAMES.DISK) {
      // Start all sounds in silent mode
      this.sounds.disk.disk0.play({gain: 0});
      this.sounds.disk.disk1.play({gain: 0});
      this.sounds.disk.disk2.play({gain: 0});
    }

    // On start of level
//    if (changes.hasOwnProperty('disk') &&
//        changes.disk.hasOwnProperty('level') &&
//        changes.disk.level < this.config.DISK_GAME.LEVELS.length) {
//    }

    if (changes.disk && changes.disk.disks) {
      const disksChanges = changes.disk.disks;
      const disks = this.store.data.get('disk').get('disks');

      for (let disk of ['disk0', 'disk1', 'disk2']) {
        if (disksChanges.hasOwnProperty(disk) &&
            disksChanges[disk].hasOwnProperty('targetSpeed')) {
          if (disksChanges[disk].targetSpeed === 0) this.sounds.disk[disk].fadeOut();
          else this.sounds.disk[disk].fadeIn();
        }
      }

    }
    // FIXME level success and final success

    // Shadow transition sound
    const lightChanges = changes.lights;
    const stripId = '6';
    if (lightChanges && lightChanges.hasOwnProperty(stripId)) {
    }
  }

  _handleLocalDiskGame() {
    const diskgame = this.store.currentGameLogic;
    for (let diskId of ['disk0', 'disk1', 'disk2']) {
      const err = diskgame.getDiskError(diskId);
      const pulseFreq = this._calcFreq(err);
      if (this.sounds.disk[diskId].source) {
        this.sounds.disk[diskId].source.loopEnd = (pulseFreq === 0 ? 0 : 1/pulseFreq);
      }
    }
//      for (let disk of ['disk0', 'disk1', 'disk2']) {
//        const score = diskgame.getDiskScore(disk);
//        const pulseFreq = this._calcSingleFreq(score);
//        if (this.sounds.disk[disk].source) this.sounds.disk[disk].source.loopEnd = (pulseFreq === 0 ? 0 : 1/pulseFreq);
//      }
      /* code for global score sound
      const score = diskgame.getScore(disks);
      //console.log(`score: ${score}`);
      // score = 0 -> 540
      const pulseFreq = this._calcFreq(score);
      // FIXME: Set our loopFreq property instead and deal with audio node stuff internally
      //console.log(`pulseFreq: ${pulseFreq}`);
      if (this.sounds.disk.disk0.source) this.sounds.disk.disk0.source.loopEnd = (pulseFreq === 0 ? 0 : 1/pulseFreq);
      if (this.sounds.disk.disk1.source) this.sounds.disk.disk1.source.loopEnd = (pulseFreq === 0 ? 0 : 1/pulseFreq);
      if (this.sounds.disk.disk2.source) this.sounds.disk.disk2.source.loopEnd = (pulseFreq === 0 ? 0 : 1/pulseFreq);
      */
  }

  _calcSingleFreq(score) {
    function map(value, inMin, inMax, outMin, outMax) {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
    if (score > 45) {
      return map(score, 180, 45, 0.5, 3);
    }
    else {
      return map(score, 45, 0, 3, 10);
    }
  }

  _calcFreq(score) {
    function map(value, inMin, inMax, outMin, outMax) {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
    if (score > 200) {
      return map(score, 540, 200, 0.5, 1);
    }
    else if (score > 100) {
      return map(score, 200, 100, 1, 4);
    }
    else if (score > 50) {
      return map(score, 100, 50, 4, 10);
    }
    else {
      return map(score, 50, 0, 10, 32);
    }
  }

  _handleSimonGame(changes) {
    const simongame = this.store.currentGameLogic;
    if (changes.status === SculptureStore.STATUS_SUCCESS) {
      if (simongame.complete) this.sounds.simon.show.play();
      else this.sounds.simon.success.play();
    }
    if (changes.status === SculptureStore.STATUS_FAILURE) this.sounds.simon.failure.play();

    const lightChanges = changes.lights;
    if (!lightChanges || !this.store.isReady) return;

    // FIXME: This is a hack to support lower volume on non-primary panel
    for (let stripId in lightChanges) {
      if (this.config.GAME_STRIPS.includes(stripId)) {
        for (let panelId in lightChanges[stripId].panels) {
          const panelChange = lightChanges[stripId].panels[panelId];
          if (panelChange.active || panelChange.intensity > 90) {
            this.sounds.simon.panels[stripId][panelId].play({gain: (stripId === simongame.currentStrip) ? 1 : 0.1});
          }
        }
      }
    }
  }
}
