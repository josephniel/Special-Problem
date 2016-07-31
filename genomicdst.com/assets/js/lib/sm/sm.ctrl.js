/*
 * This file is a part of the Sharemind framework.
 * Copyright (C) Cybernetica AS
 *
 * All rights are reserved. Reproduction in whole or part is prohibited
 * without the written consent of the copyright owner. The usage of this
 * code is subject to the appropriate license agreement.
 */

(function(sm) {
  'use strict';

  /*************************
   * Namespace definitions *
   *************************/

  sm.ctrl = sm.ctrl || {};


  /**********************
   * Controller library *
   **********************/

  function makeNullArray(n) {
    var res = [];

    while (n > 0) {
      res.push(null);
      n--;
    }

    return res;
  }

  function isNotNull(argument) {
    return argument !== null;
  }

  function untypeArray(typed) {
    // TODO: probably needs handling of BigNumbers.
    var untyped = [];
    for (var i = 0; i < typed.length; ++i) {
      untyped[i] = typed.get(i);
    }
    return untyped;
  }

  // An abstraction to handle all Sharemind servers at once.
  function Servers(hostnames) {
    this.hostnames = hostnames;
    this.count = hostnames.length;
    this.sockets = hostnames.map(function (host) {
      // If io.connect() is successful, then here socket automatically receives "connect" event from nodejs.
      return io.connect(host, { reconnect: false });
    });
  };

  // Listen for an event from all servers, calling callback for each one. Once
  // the event is received from all servers, call finalCallback.
  Servers.prototype.on = function (e, callback, finalCallback) {
    var events = makeNullArray(this.count);
    this.sockets.forEach(function (socket, index) {
      socket.on(e, function (data) {
        events[index] = true;
        callback(data, index);
        if (finalCallback && events.every(isNotNull)) { // Got this event for all sockets.
          finalCallback();
        }
      });
    });
  };

  // Emit an event to all servers, calling callback with an array of their
  // replies once each server has responded to the event. If the servers reply
  // with an additively shared array, then the callback is called with the
  // declassified array instead.
  Servers.prototype.emit = function (e, args, callback) {
    /*
     *  var args = {
     *    "proxyParams": {
     *      "codefile": "file",
     *      "username": "testuser",
     *      "nonce": 1337
     *    },
     *    "smParams": {
     *      "param1": "val1",
     *      "param2": "val2"
     *    }
     *  };
     */

    if (!args) {
      args = {};
    }

    var servers = this;
    var responses = makeNullArray(this.count);
    var collect = function (response, index) {
      sm.ctrl.debug("Got response from miner.", index);
      responses[index] = response;

      if (responses.every(isNotNull)) {
        // Got all responses.

        /*
         *  var resps = [
         *    {"var1": obj_of_var1_share,
         *      "var2": "..."
         *    },
         *    {"var2": obj_of_var2_share},
         *    {"var3": obj_of_var3_share},
         *  ];
         */

        var deserializedResponses = {};

        for (var respVarName in responses[0]) {
          var tmp = deserialize(responses[0][respVarName], responses[1][respVarName], responses[2][respVarName]);
          if (responses[0][respVarName].hasOwnProperty("pd")) {
            // Private: need to declassify before proceeding.
            tmp = tmp.declassify();
          }

          deserializedResponses[respVarName] = untypeArray(tmp);
        }

        callback(deserializedResponses);
      }
    };

    this.sockets.forEach(function (socket, index) {
      var socketCallback = function (response) {
        if (callback) {
          // If there's no callback, then there's no point to collect,
          // because can't pass collected values anywhere.
          try {
            collect(response, index);
          } catch (err) {
            sm.ctrl.error(err.name + ": " + err.message, index);
            sm.ctrl.error("Got invalid response from servers.", index);
            servers.disconnect();
          }
        }
      };

      var socketArgs = new Object();
      socketArgs["proxyParams"] = {};
      socketArgs["smParams"] = {};

      if (args["proxyParams"]) {
        socketArgs["proxyParams"] = args["proxyParams"];
      }

      // Serialize all params for Sharemind script.
      if (args.smParams) {
        for (var name in args.smParams) {
          try {
            // Serialize returns share of given index...
            socketArgs["smParams"][name] = serialize(args.smParams[name], index);
          } catch (err) {
            sm.ctrl.error("Error while serializing value '" + name + "': " + err.message, index);
          }
        }
      }

      socket.emit(e, socketArgs, socketCallback);
    });
  };

  // Disconnect all sockets.
  Servers.prototype.disconnect = function () {
    this.sockets.forEach(function (socket, index) {
      socket.removeAllListeners();  // TODO: handling disconnects in different places needs better ideas...
      socket.on("disconnect", function (data) {
        sm.ctrl.debug("Disconnected.", index);
      });

      try {
        socket.disconnect();
        socket = null;
      } catch (err) {
        sm.ctrl.error(err);
      }
    });
  };

  // Connect to all servers named in hostnames, calling callback once they
  // have signalled that they are initialized and ready.
  sm.ctrl.connect = function (hostnames, callback, errorCallback) {
    var servers = new Servers(hostnames);

    servers.on("error", function (data, index) {
      sm.ctrl.error(data, index);
      errorCallback(data);
      servers.disconnect();
    });

    servers.on("connecting", function (data, index) {
      sm.ctrl.debug("Connecting...", index);
    });

    servers.on("app_error", function (data, index) {
      sm.ctrl.error("Server signaled error during request handling.", index);
      errorCallback(data);
    });

    servers.on("disconnect", function (data, index) {
      sm.ctrl.log("Disconnected.", index);
    });

    // nodejs emits "connect" event automatically when io.connect() was successful.
    servers.on("connect",
      function (data, index) {
        sm.ctrl.debug("Connected to proxy.", index);
        sm.ctrl.debug("Socket created.", index);
      },
      servers.emit("connect_sharemind",
        {
          proxyParams: {
            username: "testuser",
            // Generate a common nonce for session, it does not have to be cryptographically secure.
            nonce: Math.floor(Math.random() * Math.pow(2, 32)) // TODO: not 100% sure it belongs here.
          }
        }
      )
    );

    servers.on("connected_sharemind",
      function (data, index) {
        sm.ctrl.debug("Connected.", index);
      },
      callback
    );

    return servers;
  };

  sm.ctrl.debug = function(txt, index) {
    if (index !== null) {
      console.debug("[DEBUG]|[" + index + "] " + txt);
    } else {
      console.debug("[DEBUG]| " + txt);
    }
  };

  sm.ctrl.log = function(txt, index) {
    if (index !== null) {
      console.log("[INFO] |[" + index + "] " + txt);
    } else {
      console.log("[INFO] | " + txt);
    }
  };

  sm.ctrl.error = function(txt, index) {
    if (index !== null) {
      console.error("[ERROR]|[" + index + "] " + txt);
    } else {
      console.error("[ERROR]| " + txt);
    }
  };

})(this.sm = this.sm === undefined ? {} : this.sm);
