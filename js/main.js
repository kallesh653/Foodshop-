/* ================================================================
   FOODSHOP — Main page script
   ================================================================ */

document.addEventListener('DOMContentLoaded', init);

function init() {
  const db  = FoodshopDB.get();
  const biz = db.business;

  /* page views */
  FoodshopDB.incrementViews();
  const views = FoodshopDB.getBusiness().pageViews;

  /* ── banner ── */
  setImg('banner-bg',   biz.bannerImage);
  setImg('brand-logo',  biz.logoImage);
  setImg('profile-avatar', biz.logoImage);

  /* split company name for banner */
  const words    = biz.name.trim().split(' ');
  const splitAt  = words.findIndex(w => /^(Trading|FZE|LLC|Pvt|Ltd|Inc|Co\.)$/i.test(w));
  if (splitAt > 0) {
    setTxt('brand-name', words.slice(0, splitAt).join(' '));
    setTxt('brand-sub',  words.slice(splitAt).join(' '));
  } else {
    setTxt('brand-name', biz.name);
    setTxt('brand-sub',  '');
  }

  /* ── profile ── */
  setTxt('owner-name',   biz.ownerName);
  setTxt('owner-role',   biz.ownerRole);
  setTxt('views-count',  views);

  /* ── page meta ── */
  document.title = biz.name;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = biz.name + ' — ' + biz.category;

  /* ── business details ── */
  setTxt('biz-name',    biz.name);
  setTxt('biz-cat',     biz.category);
  setTxt('biz-addr',    biz.address);
  setTxt('biz-mob-in',  biz.mobileIndia);
  setTxt('biz-mob-uae', biz.mobileUAE);
  setTxt('biz-email',   biz.email);

  /* clickable links */
  el('biz-mob-in') ?.addEventListener('click', () => window.location.href = 'tel:' + biz.mobileIndia.replace(/\s/g,''));
  el('biz-mob-uae')?.addEventListener('click', () => window.location.href = 'tel:' + biz.mobileUAE.replace(/\s/g,''));
  el('biz-email')  ?.addEventListener('click', () => window.location.href = 'mailto:' + biz.email);

  /* ── about ── */
  const aboutEl = el('about-text');
  if (aboutEl) aboutEl.innerHTML = biz.aboutUs || '';

  /* ── default country code ── */
  const codeSel = el('wa-code');
  if (codeSel && biz.defaultCountry) {
    const opt = codeSel.querySelector(`option[value="${biz.defaultCountry}"]`);
    if (opt) opt.selected = true;
  }

  /* ── WhatsApp send ── */
  el('btn-wa')?.addEventListener('click', () => {
    const code = codeSel ? codeSel.value : '91';
    const num  = (el('wa-num')?.value || '').trim().replace(/\D/g, '');
    if (!num) { toast('Please enter a WhatsApp number'); return; }
    const msg  = encodeURIComponent(`Hello! I found *${biz.name}* and would like to connect.`);
    window.open(`https://wa.me/${code}${num}?text=${msg}`, '_blank');
  });

  /* ── page share ── */
  el('btn-share')?.addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: biz.name, url: location.href }); return; }
      catch {}
    }
    try {
      await navigator.clipboard.writeText(location.href);
      toast('Link copied to clipboard!');
    } catch {
      toast('Copy the URL from your address bar');
    }
  });

  /* ── install button ── */
  const installBtn = el('btn-install');
  if (installBtn) {
    if (biz.showInstallBtn === false) {
      installBtn.style.display = 'none';
    } else {
      // PWA install prompt if available
      let deferredPrompt;
      window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
      });
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') toast('App installed!');
          deferredPrompt = null;
        } else {
          toast('To install: tap browser menu → Add to Home Screen');
        }
      });
    }
  }

  /* ── services ── */
  renderServices(db.services);

  /* ── products ── */
  renderProducts(FoodshopDB.getProducts(), biz);

  /* ── social ── */
  linkSoc('soc-fb', biz.facebook);
  linkSoc('soc-ig', biz.instagram);
  linkSoc('soc-li', biz.linkedin);
  linkSoc('soc-yt', biz.youtube);
  linkSoc('soc-tw', biz.twitter);

  /* ── card toggle ── */
  document.querySelectorAll('.ch').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const cbId   = hdr.dataset.cb;
      const cb     = document.getElementById(cbId);
      const arrow  = hdr.querySelector('.ch-arrow');
      if (!cb) return;
      const closed = cb.classList.toggle('closed');
      if (arrow) arrow.classList.toggle('down', closed);
    });
  });

  /* ── back to top ── */
  const btt = el('back-top');
  window.addEventListener('scroll', () => btt?.classList.toggle('vis', scrollY > 300), { passive:true });
  btt?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

