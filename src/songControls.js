/*
created by @ethans333 - https://github.com/ethans333/soundcloudTerminal/blob/master/README.md
*/


const puppeteer = require('puppeteer');
const isPkg = typeof process.pkg !== 'undefined'
const chromiumExecutablePath = (isPkg
  ? puppeteer.executablePath().replace(
      /^.*?\/node_modules\/puppeteer\/\.local-chromium/,
      path.join(path.dirname(process.execPath), 'chromium')
    )
  : puppeteer.executablePath()
)
const readline = require('readline');
const en = require('./elementNames');
const terminalImage = require('terminal-image'), got = require('got');
const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
    terminal: false
});

let paused = false, second = 1000;

let songsPlaying = []
/*
-Auto plays song -> starts a timer and will skip once song is done playing -> Add this to list
-If song is done playing and is the last index play
new song if another song was added to the list then do nothing for last song


if song is paused then make timers wait duration - timeElapsed when unpaused
*/

let pause = async (page) => {
    await page.evaluate((pauseButton, playButton, paused) => {
        if(paused){
            document.querySelector(playButton).click()
        } else {
            document.querySelector(pauseButton).click()
        }
    }, en.songControls.menuPauseButton, en.songControls.menuPlayButton, paused);


    if(paused){
        for(let i=0;i<songsPlaying.length;i++){
            songsPlaying[i].push(new Song(await songsPlaying[i].getNewTimer(), page))
        }
        paused = false;
    } else {
        songsPlaying = []
        paused = true;
    }
}

let skip = async (page) => {
    await page.evaluate((skipButton) => {
        document.querySelector(skipButton).click()
    }, en.songControls.skipButton)

    await page.waitFor(1000)
    
    await Promise.all([
        page.waitForNavigation(),
        await page.evaluate((currentTrack) => {
            return document.querySelector(currentTrack).click()
        }, en.songControls.currentTrack)
      ]);

    loadTrack(page)
}

let prev = async (page) => {
    await page.evaluate((prevButton) => {
        document.querySelector(prevButton).click()
    }, en.songControls.prevButton)

    await page.waitFor(1000)
    
    await Promise.all([
        page.waitForNavigation(),
        await page.evaluate((currentTrack) => {
            return document.querySelector(currentTrack).click()
        }, en.songControls.currentTrack),
      ]);

    loadTrack(page)
}

let loadTrack = async (page) => {
    console.clear()

    await page.waitFor(500)
    let Track = await page.evaluate((albumCover, trackTitle, artistName) => {
        return {
            albumCover: ((document.querySelector(albumCover).style.backgroundImage
                ).replace('url("', '')).replace('")', ''),
            title: document.querySelectorAll(trackTitle)[0].innerText,
            artist: document.querySelectorAll(artistName)[0].innerText
        }
    }, 
    en.loadTrack.albumCover, 
    en.loadTrack.trackTitle, 
    en.loadTrack.artistName)

    let trackAlbumCover = await got(Track.albumCover).buffer();
    
    console.clear()
    console.log(`${await terminalImage.buffer(trackAlbumCover)}`);
    console.log(`~~ ${await Track.title} ~~\n`)

    controls(page);
}

class Song {
    constructor(duration, page){
        this.duration = duration;
        this.init = async (page) => {
            await page.waitFor(this.duration - 100)

            if(songsPlaying.indexOf(this)+1 == songsPlaying.length){
                songsPlaying.splice(songsPlaying.indexOf(this), 1);
                skip(page)
            }
        }
        this.init(page)

        this.getNewTimer = async () => {
            let timeElapsed = await page.evaluate((timeElapsed) => {
                let _timeElapsed = document.querySelector(timeElapsed).innerText
                return {
                    minutes: parseInt(
                        _timeElapsed.substr(0, _timeElapsed.indexOf(':'))),
                    seconds: parseInt(
                        _timeElapsed.substr(_timeElapsed.indexOf(':')+1, _timeElapsed.length)),
                }
            }, en.songControls.timeElapsed)
            return this.duration - ((timeElapsed.minutes * second*60) + (timeElapsed.seconds * second))
        }
    }
}

let createSong = async (page) => {
    let songDuration = await page.evaluate((songDuration)=>{
        let _songDuration = document.querySelector(songDuration).innerText
        return {
            minutes: parseInt(
                _songDuration.substr(0, _songDuration.indexOf(':'))),
            seconds: parseInt(
                _songDuration.substr(_songDuration.indexOf(':')+1, _songDuration.length)),
        }
    }, en.songControls.songDuration)
    
    songsPlaying.push(new Song(
        (songDuration.minutes * second*60) + (songDuration.seconds * second),
        page
    ))
}

let controls = async (page) => {
    await createSong(page)

    let controlsQuestion = () => {
        rl.question('~', (inputSongControl)=>{
            switch(inputSongControl){
                case "p":
                    pause(page)
                    controlsQuestion()
                    break;
                case "skip":
                    skip(page)
                    break;
                case "prev":
                    prev(page)
                    break;
                default:
                    console.log(`error: '${inputSongControl}; is not a valid input`)
            }
        })
    }
    console.log("~Enter 'p'    ⏯")
    console.log("~Enter 'skip' ⏭")
    console.log("~Enter 'prev' ⏮")
    
    controlsQuestion()
}

module.exports = {
    controls: controls
}