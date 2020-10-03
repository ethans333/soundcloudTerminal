const puppeteer = require('puppeteer');
const request_client = require('request-promise-native');
const en = require('./elementNames');
const NodeID3 = require('node-id3');
const got = require('got');

// I.
let fetchDowload = async (url) => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle0'});

  await fetchUrl(page, browser);
};

// II.
let fetchUrl = async (page, browser) => {
  let result = [], gotUrl = true;

  await page.setRequestInterception(true);

  await page.on('request', request => {
    request_client({
      uri: request.url(),
      resolveWithFullResponse: true,
    }).then(response => {
      const request_url = request.url();

      result.push({
        request_url
      });

      let currentUrl = result[result.length-1].request_url;

      if(gotUrl){
        returnUrl(currentUrl, page, browser);
      }

      if(currentUrl.includes("https://cf-hls-media.sndcdn.com/media")){
        gotUrl = false;
        request.abort();
      }

    }).catch(error => {
      console.error(error);
      request.abort();
    });
  });
};

// III.
let returnUrl = async (url, page, browser) => {
  let urlArray = url.split("/"), startFinish = [];

  urlArray.forEach(i => {
    if(!isNaN(parseFloat(i)) && isFinite(i)){
      startFinish.push(i)
    }
  });

  await page.evaluate((playButton) => {
    document.querySelector(playButton).click()
  },en.fetchDownload.playButton);

  url = url.replace(startFinish[0], '0')
  url = url.replace(startFinish[1], '10000000')

  if(url.includes("https://cf-hls-media.sndcdn.com/media")){
    let tags = await page.evaluate((title, artist, albumCover) => {
      return {
        title: (document.querySelector(title).innerText).replace('/', ''),
        artist: document.querySelector(artist).innerText,
        albumCover: ((document.querySelector(albumCover).style.backgroundImage).replace('url("', '')).replace('")', '')
      }
    }, en.fetchDownload.title, en.fetchDownload.artist, en.fetchDownload.albumCover);

    let fs = require('fs'),
    request = require('request');

    if(!fs.existsSync('./Saved Songs')){
      fs.mkdirSync('./Saved Songs'); 
    }

    request
    .get(url)
    .pipe(fs.createWriteStream(`./Saved Songs/${tags.title}.mp3`))
    .on('finish', () => {
        setTags(tags, browser)
    });
  }
};

// IV.
let setTags = async (info, browser) => {
  let file = `./Saved Songs/${info.title}.mp3`;

  let tags = {
    title: info.title,
    artist: info.artist,
    album: info.title,
    image: {
      mime: "jpeg",
      type: {
        id: 3,
        name: "Album Cover"
      },
      imageBuffer: (await got(info.albumCover, { responseType: 'buffer' })).body
    },
  }

  NodeID3.create(tags)
  NodeID3.write(tags, file)

  await browser.close()
}

module.exports = {
  fetchDownload: fetchDowload
}