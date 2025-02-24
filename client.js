const init = () => {
  const bugoutServerId = prompt("Please enter the Bugout server ID: ");
  const client = new Bugout(bugoutServerId);

  // wait until we see the server
  // (can take a minute to tunnel through firewalls etc.)
  client.on("server", function (address) {
    // once we can see the server
    // make an API call on it
    client.rpc("ping", { hallo: "dunia" }, function (result) {
      console.log(result);
      // {"hello": "world", "pong": true}
      // also check result.error
    });
  });

  // save this client instance's session key seed to re-use
  localStorage["bugout-seed"] = JSON.stringify(client.seed);
};

init();
