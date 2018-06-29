import _ from 'lodash';

import SculptureStore from '../game-logic/sculpture-store';
import HandshakeGameLogic from '../game-logic/logic/handshake-game-logic';
import MoleGameLogic from '../game-logic/logic/mole-game-logic';
import DiskGameLogic from '../game-logic/logic/disk-game-logic';
import SimonGameLogic from '../game-logic/logic/simon-game-logic';
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
    AudioAPI.setMasterVolume(this.config.ALONE_MODE_VOLUME);
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
        ambient: new VCFSound({url: 'sounds/Alone_Mode/Pulse_Amb_Loop.wav', lfoFreq, fadeIn: 3, gain: 0.8}),
        handshake: new Sound({url: 'sounds/Alone_Mode/Hand_Shake_01.wav'})
      },
      mole: {
        success: new Sound({url: 'sounds/Game_01/G01_Success_01.wav', gain: 0.5}),
        lastPanelSuccess: new Sound({url: 'sounds/Game_01/G01_Success_01_30e.wav', gain: 0.5}),
        ping: new Sound({url: 'sounds/Game_01/G01_Success_01b.wav', gain: 0.5}),
        panels: [0, 1, 2].map(stripId => _.range(10).map(panelId => new Sound({url: `sounds/Game_01/G01_LED_${("0"+(stripId*10+panelId+1)).slice(-2)}.wav`, gain: 0.33}))),
        unsuccess: new Sound({url: 'sounds/Game_01/G01_Unsuccess_Gliss_02.wav', gain: 0.5}),
      },
      disk: {
        lightEffect: new Sound({url: 'sounds/Game_02/G02_Lights_03.wav'}),
        fadein: new Sound({url: 'sounds/Game_02/G02_Apparition_03.wav'}),
        disk2: new Sound({url: 'sounds/Game_02/G02_Disk_Loop_C2.wav', loop: true, gain: 0.3, fadeIn: 2}),
        disk1: new Sound({url: 'sounds/Game_02/G02_Disk_Loop_Eb2.wav', loop: true, gain: 0.3, fadeIn: 2}),
        disk0: new Sound({url: 'sounds/Game_02/G02_Disk_Loop_G2.wav', loop: true, gain: 0.3, fadeIn: 2}),
        success: new Sound({url: 'sounds/Game_02/G02_Success_01.wav'}),
        lock: new Sound({url: 'sounds/Game_02/G02_Lock_03.wav'}),
        radiate: new Sound({url: 'sounds/Game_02/G02_Radiates_03a.wav'}),
        shuffle: new Sound({url: 'sounds/Game_02/G02_Shuffling_03.wav'}),
        show: new Sound({url: 'sounds/Game_02/G02_Success_final_01.wav', gain: 0.5}),
      },
      simon: {
        intro: new Sound({url: 'sounds/Game_03/G03_Intro_03.wav', gain: 1}),
        panels: [0, 1, 2].map(stripId => _.range(10).map(panelId => new Sound({url: `sounds/Game_03/G03_LED_${("0"+(stripId*10+panelId+1)).slice(-2)}.wav`, gain: 0.5}))),
        success: new Sound({url: 'sounds/Game_03/G03_Success_01.wav', gain: 0.5}),
        failure: new Sound({url: 'sounds/Game_03/G03_Unsuccess_01a.wav', gain: 0.5}),
        show: new Sound({url: 'sounds/Game_03/G03_Light_Show_01.wav', gain: 1}),
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
      .then(() => this.sounds.alone.ambient.play()) // Startup in ambient mode
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
    this._handleHandshakeGame(changes);
    if (this.store.isPlayingMoleGame) this._handleMoleGame(changes);
    if (this.store.isPlayingDiskGame) this._handleDiskGame(changes);
    if (this.store.isPlayingSimonGame) this._handleSimonGame(changes);
  }

  _handleLocalChanges() {
    if (this.store.isPlayingDiskGame) this._handleLocalDiskGame();
  }

  _handleHandshakeGame(changes) {
    if (changes.handshake) {
      if (changes.handshake.handshakes) {
        // Any handshake: play handshake sound
        const isActivating = (handshake) => handshake === HandshakeGameLogic.HANDSHAKE_ACTIVATING;
        if (Object.values(changes.handshake.handshakes).some(isActivating)) {
          this.sounds.alone.handshake.play();
        }
        // Local handshake: Stop ambient sound
        if (changes.handshake.handshakes.hasOwnProperty(this.store.me) &&
            changes.handshake.handshakes[this.store.me] !== HandshakeGameLogic.HANDSHAKE_OFF) {
          this.sounds.alone.ambient.stop();
          AudioAPI.setMasterVolume(1.0);
        }
        // Local timeout: Start ambient
        else if (changes.handshake.handshakes[this.store.me] === HandshakeGameLogic.HANDSHAKE_OFF) {
          AudioAPI.setMasterVolume(this.config.ALONE_MODE_VOLUME);
          this.sounds.alone.ambient.play();
        }
      }
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

    if (moleChanges) {
      if (moleChanges.state === MoleGameLogic.STATE_FADE) {
        this.sounds.mole.unsuccess.play();
      }
      else if (moleChanges.state === MoleGameLogic.STATE_COMPLETE) {
        this.sounds.mole.ping.play();
      }
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
    if (changes.disk !== undefined) {
      const diskChanges = changes.disk;
      switch (diskChanges.state) {
      case DiskGameLogic.STATE_FADE_IN:
        this.sounds.disk.fadein.play();
        break;
      case DiskGameLogic.STATE_SHUFFLE:
        this.sounds.disk.shuffle.play();
        break;
      case DiskGameLogic.STATE_ACTIVE:
        // Start disk sounds in silent mode
        // FIXME: Add failsafe to avoid starting sounds multiple times (due to loop)
        console.log('disk: Start disk sounds');
        for (const diskId of ['disk0', 'disk1', 'disk2']) this.sounds.disk[diskId].play({gain: 0});
        break;
      case DiskGameLogic.STATE_POST_LEVEL:
        this.sounds.disk.radiate.play();
        break;
      case DiskGameLogic.STATE_WINNING:
        console.log('disk: Stop disk sounds');
        for (const diskId of ['disk0', 'disk1', 'disk2']) this.sounds.disk[diskId].stop();
        // End of game
        if (this.store.data.get('disk').get('level') >= this.config.DISK_GAME.LEVELS.length) {
          this.sounds.disk.show.play();
        }
        // End of level
        else {
          this.sounds.disk.success.play();
        }
        break;
      }

      const currentState = this.store.data.get('disk').get('state');
      // React to disk movements only when in a movable state
      if (diskChanges.disks !== undefined &&
          (currentState === DiskGameLogic.STATE_SHUFFLE ||
           currentState === DiskGameLogic.STATE_ACTIVE || 
           currentState === DiskGameLogic.STATE_LOCKING)) {

        const disksChanges = diskChanges.disks;
        for (let diskId of ['disk0', 'disk1', 'disk2']) {
          if (disksChanges.hasOwnProperty(diskId) &&
              disksChanges[diskId] !== undefined) {
            const diskChanges = disksChanges[diskId];
            const isLocking = diskChanges.hasOwnProperty('autoPosition') && diskChanges.autoPosition !== false;

            if (currentState === DiskGameLogic.STATE_ACTIVE && isLocking) {
              console.log('disk: Lock + fade out');
              this.sounds.disk.lock.play();
              this.sounds.disk[diskId].fadeOut();
            }
            else {
              if (diskChanges.hasOwnProperty('targetSpeed')) {
                if (diskChanges.targetSpeed === 0) {
                  console.log('disk: Fade out disk sounds');
                  this.sounds.disk[diskId].fadeOut();
                }
                else if (!isLocking) {
                  console.log('disk: Fade in disk sounds');
                  this.sounds.disk[diskId].fadeIn();
                }
              }
            }
          }
        }
      }
    }

    // FIXME level success and final success
    // Shadow transition sound
    const lightChanges = changes.lights;
    const stripId = '6';
    if (lightChanges && lightChanges.hasOwnProperty(stripId)) {
      this.sounds.disk.lightEffect.play();
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
    const simonChanges = changes.simon;
    const simongame = this.store.currentGameLogic;

    if (simonChanges) {
      if (simonChanges.state === SimonGameLogic.STATE_INTRO ||
          simonChanges.state === SimonGameLogic.STATE_DONE) {
        this.sounds.simon.intro.play();
      }
      else if (simonChanges.state === SimonGameLogic.STATE_FAILING) {
        this.sounds.simon.failure.play();
      }
      else if (simonChanges.state === SimonGameLogic.STATE_WINNING) {
        this.sounds.simon.success.play();
      }
      else if (simonChanges.state === SimonGameLogic.STATE_GAMEWON) {
        this.sounds.simon.show.play();
      }
    }

    const lightChanges = changes.lights;
    if (!lightChanges || !this.store.isReady) return;

    // FIXME: This is a hack to support lower volume on non-primary panel
    for (let stripId in lightChanges) {
      if (this.config.GAME_STRIPS.includes(stripId)) {
        for (let panelId in lightChanges[stripId].panels) {
          const panelChange = lightChanges[stripId].panels[panelId];
          if (panelChange.active || panelChange.intensity >= this.config.SIMON_GAME.TARGET_PANEL_INTENSITY) {
            this.sounds.simon.panels[stripId][panelId].play({gain: (stripId === simongame.currentStrip) ? 1 : 0.1});
          }
        }
      }
    }
  }
}
