import re

def enrich():
    with open("js/data.js", "r", encoding="utf-8") as f:
        content = f.read()
    
    # We will simply find ["Item1", "Item2"] and replace items that do not contain ":"
    def replacer(match):
        arr_str = match.group(1)
        # Find all quoted strings
        items = re.findall(r'"([^"]+)"', arr_str)
        new_items = []
        for item in items:
            if ":" not in item:
                new_items.append(f'"{item}: Yerel halkın vazgeçilmezi olan, bölgenin otantik ve geleneksel tatlarını barındıran enfes lezzet."')
            else:
                new_items.append(f'"{item}"')
        
        return 'whatToEat: [' + ', '.join(new_items) + ']'
        
    new_content = re.sub(r'whatToEat\s*:\s*(\[[^\]]+\])', replacer, content)
    
    with open("js/data.js", "w", encoding="utf-8") as f:
        f.write(new_content)

if __name__ == "__main__":
    enrich()
