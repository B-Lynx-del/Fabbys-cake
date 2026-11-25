/* FABBY'S CAKES site script. Cakes, flavours, photos and orders are managed from admin.html */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kes = n => 'KES ' + Number(n || 0).toLocaleString('en-KE');
const load = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch (e) { return f; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

/* ---- Change your contact details here ---- */
const PHONE = '254700000000';          /* WhatsApp number: digits only, no + or spaces */
const PHONE_SHOW = '+254 700 000 000';
const EMAIL = 'hello@fabbycakes.co.ke';
/* ------------------------------------------ */

const CATS = ['Birthday', 'Wedding', 'Graduation', 'Custom made'];
const ICONS = { 'Birthday': '🎂', 'Wedding': '💍', 'Graduation': '🎓', 'Custom made': '🎨' };
const SLIDE_DEFAULTS = [
  { t: 'Birthday cakes, baked fresh', p: 'Made to order for your big day.', c: 'Birthday' },
  { t: 'Wedding cakes for your big day', p: 'Beautiful tiers, made your way.', c: 'Wedding' },
  { t: 'Custom made, just for you', p: 'Bring your idea and we will bake it.', c: 'Custom made' }];
const ART = '<svg viewBox="0 0 160 140" fill="none"><rect x="30" y="90" width="100" height="30" rx="4" fill="#F7E3C4" stroke="#2B1810" stroke-width="2"/><rect x="45" y="55" width="70" height="30" rx="4" fill="#F2C6C9" stroke="#2B1810" stroke-width="2"/><rect x="58" y="24" width="44" height="26" rx="4" fill="#E8A33D" stroke="#2B1810" stroke-width="2"/><circle cx="80" cy="18" r="5" fill="#C6425E"/></svg>';

/* shrink a photo so it fits in browser storage (used by the admin panel) */
function shrink(file, max = 800, q = 0.82) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => {
        const k = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement('canvas');
        c.width = Math.round(i.width * k); c.height = Math.round(i.height * k);
        c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', q));
      };
      i.onerror = rej; i.src = r.result;
    };
    r.onerror = rej; r.readAsDataURL(file);
  });
}

/* ---- data (shared with the admin panel) ---- */
let cakes = load('fabby_cakes', null);
if (!Array.isArray(cakes)) {
  cakes = [
    { id: 1, name: 'Red Velvet Classic', cat: 'Birthday', price: 3500, desc: 'Cream cheese frosting, two layers.', img: '', featured: true },
    { id: 2, name: 'Chocolate Fudge', cat: 'Birthday', price: 3200, desc: 'Rich chocolate sponge and ganache.', img: '' },
    { id: 3, name: 'Three-Tier Celebration', cat: 'Wedding', price: 18000, desc: 'Weddings, anniversaries, milestone birthdays.', img: '', featured: true },
    { id: 4, name: 'Graduation Cap Cake', cat: 'Graduation', price: 4500, desc: 'Your colours, your course, your name.', img: '', featured: true },
    { id: 5, name: 'Your Own Design', cat: 'Custom made', price: 4000, desc: 'Tell us your idea. We quote before we bake.', img: '' }];
}
cakes.forEach(c => { if (!CATS.includes(c.cat)) c.cat = 'Custom made'; });
save('fabby_cakes', cakes);

let flavours = load('fabby_flavours', null);
if (!Array.isArray(flavours)) { flavours = ['Vanilla', 'Chocolate', 'Red Velvet', 'Strawberry', 'Lemon', 'Marble', 'Black Forest', 'Coffee']; save('fabby_flavours', flavours); }

let slides = load('fabby_slides', null);
if (!Array.isArray(slides) || slides.length !== 3) { slides = [{ img: '', title: '' }, { img: '', title: '' }, { img: '', title: '' }]; save('fabby_slides', slides); }

