(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* ---------- preloader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => $('#preloader')?.classList.add('done'), 450);
  });

  /* ---------- particles ---------- */
  const particleField = $('#particleField');
  if (particleField) {
    const count = window.innerWidth < 768 ? 45 : 85;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      spark.style.left = `${Math.random() * 100}%`;
      spark.style.top = `${Math.random() * 100}%`;
      spark.style.setProperty('--dur', `${2.5 + Math.random() * 4.5}s`);
      spark.style.setProperty('--delay', `${Math.random() * -6}s`);
      spark.style.opacity = `${0.15 + Math.random() * 0.7}`;
      frag.appendChild(spark);
    }
    particleField.appendChild(frag);
  }

  /* ---------- cursor glow ---------- */
  const cursorGlow = $('#cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  /* ---------- scroll progress ---------- */
  const progress = $('#scrollProgress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- reveal animations ---------- */
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* ---------- navigation ---------- */
  const scrollTo = (id) => $(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#startBtn')?.addEventListener('click', () => {
    startBackgroundMusic();
    scrollTo('#awal');
  });
  $('#topBtn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- background music ---------- */
  const bgMusic = $('#bgMusic');
  const musicBtn = $('#musicBtn');
  if (bgMusic) bgMusic.volume = 0.16;

  const updateMusicButton = () => {
    if (!musicBtn || !bgMusic) return;
    const icon = $('i', musicBtn);
    const playing = !bgMusic.paused;
    musicBtn.classList.toggle('playing', playing);
    musicBtn.setAttribute('aria-label', playing ? 'Matikan musik' : 'Nyalakan musik');
    if (icon) icon.className = playing ? 'bi bi-volume-up' : 'bi bi-music-note-beamed';
  };

  const startBackgroundMusic = () => {
    if (!bgMusic) return;
    bgMusic.play().then(updateMusicButton).catch(updateMusicButton);
  };

  musicBtn?.addEventListener('click', () => {
    if (!bgMusic) return;
    if (bgMusic.paused) startBackgroundMusic();
    else bgMusic.pause();
  });
  bgMusic?.addEventListener('play', updateMusicButton);
  bgMusic?.addEventListener('pause', updateMusicButton);

  /* ---------- small memory replay ---------- */
  const memoryReplay = $('#memoryReplay');
  const memoryMessages = {
    kopi: 'Malam-malam di Kopi Kenangan: sederhana, ramai, kadang terlalu larut, tapi entah kenapa selalu terasa kurang kalau belum bersama.',
    game: 'Discord, Roblox, Minecraft. Permainan mungkin selesai, tetapi obrolan kita justru terus berjalan.',
    subuh: 'Dari layar permainan ke telepon WhatsApp. Yang awalnya sebentar, berubah menjadi cerita panjang sampai malam berganti pagi.'
  };

  /* ---------- generic memory cards ---------- */
  $$('.memory-card').forEach((card) => {
    const toggle = () => card.classList.toggle('active');
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });

  /* ---------- letter open/close ---------- */
  const envelope = $('#envelope');
  const letterSheet = $('#letterSheet');
  const openLetter = $('#openLetter');
  const closeLetter = $('#closeLetter');
  const seal = $('#seal');
  const letterReader = $('.letter-reader');

  const openEnvelope = () => {
    envelope?.classList.add('open');
    letterReader?.classList.add('letter-opened');
    openLetter?.classList.add('d-none');
    closeLetter?.classList.remove('d-none');
  };

  const closeEnvelope = () => {
    envelope?.classList.remove('open');
    letterReader?.classList.remove('letter-opened');
    closeLetter?.classList.add('d-none');
    openLetter?.classList.remove('d-none');
  };

  openLetter?.addEventListener('click', openEnvelope);
  closeLetter?.addEventListener('click', closeEnvelope);
  seal?.addEventListener('click', openEnvelope);

  /* ---------- image modal ---------- */
  const modalImage = $('#modalImage');
  $('#imageModal')?.addEventListener('hidden.bs.modal', () => modalImage?.removeAttribute('src'));

  /* ---------- synced voice letter ---------- */
  const voice = $('#voiceAudio');
  const playOrb = $('#voicePlayOrb');
  const voiceWave = $('#voiceWave');
  const voiceSeek = $('#voiceSeek');
  const voiceStatus = $('#voiceStatus');
  const voiceTime = $('#voiceTime');
  const voicePercent = $('#voicePercent');
  const readerStatus = $('#letterReaderStatus');
  const readLetter = $('#readLetter');
  const paragraphs = $$('.sync-paragraph', $('#poemSync') || document);

  // The automatic timing is intentionally based on word count so it adapts
  // to the actual length of the user's recording. Exact timestamps can later
  // be added per paragraph if the user wants frame-accurate sync.
  // Waktu mulai tiap kata (detik) dari rekamanmu, dicocokkan lewat transkripsi + jeda bicara.
  const VOICE_CUES = {"title": [0.0, 0.54], "name": [1.65, 2.9], "words": [4.12, 4.46, 4.78, 5.58, 5.78, 6.16, 6.54, 7.1, 7.31, 7.91, 9.41, 9.64, 10.09, 10.51, 10.96, 11.37, 11.81, 12.65, 12.89, 15.12, 15.32, 15.64, 16.26, 16.87, 17.02, 18.63, 19.13, 19.61, 20.08, 20.62, 22.62, 23.21, 23.59, 23.8, 24.22, 25.65, 26.12, 26.77, 27.24, 27.88, 29.09, 29.71, 30.13, 30.75, 33.57, 33.89, 34.07, 34.44, 34.98, 36.2, 36.54, 36.87, 37.22, 37.73, 38.39, 38.59, 40.7, 41.02, 41.38, 41.74, 42.3, 42.66, 43.02, 44.67, 45.09, 45.76, 46.4, 46.63, 47.3, 47.75, 48.17, 48.8, 49.22, 51.11, 51.29, 51.77, 52.27, 52.75, 53.25, 53.41, 53.75, 53.94, 54.29, 54.61, 55.11, 55.43, 55.77, 58.64, 58.83, 59.18, 59.71, 60.06, 61.53, 61.96, 62.87, 63.74, 64.62, 65.06, 65.33, 67.4, 67.7, 67.88, 68.06, 68.4, 69.09, 69.43, 70.44, 71.02, 71.44, 73.09, 73.45, 73.85, 74.66, 75.06, 75.48, 76.26, 76.48, 77.28, 77.53, 78.42, 81.02, 81.39, 82.0, 83.53, 83.87, 84.38, 85.82, 86.13, 86.62, 86.8, 87.16, 87.62, 87.94, 88.99, 89.48, 89.97, 90.63, 90.95, 91.15, 91.33, 93.47, 93.86, 94.24, 95.72, 96.02, 96.36, 96.69, 97.03, 97.51, 99.48, 100.0, 100.48, 101.3, 101.64, 101.97, 102.47, 102.95, 105.42, 105.58, 105.86, 106.17, 106.46, 106.76, 108.14, 108.49, 109.0, 110.07, 110.54, 111.62, 111.99, 112.53, 113.08, 113.44, 114.01, 115.37, 116.12, 116.56, 116.86, 117.19, 117.33, 119.0, 119.67, 120.14, 120.86, 121.35], "end": 122.06};
  let wordMap = [];
  let totalWords = 0;
  let audioDuration = 0;
  let manualMode = false;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const wrapWords = () => {
    wordMap = [];
    totalWords = 0;

    paragraphs.forEach((paragraph, pIndex) => {
      const original = paragraph.textContent.trim();
      paragraph.dataset.paragraphIndex = pIndex;
      paragraph.innerHTML = '';

      const words = original.split(/(\s+)/);
      words.forEach((token) => {
        if (/\s+/.test(token)) {
          paragraph.appendChild(document.createTextNode(token));
          return;
        }
        const span = document.createElement('span');
        span.className = 'sync-word';
        span.textContent = token;
        span.dataset.wordIndex = totalWords;
        paragraph.appendChild(span);
        wordMap.push({ span, paragraph: pIndex });
        totalWords += 1;
      });
    });

    paragraphs.forEach((p, index) => {
      if (index === 0 && manualMode) p.classList.add('revealed');
      else p.classList.add('locked');
    });
  };

  wrapWords();

  const resetWordState = () => {
    wordMap.forEach(({ span }) => span.classList.remove('revealed', 'active'));
    paragraphs.forEach((p) => {
      p.classList.remove('revealed', 'active');
      p.classList.add('locked');
    });
  };

  const revealAll = () => {
    manualMode = true;
    letterSheet?.classList.add('bare');
    paragraphs.forEach((p) => {
      p.classList.remove('locked');
      p.classList.add('revealed');
    });
    wordMap.forEach(({ span }) => span.classList.add('revealed'));
    if (voiceStatus) voiceStatus.textContent = 'mode baca sendiri';
    if (readerStatus) readerStatus.textContent = 'baca sendiri';
  };

  const updateReading = () => {
    if (!voice || !audioDuration || !totalWords) return;

    const now = voice.currentTime;
    const ratio = Math.min(1, Math.max(0, now / audioDuration));
    // waktu tiap kata diambil dari rekamanmu (VOICE_CUES); kalau tidak cocok, kembali ke hitungan rata
    let currentWord = Math.min(totalWords - 1, Math.floor(ratio * totalWords));
    if (VOICE_CUES.words.length === totalWords) {
      currentWord = -1;
      for (let i = totalWords - 1; i >= 0; i -= 1) {
        if (VOICE_CUES.words[i] - 0.05 <= now) { currentWord = i; break; }
      }
    }
    const speaking = !voice.paused && !manualMode;
    $('#letterTitle')?.classList.toggle('speaking', speaking && now < VOICE_CUES.title[1] + 0.35);
    $('#letterTo')?.classList.toggle('speaking', speaking && now >= VOICE_CUES.name[0] - 0.1 && now < VOICE_CUES.name[1] + 0.3);

    wordMap.forEach(({ span, paragraph, }, index) => {
      const revealed = index <= currentWord;
      span.classList.toggle('revealed', revealed);
      span.classList.toggle('active', index === currentWord && !manualMode);
      const p = paragraphs[paragraph];
      if (p) {
        p.classList.toggle('locked', !revealed);
        p.classList.toggle('revealed', revealed);
        p.classList.toggle('active', paragraph === wordMap[currentWord]?.paragraph);
      }
    });

    if (voiceSeek) voiceSeek.value = (ratio * 100).toFixed(2);
    if (voicePercent) voicePercent.textContent = `${Math.round(ratio * 100)}%`;
    if (voiceTime) voiceTime.textContent = `${formatTime(voice.currentTime)} / ${formatTime(audioDuration)}`;

    const active = wordMap[currentWord]?.paragraph ?? 0;
    const activeParagraph = paragraphs[active];
    const poemBox = $('#poemSync');
    if (activeParagraph && poemBox && !manualMode) {
      // geser isi surat saja; scrollIntoView ikut menyeret seluruh halaman
      const top = activeParagraph.offsetTop;
      const bottom = top + activeParagraph.offsetHeight;
      if (top < poemBox.scrollTop + 8 || bottom > poemBox.scrollTop + poemBox.clientHeight - 8) {
        poemBox.scrollTo({ top: Math.max(0, top - 12), behavior: 'smooth' });
      }
    }
  };

  const updateVoiceUI = () => {
    if (!voice) return;
    const playing = !voice.paused;
    playOrb?.classList.toggle('playing', playing);
    voiceWave?.classList.toggle('playing', playing);
    letterReader?.classList.toggle('playing', playing);
    if (playOrb) {
      const icon = $('i', playOrb);
      if (icon) icon.className = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';
      playOrb.setAttribute('aria-label', playing ? 'Jeda suara' : 'Putar suara');
    }
    if (readerStatus) readerStatus.textContent = playing ? 'sedang dibacakan' : (voice.currentTime > 0 ? 'dijeda' : 'siap dibacakan');
    if (voiceStatus && voice.error) voiceStatus.textContent = 'voice.mp3 belum ditemukan';
  };

  const startVoice = () => {
    if (!voice) return;
    manualMode = false;
    letterSheet?.classList.remove('bare');
    openEnvelope();
    voice.play().then(updateVoiceUI).catch(() => {
      if (voiceStatus) voiceStatus.textContent = 'Masukkan voice.mp3 ke assets/audio/';
      updateVoiceUI();
    });
  };

  playOrb?.addEventListener('click', () => {
    if (!voice) return;
    if (voice.paused) startVoice();
    else voice.pause();
  });

  playOrb?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      playOrb.click();
    }
  });

  voice?.addEventListener('loadedmetadata', () => {
    audioDuration = Number.isFinite(voice.duration) ? voice.duration : 0;
    if (voiceTime) voiceTime.textContent = `00:00 / ${formatTime(audioDuration)}`;
    if (voiceSeek) voiceSeek.value = '0';
  });

  voice?.addEventListener('timeupdate', updateReading);
  voice?.addEventListener('play', updateVoiceUI);
  voice?.addEventListener('pause', updateVoiceUI);
  voice?.addEventListener('error', () => {
    if (voiceStatus) voiceStatus.textContent = 'Masukkan voice.mp3 ke assets/audio/ agar surat bisa dibacakan.';
    updateVoiceUI();
  });

  voice?.addEventListener('ended', () => {
    wordMap.forEach(({ span }) => {
      span.classList.add('revealed');
      span.classList.remove('active');
    });
    paragraphs.forEach((p) => {
      p.classList.remove('locked', 'active');
      p.classList.add('revealed');
    });
    if (voiceSeek) voiceSeek.value = '100';
    if (voicePercent) voicePercent.textContent = '100%';
    if (voiceTime) voiceTime.textContent = `${formatTime(audioDuration)} / ${formatTime(audioDuration)}`;
    if (voiceStatus) voiceStatus.textContent = 'selesai dibacakan';
    if (readerStatus) readerStatus.textContent = 'surat selesai dibacakan';
    updateVoiceUI();
  });

  voiceSeek?.addEventListener('input', () => {
    if (!voice || !audioDuration) return;
    voice.currentTime = (Number(voiceSeek.value) / 100) * audioDuration;
    manualMode = false;
    letterSheet?.classList.remove('bare');
    updateReading();
  });

  readLetter?.addEventListener('click', () => {
    revealAll();
    openEnvelope();
  });

  /* ---------- active nav ---------- */
  const navLinks = $$('.floating-nav a[data-section]');
  const sectionIds = navLinks.map((link) => link.dataset.section);
  const observedSections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === entry.target.id));
      });
    }, { rootMargin: '-44% 0px -46% 0px', threshold: 0 });
    observedSections.forEach((section) => navObserver.observe(section));
  }

  /* ---------- 3D tilt ---------- */
  if (window.matchMedia('(pointer:fine)').matches) {
    $$('.twist-card, .night-card, .faith-card, .voice-dock').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1100px) rotateX(${(-y * 2.4).toFixed(2)}deg) rotateY(${(x * 2.4).toFixed(2)}deg)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* =========================================================
     V7 — PERLAHAN: bab horizontal + jalur rasi bintang
  ========================================================= */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointerDevice = window.matchMedia('(pointer:fine)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /* ---------- ledakan hati & bintang kecil ---------- */
  const fxLayer = document.createElement('div');
  fxLayer.className = 'fx-layer';
  fxLayer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fxLayer);

  const burst = (x, y, count = 9) => {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const bit = document.createElement('i');
      const angle = Math.random() * Math.PI * 2;
      const dist = 38 + Math.random() * 72;
      bit.className = `fx-bit bi ${Math.random() < 0.55 ? 'bi-heart-fill' : 'bi-stars'}`;
      bit.style.cssText = [
        `left:${x}px`, `top:${y}px`,
        `--dx:${(Math.cos(angle) * dist).toFixed(1)}px`,
        `--dy:${(Math.sin(angle) * dist - 28).toFixed(1)}px`,
        `--rot:${((Math.random() - 0.5) * 90).toFixed(0)}deg`,
        `--s:${(0.65 + Math.random() * 0.85).toFixed(2)}`,
        `--dur:${(0.9 + Math.random() * 0.7).toFixed(2)}s`
      ].join(';');
      fxLayer.appendChild(bit);
      bit.addEventListener('animationend', () => bit.remove(), { once: true });
    }
  };

  // Hanya elemen yang memang untuk disentuh, supaya saat membaca tidak terganggu.
  document.addEventListener('click', (event) => {
    const hit = event.target.closest?.('.chapter-node, .chapter-visual, .memory-orb, .memory-card, .env-seal, .gal-item, .gal-tab, #startBtn');
    if (!hit) return;
    let x = event.clientX;
    let y = event.clientY;
    if (!x && !y) { // klik dari keyboard
      const r = hit.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    burst(x, y, hit.matches('.chapter-node') ? 7 : 9);
  });

  /* ---------- bintang jatuh di kartu malam ---------- */
  const nightCard = $('.night-card');
  nightCard?.addEventListener('click', () => {
    if (reduceMotion) return;
    const star = document.createElement('span');
    star.className = 'shoot';
    star.style.setProperty('--sx', `${8 + Math.random() * 38}%`);
    star.style.setProperty('--sy', `${6 + Math.random() * 24}%`);
    nightCard.appendChild(star);
    star.addEventListener('animationend', () => star.remove(), { once: true });
  });

  /* ---------- bab horizontal ---------- */
  const chaptersRoot = $('#chapters');
  if (chaptersRoot) {
    const track = $('#chapterTrack');
    const slides = $$('.chapter', track);
    const nodes = $$('.chapter-node', chaptersRoot);
    const pathBox = $('#chapterPath');
    const svg = $('.chapter-path-svg', pathBox);
    const baseLine = $('.path-base', svg);
    const litLine = $('.path-lit', svg);
    const spark = $('.path-spark', svg);
    const sparkGlow = $('.path-spark-glow', svg);
    const prevBtn = $('#chapterPrev');
    const nextBtn = $('#chapterNext');
    const total = slides.length;

    let current = 0;
    let nodeLens = [0];
    let pathLen = 0;
    let frame = 0;
    let hintOn = true;
    let inView = false;

    const stride = () => (total > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
    const target = (i) => slides[i].offsetLeft + slides[i].offsetWidth / 2 - track.clientWidth / 2;

    const stopHint = () => {
      if (!hintOn) return;
      hintOn = false;
      nextBtn?.classList.remove('nudge');
    };

    const goTo = (index, instant = false) => {
      const i = clamp(index, 0, total - 1);
      track.scrollTo({ left: target(i), behavior: instant || reduceMotion ? 'auto' : 'smooth' });
      stopHint();
    };

    /* jalur: kurva halus melewati titik-titik */
    const buildPath = () => {
      const box = pathBox.getBoundingClientRect();
      if (!box.width) return;
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      const pts = nodes.map((node) => {
        const r = node.getBoundingClientRect();
        return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2];
      });
      const f = (n) => n.toFixed(1);
      const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      probe.setAttribute('fill', 'none');
      probe.style.visibility = 'hidden';
      svg.appendChild(probe);

      let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
      nodeLens = [0];
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`;
        probe.setAttribute('d', d);
        nodeLens.push(probe.getTotalLength());
      }
      probe.remove();

      baseLine.setAttribute('d', d);
      litLine.setAttribute('d', d);
      pathLen = nodeLens[nodeLens.length - 1];
      litLine.style.strokeDasharray = `${pathLen} ${pathLen}`;
    };

    /* sinkronkan semuanya dengan posisi geser */
    const paint = () => {
      frame = 0;
      const left = track.scrollLeft;
      const step = stride() || 1;
      const center = left + track.clientWidth / 2;

      // baca dulu semua, baru tulis (hindari layout thrash)
      const dists = slides.map((slide) => Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center) / step);
      const progress = clamp((left - target(0)) / step, 0, total - 1);
      let nearest = 0;
      dists.forEach((d, i) => { if (d < dists[nearest]) nearest = i; });

      slides.forEach((slide, i) => {
        slide.style.setProperty('--k', clamp(dists[i], 0, 1).toFixed(3));
        slide.classList.toggle('is-active', i === nearest);
        slide.setAttribute('aria-hidden', i === nearest ? 'false' : 'true');
      });
      nodes.forEach((node, i) => {
        node.classList.toggle('is-active', i === nearest);
        node.classList.toggle('is-passed', i < nearest);
        if (i === nearest) node.setAttribute('aria-current', 'step');
        else node.removeAttribute('aria-current');
      });
      if (prevBtn) prevBtn.disabled = nearest === 0;
      if (nextBtn) nextBtn.disabled = nearest === total - 1;
      if (nearest !== 0) stopHint();
      current = nearest;


      if (pathLen) {
        const lo = Math.floor(progress);
        const hi = Math.min(total - 1, lo + 1);
        const len = nodeLens[lo] + (nodeLens[hi] - nodeLens[lo]) * (progress - lo);
        litLine.style.strokeDashoffset = (pathLen - len).toFixed(2);
        const pt = litLine.getPointAtLength(len);
        [spark, sparkGlow].forEach((c) => { c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); });
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

    track.addEventListener('scroll', schedule, { passive: true });

    /* klik titik / panah / bab di samping */
    nodes.forEach((node, i) => node.addEventListener('click', () => goTo(i)));
    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    /* seret dengan mouse (sentuhan & trackpad sudah native) */
    let drag = null;
    let dragMoved = false;
    let settleTimer = 0;

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragMoved = false;
      drag = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, lastX: event.clientX, lastT: event.timeStamp, v: 0, active: false, startIndex: current };
    });

    window.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      if (!drag.active) {
        if (Math.abs(dx) < 5) return;
        drag.active = true;
        dragMoved = true;
        clearTimeout(settleTimer);
        track.classList.remove('is-settling');
        track.classList.add('is-dragging');
        try { track.setPointerCapture(event.pointerId); } catch (error) { /* abaikan */ }
        stopHint();
      }
      const dt = Math.max(1, event.timeStamp - drag.lastT);
      drag.v = (event.clientX - drag.lastX) / dt;
      drag.lastX = event.clientX;
      drag.lastT = event.timeStamp;
      track.scrollLeft = drag.left - dx;
    });

    const endDrag = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { active, v, lastT, startIndex, x } = drag;
      drag = null;
      if (!active) return;
      const flick = event.timeStamp - lastT < 90 ? v : 0; // berhenti dulu sebelum lepas = bukan lemparan
      const moved = event.clientX - x;
      // pindah bab kalau dilempar cukup cepat ATAU diseret lebih dari ~22% lebar bab
      let direction = 0;
      if (Math.abs(flick) > 0.45) direction = flick < 0 ? 1 : -1;
      else if (Math.abs(moved) > stride() * 0.22) direction = moved < 0 ? 1 : -1;
      const index = direction ? clamp(startIndex + direction, 0, total - 1) : current;
      track.classList.remove('is-dragging');
      track.classList.add('is-settling');
      goTo(index);
      settleTimer = setTimeout(() => track.classList.remove('is-settling'), 800);
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // setelah menyeret, jangan anggap itu klik
    track.addEventListener('click', (event) => {
      if (!dragMoved) return;
      event.stopPropagation();
      event.preventDefault();
      dragMoved = false;
    }, true);

    slides.forEach((slide, i) => slide.addEventListener('click', () => {
      if (i !== current) goTo(i);
    }));

    /* keyboard: panah kiri/kanan (saat bagian ini terlihat atau track difokus) */
    const onKey = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
      if (event.key === 'ArrowRight') goTo(current + 1);
      else if (event.key === 'ArrowLeft') goTo(current - 1);
      else if (event.key === 'Home' && event.target === track) goTo(0);
      else if (event.key === 'End' && event.target === track) goTo(total - 1);
      else return;
      event.preventDefault();
    };
    track.addEventListener('keydown', onKey);
    document.addEventListener('keydown', (event) => {
      if (inView && event.target !== track) onKey(event);
    });

    if ('IntersectionObserver' in window) {
      const viewObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.5 });
      viewObserver.observe(chaptersRoot);
    }

    /* bola-bola mengikuti gerak kursor sedikit */
    if (finePointerDevice && !reduceMotion) {
      $$('.chapter-visual', track).forEach((visual) => {
        visual.addEventListener('pointermove', (event) => {
          const r = visual.getBoundingClientRect();
          visual.style.setProperty('--px', (((event.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
          visual.style.setProperty('--py', (((event.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
          visual.style.setProperty('--mx', `${(event.clientX - r.left).toFixed(0)}px`);
          visual.style.setProperty('--my', `${(event.clientY - r.top).toFixed(0)}px`);
        });
        visual.addEventListener('pointerleave', () => {
          visual.style.setProperty('--px', '0');
          visual.style.setProperty('--py', '0');
        });
      });
    }

    /* inisialisasi & saat ukuran layar berubah */
    const layout = () => {
      buildPath();
      track.scrollTo({ left: target(current), behavior: 'auto' });
      paint();
    };
    nextBtn?.classList.add('nudge');
    layout();
    window.addEventListener('load', layout);
    document.fonts?.ready.then(layout);
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(chaptersRoot);
    else window.addEventListener('resize', layout);
  }

  /* =========================================================
     V8 — AWAL: malam yang bisa digeser
     p = 0 (Kopi Kenangan) → 0.5 (Roblox & Minecraft) → 1 (Sampai subuh)
  ========================================================= */
  const nightSvg = $('#nightScene');
  if (nightSvg) {
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs, parent) => {
      const el = document.createElementNS(NS, tag);
      Object.keys(attrs || {}).forEach((key) => el.setAttribute(key, attrs[key]));
      if (parent) parent.appendChild(el);
      return el;
    };
    // angka acak yang selalu sama, supaya kota tidak berubah tiap dimuat
    const seeded = (seed) => () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const rand = seeded(11);
    const f1 = (n) => n.toFixed(1);

    /* ---------- bintang & penanda jam di lintasan bulan ---------- */
    const starsG = $('#nsStars');
    const starCount = window.innerWidth < 768 ? 30 : 44;
    for (let i = 0; i < starCount; i++) {
      mk('circle', {
        cx: f1(rand() * 400), cy: f1(8 + rand() * 250), r: (0.6 + rand() * 1.0).toFixed(2),
        class: 'ns-star', style: `--d:${(2.6 + rand() * 4).toFixed(1)}s;--l:${(-rand() * 6).toFixed(1)}s`
      }, starsG);
    }
    const arcPoint = (p) => [64 + 272 * p, 300 - 600 * p * (1 - p)];
    const ticksG = $('#nsTicks');
    for (let k = 0; k <= 6; k++) {
      const [x, y] = arcPoint(k / 6);
      mk('circle', { cx: f1(x), cy: f1(y), r: 1.7, class: 'ns-tick' }, ticksG);
    }

    /* ---------- kota: lapisan jauh + dekat, jendela yang mati satu per satu ---------- */
    const farG = $('#nsFar');
    const nearG = $('#nsNear');
    const windows = [];
    const layer = (parent, o) => {
      let x = o.x0;
      while (x < 412) {
        const w = o.minW + rand() * (o.maxW - o.minW);
        const h = o.minH + rand() * (o.maxH - o.minH);
        mk('rect', { x: f1(x), y: f1(o.base - h), width: f1(w), height: f1(h + 2), fill: o.fill }, parent);
        if (o.windows) {
          const cols = Math.floor((w - 6) / 9);
          const rows = Math.floor((h - 10) / 13);
          for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
              if (rand() < 0.3) continue;
              const el = mk('rect', { x: f1(x + 5 + c * 9), y: f1(o.base - h + 8 + r * 13), width: 4, height: 6, rx: 0.6, class: 'ns-win' }, parent);
              windows.push({ el, t: rand() < 0.5 ? 0.08 + rand() * 0.45 : 0.5 + rand() * 0.45, on: null, x: x + 5 + c * 9, y: o.base - h + 8 + r * 13 });
            }
          }
        }
        x += w + 1 + rand() * 5;
      }
    };
    layer(farG, { x0: -8, base: 384, minW: 26, maxW: 44, minH: 54, maxH: 112, fill: '#1e1132' });
    layer(nearG, { x0: -14, base: 384, minW: 34, maxW: 56, minH: 40, maxH: 92, fill: '#0e0714', windows: true });

    // satu jendela yang tidak pernah padam, sampai subuh
    let home = null;
    windows.forEach((w) => {
      const d = Math.hypot(w.x - 272, w.y - 338);
      if (!home || d < home.d) home = { w, d };
    });
    if (home) {
      const { w } = home;
      w.t = 9;
      w.el.setAttribute('class', 'ns-win ns-home');
      w.el.setAttribute('width', 7); w.el.setAttribute('height', 9);
      const halo = mk('circle', { cx: f1(w.x + 3.5), cy: f1(w.y + 4.5), r: 24, fill: 'url(#nsGlowWarm)', class: 'ns-home-halo' });
      nearG.insertBefore(halo, w.el);
    }

    /* ---------- balok yang disusun berdua ---------- */
    const blkG = $('#nsBlk');
    const pinks = ['#f0b0d7', '#e79cc8', '#f6c3e0'];
    const purples = ['#a88de4', '#9a7fd8', '#bba6ee'];
    const cells = [
      [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
      [0, 1], [1, 1], [4, 1], [5, 1],
      [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
      [1, 3], [2, 3], [3, 3], [4, 3],
      [2, 4], [3, 4]
    ];
    mk('rect', { class: 'ns-door', x: -20, y: -40, width: 40, height: 20, fill: '#ffd9a8' }, blkG);
    cells.forEach(([col, row]) => {
      const g = mk('g', { class: 'ns-blk', style: `--i:${row * 3 + Math.min(col, 5 - col)}` }, blkG);
      const pal = col < 3 ? pinks : purples;
      mk('rect', { x: -60 + col * 20, y: -(row + 1) * 20, width: 20, height: 20, fill: pal[(row + col) % 3], stroke: '#2a1230', 'stroke-opacity': 0.35, 'stroke-width': 1 }, g);
      mk('rect', { x: -60 + col * 20 + 1, y: -(row + 1) * 20 + 1, width: 18, height: 4, fill: '#fff', 'fill-opacity': 0.3 }, g);
    });

    /* ---------- gelombang suara di layar telepon ---------- */
    const barsG = $('#nsBars');
    for (let i = 0; i < 7; i++) {
      const h = [14, 26, 38, 46, 34, 22, 12][i];
      mk('rect', {
        class: 'ns-bar', x: -17.5 + i * 5.4, y: -22 - h, width: 3, height: h, rx: 1.5,
        style: `--d:${(0.8 + rand() * 0.7).toFixed(2)}s;--l:${(-rand()).toFixed(2)}s`
      }, barsG);
    }

    /* ---------- render satu keadaan malam ---------- */
    const el = {
      dusk: $('#nsDuskRect'), dawn: $('#nsDawnRect'), stars: starsG, moon: $('#nsMoon'),
      cup: $('#nsCup'), blk: blkG, ph: $('#nsPhone'),
      gCup: $('#nsGlowCup'), gBlk: $('#nsGlowBlk'), gPh: $('#nsGlowPh'),
      card: $('#nightCard'), clock: $('#nightClock'), track: $('#scrubTrack'), knob: $('#scrubKnob')
    };
    const T0 = 21 * 60 + 15;   // 09:15 PM
    const T1 = 27 * 60 + 47;   // 03:47 AM
    const pad = (n) => String(n).padStart(2, '0');
    const clockText = (p) => {
      const m = Math.round(T0 + (T1 - T0) * p) % 1440;
      const h24 = Math.floor(m / 60);
      return `${pad(h24 % 12 || 12)}:${pad(m % 60)} ${h24 >= 12 ? 'PM' : 'AM'}`;
    };
    const prop = (w) => clamp((w - 0.3) * 2.8, 0, 1);
    let lastClock = '';
    let sceneNow = -1;

    const render = (p) => {
      const w0 = clamp(1 - p / 0.5, 0, 1);
      const w1 = clamp(1 - Math.abs(p - 0.5) / 0.5, 0, 1);
      const w2 = clamp((p - 0.5) / 0.5, 0, 1);

      el.dusk.style.opacity = (0.95 * w0).toFixed(3);
      el.dawn.style.opacity = w2.toFixed(3);
      el.stars.style.opacity = clamp(0.38 + 0.62 * w1 + 0.25 * w2, 0, 1).toFixed(3);
      const [mx, my] = arcPoint(p);
      el.moon.setAttribute('transform', `translate(${f1(mx)} ${f1(my)})`);

      el.cup.style.opacity = prop(w0).toFixed(3);
      el.blk.style.opacity = prop(w1).toFixed(3);
      el.ph.style.opacity = prop(w2).toFixed(3);
      el.gCup.style.opacity = prop(w0).toFixed(3);
      el.gBlk.style.opacity = prop(w1).toFixed(3);
      el.gPh.style.opacity = prop(w2).toFixed(3);

      windows.forEach((w) => {
        const on = p < w.t;
        if (on !== w.on) { w.on = on; w.el.classList.toggle('on', on); }
      });

      const text = clockText(p);
      if (text !== lastClock) { lastClock = text; el.clock.textContent = text; }
      el.card.style.setProperty('--quote', clamp((p - 0.62) / 0.34, 0, 1).toFixed(3));
      el.track.style.setProperty('--p', p.toFixed(4));

      const scene = p < 0.25 ? 0 : p < 0.75 ? 1 : 2;
      if (scene !== sceneNow) { sceneNow = scene; nightSvg.setAttribute('data-scene', scene); }
    };

    /* ---------- gerak: geser halus antar titik ---------- */
    const stops = [0, 0.5, 1];
    const keys = ['kopi', 'game', 'subuh'];
    const orbs = $$('.memory-orb');
    let p = 0;
    let raf = 0;
    let dragging = false;
    let activeStop = -1;
    let manualY = null; // posisi scroll saat terakhir memilih sendiri; cerita baru mengambil alih setelah digulir cukup jauh

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const animateTo = (to) => {
      cancelAnimationFrame(raf);
      if (reduceMotion) { p = to; render(p); return; }
      const from = p;
      const dur = 650 + Math.abs(to - from) * 1300;
      const t0 = performance.now();
      const tick = (now) => {
        const k = clamp((now - t0) / dur, 0, 1);
        p = from + (to - from) * ease(k);
        render(p);
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const say = (text) => {
      if (!memoryReplay) return;
      memoryReplay.classList.remove('flash');
      void memoryReplay.offsetWidth;
      memoryReplay.textContent = text;
      memoryReplay.classList.add('flash');
    };
    const markStop = (i) => {
      if (i === activeStop) return;
      const first = activeStop === -1;
      activeStop = i;
      orbs.forEach((orb, idx) => {
        orb.classList.toggle('active', idx === i);
        orb.setAttribute('aria-pressed', idx === i ? 'true' : 'false');
      });
      el.knob.setAttribute('aria-valuenow', i);
      el.knob.setAttribute('aria-valuetext', orbs[i] ? orbs[i].textContent.trim() : '');
      if (!first) say(memoryMessages[keys[i]] || '');
    };
    const goStop = (i) => {
      const k = clamp(i, 0, stops.length - 1);
      markStop(k);
      animateTo(stops[k]);
    };

    orbs.forEach((orb, i) => orb.addEventListener('click', () => { el.knob.classList.remove('nudge'); manualY = window.scrollY; goStop(i); }));

    /* seret gagang (atau ketuk di mana saja pada garis) */
    const track = el.track;
    const pFrom = (event) => {
      const r = track.getBoundingClientRect();
      return clamp((event.clientX - r.left) / r.width, 0, 1);
    };
    track.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      dragging = true;
      manualY = window.scrollY;
      cancelAnimationFrame(raf);
      el.knob.classList.remove('nudge');
      try { track.setPointerCapture(event.pointerId); } catch (error) { /* abaikan */ }
      p = pFrom(event);
      render(p);
      markStop(p < 0.25 ? 0 : p < 0.75 ? 1 : 2);
      event.preventDefault();
    });
    track.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      p = pFrom(event);
      render(p);
      markStop(p < 0.25 ? 0 : p < 0.75 ? 1 : 2);
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      goStop(p < 0.25 ? 0 : p < 0.75 ? 1 : 2);
    };
    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
    el.knob.addEventListener('keydown', (event) => {
      const map = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };
      manualY = window.scrollY;
      if (event.key in map) { event.preventDefault(); el.knob.classList.remove('nudge'); goStop(activeStop + map[event.key]); }
      else if (event.key === 'Home') { event.preventDefault(); goStop(0); }
      else if (event.key === 'End') { event.preventDefault(); goStop(2); }
    });

    /* ---------- cerita menyalakan malam: paragraf yang sedang dibaca menentukan suasana ---------- */
    const beats = $$('.beat');
    const story = $('#awalStory');
    const awalSection = $('#awal');
    let sectionVisible = false;
    let ticking = false;

    const sync = () => {
      ticking = false;
      const mid = window.innerHeight * 0.5;
      let best = 0;
      let bestD = Infinity;
      beats.forEach((beat, i) => {
        const r = beat.getBoundingClientRect();
        const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (d < bestD) { bestD = d; best = i; }
      });
      beats.forEach((beat, i) => beat.classList.toggle('is-on', i === best));
      const scene = Number(beats[best].dataset.scene);
      const scrolledAway = manualY === null || Math.abs(window.scrollY - manualY) > 160;
      if (!dragging && scrolledAway && scene !== activeStop) { manualY = null; goStop(scene); }
      const sr = story.getBoundingClientRect();
      story.style.setProperty('--read', clamp((mid - sr.top) / sr.height, 0, 1).toFixed(3));
    };
    const requestSync = () => {
      if (ticking || !sectionVisible) return;
      ticking = true;
      requestAnimationFrame(sync);
    };
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);
    if ('IntersectionObserver' in window && awalSection) {
      new IntersectionObserver(([entry]) => { sectionVisible = entry.isIntersecting; if (sectionVisible) requestSync(); }, { rootMargin: '120px 0px' }).observe(awalSection);
    } else {
      sectionVisible = true;
    }

    markStop(0);
    render(0);
    requestSync();
  }

  /* =========================================================
     V9 — GALERI: dua dunia dalam satu rel + lightbox
  ========================================================= */
  const galTrack = $('#galTrack');
  if (galTrack) {
    const items = $$('.gal-item', galTrack);
    const tabs = $$('.gal-tab');
    const barEl = $('#galBar');
    const nowEl = $('#galNow');
    const prevBtn = $('#galPrev');
    const nextBtn = $('#galNext');
    const total = items.length;
    const pad2 = (n) => String(n).padStart(2, '0');
    let current = 0;
    let frame = 0;
    let dragMoved = false;

    const centerOf = (i) => items[i].offsetLeft + items[i].offsetWidth / 2;
    const target = (i) => Math.max(0, centerOf(i) - galTrack.clientWidth / 2);
    const goTo = (i, instant = false) => {
      galTrack.scrollTo({ left: target(clamp(i, 0, total - 1)), behavior: instant || reduceMotion ? 'auto' : 'smooth' });
    };

    const paint = () => {
      frame = 0;
      const cw = galTrack.clientWidth;
      const sl = galTrack.scrollLeft;
      const sw = galTrack.scrollWidth;
      const sMax = Math.max(1, sw - cw);
      // titik fokus: di tengah layar, tetapi di ujung rel bergeser halus ke foto pertama / terakhir
      let frac = 0.5;
      const s1 = Math.max(1, target(Math.min(1, total - 1)));
      const sL = Math.min(sMax - 1, target(Math.max(0, total - 2)));
      if (sl < s1) {
        const f0 = centerOf(0) / cw;
        frac = f0 + (0.5 - f0) * clamp(sl / s1, 0, 1);
      } else if (sl > sL) {
        const fe = (centerOf(total - 1) - sMax) / cw;
        frac = 0.5 + (fe - 0.5) * clamp((sl - sL) / Math.max(1, sMax - sL), 0, 1);
      }
      const mid = sl + cw * frac;
      let best = 0;
      let bestD = Infinity;
      const dist = items.map((item, i) => {
        const d = Math.abs(centerOf(i) - mid);
        if (d < bestD) { bestD = d; best = i; }
        return d;
      });
      items.forEach((item, i) => {
        const slack = item.offsetWidth * 0.03;
        item.style.setProperty('--k', clamp(dist[i] / (cw * 0.62), 0, 1).toFixed(3));
        item.style.setProperty('--par', clamp((centerOf(i) - mid) * -0.04, -slack, slack).toFixed(1));
      });
      current = best;
      nowEl.textContent = pad2(best + 1);
      const group = items[best].dataset.group;
      tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.group === group));
      prevBtn.disabled = best === 0;
      nextBtn.disabled = best === total - 1;
      barEl.style.width = `${(cw / sw * 100).toFixed(2)}%`;
      barEl.style.left = `${(sl / sw * 100).toFixed(2)}%`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    galTrack.addEventListener('scroll', schedule, { passive: true });

    /* tab, panah, keyboard */
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      const first = items.findIndex((item) => item.dataset.group === tab.dataset.group);
      if (first >= 0) goTo(first);
    }));
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    galTrack.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') goTo(current + 1);
      else if (event.key === 'ArrowLeft') goTo(current - 1);
      else return;
      event.preventDefault();
    });

    /* seret dengan mouse; sentuhan & trackpad sudah native */
    let drag = null;
    galTrack.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragMoved = false;
      drag = { id: event.pointerId, x: event.clientX, left: galTrack.scrollLeft, lastX: event.clientX, lastT: event.timeStamp, v: 0, active: false, start: current };
    });
    window.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      if (!drag.active) {
        if (Math.abs(dx) < 6) return;
        drag.active = true;
        dragMoved = true;
        galTrack.classList.add('is-dragging');
        try { galTrack.setPointerCapture(event.pointerId); } catch (error) { /* abaikan */ }
      }
      const dt = Math.max(1, event.timeStamp - drag.lastT);
      drag.v = (event.clientX - drag.lastX) / dt;
      drag.lastX = event.clientX;
      drag.lastT = event.timeStamp;
      galTrack.scrollLeft = drag.left - dx;
    });
    const endDrag = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { active, v, lastT, x, start } = drag;
      drag = null;
      if (!active) return;
      galTrack.classList.remove('is-dragging');
      const flick = event.timeStamp - lastT < 90 ? v : 0;
      const moved = event.clientX - x;
      const widthHere = items[start].offsetWidth * 0.3;
      let index = current;
      if (Math.abs(flick) > 0.5) index = clamp(start + (flick < 0 ? 1 : -1), 0, total - 1);
      else if (Math.abs(moved) > Math.max(70, widthHere)) index = clamp(start + (moved < 0 ? 1 : -1), 0, total - 1);
      goTo(index);
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    galTrack.addEventListener('click', (event) => {
      if (!dragMoved) return;
      event.stopPropagation();
      event.preventDefault();
      dragMoved = false;
    }, true);

    /* lightbox */
    const modalEl = $('#imageModal');
    const lbPrev = $('#lbPrev');
    const lbNext = $('#lbNext');
    const lbCount = $('#lbCount');
    let lb = 0;
    let lbOpen = false;
    const showLb = (i) => {
      lb = (i + total) % total;
      const item = items[lb];
      if (modalImage) { modalImage.src = item.dataset.full; modalImage.alt = $('img', item)?.alt || 'Foto cerita kita'; }
      if (lbCount) lbCount.textContent = `${pad2(lb + 1)} / ${pad2(total)}`;
    };
    items.forEach((item, i) => item.addEventListener('click', () => {
      if (!modalEl || !window.bootstrap) return;
      showLb(i);
      window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }));
    lbPrev?.addEventListener('click', () => showLb(lb - 1));
    lbNext?.addEventListener('click', () => showLb(lb + 1));
    modalEl?.addEventListener('shown.bs.modal', () => { lbOpen = true; });
    modalEl?.addEventListener('hidden.bs.modal', () => { lbOpen = false; goTo(lb, true); });
    document.addEventListener('keydown', (event) => {
      if (!lbOpen) return;
      if (event.key === 'ArrowRight') showLb(lb + 1);
      else if (event.key === 'ArrowLeft') showLb(lb - 1);
    });
    let swipeX = null;
    modalImage?.addEventListener('pointerdown', (event) => { swipeX = event.clientX; });
    modalImage?.addEventListener('pointerup', (event) => {
      if (swipeX === null) return;
      const dx = event.clientX - swipeX;
      swipeX = null;
      if (Math.abs(dx) > 50) showLb(lb + (dx < 0 ? 1 : -1));
    });

    const layout = () => {
      galTrack.scrollTo({ left: target(current), behavior: 'auto' });
      paint();
    };
    layout();
    window.addEventListener('load', layout);
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(galTrack);
    else window.addEventListener('resize', layout);
    items.forEach((item) => { const img = $('img', item); if (img && !img.complete) img.addEventListener('load', layout, { once: true }); });
  }

  /* =========================================================
     V10 — EFEK SUARA
     Semua bunyi dibuat lewat kode (assets/audio/*.mp3) dan dimainkan lewat Web Audio.
     Tombol speaker di kiri bawah menyalakan / mematikannya.
  ========================================================= */
  const Sfx = (() => {
    const FILES = { click: 'click', chime: 'chime', paper: 'paper-open', pop: 'pop', whoosh: 'whoosh', clink: 'clink', block: 'block', star: 'star', flip: 'flip', heartbeat: 'heartbeat', connect: 'connect' };
    const LOOPS = { cafe: 0.34, night: 0.4 };       // tingkat suasana (sangat pelan, di bawah musik)
    const MASTER = 0.6;
    let ctx = null;
    let master = null;
    let enabled = true;
    let wantAmbience = null;
    let ducked = false;
    const buffers = {};
    const last = {};
    const loops = {};
    try { enabled = localStorage.getItem('ck_sfx') !== '0'; } catch (error) { /* abaikan */ }

    const load = async (name, file) => {
      try {
        const res = await fetch(`assets/audio/${file}.mp3`);
        if (!res.ok) return;
        const data = await res.arrayBuffer();
        if (!data.byteLength) return;
        buffers[name] = await ctx.decodeAudioData(data);
        if (name in LOOPS) applyAmbience();
      } catch (error) { /* file belum ada / dibuka tanpa server: lewati saja */ }
    };
    const prepare = () => {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();                      // tertahan sampai ada sentuhan pertama (aturan browser)
      master = ctx.createGain();
      master.gain.value = enabled ? MASTER : 0;
      master.connect(ctx.destination);
      Object.keys(FILES).forEach((name) => load(name, FILES[name]));
      Object.keys(LOOPS).forEach((name) => load(name, name));
    };
    const init = () => {
      prepare();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    };
    function applyAmbience() {
      if (!ctx) return;
      Object.keys(LOOPS).forEach((name) => {
        if (!loops[name] && buffers[name] && wantAmbience === name) {
          const src = ctx.createBufferSource();
          src.buffer = buffers[name];
          src.loop = true;
          const gain = ctx.createGain();
          gain.gain.value = 0;
          src.connect(gain);
          gain.connect(master);
          src.start();
          loops[name] = gain;
        }
        if (loops[name]) {
          const target = enabled && !ducked && wantAmbience === name ? LOOPS[name] : 0;
          loops[name].gain.setTargetAtTime(target, ctx.currentTime, 0.9);
        }
      });
    }
    const play = (name, o = {}) => {
      if (!ctx || !enabled || !buffers[name]) return;
      const now = ctx.currentTime;
      const gap = o.gap === undefined ? 0.05 : o.gap;
      if (last[name] && now - last[name] < gap) return;
      last[name] = now;
      const src = ctx.createBufferSource();
      src.buffer = buffers[name];
      src.playbackRate.value = o.rate || 1;
      const gain = ctx.createGain();
      gain.gain.value = o.vol === undefined ? 1 : o.vol;
      src.connect(gain);
      gain.connect(master);
      src.start(now + (o.delay || 0));
    };
    return {
      init, prepare, play,
      ambience(name) { wantAmbience = name; applyAmbience(); },
      duck(value) { ducked = value; applyAmbience(); },
      get enabled() { return enabled; },
      set(value) {
        enabled = value;
        try { localStorage.setItem('ck_sfx', value ? '1' : '0'); } catch (error) { /* abaikan */ }
        if (master) master.gain.setTargetAtTime(value ? MASTER : 0, ctx.currentTime, 0.08);
        applyAmbience();
      }
    };
  })();
  const PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];     // tangga nada pentatonik: apa pun yang disentuh terdengar serasi
  const penta = () => PENTA[Math.floor(Math.random() * PENTA.length)];

  const sfxBtn = $('#sfxBtn');
  const paintSfxBtn = () => {
    if (!sfxBtn) return;
    sfxBtn.classList.toggle('is-off', !Sfx.enabled);
    sfxBtn.setAttribute('aria-pressed', Sfx.enabled ? 'true' : 'false');
    const icon = $('i', sfxBtn);
    if (icon) icon.className = `bi ${Sfx.enabled ? 'bi-volume-up' : 'bi-volume-mute'}`;
  };
  paintSfxBtn();
  try { Sfx.prepare(); } catch (error) { /* abaikan */ }
  ['pointerdown', 'keydown', 'touchstart', 'touchend', 'click'].forEach((type) => window.addEventListener(type, Sfx.init, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) Sfx.init(); });
  sfxBtn?.addEventListener('click', () => {
    Sfx.init();
    Sfx.set(!Sfx.enabled);
    paintSfxBtn();
    if (Sfx.enabled) Sfx.play('click');
  });

  /* ---------- bunyi untuk sentuhan (satu pendengar, dipilah per elemen) ---------- */
  document.addEventListener('click', (event) => {
    const hit = (selector) => event.target.closest?.(selector);
    let el;
    if ((el = hit('.chapter-node'))) Sfx.play('chime', { rate: [1, 5 / 4, 3 / 2, 2][$$('.chapter-node').indexOf(el)] || 1, vol: 0.7 });
    else if (hit('#chapterNext, #chapterPrev, #galNext, #galPrev')) Sfx.play('whoosh', { vol: 0.7 });
    else if (hit('.gal-tab')) Sfx.play('click');
    else if (hit('.gal-item, .lb-nav')) Sfx.play('flip');
    else if (hit('#startBtn')) Sfx.play('chime', { vol: 0.75 });
    else if (hit('#openLetter')) Sfx.play('paper');
    else if (hit('#readLetter')) Sfx.play('paper', { rate: 1.12 });
    else if (hit('#closeLetter')) Sfx.play('paper', { rate: 0.85, vol: 0.8 });
    else if (hit('#seal')) { Sfx.play('pop'); Sfx.play('chime', { rate: 3 / 2, vol: 0.5, delay: 0.05 }); }
    else if (hit('.memory-card')) Sfx.play('chime', { rate: penta(), vol: 0.4, gap: 0.2 });
    else if (hit('#topBtn')) Sfx.play('whoosh');
    else if (hit('.floating-nav a, #musicBtn')) Sfx.play('click', { vol: 0.8 });
  });
  $('#imageModal')?.addEventListener('hidden.bs.modal', () => Sfx.play('flip', { rate: 0.85 }));

  /* ---------- bunyi yang mengikuti keadaan halaman (diamati, tanpa mengubah kode lain) ---------- */
  const watch = (target, options, callback) => { if (target) new MutationObserver(callback).observe(target, options); };
  // hati & bintang kecil yang muncul saat disentuh
  watch(fxLayer, { childList: true }, (records) => {
    if (records.some((r) => r.addedNodes.length)) Sfx.play('pop', { rate: 0.85 + Math.random() * 0.5, vol: 0.5, gap: 0.09 });
  });
  // bintang jatuh di kartu malam
  watch($('#nightCard'), { childList: true }, (records) => {
    if (records.some((r) => [...r.addedNodes].some((n) => n.classList?.contains('shoot')))) Sfx.play('star');
  });
  // bab terakhir "Dan akhirnya kita menjadi kita"
  watch($('.chapter.is-final'), { attributes: true, attributeFilter: ['class'] }, () => {
    if ($('.chapter.is-final')?.classList.contains('is-active')) {
      Sfx.play('heartbeat', { vol: 0.9 });
      Sfx.play('chime', { rate: 2, vol: 0.5, delay: 0.55 });
    }
  });

  /* jendela malam: tiap suasana punya bunyi & latarnya sendiri */
  const dockEl = $('#nightDock');
  const sceneEl = $('#nightScene');
  let dockVisible = false;
  let sceneSeen = -1;
  const playScene = (scene, quiet) => {
    Sfx.ambience(scene === 0 ? 'cafe' : 'night');
    if (quiet) return;
    if (scene === 0) { Sfx.play('clink', { vol: 0.75 }); }
    else if (scene === 1) { [0.12, 0.34, 0.52, 0.75, 0.93].forEach((delay, i) => Sfx.play('block', { rate: 0.85 + i * 0.07, vol: 0.5, delay, gap: 0 })); }
    else Sfx.play('connect', { vol: 0.8 });
  };
  const orbList = $$('.memory-orb');
  const stopNow = () => Math.max(0, orbList.findIndex((orb) => orb.classList.contains('active')));
  let sceneTimer = 0;
  orbList.forEach((orb) => watch(orb, { attributes: true, attributeFilter: ['class'] }, () => {
    const scene = stopNow();
    if (scene === sceneSeen) return;
    sceneSeen = scene;
    if (!dockVisible) return;
    Sfx.ambience(scene === 0 ? 'cafe' : 'night');
    clearTimeout(sceneTimer);
    sceneTimer = setTimeout(() => { if (dockVisible && stopNow() === scene) playScene(scene, false); }, 560);
  }));
  if (dockEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      dockVisible = entry.isIntersecting;
      if (dockVisible) { sceneSeen = stopNow(); playScene(sceneSeen, true); }
      else Sfx.ambience(null);
    }, { threshold: 0.35 }).observe(dockEl);
  }

  /* suara surat: musik & suasana mengalah supaya rekamanmu terdengar jelas */
  if (voice) {
    let musicBefore = null;
    let duckTimer = 0;
    const fadeMusic = (to) => {
      if (!bgMusic) return;
      clearInterval(duckTimer);
      duckTimer = setInterval(() => {
        const diff = to - bgMusic.volume;
        if (Math.abs(diff) < 0.006) { bgMusic.volume = to; clearInterval(duckTimer); return; }
        bgMusic.volume = Math.max(0, Math.min(1, bgMusic.volume + diff * 0.18));
      }, 50);
    };
    voice.addEventListener('play', () => { if (musicBefore === null) musicBefore = bgMusic ? 0.16 : null; Sfx.duck(true); fadeMusic(0.05); });
    const restore = () => { Sfx.duck(false); if (musicBefore !== null) { fadeMusic(musicBefore); musicBefore = null; } };
    voice.addEventListener('pause', restore);
    voice.addEventListener('ended', restore);
  }

  /* =========================================================
     V10 — HERO: nama dari serpihan bintang
     Menyentuh / menggerakkan kursor menyibak serpihan; ketuk memecahnya dan membunyikan lonceng.
  ========================================================= */
  const heroName = $('#heroName');
  const heroCanvas = $('#heroCanvas');
  const heroFirst = $('#heroFirst');
  if (heroName && heroCanvas && heroFirst && heroCanvas.getContext) {
    const g = heroCanvas.getContext('2d');
    const COLORS = ['#fff3f9', '#f6c1de', '#c6aef2'];
    let dpr = 1;
    let W = 0;
    let H = 0;
    let parts = [];
    let buckets = [];
    let textLayer = null;
    let raf = 0;
    let onScreen = true;
    let born = 0;
    let lastT = 0;
    let lastWidth = 0;
    const ptr = { x: -9999, y: -9999 };
    let lastChime = 0;

    const build = () => {
      const rect = heroFirst.getBoundingClientRect();
      if (!rect.width) return false;
      const cs = getComputedStyle(heroFirst);
      const size = parseFloat(cs.fontSize);
      const padX = 70;
      const padY = 60;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.round(rect.width + padX * 2);
      H = Math.round(rect.height + padY * 2);
      heroCanvas.width = Math.round(W * dpr);
      heroCanvas.height = Math.round(H * dpr);
      heroCanvas.style.width = `${W}px`;
      heroCanvas.style.height = `${H}px`;

      const off = document.createElement('canvas');
      off.width = heroCanvas.width;
      off.height = heroCanvas.height;
      const o = off.getContext('2d', { willReadFrequently: true });
      o.scale(dpr, dpr);
      o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      o.fillStyle = '#fff';
      o.textAlign = 'center';
      o.textBaseline = 'alphabetic';
      const text = heroFirst.textContent.trim();
      const m = o.measureText(text);
      const asc = m.actualBoundingBoxAscent || size * 0.7;
      const desc = m.actualBoundingBoxDescent || size * 0.25;
      o.fillText(text, W / 2, H / 2 + (asc - desc) / 2);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      textLayer = off;

      const step = Math.max(2, size / 86);
      parts = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const idx = (Math.round(y * dpr) * off.width + Math.round(x * dpr)) * 4 + 3;
          if (data[idx] < 140) continue;
          const hx = x + (Math.random() - 0.5) * step * 0.7;
          const hy = y + (Math.random() - 0.5) * step * 0.7;
          const angle = Math.random() * Math.PI * 2;
          const far = (0.4 + Math.random()) * Math.max(W, H) * 0.55;
          parts.push({
            hx, hy,
            x: W / 2 + Math.cos(angle) * far, y: H / 2 + Math.sin(angle) * far * 0.8 + H * 0.2,
            vx: 0, vy: 0,
            s: step * (0.56 + Math.random() * 0.42),
            c: Math.random() < 0.55 ? 0 : Math.random() < 0.6 ? 1 : 2,
            ph: Math.random() * 6.283,
            bx: 0.5 + Math.random() * 1.1, by: 0.5 + Math.random() * 1.1,
            d: (hx / W) * 900 + Math.random() * 450,
            sp: Math.random() < 0.035
          });
        }
      }
      buckets = COLORS.map(() => []);
      parts.forEach((p) => buckets[p.c].push(p));
      born = performance.now();
      return true;
    };

    const K = 0.016;
    const DAMP = 0.86;
    const R = 96;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(2.2, (now - (lastT || now)) / 16.67 || 1);
      lastT = now;
      const t = now - born;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      if (textLayer) {   // bayangan huruf sangat tipis di bawah serpihan, supaya namanya tetap terbaca
        g.globalAlpha = 0.11 * Math.min(1, t / 2200);
        g.drawImage(textLayer, 0, 0, W, H);
        g.globalAlpha = 1;
      }
      const R2 = R * R;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (t < p.d) {
          p.x += Math.sin(now * 0.001 + p.ph) * 0.3 * dt;
          p.y += Math.cos(now * 0.0012 + p.ph) * 0.3 * dt;
          continue;
        }
        let ax = (p.hx + Math.sin(now * 0.0009 + p.ph) * p.bx - p.x) * K;
        let ay = (p.hy + Math.cos(now * 0.0008 + p.ph) * p.by - p.y) * K;
        const dx = p.x - ptr.x;
        const dy = p.y - ptr.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const f = 1 - d / R;
          ax += (dx / d) * f * f * 2.6;
          ay += (dy / d) * f * f * 2.6;
        }
        p.vx = (p.vx + ax * dt) * DAMP;
        p.vy = (p.vy + ay * dt) * DAMP;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      buckets.forEach((list, b) => {
        g.fillStyle = COLORS[b];
        g.globalAlpha = 0.72 + 0.28 * Math.sin(now * 0.0018 + b * 2.1);
        g.beginPath();
        for (let i = 0; i < list.length; i++) {
          const p = list[i];
          if (t < p.d) continue;
          g.rect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        }
        g.fill();
      });
      // beberapa serpihan berkilau lebih besar
      g.globalAlpha = 1;
      g.fillStyle = '#fff';
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        if (!p.sp || t < p.d) continue;
        const tw = 0.5 + 0.5 * Math.sin(now * 0.004 + p.ph * 3);
        g.globalAlpha = 0.25 + 0.75 * tw;
        g.beginPath();
        g.arc(p.x, p.y, p.s * (0.7 + tw * 0.9), 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 1;
    };
    const start = () => { if (!raf && onScreen) { lastT = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const toLocal = (event) => {
      const r = heroCanvas.getBoundingClientRect();
      return [event.clientX - r.left, event.clientY - r.top, r];
    };
    window.addEventListener('pointermove', (event) => {
      const [x, y, r] = toLocal(event);
      if (x < -R || y < -R || x > r.width + R || y > r.height + R) { ptr.x = ptr.y = -9999; return; }
      ptr.x = x; ptr.y = y;
      const now = performance.now();
      if (now - lastChime > 950 && x > 0 && x < r.width && y > 0 && y < r.height) {
        // lonceng pelan hanya jika kursor benar-benar menyentuh huruf
        const near = parts.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < 900);
        if (near) { lastChime = now; Sfx.play('chime', { rate: penta(), vol: 0.2, gap: 0.5 }); }
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { ptr.x = ptr.y = -9999; });
    window.addEventListener('pointerup', (event) => { if (event.pointerType !== 'mouse') ptr.x = ptr.y = -9999; });
    heroName.closest('.hero')?.addEventListener('pointerdown', (event) => {
      const [x, y, r] = toLocal(event);
      if (x < -40 || y < -40 || x > r.width + 40 || y > r.height + 40) return;
      parts.forEach((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        const d = Math.hypot(dx, dy) || 1;
        const imp = 20 * Math.exp(-d / 150);
        p.vx += (dx / d) * imp + (Math.random() - 0.5) * 2;
        p.vy += (dy / d) * imp + (Math.random() - 0.5) * 2;
      });
      Sfx.play('chime', { rate: penta(), vol: 0.7, gap: 0.12 });
      if (typeof burst === 'function') burst(event.clientX, event.clientY, 6);
    });

    const bootHero = () => {
      if (!build()) return;
      lastWidth = window.innerWidth;
      heroName.classList.add('is-live');
      if (reduceMotion) {
        parts.forEach((p) => { p.x = p.hx; p.y = p.hy; });
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.fillStyle = COLORS[0];
        parts.forEach((p) => g.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s));
        return;
      }
      stop();
      start();
    };
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (Math.abs(window.innerWidth - lastWidth) > 24) bootHero(); }, 220);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (reduceMotion) return;
        if (onScreen) start(); else stop();
      }, { threshold: 0 }).observe(heroName);
    }
    const ready = (document.fonts && document.fonts.load)
      ? Promise.race([document.fonts.load(`500 120px "Cormorant Garamond"`), new Promise((resolve) => setTimeout(resolve, 2500))])
      : Promise.resolve();
    ready.then(() => requestAnimationFrame(bootHero));
  }
})();
