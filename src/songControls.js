const puppeteer = require('puppeteer');
const term = require('terminal-kit').terminal;
const en = require('./elementNames');
const terminalImage = require('terminal-image'), got = require('got');
const fd = require('./fetchDownload');
const likeSong = require('./likeSong');

let paused = false, second = 1000;

let songsPlaying = []

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

    await page.waitForTimeout(1000)
    
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

    await page.waitForTimeout(500)
    
    await Promise.all([
        page.waitForNavigation(),
        await page.evaluate((currentTrack) => {
            return document.querySelector(currentTrack).click()
        }, en.songControls.currentTrack),
      ]);

    loadTrack(page)
}

let loadTrack = async (page, url) => {
    console.clear()

    await page.waitForTimeout(500)

    let Track = await page.evaluate((albumCover, trackTitle, artistName)=>{
        if(document.querySelector(albumCover) != null){
            return {
                albumCover: ((document.querySelector(albumCover).style.backgroundImage).replace('url("', '')).replace('")', ''),
                title: document.querySelectorAll(trackTitle)[0].innerText,
                artist: document.querySelectorAll(artistName)[0].innerText
            }
        } else {
            return {
                albumCover: 'https://avatars1.githubusercontent.com/u/19983539?s=400&u=48d1192ed90903c54661d960424f9117b19abcf5&v=4',
                title: 'Song data not found! This cannot be downloaded... 😔',
                artist: ''
            }
        }
    }, en.loadTrack.albumCover,
    en.loadTrack.trackTitle, 
    en.loadTrack.artistName);

    let trackAlbumCover = await got(Track.albumCover).buffer();
    
    console.clear()
    console.log(await terminalImage.buffer(trackAlbumCover));
    
    if(Track.title == 'Song data not found! This cannot be downloaded... 😔'){
        term.brightRed(await Track.title)
    } else {
        console.log(`~~ ${await Track.title} ~~\n`)
    }

    controls(page);
}

class Song {
    constructor(duration, page){
        this.duration = duration;
        this.init = async (page) => {
            await page.waitForTimeout(this.duration - 100)

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
            minutes: parseInt(_songDuration.substr(0, _songDuration.indexOf(':'))),
            seconds: parseInt(_songDuration.substr(_songDuration.indexOf(':')+1, _songDuration.length)),
        }
    }, en.songControls.songDuration)
    
    songsPlaying.push(new Song((songDuration.minutes * second*60) + (songDuration.seconds * second), page))
}

let dataExists = async (page) => {
    return await page.evaluate((albumCover)=>{
        if(document.querySelector(albumCover) != null){
            return true
        }
    }, en.loadTrack.albumCover);
}

let controls = async (page) => {
    await createSong(page)
    let refreshTerminal = () => {
        console.clear()
        loadTrack(page, page.url())
    }

let controls = async (page) => {
    await createSong(page)
    let refreshTerminal = () => {
        console.clear()
        loadTrack(page, page.url())
    }

    let controlsQuestion = () => {
        const controlOptions = ["Pause/Play", "Skip Track", "Replay/ Go To Previous Track","End Process","More"];
        term.singleColumnMenu(controlOptions, {}, function(error, response){
            if(response.selectedIndex == 0){
                pause(page)
                console.clear()
                loadTrack(page, page.url())
            } else if(response.selectedIndex == 1){
                skip(page)
            } else if(response.selectedIndex == 2){
                prev(page)
            }else if(response.selectedIndex == 3){
                process.exit()
            } else {
                console.clear()
                const moreOptions = ["Like Song", "Download Track", "<="];
                term.singleColumnMenu(moreOptions, {}, function(error, response){
                    if(response.selectedIndex == 0){
                        likeSong.likeSong(page.url())
                        refreshTerminal()
                    } else if(response.selectedIndex == 1){
                        if(dataExists(page)){
                            fd.fetchDownload(page.url())
                            refreshTerminal()
                        }
                    } else {
                        refreshTerminal()
                    }
                })
            }
        })
    }
    
    controlsQuestion()
}

module.exports = {
    controls: controls
}
