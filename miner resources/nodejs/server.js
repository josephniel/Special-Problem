/*
 * This file is a part of the Sharemind framework.
 * Copyright (C) Cybernetica AS
 *
 * All rights are reserved. Reproduction in whole or part is prohibited
 * without the written consent of the copyright owner. The usage of this
 * code is subject to the appropriate license agreement.
 */

var util = require('util');

function ulog(str) {
  util.log(str);
}
function uerr(str) {
  util.error('ERROR: ' + str);
}

function udebug(str) {
  util.debug(str);
}

function usage() {
  util.log('Usage: nodejs server.js <name> <conf> <port> <hostname>');
}

function handleError(str, e, socket) {
  // Handles an error. If exception e is given, log it to console with the
  // message str. If socket is given, emit an error to that socket with message
  // str as the argument.
  if (e) {
    uerr(str + ': ' + e);
  }
  if (socket) {
    socket.emit('app_error', str);
  }
}


// Parse command line arguments
var serverName = process.argv.length > 2 ? process.argv[2] : 'Server';
var serverConfig = process.argv.length > 3 ? process.argv[3] : 'server.cfg';
var serverPort = process.argv.length > 4 ? parseInt(process.argv[4]) : '8080';
var serverHostname = process.argv.length > 5 ? process.argv[5] : 'localhost';
var secrecFiles = process.argv.length > 6 ? process.argv[6].split(',') : [];

// Set up server
function requestHandler(req, res) {
  res.writeHead(200);
  res.end('');
}

var http    = require('http');
var server  = http.createServer(requestHandler);

// Example of setting up HTTPS instead of HTTP
/*
var http  = require('https');
var fs    = require('fs');

// Read in certificate and key
var options = {
 key:   fs.readFileSync('server.key'),
 cert:  fs.readFileSync('cert-server.pem'),
// ca:  fs.readFileSync('chain-server.pem')
};

var server = http.createServer(options, requestHandler);
*/

var io = require('socket.io')(server);
server.listen(serverPort, serverHostname);
ulog('Server listening on hostname: "' + serverHostname + '", port: "' + serverPort + '"');


// Set up Sharemind
var jswcp = require('jswcp');

// Create SystemControllerGlobals. Needs to be global and isn't directly used.
global.ctrlGlobals = null;
try {
  global.ctrlGlobals = new jswcp.JsWebControllerGlobals();
  udebug('SystemControllerGlobals initialized');
} catch (err) {
  uerr(err);
  process.exit(2);
}

// Create a global logger object
global.logger = null;
try {
  global.logger = new jswcp.JsWebControllerLogger(function(msg) {
    ulog('[' + serverName + ']: ' + msg.trim());
  });
} catch (err) {
  ulog(err);
  process.exit(2);
}


// Process incoming socket.io connections
io.on('connection', function (socket) {
  udebug('New client connected');

  // Connect client to Sharemind
  socket.on('connect_sharemind', function(data) {
    try {
      udebug('Creating web controller object');
      var proxy = new jswcp.JsWebControllerProxy(global.logger);

      try {
        udebug('Connecting to Sharemind');
        proxy.Connect(
          serverConfig,
          data.proxyParams.nonce,
          function (data) {
            if (data && data instanceof Error) {
              // If connection attempt returned error, then return and skip all other events.
              uerr('Failed to connect to Sharemind');
              udebug(data);
              socket.emit('app_error', 'Failed to connect to Sharemind, connect() returned false');

              return;
            }

            udebug('Successfully connected to Sharemind');

            // Create run_code listener only after connection has been established.
            // This event listener is basically a proxy between the client and
            // the Sharemind server.
            socket.on('run_code', function (data, callback) {
              if ( secrecFiles.indexOf( data.proxyParams.codefile ) < 0 )
              {
                  uerr('Trying to run forbidden program');
                  socket.emit('app_error', 'Trying to run forbidden program');
                  return;
              }

              try {
                // RunCode takes arguments as Node.js Buffer objects or Base64
                // encoded strings.
                proxy.RunCode(
                  data.proxyParams.codefile,
                  data.smParams,
                  function (data) {
                    if (data instanceof Error) {
                      uerr('Error while running code');
                      socket.emit('app_error', 'Error while running code');

                      return;
                    }

                    udebug('Code run successful');

                    if (callback) {
                      // RunCode returns Node.js Buffer objects. Base64 encode
                      // the values before sending them to the client.
                      for (var name in data) {
                        var obj = data[name]['value'];
                        if (obj instanceof Buffer) {
                          data[name]['value'] = obj.toString('base64');
                        }
                      }

                      callback(data);
                    }
                  }
                );
              } catch (err) {
                handleError('Failed to run code on Sharemind', err, socket);
              }
            });

            socket.on('disconnect', function() {
              udebug('Client disconnected');

              try {
                proxy.Disconnect(
                  function (data) {
                    if (data instanceof Error) {
                      uerr('Failed to disconnect from Sharemind');
                      return;
                    }

                    udebug('Successfully disconnected from Sharemind');
                  }
                );
              } catch (err) {
                uerr(err);
              }

              // Garbage collector takes care of deleted object after some time
              proxy = null;
              udebug('Released reference to Sharemind controller proxy object');
            });

            // run_code listener set up, so we can emit this event.
            socket.emit('connected_sharemind');
          }
        );
      } catch (err) {
        handleError('Failed to connect to Sharemind', err, socket);
      }
    } catch (err) {
      handleError('Connection initialization failed', err, socket);
    }
  });

  // Log other events
  socket.on('anything', function (data) {
    udebug('anything event');
    if (data) {
      udebug(JSON.stringify(data));
    }
  });
});
