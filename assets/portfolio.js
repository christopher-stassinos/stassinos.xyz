(() => {
  'use strict';
  const content = window.STASSINOS_CONTENT;
  if (!content) return;
  const exhibits = window.STASSINOS_EXHIBITS;
  const motion = window.STASSINOS_MOTION;
  const musicUrl = content.music.url || `https://www.youtube.com/playlist?list=${encodeURIComponent(content.music.playlistId)}`;
  const multipleTracks = content.music.tracks.length > 1;

  const routes = [
    ['home', 'Overview'],
    ['bot', 'Experience'],
    ['memory', 'Credentials'],
    ['history', 'Education'],
    ['trajectory', 'Projects'],
    ['metrics', 'Skills'],
    ['console', 'Contact'],
  ];
  const cv = 'assets/christopher-stassinos-cv.pdf';
  const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  const actions = `<div class="cta-row"><a class="btn btn-primary" href="${cv}" download>Download CV <span aria-hidden="true">↗</span></a><a class="btn btn-secondary" href="https://linkedin.com/in/christopher-stassinos" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></div>`;
  const heading = (title, introduction = '') => `<header class="page-intro"><h1 tabindex="-1">${title}<span class="title-stop" aria-hidden="true">.</span></h1>${introduction ? `<p>${introduction}</p>` : ''}</header>`;
  const section = (title, body, extra = '') => `<section class="exhibit ${extra}"><div class="section-heading"><h2>${title}</h2></div>${body}</section>`;

  const views = {
    home: () => `
      <section class="profile-hero">
        <div class="profile-hero__copy"><h1 tabindex="-1">Christopher<br>Stassinos<span class="title-stop" aria-hidden="true">.</span></h1><p class="lead">${content.summary}</p>${actions}<a class="profile-continue" href="#/bot"><span>View experience</span><span aria-hidden="true">↓</span></a></div>
      </section>
      <section class="metrics" aria-label="Profile summary">${content.metrics}</section>
      <div class="overview-columns">${section('Background', `<div class="about-copy">${content.about}</div><div class="chip-wrap">${content.tags}</div>`)}${section('Snapshot', `<div class="profile-list">${content.snapshot}</div>`)}</div>
      ${section('Current practice', `<ul class="hero-points">${content.points}</ul>`)}
      <nav class="explore-grid" aria-label="Explore the portfolio"><a href="#/bot"><span>Experience</span><strong>Production environments ↗</strong></a><a href="#/trajectory"><span>Projects</span><strong>Labs, systems, research ↗</strong></a><a href="#/memory"><span>Credentials</span><strong>Security + cloud ↗</strong></a></nav>`,
    bot: () => `${heading('Experience', 'Enterprise support experience with a security mindset. Five years across MSP and enterprise support, security operations, and infrastructure troubleshooting.')}<div class="record-list">${content.experience}</div>${actions}`,
    memory: () => `${heading('Certifications', 'Security, cloud, cybersecurity analysis, and firewall credentials spanning core IT and security domains.')}<div class="cert-grid">${content.certifications}</div>${section('Credential details', `<div class="record-list compact-records">${content.certificationDetails}</div>`)}${actions}`,
    history: () => `${heading('Education', 'IT systems, network defense, business operations, and hands-on security training.')}<div class="record-list education-records">${content.education}</div><div class="route-note"><a href="#/memory">Certifications ↗</a><a href="#/trajectory">Hands-on labs ↗</a></div>${actions}`,
    trajectory: () => `${heading('Labs + projects', 'Selected work in decentralized cloud hosting, security operations, packet analysis, and systematic trading research.')}<div class="record-list project-records">${content.labs}</div>`,
    metrics: () => `${heading('Core skills', 'Endpoint security, identity and access, networking, SIEM, and cloud-connected infrastructure.')}<section class="skills-layout" aria-label="Capability matrix">${content.skills}</section>${section('Working environments', `<div class="chip-wrap">${content.tags}</div><div class="about-copy">${content.about}</div>`)}<div class="route-note"><a href="#/bot">Experience ↗</a><a href="#/trajectory">Project archive ↗</a></div>`,
    console: () => `${heading('Contact')}<section class="contact-panel">${content.contact}</section><div class="contact-directory"><a href="mailto:chrisstassinos@gmail.com"><span>Email</span><strong>chrisstassinos@gmail.com</strong><b aria-hidden="true">↗</b></a><a href="https://linkedin.com/in/christopher-stassinos" target="_blank" rel="noreferrer"><span>LinkedIn</span><strong>Christopher Stassinos</strong><b aria-hidden="true">↗</b></a><a href="https://github.com/christopher-stassinos" target="_blank" rel="noreferrer"><span>GitHub</span><strong>christopher-stassinos</strong><b aria-hidden="true">↗</b></a></div>${section('Résumé', `<div class="resume-download"><p>Experience, certifications, education, and selected projects.</p><div class="cta-row"><a class="btn btn-primary" href="${cv}" download>Download CV ↗</a><a class="btn btn-secondary" href="${cv}" target="_blank" rel="noreferrer">View PDF ↗</a></div></div>`)}`,
  };

  const root = document.createElement('div');
  root.className = 'museum-app';
  root.innerHTML = `
    <a class="portfolio-skip" href="#portfolio-page">Skip to content</a>
    <aside class="museum-rail"><div class="museum-identity"><a class="museum-name" href="#/home">Christopher Stassinos</a><a class="museum-brand" href="#/home">stassinos<span>.xyz</span></a></div><nav class="museum-nav" aria-label="Portfolio sections">${routes.map(([id, name]) => `<a href="#/${id}" data-route="${id}"><b>${name}</b><i aria-hidden="true">↗</i></a>`).join('')}</nav><div class="rail-bottom"><a class="rail-cv" href="${cv}" download>Download CV <span>↓</span></a></div></aside>
    <div class="museum-workspace"><main id="portfolio-page" tabindex="-1"></main><footer class="museum-footer"><span>© Christopher Stassinos</span><a href="#/console">Contact ↗</a><a href="${cv}" download>CV ↓</a></footer></div>
    <section class="music-player" aria-label="Site music"><div class="music-player__heading"><a href="${escape(musicUrl)}" target="_blank" rel="noreferrer">Site music ↗</a><button type="button" data-music-expand aria-expanded="false" aria-controls="music-video">Expand</button></div><div id="music-video" class="music-video" hidden><div id="yt-preview-player"></div></div><div class="music-player__track"><strong data-track-title>${escape(content.music.tracks[0].title)}</strong><span data-track-state role="status">Paused</span></div><div class="music-controls">${multipleTracks ? '<button type="button" data-music-prev aria-label="Previous track">|◀</button>' : ''}<button type="button" data-music-play aria-label="Play music">Play</button>${multipleTracks ? '<button type="button" data-music-next aria-label="Next track">▶|</button>' : ''}<button type="button" data-music-mute aria-label="Mute music" aria-pressed="false">Mute</button><label>Vol <input type="range" data-music-volume min="0" max="100" value="30" aria-label="Music volume"></label></div><div class="music-scrub"><time data-music-time>0:00 / —</time><input type="range" data-music-progress min="0" max="100" value="0" aria-label="Music progress" disabled></div><a class="music-help" data-music-help href="${escape(musicUrl)}" target="_blank" rel="noreferrer" hidden>Open on YouTube ↗</a></section>`;
  root.querySelector('.rail-bottom').before(root.querySelector('.music-player'));
  document.body.appendChild(root);
  document.body.classList.add('portfolio-ready');
  const page = root.querySelector('#portfolio-page');
  const routeScroll = new Map();
  let activePath = '';

  function renderRoute(focus = false) {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const aliases = {overview: 'home', experience: 'bot', credentials: 'memory', education: 'history', projects: 'trajectory', labs: 'trajectory', skills: 'metrics', contact: 'console'};
    const id = aliases[parts[0]] || parts[0];
    const route = routes.find(([key]) => key === id) || routes[0];
    const project = route[0] === 'trajectory' && content.projects[parts[1]];
    const exhibit = exhibits[route[0]];
    if (activePath) routeScroll.set(activePath, page.scrollTop);
    activePath = project ? `${route[0]}/${parts[1]}` : route[0];
    page.innerHTML = project ? `<div class="project-breadcrumb"><a class="btn btn-secondary" href="#/trajectory">← All projects</a></div><div class="project-brief">${project.html}</div>` : views[route[0]]();
    page.dataset.section = route[0];
    root.dataset.exhibit = route[0];
    root.style.setProperty('--scene-rgb', exhibit.accent);
    const routeIndex = routes.findIndex(([key]) => key === route[0]);
    const previousRoute = routes[(routeIndex + routes.length - 1) % routes.length];
    const nextRoute = routes[(routeIndex + 1) % routes.length];
    page.insertAdjacentHTML('beforeend', `<nav class="section-pagination" aria-label="Continue through the portfolio"><a href="#/${previousRoute[0]}" aria-label="Previous: ${previousRoute[1]}"><strong>← ${previousRoute[1]}</strong></a><a href="#/${nextRoute[0]}" aria-label="Next: ${nextRoute[1]}"><strong>${nextRoute[1]} →</strong></a></nav>`);
    root.querySelectorAll('[data-route]').forEach((link) => {
      const selected = link.dataset.route === route[0];
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    page.querySelectorAll('a[href$=".html"]').forEach((link) => {
      const slug = link.getAttribute('href').replace('.html', '');
      if (content.projects[slug]) link.href = `#/trajectory/${slug}`;
    });
    page.querySelectorAll('[data-width]').forEach((bar) => {bar.style.width = bar.dataset.width;});
    document.title = `${project ? project.title : route[1]} — Christopher Stassinos`;
    page.scrollTop = routeScroll.get(activePath) || 0;
    window.dispatchEvent(new CustomEvent('museum:scroll', {detail: {position: Math.min(1, page.scrollTop / Math.max(1, page.clientHeight))}}));
    const pageHeading = page.querySelector('h1');
    if (pageHeading) pageHeading.tabIndex = -1;
    if (focus) (pageHeading || page).focus({preventScroll: true});
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && new URLSearchParams(location.search).get('motion') !== 'still') {
      page.getAnimations().forEach(animation => animation.cancel());
      page.animate([{opacity: .15, transform: 'translateY(9px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: motion.duration * .62, easing: motion.easing});
    }
    window.dispatchEvent(new CustomEvent('museum:exhibit', {detail: {route:route[0], exhibit}}));
  }

  page.addEventListener('scroll', () => {
    window.dispatchEvent(new CustomEvent('museum:scroll', {detail: {position: Math.min(1, page.scrollTop / Math.max(1, page.clientHeight))}}));
  }, {passive:true});

  root.addEventListener('click', (event) => {
    const skip = event.target.closest('.portfolio-skip');
    if (skip) {event.preventDefault(); page.focus();}
    const link = event.target.closest('a[href^="#/"]');
    if (link && link.hash === location.hash) {event.preventDefault(); page.scrollTo({top: 0, behavior: 'smooth'});}
  });
  window.addEventListener('hashchange', () => renderRoute(true));
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, button, [contenteditable="true"]')) return;
    if (/^[1-7]$/.test(event.key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.hash = `#/${routes[Number(event.key) - 1][0]}`;
    }
  }, true);
  renderRoute();

  // Play the configured video directly; playlist loading is used only for a real list.
  const tracks = content.music.tracks.map((track) => ({...track}));
  const music = root.querySelector('.music-player');
  const title = music.querySelector('[data-track-title]');
  const status = music.querySelector('[data-track-state]');
  const playButton = music.querySelector('[data-music-play]');
  const progress = music.querySelector('[data-music-progress]');
  const volume = music.querySelector('[data-music-volume]');
  const video = music.querySelector('.music-video');
  const expandButton = music.querySelector('[data-music-expand]');
  const muteButton = music.querySelector('[data-music-mute]');
  const help = music.querySelector('[data-music-help]');
  const musicSource = content.music.playlistId || content.music.tracks.map(track => track.id).join(',');
  const storageKey = `stassinos-site-player-state-v2:${musicSource}`;
  let saved = {};
  try {saved = JSON.parse(localStorage.getItem(storageKey) || '{}');} catch {}
  let index = Math.max(0, Number(saved.index) || 0) % tracks.length;
  let player = null;
  let ready = false;
  let loading = false;
  let playing = false;
  let playlistMode = false;
  let didFallback = false;
  let muted = false;
  let shouldPlay = false;
  let apiTimer;
  const unavailableTracks = new Set();
  const time = (seconds) => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;

  function state(message) {status.textContent = tracks.length > 1 ? `${message} · ${String(index + 1).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}` : message;}
  function expanded(value) {
    video.hidden = !value;
    music.classList.toggle('is-expanded', value);
    expandButton.textContent = value ? 'Minimize' : 'Expand';
    expandButton.setAttribute('aria-expanded', String(value));
  }
  function saveState() {
    if (!ready) return;
    try {localStorage.setItem(storageKey, JSON.stringify({playlistId: content.music.playlistId, index, seconds: player.getCurrentTime() || 0, shouldPlay: playing, muted, playlistMode: playlistMode ? 'playlist' : 'fallback'}));} catch {}
  }
  function sync() {
    if (!ready) return;
    try {
      const data = player.getVideoData();
      const list = playlistMode && player.getPlaylist();
      if (Array.isArray(list) && list.length) {
        index = Math.max(0, player.getPlaylistIndex());
        const oldTracks = tracks.slice();
        list.forEach((id, i) => {tracks[i] = {id, title: oldTracks.find((track) => track.id === id)?.title || `Track ${i + 1}`};});
        tracks.length = list.length;
      }
      title.textContent = data?.title || tracks[index]?.title || 'Site music';
      title.title = title.textContent;
      const duration = Number(player.getDuration()) || 0;
      const elapsed = Number(player.getCurrentTime()) || 0;
      progress.disabled = !duration;
      progress.max = duration || 100;
      if (document.activeElement !== progress) progress.value = elapsed;
      music.querySelector('[data-music-time]').textContent = `${time(elapsed)} / ${duration ? time(duration) : '—'}`;
      saveState();
    } catch {}
  }
  function unavailable(message = 'Unable to load audio') {
    clearTimeout(apiTimer);
    loading = false;
    playing = false;
    shouldPlay = false;
    playButton.textContent = 'Retry';
    playButton.disabled = false;
    playButton.setAttribute('aria-label', 'Retry loading music');
    state(message);
    help.hidden = false;
  }
  function boot() {
    if (player || !window.YT?.Player) return;
    expanded(true);
    player = new window.YT.Player('yt-preview-player', {
      width: '100%', height: '200', videoId: tracks[index].id,
      playerVars: {origin: location.origin, controls: 1, playsinline: 1, autoplay: 0, start: Math.floor(Number(saved.seconds) || 0)},
      events: {
        onReady() {
          clearTimeout(apiTimer);
          ready = true;
          loading = false;
          playButton.disabled = false;
          player.setVolume(Number(volume.value));
          if (shouldPlay) {
            if (content.music.playlistId) {
              playlistMode = true;
              player.loadPlaylist({listType: 'playlist', list: content.music.playlistId, index, startSeconds: Math.max(0, Number(saved.seconds) || 0)});
            } else player.playVideo();
          } else state('Ready');
          sync();
        },
        onStateChange(event) {
          const value = event.data;
          playing = value === 1;
          if (value === 1) {state('Playing'); help.hidden = true;}
          else if (value === 2) state('Paused');
          else if (value === 3) state('Buffering');
          else if (value === 5) state('Ready');
          else if (value === 0) {
            if (!playlistMode && tracks.length > 1) moveTrack(1);
            else {shouldPlay = false; state('Ended');}
          }
          playButton.textContent = playing ? 'Pause' : 'Play';
          playButton.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
          sync();
        },
        onError(event) {
          if (playlistMode && !didFallback) {
            didFallback = true;
            playlistMode = false;
            player.loadVideoById({videoId: tracks[index].id, startSeconds: Number(saved.seconds) || 0});
            if (!shouldPlay) player.pauseVideo();
            state('Loading track');
          } else if (shouldPlay && event.data !== 153 && unavailableTracks.size < tracks.length - 1) {
            unavailableTracks.add(tracks[index].id);
            moveTrack(1);
          } else unavailable(event.data === 153 ? 'YouTube restricted playback' : 'Track unavailable');
        },
      },
    });
  }
  function startMusic() {
    shouldPlay = true;
    if (ready) {player.unMute(); muted = false; player.playVideo(); return;}
    if (loading) return;
    if (player) {
      try {player.destroy();} catch {}
      video.innerHTML = '<div id="yt-preview-player"></div>';
      player = null;
    }
    loading = true;
    state('Loading YouTube');
    playButton.textContent = 'Loading';
    playButton.disabled = true;
    if (window.YT?.Player) boot();
    else {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {if (typeof previous === 'function') previous(); boot();};
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = () => unavailable('YouTube could not connect');
        document.head.appendChild(script);
      }
    }
    apiTimer = setTimeout(() => {if (!ready) unavailable('YouTube could not connect');}, 18000);
  }
  function moveTrack(delta) {
    if (ready && playlistMode) {delta > 0 ? player.nextVideo() : player.previousVideo(); return;}
    index = (index + delta + tracks.length) % tracks.length;
    saved.seconds = 0;
    title.textContent = tracks[index].title;
    state(ready ? 'Loading track' : 'Paused');
    if (ready) {player.loadVideoById(tracks[index].id); if (!shouldPlay) player.pauseVideo();}
  }
  playButton.addEventListener('click', () => {if (ready && playing) {shouldPlay = false; player.pauseVideo();} else startMusic();});
  music.querySelector('[data-music-prev]')?.addEventListener('click', () => moveTrack(-1));
  music.querySelector('[data-music-next]')?.addEventListener('click', () => moveTrack(1));
  expandButton.addEventListener('click', () => expanded(video.hidden));
  muteButton.addEventListener('click', () => {
    muted = !muted;
    if (ready) muted ? player.mute() : player.unMute();
    muteButton.textContent = muted ? 'Unmute' : 'Mute';
    muteButton.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
    muteButton.setAttribute('aria-pressed', String(muted));
  });
  volume.addEventListener('input', () => {if (ready) player.setVolume(Number(volume.value));});
  progress.addEventListener('input', () => {if (ready) {player.seekTo(Number(progress.value), true); sync();}});
  window.addEventListener('pagehide', saveState);
  setInterval(sync, 1000);
  title.textContent = tracks[index].title;
  title.title = title.textContent;
  state('Paused');
})();
