/* ═══════════════════════════════════════════════════════════════
   5ELABS — Animation Engine
   IntersectionObserver-based scroll reveals, counters,
   particle fields, progress bars, and page transitions
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Page Load Curtain ───
  if (!document.body.classList.contains('google-sites-mode')) {
    const curtain = document.createElement('div');
    curtain.className = 'page-curtain';
    document.body.prepend(curtain);
    window.addEventListener('load', () => {
      requestAnimationFrame(() => curtain.classList.add('done'));
      setTimeout(() => curtain.remove(), 800);
    });
  }

  function getSiteRootPrefix() {
    const pathname = window.location.pathname.replace(/\\/g, '/');
    if (/\/5e-labs\/[^/]+\/(?:index\.html)?$/.test(pathname)) {
      return '../../';
    }
    if (/\/home\/[^/]+\/(?:index\.html)?$/.test(pathname)) {
      return '../../';
    }
    if (/\/(?:5e-labs|peer-reviewed-evidence|dissemination|impact|contact-us)\/(?:index\.html)?$/.test(pathname)) {
      return '../';
    }
    return /\/(math-city|math-city-2|cardium|atomic-shadows|vtts)\//.test(pathname) ? '../' : '';
  }

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
    if (document.body.classList.contains('google-sites-mode')) return;

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

  // Paper plane page transition
  function initPlanePageTransitions() {
    if (!document.body.classList.contains('google-sites-mode')) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && sessionStorage.getItem('sitePlaneTransition') === 'enter') {
      sessionStorage.removeItem('sitePlaneTransition');
      runPlaneEntry();
    }

    document.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest('a[href]');
      if (!link || !shouldAnimatePlaneLink(link)) return;

      event.preventDefault();
      navigateWithPlane(link.href);
    }, true);
  }

  function shouldAnimatePlaneLink(link) {
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;
    if (link.dataset.noPlaneTransition === 'true') return false;

    const rawHref = link.getAttribute('href') || '';
    if (!rawHref || rawHref.startsWith('#')) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return false;

    let url;
    try {
      url = new URL(rawHref, window.location.href);
    } catch (error) {
      return false;
    }

    if (url.origin !== window.location.origin) return false;
    const samePath = url.pathname === window.location.pathname;
    const onlyHashChanged = samePath && url.search === window.location.search && url.hash;
    return !onlyHashChanged;
  }

  function navigateWithPlane(href) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      window.location.href = href;
      return;
    }

    if (document.documentElement.classList.contains('is-plane-transitioning')) return;
    document.documentElement.classList.add('is-plane-transitioning');

    runPlaneExit().finally(() => {
      sessionStorage.setItem('sitePlaneTransition', 'enter');
      window.location.href = href;
    });
  }

  function createPlaneTransitionLayer() {
    const existing = document.querySelector('.site-plane-transition');
    if (existing) existing.remove();

    const layer = document.createElement('div');
    layer.className = 'site-plane-transition';
    layer.innerHTML = `
      <span class="site-plane-transition-trail" aria-hidden="true"></span>
      <img class="site-plane-transition-plane" src="${getSiteRootPrefix()}assets/5elabs-paper-plane.svg" alt="" aria-hidden="true" />
    `;
    document.body.appendChild(layer);

    return {
      layer,
      plane: layer.querySelector('.site-plane-transition-plane'),
      trail: layer.querySelector('.site-plane-transition-trail')
    };
  }

  function getPlaneStartPoint() {
    const brandMark = document.querySelector('.google-brand img');
    if (!brandMark) return { x: 32, y: 24 };

    const rect = brandMark.getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.45,
      y: rect.top + rect.height * 0.28
    };
  }

  function getPlaneVisualWidth(plane) {
    const rect = plane ? plane.getBoundingClientRect() : null;
    return rect && rect.width ? rect.width : Math.min(window.innerWidth * 0.48, window.innerHeight * 0.66);
  }

  function animateTransitionElement(element, frames, timing) {
    if (!element || typeof element.animate !== 'function') {
      return new Promise(resolve => setTimeout(resolve, timing.duration || 0));
    }

    const animation = element.animate(frames, timing);
    return animation.finished.catch(() => undefined);
  }

  function runPlaneExit() {
    const { layer, plane, trail } = createPlaneTransitionLayer();
    const start = getPlaneStartPoint();
    const planeWidth = getPlaneVisualWidth(plane);
    const startX = start.x - planeWidth * 0.16;
    const startY = Math.max(-planeWidth * 0.08, start.y - planeWidth * 0.2);
    const midX = Math.min(window.innerWidth * 0.42, startX + Math.max(planeWidth * 0.62, window.innerWidth * 0.3));
    const midY = Math.max(-planeWidth * 0.04, startY - window.innerHeight * 0.12);
    const endX = window.innerWidth + planeWidth * 0.34;
    const endY = Math.max(-planeWidth * 0.05, startY - window.innerHeight * 0.25);

    layer.classList.add('is-active');
    requestAnimationFrame(() => layer.classList.add('is-exit'));

    const planeAnimation = animateTransitionElement(plane, [
      { opacity: 0, transform: `translate(${startX}px, ${startY}px) scale(0.64) rotate(-12deg)` },
      { opacity: 1, transform: `translate(${startX}px, ${startY}px) scale(0.9) rotate(-8deg)`, offset: 0.14 },
      { opacity: 1, transform: `translate(${midX}px, ${midY}px) scale(1.06) rotate(5deg)`, offset: 0.68 },
      { opacity: 0.98, transform: `translate(${endX}px, ${endY}px) scale(1.12) rotate(12deg)` }
    ], {
      duration: 900,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    const trailAnimation = animateTransitionElement(trail, [
      { opacity: 0, transform: `translate(${startX - planeWidth * 1.15}px, ${startY + planeWidth * 0.48}px) scaleX(0.22) rotate(-18deg)` },
      { opacity: 0.85, transform: `translate(${midX - planeWidth * 1.2}px, ${midY + planeWidth * 0.5}px) scaleX(1) rotate(-18deg)`, offset: 0.52 },
      { opacity: 0, transform: `translate(${endX - planeWidth * 1.32}px, ${endY + planeWidth * 0.52}px) scaleX(0.35) rotate(-18deg)` }
    ], {
      duration: 820,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    return Promise.all([planeAnimation, trailAnimation]);
  }

  function runPlaneEntry() {
    const { layer, plane, trail } = createPlaneTransitionLayer();
    const end = getPlaneStartPoint();
    const planeWidth = getPlaneVisualWidth(plane);
    const endX = end.x - planeWidth * 0.16;
    const endY = Math.max(-planeWidth * 0.08, end.y - planeWidth * 0.2);
    const startX = -planeWidth * 0.86;
    const startY = Math.max(26, endY + window.innerHeight * 0.1);
    const approachX = Math.max(-planeWidth * 0.08, endX - planeWidth * 0.58);
    const approachY = Math.max(-planeWidth * 0.02, endY + planeWidth * 0.22);

    layer.classList.add('is-active');

    const planeAnimation = animateTransitionElement(plane, [
      { opacity: 0, transform: `translate(${startX}px, ${startY}px) scale(0.9) rotate(-4deg)` },
      { opacity: 1, transform: `translate(${approachX}px, ${approachY}px) scale(0.92) rotate(-8deg)`, offset: 0.62 },
      { opacity: 0, transform: `translate(${endX}px, ${endY}px) scale(0.46) rotate(-14deg)` }
    ], {
      duration: 680,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    const trailAnimation = animateTransitionElement(trail, [
      { opacity: 0, transform: `translate(${startX - planeWidth * 0.86}px, ${startY + planeWidth * 0.34}px) scaleX(0.3) rotate(-12deg)` },
      { opacity: 0.58, transform: `translate(${approachX - planeWidth * 1.12}px, ${approachY + planeWidth * 0.3}px) scaleX(0.72) rotate(-12deg)`, offset: 0.48 },
      { opacity: 0, transform: `translate(${endX - planeWidth * 0.82}px, ${endY + planeWidth * 0.34}px) scaleX(0.15) rotate(-12deg)` }
    ], {
      duration: 620,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    Promise.all([planeAnimation, trailAnimation]).finally(() => {
      layer.classList.remove('is-active');
      document.documentElement.classList.remove('is-plane-transitioning');
      setTimeout(() => layer.remove(), 80);
    });
  }

  // Site search overlay
  function initSiteSearch() {
    const triggers = document.querySelectorAll('header [data-icon="search"]');
    if (!triggers.length) return;

    const searchItems = [
      {
        title: '5E Labs',
        description: 'Home page overview of the 5E Labs virtual learning platform collection.',
        path: 'index.html#top',
        keywords: 'home 5e labs virtual platforms inquiry learning google sites',
        sentences: [
          '5E Labs is a collection of virtual platforms for learning science and mathematics through immersive, gamified virtual labs.',
          'Built on the 5E inquiry-based learning framework, 5E Labs guide students through pedagogical stages for exploring abstract concepts in immersive virtual collaborative gaming environments.',
          '5E Labs showcases research-driven virtual learning platforms developed to support inquiry-based learning across mathematics, science, and teacher education.'
        ]
      },
      {
        title: 'About 5E Labs',
        description: 'Overview of the research-driven virtual learning platforms.',
        path: 'home/about-5e-labs/',
        keywords: 'about virtual learning inquiry mathematics science teacher education',
        sentences: [
          '5E Labs showcases research-driven virtual learning platforms developed to support inquiry-based learning across mathematics, science, and teacher education.',
          'The platforms are grounded in the 5E Inquiry Framework: Engage, Explore, Explain, Elaborate, and Evaluate.',
          'Each environment gives learners space to investigate ideas, discuss evidence, test assumptions, and reflect on what they have learned.'
        ]
      },
      {
        title: 'Objectives',
        description: 'Conceptual understanding, inquiry practice, and teacher transformation goals.',
        path: 'home/objectives/',
        keywords: 'objectives conceptual understanding inquiry teacher transformation',
        sentences: [
          'The project helps learners move from abstract concepts to visible, testable, and discussable learning experiences.',
          'The project guides students through questioning, exploration, explanation, application, and reflection.',
          'The project gives educators a practical way to model inquiry-based pedagogy using digital learning spaces.'
        ]
      },
      {
        title: 'Home Impact',
        description: 'Impact of virtual learning environments for science, mathematics, and teacher education.',
        path: 'home/impact/',
        keywords: 'impact virtual learning science mathematics teacher education',
        sentences: [
          'The 5E Labs collection connects curriculum goals with interactive learning experiences.',
          'It supports students who need concrete visual models and teachers who need safe spaces to practice inquiry-based facilitation.',
          'The project emphasizes engagement, conceptual understanding, reflective learning, collaboration, and research-informed classroom practice.'
        ]
      },
      {
        title: '5E Inquiry Framework',
        description: 'The Engage, Explore, Explain, Elaborate, and Evaluate learning cycle.',
        path: 'home/5e-inquiry-framework/',
        keywords: '5e inquiry framework engage explore explain elaborate evaluate',
        sentences: [
          'Engage introduces a meaningful challenge or scenario.',
          'Explore lets learners investigate through interaction and evidence.',
          'Explain supports learners as they describe patterns and concepts.',
          'Elaborate extends ideas into new situations and problems.',
          'Evaluate encourages reflection, feedback, and evidence of understanding.'
        ]
      },
      {
        title: '21st Century Skills',
        description: 'Problem solving, collaboration, communication, digital literacy, and reflection.',
        path: 'home/21st-century-skills/',
        keywords: '21st century skills problem solving collaboration communication digital literacy reflection',
        sentences: [
          'Learners practice problem solving, collaboration, communication, digital literacy, evidence-based reasoning, and self-reflection while working through immersive scenarios.',
          'The platforms connect disciplinary knowledge with practical decision-making in science, mathematics, and teaching contexts.'
        ]
      },
      {
        title: 'Philosophy behind 5E Labs',
        description: 'The learning philosophy behind virtual inquiry environments.',
        path: 'home/philosophy-behind-5e-labs/',
        keywords: 'philosophy learning doing explaining reflecting inquiry',
        sentences: [
          '5E Labs treats virtual environments as learning laboratories.',
          'Instead of only presenting content, each platform asks learners to act, test, discuss, and revise their understanding.',
          'Students learn deeply when they can experience a concept, talk about it, connect it to evidence, and apply it beyond the first task.'
        ]
      },
      {
        title: '5E Labs Platforms',
        description: 'Overview page for the separated 5E Labs platform pages.',
        path: '5e-labs/',
        keywords: '5e labs platforms math city cardium atomic shadows virtual school teacher training downloads',
        sentences: [
          'The 5E Labs page lists the separated platform pages for Math City 1.0, Math City 2.0, The Cardium, Atomic Shadows, and Virtual School of Teacher Training.',
          'Each platform now has its own dedicated page under the 5E Labs navigation menu.'
        ]
      },
      {
        title: 'Math City 1.0',
        description: 'A virtual city for learning about properties of 3D shapes.',
        path: '5e-labs/math-city-1-0/',
        keywords: 'math city 1 mathematics 3d shapes virtual city geometry',
        sentences: [
          'Math City 1.0 is a virtual city for learning about properties of 3D shapes through contextualized mathematical inquiry and problem solving.',
          'Students investigate properties of 3D shapes through exploration, peer discussion, explanation, and application instead of only reading definitions.',
          'The platform promotes exploratory and collaborative problem solving.'
        ]
      },
      {
        title: 'Math City 2.0',
        description: 'A next-stage mathematics learning environment for geometric reasoning.',
        path: '5e-labs/math-city-2-0/',
        keywords: 'math city 2 mathematics geometric reasoning collaborative inquiry',
        sentences: [
          'Math City 2.0 is a next-stage mathematics learning environment that extends digital geometric reasoning, collaborative exploration, and inquiry-based problem solving.',
          'The platform supports collaborative investigation where learners use digital space to test assumptions, communicate strategies, and refine mathematical understanding.',
          'Math City 2.0 builds on the virtual city learning model for deeper mathematics inquiry.'
        ]
      },
      {
        title: 'The Cardium',
        description: 'A high-immersion virtual museum for studying the human heart.',
        path: '5e-labs/the-cardium/',
        keywords: 'cardium heart human heart virtual museum biology science virtual reality',
        sentences: [
          'The Cardium is a high-immersion virtual museum for studying the structure of the human heart using virtual reality devices and inquiry-based scientific exploration.',
          'Learners explore human biology through immersive scientific investigation in a virtual museum.',
          'The Cardium supports model-based reasoning and scientific inquiry around the human heart.'
        ]
      },
      {
        title: 'Atomic Shadows',
        description: 'Atomic Shadows: Unstable Realms science learning environment.',
        path: '5e-labs/atomic-shadows/',
        keywords: 'atomic shadows unstable realms atomic structure radiation science ethics',
        sentences: [
          'Atomic Shadows: Unstable Realms is an immersive science learning environment for atomic structure, radiation, scientific ethics, and narrative-driven inquiry.',
          'Learners examine atomic phenomena through story-based scientific exploration.',
          'The platform connects evidence-based inquiry with ethical and societal dimensions of science.'
        ]
      },
      {
        title: "Virtual School of Teacher's Training",
        description: 'Teacher education simulations for professional conduct, ethics, and classroom decision-making.',
        path: '5e-labs/virtual-school-of-teachers-training/',
        keywords: 'virtual school teacher training teachers professional conduct code ethics classroom education',
        sentences: [
          "Virtual School of Teacher's Training explores teachers' professional conduct and code of ethics through simulated teaching situations, reflection, and classroom decision-making.",
          'Teachers develop inquiry-oriented pedagogical skills and reflect on teaching decisions in safe simulated contexts.',
          'The platform supports teacher education through virtual practice and reflective learning.'
        ]
      },
      {
        title: 'Environment Warriors',
        description: 'A coming-soon environmental learning platform.',
        path: 'index.html#environment-warriors',
        keywords: 'environment warriors environmental learning coming soon',
        sentences: [
          'Environment Warriors is listed as a coming-soon platform in the 5E Labs collection.',
          'The section is prepared for future environmental learning content.'
        ]
      },
      {
        title: 'Peer Reviewed Evidence',
        description: 'Research evidence and scholarly grounding for 5E Labs.',
        path: 'peer-reviewed-evidence/',
        keywords: 'peer reviewed evidence research scholarly publications citations',
        sentences: [
          '5E Labs is positioned around research-informed design, inquiry pedagogy, and evidence-based evaluation of virtual learning environments.',
          'Peer reviewed evidence can be presented as the client provides publication links, citations, or downloadable research materials.'
        ]
      },
      {
        title: 'Dissemination',
        description: 'Workshops, classroom trials, presentations, publications, and updates.',
        path: 'dissemination/',
        keywords: 'dissemination workshops classroom trials presentations publications resources',
        sentences: [
          'Dissemination activities may include workshops, classroom trials, conference presentations, journal publications, and resource sharing for educators.',
          'This section can be expanded with events, media, project announcements, and partner updates.'
        ]
      },
      {
        title: 'Impact',
        description: 'Google Sites-style impact section page.',
        path: 'impact/',
        keywords: 'impact questions evidence frequently asked question project outcomes',
        sentences: [
          'The Impact page follows the Google Sites section-page structure with a highlighted heading and frequently asked question blocks.',
          'Impact content can be replaced with final project outcomes when the client supplies approved copy.'
        ]
      },
      {
        title: 'Contact us',
        description: 'Public contact section for 5E Labs.',
        path: 'contact-us/',
        keywords: 'contact email organization information 5e labs',
        sentences: [
          'The contact page follows the Google Sites team template with a leadership section, team image, and joining information.',
          'Contact details can be added once the client confirms the preferred email, organization information, and public-facing contact method.'
        ]
      },
      {
        title: 'Downloads',
        description: 'Project archives, resources, and downloadable files.',
        path: 'downloads.html',
        keywords: 'downloads archive resources files datasets zip embedded files',
        sentences: [
          'Project archives, resources, and downloadable files are available for the 5E Labs platform collection.',
          'Users can download project archives and related files from the downloads page.',
          'The downloads page lists available project files and downloadable archive materials.'
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
      return getSiteRootPrefix();
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
            <input id="site-search-input" class="site-search-input" type="text" inputmode="search" autocomplete="off" placeholder="Search this site" aria-label="Search site" />
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
          navigateWithPlane(href);
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
  function initMobilePlatformMenus() {
    document.querySelectorAll('.mobile-platform-menu a, .google-more-menu a').forEach(link => {
      link.addEventListener('click', () => {
        const menu = link.closest('details.mobile-platform-menu, details.google-more-menu');
        if (menu) menu.open = false;
      });
    });
  }

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
    initPlanePageTransitions();
    initSiteSearch();
    initMobilePlatformMenus();
    initResearchFocusAccordions();
  });

})();
