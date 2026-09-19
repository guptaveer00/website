'use strict';
(() => {
  const $=id=>document.getElementById(id),cache=new Map();
  let recent=[],settings,rounds=[],index=0,score=0,streak=0,bestStreak=0,answers=[],current=null,phase='home',generation=0,controller=null;
  const pct=n=>`${n>0?'+':''}${n.toFixed(2)}%`,money=n=>`$${n.toFixed(2)}`;
  const date=d=>new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
  function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function screen(id){for(const name of ['home','play','finish'])$(name).hidden=name!==id;}
  function menu(){generation++;controller?.abort();phase='home';screen('home');$('round-count').focus();}
  function start(event){
    event?.preventDefault();settings={rounds:Number($('round-count').value),days:Number($('window').value),pool:$('pool').value};
    rounds=StockGame.deck({...settings,recent});recent=rounds.flatMap(r=>r.pair.map(c=>c.symbol));index=0;score=0;streak=0;bestStreak=0;answers=[];screen('play');loadRound();
  }
  function scoreboard(){
    $('round-label').textContent=`ROUND ${index+1} / ${settings.rounds}`;$('score').textContent=score;$('streak').textContent=streak;
    $('progress').replaceChildren(...rounds.map((_,i)=>element('i',i<index?'done':i===index?'current':'')));
  }
  async function history(company,round,signal){
    const key=`${company.symbol}:${round.start}:${round.end}`,cached=cache.get(key);
    if(cached&&Date.now()-cached.at<300000)return cached.data;
    const query=new URLSearchParams({timeframe:'1day',start:round.start,end:round.end,limit:'1000'});
    const response=await fetch(`https://fintable.io/api/v2/prices/${company.symbol}/history?${query}`,{signal,credentials:'omit',headers:{Accept:'application/json'}});
    if(response.status===429)throw Error('The data provider is busy or its request limit was reached. Wait a minute, then retry.');
    if(response.status===404||response.status===422)throw Error(`No usable history for ${company.symbol} in this window. Try another matchup.`);
    if(!response.ok)throw Error(`The data provider returned HTTP ${response.status}. Please retry in a moment.`);
    let payload;try{payload=await response.json();}catch{throw Error('The provider returned an unreadable response. Please retry.');}
    const data=StockMath.normalize(payload,company.symbol,round.start,round.end);cache.set(key,{at:Date.now(),data});return data;
  }
  async function loadRound(){
    const token=++generation;controller?.abort();controller=new AbortController();const requestController=controller;const signal=requestController.signal;
    phase='loading';current=null;scoreboard();$('round-content').hidden=true;$('error').hidden=true;$('loading').hidden=false;$('reveal').hidden=true;$('pick-hint').hidden=false;
    let timeout=false;const timer=setTimeout(()=>{timeout=true;requestController.abort();},15000);
    try{
      const round=rounds[index];const pair=await Promise.all(round.pair.map(company=>history(company,round,signal)));
      if(token!==generation)return;
      current=StockMath.compare(...pair);
      // Reject partial endpoint responses instead of silently comparing a different window.
      const first=Date.parse(current.dates[0]),last=Date.parse(current.dates.at(-1));
      if(first-Date.parse(round.start)>10*86400000||Date.parse(round.end)-last>10*86400000)throw Error('This matchup has incomplete history for the selected period. Try another matchup.');
      phase='question';$('loading').hidden=true;$('round-content').hidden=false;
      $('dates').textContent=`${date(current.dates[0])} → ${date(current.dates.at(-1))}`;
      $('round-category').textContent=`${settings.pool==='tech'?'TECH MATCHUP':'MIXED-SECTOR MATCHUP'} · ABOUT ${settings.days===30?'1 MONTH':settings.days===90?'3 MONTHS':'1 YEAR'}`;
      $('choices').replaceChildren(...round.pair.map((company,i)=>{
        const button=element('button','stock-choice');button.type='button';button.dataset.pick=i;
        button.setAttribute('aria-label',`Pick ${company.name} (${company.symbol})`);
        button.append(element('span','choice-number',`${i+1}`),element('span','ticker',company.symbol),element('span','company-name',company.name),element('span','mystery','Higher return? →'),element('span','choice-tag',company.sector));button.addEventListener('click',()=>pick(i));return button;
      }));
      $('question-title').focus({preventScroll:true});$('play').scrollIntoView({block:'start',behavior:'instant'});
    }catch(error){
      if(token!==generation)return;
      phase='error';controller.abort();$('loading').hidden=true;$('error').hidden=false;
      $('error-message').textContent=timeout?'The request timed out. Check your connection, then retry.':error instanceof TypeError?'Could not reach the data provider. Check your internet connection and retry.':error.message||'The data could not be loaded.';
    }finally{clearTimeout(timer);}
  }
  function pick(choice){
    if(phase!=='question')return;phase='reveal';
    const outcome=StockGame.judge(current.series.map(s=>s.returnPct),choice,streak);score+=outcome.points;streak=outcome.streak;bestStreak=Math.max(bestStreak,streak);
    answers.push({pair:rounds[index].pair,dates:[current.dates[0],current.dates.at(-1)],returns:current.series.map(s=>s.returnPct),choice,...outcome});
    scoreboard();
    Array.from($('choices').children).forEach((button,i)=>{
      button.disabled=true;button.classList.toggle('picked',choice===i);button.classList.toggle('winner',outcome.tie||outcome.winner===i);
      button.querySelector('.mystery').remove();const value=current.series[i].returnPct;
      button.insertBefore(element('span',`choice-value ${value>=0?'positive':'negative'}`,pct(value)),button.querySelector('.choice-tag'));
      button.querySelector('.choice-tag').textContent=`${choice===i?'YOUR PICK · ':''}${outcome.tie?'TIED':outcome.winner===i?'HIGHER RETURN':'LOWER RETURN'}`;
    });
    $('pick-hint').hidden=true;$('reveal').hidden=false;
    $('points-earned').textContent=outcome.correct?`+${outcome.points} POINTS${outcome.points>100?` · ${outcome.points-100} STREAK BONUS`:''}`:'0 POINTS · STREAK RESET';
    $('reveal-title').textContent=outcome.tie?'A photo finish. Both picks count.':outcome.correct?'You called it.':'Not this time.';
    const [a,b]=current.series;
    $('explanation').textContent=outcome.tie?'Their returns tie at two decimal places.':`${current.series[outcome.winner].symbol} returned ${Math.abs(a.returnPct-b.returnPct).toFixed(2)} percentage points more. ${a.returnPct<0&&b.returnPct<0?'Both fell; the smaller loss wins.':'That is percentage performance, not the dollar share price.'}`;
    $('next').textContent=index===rounds.length-1?'See final score →':'Next round →';
    chart();$('reveal-title').focus({preventScroll:true});
  }
  function svg(tag,attrs,text){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs||{}))el.setAttribute(key,value);if(text!==undefined)el.textContent=text;return el;}
  function chart(){
    const graph=$('round-chart'),[a,b]=current.series;
    graph.replaceChildren(svg('title',{id:'chart-title'},`${a.symbol} versus ${b.symbol}: historical growth of $100`),svg('desc',{id:'chart-desc'},`${a.symbol} ended at ${money(a.finalValue)} and ${b.symbol} at ${money(b.finalValue)}.`));
    const values=current.series.flatMap(s=>s.values),lo=Math.min(100,...values),hi=Math.max(100,...values),pad=Math.max(2,(hi-lo)*.12),bottom=lo-pad,top=hi+pad;
    const x=i=>58+i/(current.dates.length-1)*815,y=n=>250-(n-bottom)/(top-bottom)*225;
    for(let i=0;i<5;i++){const value=bottom+(top-bottom)*i/4;graph.append(svg('line',{x1:58,x2:873,y1:y(value),y2:y(value),stroke:'var(--rule)'}),svg('text',{x:48,y:y(value)+4,'text-anchor':'end'},`$${value.toFixed(0)}`));}
    graph.append(svg('line',{x1:58,x2:873,y1:y(100),y2:y(100),stroke:'var(--text-dim)','stroke-dasharray':'3 5'}));
    current.series.forEach((series,i)=>graph.append(svg('path',{d:series.values.map((value,j)=>`${j?'L':'M'}${x(j).toFixed(2)},${y(value).toFixed(2)}`).join(' '),fill:'none',stroke:i?'#82b7e8':'var(--accent)','stroke-width':3,'stroke-dasharray':i?'7 4':'none','stroke-linejoin':'round'})));
    graph.append(svg('text',{x:58,y:283},current.dates[0]),svg('text',{x:873,y:283,'text-anchor':'end'},current.dates.at(-1)));
    $('legend').replaceChildren(...current.series.map(s=>element('span','',`${s.symbol}: ${money(s.finalValue)}`)));
    $('round-source').textContent=`${current.dates.length} shared trading dates · Fintable / ${[...new Set(current.series.map(s=>s.feed.toUpperCase()))].join(', ')} · Adjusted historical closes`;
  }
  function finish(){
    phase='finish';screen('finish');const correct=answers.filter(a=>a.correct).length;
    $('final-score').textContent=score;$('accuracy').textContent=`${correct} / ${answers.length}`;$('best-streak').textContent=bestStreak;
    $('finish-caption').textContent=correct===answers.length?'A perfect run. You picked every matchup correctly.':correct>=answers.length*.6?'Strong picks. Take a look at the rounds that surprised you.':'Markets can be surprising. Explore the results and try another round.';
    $('recap').replaceChildren(...answers.map((answer,i)=>{
      const row=element('article','recap-row'),body=element('div');
      body.append(element('p','recap-main',answer.pair.map((c,j)=>`${c.symbol} ${pct(answer.returns[j])}`).join('  /  ')),element('p','recap-detail',`${date(answer.dates[0])} – ${date(answer.dates[1])} · Your pick: ${answer.pair[answer.choice].symbol}${answer.tie?' · Tie':` · Winner: ${answer.pair[answer.winner].symbol}`}`));
      row.append(element('span','recap-number',String(i+1).padStart(2,'0')),body,element('span',`recap-points ${answer.correct?'positive':'negative'}`,`+${answer.points}`));return row;
    }));$('finish-title').focus({preventScroll:true});$('finish').scrollIntoView({block:'start',behavior:'instant'});
  }
  $('setup').addEventListener('submit',start);$('quit').addEventListener('click',menu);$('settings').addEventListener('click',menu);$('again').addEventListener('click',start);$('retry').addEventListener('click',loadRound);
  $('replace').addEventListener('click',()=>{const old=rounds[index];let replacement;for(let i=0;i<10;i++){replacement=StockGame.deck({...settings,rounds:1,recent:rounds.flatMap(r=>r.pair.map(c=>c.symbol))})[0];if(replacement.pair.map(c=>c.symbol).sort().join()!==old.pair.map(c=>c.symbol).sort().join())break;}rounds[index]=replacement;loadRound();});
  $('next').addEventListener('click',()=>{if(phase!=='reveal')return;if(index===rounds.length-1)finish();else{index++;loadRound();}});
  window.addEventListener('keydown',event=>{if(phase==='question'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)&&['1','2'].includes(event.key)){event.preventDefault();pick(Number(event.key)-1);}});
})();
