# discord-music-bot
NOT IN ACTIVE DEVELOPMENT AND MAY CONTAIN ISSUES & BUGS

Music bot for Discord voip app, contains only music playback code and no other unnecessary overhead code. Free to fork and/or contribute.

Clone `master` branch for the stable version.
Any bug reports or security concerns are very welcomed, please, open a ticket and I will address it shortly.

## Local set up guide

1. Install ffmpeg for your local machine, so it can be accessed by the bot
2. Install Node (>=8.6) and NPM
3. Clone repository and change your terminal working dir to it
4. Run `cp configs/app.example.json configs/app.json` and set access tokens in `configs/app.json` file
5. Run `npm install`  (not necessary for docker set up)
6. Add bot to your discord guild by using link `https://discordapp.com/oauth2/authorize?client_id=<ClientID>&permissions=36728128&scope=bot`, where `<clientID>` is your Discord Application client ID of the application whose token you've set in `app.json` file
 (be very cautious what kind of permissions you assign to your bot in case of security breach)
7. Run `npm run prod`  (not necessary for docker set up)

## Docker set up guide

1. Clone repository
2. Run `cp configs/app.example.json configs/app.json` and set access tokens in `configs/app.json` file
3. Run `docker-compuse up --build` to build and run your container


## Available commands

Refer to [prefix]help command for available commands. Prefix can be set in `configs/app.json` file, by default it is `.` (dot)

## Dependencies

* discord.js-commando
* ffmpeg
