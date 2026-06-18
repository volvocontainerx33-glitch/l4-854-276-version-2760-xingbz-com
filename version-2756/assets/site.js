(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get('q') || '';
  const filterRoots = Array.from(document.querySelectorAll('[data-filter-root]'));

  filterRoots.forEach(function (root) {
    const input = root.querySelector('[data-filter-input]');
    const yearSelect = root.querySelector('[data-year-filter]');
    const typeSelect = root.querySelector('[data-type-filter]');
    const grid = document.querySelector('[data-movie-grid]');
    const emptyState = document.querySelector('[data-empty-state]');

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    function matches(card) {
      const query = input ? input.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      if (query && haystack.indexOf(query) === -1) {
        return false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        return false;
      }
      if (type && card.getAttribute('data-type') !== type) {
        return false;
      }
      return true;
    }

    function applyFilters() {
      let visible = 0;
      cards.forEach(function (card) {
        const ok = matches(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilters);
    }
    applyFilters();
  });
}());
