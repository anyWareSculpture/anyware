/*eslint no-unused-expressions: 0, no-new: 0 */
// The above is done in order to support chai assertion syntax without lint errors

const expect = require('chai').expect;

import TrackedSet from '../src/game-logic/utils/tracked-set';

describe('TrackedSet', () => {
  it('default set has no values', () => {
    const set = new TrackedSet();
    expect(Array.from(set)).to.be.empty;
  });

  it('can set a value', () => {
    const set = new TrackedSet();
    set.add('mykey');
    expect(set.get('mykey')).to.be.true;
  });

  it('can remove a value', () => {
    const set = new TrackedSet();
    set.add('mykey');
    set.delete('mykey');
    expect(set.get('mykey')).to.be.false;
  });

  it('can clear set', () => {
    const set = new TrackedSet();
    set.add('mykey');
    set.add('otherkey');
    set.clear();
    expect(Array.from(set).map((key) => set.get(key)).every((item) => item === false)).to.be.true;
  });
});
