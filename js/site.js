/* Plain JavaScript: no React, package installation, or build required. */
(() => {
  const script = document.currentScript;
  const root = new URL('../', script.src);
  const local = route => new URL(route === '/' ? 'index.html' : route.split('/').filter(Boolean).at(-1) + '.html', root).href;
  const {products, heroScenes} = window.LIB_ONE_DATA;
  const menu = document.querySelector('.menu-layer');
  const trigger = document.querySelector('.menu-button');
  let previousOverflow = '';
  const sceneProducts = {
    entry: products.filter(product => product.sceneSlug === 'entry'),
    borrow: products.filter(product => product.sceneSlug === 'borrow'),
    space: products.filter(product => product.sceneSlug === 'space'),
    staff: products.filter(product => product.sceneSlug === 'staff')
  };
  const makeChevronDown = () => {
    const template = document.createElement('template');
    template.innerHTML = '<svg class="lucide lucide-chevron-down" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    return template.content.firstElementChild;
  };
  document.querySelectorAll('.header-nav').forEach(nav => {
    [...nav.children].forEach(anchor => {
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const scene = anchor.hash.replace('#scene-', '');
      const list = sceneProducts[scene];
      if (!list?.length) return;
      anchor.removeAttribute('href');
      anchor.setAttribute('role', 'button');
      anchor.setAttribute('tabindex', '0');
      const item = document.createElement('div');
      item.className = 'header-nav-item';
      anchor.className = 'header-nav-trigger';
      anchor.setAttribute('aria-haspopup', 'true');
      anchor.setAttribute('aria-expanded', 'false');
      anchor.append(makeChevronDown());
      const dropdown = document.createElement('ul');
      dropdown.className = 'header-dropdown';
      dropdown.setAttribute('aria-label', `${anchor.textContent.trim()}產品`);
      list.forEach(product => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = local(product.path);
        const name = document.createElement('span');
        name.textContent = product.nameZh;
        const meta = document.createElement('small');
        meta.textContent = product.nameEn;
        link.append(name, meta); li.append(link); dropdown.append(li);
      });
      anchor.before(item); item.append(anchor, dropdown);
      const expanded = value => anchor.setAttribute('aria-expanded', String(value));
      anchor.addEventListener('click', event => {
        event.preventDefault();
        document.querySelectorAll('.header-nav-trigger[aria-expanded="true"]').forEach(other => {
          if (other !== anchor) other.setAttribute('aria-expanded', 'false');
        });
        expanded(true);
      });
      item.addEventListener('pointerenter', () => expanded(true));
      item.addEventListener('pointerleave', () => expanded(false));
      item.addEventListener('focusin', () => expanded(true));
      item.addEventListener('focusout', event => {
        if (!item.contains(event.relatedTarget)) expanded(false);
      });
      item.addEventListener('keydown', event => {
        if (event.key === 'Escape') { expanded(false); anchor.focus(); }
        if ((event.key === 'Enter' || event.key === ' ') && event.target === anchor) {
          event.preventDefault();
          anchor.click();
        }
      });
    });
  });
  function setMenu(open) {
    if (!menu) return;
    if (open) previousOverflow = document.body.style.overflow;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    trigger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : previousOverflow;
    (open ? menu.querySelector('.menu-close') : trigger).focus();
  }
  if (menu) {
    menu.inert = true;
    trigger.addEventListener('click', () => setMenu(true));
    menu.querySelectorAll('.menu-close,.menu-scrim,a').forEach(el => el.addEventListener('click', () => setMenu(false)));
    menu.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const items = [...menu.querySelectorAll('.menu-drawer button,.menu-drawer a[href]')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
  document.querySelectorAll('form').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    form.querySelector('[role="status"]').textContent = '目前為評圖預覽，未傳送或保存資料。';
  }));
  const stage = document.querySelector('.lh-stage');
  let closeDetail = () => {};
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (menu?.classList.contains('is-open')) setMenu(false);
      closeDetail();
    }
  });
  if (!stage) return;
  const cards = [...stage.querySelectorAll('.lh-card')];
  const flowPath = stage.querySelector('.lh-flow g path');
  const baseFlowPath = flowPath.getAttribute('d');
  const centres = [269,353,293,324,312], floors = [427,450,450,445,481];
  let index = innerWidth <= 700 ? 0 : 1, selected = null, w, h, mobile, step, scale, offset, inset;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let flowAnimation;
  let leaveTimer;
  const panel = document.createElement('aside');
  panel.id = 'hero-product-detail'; panel.className = 'lh-detail'; panel.hidden = true;
  stage.append(panel);
  function select(i) {
    clearTimeout(leaveTimer);
    selected = i;
    cards.forEach((card, n) => {
      card.querySelector('.lh-composition').classList.toggle('is-selected', n === i);
      card.querySelector('.lh-hotspot').setAttribute('aria-expanded', String(n === i));
    });
    panel.hidden = i === null;
    if (i === null) return;
    const product = products.find(p => p.id === heroScenes[i].productId);
    panel.replaceChildren();
    for (const [tag, text] of [['button',''],['small',product.nameEn],['strong',product.nameZh],['p',product.description],['a','了解產品 ']]) {
      const node = document.createElement(tag); node.textContent = text;
      if (tag === 'button') { node.type = 'button'; node.setAttribute('aria-label','關閉產品說明'); node.append(window.LibOneIcon('x')); node.onclick = closeDetail; }
      if (tag === 'strong') node.className = 'lh-detail-title';
      if (tag === 'a') { node.href = local(product.path); node.append(window.LibOneIcon('arrow-up-right')); }
      panel.append(node);
    }
    positionPanel();
  }
  closeDetail = () => select(null);
  function positionPanel() {
    if (selected === null) return;
    const centre = inset + selected * step - offset + step/2, pw = Math.min(250,w-32), edge = 140*scale+8;
    Object.assign(panel.style, {width:pw+'px',left:Math.max(16,Math.min(w-pw-16,centre+edge+pw<w-16?centre+edge:centre-edge-pw))+'px',top:(mobile?40:Math.max(80,h*.3))+'px'});
  }
  function draw() {
    w = stage.clientWidth; mobile = innerWidth <= 700;
    h = Math.max(mobile?400:420,innerHeight-stage.getBoundingClientRect().top-scrollY-24);
    inset = mobile ? 24 : Math.min(100,w*.06);
    const available = w-2*inset;
    step = available/(mobile?1:2.5); scale = Math.min(mobile?.88:1.3,(step-40)/420,(h-105)/490);
    offset = Math.max(0,Math.min((index+.5)*step-available/2,step*cards.length-available));
    const middle = Math.round((offset+available/2)/step-.5);
    const ground = h-45;
    const leftmostLabelIndex = cards.findIndex((_,i) => {
      const cardLeft = inset+i*step-offset;
      const cardCentre = cardLeft+step/2;
      return cardLeft+step>0 && cardLeft<w && cardCentre>=90 && cardCentre<=w-90;
    });
    stage.style.height = h+'px';
    stage.querySelector('.lh-track').style.transform = `translateX(${inset-offset}px)`;
    document.querySelector('.lh-background').style.transform = `translateX(-${Math.min(offset*.28,Math.max(0,2355-w))}px)`;
    stage.querySelector('.lh-flow').setAttribute('viewBox',`0 0 ${w} ${h}`);
    stage.querySelector('.lh-flow g').setAttribute('transform',`translate(${-offset*.12} ${ground-130*scale-260*1.30625}) scale(1.30625)`);
    const flowEnd = Math.max(2000,(w+offset*.12+240)/1.30625);
    flowPath.setAttribute('d',`${baseFlowPath} C1670 80 1800 180 ${flowEnd} 180`);
    cards.forEach((card,i) => {
      Object.assign(card.style,{left:i*step+'px',width:step+'px'});
      const visible = inset+i*step-offset+step>0 && inset+i*step-offset<w;
      card.inert = !visible;
      const groupScale = scale*1.05*(i===2?1.18:1)*(i===middle&&!mobile?1.07:1);
      card.classList.toggle('is-center',i===middle);
      // Labels belong to their cards: never pull offscreen labels back into view.
      const label = card.querySelector('.lh-label');
      const labelWidth = Math.min(step-40,300);
      const cardCentre = inset+i*step-offset+step/2;
      label.hidden = !visible || cardCentre<90 || cardCentre>w-90;
      const centeredLabelLeft = (step-labelWidth)/2;
      const labelLeft = i===leftmostLabelIndex
        ? Math.max(0,Math.min(step-labelWidth,offset-i*step))
        : centeredLabelLeft;
      Object.assign(label.style,{left:labelLeft+'px',width:labelWidth+'px',maxWidth:labelWidth+'px',top:(Math.max(8,ground-(floors[i]-[45,150,169,78,171][i])*groupScale*1.05-110)+50)+'px'});
      card.querySelector('.lh-composition').style.transform = `translate(${-centres[i]*groupScale}px,${ground-25-floors[i]*groupScale}px) scale(${groupScale})`;
    });
    stage.querySelector('.prev').disabled = index === 0;
    stage.querySelector('.next').disabled = index === cards.length-1;
    positionPanel();
  }
  function go(i) {
    const next = Math.max(0,Math.min(cards.length-1,i));
    if(next===index)return;
    index=next;closeDetail();draw();
    const flow=stage.querySelector('.lh-flow');
    flowAnimation?.cancel();
    flow.style.animation='none';
    if(!reducedMotion.matches)flowAnimation=flow.animate(
      [{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],
      {duration:3000,easing:'cubic-bezier(.25,.6,.35,1)'}
    );
  }
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)flowAnimation?.cancel();});
  stage.querySelector('.prev').onclick = () => go(index-1);
  stage.querySelector('.next').onclick = () => go(index+1);
  cards.forEach((card,i) => {
    const hotspot=card.querySelector('.lh-hotspot');
    hotspot.addEventListener('click',()=>select(i));
    hotspot.addEventListener('focus',()=>select(i));
    hotspot.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')select(i);});
    hotspot.addEventListener('pointerleave',()=>{if(!hotspot.matches(':focus'))leaveTimer=setTimeout(closeDetail,250);});
  });
  panel.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));
  panel.addEventListener('pointerleave',()=>{if(!panel.contains(document.activeElement))leaveTimer=setTimeout(closeDetail,250);});
  let touch={x:0,y:0};
  stage.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};});
  stage.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&Math.abs(e.clientX-touch.x)>65&&Math.abs(e.clientY-touch.y)<45)go(index+(e.clientX<touch.x?1:-1));});
  window.addEventListener('resize',draw);
  document.fonts.ready.then(draw);
  draw();
})();
