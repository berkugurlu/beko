import re

def extract_json_like_object(text, start_pattern):
    match = re.search(start_pattern, text)
    if not match:
        return None, text
    
    start_idx = match.end() - 1 # starts at '{'
    brace_count = 0
    in_string = False
    escape_char = False
    quote_char = None
    
    end_idx = -1
    for i in range(start_idx, len(text)):
        char = text[i]
        
        if in_string:
            if escape_char:
                escape_char = False
            elif char == '\\':
                escape_char = True
            elif char == quote_char:
                in_string = False
        else:
            if char in ('"', "'", "`"):
                in_string = True
                quote_char = char
            elif char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_idx = i
                    break
                    
    if end_idx != -1:
        extracted = text[match.start():end_idx+1]
        
        # also remove trailing semicolons or newlines if any
        remove_end = end_idx + 1
        while remove_end < len(text) and text[remove_end] in (' ', '\n', '\r', ';'):
            remove_end += 1
            
        remaining_text = text[:match.start()] + text[remove_end:]
        return extracted, remaining_text
    
    return None, text

with open('js/app.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Extract icons
icons_code, js_content = extract_json_like_object(js_content, r'const\s+icons\s*=\s*\{')
# Extract countriesData
countries_code, js_content = extract_json_like_object(js_content, r'const\s+countriesData\s*=\s*\{')

if icons_code and countries_code:
    # We want these to be top-level globals in data.js
    data_content = icons_code + "\n\n" + countries_code + "\n"
    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(data_content)
        
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("Başarıyla ayrıştırıldı!")
else:
    print("Değişkenler bulunamadı veya parse edilemedi.")
