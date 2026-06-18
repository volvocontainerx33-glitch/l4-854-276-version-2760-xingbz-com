(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    function setupHero(slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });

        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-hero-slider]'), setupHero);

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters(scope) {
        var input = scope.querySelector('[data-filter-search]');
        var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var count = scope.querySelector('[data-result-count]');
        var reset = scope.querySelector('[data-filter-reset]');
        var empty = scope.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        selects.forEach(function (select) {
            var key = select.getAttribute('data-filter-select');
            var value = params.get(key);
            if (value) {
                select.value = value;
            }
            if (key === 'primary-genre' && params.get('genre')) {
                select.value = params.get('genre');
            }
        });

        function applyFilters() {
            var query = normalize(input ? input.value : '');
            var activeFilters = {};
            var visible = 0;

            selects.forEach(function (select) {
                activeFilters[select.getAttribute('data-filter-select')] = select.value;
            });

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-primary-genre'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matched = !query || haystack.indexOf(query) !== -1;

                Object.keys(activeFilters).forEach(function (key) {
                    var value = activeFilters[key];
                    if (value && value !== 'all') {
                        matched = matched && normalize(card.getAttribute('data-' + key)) === normalize(value);
                    }
                });

                card.classList.toggle('hidden-by-filter', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                selects.forEach(function (select) {
                    select.value = 'all';
                });
                applyFilters();
            });
        }

        applyFilters();
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-filter-scope]'), setupFilters);

    function setupPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-toggle');
        var source = player.getAttribute('data-src');
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function bindSource() {
            if (video.getAttribute('data-bound') === '1') {
                return;
            }

            video.setAttribute('data-bound', '1');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function play() {
            bindSource();
            player.classList.add('is-playing');
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    player.classList.add('is-playing');
                    video.controls = true;
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), setupPlayer);
}());
