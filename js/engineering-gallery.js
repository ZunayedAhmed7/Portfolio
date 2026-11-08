/* Four engineering studies, with local artwork and source credits. */
(() => {
  'use strict';

  const gallery = document.getElementById('engineering-gallery');
  if (!gallery) return;

  const studies = [
    {
      title: 'Concorde', figure: 'CONCORDE', category: 'SUPERSONIC CIVIL AVIATION',
      image: 'assets/engineering/concorde.png', monochrome: true, view: 'MULTI-VIEW STUDY',
      alt: 'Concorde technical drawing showing its slender fuselage, delta wing, four engines, and multiple orthographic views',
      notes: ['LENGTH / 62.1 M', 'WINGSPAN / 25.5 M'],
      caption: 'Concorde crossed the Atlantic at Mach 2, with its fastest crossing taking under three hours. I crossed that same ocean twenty years after it retired. Its speed and ambition still fascinate me.',
      reference: 'https://hotline.britishairways.com/content/information/about-ba/history-and-heritage/celebrating-concorde', referenceName: 'BRITISH AIRWAYS',
      credit: 'JULIEN.SCAVINI', creditUrl: 'https://commons.wikimedia.org/wiki/File:Concorde_v1.0.png',
      license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/'
    },
    {
      title: 'Lockheed SR-71', figure: 'LOCKHEED SR-71', category: 'BLACKBIRD / HIGH-SPEED FLIGHT',
      image: 'assets/engineering/sr-71.svg', monochrome: true, view: 'THREE-VIEW STUDY',
      alt: 'United States Air Force SR-71 three-view drawing showing its long chined nose, twin engine nacelles, swept wings, and twin tail fins',
      notes: ['FLIGHT / MACH 3.2', 'RESEARCH / HIGH ALTITUDE'],
      caption: 'An aircraft from the 1960s reaching 3,529 km/h is already pretty cool to me. What really gets me is everything that made it possible: the aerodynamics, a titanium body handling extreme heat, specially developed fuel, and computers controlling the engine inlets. So many branches of engineering pushed forward to make one aircraft work',
      reference: 'https://www.nasa.gov/image-article/sr-71-3/', referenceName: 'NASA',
      credit: 'US AIR FORCE / PUBLIC DOMAIN', creditUrl: 'https://commons.wikimedia.org/wiki/File:Lockheed_SR-71A_3view.svg'
    },
    {
      title: 'Apollo Guidance Computer', figure: 'APOLLO GUIDANCE COMPUTER', category: 'SOFTWARE / HUMAN INTERFACE',
      image: 'assets/engineering/apollo-dsky.svg', monochrome: true, view: 'ANNOTATED INTERFACE',
      alt: 'Supplied Apollo DSKY technical line drawing with labeled status lights, program, verb and noun displays, three numeric registers, and keyboard controls',
      notes: ['MISSION / APOLLO 11', 'INTERFACE / DSKY'],
      caption: 'The constraints are what make the Apollo Guidance Computer stand out to me. Helping land people on the Moon with so little computing power took a level of ingenuity that puts the resources I take for granted every day into perspective.',
      reference: 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.1201-fm.html', referenceName: 'NASA / APOLLO',
      credit: 'OONA RÄISÄNEN + NASA / PUBLIC DOMAIN', creditUrl: 'https://commons.wikimedia.org/wiki/File:Apollo_DSKY_interface.svg'
    },
    {
      title: 'Falcon 9 · Landing Booster', figure: 'FALCON 9 / FIRST STAGE', category: 'REUSABLE SPACEFLIGHT',
      image: 'assets/engineering/falcon-9-recovery-detail.svg', monochrome: true, view: 'RECOVERY DETAIL',
      alt: 'Cropped Falcon 9 return trajectory showing the flip maneuver, boostback burn, grid-fin deployment, entry burn, aerodynamic guidance, and vertical droneship landing',
      notes: ['CONTROL / GRID FINS', 'RECOVERY / LANDING LEGS'],
      caption: 'The amount of math and code needed to bring a rocket back down and land it upright baffles me, an enormous booster correcting its descent, settling upright onto a landing pad, and eventually flying again.',
      reference: 'https://www.spacex.com/vehicles/falcon-9/', referenceName: 'SPACEX',
      credit: 'SPACEX PHOTOS / SUPPLIED LINE ART', creditUrl: 'https://commons.wikimedia.org/wiki/File:Falcon_9_First_Stage_Reusability_Graphic.jpg',
      license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/'
    }
  ];

  const image = gallery.querySelector('#engineering-image');
  const slide = gallery.querySelector('#engineering-slide');
  const stage = gallery.querySelector('#engineering-stage');
  const story = document.getElementById('engineering-story');
  const copy = story.querySelector('.engineering-copy');
  const selectors = [...gallery.querySelectorAll('[data-engineering-slide]')];
  const status = gallery.querySelector('#engineering-status');
  const counter = document.getElementById('engineering-counter');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animatedParts = [image, copy, gallery.querySelector('.flight-drawing-head'), gallery.querySelector('.engineering-sheet-footer')];
  let currentIndex = 0;
  let requestedIndex = 0;
  let requestNumber = 0;
  let transitionAnimations = [];
  let measuredWidth = 0;

  function reserveCopySpace() {
    const width = copy.getBoundingClientRect().width;
    measuredWidth = width;
    if (!width) return;
    // Measure every study at the current width without changing the visible
    // content. Reserve only the tallest copy, so navigation never shifts.
    const probe = copy.cloneNode(true);
    probe.classList.add('engineering-copy--measure');
    probe.style.width = width + 'px';
    probe.setAttribute('aria-hidden', 'true');
    probe.inert = true;
    probe.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    story.append(probe);
    let height = 0;
    studies.forEach(study => {
      probe.querySelector('h3').textContent = study.title;
      probe.querySelector('.engineering-story-category').textContent = study.category;
      probe.querySelector('.engineering-caption').textContent = study.caption;
      height = Math.max(height, probe.getBoundingClientRect().height);
    });
    probe.remove();
    gallery.style.setProperty('--engineering-copy-height', Math.ceil(height) + 'px');
  }

  function cancelTransition() {
    transitionAnimations.forEach(animation => animation.cancel());
    transitionAnimations = [];
  }

  async function animateParts(frames, duration) {
    if (reducedMotion.matches || typeof image.animate !== 'function') return;
    transitionAnimations = animatedParts.map(element => element.animate(frames, {
      duration, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards'
    }));
    await Promise.allSettled(transitionAnimations.map(animation => animation.finished));
  }

  function setBusy(busy) {
    slide.setAttribute('aria-busy', String(busy));
    story.setAttribute('aria-busy', String(busy));
  }

  function creditLink(label, url) {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  async function showStudy(index) {
    requestedIndex = (index + studies.length) % studies.length;
    const nextIndex = requestedIndex;
    const study = studies[nextIndex];
    const request = ++requestNumber;
    cancelTransition();
    if (nextIndex === currentIndex) {
      setBusy(false);
      status.textContent = `Study ${nextIndex + 1} of ${studies.length}: ${study.title}`;
      return;
    }
    setBusy(true);
    // Decode before replacing the visible study, retaining a complete drawing
    // while a new local asset loads. Newer requests supersede earlier ones.
    const nextImage = new Image();
    nextImage.src = study.image;
    try {
      await nextImage.decode();
    } catch {
      if (request !== requestNumber) return;
      setBusy(false);
      requestedIndex = currentIndex;
      status.textContent = 'This drawing could not be loaded. Please try another study.';
      return;
    }
    if (request !== requestNumber) return;

    await animateParts([{ opacity: 1 }, { opacity: 0 }], 120);
    if (request !== requestNumber) return;

    currentIndex = nextIndex;
    image.src = study.image;
    image.alt = study.alt;
    image.classList.toggle('engineering-image--monochrome', study.monochrome);
    counter.textContent = String(nextIndex + 1).padStart(2, '0') + ' / ' + String(studies.length).padStart(2, '0');
    gallery.querySelector('#engineering-figure').textContent = 'FIG. ' + String.fromCharCode(65 + nextIndex) + ' / ' + study.figure;
    gallery.querySelector('#engineering-view').textContent = study.view;
    gallery.querySelector('#engineering-note-a').textContent = study.notes[0];
    gallery.querySelector('#engineering-note-b').textContent = study.notes[1];
    story.querySelector('#engineering-category').textContent = study.category;
    story.querySelector('#engineering-title').textContent = study.title;
    story.querySelector('#engineering-caption').textContent = study.caption;
    const reference = gallery.querySelector('#engineering-reference');
    reference.href = study.reference;
    reference.textContent = 'REFERENCE / ' + study.referenceName + ' ↗';
    const credit = gallery.querySelector('#engineering-art-credit');
    credit.replaceChildren(document.createTextNode('DRAWING / '));
    credit.append(study.creditUrl ? creditLink(study.credit, study.creditUrl) : document.createTextNode(study.credit));
    if (study.licenseUrl) credit.append(document.createTextNode(' · '), creditLink(study.license, study.licenseUrl));
    slide.setAttribute('aria-label', `${nextIndex + 1} of ${studies.length}: ${study.title}`);
    selectors.forEach((button, i) => {
      if (i === nextIndex) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    cancelTransition();
    await animateParts([
      { opacity: 0, transform: 'translateY(5px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], 220);
    if (request !== requestNumber) return;
    cancelTransition();
    setBusy(false);
    status.textContent = `Study ${nextIndex + 1} of ${studies.length}: ${study.title}`;
  }

  gallery.querySelector('#engineering-previous').addEventListener('click', () => { void showStudy(requestedIndex - 1); });
  gallery.querySelector('#engineering-next').addEventListener('click', () => { void showStudy(requestedIndex + 1); });
  selectors.forEach(button => {
    button.addEventListener('click', () => { void showStudy(Number(button.dataset.engineeringSlide)); });
  });
  gallery.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations = { ArrowLeft: requestedIndex - 1, ArrowRight: requestedIndex + 1, Home: 0, End: studies.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    void showStudy(destinations[event.key]);
  });

  let touchStart = null;
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointercancel', () => { touchStart = null; });
  stage.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      void showStudy(requestedIndex + (dx < 0 ? 1 : -1));
    }
  });

  reserveCopySpace();
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (copy.getBoundingClientRect().width !== measuredWidth) reserveCopySpace();
    }).observe(story);
  } else {
    window.addEventListener('resize', reserveCopySpace);
  }
  if (document.fonts) {
    document.fonts.ready.then(reserveCopySpace);
    document.fonts.addEventListener('loadingdone', reserveCopySpace);
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) transitionAnimations.forEach(animation => animation.finish());
  });
  gallery.querySelector('#engineering-controls').hidden = false;
})();
