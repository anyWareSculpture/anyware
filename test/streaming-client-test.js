import sinon from 'sinon';
import chai from 'chai';
const expect = chai.expect;

import mqtt from 'mqtt';
import StreamingClient from '../src/streaming-client';

describe('StreamingClient', () => {
  let mockClient;
  let mqttMock;

  beforeEach(() => {
    mockClient = {
      on: sinon.stub(),
      subscribe: sinon.stub(),
      publish: sinon.stub(),
      end: sinon.stub()
    };

    mqttMock = sinon.mock(mqtt);
  });

  afterEach(() => {
    mqttMock.verify();
  });

  function expectConnect() {
    mqttMock.expects('connect').once().returns(mockClient);
  }

  /*
   * Test utility function for feigning a connection event
   */
  function connectClient(client) {
    const connectHandler = sinon.stub();
    client.on(StreamingClient.EVENT_CONNECT, connectHandler);

    // Fake mqtt connection event by calling the StreamingClient connection handler directly
    const onConnect = mockClient.on.args.find((funcArgs) => {
      return funcArgs[0] === 'connect';
    })[1];
    onConnect();
    return connectHandler;
  }

  it('should connect with some default options', sinon.test(function() {
    expectConnect();
    const client = new StreamingClient();

    // Assert that the right amount of calls were made to bind events
    sinon.assert.callCount(mockClient.on, 5);

    // Ensure that all the events meant to be bound to were bound
    sinon.assert.calledWith(mockClient.on, 'connect');
    sinon.assert.calledWith(mockClient.on, 'close');
    sinon.assert.calledWith(mockClient.on, 'offline');
    sinon.assert.calledWith(mockClient.on, 'error');
    sinon.assert.calledWith(mockClient.on, 'message');
    expect(client.connected).to.be.false;
  }));

  it('should automatically subscribe to topics and emit an event', sinon.test(function() {
    expectConnect();
    const client = new StreamingClient();
    const connectHandler = connectClient(client);

    const errorHandler = this.stub();
    client.on(StreamingClient.EVENT_ERROR, errorHandler);

    expect(client.connected, "client connected").to.be.true;
    expect(mockClient.subscribe.callCount).to.equal(1);
    expect(connectHandler.callCount).to.equal(0);
    expect(errorHandler.callCount).to.equal(0);

    const [subscriptions, subscribeCallback] = mockClient.subscribe.firstCall.args;
    expect(subscriptions).to.be.an("object");
    expect(Object.keys(subscriptions)).to.have.length(5);

    // success
    subscribeCallback();
    expect(client.connected, "client connected").to.be.true;
    expect(connectHandler.calledOnce, "connect event happened once").to.be.true;
    expect(errorHandler.callCount).to.equal(0);

    // error
    // These tests are robust assuming _onError() only emits the event.
    // It is difficult to test anything else using only the public API
    const errorMessage = "some error";
    subscribeCallback(errorMessage);
    expect(client.connected, "client connected").to.be.true;
    expect(connectHandler.calledOnce, "connect event only happened once").to.be.true;
    expect(errorHandler.calledOnce, "error event happened once").to.be.true;
    expect(errorHandler.calledWithExactly(errorMessage));
  }));

  it('should work with non-default parameters', sinon.test(function() {
    const options = {
      group: 'testGroup',
      username: 'Username',
      password: 'BestPassword11234',
      host: 'notthedefaultdomain.com',
      protocol: 'magic'
    };
    mqttMock.expects('connect').once().withArgs(`${options.protocol}://${options.username}:${options.password}@${options.host}`).returns(mockClient);
    const client = new StreamingClient(options);
    connectClient(client);
  }));

  it('should complain when an empty group is specified', () => {
    const invalid = () => new StreamingClient({group: ''});
    expect(invalid).to.throw(Error);
  });

  it('should emit valid messages and extract the metadata', () => {
    expectConnect();
    const client = new StreamingClient();

    const errorHandler = sinon.stub();
    client.on(StreamingClient.EVENT_ERROR, errorHandler);
    const stateUpdateHandler = sinon.stub();
    client.on(StreamingClient.EVENT_STATE_UPDATE, stateUpdateHandler);
    const commandHandler = sinon.stub();
    client.on(StreamingClient.EVENT_COMMAND, commandHandler);

    // retrieve the message callback for testing
    const onMessage = mockClient.on.args.find((funcArgs) => {
      return funcArgs[0] === "message";
    })[1];

    const metadata = {
      from: 'test',
      timestamp: (new Date()).toJSON(),
      // should not take out custom data
      myGroupSpecialId: 123456
    };

    // STATE UPDATES
    let messageNoMetadata = {
      update: {
        testProp: 'test123'
      }
    };

    let message = Object.assign({}, messageNoMetadata, {
      metadata: metadata
    });

    onMessage('g/test/state-updates', JSON.stringify(message));

    expect(errorHandler.callCount, "error handler").to.equal(0);
    expect(stateUpdateHandler.calledOnce).to.be.true;
    expect(commandHandler.callCount).to.equal(0);

    expect(stateUpdateHandler.firstCall.args[0]).to.eql(messageNoMetadata);
    expect(stateUpdateHandler.firstCall.args[1]).to.eql(metadata);
    stateUpdateHandler.reset();

    // COMMANDS
    let commandName = "testCommand";
    let configuration = {
      a: 1,
      b: "foo"
    };

    messageNoMetadata = {
      name: commandName,
      configuration: configuration
    };

    message = Object.assign({}, messageNoMetadata, {
      metadata: metadata
    });

    onMessage('g/test/commands', JSON.stringify(message));

    expect(errorHandler.callCount, "error handler").to.equal(0);
    expect(stateUpdateHandler.callCount).to.equal(0);
    expect(commandHandler.calledOnce).to.be.true;

    expect(commandHandler.firstCall.args[0]).to.eql(commandName);
    expect(commandHandler.firstCall.args[1]).to.eql(configuration);
    expect(commandHandler.firstCall.args[2]).to.eql(metadata);
    commandHandler.reset();

    // COMMANDS (no configuration)
    commandName = "testCommand2";

    messageNoMetadata = {
      name: commandName
    };

    message = Object.assign({}, messageNoMetadata, {
      metadata: metadata
    });

    onMessage('g/test/commands', JSON.stringify(message));

    expect(errorHandler.callCount, "error handler").to.equal(0);
    expect(stateUpdateHandler.callCount).to.equal(0);
    expect(commandHandler.calledOnce).to.be.true;

    expect(commandHandler.firstCall.args[0]).to.eql(commandName);
    expect(commandHandler.firstCall.args[1]).to.eql({});
    expect(commandHandler.firstCall.args[2]).to.eql(metadata);
    commandHandler.reset();
  });

  it('should complain about commands without a name', () => {
    expectConnect();
    const client = new StreamingClient();

    const errorHandler = sinon.stub();
    client.on(StreamingClient.EVENT_ERROR, errorHandler);
    const stateUpdateHandler = sinon.stub();
    client.on(StreamingClient.EVENT_STATE_UPDATE, stateUpdateHandler);
    const commandHandler = sinon.stub();
    client.on(StreamingClient.EVENT_COMMAND, commandHandler);

    // retrieve the message callback for testing
    const onMessage = mockClient.on.args.find((funcArgs) => {
      return funcArgs[0] === "message";
    })[1];

    const message = JSON.stringify({
      name: '',
      configuration: {},
      metadata: {
        timestamp: (new Date()).toJSON(),
        from: 'user1'
      }
    });

    onMessage('g/test/commands', message);

    expect(errorHandler.calledOnce).to.be.true;
    expect(errorHandler.firstCall.args[0]).to.be.an.instanceof(Error);
    expect(errorHandler.firstCall.args[0].message).to.contain("name");
    expect(stateUpdateHandler.callCount).to.equal(0);
    expect(commandHandler.callCount).to.equal(0);
  });

  it('should ignore messages without valid metadata', () => {
    expectConnect();
    const client = new StreamingClient();

    const errorHandler = sinon.stub();
    client.on(StreamingClient.EVENT_ERROR, errorHandler);
    const stateUpdateHandler = sinon.stub();
    client.on(StreamingClient.EVENT_STATE_UPDATE, stateUpdateHandler);
    const commandHandler = sinon.stub();
    client.on(StreamingClient.EVENT_COMMAND, commandHandler);

    // retrieve the message callback for testing
    const onMessage = mockClient.on.args.find((funcArgs) => {
      return funcArgs[0] === "message";
    })[1];

    const messageNoMetadata = {
      update: {
        testProp: 'test123'
      }
    };

    const messageOnlyFrom = {
      data: {
        a: 1,
        b: 3
      },
      metadata: {
        from: 'test',
        group: 'helloworld'
      }
    };

    const messageOnlyTimestamp = {
      data: {
        a: 1,
        b: 3
      },
      metadata: {
        timestamp: (new Date()).toJSON(),
        group: 'helloworld'
      }
    };

    for (const message of [messageNoMetadata, messageOnlyFrom, messageOnlyTimestamp]) {
      onMessage('g/test/state-updates', JSON.stringify(message));
      onMessage('g/test/commands', JSON.stringify(message));
    }

    expect(errorHandler.callCount, "error handler").to.equal(0);
    expect(stateUpdateHandler.callCount).to.equal(0);
    expect(commandHandler.callCount).to.equal(0);
  });

  it('should reject invalid JSON in messages', () => {
    expectConnect();
    const client = new StreamingClient();

    const errorHandler = sinon.stub();
    client.on(StreamingClient.EVENT_ERROR, errorHandler);

    // retrieve the message callback for testing
    const onMessage = mockClient.on.args.find((funcArgs) => {
      return funcArgs[0] === "message";
    })[1];

    onMessage('', '');
    expect(errorHandler.calledOnce).to.be.true;
    errorHandler.reset();

    onMessage('', '}');
    expect(errorHandler.calledOnce).to.be.true;
    errorHandler.reset();

    const invalid = () => onMessage('', 1);
    expect(invalid).to.throw(TypeError);
    expect(errorHandler.callCount).to.equal(0);
    errorHandler.reset();
  });

  // FIXME: We should handle this somehow
  it.skip('should complain when the client is used to send but isn\'t connected', sinon.test(function() {
    const client = new StreamingClient();

    const invalid = () => client.sendCommand('someName', {});
    expect(invalid).to.throw(Error);
  }));

  it('should format and send commands even without a configuration', () => {
    expectConnect();
    const client = new StreamingClient();
    connectClient(client);

    const commandName = "customTestCommand";
    client.sendCommand(commandName);

    expect(mockClient.publish.calledOnce).to.be.true;

    const [topic, sentMessage] = mockClient.publish.firstCall.args;
    const parsedMessage = JSON.parse(sentMessage);

    expect(topic).to.not.be.empty;
    expect(parsedMessage).to.have.property("name", commandName);
    expect(parsedMessage).to.not.have.property("configuration");
  });

  it('should format and send commands with a configuration', () => {
    expectConnect();
    const client = new StreamingClient();
    connectClient(client);

    const commandName = "customTestCommand";
    const commandConfig = {
      test: 123,
      hello: 'something'
    };
    client.sendCommand(commandName, commandConfig);

    expect(mockClient.publish.calledOnce).to.be.true;

    const [topic, sentMessage] = mockClient.publish.firstCall.args;
    const parsedMessage = JSON.parse(sentMessage);

    expect(topic).to.not.be.empty;
    expect(parsedMessage).to.have.property("name", commandName);
    expect(parsedMessage.configuration).to.eql(commandConfig);
  });

  it('should not send empty or invalid configurations when sending commands', () => {
    expectConnect();
    const client = new StreamingClient();
    connectClient(client);

    const commandName = "customTestCommand";
    client.sendCommand(commandName, {});
    client.sendCommand(commandName, []);
    client.sendCommand(commandName, 1);

    expect(mockClient.publish.calledThrice).to.be.true;

    for (const [topic, sentMessage] of mockClient.publish.args) {
      const parsedMessage = JSON.parse(sentMessage);

      expect(topic).to.not.be.empty;
      expect(parsedMessage).to.have.property("name", commandName);
      expect(parsedMessage).to.not.have.property("configuration");
    }
  });

  it('should format and send state updates', () => {
    expectConnect();
    const client = new StreamingClient();
    connectClient(client);

    const update = {
      test: 123,
      qq: {
        hello: "world",
        ttt: "fizz"
      }
    };
    client.sendStateUpdate(update);

    expect(mockClient.publish.calledOnce).to.be.true;

    const [topic, sentMessage] = mockClient.publish.firstCall.args;
    const parsedMessage = JSON.parse(sentMessage);

    expect(topic).to.not.be.empty;
    expect(parsedMessage).to.eql(update);
  });

  it('should reject state updates that aren\'t objects', () => {
    expectConnect();
    const client = new StreamingClient();
    connectClient(client);

    const invalidUpdates = [
      {},
      [],
      1,
      null
    ];

    const makeUpdateSender = (data) => () => client.sendStateUpdate(data);
    for (const update of invalidUpdates) {
      const invalid = makeUpdateSender(update);
      expect(invalid).to.throw(Error);
    }
  });

  it('should send custom metadata', () => {
    expectConnect();
    const client = new StreamingClient();
    connectClient(client);

    const testMetadata = {
      customProperty: 'customValue'
    };
    client.sendStateUpdate({a: 1}, testMetadata);
    client.sendCommand("commandName", {b: 1}, testMetadata);

    expect(mockClient.publish.calledTwice).to.be.true;

    const [, sentStateUpdateMessage] = mockClient.publish.firstCall.args;
    const parsedStateUpdateMessage = JSON.parse(sentStateUpdateMessage);
    expect(parsedStateUpdateMessage.metadata).to.include(testMetadata);

    const [, sentCommandMessage] = mockClient.publish.secondCall.args;
    const parsedCommandMessage = JSON.parse(sentCommandMessage);
    expect(parsedCommandMessage.metadata).to.include(testMetadata);
  });

  it('should append the expected metadata', () => {
    expectConnect();
    const client = new StreamingClient();
    connectClient(client);

    client.sendStateUpdate({a: 1});
    client.sendCommand("commandName");
    client.sendCommand("commandName", {b: 2});

    expect(mockClient.publish.calledThrice).to.be.true;

    for (const [, sentMessage] of mockClient.publish.args) {
      const parsedMessage = JSON.parse(sentMessage);

      expect(parsedMessage.metadata.from).to.not.be.empty;
      expect(parsedMessage.metadata.timestamp).to.not.be.empty;
    }
  });

  it('should allow expected metadata to be overridden by custom metadata', () => {
    expectConnect();
    const username = "testUser123";
    const client = new StreamingClient({username: username});
    connectClient(client);

    const customFrom = "customName";
    const customTimestamp = 12345;

    client.sendStateUpdate({a: 1}, {from: customFrom, timestamp: 12345});
    client.sendCommand("commandName", null, {from: customFrom, timestamp: customTimestamp});
    client.sendCommand("commandName2", {b: 2}, {from: customFrom, timestamp: customTimestamp});

    expect(mockClient.publish.calledThrice).to.be.true;

    for (const [, sentMessage] of mockClient.publish.args) {
      const parsedMessage = JSON.parse(sentMessage);

      expect(parsedMessage.metadata.from).to.equal(customFrom);
      expect(parsedMessage.metadata.timestamp).to.equal(customTimestamp);
    }
  });

  it('should disconnect when the connection is closed', sinon.test(function() {
    expectConnect();
    const client = new StreamingClient();
    connectClient(client);

    const disconnectHandler = this.stub();
    client.on(StreamingClient.EVENT_DISCONNECT, disconnectHandler);

    // Functions for faking close and offline events 
    const onClose = mockClient.on.args.find((funcArgs) => {
      return funcArgs[0] === 'close';
    })[1];
    const onOffline = mockClient.on.args.find((funcArgs) => {
      return funcArgs[0] === 'offline';
    })[1];

    expect(client.connected).to.be.true;
    expect(disconnectHandler.callCount).to.equal(0);
    onClose();
    expect(client.connected).to.be.false;
    expect(disconnectHandler.calledOnce).to.be.true;

    connectClient(client);
    disconnectHandler.reset();

    expect(client.connected).to.be.true;
    expect(disconnectHandler.callCount).to.equal(0);
    onOffline();
    expect(client.connected).to.be.false;
    expect(disconnectHandler.calledOnce).to.be.true;
  }));

  it('should end the client connection when closed', sinon.test(function() {
    expectConnect();
    const client = new StreamingClient();
    client.close();
    expect(mockClient.end.calledOnce).to.be.true;
  }));
});

