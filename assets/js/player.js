function initVideoPlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                var playRequest = video.play();
                if (playRequest && playRequest.catch) {
                    playRequest.catch(function () {});
                }
            });
        } else {
            video.src = source;
        }
    }

    function play() {
        if (cover) {
            cover.classList.add("is-hidden");
        }
        load();
        var playRequest = video.play();
        if (playRequest && playRequest.catch) {
            playRequest.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            play();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
