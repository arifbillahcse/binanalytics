// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.service-card, .step, .team-card, .testi-card, .about-text, .about-visual, .contact-info, .contact-form-wrap, .result-item, .cta-content').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Count-up animation for results banner
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.result-item strong[data-count]').forEach(el => countObserver.observe(el));

// Hero live panel — continuously ticking numbers
window.addEventListener('load', () => {
  const usersEl  = document.getElementById('liveUsers');
  const eventsEl = document.getElementById('liveEvents');
  const convEl   = document.getElementById('liveConv');

  if (!usersEl) return;

  // tick helper
  function animCount(el, target, duration, decimals) {
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  // Initial count-up on load
  animCount(usersEl,  4280, 1800, 0);
  animCount(eventsEl, 12.4, 1400, 1);
  animCount(convEl,   1847, 2000, 0);

  // Live ticking — random small changes every 2.5s
  setInterval(() => {
    const u = parseInt(usersEl.textContent.replace(/,/g,''), 10);
    usersEl.textContent = Math.max(4000, u + Math.floor(Math.random()*9) - 3).toLocaleString();

    const e = parseFloat(eventsEl.textContent);
    eventsEl.textContent = Math.max(8, e + (Math.random()*1.2 - 0.5)).toFixed(1);

    const c = parseInt(convEl.textContent.replace(/,/g,''), 10);
    convEl.textContent = (c + Math.floor(Math.random()*3)).toLocaleString();
  }, 2500);
});

// Contact form → WhatsApp
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name    = this.querySelector('input[type="text"]').value.trim();
  const email   = this.querySelector('input[type="email"]').value.trim();
  const service = this.querySelector('select').value;
  const message = this.querySelector('textarea').value.trim();

  const text = [
    `👋 Hello BinAnalytics!`,
    ``,
    `*Name:* ${name}`,
    `*Email:* ${email}`,
    service ? `*Service:* ${service}` : '',
    message ? `*Message:* ${message}` : '',
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/8801854626927?text=${encodeURIComponent(text)}`, '_blank');

  const btn = this.querySelector('button[type="submit"]');
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Opening WhatsApp...';
  btn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = 'Send via WhatsApp <i class="fa-brands fa-whatsapp"></i>';
    btn.style.background = '';
    btn.disabled = false;
    this.reset();
  }, 3000);
});

// Smooth active nav highlight
const sections = document.querySelectorAll('section[id]');
const navA = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navA.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--primary)' : '';
  });
});
