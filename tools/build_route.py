"""Maakt assets/route-data.js uit de 8 GPX-bestanden (Strava), in de volgorde van de etappes.
Gebruik vanuit de repo-root:  python3 tools/build_route.py assets/route-data.js etappe1.gpx ... etappe8.gpx"""
import sys, glob, math, json, xml.etree.ElementTree as ET
NS = {'g': 'http://www.topografix.com/GPX/1/1'}
OUT, FILES = sys.argv[1], sys.argv[2:]
assert len(FILES) == 8, 'geef precies 8 GPX-bestanden, etappe 1 t/m 8'
def load(p):
    r = ET.parse(p).getroot()
    return [(float(t.get('lat')), float(t.get('lon')), float(t.find('g:ele', NS).text)) for t in r.iterfind('.//g:trkpt', NS)]
def hav(a, b):
    R = 6371008.8; p1, p2 = math.radians(a[0]), math.radians(b[0]); dp = p2 - p1; dl = math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2; return 2 * R * math.asin(math.sqrt(h))
def updown(e, th=2.0):
    up = dn = 0; ref = e[0]
    for x in e[1:]:
        if x - ref >= th: up += x - ref; ref = x
        elif ref - x >= th: dn += ref - x; ref = x
    return up, dn
def dp(idx, P, tol):
    # Douglas-Peucker op lokale meters
    if len(idx) < 3: return idx
    a, b = P[idx[0]], P[idx[-1]]
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
    best, bi = -1, 0
    for k in range(1, len(idx) - 1):
        q = P[idx[k]]; d = abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / L
        if d > best: best, bi = d, k
    if best <= tol: return [idx[0], idx[-1]]
    return dp(idx[:bi + 1], P, tol)[:-1] + dp(idx[bi:], P, tol)
def resample(pts,step=100):
    d=[0]
    for i in range(len(pts)-1): d.append(d[-1]+hav(pts[i],pts[i+1]))
    out=[];k=0;t=0
    while t<=d[-1]:
        while k<len(d)-2 and d[k+1]<t:k+=1
        f=(t-d[k])/((d[k+1]-d[k]) or 1);out.append(pts[k][2]+(pts[k+1][2]-pts[k][2])*f);t+=step
    return out
def smooth(e,w=2):
    return [sum(e[max(0,i-w):i+w+1])/len(e[max(0,i-w):i+w+1]) for i in range(len(e))]
def zigzag(e,T=25):
    piv=[0];up=None;ext=0
    for k in range(1,len(e)):
        if up is None:
            if abs(e[k]-e[0])>=T: up=e[k]>e[0]; ext=k
        elif up:
            if e[k]>e[ext]: ext=k
            elif e[ext]-e[k]>=T: piv.append(ext); up=False; ext=k
        else:
            if e[k]<e[ext]: ext=k
            elif e[k]-e[ext]>=T: piv.append(ext); up=True; ext=k
    piv.append(ext if ext else len(e)-1)
    return piv
def climbs(e,step=100,th=3.0,half=5,gap=8,mingain=80,minlen=1000,mingrade=3.0):
    n=len(e); g=[0]*n
    for k in range(n):
        a=max(0,k-half); b=min(n-1,k+half); g[k]=(e[b]-e[a])/((b-a)*step or 1)*100
    runs=[];k=0
    while k<n:
        if g[k]>=th:
            s=k
            while k<n and g[k]>=th: k+=1
            runs.append([s,k-1])
        else: k+=1
    merged=[]
    for r in runs:
        if merged and r[0]-merged[-1][1]<=gap and max(e[merged[-1][1]:r[0]+1])-min(e[merged[-1][1]:r[0]+1])<40: merged[-1][1]=r[1]
        else: merged.append(r)
    res=[]
    for s,t2 in merged:
        lo=min(range(max(0,s-half),s+half+1),key=lambda k:e[k]); hi=max(range(max(0,t2-half),min(n,t2+half+1)),key=lambda k:e[k])
        L=(hi-lo)*step; gn=e[hi]-e[lo]
        if L>=minlen and gn>=mingain and gn/L*100>=mingrade: res.append((lo,hi,gn,L))
    return res

def cat(L, g):
    s = L * g  # Strava-formule: lengte (m) x gemiddeld %
    return 'HC' if s >= 80000 else '1' if s >= 64000 else '2' if s >= 32000 else '3' if s >= 16000 else '4' if s >= 8000 else ''
sys.setrecursionlimit(100000)
stages, off = [], 0.0
for pat in FILES:
    pts = load(pat)
    cum = [0.0]
    for i in range(len(pts) - 1): cum.append(cum[-1] + hav(pts[i], pts[i + 1]))
    e = [p[2] for p in pts]; up, dn = updown(e)
    lat0 = pts[0][0]; P = [((p[1]) * 111320 * math.cos(math.radians(lat0)), p[0] * 110540) for p in pts]
    keep = dp(list(range(len(pts))), P, 40)
    track = [[round(pts[i][0], 5), round(pts[i][1], 5), round(off + cum[i] / 1000, 2)] for i in keep]
    prof, k = [], 0
    t = 0.0
    while t <= cum[-1]:
        while k < len(cum) - 2 and cum[k + 1] < t: k += 1
        f = (t - cum[k]) / ((cum[k + 1] - cum[k]) or 1); prof.append(round(e[k] + (e[k + 1] - e[k]) * f))
        t += 500
    es = smooth(resample(pts)); cl = []
    for s0, t0, gn, L in climbs(es):
        g = gn / L * 100
        cl.append({'a': round(off + s0 * .1, 1), 'b': round(off + t0 * .1, 1), 'len': round(L / 1000, 1), 'grade': round(g, 1), 'gain': round(gn),
                   'top': round(es[t0]), 'cat': cat(L, g), 'prof': [round(x) for x in es[s0:t0 + 1]]})
    top = max(range(len(pts)), key=lambda i: e[i])
    stages.append({'km': round(cum[-1] / 1000, 1), 'up': round(up), 'down': round(dn), 'max': round(max(e)), 'min': round(min(e)),
                   'top': [round(pts[top][0], 5), round(pts[top][1], 5), round(off + cum[top] / 1000, 2)], 'track': track, 'prof': prof, 'climbs': cl})
    off += cum[-1] / 1000
out = {'km': round(off, 1), 'profStep': 0.5, 'stages': stages}
js = ('// Gegenereerd uit de GPX-bestanden van Strava (8 etappes; etappe 5 = optie A, wijnroute met klim).\n'
      '// Niet met de hand aanpassen. km = afstand langs het spoor, up/down = hoogtemeters (drempel 2 m),\n'
      '// track = [lat, lon, km vanaf Lucca], prof = hoogte (m) elke profStep km.\n'
      '// climbs: beklimmingen (helling >= 3% over 1 km, >= 80 m stijging), prof elke 100 m, cat volgens de Strava-formule.\n'
      'window.WIM_ROUTE = ' + json.dumps(out, separators=(',', ':')) + ';\n')
open(OUT, 'w').write(js)
print([[ (c['a'],c['len'],c['grade'],c['gain'],c['cat']) for c in s['climbs']] for s in stages]); print('totaal', out['km'], 'km', [(s['km'], s['up'], s['down'], len(s['track'])) for s in stages], round(len(js) / 1024), 'kB')
