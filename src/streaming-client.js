import events from 'events';
import mqtt from 'mqtt';

const MQTT_EVENT_CONNECT = "connect";
const MQTT_EVENT_CLOSE = "close";
const MQTT_EVENT_OFFLINE = "offline";
const MQTT_EVENT_ERROR = "error";
const MQTT_EVENT_MESSAGE = "message";

const MQTT_TOPIC_SEPARATOR = '/';
// Works for both u/<user_id>/<message_type>
// and g/<group_id>/<message_type>
const MQTT_TOPIC_MESSAGE_TYPE_INDEX = 2;

const MQTT_TOPIC_STATE_UPDATES = "state-updates";
const MQTT_TOPIC_COMMANDS = "commands";
const MQTT_TOPIC_STATUS = "status";

// Default, read-only username/password
const DEFAULT_MQTT_USERNAME = "none";
const DEFAULT_MQTT_PASSWORD = "none";

const DEFAULT_MQTT_HOST = 'broker.shiftr.io';
const DEFAULT_MQTT_GROUP = "test";
const DEFAULT_MQTT_PROTOCOL = "mqtt";

const DEFAULT_MQTT_CONNECTION_OPTIONS = {
  group: DEFAULT_MQTT_GROUP,
  host: DEFAULT_MQTT_HOST,
  protocol: DEFAULT_MQTT_PROTOCOL
};

export default class StreamingClient extends events.EventEmitter {
  /**
   * Fired when the client connects or reconnects to the streaming server
   * @event StreamingClient.EVENT_CONNECT
   */
  static EVENT_CONNECT = "connect";

  /**
   * Fired when the connection is closed or when the connection goes offline for some reason
   * @event StreamingClient.EVENT_DISCONNECT
   */
  static EVENT_DISCONNECT = "disconnect";

  /**
   * Fired when a state update is received
   * Arguments for handler: [update, metadata]
   * @event StreamingClient.EVENT_STATE_UPDATE
   */
  static EVENT_STATE_UPDATE = "stateupdate";

  /**
   * Fired when a command is received
   * Arguments for handler: [commandName, commandConfiguration, metadata]
   * @event StreamingClient.EVENT_COMMAND
   */
  static EVENT_COMMAND = "command";

  /**
   * Fired when any error occurs
   * Arguments for handler: [error]
   * @event StreamingClient.EVENT_ERROR
   */
  static EVENT_ERROR = "error";

  /**
   * Connects to the StreamingServer and then allows you to send and receive
   * the different types of messages it supports.
   *
   * @constructor
   * @param {Object} options - Configuration for communicating with the streaming server
   * @param {string} [options.group] - The group to subscribe to. Default is a test group
   * @param {string} [options.username] - The username to use for authentication. If both username and password are blank or not provided, default read-only credentials will be used.
   * @param {string} [options.password] - The password to use for authentication
   * @param {string} [options.host] - The host to connect to. If not provided, a default host will be used.
   * @param {string} [options.protocol=mqtt] - The URL protocol to use
   */
  constructor(options) {
    super();

    this._username = null;
    this._group = null;

    this._client = null;
    this._connected = false;

    const settings = {
      ...DEFAULT_MQTT_CONNECTION_OPTIONS,
      ...options,
    };

    // Only provide default authentication information if BOTH options are
    // blank or not provided
    if (!settings.username && !settings.password) {
      settings.username = DEFAULT_MQTT_USERNAME;
      settings.password = DEFAULT_MQTT_PASSWORD;
    }

    this._connect(settings);
  }

  /**
   * @returns {boolean} Returns whether the streaming client is currently connected or not
   */
  get connected() {
    return this._connected;
  }

  /**
   * Sends a command to the connected group
   * @param {string} name - The name of the command to send
   * @param {Object} [configuration] - The configuration object to send for the command
   * @param {Object} [metadata] - Custom metadata to send with the command
   */
  sendCommand(name, configuration = null, customMetadata = null) {
    // FIXME: Temporary fix: Drop packets if we temporarily lost connection. This needs fixing!!
    if (!this._connected) return;
    //    this._assertConnected();

    if (!configuration || Object.keys(configuration).length === 0) configuration = undefined;

    const message = {
      name,
      configuration,
      metadata: this._buildMetadata(customMetadata),
    };

    // FIXME: Temporary workaround for supporting read-only clients
    if (this._username !== 'anyware') {
      this._client.publish(this._groupCommandsTopic, JSON.stringify(message));
    }
  }

  /**
   * Sends a state update to the connected group
   * @param {Object} update - The update to send, this must be an object and cannot contain the key 'metadata'
   * @param {Object} [metadata] - Custom metadata to send with the update
   */
  sendStateUpdate(update, customMetadata = null) {
    // FIXME: Temporary fix: Drop packets if we temporarily lost connection. This needs fixing!!
    if (!this._connected) return;
    //    this._assertConnected();

    if (!(typeof update === 'object' && update !== null && Object.keys(update).length !== 0)) {
      throw new Error("Update must be an object");
    }

    update.metadata = this._buildMetadata(customMetadata);

    // FIXME: Temporary workaround for supporting read-only clients
    if (this._username !== 'anyware') {
      this._client.publish(this._groupStateUpdatesTopic, JSON.stringify(update));
    }
  }

  /**
   * Closes the connection to the streaming server
   */
  close() {
    this._client.end();
  }

  get username() {
    return this._username;
  }

  _assertConnected() {
    if (!this._connected) {
      throw new Error("Not connected");
    }
  }

