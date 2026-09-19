/* Pure data functions, shared by the browser and the Node test runner. */
(function(root){
  'use strict';
  function normalize(payload,symbol,start,end){
    const data=payload?.data;
    if(!data||!Array.isArray(data.bars)||data.symbol!==symbol||data.currency!=='USD')throw Error(`${symbol}: the provider returned an unexpected data format.`);
    const unique=new Map();
    for(const bar of data.bars){const price=Number(bar.close);if(/^\d{4}-\d{2}-\d{2}$/.test(bar.date)&&bar.date>=start&&bar.date<=end&&Number.isFinite(price)&&price>0)unique.set(bar.date,price);}
    const bars=Array.from(unique,([date,close])=>({date,close})).sort((a,b)=>a.date.localeCompare(b.date));
    if(bars.length<3)throw Error(`${symbol}: fewer than three usable trading dates. Try a longer range or another ticker.`);
    return {symbol,feed:typeof data.feed==='string'?data.feed:'unspecified',bars};
  }
  function stats(prices,allowVolatility=true){
    const values=prices.map(p=>100*p/prices[0]);
    const returns=prices.slice(1).map((p,i)=>p/prices[i]-1);
    const mean=returns.reduce((a,b)=>a+b,0)/returns.length;
    const variance=returns.reduce((sum,r)=>sum+(r-mean)**2,0)/(returns.length-1);
    let peak=values[0],drawdown=0;for(const value of values){peak=Math.max(peak,value);drawdown=Math.min(drawdown,value/peak-1);}
    return {values,returnPct:(values.at(-1)/100-1)*100,finalValue:values.at(-1),volatility:allowVolatility?Math.sqrt(variance*252)*100:null,drawdown:drawdown*100};
  }
  function compare(a,b){
    const right=new Map(b.bars.map(bar=>[bar.date,bar.close]));
    const shared=a.bars.filter(bar=>right.has(bar.date));
    if(shared.length<3)throw Error('These stocks have fewer than three shared trading dates. Choose a longer range.');
    const dates=shared.map(bar=>bar.date),start=dates[0],end=dates.at(-1);
    const aligned=[a,b].every(s=>s.bars.filter(bar=>bar.date>=start&&bar.date<=end).length===dates.length);
    return {dates,aligned,series:[{symbol:a.symbol,feed:a.feed,prices:shared.map(bar=>bar.close)},{symbol:b.symbol,feed:b.feed,prices:shared.map(bar=>right.get(bar.date))}].map(s=>({...s,...stats(s.prices,aligned)}))};
  }
  const api={normalize,stats,compare};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StockMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
