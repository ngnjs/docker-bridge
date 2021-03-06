'use strict'
// console.log(process.env.DOCKER_HOST)
require('ngn')

NGN.BUS.disableRemote()

// Create a socket
let zmq = require('zmq')

process.env.MQ_PORT = process.env.MQ_PORT || 54321
process.env.RPC_PORT = process.env.RPC_PORT || 5555
process.env.BRIDGE_VERSION = require('./package.json').version

// Setup the message queue publisher/subscriber
let pub = zmq.socket('pub')
let sub = zmq.socket('sub')

// Connect the publisher
pub.bindSync('tcp://127.0.0.1:' + process.env.MQ_PORT)

// Connect the subscriber
sub.connect('tcp://127.0.0.1:' + process.env.MQ_PORT)

sub.subscribe('kitty cats')

// Setup the controller
let Controller = require('./lib/controller')
let controller = new Controller(pub, sub)

// Setup the configuration interface
let Configuration = require('./lib/configuration')
let configuration = new Configuration()

// Setup the RPC server
let server = new NGN.rpc.Server({
  port: parseInt(process.env.RPC_PORT, 10),
  expose: {
    send: controller.send,
    subscribe: controller.subscribe,
    configuration: configuration.retrieve
  }
})

// Log when the RPC service is running
server.on('ready', function () {
  console.log('Accepting RPC requests on port', process.env.RPC_PORT)
})
