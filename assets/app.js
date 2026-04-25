/* ─────────────────────────────────────────────────────────────────────────────
   PMG Robotics — single-page app
   Data is loaded from data/config.yaml, data/projects.yaml, data/team.yaml
───────────────────────────────────────────────────────────────────────────── */

const state = { projects: [], team: [], config: {}, loadError: null };

// ── Data loading ──────────────────────────────────────────────────────────────

async function loadYaml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (HTTP ${res.status})`);
  return jsyaml.load(await res.text());
}

async function loadData() {
  try {
    const [projects, team, config] = await Promise.all([
      loadYaml('data/projects.yaml'),
      loadYaml('data/team.yaml'),
      loadYaml('data/config.yaml'),
    ]);
    state.projects = projects || [];
    state.team     = team     || [];
    state.config   = config   || {};
  } catch (err) {
    console.error('Failed to load site data:', err);
    state.loadError = err.message;
    // Don't set innerHTML here — router() runs next and renders the page.
    // The projects section will show the error inline.
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

function router() {
  const hash = window.location.hash;
  const match = hash.match(/^#project\/(.+)/);

  if (match) {
    const project = state.projects.find(p => p.id === match[1]);
    if (project) {
      renderProject(project);
      window.scrollTo({ top: 0 });
      return;
    }
  }

  renderHome();

  // Handle section anchors like #projects, #team, #contact
  const sectionId = hash.replace('#', '');
  if (['services', 'projects', 'team', 'contact'].includes(sectionId)) {
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  } else if (!match) {
    window.scrollTo({ top: 0 });
  }
}

// ── Home page ─────────────────────────────────────────────────────────────────

function renderHome() {
  document.getElementById('app').innerHTML =
    heroHTML() + servicesHTML() + projectsHTML() + partnersHTML() + teamHTML() + contactHTML();

  initProjectCards();
  initSlideshow();
  initContactForm();
}

function heroHTML() {
  const c = state.config;
  const tagline = c.tagline || 'From concept to<br><em>production-ready</em><br>hardware.';
  const desc    = c.description || 'PCB design, embedded firmware, and mechanical engineering &mdash; full product bringup from prototype to production.';

  const slides = (state.projects || []).filter(p => !p.hidden && p.thumbnail && p.thumbnail.trim());

  const visual = slides.length
    ? `<div class="hero-slideshow" id="hero-slideshow">
        ${slides.map((p, i) => `
          <div class="slideshow-slide${i === 0 ? ' active' : ''}" data-id="${p.id}" role="button" tabindex="0" aria-label="View ${p.title}">
            <img src="${p.thumbnail}" alt="${p.title}" class="slideshow-img" loading="lazy">
            <div class="slideshow-caption">
              <div class="slideshow-caption-text">
                <span class="slideshow-client">${p.client}</span>
                <span class="slideshow-title">${p.title}</span>
              </div>
              <span class="slideshow-arrow">&#8594;</span>
            </div>
          </div>`).join('')}
        ${slides.length > 1 ? `
          <div class="slideshow-dots">
            ${slides.map((_, i) => `<button class="slideshow-dot${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('')}
          </div>` : ''}
      </div>`
    : `<div class="pcb-grid"></div>`;

  return `
  <section class="hero" id="home">
    <div class="container">
      <div class="hero-content">
        <div class="hero-badge">Based in Novi Sad, Serbia</div>
        <h1 class="hero-title">${tagline}</h1>
        <p class="hero-desc">${desc}</p>
        <div class="hero-actions">
          <a href="#contact" class="btn btn-primary">Get in touch</a>
          <a href="#projects" class="btn btn-ghost">See our work ↓</a>
        </div>
      </div>
      <div class="hero-visual">
        ${visual}
      </div>
    </div>
  </section>`;
}