/* ---- every page ---- */
const toggle = $('.nav-toggle'), siteHeader = $('.site-header');
if (toggle) toggle.addEventListener('click', () => {
  const open = siteHeader.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
$$('[data-phone]').forEach(a => { a.href = 'tel:+' + PHONE; a.textContent = PHONE_SHOW; });
$$('[data-email]').forEach(a => { a.href = 'mailto:' + EMAIL; a.textContent = EMAIL; });
$$('[data-wa]').forEach(a => { a.href = 'https://wa.me/' + PHONE; });
$$('#flavours').forEach(b => { b.innerHTML = flavours.length ? flavours.map(f => `<span>${esc(f)}</span>`).join('') : '<p class="empty-note">Ask us which flavours we have today.</p>'; });

const card = c => `<article class="cake-card"><div class="cake-art">${c.img ? `<img src="${esc(c.img)}" alt="${esc(c.name)}" loading="lazy">` : ART}</div>
<div class="cake-card-body"><h3>${esc(c.name)}</h3><p class="muted">${esc(c.desc)}</p><span class="cake-price">${kes(c.price)}</span><br>
<a class="btn btn-primary" href="order.html?cake=${encodeURIComponent(c.name)}">Order this</a></div></article>`;

/* ---- home page ---- */
const feat = $('#featured');
if (feat) {
  const pick = [...cakes.filter(c => c.featured).reverse(), ...cakes.filter(c => !c.featured)].slice(0, 3);
  feat.innerHTML = pick.map(card).join('');
  $('#types').innerHTML = CATS.map(c => {
    const n = cakes.filter(k => k.cat === c).length;
    return `<a class="type-tile" href="cakes.html?cat=${encodeURIComponent(c)}"><i>${ICONS[c]}</i>${c}<small>${n} ${n === 1 ? 'cake' : 'cakes'}</small></a>`;
  }).join('');
}

/* slider */
const track = $('#slides');
if (track) {
  track.innerHTML = SLIDE_DEFAULTS.map((d, i) => {
    const s = slides[i] || {};
    return `<div class="slide ${s.img ? 'photo' : 'd' + i}"${s.img ? ` style="background-image:url('${s.img}')"` : ''} role="group" aria-roledescription="slide" aria-label="${i + 1} of 3">
<div class="slide-copy"><span class="slide-eyebrow">FABBY'S CAKES · NAIROBI</span><h2>${esc(s.title || d.t)}</h2><p>${esc(d.p)}</p><a class="btn btn-light" href="cakes.html?cat=${encodeURIComponent(d.c)}">Discover the collection <span aria-hidden="true">→</span></a></div>
${s.img ? '' : `<div class="slide-cake-art" aria-hidden="true"><svg viewBox="0 0 420 360" xmlns="http://www.w3.org/2000/svg"><ellipse cx="212" cy="315" rx="165" ry="22" fill="#4B1D3B" opacity=".16"/><path d="M73 195h274v95c0 18-14 32-32 32H105c-18 0-32-14-32-32z" fill="#F8E6D8"/><path d="M73 195c0-25 61-45 137-45s137 20 137 45-61 45-137 45S73 220 73 195" fill="#FFF7ED"/><path d="M112 132h196v62c0 14-11 25-25 25H137c-14 0-25-11-25-25z" fill="#D98AA5"/><ellipse cx="210" cy="132" rx="98" ry="31" fill="#F6C9D5"/><path d="M154 87h112v43c0 9-7 16-16 16h-80c-9 0-16-7-16-16z" fill="#F7E8C9"/><ellipse cx="210" cy="87" rx="56" ry="19" fill="#FFF5E5"/><path d="M210 67c-17-20-3-32 0-42 13 16 17 27 0 42" fill="#C56B86"/><circle cx="159" cy="177" r="8" fill="#FFF5E5"/><circle cx="260" cy="184" r="8" fill="#FFF5E5"/><circle cx="210" cy="202" r="7" fill="#FFF5E5"/><path d="M103 270c22 14 43 14 64 0m86 0c21 14 42 14 64 0" stroke="#D98AA5" stroke-width="7" stroke-linecap="round"/></svg><span class="art-spark spark-one">✦</span><span class="art-spark spark-two">✧</span></div>`}
</div>`;
  }).join('');
  const dots = $('#dots'); let cur = 0, timer = null;
  dots.innerHTML = SLIDE_DEFAULTS.map((_, i) => `<button aria-label="Go to slide ${i + 1}" data-i="${i}"></button>`).join('');
  const go = n => {
    cur = (n + 3) % 3; track.style.transform = `translateX(-${cur * 100}%)`;
    $$('button', dots).forEach((b, i) => b.classList.toggle('on', i === cur));
    $$('.slide', track).forEach((s, i) => s.setAttribute('aria-hidden', i !== cur));
  };
  const play = () => { stop(); if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) timer = setInterval(() => go(cur + 1), 5000); };
  const stop = () => { clearInterval(timer); };
  $('.s-btn.prev').onclick = () => { go(cur - 1); play(); };
  $('.s-btn.next').onclick = () => { go(cur + 1); play(); };
  dots.onclick = e => { if (e.target.dataset.i) { go(+e.target.dataset.i); play(); } };
  const box = $('#slider'); box.addEventListener('mouseenter', stop); box.addEventListener('mouseleave', play);
  box.addEventListener('focusin', stop); box.addEventListener('focusout', play);
  go(0); play();
}

/* ---- cakes page ---- */
const chips = $('#cat-chips');
if (chips) {
  $$('[data-list]').forEach(box => {
    const list = cakes.filter(c => c.cat === box.dataset.list);
    box.innerHTML = list.length ? list.map(card).join('') : '<p class="empty-note">New cakes coming soon. Ask us about a custom one.</p>';
  });
  const show = c => {
    chips.innerHTML = ['All', ...CATS].map(x => `<button class="${x === c ? 'on' : ''}" data-c="${esc(x)}">${esc(x)}</button>`).join('');
    $$('.menu-category[data-cat]').forEach(s => { s.hidden = !(c === 'All' || s.dataset.cat === c); });
  };
  chips.onclick = e => { if (e.target.dataset.c) show(e.target.dataset.c); };
  const want = new URLSearchParams(location.search).get('cat');
  show(CATS.includes(want) ? want : 'All');
}

/* ---- order page ---- */
const form = $('#orderForm');
if (form) {
  const params = new URLSearchParams(location.search), el = form.elements;
  el.cake.innerHTML = cakes.map(c => `<option value="${esc(c.name)}">${esc(c.name)} (${kes(c.price)})</option>`).join('') + '<option value="Something else">Something else (we will quote you)</option>';
  el.flavour.innerHTML = flavours.map(f => `<option>${esc(f)}</option>`).join('') + '<option>Not sure, suggest one</option>';
  if (params.get('cake')) el.cake.value = params.get('cake');
  el.date.min = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(form));
    const cake = cakes.find(c => c.name === v.cake);
    const orders = load('fabby_orders', []);
    orders.push({
      id: orders.reduce((m, o) => Math.max(m, o.id || 0), 0) + 1, name: v.name.trim(), phone: v.phone.trim(), item: v.cake, date: v.date,
      total: cake ? cake.price : 0, notes: `${v.method} | Flavour: ${v.flavour}` + (v.notes.trim() ? ' | ' + v.notes.trim() : ''),
      status: 'New', created: new Date().toISOString()
    });
    save('fabby_orders', orders);
    const msg = `Hi FABBY'S CAKES! I'd like to order:\nCake: ${v.cake}\nFlavour: ${v.flavour}\nNeeded on: ${v.date}\n${v.method}\nName: ${v.name}\nNotes: ${v.notes || 'none'}`;
    $('#wa').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
    form.hidden = true;
    $('#order-status').classList.add('visible');
  });
}
