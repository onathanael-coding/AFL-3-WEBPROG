function $(id) { return document.getElementById(id); }
function $q(sel) { return document.querySelector(sel); }
function $qa(sel) { return document.querySelectorAll(sel); }

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$qa('.reveal, .reveal-left, .reveal-right, .reveal-l, .reveal-r')
    .forEach(el => revealObserver.observe(el));

// NAVBAR
const navbar = $('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// CAROUSEL
const carousel = $('carousel');
if (carousel) {
    const TOTAL = 3;
    const posMap = { 0: 'pos-center', 1: 'pos-right', 2: 'pos-left' };
    const cards = Array.from($qa('.carousel-card'));
    const dotsWrap = $('dots');
    let current = 1;
    let autoTimer;

    /* BIKIN TITIK*/
    for (let i = 0; i < TOTAL; i++) {
        const d = document.createElement('div');
        d.className = 'dot' + (i === current ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
    }

    function updateCarousel() {
        cards.forEach((card, i) => {
            const offset = (i - current + TOTAL) % TOTAL;
            card.className = 'carousel-card ' + posMap[offset];
        });
        Array.from(dotsWrap.children).forEach((d, i) => {
            d.className = 'dot' + (i === current ? ' active' : '');
        });
    }

    function goTo(idx) { current = idx; updateCarousel(); resetAuto(); }
    function next() { current = (current + 1) % TOTAL; updateCarousel(); }
    function prev() { current = (current - 1 + TOTAL) % TOTAL; updateCarousel(); }

    $('btn-next').addEventListener('click', () => { next(); resetAuto(); });
    $('btn-prev').addEventListener('click', () => { prev(); resetAuto(); });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cls = card.className;
            if (cls.includes('pos-right')) { next(); resetAuto(); }
            if (cls.includes('pos-left')) { prev(); resetAuto(); }
        });
    });

    let touchStartX = 0;
    let touchStartY = 0;

    carousel.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    carousel.addEventListener('touchmove', e => {
        const diffX = Math.abs(e.touches[0].clientX - touchStartX);
        const diffY = Math.abs(e.touches[0].clientY - touchStartY);

        // Kalau gerakannya lebih horizontal dari vertikal, block scroll
        if (diffX > diffY) {
            e.preventDefault();
        }
    }, { passive: false }); // passive: false supaya preventDefault bisa jalan

    carousel.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetAuto(); }
    });
}

// HAMBURGER MENU //
function initHamburger(btnId, menuId, line1Id, line2Id, line3Id) {
    const btn = $(btnId);
    const menu = $(menuId);
    const l1 = $(line1Id);
    const l2 = $(line2Id);
    const l3 = $(line3Id);
    if (!btn || !menu) return;

    let open = false;

    btn.addEventListener('click', () => {
        open = !open;
        menu.classList.toggle('open', open);
        if (l1) l1.style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
        if (l2) l2.style.opacity = open ? '0' : '';
        if (l3) l3.style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            open = false;
            menu.classList.remove('open');
            if (l1) l1.style.transform = '';
            if (l2) l2.style.opacity = '';
            if (l3) l3.style.transform = '';
        });
    });
}

initHamburger('hamburger', 'mobile-menu', 'hb1', 'hb2', 'hb3');
initHamburger('hbtn', 'mob-menu', 'h1', 'h2', 'h3');

// CONTACT FORM

const toastEl = $('toast');
function showToast(msg, isError = false) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.borderLeftColor = isError ? '#ef4444' : '#F5C518';
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3500);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function setFieldError(el) {
    if (!el) return;
    el.classList.add('err', 'error');
    el.style.borderColor = '#ef4444';
    el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.18)';
    el.addEventListener('input', () => {
        el.classList.remove('err', 'error');
        el.style.borderColor = '';
        el.style.boxShadow = '';
    }, { once: true });
}


const form = $('contact-form');
if (form) {

    const inpName = $('input-name') || $('inp-name');
    const inpEmail = $('input-email') || $('inp-email');
    const inpMsg = $('input-message') || $('inp-msg');
    const btnSub = $('btn-submit') || $('btn-sub');

    form.addEventListener('submit', e => {
        e.preventDefault();

        const name = inpName ? inpName.value.trim() : '';
        const email = inpEmail ? inpEmail.value.trim() : '';
        const msg = inpMsg ? inpMsg.value.trim() : '';

        if (!name) { setFieldError(inpName); showToast('❌ Please enter your name.', true); return; }
        if (!email) { setFieldError(inpEmail); showToast('❌ Please enter your email.', true); return; }
        if (!validateEmail(email)) { setFieldError(inpEmail); showToast('❌ Invalid email address.', true); return; }
        if (!msg) { setFieldError(inpMsg); showToast('❌ Please write a message.', true); return; }

        if (btnSub) { btnSub.disabled = true; btnSub.textContent = 'Sending...'; btnSub.style.opacity = '0.7'; }

        setTimeout(() => {
            form.reset();
            if (btnSub) { btnSub.disabled = false; btnSub.textContent = 'Send Message'; btnSub.style.opacity = ''; }
            showToast("✅ Message sent! I'll get back to you soon.");
        }, 1200);
    });
}

const navLinks = $qa('nav a');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) {
        link.classList.add('active-nav');
    }
});
