const searchArtist = require('./searchArtist');
/*
created by @ethans333 - https://github.com/ethans333/soundcloudTerminal/blob/master/README.md
*/

const searchTracks = require('./searchTracks');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
    terminal: false
}); 

let main = () => {
    console.clear()
    rl.question(
        "~Enter 't' to search tracks \n~Enter 'a' to search artists \n~",
        (inputSearchOption) => {
            switch(inputSearchOption){
                case "t": 
                    console.clear()
                    searchTracks.searchTracks()
                    break;
                case "a":
                    console.clear()
                    searchArtist.searchArtist()
                    break;
                default:
                    console.log('Invalid response!')
                    main();
            }
        })
};

main();

/* 
TO-DO
- Intercept network calls for downloading songs
- if search results = undefined promnpt user and search again
*/