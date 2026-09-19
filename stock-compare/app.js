'use strict';
(() => {
  const $=id=>document.getElementById(id),form=$('compare-form'),status=$('status'),results=$('results');
  const cache=new Map(),names={AAPL:'Apple',MSFT:'Microsoft',NVDA:'NVIDIA',AMZN:'Amazon',GOOGL:'Alphabet',META:'Meta',TSLA:'Tesla',JPM:'JPMorgan Chase',SPY:'SPDR S&P 500 ETF'};
  let comparison=null,busy=false;
  const money=n=>n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2});
  const pct=n=>`${n>0?'+':''}${n.toFixed(2)}%`;
  const dateString=d=>d.toISOString().slice(0,10);
  function yesterday(){const d=new Date();d.setUTCDate(d.getUTCDate()-1);return dateString(d);}
  function setRange(days){const end=yesterday(),start=new Date(`${end}T00:00:00Z`);start.setUTCDate(start.getUTCDate()-days);$('end').value=end;$('start').value=dateString(start);}
  $('start').max=$('end').max=yesterday();setRange(90);
  function message(text,error=false){status.textContent=text;status.classList.toggle('error',error);}
  function validate(){
    const symbols=[$('ticker-a'),$('ticker-b')].map(el=>{el.value=el.value.trim().toUpperCase();return el.value;});
    if(symbols.some(s=>!s))throw Error('Enter a ticker in both fields, such as AAPL and MSFT.');
    if(symbols.some(s=>! /^[A-Z][A-Z0-9.-]{0,9}$/.test(s)))throw Error('Use a ticker symbol such as AAPL, not a company name or special characters.');
    if(symbols[0]===symbols[1])throw Error('Choose two different tickers to compare.');
    const start=$('start').value,end=$('end').value;
    if(!start||!end)throw Error('Choose both a start and end date.');
    if(start>=end)throw Error('The start date must be before the end date.');
    if(end>yesterday())throw Error('Choose an end date before today so the comparison uses completed trading days.');
    if((Date.parse(end)-Date.parse(start))/86400000>366)throw Error('Choose a range of one year or less.');
    return {symbols,start,end};
  }
  async function history(symbol,start,end){
    const query=new URLSearchParams({timeframe:'1day',start,end,limit:'1000'});
    const url=`https://fintable.io/api/v2/prices/${encodeURIComponent(symbol)}/history?${query}`;
    const cached=cache.get(url);if(cached&&Date.now()-cached.time<300000)return cached.data;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit'});
      if(response.status===404||response.status===422)throw Error(`${symbol}: no usable history for this ticker and range. Check the symbol or try different dates.`);
      if(response.status===429)throw Error('The data provider is receiving too many requests. Wait a minute, then try again.');
      if(!response.ok)throw Error(`The data provider is temporarily unavailable (HTTP ${response.status}). Please try again later.`);
      let payload;try{payload=await response.json();}catch{throw Error('The data provider returned an unreadable response. Try again later.');}
      const data=StockMath.normalize(payload,symbol,start,end);cache.set(url,{time:Date.now(),data});return data;
    }catch(error){
      if(error.name==='AbortError')throw Error('The request took too long. Check your connection and try again.');
      if(error instanceof TypeError)throw Error('Could not reach the data provider. Check your internet connection and try again.');
      throw error;
    }finally{clearTimeout(timer);}
  }
  async function latestQuotes(symbols){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(`https://fintable.io/api/v2/prices?${new URLSearchParams({symbols:symbols.join(',')})}`,{headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit',cache:'no-store'});
      if(!response.ok)throw Error('Quote service unavailable');
      const payload=await response.json();
      if(!Array.isArray(payload.data))throw Error('Invalid quote response');
      return new Map(payload.data.filter(q=>symbols.includes(q.symbol)&&q.currency==='USD'&&Number.isFinite(Number(q.price))&&Number(q.price)>0).map(q=>[q.symbol,q]));
    }catch{return new Map();}finally{clearTimeout(timer);}
  }
  function svg(tag,attrs={},text){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,value);if(text!==undefined)el.textContent=text;return el;}
  function drawChart(){
    const chart=$('chart');chart.replaceChildren(svg('title',{id:'chart-title'},`${comparison.series.map(s=>s.symbol).join(' versus ')}: growth of $100`),svg('desc',{id:'chart-description'},'Daily historical values. Use the date slider below for exact values.'));
    const all=comparison.series.flatMap(s=>s.values),low=Math.min(100,...all),high=Math.max(100,...all),pad=Math.max(2,(high-low)*.12),min=low-pad,max=high+pad;
    const x=i=>62+i/(comparison.dates.length-1)*816,y=v=>292-(v-min)/(max-min)*260;
    for(let i=0;i<=4;i++){const v=min+(max-min)*i/4,py=y(v);chart.append(svg('line',{x1:62,x2:878,y1:py,y2:py,class:'grid-line'}),svg('text',{x:52,y:py+4,'text-anchor':'end'},`$${v.toFixed(0)}`));}
    chart.append(svg('line',{x1:62,x2:878,y1:y(100),y2:y(100),class:'baseline'}));
    comparison.series.forEach((s,j)=>chart.append(svg('path',{d:s.values.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' '),class:`series series-${j?'b':'a'}`})));
    [0,Math.floor((comparison.dates.length-1)/2),comparison.dates.length-1].forEach((i,j)=>chart.append(svg('text',{x:x(i),y:323,'text-anchor':j===0?'start':j===2?'end':'middle'},comparison.dates[i])));
    const i=Number($('scrubber').value);chart.append(svg('line',{x1:x(i),x2:x(i),y1:26,y2:295,class:'cursor'}));
    comparison.series.forEach((s,j)=>chart.append(svg('circle',{cx:x(i),cy:y(s.values[i]),r:4,fill:j?'#86b6dd':'var(--accent)'})));
    $('point-readout').textContent=`${comparison.dates[i]} · ${comparison.series.map(s=>`${s.symbol} ${money(s.values[i])}`).join(' · ')}`;
    $('scrubber').setAttribute('aria-valuetext',$('point-readout').textContent);
  }
  function render(){
    $('legend').replaceChildren(...comparison.series.map(s=>{const span=document.createElement('span');span.textContent=s.symbol;return span;}));
    $('period').textContent=`${comparison.dates[0]} — ${comparison.dates.at(-1)} · ${comparison.dates.length} shared trading dates`;
    $('scrubber').max=String(comparison.dates.length-1);$('scrubber').value=String(comparison.dates.length-1);
    $('metrics').replaceChildren(...comparison.series.map(s=>{
      const card=document.createElement('article');card.className='stock-card';
      // Only numeric results and validated ticker symbols enter this template.
      card.innerHTML=`<h3>${s.symbol}</h3><div class="company">${names[s.symbol]||'US-listed security'}</div><div class="return ${s.returnPct>=0?'positive':'negative'}">${pct(s.returnPct)}</div><div class="metric-label">RETURN OVER SHARED DATES</div><dl><dt>Your $100 becomes</dt><dd>${money(s.finalValue)}</dd><dt>Annualized volatility</dt><dd>${s.volatility===null?'Unavailable':s.volatility.toFixed(2)+'%'}</dd><dt>Maximum drawdown</dt><dd>${pct(s.drawdown)}</dd><dt>Last adjusted close</dt><dd>${money(s.prices.at(-1))}</dd></dl>`;
      const quote=document.createElement('div');quote.className='latest-quote';
      const label=document.createElement('div');label.className='metric-label';label.textContent='CURRENT PRICE · LATEST AVAILABLE';
      const value=document.createElement('div');value.className='quote-price';value.textContent=s.quote?money(Number(s.quote.price)):'Unavailable';
      const note=document.createElement('div');note.className='subtle';
      if(s.quote){const time=new Date(s.quote.as_of);note.textContent=`${String(s.quote.feed||'Provider').toUpperCase()} · ${s.quote.as_of&&Number.isFinite(time.getTime())?time.toLocaleString():'Timestamp unavailable'} · May be delayed`;}
      else note.textContent='Latest quote could not be loaded. Click Compare stocks to retry.';
      quote.append(label,value,note);card.querySelector('.company').after(quote);return card;
    }));
    const [a,b]=comparison.series,diff=a.returnPct-b.returnPct;
    $('insight').textContent=Math.abs(diff)<.005?'Both stocks finished with the same return to two decimal places.':`${diff>0?a.symbol:b.symbol} finished ${Math.abs(diff).toFixed(2)} percentage points ahead over these shared dates.`;
    $('source-note').textContent=`Source: Fintable · ${comparison.series.map(s=>`${s.symbol}: ${s.feed.toUpperCase()}`).join(' / ')} · Latest shared observation: ${comparison.dates.at(-1)}. Historical data, not a live quote.${comparison.aligned?'':' Different dates are missing from the two histories; volatility is unavailable.'}`;
    results.hidden=false;drawChart();
  }
  async function submit(event){
    event?.preventDefault();if(busy)return;
    results.hidden=true;comparison=null;
    let request;try{request=validate();}catch(error){message(error.message,true);return;}
    busy=true;const controls=Array.from(form.querySelectorAll('input,button'));controls.forEach(el=>el.disabled=true);form.setAttribute('aria-busy','true');message(`Fetching ${request.symbols.join(' and ')} history…`);
    try{
      const [responses,quotes]=await Promise.all([Promise.allSettled(request.symbols.map(s=>history(s,request.start,request.end))),latestQuotes(request.symbols)]);
      const failure=responses.find(r=>r.status==='rejected');if(failure)throw failure.reason;
      comparison=StockMath.compare(...responses.map(r=>r.value));comparison.series.forEach(s=>{s.quote=quotes.get(s.symbol)||null;});render();message('Comparison ready. Move the slider to explore individual trading dates.');
    }catch(error){message(error.message||'Something went wrong. Please try again.',true);}
    finally{busy=false;controls.forEach(el=>el.disabled=false);form.removeAttribute('aria-busy');}
  }
  form.addEventListener('submit',submit);
  form.querySelectorAll('[data-days]').forEach(button=>button.addEventListener('click',()=>{setRange(Number(button.dataset.days));submit();}));
  form.addEventListener('input',()=>{if(comparison){results.hidden=true;comparison=null;message('Selection changed. Click Compare stocks to update the results.');}});
  $('scrubber').addEventListener('input',()=>{if(comparison)drawChart();});
  $('chart').addEventListener('pointermove',event=>{if(!comparison)return;const bounds=$('chart').getBoundingClientRect(),px=(event.clientX-bounds.left)/bounds.width*900;const i=Math.max(0,Math.min(comparison.dates.length-1,Math.round((px-62)/816*(comparison.dates.length-1))));$('scrubber').value=String(i);drawChart();});
  $('download').addEventListener('click',()=>{if(!comparison)return;const [a,b]=comparison.series;const csv=[`date,${a.symbol}_adjusted_close,${a.symbol}_growth_of_100,${b.symbol}_adjusted_close,${b.symbol}_growth_of_100`,...comparison.dates.map((d,i)=>[d,a.prices[i],a.values[i].toFixed(4),b.prices[i],b.values[i].toFixed(4)].join(','))].join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`${a.symbol}-${b.symbol}-comparison.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  submit();
})();
