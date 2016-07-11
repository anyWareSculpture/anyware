'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var events = require('events');
var mqtt = require('mqtt');

var MQTT_EVENT_CONNECT = "connect";
var MQTT_EVENT_CLOSE = "close";
var MQTT_EVENT_OFFLINE = "offline";
var MQTT_EVENT_ERROR = "error";
var MQTT_EVENT_MESSAGE = "message";

var MQTT_TOPIC_SEPARATOR = '/';
// Works for both u/<user_id>/<message_type>
// and g/<group_id>/<message_type>
var MQTT_TOPIC_MESSAGE_TYPE_INDEX = 2;

var MQTT_TOPIC_STATE_UPDATES = "state-updates";
var MQTT_TOPIC_COMMANDS = "commands";
var MQTT_TOPIC_STATUS = "status";

// Default, read-only username/password
var DEFAULT_MQTT_USERNAME = "anyware";
var DEFAULT_MQTT_PASSWORD = "anyware";

var DEFAULT_MQTT_HOST = 'connect.shiftr.io';
var DEFAULT_MQTT_GROUP = "test";
var DEFAULT_MQTT_PROTOCOL = "mqtt";

var DEFAULT_MQTT_CONNECTION_OPTIONS = {
  group: DEFAULT_MQTT_GROUP,
  host: DEFAULT_MQTT_HOST,
  protocol: DEFAULT_MQTT_PROTOCOL
};

