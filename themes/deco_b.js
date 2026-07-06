/* ═══════════════════════════════════════════════
   テーマB 装飾アニメーション（自己完結・アプリロジック非干渉）
   ・シャボン玉  : タッチで「ぽんっ♪」と割れる
   ・ちょうちょ  : タッチすると「ヒュッ」と逃げる
   ・花びら      : タッチすると「ぽっ」と✨になって消える
═══════════════════════════════════════════════ */
(function(){
  var rnd = function(a,b){ return Math.floor(Math.random()*(b-a+1))+a; };

  var layer = document.createElement('div');
  layer.id = 'deco-layer';
  document.body.appendChild(layer);

  /* ── 効果音（専用の小さなWebAudio。初回タップ後に鳴る） ── */
  var dctx = null;
  function tone(f1, f2, dur, vol, type){
    try{
      dctx = dctx || new (window.AudioContext||window.webkitAudioContext)();
      if(dctx.state==='suspended') dctx.resume();
      var t = dctx.currentTime;
      var o = dctx.createOscillator(), g = dctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f1, t);
      o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.02);
      o.connect(g); g.connect(dctx.destination);
      o.start(t); o.stop(t + dur + 0.05);
    }catch(e){}
  }

  /* ── しぶき／きらきらのバースト表示 ── */
  function spawnBurst(x, y, parts, parent){
    var burst = document.createElement('div');
    burst.className = 'deco-burst';
    burst.style.left = x + 'px';
    burst.style.top  = y + 'px';
    burst.innerHTML = parts;
    (parent || layer).appendChild(burst);
    setTimeout(function(){ burst.remove(); }, 520);
  }
  var BUB_PARTS =
    '<span style="--dx:-18px;--dy:-16px">✨</span>' +
    '<span style="--dx:18px;--dy:-14px">💧</span>' +
    '<span style="--dx:-14px;--dy:14px">💧</span>' +
    '<span style="--dx:16px;--dy:16px">✨</span>';
  var FLW_PARTS =
    '<span style="--dx:-14px;--dy:-12px">✨</span>' +
    '<span style="--dx:14px;--dy:-10px">✨</span>' +
    '<span style="--dx:0px;--dy:14px">✨</span>';

  /* ── シャボン玉（タッチで割れる） ── */
  var BUB_COLORS = [
    'rgba(255,182,213,.5)','rgba(173,216,230,.5)','rgba(187,222,251,.5)',
    'rgba(200,240,210,.5)','rgba(255,249,196,.5)','rgba(225,190,231,.5)'
  ];
  var bubCount = 0, BUB_MAX = 6;

  function spawnBubble(){
    if(document.hidden || bubCount >= BUB_MAX) return;
    bubCount++;
    var s = rnd(32, 58);
    var b = document.createElement('div');
    b.className = 'deco-bub';
    b.style.cssText = 'left:'+rnd(3,86)+'%;width:'+s+'px;height:'+s+'px;'+
      'animation-duration:'+rnd(11,18)+'s;';
    var inner = document.createElement('span');
    inner.className = 'deco-bub-inner';
    inner.style.cssText = 'animation-duration:'+(rnd(24,38)/10)+'s;'+
      'background:radial-gradient(circle at 30% 28%, rgba(255,255,255,.9) 0%, '+
      BUB_COLORS[rnd(0,BUB_COLORS.length-1)]+' 55%, rgba(255,255,255,.06) 100%);';
    b.appendChild(inner);
    b.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      if(b._hit) return; b._hit = true;
      bubCount--;
      tone(760, 190, 0.12, 0.14, 'sine');          // ぽんっ♪
      var r = b.getBoundingClientRect();
      spawnBurst(r.left + r.width/2, r.top + r.height/2, BUB_PARTS);
      b.remove();
    });
    b.addEventListener('animationend', function(){
      if(!b._hit){ bubCount--; b.remove(); }
    });
    layer.appendChild(b);
  }
  for(var i=0;i<3;i++) setTimeout(spawnBubble, i*1200);
  setInterval(spawnBubble, 2800);

  /* ── ちょうちょ（タッチで逃げる） ── */
  var bflyCount = 0;
  function spawnBfly(){
    if(document.hidden || bflyCount >= 2) return;
    bflyCount++;
    var toRight = Math.random() < .5;
    var f = document.createElement('div');
    f.className = 'deco-bfly ' + (toRight ? 'r' : 'l');
    f.style.cssText = 'top:'+rnd(8,55)+'%;animation-duration:'+rnd(11,17)+'s;';
    f.innerHTML = '<span class="deco-bob"><span class="deco-flap">🦋</span></span>';
    f.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      if(f._hit) return; f._hit = true;
      bflyCount--;
      tone(300, 980, 0.18, 0.07, 'triangle');       // ヒュッ！
      // いまの位置に固定してから、ななめ上へ大いそぎで逃げる
      var r = f.getBoundingClientRect();
      f.style.animation = 'none';
      f.style.left = r.left + 'px';
      f.style.top  = r.top  + 'px';
      var vw = window.innerWidth, vh = window.innerHeight;
      f.style.setProperty('--fx', ((r.left < vw/2 ? -1 : 1) * vw * 0.7) + 'px');
      f.style.setProperty('--fy', (-vh * 0.8) + 'px');
      f.classList.add('deco-flee');
      setTimeout(function(){ f.remove(); }, 950);
    });
    f.addEventListener('animationend', function(e){
      if(e.target !== f || f._hit) return;
      bflyCount--; f.remove();
    });
    layer.appendChild(f);
  }
  setTimeout(spawnBfly, 1500);
  setInterval(spawnBfly, 9000);

  /* ── 花びら（タッチで✨になって消える） ── */
  var FLOWERS = ['🌸','🌼','🌸','🌷'];
  var flowerCount = 0;
  function spawnFlower(){
    if(document.hidden || flowerCount >= 7) return;
    flowerCount++;
    var p = document.createElement('div');
    p.className = 'deco-flower';
    p.style.cssText = 'left:'+rnd(2,92)+'%;font-size:'+rnd(24,40)+'px;'+
      'animation-duration:'+rnd(9,15)+'s;';
    p.innerHTML = '<span class="deco-sway" style="animation-duration:'+(rnd(20,32)/10)+'s">'+
      FLOWERS[rnd(0,FLOWERS.length-1)]+'</span>';
    p.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      if(p._hit) return; p._hit = true;
      flowerCount--;
      tone(950, 260, 0.10, 0.09, 'sine');           // ぽっ
      var r = p.getBoundingClientRect();
      spawnBurst(r.left + r.width/2, r.top + r.height/2, FLW_PARTS);
      p.remove();
    });
    p.addEventListener('animationend', function(e){
      if(e.target !== p || p._hit) return;
      flowerCount--; p.remove();
    });
    layer.appendChild(p);
  }
  for(var j=0;j<3;j++) setTimeout(spawnFlower, j*1800);
  setInterval(spawnFlower, 3600);

  /* ═══ トップページのあそび ═══ */
  var ss = document.getElementById('start-screen');
  if(ss){
    function topVisible(){
      return !document.hidden &&
             getComputedStyle(ss).display !== 'none' &&
             ss.style.opacity !== '0';
    }

    /* ── ながれ星キャッチ：タップできたら「キラーン♪」 ── */
    var STAR_PARTS =
      '<span style="--dx:-20px;--dy:-14px">⭐</span>' +
      '<span style="--dx:20px;--dy:-16px">✨</span>' +
      '<span style="--dx:-14px;--dy:16px">✨</span>' +
      '<span style="--dx:18px;--dy:14px">⭐</span>';
    var starCount = 0, STAR_MAX = 2;                     // 同時に2つまで
    function spawnStar(){
      if(!topVisible() || starCount >= STAR_MAX) return;
      starCount++;
      var toRight = Math.random() < .5;                  // ながれる向きもランダム
      var st = document.createElement('div');
      st.className = 'deco-star ' + (toRight ? 'r' : 'l');
      st.style.cssText = 'top:'+rnd(5,48)+'%;'+           // 高さランダム
        '--dy:'+rnd(6,34)+'vh;'+                          // 落ちる量もランダム
        '--star-h:'+rnd(56,110)+'px;'+                    // 大きさもランダム（大きめも）
        'animation-duration:'+(rnd(24,38)/10)+'s;';
      st.innerHTML = '<span class="deco-star-body">'+
        '<span class="deco-star-tail"></span>'+
        '<img class="deco-star-img" src="assets/deco/glowing_star_3d.png" alt="⭐" onerror="this.replaceWith(this.alt)">'+
        '</span>';
      st.addEventListener('pointerdown', function(e){
        e.stopPropagation();
        if(st._hit) return; st._hit = true;
        tone(1046, 1568, 0.12, 0.10, 'triangle');                    // キラ
        setTimeout(function(){ tone(1568, 2093, 0.16, 0.10, 'triangle'); }, 90);  // ーン♪
        var r = st.getBoundingClientRect();
        spawnBurst(r.left + r.width/2, r.top + r.height/2, STAR_PARTS, ss);
        starCount--;
        st.remove();
      });
      st.addEventListener('animationend', function(){
        if(!st._hit){ starCount--; st.remove(); }
      });
      ss.appendChild(st);
    }
    setTimeout(spawnStar, 1200);
    setInterval(function(){ if(Math.random() < 0.85) spawnStar(); }, 4200);

    /* ── なぞって にじ：指のあとに花や星が咲く ── */
    var TRACE_EMO = ['🌸','🌟','🌼','💠','✨'];
    var lastX = -99, lastY = -99, traceCount = 0;
    ss.addEventListener('pointermove', function(e){
      if(!topVisible()) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      if(dx*dx + dy*dy < 26*26) return;      // 26pxうごくごとに1つ咲く
      lastX = e.clientX; lastY = e.clientY;
      if(traceCount >= 40) return;           // 出しすぎ防止
      traceCount++;
      var t = document.createElement('span');
      t.className = 'deco-trace';
      t.textContent = TRACE_EMO[rnd(0, TRACE_EMO.length-1)];
      t.style.cssText = 'left:'+e.clientX+'px;top:'+e.clientY+'px;font-size:'+rnd(16,30)+'px;';
      ss.appendChild(t);
      setTimeout(function(){ t.remove(); traceCount--; }, 900);
    }, {passive:true});
  }
})();
