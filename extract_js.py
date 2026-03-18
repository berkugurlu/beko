import re
import sys

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Eylem planı:
# 1. <script> ve </script> etiketleri arasındaki kısmı bul.
# Not: Birden fazla <script> olabilir. Bizim aradığımız içinde "const icons = {" ve "const countriesData = {" olan kısımlardır. Veya doğrudan DOMContentLoaded içindeki bütün her şey.
start_idx = html.find("document.addEventListener('DOMContentLoaded', () => {")
if start_idx == -1:
    print("DOMContentLoaded bulunamadı!")
    sys.exit(1)

# we need to find the <script> boundary.
script_start = html.rfind('<script>', 0, start_idx)
script_end = html.find('</script>', start_idx)

full_script_content = html[script_start:script_end+9]

# Şimdi full_script_content içindeki "const icons = {" ile başlayan bloğu çıkaracağız.
# python script yazmak yerine manuel replace daha sağlıklı olur.
# Let's extract icons and countriesData using basic text processing.
idx_icons = html.find('const icons = {')
idx_countries = html.find('const countriesData = {')

# A lazy way: Since this script is huge, let's just create 'js/data.js' and 'js/app.js' by splitting the <script> block itself.
# In 'js/data.js', we need global let/const so we won't put them in DOMContentLoaded.
# The original code has everything inside DOMContentLoaded. If we move countriesData out, it becomes global. Which is fine.

body_start = full_script_content.find('{', full_script_content.find('DOMContentLoaded')) + 1
body_end = full_script_content.rfind('});', 0, len(full_script_content))

inner_code = full_script_content[body_start:body_end]

# We will write inner_code into 'js/app.js'. Wait, icons and countriesData will still be inside app.js if we do this.
# Instead, let's just move the entire script block contents into js/app.js minus the <script> tag! This is the easiest and safest 100% working way first! We will split into data.js in a moment.

js_content = html[script_start+8:script_end].strip()

# Create app.js
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

# Update index.html
new_script_tags = '<script src="js/data.js"></script>\n    <script src="js/app.js"></script>'
new_html = html[:script_start] + new_script_tags + html[script_end+9:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Kısmen ayrıştırıldı.")
