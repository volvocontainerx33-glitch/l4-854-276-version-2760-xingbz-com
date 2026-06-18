(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const nav = document.getElementById('site-nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        const showSlide = function (index) {
            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                const current = slideIndex === active;
                slide.classList.toggle('is-active', current);
                slide.setAttribute('aria-hidden', current ? 'false' : 'true');
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        const startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5000);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        const scope = panel.parentElement || document;
        const list = scope.querySelector('.filter-list');

        if (!list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll('[data-title]'));
        const search = panel.querySelector('[data-filter-search]');
        const region = panel.querySelector('[data-filter-region]');
        const year = panel.querySelector('[data-filter-year]');
        const category = panel.querySelector('[data-filter-category]');

        const apply = function () {
            const q = search ? search.value.trim().toLowerCase() : '';
            const r = region ? region.value.trim() : '';
            const y = year ? year.value.trim() : '';
            const c = category ? category.value.trim() : '';

            cards.forEach(function (card) {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const dataRegion = card.getAttribute('data-region') || '';
                const dataGenre = card.getAttribute('data-genre') || '';
                const dataYear = card.getAttribute('data-year') || '';
                const dataCategory = card.getAttribute('data-category') || '';
                const text = card.textContent.toLowerCase();
                const matchQuery = !q || title.includes(q) || text.includes(q) || dataGenre.toLowerCase().includes(q) || dataRegion.toLowerCase().includes(q);
                const matchRegion = !r || dataRegion.includes(r) || text.includes(r.toLowerCase());
                const matchYear = !y || dataYear === y || text.includes(y.toLowerCase());
                const matchCategory = !c || dataCategory === c || text.includes(c.toLowerCase());

                card.classList.toggle('is-hidden', !(matchQuery && matchRegion && matchYear && matchCategory));
            });
        };

        [search, region, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
})();

function initPlayer(options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.buttonId);

    if (!video || !button || !options.stream) {
        return;
    }

    let ready = false;
    let hls = null;

    const prepare = function () {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = options.stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(options.stream);
            hls.attachMedia(video);
        }
    };

    const start = function () {
        prepare();
        button.hidden = true;
        const result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                button.hidden = false;
            });
        }
    };

    button.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        button.hidden = true;
    });

    video.addEventListener('ended', function () {
        button.hidden = false;
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
