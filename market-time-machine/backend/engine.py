"""Monthly, fractional-unit portfolio simulation. No future prices drive trades."""
import math
ASSETS = ['SPY', 'QQQ', 'AGG', 'GLD', 'CASH']

def validate(c, dates):
    weights = c.get('weights', {})
    if set(weights) != set(ASSETS): raise ValueError('Supply all five allocations.')
    for v in weights.values():
        if isinstance(v, bool) or not isinstance(v, (int,float)) or not math.isfinite(v) or not 0 <= v <= 100: raise ValueError('Allocations must be between 0 and 100.')
    if abs(sum(weights.values())-100)>0.001: raise ValueError('Allocations must total 100%.')
    for key, low, high in [('initial',100,10000000),('contribution',0,100000),('fee',0,100)]:
        v=c.get(key)
        if isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) or not low <= v <= high: raise ValueError(f'Invalid {key}.')
    if c.get('rule') not in ['hold','quarterly','annual','threshold']: raise ValueError('Choose a valid rebalancing rule.')
    if c.get('start') not in dates or c.get('end') not in dates or c['start']>=c['end']: raise ValueError('Choose an available start month before the end month.')

def simulate(c, data, rule=None):
    dates=[d for d in data['dates'] if c['start'] <= d <= c['end']]
    w={k:c['weights'][k]/100 for k in ASSETS}; values={k:0.0 for k in ASSETS}
    fee=c['fee']/10000; logs=[]; points=[]; returns=[]; fees=0; peak=1; index=1; worst=0
    def rebalance(amount, date, reason):
        nonlocal fees, values
        # Solve target value after proportional transaction costs via bisection.
        lo,hi=0,amount
        for _ in range(60):
            target=(lo+hi)/2
            cost=sum(abs(target*w[k]-values[k]) for k in ASSETS if k!='CASH')*fee
            if target+cost>amount: hi=target
            else: lo=target
        target=(lo+hi)/2
        trades={k:round(target*w[k]-values[k],2) for k in ASSETS if k!='CASH'}
        cost=amount-target; fees+=cost; values={k:target*w[k] for k in ASSETS}
        logs.append({'date':date,'reason':reason,'cost':round(cost,2),'trades':trades})
    rebalance(c['initial'],dates[0],'Initial allocation')
    for i,d in enumerate(dates):
        if i:
            before=sum(values.values())
            for k in ASSETS:
                if k!='CASH': values[k]*=data['prices'][k][d]/data['prices'][k][dates[i-1]]
            values['CASH']+=c['contribution']
            policy=rule or c['rule']; total=sum(values.values())
            drift=max(abs(values[k]/total-w[k]) for k in ASSETS)
            due=(policy=='quarterly' and i%3==0) or (policy=='annual' and i%12==0) or (policy=='threshold' and drift>0.05)
            if due: rebalance(total,d, 'Allocation drift >5 percentage points' if policy=='threshold' else policy.capitalize()+' rebalance')
            elif c['contribution']:
                # Invest each contribution at target weights; leave prior holdings alone.
                cost=sum(c['contribution']*w[k]*fee/(1+fee) for k in ASSETS if k!='CASH'); fees+=cost
                values['CASH']-=c['contribution']*(1-w['CASH'])
                for k in ASSETS:
                    if k!='CASH': values[k]+=c['contribution']*w[k]/(1+fee)
            r=(sum(values.values())-c['contribution'])/before-1
            returns.append(r); index*=1+r; peak=max(peak,index); worst=min(worst,index/peak-1)
        points.append({'date':d,'value':round(sum(values.values()),2),'drawdown':round((index/peak-1)*100,3)})
    mean=sum(returns)/len(returns); vol=(sum((r-mean)**2 for r in returns)/len(returns))**0.5*12**0.5
    paid=c['initial']+c['contribution']*(len(dates)-1)
    return {'points':points,'metrics':{'final':points[-1]['value'],'invested':paid,'gain':points[-1]['value']-paid,'annualReturn':(index**(12/len(returns))-1)*100,'volatility':vol*100,'drawdown':worst*100,'fees':fees},'trades':logs}

def experiment(c,data):
    validate(c,data['dates'])
    benchmark={**c,'weights':{k:100 if k=='SPY' else 0 for k in ASSETS},'rule':'hold'}
    runs={'strategy':simulate(c,data),'hold':simulate(c,data,'hold'),'benchmark':simulate(benchmark,data)}
    length=data['dates'].index(c['end'])-data['dates'].index(c['start'])
    rolling=[]
    for i in range(0,len(data['dates'])-length,12):
        cfg={**c,'start':data['dates'][i],'end':data['dates'][i+length]}
        result=simulate(cfg,data); base=simulate({**cfg,'weights':benchmark['weights'],'rule':'hold'},data)
        rolling.append({'start':cfg['start'],'end':cfg['end'],'strategy':result['metrics']['annualReturn'],'benchmark':base['metrics']['annualReturn']})
    return {'runs':runs,'rolling':rolling,'source':data['source'],'config':c}
