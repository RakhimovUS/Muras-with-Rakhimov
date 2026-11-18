// Плавная прокрутка меню
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(event) {
        const id = this.getAttribute('href');
        const target = id.length > 1 ? document.querySelector(id) : null;

        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


// Кнопка главного экрана
const heroButton = document.querySelector('.hero button');

if (heroButton) {
    heroButton.addEventListener('click', function() {
        document.querySelector('#categories')
            ?.scrollIntoView({ behavior: 'smooth' });
    });
}


// Карточки категорий
const cards = document.querySelectorAll('.category-card');


// Анимация карточек
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

cards.forEach(card => observer.observe(card));


// Поиск
const searchInput = document.getElementById('searchInput');
const resetButton = document.getElementById('resetSearch');
const noResults = document.getElementById('noResults');

function searchCards() {
    const text = searchInput.value.toLowerCase().trim();
    let found = 0;

    cards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const matches = cardText.includes(text);

        card.style.display = matches ? '' : 'none';

        if (matches) {
            found++;
        }
    });

    if (noResults) {
        noResults.style.display =
            found === 0 ? 'block' : 'none';
    }
}

if (searchInput) {
    searchInput.addEventListener('input', searchCards);
}


// Сброс поиска
if (resetButton) {
    resetButton.addEventListener('click', function(event) {
        event.preventDefault();

        searchInput.value = '';

        cards.forEach(card => {
            card.style.display = '';
        });

        if (noResults) {
            noResults.style.display = 'none';
        }
    });
}


// Сообщение при нажатии на карточку
cards.forEach(card => {
    card.addEventListener('click', function() {
        if (this.dataset.href) {
            window.location.href = this.dataset.href;
            return;
        }

        const title = this.querySelector('h3');

        if (title) {
            alert('Раздел «' + title.textContent +
                '» скоро появится!');
        }
    });
});

// Карусель популярных объектов
const track = document.querySelector('.object-track');

document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const step = track.clientWidth * 0.8;
        track.scrollBy({
            left: this.classList.contains('next') ? step : -step,
            behavior: 'smooth'
        });
    });
});

document.querySelectorAll('.object-card').forEach(card => {
    card.addEventListener('click', function() {
        if (this.dataset.href) {
            window.location.href = this.dataset.href;
            return;
        }

        alert('Страница объекта «' + this.querySelector('h3').textContent +
            '» скоро появится!');
    });
});


// Параллакс главного экрана
const heroSection = document.querySelector('.hero');

if (heroSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const heroLayers = heroSection.querySelectorAll('[data-speed]');
    const heroContent = heroSection.querySelector('.hero-content');
    let parallaxTicking = false;

    function updateParallax() {
        const y = Math.min(window.scrollY, heroSection.offsetHeight);

        heroLayers.forEach(layer => {
            layer.style.setProperty('--py', (y * layer.dataset.speed) + 'px');
        });

        if (heroContent) {
            heroContent.style.opacity = Math.max(0, 1 - y / (heroSection.offsetHeight * 0.85));
        }

        parallaxTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            parallaxTicking = true;
            requestAnimationFrame(updateParallax);
        }
    }, { passive: true });
}


// Интерактивная карта
const mapBox = document.querySelector('.map-box');

if (mapBox) {
    const popup = document.getElementById('mapPopup');
    const mapPins = mapBox.querySelectorAll('.pin[data-title]');
    let activePin = null;

    function closeMapPopup() {
        popup.hidden = true;

        if (activePin) {
            activePin.classList.remove('active');
            activePin = null;
        }
    }

    function openMapPopup(pin) {
        if (activePin) {
            activePin.classList.remove('active');
        }

        activePin = pin;
        pin.classList.add('active');

        const tag = document.getElementById('mpTag');
        tag.textContent = pin.dataset.tag;
        tag.className = 'object-tag ' + pin.dataset.tagclass;

        document.getElementById('mpTitle').textContent = pin.dataset.title;
        document.getElementById('mpRegion').textContent = pin.dataset.region;
        document.getElementById('mpText').textContent = pin.dataset.text;
        document.getElementById('mpLink').setAttribute('href', pin.dataset.href);

        popup.hidden = false;

        const box = mapBox.getBoundingClientRect();
        const dot = pin.querySelector('circle:not(.pulse):not(.hit)').getBoundingClientRect();
        const cx = dot.left + dot.width / 2 - box.left;
        const cy = dot.top + dot.height / 2 - box.top;
        const pw = popup.offsetWidth;
        const ph = popup.offsetHeight;

        let left = Math.max(8, Math.min(cx - pw / 2, box.width - pw - 8));
        let top = cy - ph - 18;

        if (top < 8) {
            top = cy + 18;
        }

        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
    }

    mapPins.forEach(pin => {
        pin.addEventListener('click', event => {
            event.stopPropagation();
            openMapPopup(pin);
        });

        pin.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openMapPopup(pin);
            }
        });
    });

    popup.querySelector('.map-popup-close').addEventListener('click', closeMapPopup);

    document.addEventListener('click', event => {
        if (!popup.hidden && !popup.contains(event.target)) {
            closeMapPopup();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeMapPopup();
        }
    });

    window.addEventListener('resize', closeMapPopup);
}


// Закреплённая шапка
const siteHeader = document.querySelector('header');

if (siteHeader) {
    const desktopQuery = window.matchMedia('(min-width: 1201px)');

    // Резервируем под шапку место, чтобы страница не «прыгала» при её сжатии
    function measureHeader() {
        if (!desktopQuery.matches) {
            document.documentElement.style.removeProperty('--header-h');
            return;
        }

        const wasScrolled = siteHeader.classList.contains('scrolled');

        siteHeader.classList.add('no-anim');
        siteHeader.classList.remove('scrolled');

        document.documentElement.style.setProperty(
            '--header-h', siteHeader.offsetHeight + 'px'
        );

        if (wasScrolled) {
            siteHeader.classList.add('scrolled');
        }

        siteHeader.offsetHeight; // применяем стили до возврата анимации
        siteHeader.classList.remove('no-anim');
    }

    function updateHeader() {
        siteHeader.classList.toggle('scrolled', window.scrollY > 40);
    }

    measureHeader();
    updateHeader();

    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', measureHeader);
    window.addEventListener('load', measureHeader);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(measureHeader);
    }
}


// Мобильное меню
const navToggle = document.querySelector('.nav-toggle');
const navHeader = document.querySelector('header');

if (navToggle && navHeader) {
    function setNav(open) {
        navHeader.classList.toggle('nav-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        const label = open ? 'Закрыть меню' : 'Открыть меню';
        navToggle.setAttribute('aria-label', window.muras ? window.muras.t(label) : label);
    }

    navToggle.addEventListener('click', event => {
        event.stopPropagation();
        setNav(!navHeader.classList.contains('nav-open'));
    });

    navHeader.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => setNav(false));
    });

    document.addEventListener('click', event => {
        if (!navHeader.contains(event.target)) {
            setNav(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            setNav(false);
        }
    });

    window.matchMedia('(min-width: 1201px)').addEventListener('change', event => {
        if (event.matches) {
            setNav(false);
        }
    });
}


// Кнопка «Наверх»
(function () {
    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'to-top';
    upBtn.setAttribute('aria-label', 'Наверх');
    upBtn.textContent = '↑';
    document.body.appendChild(upBtn);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    upBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    window.addEventListener('scroll', () => {
        upBtn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
})();


console.log('Сайт Мурас загружен!');