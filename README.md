# discord-music-bot
Free, open source repo containing music playback code, clone/fork/contribute as you wish.

_Out of the box you get_:

1. Multiple Guild music playback support
2. Performance - music data is kept in memory, which means rapid music playback
3. No functional overhead
4. Docker deployment support
5. Event based player implementation - making easier to maintain & extend code
6. Listen.Moe Radio support

## How to Use

1. Install Node.js (7.1 ver or newer) / NPM package manager for your machine
2. Clone repository if you haven't done so yet `git clone https://github.com/mindaugaskasp/discord-music-bot.git` or just download it as ZIP
3. Set up configuration data in `configs/app.json` file (youtube API token, Discord Application token, Owner ID(s), listen-moe radio etc)
4. Open terminal and change your working directory to project root (e.g. `cd <PathToProjectRoot>`)
5. In terminal run `npm run debug` - which basically will start `debug` script defined in `package.json`, run `npm run prod` for production.
6. Add bot to your discord guild by using link `https://discordapp.com/oauth2/authorize?client_id=<ClientID>&permissions=0&scope=bot`, where `<clientID>` is your Discord Application client ID
7. Use command `<prefix>help` to view commands available, `<prefix>` is custom command prefix you can set in `configs/app.json` file. All commands must start by declaring the prefix first. E.g. If we have default prefix set as `!` then all commands would proceed with it and be initiated like so `!help` or `!join` etc. 

## How to Use - Docker Edition

1. Install Docker & Docker Compose for your machine
2. Cd to project root (assuming you've cloned the repository already)
3. Run `docker-compose run --build` to build image & run container
4. (Optional): Run `docker-compose down` to shut down container instance. Refer to docker-compose manual for more info on docker command usage.

## User Guide

* Use command `<prefix>join` to make bot join voice channel you're currently in.
* Use command `<prefix>leave` to make bot leave active voice channel.
* Use command `<prefix>search [query]` to search for music (queries youtube API), where `[query]` is either a search text, e.g.: `daft punk get lucky` or a youtube link (a single track or a playlist link).
* Use command `<prefix>pick [choices]` to pick what song(s) to add from `search` command. The prompt to do so will be displayed after successful search attempt, but only for a track count >1 and < 50. Meaning if you search a whole playlist it will be loaded all without needing to select songs. `[choices]` is either a list of song numbers separated by commas, e.g. `1,2,3` or keywoord `all` to indicate that you want to pick all tracks.
* Use command `<prefix>play` to play what is saved in music player queue.
* Use command `<prefix>remove [songNumber]` to remove a song from music player queue, where `[songNumber]` is a valid song number between `1 - list length`. Keyword `all` indicates that you want to delete *ALL* songs in playlist. 
* Use command `<prefix>view` to view music player queue. Basically the same as taking a look at the back of your tape to see whats in there :)
* Use command `<prefix>pause` to pause currently playing voice stream. (The magical PAUSE button)
* Use command `<prefix>resume` to resume paused voice stream.
* Use command `<prefix>stop` to stop music playback altogether.
* Use command `<prefix>skip` to skip music player to the next song if available.
* Use command `<prefix>Jump [number]` to jump music player to specific song identified by its number in the queue. (basically a short hand function for skip, feels good to be able to warp through songs, heh.)
* Use command `<prefix>prefix [char]` to view bot prefix or set one by passing a single or series of characters which will be set as custom bot prefix for particular guild.
* Use command `<prefix>help [command]` to view general command info or information regarding certain command by supplying a command name, e.g. either `<prefix>help` or `<prefix>help play` will suffice.
* Use command `<prefix>ping` to check bot / discord api latency
* use command `<prefix>seek [interval]` to seek player to specific time, e.g. `<prefix>seek 1:40` would seek music player to 1 minute 40 seconds time

`<prefix>` indicates a bot command prefix set in `configs/app.json` file.
