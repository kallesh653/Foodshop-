/* ================================================================
   FOODSHOP — Admin Panel Script
   ================================================================ */

let editId = null;   // product being edited (null = new)

/* ================================================================
   BOOT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // auto-login if session active
  if (sessionStorage.getItem('fs_auth') === '1') {
    showAdmin();
    return;
  }
  setupLogin();
});

/* ================================================================
   LOGIN
   ================================================================ */
function setupLogin() {
  const form = document.getElementById('login-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const pw    = v('login-pw');
    const biz   = FoodshopDB.getBusiness();
    const valid = biz.adminPassword || 'admin123';
    if (pw === valid) {
      sessionStorage.setItem('fs_auth', '1');
      showAdmin();
    } else {
      el('login-err').style.display = 'flex';
      el('login-pw').value = '';
      el('login-pw').focus();
      setTimeout(() => { el('login-err').style.display = 'none'; }, 4000);
    }
  });

  el('toggle-pw')?.addEventListener('click', () => togglePw('login-pw'));
}

/* ================================================================
   ADMIN INIT
   ================================================================ */
function showAdmin() {
  el('page-login').style.display = 'none';
  el('page-admin').style.display = 'block';
  setupTabs();
  refreshStats();
  renderProductGrid();
  renderServicesList();
  loadSettings();
  bindSettingsLive();
  el('btn-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem('fs_auth');
    location.reload();
  });
}

/* ================================================================
   TABS
   ================================================================ */
function setupTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
      document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      btn.classList.add('on');
      const panel = document.getElementById(btn.dataset.panel);
      if (panel) panel.style.display = 'block';
    });
  });
}

/* ================================================================
   STATS
   ================================================================ */
function refreshStats() {
  const biz   = FoodshopDB.getBusiness();
  const prods = FoodshopDB.getProducts();
  const svcs  = FoodshopDB.getServices();

  setTxt('s-prods', prods.length);
  setTxt('s-svcs',  svcs.length);
  setTxt('s-views', biz.pageViews || 0);
  setTxt('s-wa',    biz.whatsapp ? '✓' : '✗');
  el('s-wa').style.color = biz.whatsapp ? '#27ae60' : '#e74c3c';

  const badge = el('prod-count-badge');
  if (badge) badge.textContent = prods.length + ' items';
}

/* ================================================================
   PRODUCTS — grid render
   ================================================================ */
