const puppeteer = require('puppeteer');
const en = require('./elementNames');
const sc = require('./songControls')
const terminalImage = require('terminal-image'), got = require('got');

let loadTrack = async (url) => {
    console.clear()
    const browser = await puppeteer.launch({headless: true, ignoreDefaultArgs: ['--mute-audio']});
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle0', timeout: 0});

    let Track = await page.evaluate((albumCover, trackTitle, artistName, playButton) => {
        document.querySelector(playButton).click()
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
        }å
    }, 
    en.loadTrack.albumCover, 
    en.loadTrack.trackTitle, 
    en.loadTrack.artistName, 
    en.loadTrack.playButton)

    let trackAlbumCover = await got(Track.albumCover).buffer();
    
    console.clear()
    console.log(await terminalImage.buffer(trackAlbumCover));
    console.log(`~~ ${await Track.title} ~~\n`)

    sc.controls(page);
}

module.exports = {
    loadTrack: loadTrack
}

