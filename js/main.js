/* ============================================================
   FOODSHOP - Main Page Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const data = FoodshopDB.get();
  const biz  = data.business;

  // Increment page views
  FoodshopDB.incrementViews();
  const views = FoodshopDB.getBusiness().pageViews;

  // ---- Banner ----
  setAttr('banner-bg-img', 'src', biz.bannerImage);
  setAttr('banner-logo',   'src', biz.logoImage);

  // Company name split for banner (Name + sub)
  const nameParts = biz.name.split(' ');
  const subIndex  = nameParts.findIndex(w => w === 'Trading' || w === 'FZE' || w === 'LLC' || w === 'Pvt' || w === 'Ltd');
  if (subIndex > 0) {
    setText('banner-name', nameParts.slice(0, subIndex).join(' '));
    setText('banner-sub',  nameParts.slice(subIndex).join(' '));
  } else {
    setText('banner-name', biz.name);
    setText('banner-sub',  '');
  }

  // ---- Profile ----
  setAttr('profile-avatar', 'src', biz.logoImage);
  setText('owner-name',  biz.ownerName);
  setText('owner-role',  biz.ownerRole);
  setText('views-count', views);

  // ---- Business Details ----
  setText('biz-name',        biz.name);
  setText('biz-category',    biz.category);
  setText('biz-address',     biz.address);
  setText('biz-mobile-india',biz.mobileIndia);
  setText('biz-mobile-uae',  biz.mobileUAE);
  setText('biz-email',       biz.email);

  document.getElementById('biz-email').onclick = () => {
    window.location.href = 'mailto:' + biz.email;
  };

  // ---- About ----
  document.getElementById('about-text').innerHTML = biz.aboutUs;

  // ---- Page title ----
  document.title = biz.name;

  // ---- Country select default ----
  const countrySel = document.getElementById('wa-country');
  if (biz.defaultCountry) {
    const code = biz.defaultCountry.replace('+','').replace('-','');
    const opt  = countrySel.querySelector(`option[value="${code}"]`);
    if (opt) opt.selected = true;
  }

  // ---- WhatsApp send ----
  document.getElementById('btn-wa-send').addEventListener('click', () => {
    const code = countrySel.value;
    const num  = document.getElementById('wa-number').value.trim().replace(/\D/g,'');
    if (!num) { showToast('Please enter a WhatsApp number'); return; }
    const msg = encodeURIComponent(
      `Hello! I found *${biz.name}* and would like to connect.`
    );
    window.open(`https://wa.me/${code}${num}?text=${msg}`, '_blank');
  });

  // ---- Share ----
  document.getElementById('btn-share').addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: biz.name, url: location.href }); return; }
      catch(e) {}
    }
    try {
      await navigator.clipboard.writeText(location.href);
      showToast('Link copied!');
    } catch(e) {
      showToast('Copy the URL from your address bar');
    }
  });

  // ---- Install button ----
  if (!biz.showInstallBtn) {
    const ib = document.getElementById('btn-install');
    if (ib) ib.style.display = 'none';
  }

  // ---- Services ----
  renderServices(data.services);

  // ---- Products ----
  renderProducts(FoodshopDB.getProducts(), biz);

  // ---- Social links ----
  setSocial('link-fb', biz.facebook);
  setSocial('link-ig', biz.instagram);
  setSocial('link-li', biz.linkedin);
  setSocial('link-yt', biz.youtube);
  setSocial('link-tw', biz.twitter);

  // ---- Card toggles ----
  document.querySelectorAll('.card-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const targetId = hdr.dataset.target;
      const body     = document.getElementById(targetId);
      const chevron  = hdr.querySelector('.chevron');
      if (!body) return;
      const isHidden = body.classList.toggle('hidden');
      if (chevron) chevron.classList.toggle('collapsed', isHidden);
      hdr.classList.toggle('open', !isHidden);
    });
  });

  // ---- Back to top ----
  const btt = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btt.classList.toggle('show', window.scrollY > 300);
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

/* ---- Render services list ---- */
function renderServices(services) {
  const ul = document.getElementById('services-list');
  if (!ul) return;
  if (!services || !services.length) {
    ul.innerHTML = '<li style="color:#aaa;font-size:13px;padding:12px 0;">No services listed yet.</li>';
    return;
  }
  ul.innerHTML = services.map((s, i) =>
    `<li><span class="num-badge">${pad(i+1)}</span>${esc(s)}</li>`
  ).join('');
}

/* ---- Render products ---- */
function renderProducts(products, biz) {
  const container = document.getElementById('products-list');
  if (!container) return;

  if (!products || !products.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>No products yet. Check back soon!</p>
      </div>`;
    return;
  }

  container.innerHTML = products.map((p, i) => `
    <div class="product-entry">
      <div class="product-num-row">
        <span class="num-badge">${pad(i+1)}</span>
        <span class="product-name">${esc(p.name)}</span>
      </div>
      <div class="product-img-box">
        ${p.image
          ? `<img class="main-img" src="${eAttr(p.image)}" alt="${eAttr(p.name)}" loading="lazy"
               onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;font-size:72px;\'>🥦</div>'">`
          : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:72px;">🥦</div>'
        }
        ${biz.logoImage
          ? `<img class="product-watermark" src="${eAttr(biz.logoImage)}" alt="logo" onerror="this.style.display='none'">`
          : ''
        }
      </div>
      ${p.description
        ? `<p class="product-desc">${esc(p.description)}</p>`
        : ''
      }
      <a class="inquiry-btn" href="${waLink(biz.whatsapp, p.name, biz.name)}" target="_blank" rel="noopener">
        Inquiry
      </a>
    </div>
  `).join('');
}

/* ---- Build WhatsApp inquiry link ---- */
function waLink(waNumber, productName, bizName) {
  const num = (waNumber || '').replace(/\D/g, '');
  if (!num) return '#';
  const msg = encodeURIComponent(
    `Hello *${bizName}*!\n\nI'm interested in: *${productName}*\n\nPlease share details, pricing and availability. Thank you!`
  );
  return `https://wa.me/${num}?text=${msg}`;
}

/* ---- Social link helper ---- */
function setSocial(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (url && url.trim() && url !== '#') {
    el.href = url.trim();
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}

/* ---- DOM helpers ---- */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '';
}

function setAttr(id, attr, val) {
  const el = document.getElementById(id);
  if (el && val) el[attr] = val;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function eAttr(s) {
  return String(s || '').replace(/"/g,'&quot;');
}

/* ---- Toast ---- */
function showToast(msg, duration = 2800) {
  const t = document.getElementById('toast') || document.querySelector('.toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), duration);
}
