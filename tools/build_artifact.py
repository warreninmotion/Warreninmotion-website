"""Bouwt het artifact "Elke kilometer telt" (sponsorpagina om te werven tot de website klaar is).
Gebruik (vanuit de repo-root): python3 tools/build_artifact.py <uitvoermap>
Daarna publiceren met de Artifact-tool: file_path <uitvoermap>/index.html, root <uitvoermap>, files = alle
bestanden uit de map (zie de lijst die dit script print), url https://claude.ai/artifact/WNZQq2xvyEwfRpz45o7yDT.
Bron: src/artifact/index.html; scripts, stijl, data en foto's komen uit de site zelf (paden relatief gemaakt)."""
import sys, pathlib, shutil

OUT = pathlib.Path(sys.argv[1])
TEXT = ["data.js", "logos.js", "assets/site.css", "assets/actie.css", "assets/site.js",
        "assets/route-data.js", "assets/route.js", "assets/actie.js", "assets/tussenstand.js"]
IMG = ["shirt-voor", "shirt-achter", "shirt-links", "shirt-rechts", "bus-zij", "bus-achter"]

if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "assets/img").mkdir(parents=True)
shutil.copy("src/artifact/index.html", OUT / "index.html")
for f in TEXT:
    # het artifact staat niet op de domeinroot: absolute /assets/-paden worden relatief
    (OUT / f).write_text(pathlib.Path(f).read_text().replace('"/assets/', '"assets/'))
for n in IMG:
    shutil.copy(f"assets/img/{n}.webp", OUT / f"assets/img/{n}.webp")
(OUT / "assets/logos").mkdir()
for f in pathlib.Path("assets/logos").glob("*.*"):
    if not f.name.startswith("."):
        shutil.copy(f, OUT / "assets/logos" / f.name)
for f in sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file() and p.name != "index.html"):
    print(f)
