const username = document.getElementById("username");
const profilePicture = document.getElementById("profilePicture");
const serverAddress = document.getElementById("serverAddress");
const serverList = document.getElementById("serverList");

function setDefaultUserInfo() {
  const user = localStorage["bugout-user"];

  if (user) {
    const parsedUser = JSON.parse(user);
    username.value = parsedUser.username;
    profilePicture.value = parsedUser.profilePicture;
    return;
  }
}

function deleteServerAddress(serverAddress) {
  let oldServerList = [];
  if (localStorage["bugout-serverlist"]) {
    oldServerList = JSON.parse(localStorage["bugout-serverlist"]);
  }

  const updatedServerList = oldServerList.filter(
    (address) => address !== serverAddress
  );

  localStorage["bugout-serverlist"] = JSON.stringify(updatedServerList);

  getServerHistory();
}

function getServerHistory() {
  const serverListStorage = localStorage["bugout-serverlist"];
  if (!serverListStorage) {
    return;
  }

  const parsedServerList = JSON.parse(serverListStorage);

  serverList.innerHTML = "";

  parsedServerList.forEach((item) => {
    const serverItem = document.createElement("div");
    serverItem.className =
      "flex justify-between items-center bg-gray-700 p-3 rounded-lg";

    const serverText = document.createElement("span");
    serverText.className = "text-sm";
    serverText.textContent = item;

    const removeButton = document.createElement("button");
    removeButton.className =
      "text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded";
    removeButton.textContent = "Hapus";

    removeButton.onclick = () => {
      deleteServerAddress(item);
    };

    serverItem.appendChild(serverText);
    serverItem.appendChild(removeButton);

    serverList.appendChild(serverItem);
  });
}

/**
 *
 * @param {Event} e
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const clickedButton = e.submitter.name;
  console.log(`Button clicked: ${clickedButton}`);

  const data = {
    username: e.target.username.value,
    profilePicture: e.target.profilePicture.value,
  };

  if (clickedButton === "join") {
    if (!e.target.serverAddress.value.trim()) {
      console.error("Error: Server address is required to join.");
      alert("Masukan ID server untuk gabung ke sebuah grup.");
      return;
    }
  }

  let oldServerList = [];
  if (localStorage["bugout-serverlist"]) {
    oldServerListStorage = JSON.parse(localStorage["bugout-serverlist"]);
    oldServerList = [...oldServerListStorage];
  }
  oldServerList.push(e.target.serverAddress.value);
  localStorage["bugout-user"] = JSON.stringify(data);
  localStorage["bugout-serverlist"] = JSON.stringify(oldServerList);

  if (clickedButton === "join") {
    location.replace(
      `/index.html?server_address=${e.target.serverAddress.value}`
    );
  } else if (clickedButton === "create") {
    location.replace(`/server.html`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setDefaultUserInfo();
  getServerHistory();
});
