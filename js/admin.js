/* ============================================================
   FOODSHOP - Admin Panel Script
   ============================================================ */

let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
  setupLogin();
});

// ============================================================
// LOGIN
// ============================================================
function setupLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  // Auto-login if session active
  if (sessionStorage.getItem('admin_auth') === '1') {
    showAdminPanel();
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const pw = document.getElementById('admin-password').value;
    const biz = FoodshopDB.getBusiness();
    const correctPw = biz.adminPassword || 'admin123';

    if (pw === correctPw) {
      sessionStorage.setItem('admin_auth', '1');
      showAdminPanel();
    } else {
      showLoginError('Incorrect password. Please try again.');
      document.getElementById('admin-password').value = '';
      document.getElementById('admin-password').focus();
    }
  });

  // Toggle password visibility
  document.getElementById('toggle-pw')?.addEventListener('click', () => {
    const inp = document.getElementById('admin-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
}

function showLoginError(msg) {
  let err = document.getElementById('login-error');
  if (!err) return;
  err.textContent = msg;
  err.style.display = 'flex';
  setTimeout(() => { err.style.display = 'none'; }, 4000);
}

// ============================================================
// ADMIN PANEL
// ============================================================
function showAdminPanel() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('admin-page').style.display = 'block';
  initAdminPanel();
}

function initAdminPanel() {
  setupTabs();
  loadStats();
  loadProductsTab();
  loadSettingsTab();
  loadServicesTab();

  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('admin_auth');
    location.reload();
  });
}

// ============================================================
// TABS
// ============================================================
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      const target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.style.display = 'block';
    });
  });

  // Show first tab
  if (tabs.length) tabs[0].click();
}

// ============================================================
// STATS
// ============================================================
function loadStats() {
  const biz  = FoodshopDB.getBusiness();
  const prods = FoodshopDB.getProducts();
  const svcs  = FoodshopDB.getServices();

  setEl('stat-products', prods.length);
  setEl('stat-services', svcs.length);
  setEl('stat-views', biz.pageViews || 0);
}

