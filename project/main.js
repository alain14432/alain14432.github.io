// Short helpers
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* ----- Tabs ----- */
const links = $$('.menu a[data-tab]');
const tabs  = $$('.tab');
function showTab(id){
  tabs.forEach(t => t.classList.toggle('active', t.id === id));
  links.forEach(a => a.classList.toggle('active', a.dataset.tab === id));
  $('#'+id)?.focus({preventScroll:false});
  history.replaceState(null, "", "#"+id);
}
links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); showTab(a.dataset.tab); }));
if (location.hash && $(location.hash)) showTab(location.hash.slice(1));

/* ----- Typewriter ----- */
const tp = $('#typewriter');
const msg = "welcome";
let i=0; (function type(){ if(!tp) return; tp.textContent = msg.slice(0, i++); if(i<=msg.length) setTimeout(type, 35); })();

/* ----- Theme toggle ----- */
const root = document.documentElement;
const saved = localStorage.getItem('theme'); if(saved) root.setAttribute('data-theme', saved);
$('#themeToggle')?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next); localStorage.setItem('theme', next);
});

/* ----- Footer year ----- */
$('#year').textContent = new Date().getFullYear();

/* ----- Scroll reveal ----- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } });
}, {threshold: .12});
$$('.reveal').forEach(el => io.observe(el));

/* ===== Projects (search, filter, sort, accordion, lightbox) ===== */
const grid = $('#projectGrid');
if (grid){
  const cards = $$('.project', grid);
  const search = $('#projectSearch');
  const filters = $$('.filter-btn');
  const sortSel = $('#sortSelect');

  let query = '', filter = 'all', sort = 'date-desc';

  function match(card){
    const cat = card.dataset.category;
    const title = card.dataset.title.toLowerCase();
    const keys = (card.dataset.keywords || '').toLowerCase();
    return (filter==='all' || filter===cat) && (title.includes(query) || keys.includes(query));
  }
  function cmp(a,b){
    switch (sort){
      case 'date-asc':  return new Date(a.dataset.date) - new Date(b.dataset.date);
      case 'date-desc': return new Date(b.dataset.date) - new Date(a.dataset.date);
      case 'title-asc': return a.dataset.title.localeCompare(b.dataset.title);
      case 'title-desc':return b.dataset.title.localeCompare(a.dataset.title);
      default: return 0;
    }
  }
  function render(){
    const list = cards.slice().filter(match).sort(cmp);
    grid.innerHTML = ''; list.forEach(c => grid.appendChild(c));
  }

  search?.addEventListener('input', () => { query = search.value.trim().toLowerCase(); render(); });
  filters.forEach(b => b.addEventListener('click', () => {
    filters.forEach(x => x.classList.remove('active')); b.classList.add('active'); filter = b.dataset.filter; render();
  }));
  sortSel?.addEventListener('change', () => { sort = sortSel.value; render(); });

  // Accordion
  $$('.accordion-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('aria-controls');
      const panel = document.getElementById(id);
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  // Lightbox
  const lightbox = $('#lightbox'), img = $('#lightboxImg'), close = $('.lightbox-close');
  const prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn');
  let imgs = [], idx = 0;
  function open(images, start=0){ imgs=images; idx=start; update(); lightbox.hidden=false; }
  function update(){ img.src = imgs[idx]; }
  function closeLb(){ lightbox.hidden=true; imgs=[]; }
  function prev(){ idx = (idx-1+imgs.length)%imgs.length; update(); }
  function next(){ idx = (idx+1)%imgs.length; update(); }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.gallery-btn'); if(!btn) return;
    const card = e.target.closest('.project'); if(!card) return;
    const list = (card.dataset.images || '').split(',').map(s=>s.trim()).filter(Boolean);
    if (list.length) open(list, 0);
  });
  close?.addEventListener('click', closeLb);
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key==='Escape') closeLb();
    if (e.key==='ArrowLeft') prev();
    if (e.key==='ArrowRight') next();
  });

  render();
}

/* ----- Contact form feedback ----- */
const form = $('#contactForm'), msgEl = $('#formMsg');
form?.addEventListener('submit', (e)=>{
  e.preventDefault();
  if (!form.checkValidity()){ msgEl.textContent = "Please complete all fields correctly."; return; }
  msgEl.textContent = "Thanks! Your message passed client-side validation.";
  form.reset();
});
