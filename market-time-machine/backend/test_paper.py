import unittest
from paper import open_portfolio,value_portfolio,validate_paper
class PaperTests(unittest.TestCase):
    def setUp(self):
        self.q={'quotes':{k:{'price':100,'asOf':'2026-10-07T20:00:00Z','stale':False} for k in ['SPY','QQQ','AGG','GLD']},'fetchedAt':'2026-10-07T21:00:00Z'}
        self.c={'initial':10000,'fee':0,'weights':{'SPY':60,'QQQ':0,'AGG':40,'GLD':0,'CASH':0}}
    def test_new_holdings(self):
        p=open_portfolio(self.c,self.q);self.assertAlmostEqual(p['holdings']['SPY'],60);self.assertAlmostEqual(value_portfolio(p,self.q)['total'],10000)
    def test_drift_and_plan(self):
        p=open_portfolio(self.c,self.q);self.q['quotes']['SPY']['price']=200
        v=value_portfolio(p,self.q);self.assertAlmostEqual(v['total'],16000);self.assertAlmostEqual(v['maxDrift'],15)
        trades={x['symbol']:x['dollars'] for x in v['plan']['trades']};self.assertAlmostEqual(trades['SPY'],-2400);self.assertAlmostEqual(trades['AGG'],2400)
    def test_cost_conservation(self):
        p=open_portfolio({**self.c,'fee':100},self.q);v=value_portfolio(p,self.q)
        self.assertAlmostEqual(v['total']+p['openingCost'],10000)
        self.assertAlmostEqual(v['plan']['valueAfter']+v['plan']['cost'],v['total'])
    def test_all_cash(self):
        p=open_portfolio({**self.c,'weights':{'SPY':0,'QQQ':0,'AGG':0,'GLD':0,'CASH':100}},self.q)
        self.assertAlmostEqual(value_portfolio(p,self.q)['total'],10000)
    def test_invalid_allocations(self):
        with self.assertRaises(ValueError):validate_paper({**self.c,'weights':{**self.c['weights'],'CASH':10}})
    def test_stale_prices(self):
        self.q['quotes']['SPY']['stale']=True
        from paper import QuoteError
        with self.assertRaises(QuoteError):open_portfolio(self.c,self.q)
if __name__=='__main__':unittest.main()