// ============================================================
// PRODUCTS TAB
// ============================================================
function loadProductsTab() {
  const grid = document.getElementById('product-admin-grid');
  const products = FoodshopDB.getProducts();

  if (!products.length) {
    grid.innerHTML = `
      <div class="admin-empty" style="grid-column:1/-1">
        <div class="big-icon">🛒</div>
        <h4>No Products Yet</h4>
        <p>Click "Add Product" to get started.</p>
      </div>`;
    return;
  }

  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-admin-card';
    card.dataset.id = p.id;
    card.innerHTML = `
      ${p.image
        ? `<img class="pac-img" src="${escAttr(p.image)}" alt="${escAttr(p.name)}" onerror="this.style.display='none'">`
        : `<div class="pac-img-placeholder">🥦</div>`
      }
      <div class="pac-body">
        <div class="pac-title">${escHtml(p.name)}</div>
        <div class="pac-desc">${escHtml(p.description)}</div>
        <div class="pac-actions">
          <button class="btn btn-outline btn-sm" onclick="openEditProduct('${p.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct('${p.id}', '${escAttr(p.name)}')">🗑️ Delete</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openAddProduct() {
  editingProductId = null;
  document.getElementById('product-modal-title').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('prod-img-preview').style.display = 'none';
  document.getElementById('prod-img-preview').src = '';
  openModal('product-modal');
}

function openEditProduct(id) {
  const products = FoodshopDB.getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  editingProductId = id;
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('prod-name').value = p.name || '';
  document.getElementById('prod-description').value = p.description || '';
  document.getElementById('prod-image-url').value = p.image || '';
  document.getElementById('prod-order').value = p.order || '';

  const preview = document.getElementById('prod-img-preview');
  if (p.image) {
    preview.src = p.image;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  openModal('product-modal');
}

function confirmDeleteProduct(id, name) {
  if (confirm(`Delete product "${name}"? This cannot be undone.`)) {
    FoodshopDB.deleteProduct(id);
    showAdminToast('Product deleted.');
    loadProductsTab();
    loadStats();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Product form submit
  document.getElementById('product-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('prod-name').value.trim();
    const description = document.getElementById('prod-description').value.trim();
    const image = document.getElementById('prod-image-url').value.trim();
    const order = parseInt(document.getElementById('prod-order').value) || 999;

    if (!name) { showAdminToast('Product name is required.', 'error'); return; }

    const product = { name, description, image, order };

    if (editingProductId) {
      FoodshopDB.updateProduct(editingProductId, product);
      showAdminToast('Product updated successfully!');
    } else {
      FoodshopDB.addProduct(product);
      showAdminToast('Product added successfully!');
    }

    closeModal('product-modal');
    loadProductsTab();
    loadStats();
  });

  // Image URL preview
  document.getElementById('prod-image-url')?.addEventListener('input', function() {
    const preview = document.getElementById('prod-img-preview');
    if (this.value.trim()) {
      preview.src = this.value.trim();
      preview.style.display = 'block';
      preview.onerror = () => { preview.style.display = 'none'; };
    } else {
      preview.style.display = 'none';
    }
  });

  // Image file upload
  document.getElementById('prod-img-file')?.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const preview = document.getElementById('prod-img-preview');
      preview.src = ev.target.result;
      preview.style.display = 'block';
      document.getElementById('prod-image-url').value = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Drag & drop on upload area
  const uploadArea = document.querySelector('.img-upload-area');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', e => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', e => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          document.getElementById('prod-img-preview').src = ev.target.result;
          document.getElementById('prod-img-preview').style.display = 'block';
          document.getElementById('prod-image-url').value = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

// ============================================================
// SERVICES TAB
// ============================================================
function loadServicesTab() {
  const list = document.getElementById('services-admin-list');
  const services = FoodshopDB.getServices();
  list.innerHTML = '';

  services.forEach((svc, i) => {
    const item = document.createElement('div');
    item.className = 'service-item';
    item.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0;';
    item.innerHTML = `
      <span class="num-badge">${String(i+1).padStart(2,'0')}</span>
      <input type="text" value="${escAttr(svc)}" data-index="${i}"
        style="flex:1;padding:8px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;outline:none;">
      <button class="btn btn-danger btn-sm" onclick="deleteService(${i})" title="Remove">🗑️</button>
    `;
    list.appendChild(item);
  });
}

function saveServices() {
  const inputs = document.querySelectorAll('#services-admin-list input[data-index]');
  const services = [];
  inputs.forEach(inp => {
    const val = inp.value.trim();
    if (val) services.push(val);
  });
  FoodshopDB.saveServices(services);
  showAdminToast('Services saved!');
  loadServicesTab();
  loadStats();
}

function addService() {
  const data = FoodshopDB.get();
  data.services.push('New Service');
  FoodshopDB.save(data);
  loadServicesTab();
  // Focus the last input
  setTimeout(() => {
    const inputs = document.querySelectorAll('#services-admin-list input');
    if (inputs.length) {
      const last = inputs[inputs.length - 1];
      last.focus();
      last.select();
    }
  }, 100);
}

function deleteService(index) {
  const services = FoodshopDB.getServices();
  services.splice(index, 1);
  FoodshopDB.saveServices(services);
  loadServicesTab();
}

// ============================================================
// SETTINGS TAB
// ============================================================
function loadSettingsTab() {
  const biz = FoodshopDB.getBusiness();
  setVal('set-biz-name', biz.name);
  setVal('set-owner-name', biz.ownerName);
  setVal('set-owner-role', biz.ownerRole);
  setVal('set-category', biz.category);
  setVal('set-address', biz.address);
  setVal('set-mobile-india', biz.mobileIndia);
  setVal('set-mobile-uae', biz.mobileUAE);
  setVal('set-email', biz.email);
  setVal('set-whatsapp', biz.whatsapp);
  setVal('set-about', biz.aboutUs);
  setVal('set-banner-img', biz.bannerImage);
  setVal('set-logo-img', biz.logoImage);
  setVal('set-facebook', biz.facebook);
  setVal('set-instagram', biz.instagram);
  setVal('set-linkedin', biz.linkedin);
  setVal('set-youtube', biz.youtube);
  setVal('set-twitter', biz.twitter);
  setVal('set-admin-pw', biz.adminPassword);

  // Preview
  updateBannerPreview();
  updateLogoPreview();

  document.getElementById('set-banner-img')?.addEventListener('input', updateBannerPreview);
  document.getElementById('set-logo-img')?.addEventListener('input', updateLogoPreview);
}

function updateBannerPreview() {
  const url = document.getElementById('set-banner-img')?.value;
  const prev = document.getElementById('banner-img-preview');
  if (prev) { prev.src = url || ''; prev.style.display = url ? 'block' : 'none'; }
}

function updateLogoPreview() {
  const url = document.getElementById('set-logo-img')?.value;
  const prev = document.getElementById('logo-img-preview');
  if (prev) { prev.src = url || ''; prev.style.display = url ? 'block' : 'none'; }
}

function saveSettings() {
  const biz = {
    name: getVal('set-biz-name'),
    ownerName: getVal('set-owner-name'),
    ownerRole: getVal('set-owner-role'),
    category: getVal('set-category'),
    address: getVal('set-address'),
    mobileIndia: getVal('set-mobile-india'),
    mobileUAE: getVal('set-mobile-uae'),
    email: getVal('set-email'),
    whatsapp: getVal('set-whatsapp').replace(/\D/g,''),
    aboutUs: getVal('set-about'),
    bannerImage: getVal('set-banner-img'),
    logoImage: getVal('set-logo-img'),
    facebook: getVal('set-facebook'),
    instagram: getVal('set-instagram'),
    linkedin: getVal('set-linkedin'),
    youtube: getVal('set-youtube'),
    twitter: getVal('set-twitter'),
    adminPassword: getVal('set-admin-pw') || 'admin123'
  };

  FoodshopDB.saveBusiness(biz);
  showAdminToast('Settings saved successfully!');
}

function resetData() {
  if (confirm('Reset ALL data to defaults? This will delete all customizations!')) {
    localStorage.removeItem('foodshop_data');
    showAdminToast('Data reset. Reloading...');
    setTimeout(() => location.reload(), 1000);
  }
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ============================================================
// TOAST
// ============================================================
function showAdminToast(msg, type = 'success') {
  let t = document.getElementById('admin-toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'admin-toast ' + type;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(10px)';
  }, 3000);
}

// ============================================================
// HELPERS
// ============================================================
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = val || '';
}

function getVal(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escAttr(str) {
  return String(str||'').replace(/"/g,'&quot;');
}
