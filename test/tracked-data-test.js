import chai from 'chai';
const expect = chai.expect;

import TrackedData from '../src/game-logic/utils/tracked-data';

describe('TrackedData', () => {
  it('should not restrict property names when no arguments are passed in', () => {
    const data = new TrackedData();

    expect(() => data.get("test")).to.not.throw(Error);
    expect(() => data.set("test", "somevalue")).to.not.throw(Error);
  });

  it('should restrict all property names when an empty argument is passed in', () => {
    const data = new TrackedData({});

    expect(() => data.get("test")).to.throw(Error);
    expect(() => data.set("test", "somevalue")).to.throw(Error);
  });

  it('should restrict property names to what is passed in', () => {
    const data = new TrackedData({abc: 56});

    expect(() => data.get("test")).to.throw(Error);
    expect(() => data.set("test", "somevalue")).to.throw(Error);

    expect(() => data.get("abc")).to.not.throw(Error);
    expect(() => data.set("abc", "value1")).to.not.throw(Error);
  });

  it('should get and set names correctly', () => {
    const data = new TrackedData();

    const value = "somevalue1";
    data.set("test", value);
    expect(data.get("test")).to.equal(value);

    // It's important that the value can be changed once it is set once
    const someOtherValue = "someothervalue2";
    data.set("test", someOtherValue);
    expect(data.get("test")).to.equal(someOtherValue);
  });

  it('should provide default values appropriately', () => {
    const defaultValue = 23456;
    const data = new TrackedData({abc: defaultValue});

    expect(data.get("abc")).to.equal(defaultValue);

    data.set("abc", 57);

    expect(data.get("abc")).to.not.equal(defaultValue);
  });

  it('should not have any changes registered initially', () => {
    const data = new TrackedData();

    expect(Array.from(data.getChangedPropertyNames())).to.be.empty;
    expect(data.getChangedOldValues()).to.be.empty;
    const {changes, timestamps} = data.getChangedCurrentValues();
    expect(changes).to.be.empty;
    expect(timestamps).to.be.empty;
  });

  it('should save old and current values for each change', () => {
    const data = new TrackedData();

    const propertyName = "test1345";
    const oldValue = "oldvalue";
    const newValue = "newvalue";

    data.set(propertyName, oldValue);
    data.set(propertyName, newValue);
    expect(data.get(propertyName)).to.equal(newValue);
    expect(Array.from(data.getChangedPropertyNames())).to.eql([propertyName]);
    expect(data.getChangedOldValues()[propertyName]).to.equal(oldValue);
    const {changes, timestamps} = data.getChangedCurrentValues();

    expect(changes[propertyName]).to.equal(newValue);
    expect(changes[propertyName]).to.equal(data.get(propertyName));
  });

  it.skip('Test timestamps');

  it('should allow clearing of any currently registered changes', () => {
    const data = new TrackedData();

    data.set("a", 1);
    data.set("b", 2);
    data.set("c", 3);

    let {changes} = data.getChangedCurrentValues();
    expect(changes).to.eql({a: 1, b: 2, c: 3});

    data.clearChanges();

    let {newchanges} = data.getChangedCurrentValues();
    expect(newchanges).to.be.empty;
  });

  it('should store changed property names correctly', () => {
    const data = new TrackedData();

    const propertyNames = ["abc", "test", "qqq", "helloworld"];
    for (let name of propertyNames) {
      data.set(name, 1);
      data.set(name, 3);
    }

    expect(Array.from(data.getChangedPropertyNames())).to.eql(propertyNames);
  });

  it('should register changes even if the same value is set twice', () => {
    const data = new TrackedData();

    const name = "abc";

    data.set(name, 2);
    expect(data.getChangedCurrentValues().changes[name]).to.equal(2);
    data.set(name, 2);
    expect(data.getChangedCurrentValues().changes[name]).to.equal(2);
    data.set(name, 2);
    expect(data.getChangedCurrentValues().changes[name]).to.equal(2);
  });

  it('can have properties of type TrackedData', () => {
    const data = new TrackedData({
      value: 42,
      object: new TrackedData({
        subvalue: 23
      })
    });

    data.set('value', 43);
    data.get('object').set('subvalue', 24);
    expect(Array.from(data.getChangedPropertyNames())).to.eql(['value', 'object']);
  });

  it('can check for changes', () => {
    const data = new TrackedData({
      value: 42,
      object: new TrackedData({
        subvalue: 23
      })
    });
    data.clearChanges();
    data.get('object').set('subvalue', 24);
    expect(data.hasChanges()).to.be.true;
    expect(data.hasChanges('value')).to.be.false;
    expect(data.hasChanges('object')).to.be.true;
  });

});