/* ================================================================
   RENDER  — Services
   ================================================================ */
function renderServices(list) {
  const ul = el('svc-list');
  if (!ul) return;
  if (!list?.length) {
    ul.innerHTML = '<li style="color:#aaa;padding:12px 0;">No services listed.</li>';
    return;
  }
  ul.innerHTML = list.map((s, i) =>
    `<li><span class="n-badge">${pad(i+1)}</span>${esc(s)}</li>`
  ).join('');
}

/* ================================================================
   RENDER  — Products
   ================================================================ */
function renderProducts(products, biz) {
  const wrap = el('products-list');
  if (!wrap) return;

  if (!products?.length) {
    wrap.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:#aaa;">
        <div style="font-size:54px;margin-bottom:12px;">🛒</div>
        <p style="font-weight:600;">No products yet. Check back soon!</p>
      </div>`;
    return;
  }

  wrap.innerHTML = products.map((p, i) => {
    const waHref = makeWaLink(biz.whatsapp, p.name, biz.name);
    const tag    = i < 3 ? '<div class="prod-tag">Popular</div>' : '';
    const imgHtml = p.image
      ? `<img class="p-img" src="${ea(p.image)}" alt="${ea(p.name)}" loading="lazy"
           onerror="this.style.display='none'">`
      : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:80px;opacity:.5;">🥦</div>`;
    const wmHtml = biz.logoImage
      ? `<img class="prod-wm" src="${ea(biz.logoImage)}" alt="logo" onerror="this.style.display='none'">`
      : '';
    const descHtml = p.description
      ? `<p class="prod-desc">${esc(p.description)}</p>`
      : '';

    return `
      <div class="prod-item">
        <div class="prod-title-row">
          <span class="n-badge">${pad(i+1)}</span>
          <span class="prod-name">${esc(p.name)}</span>
        </div>
        <div class="prod-img-card">
          ${imgHtml}
          ${wmHtml}
          ${tag}
        </div>
        ${descHtml}
        <div class="prod-footer">
          <a class="btn-inquiry" href="${waHref}" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 2C8.27 2 2 8.27 2 16c0 2.5.68 4.83 1.84 6.83L2 30l7.38-1.82A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm6.3 19.4c-.34-.17-2.02-1-2.33-1.11-.3-.11-.54-.17-.77.17-.22.34-.88 1.1-1.08 1.33-.2.23-.39.26-.73.09-.34-.18-1.44-.53-2.75-1.7-1.01-.9-1.7-2.02-1.9-2.36-.2-.33-.02-.52.15-.7.16-.16.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.02-.6-.09-.17-.77-1.86-1.06-2.55-.28-.67-.57-.58-.77-.59H10.6c-.22 0-.6.09-.91.43-.3.34-1.19 1.17-1.19 2.86s1.22 3.32 1.4 3.55c.17.23 2.39 3.64 5.8 5.12.8.34 1.43.55 1.92.71.81.26 1.55.22 2.13.13.65-.1 2-.82 2.29-1.61.28-.8.28-1.48.19-1.63-.09-.14-.32-.22-.66-.4z"/>
            </svg>
            Inquiry
          </a>
        </div>
      </div>`;
  }).join('');
}

/* ================================================================
   HELPERS
   ================================================================ */
function makeWaLink(waNum, productName, bizName) {
  const n = (waNum || '').replace(/\D/g, '');
  if (!n) return '#';
  const msg = encodeURIComponent(
    `Hello *${bizName}*! 👋\n\nI am interested in your product:\n*${productName}*\n\nCould you please share details, pricing and availability?\n\nThank you!`
  );
  return `https://wa.me/${n}?text=${msg}`;
}

function linkSoc(id, url) {
  const a = el(id);
  if (!a) return;
  if (url?.trim() && url !== '#') {
    a.href = url.trim();
    a.style.display = 'flex';
  } else {
    a.style.display = 'none';
  }
}

function el(id)      { return document.getElementById(id); }
function setTxt(id,v){ const e=el(id); if(e) e.textContent=v||''; }
function setImg(id,v){ const e=el(id); if(e&&v) e.src=v; }
function pad(n)      { return String(n).padStart(2,'0'); }
function esc(s)      { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function ea(s)       { return String(s||'').replace(/"/g,'&quot;'); }

function toast(msg, ms=3000) {
  const t = el('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('on'), ms);
}
