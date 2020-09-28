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
const loadTrack = require('./loadTrack');
const { lookup } = require('dns');
const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
    terminal: false
});

let getTracks = async (trackName) => {
    const browser = await puppeteer.launch({executablePath: chromiumExecutablePath, headless: true});
    const page = await browser.newPage();
    let url = `https://soundcloud.com/search/sounds?q=${trackName}`;
    await page.goto(url, {waitUntil: 'networkidle2'});

    return await page.evaluate((trackNames, trackArtist) => {
        let trackSearchResults = {
            names: [],
            artists: [],
            links: []
        };

        document.querySelectorAll(trackNames).forEach(name => {
            trackSearchResults.names.push(name.innerText);
        });

        document.querySelectorAll(trackArtist).forEach(artist => {
            trackSearchResults.artists.push(artist.innerText);
        });

        document.querySelectorAll(trackNames).forEach(link => {
            trackSearchResults.links.push(link.href);
        });

        return trackSearchResults;
    }, en.searchTracks.trackNames, en.searchTracks.trackArtist)
}

let enterTrackNumber = (links) => {
    rl.question("Select track (#) or re-search (s): ", (inputTrackNumber) => {
        if(inputTrackNumber == 's'){
            console.clear()
            searchTracks()
        } else if(isNaN(inputTrackNumber) || inputTrackNumber > links.length || inputTrackNumber == 0){
            console.log(`error: '${inputTrackNumber}' is not a valid track #!`)
            enterTrackNumber(links);
        } else {
            loadTrack.loadTrack(links[inputTrackNumber - 1]);
        }
    })
}

let searchTracks = async () => {
    rl.question("Search for a track: ", async (inputTrack) => {
        let tracks = await getTracks(inputTrack);

        if(tracks.names.length == 0){
            console.clear()
            console.log(`'${inputTrack}' not found!`)
            searchTracks()
        } else {
            console.clear()
            for(let i = 0; i < tracks.names.length; i++){
                console.log(`${i+1}~ ${tracks.names[i]} | ${tracks.artists[i]}`)
            }
            enterTrackNumber(tracks.links)
        }
    })
}

module.exports = {
    searchTracks: searchTracks,
    selectTracks: enterTrackNumber,
}