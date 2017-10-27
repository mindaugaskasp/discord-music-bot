# discord-music-bot
Free, open source repo containing Music playback code, fork and/or contribute as you wish.

Out of the box you get:

1. Multi - Guild Music playback support
2. Default data persistence (sqlite) (music data is not persisted)
3. Performance - music data is kept in memory, which means ultra fast playback
4. No functional overhead - you get only what you signed for - music playback
5. Docker environment support

## How to Use

1. Install Node.js (7.1 ver or newer) / NPM package manager for your machine
2. Set up BOT config data in `configs/app.json` file (youtube API token, Discord Application token, Owner ID etc)
3. Open terminal and change working directory to project root (e.g. cd `<projectRoot>`)
4. In terminal run `node index.js` - which basically will start serving your main (index.js) file to the server.
5. Add bot to your guild by using link `https://discordapp.com/oauth2/authorize?client_id=<ClientID>&permissions=0&scope=bot`, where `<clientID>` is your Discord Application client ID
6. Use command `<prefix>help` to view commands available, `<prefix>` is custom command prefix you can set in `configs/app.json` file. All commands must start by declaring the prefix first. E.g. If we have default prefix set as `!` then all commands would proceed with it and be initiated like so `!help` or `!join` etc. 

## How to Use - Docker Edition

1. Install Docker & Docker Compose for your machine
2. Cd to project root
3. Run `docker-compose build` to build server container
4. Run `docker-compose run` to run container
5. (Optional): Run `docker-compose down` to shut down container instance. Refer to docker-compose manual for more info on docker command usage.