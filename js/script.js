/* ==============================================
   script.js 
=============================================== */

document.addEventListener('DOMContentLoaded', () => {
  activateNavLink();
  revealOnScroll();
  animateStatCounters();
  initSkillsFilter();
  animateProgressBars();
  initParticles();
  initContactForm();
});

/* ── Activate correct nav link ── */
function activateNavLink() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}

/* ── Scroll reveal ── */
function revealOnScroll() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── Animated stat counters (About page) ── */
function animateStatCounters() {
  const els = document.querySelectorAll('.stat-num[data-target]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = target / (1400 / 16);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current) + suffix;
          if (current >= target) clearInterval(timer);
        }, 16);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
}

/* ── Skills filter tabs (Skills page) ── */
function initSkillsFilter() {
  const tabs = document.querySelectorAll('.tab-btn');
  if (!tabs.length) return;
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.skill-card').forEach(card => {
        const cats = card.dataset.category || '';
        if (filter === 'all' || cats.includes(filter)) card.classList.remove('hidden');
        else card.classList.add('hidden');
      });
    });
  });
}

/* ── Animate skill progress bars (Skills page) ── */
function animateProgressBars() {
  const cards = document.querySelectorAll('.skill-card');
  if (!cards.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.progress-bar-fill').forEach(bar => {
          setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  cards.forEach(c => obs.observe(c));
}

/* ── Floating particles (Contact page) ── */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.r = Math.random() * 3 + 1;
      this.dx = (Math.random() - 0.5) * 0.4;
      this.dy = -Math.random() * 0.5 - 0.2;
      this.alpha = Math.random() * 0.25 + 0.05;
      this.color = Math.random() > 0.5 ? '#fde047' : '#fbbf24';
    }
    update() { this.x += this.dx; this.y += this.dy; if (this.y < -10) this.reset(); }
    draw() { ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  for (let i = 0; i < 60; i++) particles.push(new Particle());
  function loop() { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(loop); }
  loop();
}

/* ── Contact form (Contact page) ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  /* Topic chips */
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('f-subject').value = chip.dataset.val;
      updateProgress();
    });
  });

  /* Real-time validation */
  document.getElementById('f-name').addEventListener('input', () => { validateName(); updateProgress(); });
  document.getElementById('f-email').addEventListener('input', () => { validateEmail(); updateProgress(); });
  document.getElementById('f-message').addEventListener('input', () => { updateProgress(); updateCharCount(); });

  /* Submit */
  const btn = document.getElementById('btn-send');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validateName() || !validateEmail() || !validateMessage()) {
      if (!validateMessage()) document.getElementById('f-message').className = 'form-control invalid';
      return;
    }
    btn.disabled = true;
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loader').style.display = 'inline';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
      if (res.ok) { form.style.display = 'none'; document.getElementById('success-overlay').classList.add('show'); launchConfetti(); }
      else alert('Something went wrong. Please try again.');
    } catch (err) { alert('Network error. Please try again later.'); }
    finally { btn.disabled = false; btn.querySelector('.btn-text').style.display = 'inline'; btn.querySelector('.btn-loader').style.display = 'none'; }
  });
}

function validateName() {
  const f = document.getElementById('f-name'); if (!f) return false;
  const hint = document.getElementById('hint-name'), icon = document.getElementById('icon-name'), v = f.value.trim();
  if (!v) { f.className = 'form-control'; hint.textContent = ''; icon.textContent = ''; return false; }
  if (v.length < 2) { f.className = 'form-control invalid'; hint.className = 'field-hint error'; hint.textContent = 'Name is too short'; icon.textContent = '❌'; return false; }
  f.className = 'form-control valid'; hint.className = 'field-hint success'; hint.textContent = `Hi, ${v.split(' ')[0]}! 👋`; icon.textContent = '✅'; return true;
}

function validateEmail() {
  const f = document.getElementById('f-email'); if (!f) return false;
  const hint = document.getElementById('hint-email'), icon = document.getElementById('icon-email'), v = f.value.trim();
  if (!v) { f.className = 'form-control'; hint.textContent = ''; icon.textContent = ''; return false; }
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  if (!ok) { f.className = 'form-control invalid'; hint.className = 'field-hint error'; hint.textContent = 'Please enter a valid email'; icon.textContent = '❌'; return false; }
  f.className = 'form-control valid'; hint.className = 'field-hint success'; hint.textContent = 'Looks good!'; icon.textContent = '✅'; return true;
}

function validateMessage() {
  const f = document.getElementById('f-message'); return f ? f.value.trim().length >= 10 : false;
}

function updateCharCount() {
  const msg = document.getElementById('f-message'), counter = document.getElementById('char-counter');
  if (!msg || !counter) return;
  const len = msg.value.length;
  counter.textContent = `${len} / 1000`;
  counter.className = 'char-counter' + (len > 900 ? ' over' : len > 700 ? ' warn' : '');
}

function updateProgress() {
  const bar = document.getElementById('progress-bar'); if (!bar) return;
  let score = 0;
  if (validateName()) score += 25;
  if (validateEmail()) score += 25;
  if (document.getElementById('f-subject') && document.getElementById('f-subject').value) score += 25;
  if (validateMessage()) score += 25;
  bar.style.width = score + '%';
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const pieces = [], colors = ['#fde047','#fbbf24','#f59e0b','#10b981','#3b82f6','#ec4899','#ffffff'];
  for (let i = 0; i < 120; i++) pieces.push({ x: Math.random() * canvas.width, y: -20, w: Math.random() * 10 + 4, h: Math.random() * 6 + 3, color: colors[Math.floor(Math.random() * colors.length)], rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 6, dx: (Math.random() - 0.5) * 4, dy: Math.random() * 4 + 2, alpha: 1 });
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); let alive = false;
    pieces.forEach(p => { if (p.alpha <= 0) return; p.y += p.dy; p.x += p.dx; p.rotation += p.rotSpeed; if (p.y > canvas.height * 0.6) p.alpha -= 0.02; if (p.alpha > 0) alive = true; ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
    if (alive) requestAnimationFrame(draw); else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

function resetForm() {
  const form = document.getElementById('contact-form'); if (!form) return;
  form.reset(); form.style.display = 'block';
  document.getElementById('success-overlay').classList.remove('show');
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.getElementById('f-subject').value = '';
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('char-counter').textContent = '0 / 1000';
  ['f-name','f-email','f-message'].forEach(id => document.getElementById(id).className = 'form-control');
  ['hint-name','hint-email'].forEach(id => document.getElementById(id).textContent = '');
  ['icon-name','icon-email'].forEach(id => document.getElementById(id).textContent = '');
}
