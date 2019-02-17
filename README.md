# discord-music-bot
Simplest discord music player bot you ever find, easy to modify and extend, does not contain overhead code and does only what you came for - play music. Free to fork, use and contribute.
For any issues spotted, open a ticket and I'll look into it asap.

For stable ver. clone `master` branch, any other branch are in development and may contain breaking changes. 


_Out of the box you get_:

* Multiple Guild music playback support
* Music data is kept in memory, thus providing fastest playback available
* Many useful music player commands including skip, seek, jump, stop etc
* No functional overhead - you get only what you came for - music playback
* Docker deployment support
* Event based music player implementation - making it easier to maintain & extend code, the command classes are super lean, too
* Automatic event loading - easy to add/remove any Discord event code (simply add event class and it will be attached automatically)
* Good guide material to code bot of your own
* Informative music playback progress embeds

## How to Use

1. Install Node.js (8.6 ver or newer) & NPM package manager for your machine (usually installs together with node)
2. Clone repository if you haven't done so yet `git clone https://github.com/mindaugaskasp/discord-music-bot.git` or just download it as a ZIP
3. Create `configs/app.json` file from given `app.example.json`
4. Set up configuration data in `configs/app.json` file (youtube API token, Discord Application token, Owner ID(s), listen-moe radio etc)
5. Open terminal and change your working directory to project root
6. Run `npm install` to install project dependencies
7. Run `npm run prod` or `npm run debug` 
8. Add bot to your discord guild by using link `https://discordapp.com/oauth2/authorize?client_id=<ClientID>&permissions=36728128&scope=bot`, where `<clientID>` is your Discord Application client ID of the application whose token you've set in `app.json` file
9. Confirm that application has started without any errors (look for `Logged In!` text in terminal)
10. Use command `<prefix>help` in your discord guild text channel to view available commands

## How to Use - Docker

1. Install Docker & Docker Compose for your machine
2. Clone or download repository as ZIP and change your terminal working directory to project root
3. Create `configs/app.json` file from given `app.example.json`
4. Set up configuration data in `configs/app.json` file (youtube API token, Discord Application token, Owner ID(s), listen-moe radio log in details etc)
5. Run `docker-compose run --build` in terminal to build image & run container. If you see `Logged In!` in terminal window. Your bot has started without any problems.
6. Add bot to your discord guild by using link `https://discordapp.com/oauth2/authorize?client_id=<ClientID>&permissions=36728128&scope=bot`, where `<clientID>` is your Discord Application client ID of the application whose token you've set in `app.json` file.
7 Use command `<prefix>help` in your discord guild text channel to view available commands


## Available commands

* Use command `<prefix>join` to make bot join voice channel you're currently in.
* Use command `<prefix>leave` to make bot leave active voice channel.
* Use command `<prefix>search [query]` to search for music (queries youtube API), where `[query]` is either a search text, e.g.: `daft punk get lucky` or a youtube link (a single track or a playlist link).
* Use command `<prefix>pick [choices]` to pick what song(s) to add from `search` command. The prompt to do so will be displayed after successful search attempt, but only for a track count >1 and < 50. Meaning if you search a whole playlist it will be loaded all without needing to select songs. `[choices]` is either a list of song numbers separated by commas, e.g. `1,2,3` or keywoord `all` to indicate that you want to pick all tracks.
* Use command `<prefix>play` to play what is saved in music player queue.
* Use command `<prefix>remove [songNumber]` to remove a song from music player queue, where `[songNumber]` is a valid song number between `1 - list length`. Keyword `all` indicates that you want to delete *ALL* songs in playlist. 
* Use command `<prefix>view [page=1]` to view music player queue. Basically the same as taking a look at the back of your tape to see whats in there :). [page=1] is an optional parameter for viewing your music queue in parts (image opening a specific page of the book) if you've got a lot of music in there.
$ Use command `<prefix>stash [page=1]` to view music search stash list. Similarly to the view command this command shows you a list of songs that are candidates to be saved to the music queue. Usually used after search command to pick what tracks you want to add. Stash always stores only the _latest_ search data.
* Use command `<prefix>pause` to pause currently playing voice stream. (The magical PAUSE button)
* Use command `<prefix>resume` to resume paused voice stream.
* Use command `<prefix>stop` to stop music playback altogether.
* Use command `<prefix>skip` to skip music player to the next song if available.
* Use command `<prefix>Jump [number]` to jump music player to specific song identified by its number in the queue. (basically a short hand function for skip, feels good to be able to warp through songs, heh.)
* Use command `<prefix>prefix [char]` to view bot prefix or set one by passing a single or series of characters which will be set as custom bot prefix for particular guild.
* Use command `<prefix>help [command]` to view general command info or information regarding certain command by supplying a command name, e.g. either `<prefix>help` or `<prefix>help play` will suffice.
* Use command `<prefix>ping` to check bot / discord api latency
* Use command `<prefix>seek [interval]` to seek music player to specific time, e.g. `<prefix>seek 1:40` would seek music player to 1 minute 40 seconds time, if current track time is less than that, the music will end.

`<prefix>` indicates a bot command prefix set in `configs/app.json` file, by default it is `.` (dot)

## Dependencies

* discord.js-commando
* ffmpeg
