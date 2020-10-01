module.exports = {
    searchArtist: {
        artistNames: '#content > div > div > div.l-main > div > div > div > ul > li > div > div > div > h2 > a',
        followers: 'a[class="sc-ministats sc-ministats-small sc-ministats-followers"] > span'
    },
    searchTracks: {
        trackNames: 'div[class="sound__header"] > div > div > div[class="soundTitle__usernameTitleContainer"] > a',
        trackArtist: 'div[class="soundTitle__usernameTitleContainer"] > div[class="sc-type-light soundTitle__secondary "]'
    },
    loadTrack: {
        albumCover: '#content > div > div.l-listen-hero > div > div.fullHero__foreground.fullListenHero__foreground > div.fullHero__artwork > div > div > div > span',
        trackTitle: 'span[class="soundTitle__title sc-font g-type-shrinkwrap-inline g-type-shrinkwrap-large-primary"]',
        artistName: 'a[class="soundTitle__username g-opacity-transition-500 g-type-shrinkwrap-inline g-type-shrinkwrap-large-secondary soundTitle__usernameHero sc-type-medium"]',
        playButton: 'a[class="sc-button-play playButton sc-button m-stretch"]',
    },
    songControls: {
        pauseButton: 'a[class="sc-button-play playButton sc-button m-stretch sc-button-pause"]',
        playButton: 'a[class="sc-button-play playButton sc-button m-stretch"]',
        menuPauseButton: '#app > div.playControls.g-z-index-control-bar.m-visible > section > div > div.playControls__elements > button.playControl.sc-ir.playControls__control.playControls__play.playing',
        menuPlayButton: '#app > div.playControls.g-z-index-control-bar.m-visible > section > div > div.playControls__elements > button.playControl.sc-ir.playControls__control.playControls__play',
        timeElapsed: '#app > div.playControls.g-z-index-control-bar.m-visible > section > div > div.playControls__elements > div.playControls__timeline > div > div.playbackTimeline__timePassed > span:nth-child(2)',
        songDuration: '#app > div.playControls.g-z-index-control-bar.m-visible > section > div > div.playControls__elements > div.playControls__timeline > div > div.playbackTimeline__duration > span:nth-child(2)',
        currentTrack: '#app > div.playControls.g-z-index-control-bar.m-visible > section > div > div.playControls__elements > div.playControls__soundBadge > div > div.playbackSoundBadge__titleContextContainer > div > a',
        skipButton: '#app > div.playControls.g-z-index-control-bar.m-visible > section > div > div.playControls__elements > button.skipControl.sc-ir.playControls__control.playControls__next.skipControl__next',
        queueMenu: '#app > div.playControls.g-z-index-control-bar.m-visible.m-queueVisible > section > div > div.playControls__elements > div.playControls__soundBadge > div > div.playbackSoundBadge__actions > a > div',
        prevButton: '#app > div.playControls.g-z-index-control-bar.m-visible > section > div > div.playControls__elements > button.skipControl.sc-ir.playControls__control.playControls__prev.skipControl__previous'
    },
    loadArtist: {
        artistName: 'div.profileHeaderInfo__content.sc-media-content > h3',
        avatar: 'div.profileHeaderInfo__avatar.sc-media-image > div > span',
        intTracks: 'td:nth-child(3) > a > div',
        songs: 'div[class="sound__header"] > div[class="soundTitle sc-clearfix sc-hyphenate sc-type-h2 streamContext"] > div[class="soundTitle__titleContainer"] > div[class="soundTitle__usernameTitleContainer"] > a',
    }
}