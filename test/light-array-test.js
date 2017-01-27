import chai from 'chai';
const expect = chai.expect;

import LightArray from '../src/game-logic/utils/light-array';
import COLORS from '../src/game-logic/constants/colors';

describe('LightArray', () => {
  it('Can get set and get initial values', () => {
    const key = 'mykey';
    const lights = new LightArray({[key]: 1}, 43, COLORS.ERROR);

    expect(lights.getMaxIntensity(key)).to.equal(100);
    expect(lights.getIntensity(key, '0')).to.equal(43);
    expect(lights.getColor(key, '0')).to.equal(COLORS.ERROR);
  });

  it('Can get set and get new values', () => {
    const key = 'mykey';
    const lights = new LightArray({[key]: 3}, 0, COLORS.BLACK);

    lights.setColor(key, '1', COLORS.ERROR);
    lights.setIntensity(key, '1', 44);
    lights.activate(key, '1');
    lights.activate(key, '2');
    lights.deactivate(key, '2');

    expect(lights.getIntensity(key, '0')).to.equal(0);
    expect(lights.getColor(key, '0')).to.equal(COLORS.BLACK);
    expect(lights.isActive(key, '0')).to.equal(false);
    expect(lights.getIntensity(key, '1')).to.equal(44);
    expect(lights.getColor(key, '1')).to.equal(COLORS.ERROR);
    expect(lights.isActive(key, '1')).to.equal(true);

    expect(lights.isActive(key, '2')).to.equal(false);
  });

  it('Can handle multiple strips', () => {
    const lights = new LightArray({keyA: 3, keyB: 4}, 0, COLORS.BLACK);

    lights.setColor('keyA', '1', COLORS.ERROR);
    lights.setColor('keyB', '3', COLORS.WHITE);

    expect(lights.getColor('keyA', '1')).to.equal(COLORS.ERROR);
    expect(lights.getColor('keyB', '3')).to.equal(COLORS.WHITE);
  });

  it('Can deactivate all', () => {
    const lights = new LightArray({keyA: 3, keyB: 4}, 0, COLORS.BLACK);

    lights.activate('keyA', '0');
    lights.activate('keyB', '3');
    lights.deactivateAll();
    expect(lights.isActive('keyA', '0')).to.equal(false);
    expect(lights.isActive('keyB', '3')).to.equal(false);
  });

  it('Can set all panels in a strip', () => {
    const lights = new LightArray({keyA: 3, keyB: 4}, 0, COLORS.BLACK);

    lights.setColor('keyA', null, COLORS.ERROR);
    lights.setIntensity('keyB', null, 33);

    for (let i=0;i<3;i++) expect(lights.getColor('keyA', i.toString())).to.equal(COLORS.ERROR);
    for (let i=0;i<4;i++) expect(lights.getIntensity('keyB', i.toString())).to.equal(33);
  });

});