var StreamingClient = function (_events$EventEmitter) {
  _inherits(StreamingClient, _events$EventEmitter);

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


  /**
   * Fired when a command is received
   * Arguments for handler: [commandName, commandConfiguration, metadata]
   * @event StreamingClient.EVENT_COMMAND
   */


  /**
   * Fired when the connection is closed or when the connection goes offline for some reason
   * @event StreamingClient.EVENT_DISCONNECT
   */

  function StreamingClient(options) {
    _classCallCheck(this, StreamingClient);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StreamingClient).call(this));

    _this._username = null;
    _this._group = null;

    _this._client = null;
    _this._connected = false;

    var settings = Object.assign({}, DEFAULT_MQTT_CONNECTION_OPTIONS, options);

    // Only provide default authentication information if BOTH options are
    // blank or not provided
    if (!settings.username && !settings.password) {
      settings.username = DEFAULT_MQTT_USERNAME;
      settings.password = DEFAULT_MQTT_PASSWORD;
    }

    _this._connect(settings);
    return _this;
  }

  /**
   * @returns {boolean} Returns whether the streaming client is currently connected or not
   */


  /**
   * Fired when any error occurs
   * Arguments for handler: [error]
   * @event StreamingClient.EVENT_ERROR
   */


  /**
   * Fired when a state update is received
   * Arguments for handler: [update, metadata]
   * @event StreamingClient.EVENT_STATE_UPDATE
   */

  /**
   * Fired when the client connects or reconnects to the streaming server
   * @event StreamingClient.EVENT_CONNECT
   */


  _createClass(StreamingClient, [{
    key: 'sendCommand',


    /**
     * Sends a command to the connected group
     * @param {string} name - The name of the command to send
     * @param {Object} [configuration] - The configuration object to send for the command
     * @param {Object} [metadata] - Custom metadata to send with the command
     */
    value: function sendCommand(name) {
      var configuration = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
      var metadata = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      this._assertConnected();

      var message = {
        name: name
      };

      if (configuration && Object.keys(configuration).length !== 0) {
        message.configuration = configuration;
      }

      this._appendMetadata(message, metadata);

      var serializedMessage = JSON.stringify(message);
      this._client.publish(this._groupCommandsTopic, serializedMessage);
    }

    /**
     * Sends a state update to the connected group
     * @param {Object} update - The update to send, this must be an object and cannot contain the key 'metadata'
     * @param {Object} [metadata] - Custom metadata to send with the update
     */

  }, {
    key: 'sendStateUpdate',
    value: function sendStateUpdate(update) {
      var metadata = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this._assertConnected();

      if (!((typeof update === 'undefined' ? 'undefined' : _typeof(update)) === 'object' && update !== null && Object.keys(update).length !== 0)) {
        throw new Error("Update must be an object");
      }

      this._appendMetadata(update, metadata);

      var serializedMessage = JSON.stringify(update);

      this._client.publish(this._groupStateUpdatesTopic, serializedMessage);
    }

    /**
     * Closes the connection to the streaming server
     */

  }, {
    key: 'close',
    value: function close() {
      this._client.end();
    }
  }, {
    key: '_assertConnected',
    value: function _assertConnected() {
      if (!this._connected) {
        throw new Error("Not connected yet");
      }
    }
  }, {
    key: '_appendMetadata',
    value: function _appendMetadata(message, customMetadata) {
      var metadata = {};
      metadata.from = this._username;
      metadata.timestamp = Date.now();

      if (customMetadata && Object.keys(customMetadata).length !== 0) {
        Object.assign(metadata, customMetadata);
      }

      message.metadata = metadata;
    }
  }, {
    key: '_connect',
    value: function _connect(options) {
      var authString = options.username + ':' + options.password;
      var mqttHost = options.host;
      var mqttProtocol = options.protocol;
      var url = mqttProtocol + '://' + authString + '@' + mqttHost;

      this._username = options.username;
      this._group = options.group;
      if (!this._group) {
        throw new Error("No group specified to connect to");
      }

      // Note: mqtt.Client automatically handles reconnections
      this._client = mqtt.connect(url);

      this._client.on(MQTT_EVENT_CONNECT, this._onConnect.bind(this));
      this._client.on(MQTT_EVENT_CLOSE, this._onClose.bind(this));
      this._client.on(MQTT_EVENT_OFFLINE, this._onClose.bind(this));
      this._client.on(MQTT_EVENT_ERROR, this._onError.bind(this));
      this._client.on(MQTT_EVENT_MESSAGE, this._onMessage.bind(this));
    }
  }, {
    key: '_onConnect',
    value: function _onConnect() {
      var _this2 = this;

      this._connected = true;

      this._subscribe(function (error) {
        if (error) {
          _this2._onError(error);
        } else {
          _this2.emit(StreamingClient.EVENT_CONNECT);
        }
      });
    }
  }, {
    key: '_subscribe',
    value: function _subscribe(callback) {
      var _client$subscribe;

      this._client.subscribe((_client$subscribe = {}, _defineProperty(_client$subscribe, this._groupStateUpdatesTopic, 0), _defineProperty(_client$subscribe, this._groupCommandTopic, 0), _defineProperty(_client$subscribe, 'u/' + this._username + '/' + MQTT_TOPIC_STATE_UPDATES, 0), _defineProperty(_client$subscribe, 'u/' + this._username + '/' + MQTT_TOPIC_COMMANDS, 0), _defineProperty(_client$subscribe, 'u/' + this._username + '/' + MQTT_TOPIC_STATUS, 0), _client$subscribe), callback);
    }
  }, {
    key: '_onClose',
    value: function _onClose() {
      this._connected = false;
      this.emit(StreamingClient.EVENT_DISCONNECT);
    }
  }, {
    key: '_onError',
    value: function _onError(error) {
      this.emit(StreamingClient.EVENT_ERROR, error);
    }
  }, {
    key: '_onMessage',
    value: function _onMessage(topic, message) {
      var parsedTopic = topic.split(MQTT_TOPIC_SEPARATOR);
      var messageType = StreamingClient._extractMessageType(parsedTopic);

      var parsedMessage = void 0;
      try {
        parsedMessage = StreamingClient._parseMessage(message);
      } catch (error) {
        if (error instanceof SyntaxError) {
          this._onError(error);
          return;
        }

        throw error;
      }

      if (!((typeof parsedMessage === 'undefined' ? 'undefined' : _typeof(parsedMessage)) === 'object' && parsedMessage !== null)) {
        throw new TypeError("Message must be plain object");
      }

      var metadata = void 0;
      try {
        metadata = StreamingClient._popMetadata(parsedMessage);
      } catch (error) {
        if (error instanceof Error) {
          // Invalid metadata is not an error, it is just ignored
          return;
        }
        throw error;
      }

      var eventType = void 0,
          eventData = void 0;
      try {
        var _StreamingClient$_get = StreamingClient._getMessageEventEmitParameters(messageType, parsedMessage, metadata);

        eventType = _StreamingClient$_get.eventType;
        eventData = _StreamingClient$_get.eventData;
      } catch (error) {
        if (error instanceof Error) {
          this._onError(error);
          return;
        }
        throw error;
      }

      this.emit.apply(this, [eventType].concat(_toConsumableArray(eventData)));
    }
  }, {
    key: 'connected',
    get: function get() {
      return this._connected;
    }
  }, {
    key: '_groupStateUpdatesTopic',
    get: function get() {
      return 'g/' + this._group + '/' + MQTT_TOPIC_STATE_UPDATES;
    }
  }, {
    key: '_groupCommandsTopic',
    get: function get() {
      return 'g/' + this._group + '/' + MQTT_TOPIC_COMMANDS;
    }
  }], [{
    key: '_parseMessage',
    value: function _parseMessage(message) {
      var parsedMessage = void 0;
      parsedMessage = JSON.parse(message);
      return parsedMessage;
    }
  }, {
    key: '_popMetadata',
    value: function _popMetadata(parsedMessage) {
      var metadata = parsedMessage.metadata;
      delete parsedMessage.metadata;
      if (!metadata) {
        metadata = {};
      }

      StreamingClient._validateMetadata(metadata);

      return metadata;
    }
  }, {
    key: '_validateMetadata',
    value: function _validateMetadata(metadata) {
      var sender = metadata.from;
      var timestamp = metadata.timestamp;

      if (!sender || !timestamp) {
        throw new Error("Invalid message metadata");
      }
    }
  }, {
    key: '_getMessageEventEmitParameters',
    value: function _getMessageEventEmitParameters(messageType, parsedMessage, metadata) {
      var eventType = void 0;
      var eventData = [];
      if (messageType === MQTT_TOPIC_STATE_UPDATES) {
        var _StreamingClient$_get2 = StreamingClient._getStateUpdateEventData(parsedMessage, metadata);

        eventType = _StreamingClient$_get2.eventType;
        eventData = _StreamingClient$_get2.eventData;
      } else if (messageType === MQTT_TOPIC_COMMANDS) {
        var _StreamingClient$_get3 = StreamingClient._getCommandEventData(parsedMessage, metadata);

        eventType = _StreamingClient$_get3.eventType;
        eventData = _StreamingClient$_get3.eventData;
      } else {
        throw new Error("Unrecognized message type received");
      }

      return { eventType: eventType, eventData: eventData };
    }
  }, {
    key: '_getStateUpdateEventData',
    value: function _getStateUpdateEventData(parsedMessage, metadata) {
      var eventType = StreamingClient.EVENT_STATE_UPDATE;
      var eventData = [parsedMessage, metadata];

      return { eventType: eventType, eventData: eventData };
    }
  }, {
    key: '_getCommandEventData',
    value: function _getCommandEventData(parsedMessage, metadata) {
      var eventType = StreamingClient.EVENT_COMMAND;
      var name = parsedMessage.name;
      if (!name) {
        throw new Error("Invalid command: does not contain name");
      }

      var configuration = parsedMessage.configuration || {};
      var eventData = [name, configuration, metadata];

      return { eventType: eventType, eventData: eventData };
    }
  }, {
    key: '_extractMessageType',
    value: function _extractMessageType(parsedTopic) {
      return parsedTopic[MQTT_TOPIC_MESSAGE_TYPE_INDEX];
    }
  }]);

  return StreamingClient;
}(events.EventEmitter);

