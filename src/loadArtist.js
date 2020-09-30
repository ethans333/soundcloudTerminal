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
const loadTrack = require('./loadTrack');
const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
    terminal: false
});

let loadMoreSongs = async (Profile, page, intPage) => {
    if(intPage > Math.ceil(Profile.intTracks/10)){
        intPage = Math.ceil(Profile.intTracks/10);
    } else if (intPage < 1){
        intPage = 1;
    }

    let tracksLoaded = async () => {
        return await page.evaluate((_songs) => {
            return document.querySelectorAll(_songs).length
        }, en.loadArtist.songs)
    }

    while(await tracksLoaded() < intPage*10){
        scrollToLoad(page)
        await page.waitFor(500)
        if(await tracksLoaded() > parseInt(Profile.intTracks) - 10){
            scrollToLoad(page)
            await page.waitFor(500)
            break;
        }
    }

    Profile = await page.evaluate((_Profile, _songs, _intPage) => {
        let artistSongs = document.querySelectorAll(_songs);

        _Profile.songs.titles = []
        _Profile.songs.links = []
        _Profile.songs.page = `page [${_intPage}/${Math.ceil(_Profile.intTracks/10)}]`

        for(let i=(_intPage-1)*10; i<_intPage*10; i++){
            if(i == artistSongs.length){
                break;
            }

            _Profile.songs.titles.push(artistSongs[i].innerText)
            _Profile.songs.links.push(artistSongs[i].href)
        }

        return _Profile;
    }, Profile, en.loadArtist.songs, intPage)

    displayProfile(Profile, page)
}

let scrollToLoad = async (page) => {
    let bodyHandle = await page.$('body'), { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();

    let viewportHeight = page.viewport().height, viewportIncr = 0;
    while (viewportIncr + viewportHeight < height) {
        await page.evaluate(_viewportHeight => {
        window.scrollBy(0, _viewportHeight);
        }, viewportHeight);
        await page.waitFor(20);
        viewportIncr = viewportIncr + viewportHeight;
    }
}

let displayProfile = async (Profile, page) => {
    let avatar = await got(Profile.avatar).buffer()
    console.log(await terminalImage.buffer(avatar))
    console.log(`~~ ${Profile.name} ~~\n`)
    for(let i=0; i<Profile.songs.titles.length; i++){
        console.log(`${i+1}~ ${Profile.songs.titles[i]}`)
    }
    console.log(`\n~~ ${Profile.songs.page} ~~\n`)

    let selectionPrompt = (Profile, page) => {
        rl.question("Select page (p#) or track (t#): ", (inputSelection) => {
            if(Number.isInteger(parseInt(inputSelection.substr(1, inputSelection.length)))){
                if(inputSelection.includes("p")){
                    loadMoreSongs(Profile, page, parseInt(inputSelection.substr(1, inputSelection.length)))
                } else if (inputSelection.includes("t")){
                    loadTrack.loadTrack(Profile.songs.links[inputSelection.substr(1, inputSelection.length) - 1])
                } else {
                    errorPrompt(inputSelection, Profile, page)
                }
            } else {
                errorPrompt(inputSelection, Profile, page)
            }
        })
    }

    let errorPrompt = (input, Profile, page) => {
        console.error(`error: ${input} is an invalid input`)
        selectionPrompt(Profile, page)
    }

    selectionPrompt(Profile, page);
}

module.exports = {
    loadArtist: async(url) => {
        const browser = await puppeteer.launch({executablePath: chromiumExecutablePath, headless: true, ignoreDefaultArgs: ['--mute-audio']});
        const page = await browser.newPage();
        await page.goto(url + '/tracks', {waitUntil: 'networkidle0'});
    
        let ArtistProfile = await page.evaluate((artistName, avatar, intTracks, songs) => {
            let Profile = {
                name: document.querySelector(artistName).innerText.replace(' Pro Unlimited', ''),
                avatar: document.querySelector(avatar).style.backgroundImage.replace('url("','').replace('")',''),
                intTracks: document.querySelector(intTracks).innerText,
                songs: {
                   titles: [],
                   links: [],
                   page: ``
                }
            }

            Profile.songs.page = `page [${1}/${Math.ceil(Profile.intTracks/10)}]`

            let artistSongs = document.querySelectorAll(songs);

            for(let i=0; i<artistSongs.length; i++){
                Profile.songs.titles.push(artistSongs[i].innerText)
                Profile.songs.links.push(artistSongs[i].href)
            }
            return Profile
        }, 
        en.loadArtist.artistName,
        en.loadArtist.avatar,
        en.loadArtist.intTracks, 
        en.loadArtist.songs)

        displayProfile(ArtistProfile, page);
    }
}