function renderProductGrid() {
  const grid  = el('prod-grid');
  const prods = FoodshopDB.getProducts();

  if (!prods.length) {
    grid.innerHTML = `
      <div class="admin-empty" style="grid-column:1/-1">
        <div class="ae-icon">🛒</div>
        <div class="ae-title">No Products Yet</div>
        <p class="ae-sub">Click "Add Product" to get started.</p>
        <button class="btn btn-primary" onclick="openAddProduct()">➕ Add First Product</button>
      </div>`;
    return;
  }

  grid.innerHTML = prods.map(p => `
    <div class="prod-card" data-id="${p.id}">
      ${p.image
        ? `<img class="pc-img" src="${ea(p.image)}" alt="${ea(p.name)}"
             onerror="this.parentElement.querySelector('.pc-img-ph').style.display='flex';this.style.display='none'">`
        : ''
      }
      <div class="pc-img-ph" style="${p.image ? 'display:none' : ''}">🥦</div>
      <div class="pc-body">
        <div class="pc-name">${esc(p.name)}</div>
        <div class="pc-desc">${esc(p.description || 'No description')}</div>
        <div class="pc-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditProduct('${p.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}', '${ea(p.name)}')">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ---- open add modal ---- */
function openAddProduct() {
  editId = null;
  el('modal-title').textContent = '➕ Add Product';
  el('prod-form').reset();
  el('f-img-preview').style.display = 'none';
  el('f-img-preview').src = '';
  openModal('modal-product');
}

/* ---- open edit modal ---- */
function openEditProduct(id) {
  const p = FoodshopDB.getProducts().find(x => x.id === id);
  if (!p) return;
  editId = id;
  el('modal-title').textContent = '✏️ Edit Product';
  setVal('f-name',    p.name);
  setVal('f-desc',    p.description);
  setVal('f-img-url', p.image);
  setVal('f-order',   p.order);
  const prev = el('f-img-preview');
  if (p.image) { prev.src = p.image; prev.style.display = 'block'; }
  else { prev.style.display = 'none'; }
  openModal('modal-product');
}

/* ---- delete ---- */
function deleteProduct(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  FoodshopDB.deleteProduct(id);
  toast('Product deleted.');
  renderProductGrid();
  refreshStats();
}

/* ---- form submit ---- */
document.addEventListener('DOMContentLoaded', () => {
  el('prod-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = v('f-name').trim();
    if (!name) { toast('Product name is required.', 'err'); return; }

    const product = {
      name,
      description: v('f-desc').trim(),
      image:       v('f-img-url').trim(),
      order:       parseInt(v('f-order')) || 999
    };

    if (editId) {
      FoodshopDB.updateProduct(editId, product);
      toast('Product updated!');
    } else {
      FoodshopDB.addProduct(product);
      toast('Product added!');
    }

    closeModal('modal-product');
    renderProductGrid();
    refreshStats();
  });

  /* image URL preview */
  el('f-img-url')?.addEventListener('input', function() {
    const prev = el('f-img-preview');
    if (this.value.trim()) {
      prev.src = this.value.trim();
      prev.style.display = 'block';
      prev.onerror = () => { prev.style.display = 'none'; };
    } else { prev.style.display = 'none'; }
  });

  /* file upload */
  el('f-img-file')?.addEventListener('change', function() {
    const file = this.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image too large (max 5 MB)', 'err'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      el('f-img-url').value = ev.target.result;
      el('f-img-preview').src = ev.target.result;
      el('f-img-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  /* drag & drop */
  const ua = el('upload-area');
  if (ua) {
    ['dragover', 'dragenter'].forEach(ev => ua.addEventListener(ev, e => {
      e.preventDefault(); ua.classList.add('drag');
    }));
    ['dragleave', 'drop'].forEach(ev => ua.addEventListener(ev, () => ua.classList.remove('drag')));
    ua.addEventListener('drop', e => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file?.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = ev => {
        el('f-img-url').value = ev.target.result;
        el('f-img-preview').src = ev.target.result;
        el('f-img-preview').style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }
});

/* ================================================================
   SERVICES
   ================================================================ */
function renderServicesList() {
  const list = el('svc-admin-list');
  const svcs = FoodshopDB.getServices();
  list.innerHTML = svcs.map((s, i) => `
    <div class="svc-admin-item">
      <span class="svc-num">${String(i+1).padStart(2,'0')}</span>
      <input type="text" class="svc-input" value="${esc(s)}" data-i="${i}" placeholder="Service name">
      <button class="btn btn-danger btn-sm" onclick="deleteSvc(${i})">🗑️</button>
    </div>
  `).join('');
}

function addService() {
  const d = FoodshopDB.get();
  d.services.push('New Service');
  FoodshopDB.save(d);
  renderServicesList();
  refreshStats();
  // focus last input
  setTimeout(() => {
    const inputs = document.querySelectorAll('.svc-input');
    if (inputs.length) { inputs[inputs.length-1].focus(); inputs[inputs.length-1].select(); }
  }, 80);
}

function deleteSvc(i) {
  const svcs = FoodshopDB.getServices();
  svcs.splice(i, 1);
  FoodshopDB.saveServices(svcs);
  renderServicesList();
  refreshStats();
}

function saveServices() {
  const inputs = document.querySelectorAll('.svc-input');
  const svcs   = [...inputs].map(inp => inp.value.trim()).filter(Boolean);
  FoodshopDB.saveServices(svcs);
  toast('Services saved!');
  renderServicesList();
  refreshStats();
}

/* ================================================================
   SETTINGS — load
   ================================================================ */
function loadSettings() {
  const biz = FoodshopDB.getBusiness();
  setVal('s-biz-name',   biz.name);
  setVal('s-whatsapp',   biz.whatsapp);
  setVal('s-cat',        biz.category);
  setVal('s-addr',       biz.address);
  setVal('s-mob-in',     biz.mobileIndia);
  setVal('s-mob-uae',    biz.mobileUAE);
  setVal('s-email',      biz.email);
  setVal('s-owner-name', biz.ownerName);
  setVal('s-owner-role', biz.ownerRole);
  setVal('s-about',      biz.aboutUs);
  setVal('s-banner',     biz.bannerImage);
  setVal('s-logo',       biz.logoImage);
  setVal('s-fb',         biz.facebook);
  setVal('s-ig',         biz.instagram);
  setVal('s-li',         biz.linkedin);
  setVal('s-yt',         biz.youtube);
  setVal('s-tw',         biz.twitter);

  // country
  const co = el('s-country');
  if (co && biz.defaultCountry) {
    const opt = co.querySelector(`option[value="${biz.defaultCountry}"]`);
    if (opt) opt.selected = true;
  }

  // image tiles
  showTile('preview-banner', 'prev-banner', biz.bannerImage);
  showTile('preview-logo',   'prev-logo',   biz.logoImage);
}

/* ---- live preview for image URL inputs ---- */
function bindSettingsLive() {
  el('s-banner')?.addEventListener('input', function() {
    showTile('preview-banner', 'prev-banner', this.value);
  });
  el('s-logo')?.addEventListener('input', function() {
    showTile('preview-logo', 'prev-logo', this.value);
  });
}

function showTile(tileId, imgId, url) {
  const tile = el(tileId);
  const img  = el(imgId);
  if (!tile || !img) return;
  if (url?.trim()) {
    img.src = url.trim();
    tile.style.display = 'block';
    img.onerror = () => { tile.style.display = 'none'; };
  } else {
    tile.style.display = 'none';
  }
}

/* ================================================================
   SETTINGS — save
   ================================================================ */
function saveSettings() {
  const newPw = v('s-pw').trim();
  const biz   = {
    name:          v('s-biz-name'),
    whatsapp:      v('s-whatsapp').replace(/\D/g,''),
    category:      v('s-cat'),
    address:       v('s-addr'),
    mobileIndia:   v('s-mob-in'),
    mobileUAE:     v('s-mob-uae'),
    email:         v('s-email'),
    ownerName:     v('s-owner-name'),
    ownerRole:     v('s-owner-role'),
    aboutUs:       v('s-about'),
    bannerImage:   v('s-banner'),
    logoImage:     v('s-logo'),
    facebook:      v('s-fb'),
    instagram:     v('s-ig'),
    linkedin:      v('s-li'),
    youtube:       v('s-yt'),
    twitter:       v('s-tw'),
    defaultCountry: el('s-country')?.value || '91'
  };
  if (newPw) biz.adminPassword = newPw;

  FoodshopDB.saveBusiness(biz);
  refreshStats();
  toast('✅ Settings saved successfully!');
  el('s-pw').value = '';
}

/* ================================================================
   RESET
   ================================================================ */
function resetAll() {
  if (!confirm('Reset ALL data to factory defaults? This will clear all products, services and settings!')) return;
  localStorage.removeItem('foodshop_v2');
  toast('Data reset. Reloading…');
  setTimeout(() => location.reload(), 1200);
}

/* ================================================================
   MODAL HELPERS
   ================================================================ */
function openModal(id)  { el(id)?.classList.add('open');  document.body.style.overflow='hidden'; }
function closeModal(id) { el(id)?.classList.remove('open'); document.body.style.overflow=''; }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-wrap')) { closeModal(e.target.id); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-wrap.open').forEach(m => closeModal(m.id));
  }
});

/* ================================================================
   TOGGLE PW VISIBILITY
   ================================================================ */
function togglePw(inputId) {
  const inp = el(inputId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

/* ================================================================
   TOAST
   ================================================================ */
function toast(msg, type = 'ok') {
  const t = el('a-toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = type === 'err' ? '' : '';
  t.classList.add('on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('on'), 3200);
}

/* ================================================================
   HELPERS
   ================================================================ */
function el(id)     { return document.getElementById(id); }
function v(id)      { return el(id)?.value || ''; }
function setVal(id,v){ const e=el(id); if(e) e.value=v||''; }
function setTxt(id,v){ const e=el(id); if(e) e.textContent=v; }
function esc(s)     { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function ea(s)      { return String(s||'').replace(/"/g,'&quot;'); }