function servicesHTML() {
  const services = [
    {
      icon: svgChip(),
      title: 'PCB Design',
      desc: 'From schematic capture to production-ready Gerber files. Multi-layer boards, high-speed design, mixed-signal layouts. One of our engineers trained at CERN.',
    },
    {
      icon: svgCode(),
      title: 'Embedded Programming',
      desc: 'Bare-metal and RTOS firmware. STM32, NXP, TI, Nordic. Drivers, communication protocols, power management, and OTA updates.',
    },
    {
      icon: svgGear(),
      title: 'Mechanical Design',
      desc: '3D CAD modeling, enclosure design, and DFM for manufacturing. Our team built two complete robots that took first place at the international Eurobot 2019 competition.',
    },
    {
      icon: svgRocket(),
      title: 'Prototype to Production',
      desc: 'We take you from proof-of-concept to production-ready design, and connect you with trusted manufacturers for both small-volume and large-scale production runs.',
    },
  ];

  return `
  <section class="services" id="services">
    <div class="container">
      <div class="section-header">
        <h2>What we do</h2>
      </div>
      <div class="services-grid">
        ${services.map(s => `
          <div class="service-card">
            <div class="service-icon">${s.icon}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>`;
}

function projectsHTML() {
  const visible = state.projects.filter(p => !p.hidden);
  if (!visible.length) {
    const notice = state.loadError
      ? `<p style="color:#ef4444;font-size:14px;padding:8px 0;line-height:1.7">
           Could not load projects.yaml.<br>
           If testing locally, make sure you started the HTTP server first:<br>
           <code style="background:#1e293b;padding:4px 8px;border-radius:4px;font-size:13px">python3 -m http.server 8000</code><br>
           Then open <code style="background:#1e293b;padding:4px 8px;border-radius:4px;font-size:13px">http://localhost:8000</code><br>
           Error: ${state.loadError}
         </p>`
      : `<p style="color:var(--text-dim);font-size:14px">No projects yet. Add them to data/projects.yaml</p>`;
    return `
      <section class="projects-section" id="projects">
        <div class="container">
          <div class="section-header">
            <h2>Projects</h2>
          </div>
          ${notice}
        </div>
      </section>`;
  }

  return `
  <section class="projects-section" id="projects">
    <div class="container">
      <div class="section-header">
        <h2>Projects</h2>
        <p class="section-sub">A selection of work we can share publicly</p>
      </div>
    </div>
    <div class="projects-scroll-wrapper">
      <div class="projects-scroll" id="projects-scroll">
        ${visible.map(projectCardHTML).join('')}
      </div>
    </div>
  </section>`;
}

function projectCardHTML(p) {
  const thumb = (p.thumbnail || '').trim();
  const bgStyle = thumb ? `background-image:url('${thumb}')` : '';

  return `
  <div class="project-card" data-id="${p.id}" role="button" tabindex="0" aria-label="Open ${p.title}">
    <div class="project-thumb" style="${bgStyle}">
      ${!thumb ? `<span class="thumb-placeholder-letter">${(p.title || '?')[0].toUpperCase()}</span>` : ''}
    </div>
    <div class="project-card-body">
      <div class="project-client">${p.client || ''}</div>
      <h3 class="project-title">${p.title || ''}</h3>
      <p class="project-summary">${p.summary || ''}</p>
      <div class="project-tags">
        ${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

function partnersHTML() {
  const partners = (state.config.partners || []);
  if (!partners.length) return '';

  return `
  <section class="partners-section" id="partners">
    <div class="container">
      <div class="section-header">
        <h2>Partners</h2>
      </div>
      <div class="partners-row">
        ${partners.map(p => `
          <a href="${p.url}" class="partner-card" target="_blank" rel="noopener noreferrer" aria-label="${p.name}">
            ${p.logo
              ? `<img src="${p.logo}" alt="${p.name}" class="partner-logo" loading="lazy">`
              : `<span class="partner-name-text">${p.name}</span>`}
          </a>`).join('')}
      </div>
    </div>
  </section>`;
}

function teamHTML() {
  if (!state.team.length) return '';

  return `
  <section class="team-section" id="team">
    <div class="container">
      <div class="section-header">
        <h2>Team</h2>
      </div>
      <div class="team-grid">
        ${state.team.map(m => `
          <div class="team-member">
            <div class="member-photo">
              ${m.linkedin
                ? `<a href="${m.linkedin}" class="member-photo-link" target="_blank" rel="noopener noreferrer" aria-label="${m.name} on LinkedIn">
                     ${m.photo ? `<img src="${m.photo}" alt="${m.name}" loading="lazy">` : `<div class="photo-placeholder">${(m.name || '?')[0]}</div>`}
                     <div class="member-photo-overlay">${svgLinkedIn()}</div>
                   </a>`
                : m.photo ? `<img src="${m.photo}" alt="${m.name}" loading="lazy">` : `<div class="photo-placeholder">${(m.name || '?')[0]}</div>`}
            </div>
            <div class="member-info">
              <h4>${m.name || ''}</h4>
              <p class="member-role">${m.role || ''}</p>
              ${m.email ? `<a href="mailto:${m.email}" class="member-link">${m.email}</a>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>`;
}

function contactHTML() {
  const c    = state.config;
  const name  = c.name  || 'PMG Robotics';
  const email = c.email || '';
  const year  = new Date().getFullYear();

  const rightContent = c.form_endpoint
    ? `<h3>Work with us</h3>
       <p>Have a hardware project? Let's talk about it.</p>
       <div id="form-success" class="form-success">
         <strong>Message sent!</strong> We'll get back to you shortly.
       </div>
       <p id="form-error" class="form-error-global"></p>
       <form id="contact-form" class="contact-form">
         <div class="form-row">
           <input type="text" name="name" placeholder="Your name" required class="form-input">
           <input type="email" name="email" placeholder="Your email" required class="form-input">
         </div>
         <textarea name="message" placeholder="Tell us about your project..." required class="form-input form-textarea"></textarea>
         <button type="submit" class="btn btn-primary" id="form-submit-btn">Send message</button>
       </form>`
    : `<h3>Work with us</h3>
       <p>Have a hardware project? Let's talk about it.</p>
       ${email
         ? `<a href="mailto:${email}" class="btn btn-primary">${email}</a>`
         : `<p style="color:var(--text-dim);font-size:13px">(add your email to data/config.yaml)</p>`}`;

  return `
  <footer class="contact-section" id="contact">
    <div class="container">
      <div class="contact-grid">
        <div class="contact-left">
          <img src="images/logo-white.png" alt="${name}" class="footer-logo"
               onerror="this.style.display='none'">
          <p class="contact-tagline">${c.footer_desc || 'PCB design, embedded firmware, and mechanical engineering for hardware startups and established companies.'}</p>
          <p class="contact-location">Novi Sad, Serbia</p>
          ${email ? `<a href="mailto:${email}" class="contact-email-link">${email}</a>` : ''}
        </div>
        <div class="contact-right">
          ${rightContent}
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${year} ${name} &middot; Novi Sad, Serbia</p>
      </div>
    </div>
  </footer>`;
}

// ── Project detail page ───────────────────────────────────────────────────────

function renderProject(p) {
  const images = p.images || [];
  const galleryClass = images.length === 1 ? 'project-gallery gallery-single' : 'project-gallery';

  const galleryHTML = images.length ? `
    <div class="${galleryClass}">
      ${images.map((img, i) => `
        <div class="gallery-item${i === 0 ? ' gallery-item-main' : ''}">
          <img src="${img}" alt="${p.title} photo ${i + 1}" loading="lazy">
        </div>`).join('')}
    </div>` : '';

  const descHTML = (p.description || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `<p>${l}</p>`)
    .join('');

  document.getElementById('app').innerHTML = `
  <div class="project-detail">
    <div class="container">
      <a href="#" class="back-link" id="back-btn">&#8592; All projects</a>
      <div class="project-detail-header">
        <span class="project-client-tag">${p.client || ''}</span>
        <h1 class="project-detail-title">${p.title || ''}</h1>
        <div class="project-tags">
          ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>
      ${galleryHTML}
      <div class="project-detail-body">
        <div class="project-description">${descHTML}</div>
      </div>
    </div>
  </div>
  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image preview">
    <img id="lightbox-img" src="" alt="Full size image">
  </div>`;

  document.getElementById('back-btn').addEventListener('click', e => {
    e.preventDefault();
    // Go back if we came from the same site, otherwise go home
    if (history.length > 1 && document.referrer.includes(location.hostname)) {
      history.back();
    } else {
      window.location.hash = '';
    }
  });

  // Lightbox
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src));
  });
  document.getElementById('lightbox').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') { closeLightbox(); document.removeEventListener('keydown', escHandler); }
  });
}

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lightbox-img').src = src;
  lb.classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('active');
}

