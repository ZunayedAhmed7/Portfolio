/* Mechanical split-flap animation from the approved Modern Engineer prototype.
 * Every step reveals the next stationary upper half, drops the old upper flap,
 * then unfolds the next lower flap over the old stationary lower half.
 */
(() => {
  'use strict';

  const board = document.getElementById('flight-board');
  const replay = document.getElementById('flight-flip-button');
  const caption = document.getElementById('flight-board-caption');
  const pauseButton = document.getElementById('flight-pause-button');
  const status = document.getElementById('flight-display-status');
  if (!board || !replay || !caption || !pauseButton) return;
  const display = board.closest('.flight-display');

  const alphabet = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-/';
  // One token per flag face, so each occupies one complete mechanical cell.
  const flagFaces = {
    '\uE000': { src: 'assets/flags/bangladesh.svg', width: 27, height: 16 },
    '\uE001': { src: 'assets/flags/canada.svg', width: 32, height: 16 }
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = [
    { rows: ['ZUNAYED ', 'AHMED   '], label: '01 / The Person', spoken: 'Zunayed Ahmed' },
    { rows: ['  DAC\uE000  ', ' TO YYZ\uE001'], label: '02 / The Journey', spoken: 'DAC to YYZ, Dhaka, Bangladesh to Toronto, Canada' },
    {
      rows: ['   NO   ', ' ERRORS '], label: 'Everything seems fine.', spoken: 'No errors',
      punchline: { rows: ['  ONE   ', ' ERROR  '], label: 'Found it.', spoken: 'One error' },
      setupDuration: 3000,
      holdDuration: 6000
    }
  ];
  const holdDuration = 4000; // milliseconds
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const activeAnimations = new Set();
  let stateIndex = 0;
  let busy = false;
  let paused = reducedMotion.matches;
  let boardVisible = true;
  let cycleTimer = null;

  function clearCycleTimer() {
    window.clearTimeout(cycleTimer);
    cycleTimer = null;
  }

  function canCycle() {
    return !paused && !busy && !document.hidden && boardVisible
      && board.getClientRects().length > 0
      && !display.matches(':hover') && !display.contains(document.activeElement);
  }

  function scheduleCycle() {
    clearCycleTimer();
    if (!canCycle()) return;
    cycleTimer = window.setTimeout(() => {
      cycleTimer = null;
      if (canCycle()) void showState((stateIndex + 1) % states.length, { automatic: true });
    }, states[stateIndex].holdDuration ?? holdDuration);
  }

  function updatePauseButton() {
    pauseButton.textContent = paused ? 'Resume cycling' : 'Pause cycling';
    pauseButton.setAttribute('aria-pressed', String(paused));
  }

  function half(className) {
    const leaf = document.createElement('span');
    leaf.className = 'mechanical-half ' + className;
    const glyph = document.createElement('span');
    glyph.className = 'mechanical-letter';
    glyph.textContent = '\u00a0';
    leaf.appendChild(glyph);
    return { leaf, glyph };
  }

  function makeCell(element, index) {
    const upper = half('stationary-upper');
    const lower = half('stationary-lower');
    const fallingFront = half('falling-front');
    const fallingBack = half('falling-back');
    const seam = document.createElement('span');
    seam.className = 'mechanical-seam';
    element.replaceChildren(upper.leaf, lower.leaf, fallingFront.leaf, fallingBack.leaf, seam);
    element.classList.add('mechanical-cell');
    let current = ' ';
    let faultAnimation = null;

    function setGlyph(target, character) {
      const flag = flagFaces[character];
      if (flag) {
        if (target.firstElementChild?.getAttribute('src') === flag.src) return;
        const image = new Image(flag.width, flag.height);
        image.className = 'mechanical-flag';
        image.src = flag.src;
        image.alt = '';
        image.draggable = false;
        target.replaceChildren(image);
      } else {
        target.textContent = character === ' ' ? '\u00a0' : character;
      }
    }

    function settle(character) {
      setGlyph(upper.glyph, character);
      setGlyph(lower.glyph, character);
      fallingFront.leaf.style.visibility = 'hidden';
      fallingBack.leaf.style.visibility = 'hidden';
      current = character;
    }

    async function rotate(leaf, frames, duration, easing) {
      const animation = leaf.animate(frames, { duration, easing, fill: 'forwards' });
      activeAnimations.add(animation);
      try {
        await animation.finished;
      } finally {
        activeAnimations.delete(animation);
        // Hide before removing the final animation transform to avoid a flash.
        leaf.style.visibility = 'hidden';
        animation.cancel();
      }
    }

    async function step(next, duration) {
      setGlyph(upper.glyph, next);
      setGlyph(lower.glyph, current);
      setGlyph(fallingFront.glyph, current);
      setGlyph(fallingBack.glyph, next);
      fallingFront.leaf.style.visibility = 'visible';
      fallingBack.leaf.style.visibility = 'hidden';
      await rotate(fallingFront.leaf, [
        { transform: 'rotateX(0deg)', filter: 'brightness(1)' },
        { transform: 'rotateX(-90deg)', filter: 'brightness(.55)' }
      ], duration / 2, 'cubic-bezier(.55,0,1,.45)');

      if (!reducedMotion.matches) {
        fallingBack.leaf.style.visibility = 'visible';
        await rotate(fallingBack.leaf, [
          { transform: 'rotateX(90deg)', filter: 'brightness(.55)' },
          { transform: 'rotateX(0deg)', filter: 'brightness(1)' }
        ], duration / 2, 'cubic-bezier(.12,.7,.3,1)');
      }
      settle(next);
    }

    function stopMalfunction() {
      if (!faultAnimation) return;
      fallingFront.leaf.style.visibility = 'hidden';
      faultAnimation.cancel();
      faultAnimation = null;
    }

    return {
      settle,
      stopMalfunction,
      pauseMalfunction(value) {
        if (!faultAnimation) return;
        if (value) faultAnimation.pause();
        else faultAnimation.play();
      },
      holdMalfunction() {
        if (faultAnimation && current === '?') return;
        stopMalfunction();
        settle('?');
        if (reducedMotion.matches || typeof element.animate !== 'function') return;
        setGlyph(fallingFront.glyph, current);
        fallingFront.leaf.style.visibility = 'visible';
        try {
          // Long jams alternate with uneven attempts to free the flap. Keep
          // this infinite animation separate from finite flips that can finish.
          faultAnimation = fallingFront.leaf.animate([
            { transform: 'rotateX(-68deg)', filter: 'brightness(.5)', offset: 0 },
            { transform: 'rotateX(-68deg)', filter: 'brightness(.5)', offset: .26 },
            { transform: 'translateX(-1px) rotateX(-48deg)', filter: 'brightness(.67)', offset: .3 },
            { transform: 'translateX(1px) rotateX(-83deg)', filter: 'brightness(.36)', offset: .35 },
            { transform: 'rotateX(-61deg)', filter: 'brightness(.55)', offset: .41 },
            { transform: 'rotateX(-75deg)', filter: 'brightness(.44)', offset: .46 },
            { transform: 'rotateX(-75deg)', filter: 'brightness(.44)', offset: .72 },
            { transform: 'translateX(2px) rotateX(-31deg)', filter: 'brightness(.82)', offset: .77 },
            { transform: 'translateX(-2px) rotateX(-81deg)', filter: 'brightness(.38)', offset: .82 },
            { transform: 'rotateX(-55deg)', filter: 'brightness(.6)', offset: .87 },
            { transform: 'rotateX(-68deg)', filter: 'brightness(.5)', offset: .93 },
            { transform: 'rotateX(-68deg)', filter: 'brightness(.5)', offset: 1 }
          ], { duration: 2100, iterations: Infinity, easing: 'linear' });
        } catch {
          // A static wrong face still communicates the error without motion.
          fallingFront.leaf.style.visibility = 'hidden';
        }
      },
      async malfunction() {
        if (reducedMotion.matches || typeof element.animate !== 'function') {
          // Keep the setup readable without moving a flap in reduced motion.
          await delay(1000);
          return;
        }
        // A wrong face and a deep, uneven jam make the blank corner's fault
        // visible. It remains faulty until the next display state begins.
        await step('?', 130);
        if (reducedMotion.matches) return;
        setGlyph(fallingFront.glyph, current);
        fallingFront.leaf.style.visibility = 'visible';
        await rotate(fallingFront.leaf, [
          { transform: 'rotateX(0deg)', filter: 'brightness(1)', offset: 0 },
          { transform: 'rotateX(-62deg)', filter: 'brightness(.56)', offset: .08 },
          { transform: 'translateX(-1px) rotateX(-78deg)', filter: 'brightness(.42)', offset: .14 },
          { transform: 'translateX(1px) rotateX(-49deg)', filter: 'brightness(.68)', offset: .2 },
          { transform: 'rotateX(-73deg)', filter: 'brightness(.48)', offset: .26 },
          { transform: 'rotateX(-73deg)', filter: 'brightness(.48)', offset: .4 },
          { transform: 'translateX(-2px) rotateX(-34deg)', filter: 'brightness(.8)', offset: .46 },
          { transform: 'translateX(1px) rotateX(-84deg)', filter: 'brightness(.35)', offset: .52 },
          { transform: 'rotateX(-57deg)', filter: 'brightness(.59)', offset: .58 },
          { transform: 'rotateX(-79deg)', filter: 'brightness(.41)', offset: .64 },
          { transform: 'rotateX(-79deg)', filter: 'brightness(.41)', offset: .78 },
          { transform: 'translateX(2px) rotateX(-26deg)', filter: 'brightness(.86)', offset: .84 },
          { transform: 'translateX(-1px) rotateX(-69deg)', filter: 'brightness(.5)', offset: .9 },
          { transform: 'rotateX(-8deg)', filter: 'brightness(.95)', offset: .96 },
          { transform: 'rotateX(0deg)', filter: 'brightness(1)', offset: 1 }
        ], 1050, 'linear');
      },
      async clickTo(target, { duration = 150, wait = (index % 8) * 12 } = {}) {
        if (current === target) return;
        if (reducedMotion.matches || typeof element.animate !== 'function') {
          settle(target);
          return;
        }
        // The correction is one physical click per changed cell.
        await delay(wait);
        if (reducedMotion.matches) {
          settle(target);
          return;
        }
        await step(target, duration);
      },
      prepareEntry(target) {
        if (reducedMotion.matches) {
          settle(target);
          return;
        }
        // Start each wheel a short, varied distance behind its final letter.
        // From here the reveal uses exactly the same forward travel as a click.
        const distance = 16 + (index * 3 + Math.floor(index / 8)) % 5;
        const start = (alphabet.indexOf(target) - distance + alphabet.length) % alphabet.length;
        settle(alphabet[start]);
      },
      async travelTo(target, { finishAfter = Promise.resolve() } = {}) {
        if (reducedMotion.matches || typeof element.animate !== 'function') {
          settle(target);
          return;
        }
        if (current === target) return;
        await delay((index % 8) * 18 + Math.floor(index / 8) * 54);
        const duration = 76 + (index % 3) * 5;
        // Special faces (a flag or the faulty question mark) rejoin at blank.
        if (!alphabet.includes(current) && !reducedMotion.matches) await step(' ', duration);
        if (flagFaces[target]) {
          let lettersSettled = false;
          finishAfter.then(() => { lettersSettled = true; }, () => { lettersSettled = true; });
          // Keep this wheel moving while the route settles, then hinge straight
          // from a character to the flag instead of parking on a blank face.
          do {
            if (reducedMotion.matches) break;
            await step(alphabet[(alphabet.indexOf(current) + 1) % alphabet.length], duration);
          } while (!lettersSettled || current === ' ');
          if (!reducedMotion.matches) await step(target, duration);
        } else {
          let remaining = (alphabet.indexOf(target) - alphabet.indexOf(current) + alphabet.length) % alphabet.length;
          while (remaining > 0 && !reducedMotion.matches) {
            const next = alphabet[(alphabet.indexOf(current) + 1) % alphabet.length];
            await step(next, duration);
            remaining -= 1;
          }
        }
        settle(target);
      }
    };
  }

  const cells = [...board.querySelectorAll('.flight-flap')].map(makeCell);

  function syncMalfunction() {
    cells[7].pauseMalfunction(paused || document.hidden || !boardVisible);
  }

  function setBusy(value) {
    busy = value;
    board.setAttribute('aria-busy', String(value));
    // Keep keyboard focus while ignoring activations during a sequence.
    board.setAttribute('aria-disabled', String(value));
    replay.setAttribute('aria-disabled', String(value));
    if (value) clearCycleTimer();
    else scheduleCycle();
  }

  function describeState(state) {
    caption.textContent = state.label;
    board.setAttribute('aria-label', 'Cycle the split-flap display, currently ' + state.spoken);
  }

  async function showState(index, { entry = false, automatic = false } = {}) {
    if (busy && !entry) return;
    cells[7].stopMalfunction();
    setBusy(true);
    const state = states[index];
    let finalState = state;
    const letters = state.rows.join('');
    if (entry) cells.forEach((cell, i) => cell.prepareEntry(letters[i]));
    try {
      const letterTravel = [];
      const flagTargets = [];
      cells.forEach((cell, i) => {
        const target = letters[i];
        if (flagFaces[target]) flagTargets.push({ cell, target });
        else letterTravel.push(cell.travelTo(target));
      });
      const lettersReady = Promise.all(letterTravel);
      await Promise.all([
        lettersReady,
        ...flagTargets.map(({ cell, target }) => cell.travelTo(target, { finishAfter: lettersReady }))
      ]);
      if (state.punchline) {
        describeState(state);
        const setupStarted = performance.now();
        // Keep the message legible while the blank top-right corner jams.
        await cells[7].malfunction();
        cells[7].holdMalfunction();
        syncMalfunction();
        await delay(Math.max(0, state.setupDuration - (performance.now() - setupStarted)));
        finalState = state.punchline;
        const correctedLetters = finalState.rows.join('');
        // Leave N in place; slowly change its neighbours, then drop the S.
        // The corner continues jamming throughout the gradual correction.
        await Promise.all([
          cells[4].clickTo(correctedLetters[4], { duration: 600, wait: 0 }),
          cells[2].clickTo(correctedLetters[2], { duration: 600, wait: 450 }),
          cells[14].clickTo(correctedLetters[14], { duration: 500, wait: 1000 })
        ]);
      }
    } catch {
      // If a browser interrupts its animation API, retain a legible final state.
      finalState = state.punchline || state;
      const finalLetters = finalState.rows.join('');
      cells.forEach((cell, i) => cell.settle(finalLetters[i]));
    } finally {
      stateIndex = index;
      if (state.punchline) {
        cells[7].holdMalfunction();
        syncMalfunction();
      }
      describeState(finalState);
      // Automatic rotation stays quiet for assistive technology. Only a manual
      // change announces its final state; intermediate letters are aria-hidden.
      if (status && !entry && !automatic) {
        status.textContent = finalState.spoken + (state.punchline ? '. ' + finalState.label : '');
      }
      setBusy(false);
    }
  }

  function nextState() {
    if (!busy) void showState((stateIndex + 1) % states.length);
  }
  board.addEventListener('click', nextState);
  replay.addEventListener('click', nextState);
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    updatePauseButton();
    syncMalfunction();
    scheduleCycle();
  });
  // Give a visitor time to read or operate the board without an automatic flip.
  display.addEventListener('pointerenter', clearCycleTimer);
  display.addEventListener('pointerleave', scheduleCycle);
  display.addEventListener('focusin', clearCycleTimer);
  display.addEventListener('focusout', () => { queueMicrotask(scheduleCycle); });
  document.addEventListener('visibilitychange', () => {
    syncMalfunction();
    scheduleCycle();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      boardVisible = entries[0].isIntersecting;
      syncMalfunction();
      scheduleCycle();
    }).observe(board);
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      paused = true;
      updatePauseButton();
      cells[7].stopMalfunction();
      activeAnimations.forEach(animation => animation.finish());
    } else if (!busy && states[stateIndex].punchline) {
      cells[7].holdMalfunction();
    }
    syncMalfunction();
    scheduleCycle();
  });

  // Lock immediately so early clicks cannot overlap or skip the entry reveal.
  updatePauseButton();
  setBusy(true);
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  fontsReady.then(async () => {
    await showState(0, { entry: true });
  });
})();
