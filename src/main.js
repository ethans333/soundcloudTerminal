/*
soundcloud terminal v1.0.1 - https://github.com/ethans333/soundcloudTerminal
created by @ethans333
*/

const searchArtist = require('./searchArtist');
const searchTracks = require('./searchTracks');
const term = require('terminal-kit').terminal;

let main = () => {
    console.clear()
    term("SoundCloud Terminal \n")

    term.singleColumnMenu(["Search Tracks", "Search Artists"], {}, function(error, response){
        if(response.selectedIndex == 0){
            console.clear()
            searchTracks.searchTracks()
        } else {
            console.clear()
            searchArtist.searchArtist()
        }
    });
};

main();

/* 
TO-DO
- Intercept network calls for downloading songs
*/