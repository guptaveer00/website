import unittest
from engine import experiment,simulate,validate
class EngineTests(unittest.TestCase):
    def setUp(self):
        self.d={'dates':['2020-01','2020-02','2020-03','2020-04'],'prices':{k:dict(zip(['2020-01','2020-02','2020-03','2020-04'],[100,110,88,100])) for k in ['SPY','QQQ','AGG','GLD']},'source':{}}
        self.c={'start':'2020-01','end':'2020-04','initial':10000,'contribution':0,'fee':0,'rule':'hold','weights':{'SPY':100,'QQQ':0,'AGG':0,'GLD':0,'CASH':0}}
    def test_known_returns(self):
        r=simulate(self.c,self.d)
        self.assertAlmostEqual(r['metrics']['final'],10000)
        self.assertAlmostEqual(r['metrics']['drawdown'],-20)
        self.assertAlmostEqual(r['metrics']['annualReturn'],0)
    def test_cash_contributions(self):
        c={**self.c,'contribution':100,'weights':{k:100 if k=='CASH' else 0 for k in self.c['weights']}}
        r=simulate(c,self.d)
        self.assertAlmostEqual(r['metrics']['final'],10300)
        self.assertAlmostEqual(r['metrics']['annualReturn'],0)
    def test_purchase_fee(self):
        r=simulate({**self.c,'fee':100},self.d)
        self.assertAlmostEqual(r['metrics']['final'],10000/1.01,places=2)
        self.assertAlmostEqual(r['metrics']['fees'],10000-10000/1.01)
    def test_invalid_weights(self):
        with self.assertRaises(ValueError): validate({**self.c,'weights':{**self.c['weights'],'CASH':1}},self.d['dates'])
    def test_invalid_date(self):
        with self.assertRaises(ValueError): validate({**self.c,'start':'2021-01'},self.d['dates'])
    def test_no_future_data(self):
        first=simulate({**self.c,'rule':'quarterly'},self.d)['points'][:3]
        self.d['prices']['SPY']['2020-04']=1000
        self.assertEqual(first,simulate({**self.c,'rule':'quarterly'},self.d)['points'][:3])
if __name__=='__main__': unittest.main()
