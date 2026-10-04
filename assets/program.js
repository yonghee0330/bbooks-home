/* 비북스 프로그램 아카이브 페이지 렌더러 — data/programs.js 를 읽어 그립니다. */
(function () {
  var key = document.body.dataset.program;
  var base = document.body.dataset.base || '';
  var P = (window.BB_PROGRAMS || {})[key], G = window.BB_GALLERY || {};
  var app = document.getElementById('app');
  if (!P || !app) return;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function src(p) { return base + p; }
  document.body.style.setProperty('--c', P.color);
  if (P.theme === 'dark') document.body.classList.add('dark');

  var IG = 'https://www.instagram.com/b_books2026/';
  var n = P.next || {}, open = n.status === 'open';
  var eps = (P.episodes || []).slice().reverse();

  var html = '';
  html += '<section class="hero"><div class="wrap"><div class="hero-grid"><div>' +
    '<span class="en">' + esc(P.en) + ' · ' + esc(P.name) + ' — ' + esc(P.sub) + '</span>' +
    '<h1>' + P.headline + '</h1>' +
    '<p class="intro">' + esc(P.intro) + '</p>' +
    '<dl class="facts">' + (P.facts || []).map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>' +
    '</div><figure class="print"><img src="' + esc(src(P.hero)) + '" alt="' + esc(P.heroAlt) + '"><figcaption>' + esc(P.en) + ' · 비북스</figcaption></figure></div>';

  html += '<div class="next" id="next">' +
    '<div><span class="kicker"><span class="dot"></span>' + (open ? '모집 중 · Now open' : '다음 회차 · Coming soon') + '</span>' +
    '<h2><span class="no">' + esc(n.no) + '</span>' + esc(n.title) + '</h2>' +
    '<p>' + esc(n.text) + '</p>' + (n.date ? '<p class="when">' + esc(n.date) + '</p>' : '') +
    '<div class="acts">' +
    (open && n.applyUrl ? '<a class="btn solid" href="' + esc(n.applyUrl) + '" target="_blank" rel="noopener">' + esc(n.applyLabel || '신청하기') + '</a>' : '') +
    '<a class="btn" href="' + IG + '" target="_blank" rel="noopener">인스타그램에서 소식 받기</a>' +
    '<a class="btn" href="#archive">지난 기록 보기 ↓</a>' +
    '</div></div>' +
    '<div class="stamp ' + (open ? 'open' : 'soon') + '" aria-hidden="true"><div>' + (open ? '<b>OPEN</b><span>모집 중</span>' : '<span>NEXT</span><b>COMING<br>SOON</b><span>준비 중</span>') + '</div></div>' +
    '</div></div></section>';

  html += '<section class="archive" id="archive"><div class="wrap">' +
    '<div class="arch-head"><h2><small>ARCHIVE · 지나온 ' + esc(P.name) + '</small>쌓여 가는 ' + esc(P.en) + ' 기록</h2>' +
    '<p class="count"><b>' + eps.length + '</b>' + esc(P.unit || '번의 기록') + '</p></div>' +
    eps.map(function (e) {
      var imgs = G[e.g] || [];
      var thumbs = imgs.slice(1, 7);
      return '<article class="ep">' +
        '<button type="button" class="cover" data-g="' + esc(e.g) + '" data-i="0" data-no="' + esc(e.no) + '" data-title="' + esc(e.title) + '"><img src="' + esc(src(imgs[0])) + '" alt="' + esc(e.title) + ' 표지" loading="lazy">' + (imgs.length > 1 ? '<span class="cnt">사진 ' + imgs.length + '</span>' : '') + '</button>' +
        '<div><span class="no">' + esc(e.no) + '</span><p class="date">' + esc(e.date) + '</p><h3>' + esc(e.title) + '</h3><p class="meta">' + esc(e.meta) + '</p>' +
        (e.summary ? '<p class="summary">' + esc(e.summary) + '</p>' : '') +
        (thumbs.length ? '<div class="thumbs">' + thumbs.map(function (t, i) {
          var more = (i === thumbs.length - 1 && imgs.length > 7) ? '<span class="more">+' + (imgs.length - 7) + '</span>' : '';
          return '<button type="button" data-g="' + esc(e.g) + '" data-i="' + (i + 1) + '" data-no="' + esc(e.no) + '" data-title="' + esc(e.title) + '" aria-label="' + esc(e.title) + ' 사진 ' + (i + 2) + '"><img src="' + esc(src(t)) + '" alt="" loading="lazy">' + more + '</button>';
        }).join('') + '</div>' : '') +
        '</div></article>';
    }).join('') +
    '</div></section>';

  html += '<div class="wrap"><footer class="foot"><span>비북스 · 부천시 원미구 부천로136번길 24, 지하 B02호 · <a href="tel:050713534850">0507-1353-4850</a></span><span><a href="' + base + 'index.html#stage">비북스 아카이브 전체 보기</a> · <a href="' + IG + '" target="_blank" rel="noopener">Instagram</a></span></footer></div>';
  html += '<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="사진 보기" hidden><div class="lb-top"><div><span class="lb-no"></span><b class="lb-title"></b></div><span class="lb-count"></span><button type="button" class="lb-x" aria-label="닫기">×</button></div><div class="lb-track"></div><button type="button" class="lb-arrow prev" aria-label="이전 사진">←</button><button type="button" class="lb-arrow next" aria-label="다음 사진">→</button></div>';
  app.innerHTML = html;

  // 스크롤하면 회차가 차례로 올라옴
  var eps2 = app.querySelectorAll('.ep');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .12 });
    eps2.forEach(function (e) { io.observe(e); });
  } else eps2.forEach(function (e) { e.classList.add('in'); });

  // 라이트박스
  var lb = document.getElementById('lb'), tr = lb.querySelector('.lb-track'), cnt = lb.querySelector('.lb-count'), last;
  function count() { var w = tr.clientWidth || 1; cnt.textContent = (Math.round(tr.scrollLeft / w) + 1) + ' / ' + tr.children.length; }
  function show(btn) {
    var imgs = G[btn.dataset.g] || []; last = btn;
    lb.querySelector('.lb-no').textContent = btn.dataset.no;
    lb.querySelector('.lb-title').textContent = btn.dataset.title;
    tr.innerHTML = imgs.map(function (p, i) { return '<figure><img src="' + esc(src(p)) + '" alt="' + esc(btn.dataset.title) + ' 사진 ' + (i + 1) + '"></figure>'; }).join('');
    lb.hidden = false; document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { tr.scrollLeft = (+btn.dataset.i || 0) * tr.clientWidth; count(); });
    lb.querySelector('.lb-x').focus();
  }
  function close() { lb.hidden = true; document.body.style.overflow = ''; tr.innerHTML = ''; if (last) last.focus(); }
  function go(d) { tr.scrollBy({ left: d * tr.clientWidth, behavior: 'smooth' }); }
  app.addEventListener('click', function (e) { var b = e.target.closest('.cover, .thumbs button'); if (b) show(b); });
  lb.querySelector('.lb-x').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', function () { go(-1); });
  lb.querySelector('.next').addEventListener('click', function () { go(1); });
  tr.addEventListener('scroll', function () { requestAnimationFrame(count); }, { passive: true });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1);
  });
})();
