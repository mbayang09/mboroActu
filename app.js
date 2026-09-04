/* ===== MboroActu — app.js ===== */

/* --- Mobile nav toggle --- */
(function () {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      hamburger.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
    });
  }
})();

/* --- Active nav link --- */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
    if (href === '#voyageur' || href === 'voyageur.html') {
      a.classList.add('highlight');
    }
  });
})();

/* --- Toast notification --- */
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* --- Newsletter form --- */
document.querySelectorAll('.nl-form').forEach(form => {
  const btn = form.querySelector('button');
  const input = form.querySelector('input[type=email]');
  if (btn && input) {
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (!input.value || !input.value.includes('@')) {
        showToast('Veuillez entrer une adresse email valide.');
        return;
      }
      showToast('Merci ! Vous êtes inscrit à la newsletter MboroActu.');
      input.value = '';
    });
  }
});

/* ===== VOYAGEUR MODULE ===== */
(function () {
  const board = document.getElementById('board');
  if (!board) return;

  let currentType = 'covoit';

  window.setType = function (type) {
    currentType = type;
    document.getElementById('btn-covoit')?.classList.toggle('active', type === 'covoit');
    document.getElementById('btn-colis')?.classList.toggle('active', type === 'colis');
    const fieldPlaces = document.getElementById('field-places');
    const fieldPrix = document.getElementById('field-prix');
    if (fieldPlaces) fieldPlaces.style.display = type === 'covoit' ? 'flex' : 'none';
    if (fieldPrix) fieldPrix.style.display = type === 'covoit' ? 'flex' : 'none';
  };

  function esc(str) {
    const d = document.createElement('span');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  function initials(name) {
    if (!name) return '?';
    return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  }

  function relDay(dateStr) {
    if (!dateStr) return 'Date à confirmer';
    const d = new Date(dateStr + 'T00:00:00');
    const opts = { weekday: 'long', day: 'numeric', month: 'long' };
    return d.toLocaleDateString('fr-FR', opts);
  }

  function isExpired(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  }

  function buildEntry(data) {
    const kindLabel = data.kind === 'covoit' ? 'Covoiturage' : 'Colis';
    const safeTel = esc(data.tel);
    const safeNom = esc(data.nom);
    const safeDepart = esc(data.depart);
    const safeArrivee = esc(data.arrivee);
    const safeHeure = esc(data.heure || '—');
    const safeWhen = esc(data.when || relDay(data.date));
    const safePlaces = esc(data.places || '—');
    const safePrix = data.prix ? esc(data.prix) + ' FCFA' : 'À discuter';
    const safeInits = esc(initials(data.nom));
    // tel for tel: link — only digits and + allowed
    const telLink = (data.tel || '').replace(/[^0-9+]/g, '');

    // Build details using safe escaped values
    let detailsHtml = `<div>🕒 Départ <b>${safeHeure}</b></div>`;
    if (data.kind === 'covoit') {
      detailsHtml += `<div>💺 <b>${safePlaces}</b> place(s)</div>`;
      detailsHtml += `<div>💰 <b>${safePrix}</b></div>`;
    } else {
      detailsHtml += `<div>📦 Transport de colis</div>`;
    }

    const div = document.createElement('div');
    div.className = 'voy-entry';
    // All interpolated values are HTML-escaped via esc(); tel link only contains digits/+
    div.innerHTML = `
      <div class="voy-entry-top">
        <span class="voy-kind ${data.kind === 'covoit' ? 'covoit' : 'colis'}">${kindLabel}</span>
        <span class="voy-when mono">${safeWhen}</span>
      </div>
      <div class="voy-route">${safeDepart} <span class="arrow">→</span> ${safeArrivee}</div>
      <div class="voy-details">${detailsHtml}</div>
      <div class="voy-entry-foot">
        <div class="voy-person">
          <div class="avatar">${safeInits}</div>
          <div>${safeNom}<br><span class="mono" style="color:#8391AF;font-size:11px;">${safeTel}</span></div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;">
          <a class="btn-contact" href="tel:${telLink}">Contacter</a>
          <button class="btn-report">Signaler</button>
        </div>
      </div>`;

    div.querySelector('.btn-report').addEventListener('click', () => showToast('Signalement envoyé. Merci.'));
    return div;
  }

  window.addEntry = function () {
    const depart = document.getElementById('f-depart')?.value.trim() || 'Mboro';
    const arrivee = document.getElementById('f-arrivee')?.value || 'Dakar';
    const date = document.getElementById('f-date')?.value || '';
    const heure = document.getElementById('f-heure')?.value || '—';
    const places = document.getElementById('f-places')?.value || '';
    const prix = document.getElementById('f-prix')?.value || '';
    const nom = document.getElementById('f-nom')?.value.trim() || 'Voyageur anonyme';
    const tel = document.getElementById('f-tel')?.value.trim() || 'Non renseigné';

    if (!date) { showToast('Veuillez indiquer le jour du voyage.'); return; }
    if (isExpired(date)) { showToast('La date du voyage est déjà passée.'); return; }
    if (nom === 'Voyageur anonyme' || !document.getElementById('f-nom')?.value.trim()) {
      showToast('Veuillez indiquer votre nom.'); return;
    }

    const entry = buildEntry({ kind: currentType, depart, arrivee, date, heure, places, prix, nom, tel });
    board.prepend(entry);

    ['f-depart', 'f-date', 'f-heure', 'f-places', 'f-prix', 'f-nom', 'f-tel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    showToast('Votre trajet a été publié !');
    entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Seed data with future dates (Sept 2026)
  const seed = [
    { kind: 'covoit', depart: 'Mboro', arrivee: 'Dakar', when: 'Mercredi 3 sept', heure: '06:30', places: 3, prix: '3 000', nom: 'Modou Fall', tel: '77 512 44 09' },
    { kind: 'colis', depart: 'Mboro', arrivee: 'Thiès', when: 'Jeudi 4 sept', heure: '09:00', nom: 'Awa Ndiaye', tel: '76 208 91 15' },
    { kind: 'covoit', depart: 'Mboro', arrivee: 'Saint-Louis', when: 'Vendredi 5 sept', heure: '14:00', places: 2, prix: '4 000', nom: 'Ibrahima Sarr', tel: '70 344 82 60' },
    { kind: 'colis', depart: 'Mboro', arrivee: 'Dakar', when: 'Samedi 6 sept', heure: '07:00', nom: 'Fatou Diop', tel: '78 123 45 67' },
    { kind: 'covoit', depart: 'Mboro', arrivee: 'Touba', when: 'Dimanche 7 sept', heure: '05:00', places: 4, prix: '5 000', nom: 'Omar Ba', tel: '77 987 65 43' },
  ];

  seed.forEach(s => board.appendChild(buildEntry(s)));
})();

/* ===== GALLERY FILTERS ===== */
(function () {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // In a real site this would filter; for demo just show all
    });
  });
})();

/* ===== CALENDAR NAVIGATION ===== */
(function () {
  const monthDisplay = document.getElementById('month-display');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  if (!monthDisplay || !prevBtn || !nextBtn) return;

  const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  let current = new Date(2026, 8, 1); // Sept 2026

  function render() {
    monthDisplay.textContent = `${months[current.getMonth()]} ${current.getFullYear()}`;
  }
  prevBtn.addEventListener('click', () => { current.setMonth(current.getMonth() - 1); render(); });
  nextBtn.addEventListener('click', () => { current.setMonth(current.getMonth() + 1); render(); });
  render();
})();