// ── Interaction helpers ───────────────────────────────────────────────────────

function initProjectCards() {
  document.querySelectorAll('.project-card').forEach(card => {
    const go = () => { window.location.hash = `project/${card.dataset.id}`; };
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(); });
  });
}


function initSlideshow() {
  const container = document.getElementById('hero-slideshow');
  if (!container) return;

  const slides = container.querySelectorAll('.slideshow-slide');
  const dots   = container.querySelectorAll('.slideshow-dot');
  if (slides.length < 2) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 3000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.idx));
      startTimer();
    });
  });

  // Clicking a slide opens the project
  container.querySelectorAll('.slideshow-slide').forEach(slide => {
    slide.addEventListener('click', e => {
      // Don't navigate if clicking a dot
      if (e.target.closest('.slideshow-dots')) return;
      if (slide.dataset.id) window.location.hash = `project/${slide.dataset.id}`;
    });
  });

  startTimer();
}

function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const endpoint = (state.config.form_endpoint || '').trim();
  if (!endpoint) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn     = document.getElementById('form-submit-btn');
    const success = document.getElementById('form-success');
    const error   = document.getElementById('form-error');

    btn.disabled = true;
    btn.textContent = 'Sending…';
    error.textContent = '';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        form.style.display = 'none';
        success.style.display = 'block';
      } else {
        const json = await res.json().catch(() => ({}));
        error.textContent = json.error || 'Something went wrong. Please try again.';
        btn.disabled = false;
        btn.textContent = 'Send message';
      }
    } catch {
      error.textContent = 'Could not send. Check your connection and try again.';
      btn.disabled = false;
      btn.textContent = 'Send message';
    }
  });
}

