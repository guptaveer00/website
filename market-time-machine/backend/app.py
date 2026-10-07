"""Local server + JSON API. SQLite saves are scoped by a random browser token."""
import os,json,sqlite3,secrets,pathlib
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from engine import experiment
from market import load,ROOT
DB=pathlib.Path(os.environ.get('DATABASE_PATH',str(ROOT/'backend'/'experiments.sqlite3')))
with sqlite3.connect(DB) as db: db.execute('CREATE TABLE IF NOT EXISTS experiments (id TEXT PRIMARY KEY, owner TEXT, name TEXT, config TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)')
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*a): pass # Never log request bodies or private browser tokens.
    def reply(self,status,payload):
        body=json.dumps(payload,allow_nan=False).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(body))); self.send_header('Cache-Control','no-store'); self.end_headers(); self.wfile.write(body)
    def owner(self):
        token=self.headers.get('X-Experiment-Token','')
        if len(token)!=64 or any(c not in '0123456789abcdef' for c in token): raise ValueError('Missing browser experiment token.')
        return token
    def do_GET(self):
        try:
            if self.path=='/api/health': return self.reply(200,{'ok':True})
            if self.path=='/api/market':
                d=load(); return self.reply(200,{'dates':d['dates'],'source':d['source']})
            if self.path=='/api/experiments':
                owner=self.owner()
                with sqlite3.connect(DB) as db: rows=db.execute('SELECT id,name,config,created FROM experiments WHERE owner=? ORDER BY created DESC LIMIT 30',(owner,)).fetchall()
                return self.reply(200,{'experiments':[dict(id=r[0],name=r[1],config=json.loads(r[2]),created=r[3]) for r in rows]})
            # Only public frontend assets are served; never expose database/backend.
            if self.path.split('?')[0] not in ['/', '/index.html','/style.css','/app.js','/config.js','/favicon.ico']: return self.reply(404,{'error':'Not found'})
            return super().do_GET()
        except ValueError as e: self.reply(400,{'error':str(e)})
        except Exception: self.reply(503,{'error':'Data unavailable. Try again after checking the server.'})
    def do_POST(self):
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=16000: raise ValueError('Request is empty or too large.')
            c=json.loads(self.rfile.read(size))
            if not isinstance(c,dict): raise ValueError('Expected an object.')
            if self.path=='/api/simulate': return self.reply(200,experiment(c,load()))
            if self.path=='/api/experiments':
                owner=self.owner(); cfg=c.get('config',{}); experiment(cfg,load())
                name=str(c.get('name','Experiment')).strip()[:80] or 'Experiment'; key=secrets.token_hex(12)
                with sqlite3.connect(DB) as db:
                    if db.execute('SELECT count(*) FROM experiments WHERE owner=?',(owner,)).fetchone()[0]>=30: raise ValueError('Limit of 30 saved experiments reached.')
                    db.execute('INSERT INTO experiments(id,owner,name,config) VALUES(?,?,?,?)',(key,owner,name,json.dumps(cfg)))
                return self.reply(201,{'id':key})
            self.reply(404,{'error':'Not found'})
        except (ValueError,TypeError,KeyError) as e: self.reply(400,{'error':str(e)})
        except Exception: self.reply(503,{'error':'Could not complete request. Check the backend and cached data.'})
if __name__=='__main__':
    print('Market Time Machine server starting on port '+os.environ.get('PORT','8766'),flush=True)
    ThreadingHTTPServer((os.environ.get('HOST','127.0.0.1'),int(os.environ.get('PORT','8766'))),Handler).serve_forever()
