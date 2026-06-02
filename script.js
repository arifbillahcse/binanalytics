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

document.querySelectorAll('.service-card, .step, .team-card, .testi-card, .about-text, .about-visual, .contact-info, .contact-form-wrap').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Contact form
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
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
