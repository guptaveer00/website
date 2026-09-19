(function(root){
  'use strict';
  const companies=[
    {symbol:'AAPL',name:'Apple',sector:'Technology'},
    {symbol:'MSFT',name:'Microsoft',sector:'Technology'},
    {symbol:'NVDA',name:'NVIDIA',sector:'Semiconductors'},
    {symbol:'AMZN',name:'Amazon',sector:'Commerce & cloud'},
    {symbol:'GOOGL',name:'Alphabet',sector:'Internet & advertising'},
    {symbol:'META',name:'Meta',sector:'Social platforms'},
    {symbol:'AMD',name:'AMD',sector:'Semiconductors'},
    {symbol:'INTC',name:'Intel',sector:'Semiconductors'},
    {symbol:'AVGO',name:'Broadcom',sector:'Semiconductors'},
    {symbol:'QCOM',name:'Qualcomm',sector:'Semiconductors'},
    {symbol:'TXN',name:'Texas Instruments',sector:'Semiconductors'},
    {symbol:'ADBE',name:'Adobe',sector:'Software'},
    {symbol:'CRM',name:'Salesforce',sector:'Software'},
    {symbol:'ORCL',name:'Oracle',sector:'Software'},
    {symbol:'CSCO',name:'Cisco',sector:'Networking'},
    {symbol:'IBM',name:'IBM',sector:'Technology'},
    {symbol:'NFLX',name:'Netflix',sector:'Streaming'},
    {symbol:'PYPL',name:'PayPal',sector:'Digital payments'},
    {symbol:'NOW',name:'ServiceNow',sector:'Software'},
    {symbol:'INTU',name:'Intuit',sector:'Software'},
    {symbol:'JPM',name:'JPMorgan Chase',sector:'Banking'},
    {symbol:'XOM',name:'Exxon Mobil',sector:'Energy'},
    {symbol:'WMT',name:'Walmart',sector:'Retail'},
    {symbol:'KO',name:'Coca-Cola',sector:'Consumer staples'},
    {symbol:'JNJ',name:'Johnson & Johnson',sector:'Healthcare'},
    {symbol:'CAT',name:'Caterpillar',sector:'Industrials'},
    {symbol:'BAC',name:'Bank of America',sector:'Banking'},
    {symbol:'GS',name:'Goldman Sachs',sector:'Finance'},
    {symbol:'V',name:'Visa',sector:'Payments'},
    {symbol:'MA',name:'Mastercard',sector:'Payments'},
    {symbol:'CVX',name:'Chevron',sector:'Energy'},
    {symbol:'COST',name:'Costco',sector:'Retail'},
    {symbol:'HD',name:'Home Depot',sector:'Retail'},
    {symbol:'PEP',name:'PepsiCo',sector:'Consumer staples'},
    {symbol:'MCD',name:"McDonald's",sector:'Restaurants'},
    {symbol:'NKE',name:'Nike',sector:'Apparel'},
    {symbol:'DIS',name:'Disney',sector:'Entertainment'},
    {symbol:'UNH',name:'UnitedHealth',sector:'Healthcare'},
    {symbol:'PFE',name:'Pfizer',sector:'Healthcare'},
    {symbol:'UPS',name:'UPS',sector:'Logistics'}
  ];
  function deck(settings,now=new Date(),rng=Math.random){
    const pool=companies.slice(0,settings.pool==='tech'?20:companies.length);
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    // Prefer companies absent from the last game; never reuse one within this deck.
    const recent=new Set(settings.recent||[]);
    const ordered=[...pool.filter(c=>!recent.has(c.symbol)),...pool.filter(c=>recent.has(c.symbol))];
    const pairs=Array.from({length:Math.min(settings.rounds,Math.floor(ordered.length/2))},(_,i)=>ordered.slice(i*2,i*2+2));
    return pairs.map(pair=>{
      const end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
      end.setUTCDate(end.getUTCDate()-1-Math.floor(rng()*300));
      const start=new Date(end);start.setUTCDate(start.getUTCDate()-settings.days);
      return {pair:rng()<.5?pair:[...pair].reverse(),start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10)};
    });
  }
  function judge(returns,pick,streak){
    const values=returns.map(n=>Number(n.toFixed(2))),tie=values[0]===values[1];
    const winner=tie?null:(values[0]>values[1]?0:1),correct=tie||pick===winner;
    return {winner,tie,correct,points:correct?100+Math.min(streak*25,100):0,streak:correct?streak+1:0};
  }
  const api={companies,deck,judge};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StockGame=api;
})(typeof globalThis!=='undefined'?globalThis:this);
