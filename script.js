(function(){
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n){ return String(n).replace(/\d/g, function(d){ return AR[d]; }); }

  /* شريط الأشهر: من 8 كانون الأول 2024 إلى يوم القراءة، بمقياس خمسين عاماً = 600 شهر */
  var fall = new Date(2024, 11, 8), now = new Date();
  var months = (now.getFullYear() - fall.getFullYear()) * 12 + (now.getMonth() - fall.getMonth()) - (now.getDate() < fall.getDate() ? 1 : 0);
  months = Math.max(1, months);
  document.getElementById('months').textContent = ar(months) + (months > 10 ? ' شهراً' : ' أشهر');
  document.getElementById('nowFill').style.setProperty('--to', Math.max(0.006, months / 600).toFixed(4));

  /* شرر الحقل */
  var cv = document.getElementById('embers'), ctx = cv.getContext('2d'), P = [], W = 0, H = 0, live = true, running = false;
  var ember = getComputedStyle(root).getPropertyValue('--ember').trim();
  function size(){ var d = Math.min(window.devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  function seed(){ P = []; var n = Math.round(Math.min(70, W / 18)); for (var i = 0; i < n; i++) P.push(spawn(true)); }
  function spawn(any){ return {x: Math.random() * W, y: any ? Math.random() * H : H + 5, r: Math.random() * 1.6 + .4, v: Math.random() * .6 + .25, a: Math.random() * .6 + .2, w: Math.random() * 6.28}; }
  function tick(){
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = ember;
    for (var i = 0; i < P.length; i++) {
      var p = P[i]; p.y -= p.v; p.w += .02; p.x += Math.sin(p.w) * .35; p.a -= .0012;
      if (p.y < H * .15 || p.a <= 0) P[i] = p = spawn(false);
      ctx.globalAlpha = Math.max(0, p.a); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
    }
    if (live && !reduce) requestAnimationFrame(tick); else running = false;
  }
  function start(){ if (!running && live && !reduce) { running = true; requestAnimationFrame(tick); } }
  size(); seed();
  if ('IntersectionObserver' in window) new IntersectionObserver(function(e){ live = e[0].isIntersecting; start(); }).observe(cv);
  start();
  window.addEventListener('resize', function(){ size(); seed(); });

  /* الظهور مع القراءة */
  var targets = [].slice.call(document.querySelectorAll('.ink, .seq, #stamps, #files, #time, #road, #turned, #counter'));
  var seqs = [].slice.call(document.querySelectorAll('.seq'));
  seqs.forEach(function(el, i){ el.style.transitionDelay = (i * 0.35) + 's'; });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } });
    }, {rootMargin: '0px 0px -15% 0px'});
    targets.forEach(function(t){ io.observe(t); });
  } else {
    targets.forEach(function(t){ t.classList.add('seen'); });
  }

  /* الباب: يُغلق كلما اقترب القارئ من السطر الأخير */
  var door = document.getElementById('door'), gate = document.getElementById('gate');
  var L = document.getElementById('gateL'), R = document.getElementById('gateR'), glow = document.getElementById('glow');
  var GAP_L = 0.086, GAP_R = 0.086;
  function shut(){
    var r = door.getBoundingClientRect(), vh = window.innerHeight, w = gate.clientWidth;
    var p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.75 - r.top) / Math.max(1, r.height - vh * 0.25)));
    var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    L.style.transform = 'translateX(' + (GAP_L * w * e).toFixed(1) + 'px)';
    R.style.transform = 'translateX(' + (-GAP_R * w * e).toFixed(1) + 'px)';
    glow.style.opacity = (1 - e).toFixed(3);
  }
  var q = false;
  window.addEventListener('scroll', function(){ if (q) return; q = true; requestAnimationFrame(function(){ shut(); q = false; }); }, {passive: true});
  window.addEventListener('resize', shut);
  shut();

  /* المعرض: كل صورة تُفتح كاملة بعنوانها ووصفها، والأسهم تتنقل (اليمين للسابق) */
  var items = [], seenSrc = {};
  [].slice.call(document.querySelectorAll('img[data-title]')).forEach(function(im){
    var src = im.getAttribute('src'); if (seenSrc[src]) return; seenSrc[src] = true;
    items.push({src: src, alt: im.alt || '', title: im.getAttribute('data-title'), desc: im.getAttribute('data-desc'), w: im.getAttribute('width'), h: im.getAttribute('height')});
  });
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg');
  var lbTitle = document.getElementById('lbTitle'), lbDesc = document.getElementById('lbDesc'), lbPos = document.getElementById('lbPos');
  var cur = 0, opener = null;
  function show(i){
    cur = (i + items.length) % items.length; var it = items[cur];
    lbImg.src = it.src; lbImg.alt = it.alt; lbImg.width = it.w; lbImg.height = it.h;
    lbTitle.textContent = it.title; lbDesc.textContent = it.desc; lbPos.textContent = ar(cur + 1) + ' من ' + ar(items.length);
  }
  function openLb(src){
    opener = document.activeElement; var i = 0;
    for (var k = 0; k < items.length; k++) if (items[k].src === src) i = k;
    show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; document.getElementById('lbClose').focus();
  }
  function closeLb(){ lb.hidden = true; document.body.style.overflow = ''; if (opener && opener.focus) opener.focus(); }
  [].slice.call(document.querySelectorAll('[data-open]')).forEach(function(btn){
    btn.addEventListener('click', function(){ openLb(btn.querySelector('img').getAttribute('src')); });
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function(){ show(cur - 1); });
  document.getElementById('lbNext').addEventListener('click', function(){ show(cur + 1); });
  lb.addEventListener('click', function(e){ if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function(e){
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') show(cur - 1);
    else if (e.key === 'ArrowLeft') show(cur + 1);
    else if (e.key === 'Tab') {
      var f = [].slice.call(lb.querySelectorAll('button')), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* المشاركة */
  var url = 'https://kakramah.github.io/before-the-seeds-ripen/';
  var title = 'قبل أن تنضج البذور';
  var text = 'أخطر لحظات الثورة تأتي بعد الانتصار.';
  var enc = encodeURIComponent, alt = document.getElementById('shareAlt'), done = document.getElementById('copied');
  document.getElementById('sWa').href = 'https://wa.me/?text=' + enc(title + '\n' + url);
  document.getElementById('sTg').href = 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(title);
  document.getElementById('sX').href = 'https://x.com/intent/post?text=' + enc(title) + '&url=' + enc(url);
  document.getElementById('sFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url);
  document.getElementById('shareBtn').addEventListener('click', function(){
    if (navigator.share) navigator.share({title: title, text: text, url: url}).catch(function(){ alt.hidden = false; });
    else { alt.hidden = false; document.getElementById('copyBtn').focus(); }
  });
  document.getElementById('copyBtn').addEventListener('click', function(){
    function ok(){ done.textContent = 'نُسخ الرابط، الصقه حيث تشاء.'; }
    function fail(){ done.textContent = 'لم يُنسخ تلقائياً. الرابط: ' + url; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, fail); else fail();
  });
})();
