let fs = require('fs');

let addUrl = (url) => {
    let fileDir = '../Saved Songs/likedSongs.txt';

    fs.appendFile(fileDir, url+'\n', function(){});
}

let likeSong = (url) => {
    if(!fs.existsSync('../Saved Songs')){
        fs.mkdirSync('../Saved Songs'); 
        addUrl(url)
    } else {
        addUrl(url);
    }
}

module.exports = {
    likeSong: likeSong
}