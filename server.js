log("*BUGOUT*");
log(
  "**JANGAN MENUTUP TAB INI JIKA ANDA BELUM MAU MENGHENTIKAN SESI CHATTING**"
);
log("\nmessageboard server\n");
log("(view source to see the server code)\n");

// instantiate our bugout instance
var b = new Bugout({ seed: localStorage["bugout-messageboard-seed"] });
// save the seed for next time
localStorage["bugout-messageboard-seed"] = b.seed;

console.log(localStorage.getItem("bugout-messageboard-seed"));

// log this server's address
log("address:", b.address());
log("announcing...");

// load messages from previous run
if (localStorage["bugout-messageboard"]) {
  messages = JSON.parse(localStorage["bugout-messageboard"]);
}
if (typeof messages != "object" || !messages["length"]) {
  messages = [];
}

/*** rpc calls ***/

// simple "ping" rpc call
b.register("ping", function (address, args, cb) {
  args["pong"] = Math.random();
  cb(args);
});

/*** messageboard server API ***/
b.register(
  "post",
  function (address, message, cb) {
    if (typeof message == "string" && message.length < 280) {
      var m = { address: address, m: message, t: new Date().getTime() };
      log("messageboard:", m);
      messages.push(m);
      messages = messages.slice(Math.max(0, messages.length - 10));
      localStorage["bugout-messageboard"] = JSON.stringify(messages);
      cb(true);
      b.send("refresh");
    } else {
      cb(false);
    }
  },
  "Post a message to the board"
);

b.register(
  "list",
  function (address, args, cb) {
    cb(messages.slice().reverse());
    console.log(messages);
  },
  "List most recent messages"
);

/*** logging ***/

// log when network connectivity changes
var connected = false;
b.on("connections", function (c) {
  if (c == 0 && connected == false) {
    connected = true;
    log("ready");
    // link to the messageboard client URL
    var clientURL =
      document.location.href.replace("-server", "") + "#" + b.address();
    // qrcode for the client URL
    if (window.innerWidth > 600) {
      log("qr here");
    } else {
      log();
    }
    log(clientURL + "\n");
    log("Connect back to this server-in-a-tab using the link above.");

    open(`/beaconeer-chat/index.html?server_address=${b.address()}`, "_blank");
  }
  log("connections:", c);
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
