document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initMobileNav();
  renderProjects(PORTFOLIO_DATA.projects);
  initProjectsCarousel();
  renderSkills();
  renderExperience();

  initFilterButtons();
  initCaseStudyModal();
  initContactUtilities();
});

/* Mobile Hamburger Navigation */
function initMobileNav() {
  const hamburgerBtn = document.getElementById('nav-hamburger-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!hamburgerBtn || !drawer) return;

  const toggle = (forceClose = false) => {
    const isOpen = forceClose ? false : !drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.add('open');
      hamburgerBtn.classList.add('open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
    } else {
      drawer.classList.remove('open');
      hamburgerBtn.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    }
  };

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // Close when clicking any link inside the drawer
  const links = drawer.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle(true);
    });
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      toggle(true);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggle(true);
    }
  });
}

/* Theme Switcher */
function initThemeEngine() {
  const savedTheme = localStorage.getItem('cizyori-theme') || 'dark';
  setTheme(savedTheme);

  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const desktopBtn = document.getElementById('theme-toggle-btn');
  const mobileBtn = document.getElementById('mobile-theme-toggle-btn');
  if (desktopBtn) desktopBtn.addEventListener('click', toggle);
  if (mobileBtn) mobileBtn.addEventListener('click', toggle);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cizyori-theme', theme);

  const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  const desktopBtn = document.getElementById('theme-toggle-btn');
  if (desktopBtn) {
    desktopBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  }

  const mobileBtn = document.getElementById('mobile-theme-toggle-btn');
  if (mobileBtn) {
    mobileBtn.innerHTML = (theme === 'dark' ? sunIcon : moonIcon) + `<span id="mobile-theme-label">${theme === 'dark' ? 'Light Theme ☀' : 'Dark Theme 🌙'}</span>`;
  }
}

/* Projects Rendering (Interactive Carousel Track) */
let currentCategory = 'all';
let currentActiveIndex = 0;
let isDraggingCarousel = false;

