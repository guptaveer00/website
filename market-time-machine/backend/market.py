import json, urllib.request, datetime, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
CACHE=ROOT/'data'/'market.json'

def refresh():
    prices={}
    for symbol in ['SPY','QQQ','AGG','GLD']:
        url=f'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=20y&interval=1mo'
        request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(request,timeout=20) as response: raw=json.load(response)
        result=raw['chart']['result'][0]
        series=result['indicators']['adjclose'][0]['adjclose']; grouped={}
        current=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m')
        for stamp,price in zip(result['timestamp'],series):
            month=datetime.datetime.fromtimestamp(stamp,datetime.timezone.utc).strftime('%Y-%m')
            if month<current and price is not None and price>0: grouped[month]=price
        prices[symbol]=grouped
    dates=sorted(set.intersection(*(set(x) for x in prices.values())))
    if len(dates)<24: raise ValueError('Historical API did not return enough complete months.')
    data={'dates':dates,'prices':prices,'source':{'provider':'Yahoo Finance chart endpoint','retrieved':datetime.datetime.now(datetime.timezone.utc).isoformat(),'adjustment':'Adjusted close (splits and distributions)','cached':False}}
    tmp=CACHE.with_suffix('.tmp'); tmp.write_text(json.dumps(data)); tmp.replace(CACHE)
    return data

def load():
    data=json.loads(CACHE.read_text()); data['source']['cached']=True; return data
if __name__=='__main__':
    data=refresh(); print(f"Saved {len(data['dates'])} common months: {data['dates'][0]} to {data['dates'][-1]}")
