const puppeteer = require('puppeteer');
const term = require('terminal-kit').terminal;
const { terminal } = require('terminal-kit');
const en = require('./elementNames');
const { searchArtist } = require('./elementNames');
const loadArtist = require('./loadArtist');

let getArtist = async (artistName) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let url = `https://soundcloud.com/search/people?q=${artistName}`;
    await page.goto(url, {waitUntil: 'networkidle2'});

    return await page.evaluate((artistNames, followers) => {
        let Artist = {
            names: [],
            links: [],
            followers: []
        }

        document.querySelectorAll(artistNames).forEach(artist => {
            Artist.names.push(artist.innerText)
            Artist.links.push(artist.href)
        });

        for(let i=1;i<document.querySelectorAll(followers).length;i+=2){
            Artist.followers.push(document.querySelectorAll(followers)[i].innerText)
        }

        return Artist;
    }, en.searchArtist.artistNames, en.searchArtist.followers)
}

let selectArtist = (artists) => {
    console.clear()
    let artistArray = [];
    for(let i=0; i<artists.names.length;i++){
        artistArray.push(`${artists.names[i]} ~ ${artists.followers[i]}`)
    }
    artistArray.push("None of these")
    term.singleColumnMenu(artistArray, {}, function(error, response){
        if(response.selectedIndex == artistArray.length - 1){
            console.clear()
            search()
        } else {
            loadArtist.loadArtist(artists.links[response.selectedIndex])
        }
    })
}

let search = () => {
    term("Search for an Artist: ");
    term.inputField({history: true}, async function(error, input){
        console.clear()
        let artists = await getArtist(input)

        if(artists.names.length == 0){
            console.clear()
            console.log(`'${input}' not found!`)
            search()
        } else {
            term(`${artists.names[0]}?`)
            term.singleColumnMenu(["Yes", "No"], {}, function(error, response){
                if(response.selectedIndex == 0){
                    loadArtist.loadArtist(artists.links[0])
                } else {
                    selectArtist(artists)
                }
            })

        }
    })
}

module.exports = {
    searchArtist: search,
}
