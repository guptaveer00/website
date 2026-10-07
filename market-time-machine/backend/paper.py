"""Current-price paper portfolios, distinct from adjusted historical model units."""
import datetime,json,math,threading,time,urllib.request
from engine import ASSETS
LOCK=threading.Lock()
_CACHE=None
_EXPIRES=0

class QuoteError(Exception): pass

def quotes():
    global _CACHE,_EXPIRES
    with LOCK:
        if _CACHE is not None and time.monotonic()<_EXPIRES:
            return {**_CACHE,'cached':True}
        try:
            req=urllib.request.Request('https://fintable.io/api/v2/prices?symbols=SPY,QQQ,AGG,GLD',headers={'Accept':'application/json','User-Agent':'MarketTimeMachine/1.0'})
            with urllib.request.urlopen(req,timeout=15) as r:raw=json.load(r)
            found={}
            now=datetime.datetime.now(datetime.timezone.utc)
            for item in raw.get('data',[]):
                symbol=item.get('symbol')
                if symbol not in ASSETS[:-1]:continue
                price=float(item['price']); stamp=item.get('as_of');day=item.get('trading_day')
                if not math.isfinite(price) or price<=0 or item.get('currency')!='USD' or not stamp:raise ValueError()
                observed=datetime.datetime.fromisoformat(stamp.replace('Z','+00:00'))
                if observed.tzinfo is None or observed>now+datetime.timedelta(minutes=5):raise ValueError()
                found[symbol]={'price':price,'asOf':stamp,'tradingDay':day,'feed':item.get('feed','unknown'),'stale':now-observed>datetime.timedelta(hours=96)}
            if set(found)!=set(ASSETS[:-1]):raise ValueError()
            _CACHE={'provider':'Fintable','quotes':found,'fetchedAt':now.isoformat(),'cached':False}
            _EXPIRES=time.monotonic()+60
            return _CACHE
        except Exception as e:
            raise QuoteError('Latest prices are unavailable or incomplete. Your saved holdings are unchanged; try again later.') from e

def validate_paper(c):
    if not isinstance(c,dict):raise ValueError('Supply portfolio settings.')
    w=c.get('weights',{})
    if not isinstance(w,dict) or set(w)!=set(ASSETS):raise ValueError('Supply all five allocations.')
    for v in w.values():
        if isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) or not 0<=v<=100:raise ValueError('Invalid allocation.')
    if abs(sum(w.values())-100)>.001:raise ValueError('Allocations must total 100%.')
    for k,lo,hi in [('initial',100,10000000),('fee',0,100)]:
        v=c.get(k)
        if isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) or not lo<=v<=hi:raise ValueError('Invalid '+k)

def target_values(values,w,fee):
    total=sum(values.values());lo,hi=0,total
    for _ in range(60):
        value=(lo+hi)/2
        cost=sum(abs(value*w[k]/100-values[k]) for k in ASSETS if k!='CASH')*fee/10000
        if value+cost>total:hi=value
        else:lo=value
    target=(lo+hi)/2
    return {k:target*w[k]/100 for k in ASSETS},total-target

def open_portfolio(c,q):
    validate_paper(c)
    if any(x['stale'] for x in q['quotes'].values()):raise QuoteError('Quotes are over 96 hours old. New portfolios are disabled until fresher prices arrive.')
    values={k:c['initial'] if k=='CASH' else 0 for k in ASSETS}
    targets,cost=target_values(values,c['weights'],c['fee'])
    holdings={k:targets[k]/q['quotes'][k]['price'] for k in ASSETS if k!='CASH'}
    return {'weights':c['weights'],'initial':c['initial'],'fee':c['fee'],'holdings':holdings,'cash':targets['CASH'],'openingCost':cost,'openedAt':q['fetchedAt'],'openingQuotes':q['quotes']}

def value_portfolio(p,q):
    values={k:p['holdings'][k]*q['quotes'][k]['price'] for k in ASSETS if k!='CASH'};values['CASH']=p['cash'];total=sum(values.values())
    rows=[]
    target,cost=target_values(values,p['weights'],p['fee'])
    for k in ASSETS:
        actual=values[k]/total*100
        rows.append({'symbol':k,'shares':p['holdings'].get(k),'price':q['quotes'].get(k,{}).get('price'),'value':values[k],'target':p['weights'][k],'actual':actual,'drift':actual-p['weights'][k]})
    trades=[{'symbol':k,'dollars':target[k]-values[k],'shares':(target[k]-values[k])/q['quotes'][k]['price']} for k in ASSETS if k!='CASH']
    return {'total':total,'gain':total-p['initial'],'gainPercent':(total/p['initial']-1)*100,'openingCost':p['openingCost'],'maxDrift':max(abs(r['drift']) for r in rows),'rows':rows,'plan':{'trades':trades,'cost':cost,'cashAfter':target['CASH'],'valueAfter':sum(target.values()),'previewOnly':True},'market':q}
