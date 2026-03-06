/* ============================================================
   FOODSHOP - Main Page Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const data = FoodshopDB.get();
  const biz  = data.business;

  // -- Increment views --
  FoodshopDB.incrementViews();
  const views = FoodshopDB.getBusiness().pageViews;

  // ---- Populate Business Info ----
  set('banner-img', biz.bannerImage, 'src');
  set('banner-logo-img', biz.logoImage, 'src');
  set('banner-name', biz.name);
  set('banner-tagline', biz.category.split(',')[0].trim() + ' & more');
  set('profile-avatar', biz.logoImage, 'src');
  set('owner-name', biz.ownerName);
  set('owner-role', biz.ownerRole);
  set('views-count', views);
  set('biz-name', biz.name);
  set('biz-category', biz.category);
  set('biz-address', biz.address);
  set('biz-mobile-india', biz.mobileIndia);
  set('biz-mobile-uae', biz.mobileUAE);
  set('biz-email', biz.email);
  document.getElementById('about-text').innerHTML = biz.aboutUs;

  // -- page title --
  document.title = biz.name;
  document.querySelector('meta[name="description"]').content =
    biz.name + ' - ' + biz.category;

  // ---- Default Country Code ----
  const countrySelect = document.getElementById('country-select');
  if (countrySelect && biz.defaultCountry) {
    const opt = countrySelect.querySelector(`option[value="${biz.defaultCountry}"]`);
    if (opt) opt.selected = true;
  }

  // ---- WhatsApp Send ----
  document.getElementById('btn-wa-send').addEventListener('click', () => {
    const code = countrySelect.value;
    const num  = document.getElementById('wa-number-input').value.trim().replace(/\D/g, '');
    if (!num) { showToast('Please enter a WhatsApp number'); return; }
    const full = code.replace('+','') + num;
    const msg  = encodeURIComponent(
      `Hello! I found your business *${biz.name}* and would like to know more.`
    );
    window.open(`https://wa.me/${full}?text=${msg}`, '_blank');
  });

  // ---- Share ----
  document.getElementById('btn-share').addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: biz.name, url: location.href });
      } else {
        await navigator.clipboard.writeText(location.href);
        showToast('Link copied to clipboard!');
      }
    } catch (e) {
      showToast('Could not share. Try copying the URL manually.');
    }
  });

  // ---- Install Button ----
  const installBtn = document.getElementById('btn-install');
  if (!biz.showInstallBtn) installBtn.style.display = 'none';

  // ---- Services ----
  renderServices(data.services);

  // ---- Products ----
  renderProducts(FoodshopDB.getProducts(), biz.whatsapp, biz.name, biz.logoImage);

  // ---- Social Links ----
  setSocial('link-fb',  biz.facebook);
  setSocial('link-ig',  biz.instagram);
  setSocial('link-li',  biz.linkedin);
  setSocial('link-yt',  biz.youtube);
  setSocial('link-tw',  biz.twitter);

  // ---- Card Toggle ----
  document.querySelectorAll('.card-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const icon = header.querySelector('.toggle-icon');
      body.classList.toggle('collapsed');
      if (icon) icon.classList.toggle('open');
    });
  });

  // ---- Back to Top ----
  const btt = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 300);
  });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---- Email click ----
  const emailEl = document.getElementById('biz-email');
  if (emailEl) {
    emailEl.style.cursor = 'pointer';
    emailEl.addEventListener('click', () => {
      window.location.href = `mailto:${biz.email}`;
    });
  }
});

// ---- Render Services ----
function renderServices(services) {
  const ul = document.getElementById('services-list');
  if (!ul) return;
  ul.innerHTML = '';
  services.forEach((svc, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="num-badge">${String(i+1).padStart(2,'0')}</span>${escHtml(svc)}`;
    ul.appendChild(li);
  });
}

// ---- Render Products ----
function renderProducts(products, waNumber, bizName, logoImg) {
  const container = document.getElementById('products-list');
  if (!container) return;

  if (!products.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>No products added yet. Check back soon!</p>
      </div>`;
    return;
  }

  container.innerHTML = '';
  products.forEach((product, i) => {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
      <div class="product-number-row">
        <span class="num-badge">${String(i+1).padStart(2,'0')}</span>
        <h4>${escHtml(product.name)}</h4>
      </div>
      <div class="product-img-wrap">
        ${product.image
          ? `<img src="${escAttr(product.image)}" alt="${escAttr(product.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80'">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;">🥦</div>`
        }
        ${logoImg ? `<img class="product-watermark" src="${escAttr(logoImg)}" alt="logo">` : ''}
      </div>
      <p class="product-description">${escHtml(product.description)}</p>
      <a class="btn-inquiry" href="${makeWALink(waNumber, product.name, bizName)}" target="_blank" rel="noopener">
        Inquiry
      </a>
    `;
    container.appendChild(div);
  });
}

// ---- Build WhatsApp Link ----
function makeWALink(waNumber, productName, bizName) {
  const num = waNumber ? waNumber.replace(/\D/g,'') : '';
  if (!num) return '#';
  const msg = encodeURIComponent(
    `Hello *${bizName}*!\n\nI am interested in your product: *${productName}*\n\nPlease share more details, pricing, and availability.`
  );
  return `https://wa.me/${num}?text=${msg}`;
}

// ---- Set Social Link ----
function setSocial(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (url) {
    el.href = url;
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}

// ---- Helpers ----
function set(id, value, attr) {
  const el = document.getElementById(id);
  if (!el) return;
  if (attr) el[attr] = value || '';
  else el.textContent = value || '';
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function escAttr(str) {
  return String(str || '').replace(/"/g,'&quot;');
}

function showToast(msg, duration = 2500) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}
