const user = localStorage["bugout-user"];
const parsedUser = JSON.parse(user);
const params = new URLSearchParams(window.location.search);
const serverAddr = params.get("server_address");
let globalClientSeed = "";

const checkValidData = () => {
  if (!serverAddr) {
    alert(
      "Pastikan anda telah me-masukan alamat server.\n\nAnda akan dialihkan ke halaman register / welcome."
    );
    window.location.replace("/beaconeer-chat/register.html");
  }

  if (!user) {
    alert(
      "Pastikan anda telah me-masukan detail user server (terutama username).\n\nAnda akan dialihkan ke halaman register / welcome."
    );
    window.location.replace("/beaconeer-chat/register.html");
  }
};

const copySeed = () => {
  navigator.clipboard.writeText(globalClientSeed);
};

const initializeClient = () => {
  const client = new Bugout(serverAddr, {
    seed: localStorage["bugout-messageboard-client-seed"],
  });

  globalClientSeed = serverAddr;

  document.getElementById("copiableLink").innerText = serverAddr;
  localStorage["bugout-messageboard-client-seed"] = client.seed;

  const msglist = document.getElementById("messages");
  msglist.innerHTML = `
<div className="flex flex-col space-y-4">
    <div aria-label="Orange and tan hamster running in a metal wheel" role="img" class="wheel-and-hamster">
    	<div class="wheel"></div>
    	<div class="hamster">
    		<div class="hamster__body">
    			<div class="hamster__head">
    				<div class="hamster__ear"></div>
    				<div class="hamster__eye"></div>
    				<div class="hamster__nose"></div>
    			</div>
    			<div class="hamster__limb hamster__limb--fr"></div>
    			<div class="hamster__limb hamster__limb--fl"></div>
    			<div class="hamster__limb hamster__limb--br"></div>
    			<div class="hamster__limb hamster__limb--bl"></div>
    			<div class="hamster__tail"></div>
    		</div>
    	</div>
    	<div class="spoke"></div>
    </div>
    <div>Menghubungkan ke "${serverAddr}" ...</div>
</div>
`;

  // if the user clicks the send button
  document.getElementById("send").onclick = function () {
    sendMessage();
  };

  document.getElementById("message").onkeydown = function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  console.log(client.address());

  // watch for connection to the server
  client.on("server", function () {
    refreshMessages();
  });

  // if the server tells us to refresh messages
  client.on("message", function (address, message) {
    if (message == "refresh") {
      refreshMessages();
    }
  });

  // if we see a wire join or leave
  client.on("wireseen", updateWires);
  client.on("wireleft", updateWires);

  function updateWires(count) {
    document.getElementById("connected").textContent = count
      ? `${serverAddr} (${count} orang di server.)`
      : `${serverAddr} (Koneksi putus)`;
  }

  // utility functions

  function refreshMessages() {
    msglist.textContent = "Refreshing messages...";
    // get a list of the messages
    client.rpc("list", null, function (messages) {
      console.log(messages);
      updateMessagelist(messages);
    });
  }

  function sendMessage() {
    const m = document.getElementById("message");
    if (m.value) {
      msglist.textContent = "Sending message...";

      const data = JSON.stringify({
        sender: parsedUser.username,
        pfp: parsedUser.profilePicture,
        msg: m.value,
      });
      client.rpc("post", data, function () {
        refreshMessages();
        // server will send refresh message if messages are changed
      });
      m.value = "";
    }
  }

  function updateMessagelist(messages) {
    msglist.innerHTML = messages
      .map(function (unparsedM) {
        const m = JSON.parse(unparsedM.m);
        if (unparsedM.address === client.address()) {
          return `
        <div class="flex justify-end">
          <div>
            <div class="flex items-center justify-end space-x-2 my-1">
              <span class="text-xs text-gray-500">${String(
                new Date(unparsedM.t).getHours()
              ).padStart(2, "0")}:${String(
            new Date(unparsedM.t).getMinutes()
          ).padStart(2, "0")}</span>
              <span class="text-sm font-semibold text-purple-400">Anda</span>
            </div>
            <div class="bg-indigo-600 p-3 rounded-lg max-w-sm">
              <p class="text-sm">${m.msg}</p>
            </div>
          </div>
        </div>`;
        }

        return `
        <div class="flex items-start space-x-2 my-4">
          <img src="${
            m.pfp ||
            "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"
          }" alt="User Avatar" class="w-8 h-8 rounded-full object-cover">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="text-sm font-semibold text-indigo-400">${
                m.sender
              }</span>
              <span class="text-xs text-gray-500">${String(
                new Date(unparsedM.t).getHours()
              ).padStart(
                2,
                "0"
              )}:${String(new Date(unparsedM.t).getMinutes()).padStart(2, "0")}</span>
            </div>
            <div class="bg-gray-700 p-3 rounded-lg max-w-sm">
              <p class="text-sm">${m.msg}</p>
            </div>
          </div>
        </div>
      `;
      })
      .join("\n\n");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  checkValidData();
  initializeClient();
});
