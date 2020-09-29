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
const sc = require('./songControls')
const terminalImage = require('terminal-image'), got = require('got');

let loadTrack = async (url) => {
    console.clear()
    const browser = await puppeteer.launch({executablePath: chromiumExecutablePath, headless: true, ignoreDefaultArgs: ['--mute-audio']});
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle0', timeout: 0});

    let Track = await page.evaluate((albumCover, trackTitle, artistName, playButton) => {
        document.querySelector(playButton).click()
        return {
            albumCover: ((document.querySelector(albumCover).style.backgroundImage
                ).replace('url("', '')).replace('")', ''),
            title: document.querySelectorAll(trackTitle)[0].innerText,
            artist: document.querySelectorAll(artistName)[0].innerText
        }
    }, 
    en.loadTrack.albumCover, 
    en.loadTrack.trackTitle, 
    en.loadTrack.artistName, 
    en.loadTrack.playButton)

    let trackAlbumCover = await got(Track.albumCover).buffer();
    
    console.clear()
    console.log(`${await terminalImage.buffer(trackAlbumCover)}`);
    console.log(`~~ ${await Track.title} ~~\n`)

    sc.controls(page);
}

module.exports = {
    loadTrack: loadTrack
}

