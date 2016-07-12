/*eslint no-unused-expressions: 0, no-new: 0 */
// The above is done in order to support chai assertion syntax without lint errors

const expect = require('chai').expect;

import TrackedPanels from '../src/game-logic/utils/tracked-panels';

describe('TrackedPanels', () => {
  it('default panel state is STATE_OFF', () => {
    const panels = new TrackedPanels();
    expect(panels.getPanelState(1, 2)).to.equal(TrackedPanels.STATE_OFF);
  });

  it('can set and get panel state', () => {
    const panels = new TrackedPanels();
    const states = [TrackedPanels.STATE_ON, TrackedPanels.STATE_OFF, TrackedPanels.STATE_IGNORED]; 
    for (let i=0;i<states.length;i++) {
      panels.setPanelState(1, i, states[i]);
      expect(panels.getPanelState(1, i)).to.equal(states[i]);
    }
  });

  it('can get number of panels', () => {
    const panels = new TrackedPanels();
    for (let i=0;i<10;i++) panels.setPanelState(1, i, TrackedPanels.STATE_OFF);
    expect(panels.numPanels).to.equal(10);
  });
});
