import re
import os
import shutil as fs
import subprocess

print("Clearing folder")
fs.rmtree("mini")
os.mkdir("mini")

print("Copying files")
fileCount = 0
for file in os.listdir("site"):
    path = f"site/{file}"
    if os.path.isfile(path):
        fs.copy2(path, "mini")
        fileCount += 1
print(f"Copied {fileCount} files")

os.mkdir("mini/src") 
fs.copytree("site/src/assets", "mini/src/assets/")

print("\nLoading html data")
scriptPaths = []
stylePaths = []
html = ""
with open("site/index.html", "r") as f:
    html = f.read()
    scriptPaths = re.findall(r"<script\s*src=\"(.*?)\"\s*></script>", html)
    stylePaths = re.findall(r"<link rel=\"stylesheet\" href=\"(.*?)\"/>", html)

print(f"Detected {len(scriptPaths)} scripts and {len(stylePaths)} styles")

print("\nCompiling CSS")
css = ""
for stylePath in stylePaths:
    with open(f"site/{stylePath}", "r") as f:
        css += f.read() + "\n"

print("Minifying CSS")
newCss = re.sub(r"/\*.*?\*/", "", css)
newCss = re.sub(r"[\n\t]|\.\.\/", "", newCss)
newCss = re.sub(r"\s*([;{}])\s*", r"\1", newCss) 
newCss = re.sub(r":\s*", ":", newCss) 
newCss = re.sub(r"\s+", " ", newCss)
newCss = re.sub(r"\s*>\s*", ">", newCss)
newCss = re.sub(r"#([0-9A-Fa-f])\1([0-9A-Fa-f])\2([0-9A-Fa-f])\3;", r"#\1\2\3;", newCss)
newCss = re.sub(r"0[a-zA-Z]*?", "0", newCss)
newCss = re.sub(r" ([+/*]) ", r"\1", newCss)
newCss = re.sub(r";\}", "}", newCss)
newCss = re.sub(r",\s*", ",", newCss)

print("Renaming CSS variables")
cssVars = {}
for line in re.findall(r"--(.*?)\s*:\s*(.*?);", css):
    cssVars[line[0]] = line[1]
print(f"Found {len(cssVars)} CSS variables")

i = 0
for var, value in cssVars.items():
    if len(re.findall(f"--{var}:", newCss)) <= 1:
        print(f"Replaced {var}")
        newCss = newCss.replace(f"var(--{var})", f"{value}")
        newCss = newCss.replace(f"--{var}:.*?;", "")
        continue

    newName = hex(i)[2:]
    newCss = newCss.replace(f"--{var}:", f"--{newName}:")
    newCss = newCss.replace(f"var(--{var})", f"var(--{newName})")
    i += 1


print(f"{len(css)}b -> {len(newCss)}b")

with open("mini/src/styles.css", "w") as f:
    f.write(newCss)

print("\nCompiling JS")
externalScripts = []
js = ""

for scriptPath in scriptPaths:
    if scriptPath.startswith("http"):
        externalScripts.append(scriptPath)
    else:
        with open(f"site/{scriptPath}", "r") as f:
            js += f.read() + "\n"

with open("mini/all.js", "w") as f:
    f.write(js)

print("Minifying JS")
out = subprocess.run(
    "esbuild mini/all.js --minify --outfile=mini/src/main.js",
    shell=True,
    capture_output=True,
    text=True
)
if out.returncode != 0:
    print(out.stdout)
    print(out.stderr)
    raise Exception("Failed to minify JS")
print(out.stderr)
newJsSize = int(float(re.findall(r"([\d.]+)kb", out.stderr)[0]) * 1000)
print(f"{len(js)}b -> {newJsSize}b")
os.remove("mini/all.js")

print("\nPatching HTML")
html = re.sub(r"<link rel=\"stylesheet\" href=\".*?\"/>", "", html)
html = re.sub(r"<script\s*src=\".*?\"\s*></script>", "", html)

externalScriptsHtml = ""
for scriptPath in externalScripts:
    externalScriptsHtml += f"<script src=\"{scriptPath}\"></script>"
html = html.replace("</head>", "<link rel=\"stylesheet\" href=\"src/styles.css\"/></head>")
html = html.replace("</body>", externalScriptsHtml + "<script src=\"src/main.js\"></script></body>")

print("Minifying HTML")
newHtml = re.sub(r"<!--.*?-->", "", html)
newHtml = re.sub(r">\s+<", "><", newHtml)
newHtml = re.sub(r"\"\s+", "\"", newHtml)
newHtml = newHtml.replace("\n", "")

print(f"{len(html)}b -> {len(newHtml)}b")

with open("mini/index.html", "w") as f:
    f.write(newHtml)

print("\nDone!")

print(f"Html size {int(len(newHtml) / len(html) * 100)}%")
print(f"Css size {int(len(newCss) / len(css) * 100)}%")
print(f"Js size {int(newJsSize / len(js) * 100)}%")