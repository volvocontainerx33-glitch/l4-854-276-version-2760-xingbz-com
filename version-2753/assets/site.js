(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var menu = document.getElementById("mobileNav");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            menu.classList.toggle("open", !expanded);
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var activeIndex = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains("active");
        }));
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startTimer();
            });
        });

        slider.addEventListener("mouseenter", stopTimer);
        slider.addEventListener("mouseleave", startTimer);
        showSlide(activeIndex);
        startTimer();
    }

    function initImageFallbacks() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
                image.setAttribute("aria-hidden", "true");
            }, { once: true });
        });
    }

    function initPlayers() {
        document.querySelectorAll(".js-video-player").forEach(function (video) {
            var source = video.getAttribute("data-video-src");
            var wrapper = video.closest(".player-card");
            var toggle = wrapper ? wrapper.querySelector(".js-player-toggle") : null;

            if (!source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }

            function updateOverlay() {
                if (!toggle) {
                    return;
                }

                toggle.classList.toggle("hidden", !video.paused && !video.ended);
            }

            if (toggle) {
                toggle.addEventListener("click", function () {
                    if (video.paused) {
                        var playPromise = video.play();

                        if (playPromise && typeof playPromise.catch === "function") {
                            playPromise.catch(function () {
                                toggle.classList.remove("hidden");
                            });
                        }
                    } else {
                        video.pause();
                    }
                });
            }

            video.addEventListener("play", updateOverlay);
            video.addEventListener("pause", updateOverlay);
            video.addEventListener("ended", updateOverlay);
            updateOverlay();
        });
    }

    function normalizeText(text) {
        return String(text || "").toLowerCase().trim();
    }

    function initCardFilters() {
        var filter = document.querySelector(".js-card-filter");
        var sort = document.querySelector(".js-sort-select");
        var list = document.querySelector(".js-card-list");

        if (!list) {
            return;
        }

        var originalItems = Array.prototype.slice.call(list.children);

        function applyFilter() {
            var keyword = filter ? normalizeText(filter.value) : "";
            Array.prototype.slice.call(list.children).forEach(function (item) {
                var haystack = normalizeText(item.getAttribute("data-search") || item.textContent);
                item.hidden = keyword && haystack.indexOf(keyword) === -1;
            });
        }

        function applySort() {
            if (!sort) {
                return;
            }

            var mode = sort.value;
            var items = Array.prototype.slice.call(list.children);

            if (mode === "default") {
                items = originalItems.slice();
            } else if (mode === "year-desc") {
                items.sort(function (a, b) {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                });
            } else if (mode === "year-asc") {
                items.sort(function (a, b) {
                    return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                });
            } else if (mode === "title-asc") {
                items.sort(function (a, b) {
                    return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
                });
            } else if (mode === "hot-desc") {
                items.sort(function (a, b) {
                    return Number(b.getAttribute("data-hot")) - Number(a.getAttribute("data-hot"));
                });
            }

            items.forEach(function (item) {
                list.appendChild(item);
            });
            applyFilter();
        }

        if (filter) {
            filter.addEventListener("input", applyFilter);
        }

        if (sort) {
            sort.addEventListener("change", applySort);
        }
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span class=\"tag\">" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card movie-card-wide\">",
            "<a href=\"" + escapeHtml(movie.url) + "\" class=\"wide-card-link\">",
            "<div class=\"wide-poster poster-frame\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-badge\">" + escapeHtml(movie.region) + "</span>",
            "</div>",
            "<div class=\"wide-card-body\">",
            "<h3>" + escapeHtml(movie.title) + "</h3>",
            "<p>" + escapeHtml(movie.oneLine || "") + "</p>",
            "<div class=\"card-meta\">",
            "<span>" + escapeHtml(movie.year) + "</span>",
            "<span>" + escapeHtml(movie.type) + "</span>",
            "<span>" + escapeHtml(movie.genre) + "</span>",
            "</div>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSiteSearch() {
        var input = document.querySelector(".js-site-search");
        var button = document.querySelector(".js-site-search-button");
        var results = document.querySelector(".js-search-results");
        var status = document.querySelector(".js-search-status");
        var data = window.MOVIES_DATA || [];

        if (!input || !results || !data.length) {
            return;
        }

        function render(movies, keyword) {
            var limited = movies.slice(0, 120);
            results.innerHTML = limited.map(createSearchCard).join("");
            initImageFallbacks();

            if (status) {
                if (keyword) {
                    status.textContent = "关键词“" + keyword + "”找到 " + movies.length + " 个结果，当前展示前 " + limited.length + " 个。";
                } else {
                    status.textContent = "默认展示最新 24 部影片。";
                }
            }
        }

        function runSearch() {
            var keyword = normalizeText(input.value);

            if (!keyword) {
                var latest = data.slice().sort(function (a, b) {
                    return Number(b.year) - Number(a.year);
                }).slice(0, 24);
                render(latest, "");
                return;
            }

            var matches = data.filter(function (movie) {
                var haystack = normalizeText([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.oneLine,
                    (movie.tags || []).join(" ")
                ].join(" "));
                return haystack.indexOf(keyword) !== -1;
            }).sort(function (a, b) {
                return Number(b.hot) - Number(a.hot);
            });

            render(matches, input.value.trim());
        }

        button && button.addEventListener("click", runSearch);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                runSearch();
            }
        });
        input.addEventListener("input", function () {
            if (!input.value.trim()) {
                runSearch();
            }
        });

        document.querySelectorAll(".quick-keywords button").forEach(function (quickButton) {
            quickButton.addEventListener("click", function () {
                input.value = quickButton.getAttribute("data-keyword") || "";
                runSearch();
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query) {
            input.value = query;
            runSearch();
        }
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initImageFallbacks();
        initPlayers();
        initCardFilters();
        initSiteSearch();
    });
})();
