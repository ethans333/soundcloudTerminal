const puppeteer = require('puppeteer');
const en = require('./elementNames');
const loadTrack = require('./loadTrack');
const { lookup } = require('dns');
const term = require('terminal-kit').terminal;
const { terminal } = require('terminal-kit');

let getTracks = async (trackName) => {
    const browser = await puppeteer.launch({headless: true});
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

let searchTracks = async () => {
    term("Search for a track: ")
    term.inputField({history: true}, async function(error, response){
        let tracks = await getTracks(response);
        if(tracks.names.length == 0){
            console.clear()
            console.log(`'${response}' not found!`)
            searchTracks()
        } else {
            console.clear()
            let trackNames = []
            for(let i = 0; i < tracks.names.length; i++){
                trackNames.push(`${tracks.names[i]} | ${tracks.artists[i]}`)
            }
            trackNames.push("None of these")
            term.singleColumnMenu(trackNames, {}, function(error, response){
                if(response.selectedIndex == trackNames.length - 1){
                    console.clear()
                    searchTracks()
                } else {
                    loadTrack.loadTrack(tracks.links[response.selectedIndex]);
                }
            })
        }
    })
}

module.exports = {
    searchTracks: searchTracks
}