StreamingClient.EVENT_CONNECT = "connect";
StreamingClient.EVENT_DISCONNECT = "disconnect";
StreamingClient.EVENT_STATE_UPDATE = "stateupdate";
StreamingClient.EVENT_COMMAND = "command";
StreamingClient.EVENT_ERROR = "error";
exports.default = StreamingClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0cmVhbWluZy1jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTSxxQkFBcUIsU0FBM0I7QUFDQSxJQUFNLG1CQUFtQixPQUF6QjtBQUNBLElBQU0scUJBQXFCLFNBQTNCO0FBQ0EsSUFBTSxtQkFBbUIsT0FBekI7QUFDQSxJQUFNLHFCQUFxQixTQUEzQjs7QUFFQSxJQUFNLHVCQUF1QixHQUE3Qjs7O0FBR0EsSUFBTSxnQ0FBZ0MsQ0FBdEM7O0FBRUEsSUFBTSwyQkFBMkIsZUFBakM7QUFDQSxJQUFNLHNCQUFzQixVQUE1QjtBQUNBLElBQU0sb0JBQW9CLFFBQTFCOzs7QUFHQSxJQUFNLHdCQUF3QixTQUE5QjtBQUNBLElBQU0sd0JBQXdCLFNBQTlCOztBQUVBLElBQU0sb0JBQW9CLG1CQUExQjtBQUNBLElBQU0scUJBQXFCLE1BQTNCO0FBQ0EsSUFBTSx3QkFBd0IsTUFBOUI7O0FBRUEsSUFBTSxrQ0FBa0M7QUFDdEMsU0FBTyxrQkFEK0I7QUFFdEMsUUFBTSxpQkFGZ0M7QUFHdEMsWUFBVTtBQUg0QixDQUF4Qzs7SUFNcUIsZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4Q25CLDJCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQTs7QUFHbkIsVUFBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsVUFBSyxNQUFMLEdBQWMsSUFBZDs7QUFFQSxVQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0EsVUFBSyxVQUFMLEdBQWtCLEtBQWxCOztBQUVBLFFBQU0sV0FBVyxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLCtCQUFsQixFQUNiLE9BRGEsQ0FBakI7Ozs7QUFLQSxRQUFJLENBQUMsU0FBUyxRQUFWLElBQXNCLENBQUMsU0FBUyxRQUFwQyxFQUE4QztBQUM1QyxlQUFTLFFBQVQsR0FB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Q0FFK0IsYSxFQUFlLFEsRUFBVTtBQUN2RCxVQUFNLFlBQVksZ0JBQWdCLGtCQUFsQztBQUNBLFVBQU0sWUFBWSxDQUFDLGFBQUQsRUFBZ0IsUUFBaEIsQ0FBbEI7O0FBRUEsYUFBTyxFQUFDLG9CQUFELEVBQVksb0JBQVosRUFBUDtBQUNEOzs7eUNBRTJCLGEsRUFBZSxRLEVBQVU7QUFDbkQsVUFBTSxZQUFZLGdCQUFnQixhQUFsQztBQUNBLFVBQU0sT0FBTyxjQUFjLElBQTNCO0FBQ0EsVUFBSSxDQUFDLElBQUwsRUFBVztBQUNULGNBQU0sSUFBSSxLQUFKLENBQVUsd0NBQVYsQ0FBTjtBQUNEOztBQUVELFVBQU0sZ0JBQWdCLGNBQWMsYUFBZCxJQUErQixFQUFyRDtBQUNBLFVBQU0sWUFBWSxDQUFDLElBQUQsRUFBTyxhQUFQLEVBQXNCLFFBQXRCLENBQWxCOztBQUVBLGFBQU8sRUFBQyxvQkFBRCxFQUFZLG9CQUFaLEVBQVA7QUFDRDs7O3dDQUUwQixXLEVBQWE7QUFDdEMsYUFBTyxZQUFZLDZCQUFaLENBQVA7QUFDRDs7OztFQTlUMEMsT0FBTyxZOztBQUEvQixlLENBS1osYSxHQUFnQixTO0FBTEosZSxDQVdaLGdCLEdBQW1CLFk7QUFYUCxlLENBa0JaLGtCLEdBQXFCLGE7QUFsQlQsZSxDQXlCWixhLEdBQWdCLFM7QUF6QkosZSxDQWdDWixXLEdBQWMsTztrQkFoQ0YsZSIsImZpbGUiOiJzdHJlYW1pbmctY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBtcXR0ID0gcmVxdWlyZSgnbXF0dCcpO1xuXG5jb25zdCBNUVRUX0VWRU5UX0NPTk5FQ1QgPSBcImNvbm5lY3RcIjtcbmNvbnN0IE1RVFRfRVZFTlRfQ0xPU0UgPSBcImNsb3NlXCI7XG5jb25zdCBNUVRUX0VWRU5UX09GRkxJTkUgPSBcIm9mZmxpbmVcIjtcbmNvbnN0IE1RVFRfRVZFTlRfRVJST1IgPSBcImVycm9yXCI7XG5jb25zdCBNUVRUX0VWRU5UX01FU1NBR0UgPSBcIm1lc3NhZ2VcIjtcblxuY29uc3QgTVFUVF9UT1BJQ19TRVBBUkFUT1IgPSAnLyc7XG4vLyBXb3JrcyBmb3IgYm90aCB1Lzx1c2VyX2lkPi88bWVzc2FnZV90eXBlPlxuLy8gYW5kIGcvPGdyb3VwX2lkPi88bWVzc2FnZV90eXBlPlxuY29uc3QgTVFUVF9UT1BJQ19NRVNTQUdFX1RZUEVfSU5ERVggPSAyO1xuXG5jb25zdCBNUVRUX1RPUElDX1NUQVRFX1VQREFURVMgPSBcInN0YXRlLXVwZGF0ZXNcIjtcbmNvbnN0IE1RVFRfVE9QSUNfQ09NTUFORFMgPSBcImNvbW1hbmRzXCI7XG5jb25zdCBNUVRUX1RPUElDX1NUQVRVUyA9IFwic3RhdHVzXCI7XG5cbi8vIERlZmF1bHQsIHJlYWQtb25seSB1c2VybmFtZS9wYXNzd29yZFxuY29uc3QgREVGQVVMVF9NUVRUX1VTRVJOQU1FID0gXCJhbnl3YXJlXCI7XG5jb25zdCBERUZBVUxUX01RVFRfUEFTU1dPUkQgPSBcImFueXdhcmVcIjtcblxuY29uc3QgREVGQVVMVF9NUVRUX0hPU1QgPSAnY29ubmVjdC5zaGlmdHIuaW8nO1xuY29uc3QgREVGQVVMVF9NUVRUX0dST1VQID0gXCJ0ZXN0XCI7XG5jb25zdCBERUZBVUxUX01RVFRfUFJPVE9DT0wgPSBcIm1xdHRcIjtcblxuY29uc3QgREVGQVVMVF9NUVRUX0NPTk5FQ1RJT05fT1BUSU9OUyA9IHtcbiAgZ3JvdXA6IERFRkFVTFRfTVFUVF9HUk9VUCxcbiAgaG9zdDogREVGQVVMVF9NUVRUX0hPU1QsXG4gIHByb3RvY29sOiBERUZBVUxUX01RVFRfUFJPVE9DT0xcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0cmVhbWluZ0NsaWVudCBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuICAvKipcbiAgICogRmlyZWQgd2hlbiB0aGUgY2xpZW50IGNvbm5lY3RzIG9yIHJlY29ubmVjdHMgdG8gdGhlIHN0cmVhbWluZyBzZXJ2ZXJcbiAgICogQGV2ZW50IFN0cmVhbWluZ0NsaWVudC5FVkVOVF9DT05ORUNUXG4gICAqL1xuICBzdGF0aWMgRVZFTlRfQ09OTkVDVCA9IFwiY29ubmVjdFwiO1xuXG4gIC8qKlxuICAgKiBGaXJlZCB3aGVuIHRoZSBjb25uZWN0aW9uIGlzIGNsb3NlZCBvciB3aGVuIHRoZSBjb25uZWN0aW9uIGdvZXMgb2ZmbGluZSBmb3Igc29tZSByZWFzb25cbiAgICogQGV2ZW50IFN0cmVhbWluZ0NsaWVudC5FVkVOVF9ESVNDT05ORUNUXG4gICAqL1xuICBzdGF0aWMgRVZFTlRfRElTQ09OTkVDVCA9IFwiZGlzY29ubmVjdFwiO1xuXG4gIC8qKlxuICAgKiBGaXJlZCB3aGVuIGEgc3RhdGUgdXBkYXRlIGlzIHJlY2VpdmVkXG4gICAqIEFyZ3VtZW50cyBmb3IgaGFuZGxlcjogW3VwZGF0ZSwgbWV0YWRhdGFdXG4gICAqIEBldmVudCBTdHJlYW1pbmdDbGllbnQuRVZFTlRfU1RBVEVfVVBEQVRFXG4gICAqL1xuICBzdGF0aWMgRVZFTlRfU1RBVEVfVVBEQVRFID0gXCJzdGF0ZXVwZGF0ZVwiO1xuXG4gIC8qKlxuICAgKiBGaXJlZCB3aGVuIGEgY29tbWFuZCBpcyByZWNlaXZlZFxuICAgKiBBcmd1bWVudHMgZm9yIGhhbmRsZXI6IFtjb21tYW5kTmFtZSwgY29tbWFuZENvbmZpZ3VyYXRpb24sIG1ldGFkYXRhXVxuICAgKiBAZXZlbnQgU3RyZWFtaW5nQ2xpZW50LkVWRU5UX0NPTU1BTkRcbiAgICovXG4gIHN0YXRpYyBFVkVOVF9DT01NQU5EID0gXCJjb21tYW5kXCI7XG5cbiAgLyoqXG4gICAqIEZpcmVkIHdoZW4gYW55IGVycm9yIG9jY3Vyc1xuICAgKiBBcmd1bWVudHMgZm9yIGhhbmRsZXI6IFtlcnJvcl1cbiAgICogQGV2ZW50IFN0cmVhbWluZ0NsaWVudC5FVkVOVF9FUlJPUlxuICAgKi9cbiAgc3RhdGljIEVWRU5UX0VSUk9SID0gXCJlcnJvclwiO1xuXG4gIC8qKlxuICAgKiBDb25uZWN0cyB0byB0aGUgU3RyZWFtaW5nU2VydmVyIGFuZCB0aGVuIGFsbG93cyB5b3UgdG8gc2VuZCBhbmQgcmVjZWl2ZVxuICAgKiB0aGUgZGlmZmVyZW50IHR5cGVzIG9mIG1lc3NhZ2VzIGl0IHN1cHBvcnRzLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBDb25maWd1cmF0aW9uIGZvciBjb21tdW5pY2F0aW5nIHdpdGggdGhlIHN0cmVhbWluZyBzZXJ2ZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmdyb3VwXSAtIFRoZSBncm91cCB0byBzdWJzY3JpYmUgdG8uIERlZmF1bHQgaXMgYSB0ZXN0IGdyb3VwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51c2VybmFtZV0gLSBUaGUgdXNlcm5hbWUgdG8gdXNlIGZvciBhdXRoZW50aWNhdGlvbi4gSWYgYm90aCB1c2VybmFtZSBhbmQgcGFzc3dvcmQgYXJlIGJsYW5rIG9yIG5vdCBwcm92aWRlZCwgZGVmYXVsdCByZWFkLW9ubHkgY3JlZGVudGlhbHMgd2lsbCBiZSB1c2VkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMucGFzc3dvcmRdIC0gVGhlIHBhc3N3b3JkIHRvIHVzZSBmb3IgYXV0aGVudGljYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmhvc3RdIC0gVGhlIGhvc3QgdG8gY29ubmVjdCB0by4gSWYgbm90IHByb3ZpZGVkLCBhIGRlZmF1bHQgaG9zdCB3aWxsIGJlIHVzZWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5wcm90b2NvbD1tcXR0XSAtIFRoZSBVUkwgcHJvdG9jb2wgdG8gdXNlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX3VzZXJuYW1lID0gbnVsbDtcbiAgICB0aGlzLl9ncm91cCA9IG51bGw7XG5cbiAgICB0aGlzLl9jbGllbnQgPSBudWxsO1xuICAgIHRoaXMuX2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX01RVFRfQ09OTkVDVElPTl9PUFRJT05TLFxuICAgICAgICBvcHRpb25zKTtcblxuICAgIC8vIE9ubHkgcHJvdmlkZSBkZWZhdWx0IGF1dGhlbnRpY2F0aW9uIGluZm9ybWF0aW9uIGlmIEJPVEggb3B0aW9ucyBhcmVcbiAgICAvLyBibGFuayBvciBub3QgcHJvdmlkZWRcbiAgICBpZiAoIXNldHRpbmdzLnVzZXJuYW1lICYmICFzZXR0aW5ncy5wYXNzd29yZCkge1xuICAgICAgc2V0dGluZ3MudXNlcm5hbWUgPSBERUZBVUxUX01RVFRfVVNFUk5BTUU7XG4gICAgICBzZXR0aW5ncy5wYXNzd29yZCA9IERFRkFVTFRfTVFUVF9QQVNTV09SRDtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25uZWN0KHNldHRpbmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB3aGV0aGVyIHRoZSBzdHJlYW1pbmcgY2xpZW50IGlzIGN1cnJlbnRseSBjb25uZWN0ZWQgb3Igbm90XG4gICAqL1xuICBnZXQgY29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBjb21tYW5kIHRvIHRoZSBjb25uZWN0ZWQgZ3JvdXBcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgY29tbWFuZCB0byBzZW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbY29uZmlndXJhdGlvbl0gLSBUaGUgY29uZmlndXJhdGlvbiBvYmplY3QgdG8gc2VuZCBmb3IgdGhlIGNvbW1hbmRcbiAgICogQHBhcmFtIHtPYmplY3R9IFttZXRhZGF0YV0gLSBDdXN0b20gbWV0YWRhdGEgdG8gc2VuZCB3aXRoIHRoZSBjb21tYW5kXG4gICAqL1xuICBzZW5kQ29tbWFuZChuYW1lLCBjb25maWd1cmF0aW9uPW51bGwsIG1ldGFkYXRhPW51bGwpIHtcbiAgICB0aGlzLl9hc3NlcnRDb25uZWN0ZWQoKTtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgICBuYW1lOiBuYW1lXG4gICAgfTtcblxuICAgIGlmIChjb25maWd1cmF0aW9uICYmIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pLmxlbmd0aCAhPT0gMCkge1xuICAgICAgbWVzc2FnZS5jb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbjtcbiAgICB9XG5cbiAgICB0aGlzLl9hcHBlbmRNZXRhZGF0YShtZXNzYWdlLCBtZXRhZGF0YSk7XG5cbiAgICBjb25zdCBzZXJpYWxpemVkTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICAgIHRoaXMuX2NsaWVudC5wdWJsaXNoKHRoaXMuX2dyb3VwQ29tbWFuZHNUb3BpYywgc2VyaWFsaXplZE1lc3NhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgc3RhdGUgdXBkYXRlIHRvIHRoZSBjb25uZWN0ZWQgZ3JvdXBcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZSAtIFRoZSB1cGRhdGUgdG8gc2VuZCwgdGhpcyBtdXN0IGJlIGFuIG9iamVjdCBhbmQgY2Fubm90IGNvbnRhaW4gdGhlIGtleSAnbWV0YWRhdGEnXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbbWV0YWRhdGFdIC0gQ3VzdG9tIG1ldGFkYXRhIHRvIHNlbmQgd2l0aCB0aGUgdXBkYXRlXG4gICAqL1xuICBzZW5kU3RhdGVVcGRhdGUodXBkYXRlLCBtZXRhZGF0YT1udWxsKSB7XG4gICAgdGhpcy5fYXNzZXJ0Q29ubmVjdGVkKCk7XG5cbiAgICBpZiAoISh0eXBlb2YgdXBkYXRlID09PSAnb2JqZWN0JyAmJiB1cGRhdGUgIT09IG51bGwgJiYgT2JqZWN0LmtleXModXBkYXRlKS5sZW5ndGggIT09IDApKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVcGRhdGUgbXVzdCBiZSBhbiBvYmplY3RcIik7XG4gICAgfVxuXG4gICAgdGhpcy5fYXBwZW5kTWV0YWRhdGEodXBkYXRlLCBtZXRhZGF0YSk7XG5cbiAgICBjb25zdCBzZXJpYWxpemVkTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KHVwZGF0ZSk7XG5cbiAgICB0aGlzLl9jbGllbnQucHVibGlzaCh0aGlzLl9ncm91cFN0YXRlVXBkYXRlc1RvcGljLCBzZXJpYWxpemVkTWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBjb25uZWN0aW9uIHRvIHRoZSBzdHJlYW1pbmcgc2VydmVyXG4gICAqL1xuICBjbG9zZSgpIHtcbiAgICB0aGlzLl9jbGllbnQuZW5kKCk7XG4gIH1cblxuICBfYXNzZXJ0Q29ubmVjdGVkKCkge1xuICAgIGlmICghdGhpcy5fY29ubmVjdGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgY29ubmVjdGVkIHlldFwiKTtcbiAgICB9XG4gIH1cblxuICBfYXBwZW5kTWV0YWRhdGEobWVzc2FnZSwgY3VzdG9tTWV0YWRhdGEpIHtcbiAgICBjb25zdCBtZXRhZGF0YSA9IHt9O1xuICAgIG1ldGFkYXRhLmZyb20gPSB0aGlzLl91c2VybmFtZTtcbiAgICBtZXRhZGF0YS50aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuXG4gICAgaWYgKGN1c3RvbU1ldGFkYXRhICYmIE9iamVjdC5rZXlzKGN1c3RvbU1ldGFkYXRhKS5sZW5ndGggIT09IDApIHtcbiAgICAgIE9iamVjdC5hc3NpZ24obWV0YWRhdGEsIGN1c3RvbU1ldGFkYXRhKTtcbiAgICB9XG5cbiAgICBtZXNzYWdlLm1ldGFkYXRhID0gbWV0YWRhdGE7XG4gIH1cblxuICBfY29ubmVjdChvcHRpb25zKSB7XG4gICAgY29uc3QgYXV0aFN0cmluZyA9IGAke29wdGlvbnMudXNlcm5hbWV9OiR7b3B0aW9ucy5wYXNzd29yZH1gO1xuICAgIGNvbnN0IG1xdHRIb3N0ID0gb3B0aW9ucy5ob3N0O1xuICAgIGNvbnN0IG1xdHRQcm90b2NvbCA9IG9wdGlvbnMucHJvdG9jb2w7XG4gICAgY29uc3QgdXJsID0gYCR7bXF0dFByb3RvY29sfTovLyR7YXV0aFN0cmluZ31AJHttcXR0SG9zdH1gO1xuXG4gICAgdGhpcy5fdXNlcm5hbWUgPSBvcHRpb25zLnVzZXJuYW1lO1xuICAgIHRoaXMuX2dyb3VwID0gb3B0aW9ucy5ncm91cDtcbiAgICBpZiAoIXRoaXMuX2dyb3VwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBncm91cCBzcGVjaWZpZWQgdG8gY29ubmVjdCB0b1wiKTtcbiAgICB9XG5cbiAgICAvLyBOb3RlOiBtcXR0LkNsaWVudCBhdXRvbWF0aWNhbGx5IGhhbmRsZXMgcmVjb25uZWN0aW9uc1xuICAgIHRoaXMuX2NsaWVudCA9IG1xdHQuY29ubmVjdCh1cmwpO1xuXG4gICAgdGhpcy5fY2xpZW50Lm9uKE1RVFRfRVZFTlRfQ09OTkVDVCwgdGhpcy5fb25Db25uZWN0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2NsaWVudC5vbihNUVRUX0VWRU5UX0NMT1NFLCB0aGlzLl9vbkNsb3NlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2NsaWVudC5vbihNUVRUX0VWRU5UX09GRkxJTkUsIHRoaXMuX29uQ2xvc2UuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fY2xpZW50Lm9uKE1RVFRfRVZFTlRfRVJST1IsIHRoaXMuX29uRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fY2xpZW50Lm9uKE1RVFRfRVZFTlRfTUVTU0FHRSwgdGhpcy5fb25NZXNzYWdlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgX29uQ29ubmVjdCgpIHtcbiAgICB0aGlzLl9jb25uZWN0ZWQgPSB0cnVlO1xuXG4gICAgdGhpcy5fc3Vic2NyaWJlKChlcnJvcikgPT4ge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHRoaXMuX29uRXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuZW1pdChTdHJlYW1pbmdDbGllbnQuRVZFTlRfQ09OTkVDVCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfc3Vic2NyaWJlKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fY2xpZW50LnN1YnNjcmliZSh7XG4gICAgICAvLyB0b3BpYyA6IE1RVFQgUXVhbGl0eSBvZiBTZXJ2aWNlIExldmVsXG4gICAgICBbdGhpcy5fZ3JvdXBTdGF0ZVVwZGF0ZXNUb3BpY106IDAsXG4gICAgICBbdGhpcy5fZ3JvdXBDb21tYW5kVG9waWNdOiAwLFxuICAgICAgW2B1LyR7dGhpcy5fdXNlcm5hbWV9LyR7TVFUVF9UT1BJQ19TVEFURV9VUERBVEVTfWBdOiAwLFxuICAgICAgW2B1LyR7dGhpcy5fdXNlcm5hbWV9LyR7TVFUVF9UT1BJQ19DT01NQU5EU31gXTogMCxcbiAgICAgIFtgdS8ke3RoaXMuX3VzZXJuYW1lfS8ke01RVFRfVE9QSUNfU1RBVFVTfWBdOiAwXG4gICAgfSwgY2FsbGJhY2spO1xuICB9XG5cbiAgZ2V0IF9ncm91cFN0YXRlVXBkYXRlc1RvcGljKCkge1xuICAgIHJldHVybiBgZy8ke3RoaXMuX2dyb3VwfS8ke01RVFRfVE9QSUNfU1RBVEVfVVBEQVRFU31gO1xuICB9XG5cbiAgZ2V0IF9ncm91cENvbW1hbmRzVG9waWMoKSB7XG4gICAgcmV0dXJuIGBnLyR7dGhpcy5fZ3JvdXB9LyR7TVFUVF9UT1BJQ19DT01NQU5EU31gO1xuICB9XG5cbiAgX29uQ2xvc2UoKSB7XG4gICAgdGhpcy5fY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5lbWl0KFN0cmVhbWluZ0NsaWVudC5FVkVOVF9ESVNDT05ORUNUKTtcbiAgfVxuXG4gIF9vbkVycm9yKGVycm9yKSB7XG4gICAgdGhpcy5lbWl0KFN0cmVhbWluZ0NsaWVudC5FVkVOVF9FUlJPUiwgZXJyb3IpO1xuICB9XG5cbiAgX29uTWVzc2FnZSh0b3BpYywgbWVzc2FnZSkge1xuICAgIGNvbnN0IHBhcnNlZFRvcGljID0gdG9waWMuc3BsaXQoTVFUVF9UT1BJQ19TRVBBUkFUT1IpO1xuICAgIGNvbnN0IG1lc3NhZ2VUeXBlID0gU3RyZWFtaW5nQ2xpZW50Ll9leHRyYWN0TWVzc2FnZVR5cGUocGFyc2VkVG9waWMpO1xuXG4gICAgbGV0IHBhcnNlZE1lc3NhZ2U7XG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlZE1lc3NhZ2UgPSBTdHJlYW1pbmdDbGllbnQuX3BhcnNlTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgICAgICB0aGlzLl9vbkVycm9yKGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG5cbiAgICBpZiAoISh0eXBlb2YgcGFyc2VkTWVzc2FnZSA9PT0gJ29iamVjdCcgJiYgcGFyc2VkTWVzc2FnZSAhPT0gbnVsbCkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNZXNzYWdlIG11c3QgYmUgcGxhaW4gb2JqZWN0XCIpO1xuICAgIH1cblxuICAgIGxldCBtZXRhZGF0YTtcbiAgICB0cnkge1xuICAgICAgbWV0YWRhdGEgPSBTdHJlYW1pbmdDbGllbnQuX3BvcE1ldGFkYXRhKHBhcnNlZE1lc3NhZ2UpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIC8vIEludmFsaWQgbWV0YWRhdGEgaXMgbm90IGFuIGVycm9yLCBpdCBpcyBqdXN0IGlnbm9yZWRcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgbGV0IGV2ZW50VHlwZSwgZXZlbnREYXRhO1xuICAgIHRyeSB7XG4gICAgICAoe2V2ZW50VHlwZSwgZXZlbnREYXRhfSA9IFN0cmVhbWluZ0NsaWVudC5fZ2V0TWVzc2FnZUV2ZW50RW1pdFBhcmFtZXRlcnMobWVzc2FnZVR5cGUsIHBhcnNlZE1lc3NhZ2UsIG1ldGFkYXRhKSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhpcy5fb25FcnJvcihlcnJvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdChldmVudFR5cGUsIC4uLmV2ZW50RGF0YSk7XG4gIH1cblxuICBzdGF0aWMgX3BhcnNlTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgbGV0IHBhcnNlZE1lc3NhZ2U7XG4gICAgcGFyc2VkTWVzc2FnZSA9IEpTT04ucGFyc2UobWVzc2FnZSk7XG4gICAgcmV0dXJuIHBhcnNlZE1lc3NhZ2U7XG4gIH1cblxuICBzdGF0aWMgX3BvcE1ldGFkYXRhKHBhcnNlZE1lc3NhZ2UpIHtcbiAgICBsZXQgbWV0YWRhdGEgPSBwYXJzZWRNZXNzYWdlLm1ldGFkYXRhO1xuICAgIGRlbGV0ZSBwYXJzZWRNZXNzYWdlLm1ldGFkYXRhO1xuICAgIGlmICghbWV0YWRhdGEpIHtcbiAgICAgIG1ldGFkYXRhID0ge307XG4gICAgfVxuXG4gICAgU3RyZWFtaW5nQ2xpZW50Ll92YWxpZGF0ZU1ldGFkYXRhKG1ldGFkYXRhKTtcblxuICAgIHJldHVybiBtZXRhZGF0YTtcbiAgfVxuXG4gIHN0YXRpYyBfdmFsaWRhdGVNZXRhZGF0YShtZXRhZGF0YSkge1xuICAgIGNvbnN0IHNlbmRlciA9IG1ldGFkYXRhLmZyb207XG4gICAgY29uc3QgdGltZXN0YW1wID0gbWV0YWRhdGEudGltZXN0YW1wO1xuXG4gICAgaWYgKCFzZW5kZXIgfHwgIXRpbWVzdGFtcCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtZXNzYWdlIG1ldGFkYXRhXCIpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBfZ2V0TWVzc2FnZUV2ZW50RW1pdFBhcmFtZXRlcnMobWVzc2FnZVR5cGUsIHBhcnNlZE1lc3NhZ2UsIG1ldGFkYXRhKSB7XG4gICAgbGV0IGV2ZW50VHlwZTtcbiAgICBsZXQgZXZlbnREYXRhID0gW107XG4gICAgaWYgKG1lc3NhZ2VUeXBlID09PSBNUVRUX1RPUElDX1NUQVRFX1VQREFURVMpIHtcbiAgICAgICh7ZXZlbnRUeXBlLCBldmVudERhdGF9ID0gU3RyZWFtaW5nQ2xpZW50Ll9nZXRTdGF0ZVVwZGF0ZUV2ZW50RGF0YShwYXJzZWRNZXNzYWdlLCBtZXRhZGF0YSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlVHlwZSA9PT0gTVFUVF9UT1BJQ19DT01NQU5EUykge1xuICAgICAgKHtldmVudFR5cGUsIGV2ZW50RGF0YX0gPSBTdHJlYW1pbmdDbGllbnQuX2dldENvbW1hbmRFdmVudERhdGEocGFyc2VkTWVzc2FnZSwgbWV0YWRhdGEpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnJlY29nbml6ZWQgbWVzc2FnZSB0eXBlIHJlY2VpdmVkXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB7ZXZlbnRUeXBlLCBldmVudERhdGF9O1xuICB9XG5cbiAgc3RhdGljIF9nZXRTdGF0ZVVwZGF0ZUV2ZW50RGF0YShwYXJzZWRNZXNzYWdlLCBtZXRhZGF0YSkge1xuICAgIGNvbnN0IGV2ZW50VHlwZSA9IFN0cmVhbWluZ0NsaWVudC5FVkVOVF9TVEFURV9VUERBVEU7XG4gICAgY29uc3QgZXZlbnREYXRhID0gW3BhcnNlZE1lc3NhZ2UsIG1ldGFkYXRhXTtcblxuICAgIHJldHVybiB7ZXZlbnRUeXBlLCBldmVudERhdGF9O1xuICB9XG5cbiAgc3RhdGljIF9nZXRDb21tYW5kRXZlbnREYXRhKHBhcnNlZE1lc3NhZ2UsIG1ldGFkYXRhKSB7XG4gICAgY29uc3QgZXZlbnRUeXBlID0gU3RyZWFtaW5nQ2xpZW50LkVWRU5UX0NPTU1BTkQ7XG4gICAgY29uc3QgbmFtZSA9IHBhcnNlZE1lc3NhZ2UubmFtZTtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29tbWFuZDogZG9lcyBub3QgY29udGFpbiBuYW1lXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBwYXJzZWRNZXNzYWdlLmNvbmZpZ3VyYXRpb24gfHwge307XG4gICAgY29uc3QgZXZlbnREYXRhID0gW25hbWUsIGNvbmZpZ3VyYXRpb24sIG1ldGFkYXRhXTtcblxuICAgIHJldHVybiB7ZXZlbnRUeXBlLCBldmVudERhdGF9O1xuICB9XG5cbiAgc3RhdGljIF9leHRyYWN0TWVzc2FnZVR5cGUocGFyc2VkVG9waWMpIHtcbiAgICByZXR1cm4gcGFyc2VkVG9waWNbTVFUVF9UT1BJQ19NRVNTQUdFX1RZUEVfSU5ERVhdO1xuICB9XG59XG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