function initNavLogoLink() {
  document.getElementById('nav-logo')?.addEventListener('click', e => {
    e.preventDefault();
    if (window.location.hash.startsWith('#project/')) {
      window.location.hash = '';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function svgChip() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
    stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <rect x="8" y="8" width="8" height="8" rx="1"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="7"  y1="1" x2="7"  y2="3"/>
    <line x1="17" y1="1" x2="17" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="7"  y1="21" x2="7"  y2="23"/>
    <line x1="17" y1="21" x2="17" y2="23"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="1"  y1="7"  x2="3"  y2="7"/>
    <line x1="1"  y1="17" x2="3"  y2="17"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="21" y1="7"  x2="23" y2="7"/>
    <line x1="21" y1="17" x2="23" y2="17"/>
  </svg>`;
}

function svgCode() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
    stroke-linecap="round" stroke-linejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>`;
}

function svgGear() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65
      1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9
      19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0
      4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65
      0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65
      0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06
      -.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2
      2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`;
}

function svgLinkedIn() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853
      0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9
      1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337
      7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063
      2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0
      .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24
      23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>`;
}

function svgRocket() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0
      0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35
      22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  await loadData();
  initHamburger();
  initNavLogoLink();
  router();
  window.addEventListener('hashchange', router);
}

init();
