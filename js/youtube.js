var player, iframe;
var $ = document.querySelector.bind(document);

// init player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height:screen.height,
    width: screen.width,
    videoId: 'b4SH_lap4ag',
    events: {
      'onReady': onPlayerReady
    }
  });
}

// when ready, wait for clicks
function onPlayerReady(event) {
  player.playVideo()
}