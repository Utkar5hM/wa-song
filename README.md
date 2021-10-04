<h1 align="center">Welcome to  wa-song👋</h1>

> update whatsapp status with currently playing song on spotify. Easy to use.

##  Local Development Environment Setup

### Install all dependencies
```sh
npm install
```

### Configure Environment Variables
set your environment variables in a `.env` file, use `.env.sample` for reference

### Run the  server
```sh
node app.js
```

Make sure to format your code before submitting a PR.

## Contributors

👤 Github: [@utkar5hM](https://github.com/utkar5hM)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## Show your support

Give a ⭐️ if this project helped you!

## 📚 Documentation

you need to register spotify app where you also need to setup redirect url to http://localhost:5000/spotify/status and get CLIENT_ID and CLIENT_SECRET which can be placed in .env folder, the server can be started with command given above after which u can need to access http://localhost:5000/spotify/login  where you have to signin using spotify after which scan qr code for whatsapp-web. after which the code automatically udaptes your whatsapp about with the currently playing song. feel free to contribute to the project. 

commands !hi and !joke have been added for fun. ask your friends to send you a message while the bot is turned on.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
