/* ═══════════════════════════════════════════════════════════════
   5ELABS — Animation Engine
   IntersectionObserver-based scroll reveals, counters,
   particle fields, progress bars, and page transitions
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Page Load Curtain ───
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  document.body.prepend(curtain);
  window.addEventListener('load', () => {
    requestAnimationFrame(() => curtain.classList.add('done'));
    setTimeout(() => curtain.remove(), 800);
  });

  // ─── Auto-tag elements for scroll reveal ───
  function autoTag() {
    // Hero sections — tag the main heading, description, and buttons
    document.querySelectorAll('h1').forEach(el => {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'up');
    });

    // Section headings
    document.querySelectorAll('main h2, main h3').forEach(el => {
      if (!el.closest('[data-reveal]') && !el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', 'up');
      }
    });

    // Cards and grid items
    document.querySelectorAll('.grid > div, .grid > a, .grid > details').forEach(el => {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', 'up');
      }
      // Add hover lift to cards with backgrounds
      if (el.classList.contains('rounded-xl') || el.classList.contains('rounded-lg')) {
        el.classList.add('hover-lift', 'hover-glow');
      }
    });

    // Tag grids for stagger
    document.querySelectorAll('.grid').forEach(g => {
      if (g.children.length > 1) g.setAttribute('data-stagger', '');
    });

    // Hero paragraphs
    document.querySelectorAll('section > div > div > p, section > div > p').forEach(el => {
      if (!el.closest('[data-reveal]') && !el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', 'fade');
      }
    });

    // Buttons row
    document.querySelectorAll('.flex.gap-4, .flex.flex-wrap.gap-4').forEach(el => {
      if (el.querySelector('button') || el.querySelector('a[class*="bg-primary"]')) {
        if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'up');
      }
    });

    // Hero images
    document.querySelectorAll('.aspect-square, [class*="h-96"]').forEach(el => {
      const parent = el.closest('.relative') || el.parentElement;
      if (parent && !parent.hasAttribute('data-reveal')) {
        parent.setAttribute('data-reveal', 'scale');
      }
    });

    // Footer
    document.querySelectorAll('footer > div > div').forEach(el => {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'fade');
    });

    // Badge pills
    document.querySelectorAll('[class*="rounded-full"][class*="bg-tertiary"]').forEach(el => {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'fade');
    });

    // Sidebar — add shimmer on hover
    document.querySelectorAll('aside nav a').forEach(el => {
      el.classList.add('shimmer-on-hover');
    });

    // Buttons — add shimmer
    document.querySelectorAll('button[class*="bg-primary"]').forEach(el => {
      el.classList.add('shimmer-on-hover');
    });

    // Focus area cards — hover icon spin
    document.querySelectorAll('.grid > div, .grid > details').forEach(el => {
      if (!el.classList.contains('research-focus-card') && el.querySelector('.material-symbols-outlined')) {
        el.classList.add('hover-icon-spin');
      }
    });

    // Tables — animate rows
    document.querySelectorAll('table').forEach(el => {
      el.classList.add('animate-rows');
    });

    // Make floating orbs animate
    document.querySelectorAll('[class*="blur-3xl"]').forEach((el, i) => {
      el.classList.add(i % 2 === 0 ? 'orb-float' : 'orb-float-slow');
    });

    // Progress bars — wrap fills
    document.querySelectorAll('[class*="h-1"][class*="rounded-full"] > div, [class*="h-full"][class*="bg-primary"], [class*="h-full"][class*="bg-tertiary"], [class*="h-full"][class*="bg-secondary"]').forEach(el => {
      const parent = el.parentElement;
      if (parent && !parent.hasAttribute('data-progress')) {
        parent.setAttribute('data-progress', '');
        parent.setAttribute('data-reveal', 'fade');
        el.classList.add('progress-fill');
      }
    });
  }

  // ─── Scroll Reveal Observer ───
  function initRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }

  // ─── Animated Counters ───
  function initCounters() {
    const counterEls = document.querySelectorAll('.text-4xl.font-headline, .text-4xl.font-bold');
    if (!counterEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);

        const original = el.textContent.trim();
        // Extract leading number
        const match = original.match(/^([\d,.]+)/);
        if (!match) return;

        const numStr = match[1];
        const suffix = original.slice(numStr.length);
        const target = parseFloat(numStr.replace(/,/g, ''));
        if (isNaN(target)) return;

        const hasDecimal = numStr.includes('.');
        const decimalPlaces = hasDecimal ? numStr.split('.')[1].length : 0;
        const hasCommas = numStr.includes(',');
        const duration = 1800;
        const start = performance.now();

        function ease(t) {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function formatNumber(n) {
          let s = hasDecimal ? n.toFixed(decimalPlaces) : Math.round(n).toString();
          if (hasCommas) {
            const parts = s.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            s = parts.join('.');
          }
          return s;
        }

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const current = target * ease(progress);
          el.textContent = formatNumber(current) + suffix;
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = original;
            el.classList.add('counter-done');
          }
        }

        el.textContent = formatNumber(0) + suffix;
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.3 });

    counterEls.forEach(el => observer.observe(el));
  }

  // ─── Particle Field ───
  function initParticles() {
    const hero = document.querySelector('section.relative') || document.querySelector('main > section:first-child');
    if (!hero) return;
    // Only if hero has position relative or we make it
    if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';

    const field = document.createElement('div');
    field.className = 'particle-field';

    for (let i = 0; i < 12; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      dot.style.opacity = (0.15 + Math.random() * 0.15).toFixed(2);
      const size = (40 + Math.random() * 180);
      dot.style.width = dot.style.height = size + 'px';
      dot.style.animationDelay = -(Math.random() * 12).toFixed(1) + 's';
      field.appendChild(dot);
    }

    hero.prepend(field);
  }

  // ─── Parallax on Hero Image ───
  function initParallax() {
    const heroImg = document.querySelector('.aspect-square img, [class*="h-96"] img');
    if (!heroImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const rate = scrollY * 0.08;
        if (rate < 80) {
          heroImg.style.transform = `translateY(${rate}px) scale(1.05)`;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // ─── Header Scroll Shadow ───
  function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.style.boxShadow = '0 4px 24px -4px rgba(0,0,0,0.08)';
      } else {
        header.style.boxShadow = '';
      }
    }, { passive: true });
  }

  // ─── Magnetic Buttons ───
  function initMagneticButtons() {
    document.querySelectorAll('button[class*="bg-primary"], a[class*="bg-primary"]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => btn.style.transition = '', 400);
      });
    });
  }

  // ─── Active Status Badge Pulse ───
  function initBadgePulse() {
    document.querySelectorAll('[class*="bg-tertiary/10"]').forEach(el => {
      if (el.textContent.trim().toUpperCase() === 'ACTIVE' || el.textContent.trim().toUpperCase() === 'VERIFIED') {
        el.classList.add('badge-pulse');
      }
    });
  }

  // ─── Smooth Entrance for Aside ───
  function initSidebarEntrance() {
    const aside = document.querySelector('aside');
    if (!aside) return;
    aside.style.opacity = '0';
    aside.style.transform = 'translateX(-20px)';
    aside.style.transition = 'opacity 0.7s ease 0.3s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s';
    window.addEventListener('load', () => {
      aside.style.opacity = '1';
      aside.style.transform = 'translateX(0)';
    });
  }

  // ─── ECG bars on Cardium ───
  function initECGBars() {
    document.querySelectorAll('.h-24 > div[class*="bg-primary"]').forEach(el => {
      el.classList.add('ecg-bar');
    });
  }

  // Site search overlay
  function initSiteSearch() {
    const triggers = document.querySelectorAll('header [data-icon="search"]');
    if (!triggers.length) return;

    const searchItems = [
      {
        title: '5E Labs Showcase',
        description: 'Main overview of the 5E Labs virtual learning platforms.',
        path: 'index.html#top',
        keywords: 'home explore showcase virtual learning inquiry framework',
        sentences: [
          '5E Labs showcases a series of research-driven virtual learning platforms developed to support inquiry-based learning across mathematics, science, and teacher education.',
          'Grounded in the 5E Inquiry Framework, these virtual platforms emphasize engagement, conceptual understanding, reflection, and pedagogical transformation.',
          'The showcase introduces the research protocol and methodology behind the 5E Labs platform collection.',
          'Virtual simulations and immersive environments bring abstract concepts to life in a risk-free digital space.',
          'STEM education innovation bridges theory and practice with tools for modern science and mathematics education.',
          'Teacher professional development empowers educators with digital resources for transformative learning experiences.',
          'Learning analytics and reflective practice help monitor progress, self-reflection, and instructional outcomes.'
        ]
      },
      {
        title: 'Research Focus Areas',
        description: 'Inquiry pedagogy, simulation design, STEM integration, teacher training, and learning analytics.',
        path: 'index.html#focus-areas',
        keywords: 'research focus areas pedagogy simulation stem teacher analytics',
        sentences: [
          'Inquiry-based learning design crafts pedagogical frameworks that empower students to explore, question, and discover through the 5E instructional model.',
          'Virtual simulations and immersive environments develop high-fidelity virtual labs and interactive scenarios that bring abstract concepts to life in a risk-free digital space.',
          'STEM education innovation bridges the gap between theory and practice with tools for modern science and mathematics education.',
          'Teacher professional development empowers educators with the skills and digital resources needed to facilitate transformative learning experiences.',
          'Learning analytics and reflective practice use data-driven insights to monitor progress, foster self-reflection, and optimize instructional outcomes.'
        ]
      },
      {
        title: 'Downloads',
        description: 'Project archives, datasets, resources, and downloadable files.',
        path: 'downloads.html',
        keywords: 'downloads archive resources files datasets zip',
        sentences: [
          'Project Downloads provides access to the latest archives, datasets, and resources.',
          'Users can download project archives and related files from the downloads page.',
          'The downloads page lists available project files and downloadable archive materials.'
        ]
      },
      {
        title: 'Math City 2.0',
        description: 'A digital mathematical environment for geometry, reasoning, and inquiry.',
        path: 'math-city-2/index.html',
        keywords: 'math city 2 mathematics geometry computational nexus',
        sentences: [
          'Math City 2.0 is the evolution of digital geometric synthesis.',
          'The platform uses high-fidelity spectral analysis to curate the next generation of mathematical architecture.',
          'Neural topology mapping supports advanced visualization of high-dimensional datasets using manifold learning.',
          'Math City 2.0 treats data as a physical asset and verifies each byte against consensus protocols.',
          'The archive remains a source of truth through asymmetric encryption, geometric proof verification, and quantum-safe data structures.'
        ]
      },
      {
        title: 'Math City 1.0',
        description: 'A city-based virtual learning environment for mathematical reasoning and problem solving.',
        path: 'math-city/index.html',
        keywords: 'math city 1 mathematics problem solving geometry',
        sentences: [
          'Math City 1.0 is a virtual, city-based learning environment designed to foster mathematical reasoning and problem-solving through contextualized, inquiry-driven experiences.',
          'Students develop conceptual understanding of mathematics and apply mathematical reasoning to real-world contexts.',
          'The platform promotes exploratory and collaborative problem solving.',
          'The 5E alignment uses authentic challenges, multiple pathways, articulated reasoning, concept extension, and reflective prompts.',
          'Math City 1.0 examines inquiry-driven mathematics learning in immersive contexts.',
          'The initiative investigates learner engagement and conceptual transfer.'
        ]
      },
      {
        title: 'The Cardium',
        description: 'Interactive inquiry into human biology, health systems, and cardiology concepts.',
        path: 'cardium/index.html',
        keywords: 'cardium biology health heart cardiology medical human systems',
        sentences: [
          'The Cardium is a virtual learning platform designed to support inquiry into human biology and health systems through interactive simulations and case-based exploration.',
          'Learners understand complex biological systems and connect concepts to real-world health.',
          'The platform develops scientific inquiry for secondary learners, undergraduate science learners, and future health science educators.',
          'The Cardium supports model-based reasoning through hypothesis testing and simulations.',
          'Research significance focuses on interdisciplinary STEM inquiry.'
        ]
      },
      {
        title: 'Atomic Shadows',
        description: 'Narrative inquiry around atomic structure, radiation, and scientific ethics.',
        path: 'atomic-shadows/index.html',
        keywords: 'atomic shadows atom radiation science ethics simulation',
        sentences: [
          'Atomic Shadows is an inquiry-based virtual platform focused on atomic structure, radiation, and scientific ethics through immersive, narrative-driven exploration.',
          'The platform develops conceptual understanding of atomic phenomena.',
          'Learners examine ethical and societal dimensions of science through evidence-based inquiry.',
          'Narrative-based scenarios create immersive environments driven by storytelling.',
          'Decision-making models generate dynamic outcomes based on learner choices.'
        ]
      },
      {
        title: 'Virtual Teaching Training School',
        description: 'Teacher education simulations for instructional design and classroom decision-making.',
        path: 'vtts/index.html',
        keywords: 'virtual teaching training school teacher education pedagogy classroom',
        sentences: [
          'The Virtual Teaching Training School provides a simulated environment for teacher education, allowing pre-service teachers to practice instructional design, inquiry facilitation, and classroom decision-making.',
          'Teachers develop inquiry-oriented pedagogical skills and reflect on teaching decisions in safe simulated contexts.',
          'Teachers experience the 5E model from the learner perspective.',
          'The platform supports design-reflect-redesign cycles.',
          'The target audience includes pre-service and in-service teachers, along with teacher educators.',
          'Research significance investigates virtual simulations and supports pedagogical growth.',
          'The Virtual Teaching Training School connects technological excellence with educational practice.'
        ]
      }
    ];

    let contentIndexPromise = null;

    const state = {
      overlay: null,
      panel: null,
      input: null,
      results: null,
      previousFocus: null,
      activeTrigger: null,
      pinned: false,
      closeTimer: null,
      closeAnimationTimer: null
    };

    function getRootPrefix() {
      const pathname = window.location.pathname.replace(/\\/g, '/');
      return /\/(math-city|math-city-2|cardium|atomic-shadows|vtts)\//.test(pathname) ? '../' : '';
    }

    function toHref(path) {
      return getRootPrefix() + path;
    }

    function normalize(value) {
      return value.toLowerCase().trim();
    }

    function getSearchTerms(value) {
      return normalize(value).split(/\s+/).filter(Boolean);
    }

    function escapeHtml(value) {
      return value.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]);
    }

    function escapeRegExp(value) {
      return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function cleanSearchText(value) {
      return value.replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
    }

    function splitSentences(value) {
      const text = cleanSearchText(value);
      if (!text) return [];

      return text
        .replace(/([.!?])\s+(?=[A-Z0-9])/g, '$1|')
        .split('|')
        .map(sentence => cleanSearchText(sentence))
        .filter(sentence => sentence.length >= 24);
    }

    function mergeSentences(sentences) {
      const seen = new Set();
      return sentences.filter(sentence => {
        const key = normalize(sentence).replace(/\s+/g, ' ');
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    function getItemContentSource(documentFragment, path) {
      const hashIndex = path.indexOf('#');
      const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
      if (hash) {
        const target = documentFragment.querySelector(hash);
        if (target) return target;
      }
      return documentFragment.querySelector('main') || documentFragment.body;
    }

    function getFetchPath(path) {
      const hashIndex = path.indexOf('#');
      return hashIndex >= 0 ? path.slice(0, hashIndex) : path;
    }

    function getSearchableText(source) {
      const clone = source.cloneNode(true);
      clone
        .querySelectorAll('script, style, svg, canvas, button, nav, aside, footer, .material-symbols-outlined, [aria-hidden="true"]')
        .forEach(element => element.remove());
      return clone.textContent || '';
    }

    function queueContentIndex() {
      if (contentIndexPromise) return contentIndexPromise;

      contentIndexPromise = Promise.allSettled(searchItems.map(async item => {
        const response = await fetch(toHref(getFetchPath(item.path)), { credentials: 'same-origin' });
        if (!response.ok) return;

        const html = await response.text();
        const parsedDocument = new DOMParser().parseFromString(html, 'text/html');
        const source = getItemContentSource(parsedDocument, item.path);
        if (!source) return;

        const parsedSentences = splitSentences(getSearchableText(source));
        if (parsedSentences.length) {
          item.sentences = mergeSentences(parsedSentences.concat(item.sentences || []));
        }
      }));

      return contentIndexPromise;
    }

    function createOverlay() {
      if (state.overlay) return;

      const overlay = document.createElement('div');
      overlay.className = 'site-search-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'site-search-title');
      overlay.innerHTML = `
        <div class="site-search-panel">
          <form class="site-search-form" role="search">
            <label id="site-search-title" class="site-search-label" for="site-search-input">Search site</label>
            <input id="site-search-input" class="site-search-input" type="text" inputmode="search" autocomplete="off" placeholder="Search platforms, downloads, or focus areas" aria-label="Search site" />
          </form>
          <div class="site-search-results" aria-live="polite"></div>
        </div>
      `;

      document.body.appendChild(overlay);
      state.overlay = overlay;
      state.panel = overlay.querySelector('.site-search-panel');
      state.input = overlay.querySelector('.site-search-input');
      state.results = overlay.querySelector('.site-search-results');

      document.addEventListener('pointerdown', event => {
        if (!state.overlay || !state.overlay.classList.contains('is-open')) return;
        const target = event.target;
        const clickedTrigger = Array.from(triggers).some(trigger => trigger.contains(target));
        if (!state.panel.contains(target) && !clickedTrigger) closeSearch();
      });
      overlay.querySelector('.site-search-form').addEventListener('submit', event => {
        event.preventDefault();
        showResults();
        const firstResult = state.results.querySelector('a');
        if (firstResult) {
          const href = firstResult.href;
          closeSearch();
          window.location.href = href;
        }
      });
      state.input.addEventListener('focus', showResults);
      state.input.addEventListener('click', showResults);
      state.input.addEventListener('input', () => {
        showResults();
      });
      state.results.addEventListener('click', event => {
        if (event.target.closest('a')) closeSearch();
      });
      state.panel.addEventListener('mouseenter', cancelHoverClose);
      state.panel.addEventListener('mouseleave', scheduleHoverClose);
      overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closeSearch();
        }
      });
      window.addEventListener('resize', () => {
        if (state.overlay.classList.contains('is-open')) positionSearch();
      });
      window.addEventListener('scroll', () => {
        if (state.overlay.classList.contains('is-open')) positionSearch();
      }, { passive: true });

      renderResults('');
    }

    function getItemHaystack(item) {
      return normalize(`${item.title} ${item.description} ${item.keywords} ${(item.sentences || []).join(' ')}`);
    }

    function getMatchingSentences(item, terms) {
      if (!terms.length) return [];

      const sentenceMatches = (item.sentences || [])
        .filter(sentence => {
          const sentenceText = normalize(sentence);
          return terms.some(term => sentenceText.includes(term));
        });

      if (sentenceMatches.length) return sentenceMatches.slice(0, 3);

      const description = normalize(item.description);
      return terms.some(term => description.includes(term)) ? [item.description] : [];
    }

    function highlightTerms(value, terms) {
      if (!terms.length) return escapeHtml(value);

      const pattern = terms
        .slice()
        .sort((a, b) => b.length - a.length)
        .map(escapeRegExp)
        .join('|');
      if (!pattern) return escapeHtml(value);

      const matcher = new RegExp(pattern, 'ig');
      let output = '';
      let lastIndex = 0;

      value.replace(matcher, (match, offset) => {
        output += escapeHtml(value.slice(lastIndex, offset));
        output += `<mark>${escapeHtml(match)}</mark>`;
        lastIndex = offset + match.length;
        return match;
      });

      output += escapeHtml(value.slice(lastIndex));
      return output;
    }

    function scoreItem(item, terms) {
      if (!terms.length) return 1;
      const haystack = getItemHaystack(item);
      const title = normalize(item.title);
      const keywords = normalize(item.keywords);
      if (!terms.every(term => haystack.includes(term))) return 0;

      return terms.reduce((score, term) => {
        if (title.includes(term)) return score + 4;
        if (keywords.includes(term)) return score + 2;
        if ((item.sentences || []).some(sentence => normalize(sentence).includes(term))) return score + 2;
        return score + 1;
      }, 0);
    }

    function renderResults(value) {
      const terms = getSearchTerms(value);
      const matches = searchItems
        .map(item => ({
          item,
          score: scoreItem(item, terms),
          snippets: getMatchingSentences(item, terms)
        }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score);

      if (!matches.length) {
        state.results.innerHTML = `
          <div class="site-search-dropdown-title">Search for "${escapeHtml(value.trim())}"</div>
          <p class="site-search-empty">No results found.</p>
        `;
        return;
      }

      const dropdownTitle = terms.length
        ? `Search for "${escapeHtml(value.trim())}"`
        : 'Suggested searches';

      state.results.innerHTML = `
        <div class="site-search-dropdown-title">${dropdownTitle}</div>
        ${matches.map(({ item, snippets }) => `
        <a class="site-search-result" href="${escapeHtml(toHref(item.path))}">
          <span class="site-search-result-title">${escapeHtml(item.title)}</span>
          ${terms.length && snippets.length ? `
          <span class="site-search-result-snippets">
            ${snippets.map(sentence => `<span class="site-search-result-snippet">${highlightTerms(sentence, terms)}</span>`).join('')}
          </span>
          ` : ''}
        </a>
        `).join('')}
      `;
    }

    function refreshResultsAfterIndex(value) {
      queueContentIndex().then(() => {
        if (!state.overlay || !state.overlay.classList.contains('is-open')) return;
        if (state.input.value !== value) return;
        renderResults(value);
      });
    }

    function showResults() {
      if (!state.overlay) return;
      state.pinned = true;
      cancelHoverClose();
      positionSearch();
      renderResults(state.input.value);
      refreshResultsAfterIndex(state.input.value);
      state.panel.classList.add('has-results');
    }

    function getSearchLeft(triggerRect) {
      const header = state.activeTrigger.closest('header');
      const desktopNav = header ? header.querySelector('.site-desktop-nav') : null;
      const mobileLinks = header ? header.querySelector('.site-mobile-page-links') : null;
      const minGap = 12;

      if (desktopNav && getComputedStyle(desktopNav).display !== 'none') {
        return Math.ceil(desktopNav.getBoundingClientRect().right + minGap);
      }

      if (mobileLinks && getComputedStyle(mobileLinks).display !== 'none') {
        const activeMobileLink = mobileLinks.querySelector('.text-blue-700, .border-blue-700');
        const anchor = activeMobileLink || mobileLinks;
        return Math.ceil(anchor.getBoundingClientRect().right + minGap);
      }

      const headerBrand = header ? header.querySelector('a') : null;
      if (headerBrand) {
        return Math.ceil(headerBrand.getBoundingClientRect().right + minGap);
      }

      return 16;
    }

    function positionSearch() {
      if (!state.overlay || !state.activeTrigger) return;

      const triggerRect = state.activeTrigger.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const desiredHeight = 42;
      const right = Math.max(12, viewportWidth - triggerRect.right - 8);
      const maxRightEdge = viewportWidth - right;
      const availableLeft = getSearchLeft(triggerRect);
      const availableWidth = maxRightEdge - availableLeft;
      const maxBubbleWidth = viewportWidth < 640 ? viewportWidth - 24 : 340;
      const minBubbleWidth = viewportWidth < 420 ? viewportWidth - 24 : 210;
      let width = Math.min(maxBubbleWidth, Math.max(minBubbleWidth, availableWidth));
      let left = maxRightEdge - width;

      if (left < availableLeft && availableWidth >= minBubbleWidth) {
        left = availableLeft;
        width = Math.min(maxBubbleWidth, availableWidth);
      }

      if (width < minBubbleWidth) {
        width = Math.min(minBubbleWidth, viewportWidth - 24);
        left = Math.max(12, maxRightEdge - width);
      }

      const top = Math.max(8, Math.round(triggerRect.top + (triggerRect.height - desiredHeight) / 2));

      state.overlay.style.top = top + 'px';
      state.overlay.style.left = left + 'px';
      state.overlay.style.right = 'auto';
      state.overlay.style.width = width + 'px';
    }

    function openSearch(trigger, options = {}) {
      createOverlay();
      const focusInput = Boolean(options.focusInput);
      const showDropdown = Boolean(options.showDropdown);
      const pin = Boolean(options.pin);
      state.previousFocus = document.activeElement;
      state.activeTrigger = trigger || state.activeTrigger || triggers[0];
      state.pinned = state.pinned || pin || focusInput || showDropdown;
      cancelHoverClose();
      cancelCloseAnimation();
      positionSearch();
      state.overlay.classList.add('is-open');
      state.overlay.classList.remove('is-closing');
      state.activeTrigger.classList.add('is-search-active');
      document.body.classList.add('site-search-open');
      if (!state.input.value) renderResults('');
      state.panel.classList.toggle('has-results', showDropdown);
      if (focusInput) {
        requestAnimationFrame(() => {
          state.input.focus();
          if (showDropdown) showResults();
        });
      }
    }

    function closeSearch() {
      if (!state.overlay) return;
      if (!state.overlay.classList.contains('is-open') && !state.overlay.classList.contains('is-closing')) return;
      cancelHoverClose();
      cancelCloseAnimation();
      state.overlay.classList.remove('is-open');
      state.overlay.classList.add('is-closing');
      if (state.activeTrigger) state.activeTrigger.classList.remove('is-search-active');
      state.panel.classList.remove('has-results');
      state.pinned = false;
      document.body.classList.remove('site-search-open');
      if (state.previousFocus && typeof state.previousFocus.focus === 'function') {
        state.previousFocus.focus();
      }
      state.closeAnimationTimer = setTimeout(() => {
        state.overlay.classList.remove('is-closing');
        state.closeAnimationTimer = null;
      }, 190);
    }

    function cancelHoverClose() {
      if (!state.closeTimer) return;
      clearTimeout(state.closeTimer);
      state.closeTimer = null;
    }

    function cancelCloseAnimation() {
      if (!state.closeAnimationTimer) return;
      clearTimeout(state.closeAnimationTimer);
      state.closeAnimationTimer = null;
      if (state.overlay) state.overlay.classList.remove('is-closing');
    }

    function scheduleHoverClose() {
      if (state.pinned) return;
      cancelHoverClose();
      state.closeTimer = setTimeout(() => {
        if (!state.pinned) closeSearch();
      }, 140);
    }

    triggers.forEach(trigger => {
      trigger.classList.add('site-search-trigger');
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('aria-label', 'Search site');
      trigger.addEventListener('mouseenter', () => openSearch(trigger));
      trigger.addEventListener('mouseleave', scheduleHoverClose);
      trigger.addEventListener('click', () => openSearch(trigger, { focusInput: true, showDropdown: true, pin: true }));
      trigger.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openSearch(trigger, { focusInput: true, showDropdown: true });
        }
      });
    });
  }

  // ─── Init Everything ───
  // Research focus card expansion animation
  function initResearchFocusAccordions() {
    const cards = document.querySelectorAll('details.research-focus-card');
    if (!cards.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    cards.forEach(card => {
      const summary = card.querySelector('summary');
      const description = card.querySelector('.research-focus-description');
      if (!summary || !description) return;

      summary.addEventListener('click', event => {
        if (reduceMotion) return;

        event.preventDefault();
        if (card.dataset.animating === 'true') return;

        if (card.open) {
          collapseCard(card, summary, description);
        } else {
          expandCard(card, summary, description);
        }
      });
    });
  }

  function getCardBorderHeight(card) {
    const style = getComputedStyle(card);
    return parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  }

  function getClosedCardHeight(card, summary) {
    return Math.ceil(summary.offsetHeight + getCardBorderHeight(card));
  }

  function getOpenCardHeight(card) {
    return Math.ceil(card.scrollHeight + getCardBorderHeight(card));
  }

  function expandCard(card, summary, description) {
    const startHeight = card.offsetHeight;

    card.dataset.animating = 'true';
    card.classList.add('is-expanding');
    card.style.height = startHeight + 'px';
    card.open = true;

    description.style.opacity = '0';
    description.style.transform = 'translateY(-6px)';

    const endHeight = getOpenCardHeight(card);

    requestAnimationFrame(() => {
      const animation = card.animate(
        [{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
        {
          duration: 360,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards'
        }
      );
      let done = false;

      description.style.opacity = '1';
      description.style.transform = 'translateY(0)';

      animation.onfinish = () => {
        finishExpand(animation);
      };
      animation.oncancel = () => {
        finishExpand(animation);
      };

      function finishExpand(currentAnimation) {
        if (done) return;
        done = true;
        currentAnimation.onfinish = null;
        currentAnimation.oncancel = null;
        card.style.height = endHeight + 'px';
        currentAnimation.cancel();
        card.style.height = '';
        description.style.opacity = '';
        description.style.transform = '';
        card.classList.remove('is-expanding');
        delete card.dataset.animating;
      }
    });
  }

  function collapseCard(card, summary, description) {
    const startHeight = card.offsetHeight;
    const endHeight = getClosedCardHeight(card, summary);

    card.dataset.animating = 'true';
    card.classList.add('is-collapsing');
    card.style.height = startHeight + 'px';
    description.style.opacity = '1';
    description.style.transform = 'translateY(0)';

    requestAnimationFrame(() => {
      const animation = card.animate(
        [{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
        {
          duration: 320,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        }
      );
      let done = false;

      animation.onfinish = () => {
        finishCollapse(animation);
      };
      animation.oncancel = () => {
        finishCollapse(animation);
      };

      function finishCollapse(currentAnimation) {
        if (done) return;
        done = true;
        currentAnimation.onfinish = null;
        currentAnimation.oncancel = null;
        card.style.height = endHeight + 'px';
        currentAnimation.cancel();
        card.open = false;
        card.style.height = '';
        description.style.opacity = '';
        description.style.transform = '';
        card.classList.remove('is-collapsing');
        delete card.dataset.animating;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    autoTag();
    initRevealObserver();
    initCounters();
    initParticles();
    initParallax();
    initHeaderScroll();
    initMagneticButtons();
    initBadgePulse();
    initSidebarEntrance();
    initECGBars();
    initSiteSearch();
    initResearchFocusAccordions();
  });

})();
