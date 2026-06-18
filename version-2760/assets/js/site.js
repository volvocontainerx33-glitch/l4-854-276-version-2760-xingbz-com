(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = $("[data-nav-toggle]");
        var mobile = $("[data-mobile-nav]");
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("nav-open");
        });
        $$("a", mobile).forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("nav-open");
            });
        });
    }

    function initHero() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = $$('[data-hero-slide]', hero);
        var dots = $$('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var panel = $("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = $("[data-filter-input]");
        var region = $("[data-filter-region]");
        var year = $("[data-filter-year]");
        var category = $("[data-filter-category]");
        var cards = $$('[data-search-card]');
        var empty = $("[data-empty-state]");
        function apply() {
            var q = normalize(input && input.value);
            var r = normalize(region && region.value);
            var y = normalize(year && year.value);
            var c = normalize(category && category.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.textContent
                ].join(" "));
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (r && normalize(card.dataset.region) !== r) {
                    match = false;
                }
                if (y && normalize(card.dataset.year) !== y) {
                    match = false;
                }
                if (c && normalize(card.dataset.category) !== c) {
                    match = false;
                }
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        [input, region, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && input) {
            input.value = query;
        }
        apply();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
