const qrcode = require("qrcode-terminal");
const fs = require("fs");
const { Client } = require("whatsapp-web.js");
const axios = require("axios");

const spotify_token =
  "ACESSS TOKEN HERE with scope user-read-currently-playing";

// Path where the session data will be stored
const SESSION_FILE_PATH = "./session.json";

// Load the session data if it has been previously saved
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
  session: sessionData,
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message", (msg) => {
  if (msg.body == "!hi") {
    msg.reply(`hi ;_; ${msg.author}`);
  }
});

// Save session values to the file upon successful auth
client.on("authenticated", (session) => {
  sessionData = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
    if (err) {
      console.error(err);
    }
  });
});
/* client.setStatus("ohooo, ran by a bot");
 */
client.on("ready", () => {
  console.log("Client is ready!");
  setInterval(() => {
    console.log("requesting for currently playing track");
    axios
      .get("https://api.spotify.com/v1/me/player/currently-playing?market=IN", {
        headers: {
          Authorization: `Bearer ${spotify_token}`,
        },
      })
      .catch(() => {
        client.setStatus("Hello there | github.com/utkar5hm/wa-song");
        console.log("failed to fetch");
      })
      .then(function (response) {
        if (response) {
          let { name } = response.data.item;
          let artist = response.data.item.album.artists[0].name;
          client.setStatus(
            `currently listening to ${name} by ${artist} | github.com/utkar5hm/wa-song`
          );
          console.log(`currently listening to ${name} by ${artist}`);
        } else {
          client.setStatus("Hello there | github.com/utkar5hm/wa-song");
          console.log("probably not listening to any song.");
        }
      });
  }, 30000);
});

client.initialize();
