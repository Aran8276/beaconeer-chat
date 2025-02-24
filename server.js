// instantiate our bugout instance with previously saved seed (if any)
var b = new Bugout({ seed: localStorage["bugout-demo-seed"] });

// save the seed for next time
localStorage["bugout-demo-seed"] = b.seed;

// log this server's address
log("address:", b.address());
log("announcing...");

/*** rpc calls ***/

// simple "ping" rpc call
b.register("ping", function (address, args, cb) {
  args["pong"] = Math.random();
  cb(args);
});

// register your RPC calls for clients here

/*** logging ***/

// log when network connectivity changes
b.on("connections", function (c) {
  log("connections:", c);
  if (c == 0) {
    log("ready");
  }
});

// log when a client sends a message
b.on("message", function (address, msg) {
  log("message:", address, msg);
});

// log when a client makes an rpc call
b.on("rpc", function (address, call, args) {
  log("rpc:", address, call, args);
});

// log when we see a new client address
b.on("seen", function (address) {
  log("seen:", address);
});

// simple logging function
function log() {
  var args = Array.prototype.slice.call(arguments);
  console.log.apply(null, args);
  args = args.map(function (a) {
    if (typeof a == "string") return a;
    else return JSON.stringify(a);
  });
  document.getElementById("log").textContent += args.join(" ") + "\n";
}
