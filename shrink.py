import re
import os
import shutil as fs
import subprocess

print("Clearing folder")
fs.rmtree("mini")
os.mkdir("mini")

print("Copying files")
for file in os.listdir("site"):
    path = f"site/{file}"
    if os.path.isfile(path):
        fs.copy2(path, "mini")

os.mkdir("mini/src") 
fs.copytree("site/src/assets", "mini/src/assets/")

print("Compiling CSS")
css = ""
def GetCSSInFolder(path):
    global css
    for file in os.listdir(path):
        if file.endswith(".css"):
            with open(f"{path}/{file}", "r") as f:
                css += f.read()
        elif os.path.isdir(f"{path}/{file}"):
            GetCSSInFolder(f"{path}/{file}")

GetCSSInFolder("site/src/styles")
newCss = re.sub(r"[\n\t]|\.\.\/|(?<=[:;{}])\s*", "", css)
newCss = re.sub(r"\s*{|{\s*", "{", newCss)
newCss = re.sub(r"\s+", " ", newCss)
newCss = re.sub(r" > ", ">", newCss)


with open("mini/src/styles.css", "w") as f:
    f.write(newCss)

print("Loading html data")
scriptPaths = []
html = ""
with open("site/index.html", "r") as f:
    html = f.read()
    scriptPaths = re.findall(r"<script\s*src=\"(.*?)\"\s*></script>", html)

print("Compiling JS")
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
print("esbuild log:\n", out.stderr)
os.remove("mini/all.js")

print("Patching HTML")
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

with open("mini/index.html", "w") as f:
    f.write(newHtml)

print("Done!")

print(f"Html size {int(len(newHtml) / len(html) * 100)}%")
print(f"Css size {int(len(newCss) / len(css) * 100)}%")