function renderProjects(projectsToRender) {
  const container = document.getElementById('projects-grid');
  const dotsContainer = document.getElementById('carousel-dots');
  const counter = document.getElementById('carousel-counter');
  const viewport = document.getElementById('carousel-viewport');

  if (!container) return;

  if (projectsToRender.length === 0) {
    container.innerHTML = `<p class="mono" style="text-align: center; padding: 2.5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color); width: 100%;">No projects found in this category.</p>`;
    if (dotsContainer) dotsContainer.innerHTML = '';
    if (counter) counter.textContent = '00 / 00';
    return;
  }

  container.innerHTML = projectsToRender.map((p, idx) => `
    <a href="${p.pageUrl}" class="carousel-card" data-index="${idx}" aria-label="View case study for ${p.title}">
      <div class="carousel-media">
        <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
        <span class="carousel-badge-top">${p.badge}</span>
        ${p.has3DCadViewer ? `<span class="carousel-3d-badge">Interactive 3D CAD</span>` : ''}
      </div>

      <div class="carousel-body">
        <div>
          <div class="carousel-meta">
            <span style="color:var(--accent); font-weight:600">${p.categoryLabel}</span>
          </div>
          <h3 class="carousel-title">${p.title}</h3>
          <p class="carousel-desc">${p.summary}</p>
        </div>

        <div>
          <div class="carousel-metrics-row">
            ${p.keyMetrics.slice(0, 2).map(m => `
              <div class="carousel-metric-item">
                <span class="carousel-metric-lbl">${m.label}</span>
                <span class="carousel-metric-val">${m.value}</span>
              </div>
            `).join('')}
          </div>

          <div class="carousel-footer">
            <div class="carousel-tags">
              ${p.tags.slice(0, 3).map(t => `<span class="carousel-tag">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </a>
  `).join('');

  // Render Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = projectsToRender.map((_, idx) => `
      <button class="carousel-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Go to project ${idx + 1}"></button>
    `).join('');

    dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'), 10);
        scrollToCardIndex(index);
      });
    });
  }

  // Reset scroll & counter
  if (viewport) viewport.scrollLeft = 0;
  currentActiveIndex = 0;
  updateCarouselState(projectsToRender.length);

  // Prevent link click when dragging
  container.querySelectorAll('.carousel-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (isDraggingCarousel) {
        e.preventDefault();
      }
    });
  });
}

function updateCarouselState(totalCount) {
  const counter = document.getElementById('carousel-counter');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const trackPrev = document.getElementById('carousel-track-prev');
  const trackNext = document.getElementById('carousel-track-next');
  const dots = document.querySelectorAll('.carousel-dot');

  const total = totalCount || document.querySelectorAll('.carousel-card').length;
  if (total === 0) return;

  const currentFormatted = String(currentActiveIndex + 1).padStart(2, '0');
  const totalFormatted = String(total).padStart(2, '0');

  if (counter) counter.textContent = `${currentFormatted} / ${totalFormatted}`;

  dots.forEach((dot, idx) => {
    if (idx === currentActiveIndex) dot.classList.add('active');
    else dot.classList.remove('active');
  });

  const isFirst = currentActiveIndex === 0;
  const isLast = currentActiveIndex >= total - 1;

  if (prevBtn) prevBtn.disabled = isFirst;
  if (nextBtn) nextBtn.disabled = isLast;
  if (trackPrev) trackPrev.disabled = isFirst;
  if (trackNext) trackNext.disabled = isLast;
}

function scrollToCardIndex(index) {
  const viewport = document.getElementById('carousel-viewport');
  const cards = document.querySelectorAll('.carousel-card');
  if (!viewport || cards.length === 0) return;

  const targetIndex = Math.max(0, Math.min(cards.length - 1, index));
  const card = cards[targetIndex];
  if (card) {
    viewport.scrollTo({
      left: card.offsetLeft - viewport.offsetLeft - 16,
      behavior: 'smooth'
    });
    currentActiveIndex = targetIndex;
    updateCarouselState(cards.length);
  }
}

/* Initialize Carousel Interactive Events (Drag, Large Button Clicks, Keyboard) */
function initProjectsCarousel() {
  const viewport = document.getElementById('carousel-viewport');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const trackPrev = document.getElementById('carousel-track-prev');
  const trackNext = document.getElementById('carousel-track-next');

  if (!viewport) return;

  // 1. Large Arrow Navigation Buttons
  const triggerPrev = () => scrollToCardIndex(currentActiveIndex - 1);
  const triggerNext = () => scrollToCardIndex(currentActiveIndex + 1);

  if (prevBtn) prevBtn.addEventListener('click', triggerPrev);
  if (nextBtn) nextBtn.addEventListener('click', triggerNext);
  if (trackPrev) trackPrev.addEventListener('click', triggerPrev);
  if (trackNext) trackNext.addEventListener('click', triggerNext);

  // 2. Scroll Detection & Active Index Synchronization
  let scrollTimeout;
  viewport.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const cards = document.querySelectorAll('.carousel-card');
      if (cards.length === 0) return;

      const scrollPos = viewport.scrollLeft;
      let closestIdx = 0;
      let minDiff = Infinity;

      cards.forEach((card, idx) => {
        const cardPos = card.offsetLeft - viewport.offsetLeft - 16;
        const diff = Math.abs(scrollPos - cardPos);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      if (closestIdx !== currentActiveIndex) {
        currentActiveIndex = closestIdx;
        updateCarouselState(cards.length);
      }
    }, 40);
  });

  // NOTE: Scroll wheel horizontal hijacking is intentionally removed so page scrolls vertically normally!

  // 3. Drag-to-Scroll (Mouse Grab & Drag)
  let startX = 0;
  let scrollStart = 0;
  let dragDistance = 0;
  let isPointerDown = false;

  viewport.addEventListener('mousedown', (e) => {
    isPointerDown = true;
    isDraggingCarousel = false;
    startX = e.pageX - viewport.offsetLeft;
    scrollStart = viewport.scrollLeft;
    dragDistance = 0;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPointerDown) return;
    const x = e.pageX - viewport.offsetLeft;
    const walk = x - startX;
    dragDistance = Math.abs(walk);

    if (dragDistance > 6) {
      isDraggingCarousel = true;
      viewport.classList.add('is-dragging');
      viewport.scrollLeft = scrollStart - walk;
    }
  });

  window.addEventListener('mouseup', () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    viewport.classList.remove('is-dragging');
    setTimeout(() => { isDraggingCarousel = false; }, 50);
  });
}

function initFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');

      const filtered = currentCategory === 'all'
        ? PORTFOLIO_DATA.projects
        : PORTFOLIO_DATA.projects.filter(p => p.category === currentCategory);

      renderProjects(filtered);
    });
  });
}

/* Case Study Modal with Embedded 3D CAD Viewer */
let activeCadViewer = null;

function initCaseStudyModal() {
  const backdrop = document.getElementById('case-study-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!backdrop || !closeBtn) return;

  closeBtn.addEventListener('click', closeCaseStudyModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeCaseStudyModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeCaseStudyModal();
    }
  });
}

function openCaseStudyModal(projectId) {
  const proj = PORTFOLIO_DATA.projects.find(p => p.id === projectId);
  if (!proj) return;

  const backdrop = document.getElementById('case-study-modal');
  const header = document.getElementById('modal-header-content');
  const tabs = document.getElementById('modal-tabs-list');
  const body = document.getElementById('modal-body-content');

  header.innerHTML = `
    <div style="margin-bottom:0.35rem; font-family:var(--font-mono); font-size:0.75rem;">
      <span style="color:var(--accent); font-weight:600">${proj.categoryLabel}</span>
    </div>
    <h2 style="font-size:1.6rem; margin-bottom:0.25rem">${proj.title}</h2>
    <p style="font-size:0.92rem; color:var(--text-secondary)">${proj.subtitle}</p>
  `;

  tabs.innerHTML = `
    <button class="modal-tab-btn active" data-tab="tab-overview">01 · Overview & Specs</button>
    <button class="modal-tab-btn" data-tab="tab-cad">${proj.has3DCadViewer ? '02 · Interactive 3D CAD' : '02 · CAD & Design'}</button>
    <button class="modal-tab-btn" data-tab="tab-fea">03 · Analysis & Calculations</button>
    <button class="modal-tab-btn" data-tab="tab-dfm">04 · DFM & Manufacturing</button>
    <button class="modal-tab-btn" data-tab="tab-lessons">05 · Testing & Results</button>
    <button class="modal-tab-btn" data-tab="tab-downloads">06 · Downloads</button>
  `;

  const cs = proj.caseStudy;

  body.innerHTML = `
    <!-- Tab 1: Overview -->
    <div class="tab-pane active" id="tab-overview">
      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Problem Statement & Requirements</h3>
      <p style="margin-bottom:1.25rem; font-size:0.92rem; line-height:1.65">${cs.problemStatement}</p>

      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Key Design Constraints</h3>
      <ul class="timeline-list" style="margin-bottom:1.25rem">
        ${cs.designConstraints.map(c => `<li>${c}</li>`).join('')}
      </ul>

      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Target Performance Metrics</h3>
      <div class="card-metrics-grid" style="grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); padding:0.85rem; margin-top:0.5rem">
        ${proj.keyMetrics.map(m => `
          <div class="card-metric-item">
            <span class="card-metric-lbl">${m.label}</span>
            <span class="card-metric-val" style="font-size:0.95rem">${m.value}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Tab 2: CAD & Interactive 3D Model -->
    <div class="tab-pane" id="tab-cad">
      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Mechanical Design & CAD Architecture</h3>
      <p style="margin-bottom:1rem; font-size:0.92rem; line-height:1.65">${cs.engineeringProcess}</p>

      ${proj.has3DCadViewer ? `
        <div class="modal-cad-toolbar">
          <div style="display:flex; gap:0.35rem">
            <button class="cad-control-pill active" id="cad-mode-solid">Solid CAD</button>
            <button class="cad-control-pill" id="cad-mode-wire">Wireframe</button>
            <button class="cad-control-pill" id="cad-mode-fea">FEA Stress Map</button>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem; font-family:var(--font-mono); font-size:0.75rem;">
            <span>EXPLODED VIEW:</span>
            <input type="range" id="cad-explode-slider" min="0" max="1" step="0.01" value="0" style="accent-color:var(--accent); width:90px; cursor:pointer;">
            <button class="cad-control-pill" id="cad-toggle-motion">PAUSE</button>
            <button class="cad-control-pill" id="cad-reset-cam">RESET</button>
          </div>
        </div>

        <div class="modal-cad-stage-wrap">
          <canvas id="modal-cad-canvas"></canvas>
        </div>
        <p class="mono" style="font-size:0.75rem; color:var(--text-muted); text-align:center;">
          INTERACTIVE 3D WEBGL ASSEMBLY · DRAG TO ORBIT · SCROLL TO ZOOM · DRAG SLIDER TO EXPLODE
        </p>
      ` : `
        <div style="background:#080c14; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center; margin:1rem 0;">
          <img src="${proj.thumbnail}" alt="${proj.title}" style="max-width:100%; border-radius:var(--radius-sm)">
          <p class="mono" style="font-size:0.72rem; color:var(--text-muted); margin-top:0.5rem">TECHNICAL SCHEMATIC DRAWING</p>
        </div>
      `}
    </div>

    <!-- Tab 3: Analysis -->
    <div class="tab-pane" id="tab-fea">
      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Stress & Theoretical Analysis</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.25rem;">
        <div style="background:var(--bg-primary); padding:0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-sm)">
          <span class="mono" style="font-size:0.7rem; color:var(--text-muted)">ANALYSIS METHOD</span>
          <div style="font-weight:600; font-size:0.88rem; margin-top:0.2rem">${cs.feaAnalysis.software}</div>
        </div>
        <div style="background:var(--bg-primary); padding:0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-sm)">
          <span class="mono" style="font-size:0.7rem; color:var(--text-muted)">MAX STRESS / FACTOR OF SAFETY</span>
          <div style="font-weight:600; font-size:0.88rem; color:var(--brand-green); margin-top:0.2rem">FOS: ${cs.feaAnalysis.minFOS}</div>
        </div>
      </div>
      <p style="font-size:0.92rem; line-height:1.6">${cs.feaAnalysis.meshElements} ${cs.feaAnalysis.loadCases}</p>
    </div>

    <!-- Tab 4: DFM -->
    <div class="tab-pane" id="tab-dfm">
      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Design for Manufacturing (DFM) Processes</h3>
      <ul class="timeline-list" style="margin-bottom:1.25rem">
        ${cs.manufacturing.processes.map(p => `<li>${p}</li>`).join('')}
      </ul>

      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Bill of Materials (BOM)</h3>
      <div class="bom-table-wrap">
        <table class="bom-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Material / Spec</th>
              <th>Qty</th>
              <th>Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            ${cs.manufacturing.bom.map(b => `
              <tr>
                <td><strong>${b.item}</strong></td>
                <td><span class="mono">${b.material}</span></td>
                <td>${b.qty}</td>
                <td><span class="mono" style="color:var(--brand-green)">${b.unitCost}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 5: Lessons & Results -->
    <div class="tab-pane" id="tab-lessons">
      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Testing & Validation</h3>
      <p style="margin-bottom:1.25rem; font-size:0.92rem; line-height:1.65">${cs.testingValidation}</p>

      <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.25); border-radius:var(--radius-sm); padding:1rem;">
        <h4 class="mono" style="color:var(--brand-red); font-size:0.82rem; margin-bottom:0.35rem">ENGINEERING ITERATION & LESSON LEARNED</h4>
        <p style="font-size:0.88rem; color:var(--text-primary); line-height:1.55">${cs.lessonsLearned}</p>
      </div>
    </div>

    <!-- Tab 6: Downloads -->
    <div class="tab-pane" id="tab-downloads">
      <h3 style="font-size:1.1rem; margin-bottom:0.5rem">Engineering Artifacts</h3>
      <div style="display:flex; flex-direction:column; gap:0.6rem; margin-top:0.75rem">
        ${cs.downloads.map(d => `
          <a href="${d.url}" class="btn btn-secondary" style="justify-content:space-between; padding:0.75rem 1rem" onclick="alert('Demo: Downloading ${d.name}')">
            <span><strong>${d.name}</strong></span>
            <span class="mono" style="font-size:0.75rem; color:var(--accent)">[ DOWNLOAD ]</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  // Attach Tab Handlers
  const tabBtns = tabs.querySelectorAll('.modal-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-tab');
      body.querySelectorAll('.tab-pane').forEach(p => {
        if (p.id === target) p.classList.add('active');
        else p.classList.remove('active');
      });

      // If switching to 3D CAD tab, initialize 3D viewer
      if (target === 'tab-cad' && proj.has3DCadViewer) {
        setTimeout(() => initModalCadViewer(), 50);
      }
    });
  });

  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCaseStudyModal() {
  const backdrop = document.getElementById('case-study-modal');
  if (backdrop) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function initModalCadViewer() {
  const canvas = document.getElementById('modal-cad-canvas');
  if (!canvas || typeof ProjectCadViewer === 'undefined') return;

  activeCadViewer = new ProjectCadViewer('modal-cad-canvas');

  // Solid / Wireframe / FEA pills
  const solidBtn = document.getElementById('cad-mode-solid');
  const wireBtn = document.getElementById('cad-mode-wire');
  const feaBtn = document.getElementById('cad-mode-fea');

  if (solidBtn && wireBtn && feaBtn) {
    const clearPills = () => [solidBtn, wireBtn, feaBtn].forEach(p => p.classList.remove('active'));
    solidBtn.onclick = () => { clearPills(); solidBtn.classList.add('active'); activeCadViewer.setDisplayMode('solid'); };
    wireBtn.onclick = () => { clearPills(); wireBtn.classList.add('active'); activeCadViewer.setDisplayMode('wireframe'); };
    feaBtn.onclick = () => { clearPills(); feaBtn.classList.add('active'); activeCadViewer.setDisplayMode('fea'); };
  }

  const slider = document.getElementById('cad-explode-slider');
  if (slider) {
    slider.oninput = (e) => activeCadViewer.setExplodedView(parseFloat(e.target.value));
  }

  const motionBtn = document.getElementById('cad-toggle-motion');
  if (motionBtn) {
    motionBtn.onclick = () => {
      activeCadViewer.toggleKinematics();
      motionBtn.textContent = activeCadViewer.isKinematicsRunning ? 'PAUSE' : 'PLAY';
    };
  }

  const resetBtn = document.getElementById('cad-reset-cam');
  if (resetBtn) {
    resetBtn.onclick = () => activeCadViewer.resetCamera();
  }
}

/* Skills Matrix */
function renderSkills() {
  const container = document.getElementById('skills-grid');
  if (!container || !PORTFOLIO_DATA.skills) return;

  container.innerHTML = PORTFOLIO_DATA.skills.map(cat => `
    <div class="skill-card">
      <h3 class="skill-card-title">${cat.category}</h3>
      <div class="skill-item-list">
        ${cat.items.map(item => `
          <div class="skill-item-row">
            <div class="skill-item-name-wrap">
              <span class="skill-item-name">${item.name}</span>
            </div>
            <p class="skill-item-desc">${item.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/* Experience */
function renderExperience() {
  const container = document.getElementById('experience-timeline');
  if (!container || !PORTFOLIO_DATA.experience) return;

  container.innerHTML = PORTFOLIO_DATA.experience.map(exp => `
    <div class="timeline-card">
      <div class="timeline-head-row">
        <h3 class="timeline-role">${exp.role}</h3>
        <span class="timeline-period">${exp.period}</span>
      </div>
      <div class="timeline-org">
        <span>${exp.organization} · <span style="color:var(--text-muted)">${exp.location}</span></span>
        ${exp.links ? exp.links.map(l => `
          <a href="${l.url}" target="_blank" rel="noopener" class="exp-social-btn exp-btn-${l.type}" title="${l.label}">
            ${l.type === 'instagram' ? `
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            ` : `
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            `}
            <span>${l.label} ↗</span>
          </a>
        `).join('') : ''}
      </div>
      <ul class="timeline-list">
        ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

/* Education */
function renderEducation() {
  const container = document.getElementById('education-timeline');
  if (!container || !PORTFOLIO_DATA.education) return;

  container.innerHTML = PORTFOLIO_DATA.education.map(edu => `
    <div class="timeline-card">
      <div class="timeline-head-row">
        <h3 class="timeline-role">${edu.institution}</h3>
        <span class="timeline-period">${edu.period}</span>
      </div>
      <div class="timeline-org" style="color:var(--accent); font-weight:600; margin-bottom:0.35rem">${edu.degree}</div>
      <p style="font-size:0.85rem; color:var(--text-secondary)">${edu.details}</p>
    </div>
  `).join('');
}

/* Contact Utilities */
function initContactUtilities() {
  const emailPill = document.getElementById('email-copy-pill');
  if (emailPill) {
    emailPill.onclick = () => {
      navigator.clipboard.writeText(PORTFOLIO_DATA.profile.email).then(() => {
        const hint = emailPill.querySelector('.copy-hint');
        hint.textContent = '✓ COPIED';
        hint.style.color = '#10b981';
        setTimeout(() => { hint.textContent = '[ COPY ]'; hint.style.color = ''; }, 2000);
      });
    };
  }

  const form = document.getElementById('contact-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = '✓ Message Sent!';
      btn.style.background = '#10b981';
      form.reset();
      setTimeout(() => { btn.textContent = 'Send Message →'; btn.style.background = ''; }, 3000);
    };
  }
}
