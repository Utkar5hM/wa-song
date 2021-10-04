require('dotenv').config();

const express = require('express');
const app = express();
const qr = require('qr-image');
const fs = require('fs');
const { Client } = require('whatsapp-web.js');
var giveMeAJoke = require('give-me-a-joke');
const client_id = process.env.CLIENT_ID;
const scopes = ['user-read-currently-playing'];
const redirect_uri = 'http://localhost:5000/spotify/status';
const clientSecret = process.env.CLIENT_SECRET;

var SpotifyWebApi = require('spotify-web-api-node');
let QRCode = '';
let access_token = '';
// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: clientSecret,
  redirectUri: redirect_uri,
});

app.get('/spotify/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/spotify/status', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.redirect('/bot');

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        access_token = data.body['access_token'];

        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        spotifyApi.setAccessToken(access_token);
      }, (expires_in / 2) * 1000);
    })
    .catch((error) => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
});
app.get('/bot', async (req, res) => {
  // Path where the session data will be stored
  const SESSION_FILE_PATH = './session.json';

  // Load the session data if it has been previously saved
  let sessionData;
  if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
  }

  // Use the saved values
  const client = new Client({
    session: sessionData,
  });

  client.on('qr', (qrcode) => {
    res.type('html');
    QRCode = qrcode;
    res.write(`<img src="http://localhost:5000/qr"><p>Scan the Qr Code</p>`);
  });

  client.on('message', (msg) => {
    if (msg.body == '!hi') {
      msg.reply(
        `hi ;_; ${msg.author}, this is a bot. check more about me on https://github.com/utkar5hm/wa-song`
      );
    } else if (msg.body == '!joke') {
      giveMeAJoke.getRandomDadJoke(function (joke) {
        msg.reply(joke);
      });
    }
  });

  // Save session values to the file upon successful auth
  client.on('authenticated', async (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
  /* client.setStatus("ohooo, ran by a bot");
   */
  client.on('ready', async () => {
    console.log('Client is ready!');
    res.send('Client is Ready <a href="/spotify/login">go back to login</a>');
    setInterval(() => {
      console.log('requesting for currently playing track');
      spotifyApi
        .getMyCurrentPlayingTrack()
        .catch(() => {
          client.setStatus('Hello there | github.com/utkar5hm/wa-song');
          console.log('failed to fetch');
        })
        .then(function (data) {
          if (data.body) {
            let { name } = data.body.item;
            let artist = data.body.item.album.artists[0].name;
            client.setStatus(
              `currently listening to ${name} by ${artist} | github.com/utkar5hm/wa-song`
            );
            console.log(`currently listening to ${name} by ${artist}`);
          } else {
            client.setStatus('Hello there | github.com/utkar5hm/wa-song');
            console.log('probably not listening to any song.');
          }
        });
    }, 30000);
  });

  client.initialize();
});
app.get('/qr', (req, res) => {
  const code = qr.image(QRCode, {
    type: 'png',
    ec_level: 'H',
    size: 10,
    margin: 0,
  });
  code.pipe(res);
});
app.listen(5000, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:5000/spotify/login in your browser.'
  )
);
