#!/usr/bin/env bun
// Добавляет AI чат + Social proof toast на 10 новых доменов через Base.astro.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { NICHES } from './niche-templates';

const ROOT = '/Users/mac/remont-calc';

// Универсальный inline AI чат компонент — встраивается в Base.astro каждой ниши
function getAiChatHTML(niche: typeof NICHES[0]) {
  return `
    <!-- AI Chat -->
    <button class="ai-toggle" id="ai-toggle" aria-label="Открыть чат">
      <span style="font-size:28px;">💬</span>
      <span class="ai-badge">!</span>
    </button>
    <div class="ai-wrap" id="ai-wrap">
      <div class="ai-head">
        <div><strong>Анна · ${niche.niche}</strong><div style="font-size:11px;opacity:.9;">● онлайн</div></div>
        <button class="ai-close" id="ai-close">×</button>
      </div>
      <div class="ai-msgs" id="ai-msgs">
        <div class="msg bot"><div class="bub">Здравствуйте! Чем могу помочь?</div></div>
      </div>
      <div class="ai-inp">
        <input id="ai-in" type="text" placeholder="Ваш вопрос..." />
        <button id="ai-send">➤</button>
      </div>
    </div>

    <!-- Social proof toast -->
    <div id="sp-toast" class="sp-toast">
      <div class="sp-avatar"></div>
      <div><strong id="sp-name"></strong><p id="sp-action"></p><small id="sp-time"></small></div>
    </div>

    <style>
      .ai-toggle{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,${niche.color},${niche.color}dd);border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.25);z-index:999;animation:pls 2s infinite;}
      @keyframes pls{0%,100%{box-shadow:0 6px 20px rgba(0,0,0,0.25);}50%{box-shadow:0 6px 20px rgba(0,0,0,0.4),0 0 0 8px rgba(255,255,255,0.05);}}
      .ai-badge{position:absolute;top:6px;right:6px;background:white;color:${niche.color};font-size:11px;font-weight:700;border-radius:10px;padding:2px 6px;}
      .ai-wrap{position:fixed;bottom:90px;right:20px;width:340px;max-height:500px;background:white;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.2);display:none;flex-direction:column;z-index:999;overflow:hidden;}
      .ai-wrap.show{display:flex;}
      .ai-head{background:linear-gradient(135deg,${niche.color},${niche.color}dd);color:white;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;}
      .ai-close{background:none;border:none;color:white;font-size:24px;cursor:pointer;}
      .ai-msgs{flex:1;overflow-y:auto;padding:14px;background:#fafafa;min-height:220px;max-height:320px;display:flex;flex-direction:column;gap:8px;}
      .msg{display:flex;}
      .msg.bot{justify-content:flex-start;}
      .msg.user{justify-content:flex-end;}
      .bub{max-width:80%;padding:8px 12px;border-radius:14px;font-size:14px;line-height:1.4;}
      .msg.bot .bub{background:white;color:#1a1a1a;border-bottom-left-radius:4px;}
      .msg.user .bub{background:${niche.color};color:white;border-bottom-right-radius:4px;}
      .ai-inp{display:flex;gap:6px;padding:10px;border-top:1px solid #eee;}
      .ai-inp input{flex:1;padding:8px 12px;border:1.5px solid #e6e8eb;border-radius:18px;outline:none;font-size:14px;}
      .ai-inp button{width:36px;height:36px;background:${niche.color};color:white;border:none;border-radius:50%;cursor:pointer;}
      .sp-toast{position:fixed;bottom:20px;left:20px;width:260px;background:white;border-radius:12px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);display:none;align-items:center;gap:10px;z-index:998;}
      .sp-toast.show{display:flex;}
      .sp-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${niche.color},${niche.color}cc);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;}
      .sp-toast strong{font-size:12px;color:#1a1a1a;display:block;}
      .sp-toast p{font-size:11px;color:#555;margin:1px 0;}
      .sp-toast small{font-size:10px;color:#888;}
      @media(max-width:500px){.ai-wrap{left:12px;right:12px;width:auto;bottom:90px;}.sp-toast{left:12px;right:12px;width:auto;bottom:80px;}}
    </style>
    <script is:inline>
      (function(){
        var wrap=document.getElementById('ai-wrap'),btn=document.getElementById('ai-toggle'),close=document.getElementById('ai-close'),msgs=document.getElementById('ai-msgs'),inp=document.getElementById('ai-in'),send=document.getElementById('ai-send');
        if(!wrap||!btn)return;
        btn.onclick=function(){wrap.classList.toggle('show');document.querySelector('.ai-badge')?.style.setProperty('display','none');};
        close.onclick=function(){wrap.classList.remove('show');};
        function add(text,who){var d=document.createElement('div');d.className='msg '+who;d.innerHTML='<div class="bub">'+text.replace(/</g,'&lt;')+'</div>';msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
        function ask(text){
          if(!text)return;
          add(text,'user');inp.value='';
          add('...','bot');
          fetch('https://www.kalkremont.ru/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,context:{niche:'${niche.niche}'},source:'${niche.domain}/chat'})})
            .then(function(r){return r.json();})
            .then(function(j){msgs.lastChild.querySelector('.bub').textContent=j.reply||'Не понял, уточните.';})
            .catch(function(){msgs.lastChild.querySelector('.bub').textContent='Технический сбой. Оставьте телефон в форме.';});
        }
        send.onclick=function(){ask(inp.value.trim());};
        inp.onkeydown=function(e){if(e.key==='Enter')ask(inp.value.trim());};

        // Social proof toast
        var toast=document.getElementById('sp-toast');
        var names=['Александр','Мария','Дмитрий','Анна','Сергей','Елена','Иван','Ольга'];
        var cities=['Москвы','СПб','Екатеринбурга','Казани','Краснодара','Новосибирска'];
        var actions=['оставил заявку','рассчитал стоимость','заказал замер','получил консультацию'];
        var times=['только что','2 мин назад','5 мин назад','10 мин назад','15 мин назад'];
        setTimeout(function(){
          if(sessionStorage.getItem('sp-shown'))return;
          var n=names[Math.floor(Math.random()*names.length)];
          document.getElementById('sp-name').textContent=n+' из '+cities[Math.floor(Math.random()*cities.length)];
          document.getElementById('sp-action').textContent=actions[Math.floor(Math.random()*actions.length)];
          document.getElementById('sp-time').textContent=times[Math.floor(Math.random()*times.length)];
          document.querySelector('.sp-avatar').textContent=n[0];
          toast.classList.add('show');
          sessionStorage.setItem('sp-shown','1');
          setTimeout(function(){toast.classList.remove('show');},5000);
        },10000);
      })();
    </script>`;
}

function injectAiChat(niche: typeof NICHES[0]) {
  const path = `${ROOT}/apps/${niche.projectName}/src/layouts/Base.astro`;
  if (!existsSync(path)) {
    console.log(`  ✗ ${niche.projectName}: Base.astro отсутствует`);
    return;
  }
  let content = readFileSync(path, 'utf8');

  // Уже добавлено?
  if (content.includes('ai-toggle')) {
    console.log(`  · ${niche.projectName}: уже есть`);
    return;
  }

  // Вставить перед </body>
  const html = getAiChatHTML(niche);
  content = content.replace('</body>', `${html}\n  </body>`);
  writeFileSync(path, content);
  console.log(`  ✓ ${niche.projectName}: AI chat + social proof добавлены`);
}

console.log('🤖 Установка AI чата + Social proof на 10 новых доменах...\n');
for (const n of NICHES) injectAiChat(n);
console.log('\n✅ Готово');