  _buildMetadata(customMetadata) {

    if (customMetadata && Object.keys(customMetadata).length === 0) customMetadata = null;

    return {
      from: this._username,
      timestamp: Date.now(),
      ...customMetadata,
    };

  }

  _connect(options) {
    const authString = `${options.username}:${options.password}`;
    const mqttHost = options.host;
    const mqttProtocol = options.protocol;
    const mqttPort = options.port ? `:${options.port}` : '';
    const url = `${mqttProtocol}://${authString}@${mqttHost}${mqttPort}`;

    this._username = options.username;
    this._group = options.group;
    if (!this._group) {
      throw new Error("No group specified to connect to");
    }

    // Note: mqtt.Client automatically handles reconnections
    this._client = mqtt.connect(url, {
      keepalive: 30, // Someone (shiftr.io?) kills the socket after 60 seconds of inactivity
      clientId: options.username,
    });

    this._client.on(MQTT_EVENT_CONNECT, this._onConnect.bind(this));
    this._client.on(MQTT_EVENT_CLOSE, this._onClose.bind(this));
    this._client.on(MQTT_EVENT_OFFLINE, this._onClose.bind(this));
    this._client.on(MQTT_EVENT_ERROR, this._onError.bind(this));
    this._client.on(MQTT_EVENT_MESSAGE, this._onMessage.bind(this));
  }

  _onConnect() {
    this._connected = true;

    this._subscribe((error) => {
      if (error) {
        this._onError(error);
      }
      else {
        this.emit(StreamingClient.EVENT_CONNECT);
      }
    });
  }

  _subscribe(callback) {
    this._client.subscribe({
      // topic : MQTT Quality of Service Level
      [this._groupStateUpdatesTopic]: 0,
      [this._groupCommandTopic]: 0,
      [`u/${this._username}/${MQTT_TOPIC_STATE_UPDATES}`]: 0,
      [`u/${this._username}/${MQTT_TOPIC_COMMANDS}`]: 0,
      [`u/${this._username}/${MQTT_TOPIC_STATUS}`]: 0
    }, callback);
  }

  get _groupStateUpdatesTopic() {
    return `g/${this._group}/${MQTT_TOPIC_STATE_UPDATES}`;
  }

  get _groupCommandsTopic() {
    return `g/${this._group}/${MQTT_TOPIC_COMMANDS}`;
  }

  _onClose() {
    this._connected = false;
    this.emit(StreamingClient.EVENT_DISCONNECT);
  }

  _onError(error) {
    this.emit(StreamingClient.EVENT_ERROR, error);
  }

  // FIXME: The exception handling here could be cleaned up
  _onMessage(topic, message) {
    const parsedTopic = topic.split(MQTT_TOPIC_SEPARATOR);
    const messageType = StreamingClient._extractMessageType(parsedTopic);

    let parsedMessage;
    try {
      parsedMessage = StreamingClient._parseMessage(message);
    }
    catch (error) {
      if (error instanceof SyntaxError) {
        this._onError(error);
        return;
      }

      throw error;
    }

    if (!(typeof parsedMessage === 'object' && parsedMessage !== null)) {
      throw new TypeError("Message must be plain object");
    }

    let metadata;
    try {
      metadata = StreamingClient._popMetadata(parsedMessage);
    }
    catch (error) {
      if (error instanceof Error) {
        // Invalid metadata is not an error, it is just ignored
        return;
      }
      throw error;
    }

    let eventType, eventData;
    try {
      ({eventType, eventData} = StreamingClient._getMessageEventEmitParameters(messageType, parsedMessage, metadata));
    }
    catch (error) {
      if (error instanceof Error) {
        this._onError(error);
        return;
      }
      throw error;
    }

    this.emit(eventType, ...eventData);
  }

  static _parseMessage(message) {
    return JSON.parse(message);
  }

  static _popMetadata(parsedMessage) {
    const metadata = parsedMessage.metadata || {};
    delete parsedMessage.metadata;

    StreamingClient._validateMetadata(metadata);

    return metadata;
  }

  static _validateMetadata(metadata) {
    const {from, timestamp} = metadata;

    if (!from || !timestamp) {
      throw new Error("Invalid message metadata");
    }
  }

  static _getMessageEventEmitParameters(messageType, parsedMessage, metadata) {
    let eventType;
    let eventData = [];
    if (messageType === MQTT_TOPIC_STATE_UPDATES) {
      ({eventType, eventData} = StreamingClient._getStateUpdateEventData(parsedMessage, metadata));
    }
    else if (messageType === MQTT_TOPIC_COMMANDS) {
      ({eventType, eventData} = StreamingClient._getCommandEventData(parsedMessage, metadata));
    }
    else {
      throw new Error("Unrecognized message type received");
    }

    return {eventType, eventData};
  }

  static _getStateUpdateEventData(parsedMessage, metadata) {
    const eventType = StreamingClient.EVENT_STATE_UPDATE;
    const eventData = [parsedMessage, metadata];

    return {eventType, eventData};
  }

  static _getCommandEventData(parsedMessage, metadata) {
    const eventType = StreamingClient.EVENT_COMMAND;
    const name = parsedMessage.name;
    if (!name) {
      throw new Error("Invalid command: does not contain name");
    }

    const configuration = parsedMessage.configuration || {};
    const eventData = [name, configuration, metadata];

    return {eventType, eventData};
  }

  static _extractMessageType(parsedTopic) {
    return parsedTopic[MQTT_TOPIC_MESSAGE_TYPE_INDEX];
  }
}
