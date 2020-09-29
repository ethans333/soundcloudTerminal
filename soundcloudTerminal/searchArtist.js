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
const { searchArtist } = require('./elementNames');
const loadArtist = require('./loadArtist');
const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
    terminal: false
}); 

let getArtist = async (artistName) => {
    const browser = await puppeteer.launch({executablePath: chromiumExecutablePath, headless: true});
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
    for(let i=0; i<artists.names.length;i++){
        console.log(`${i+1}~ ${artists.names[i]} ~ ${artists.followers[i]}`)
    }
    rl.question("\nSelect artist (#) or re-search (s): ", (inputArtist) => {
        if (inputArtist == 's') {
            console.clear()
            search()
        } else if(Number.isNaN(inputArtist) || inputArtist > artists.names.length || inputArtist < 1){
            selectArtist()
        } else {
            loadArtist.loadArtist(artists.links[inputArtist])
        }
    })
}

let search = () => {
    rl.question("Search for an artist: ", async (inputArtist) => {
        let artists = await getArtist(inputArtist)

        if(artists.names.length == 0){
            console.clear()
            console.log(`'${inputArtist}' not found!`)
            search()
        } else {
            rl.question(`${artists.names[0]}? (y/n): `, (inputArtist) => {
                switch(inputArtist){
                    case "y":
                        loadArtist.loadArtist(artists.links[0])
                        break;
                    case "n":
                        selectArtist(artists)
                        break;
                    default:
                        console.clear()
                        console.log(`${inputArtist} is not a valid input!`)
                        search()
                }
            })
        }
    })
}

module.exports = {
    searchArtist: search,
}
