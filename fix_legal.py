import sys
import os

with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

# Extract the <head> block, but add title for gizlilik
head_start = idx.find('<head>')
head_end = idx.find('</head>') + 7
head_html = idx[head_start:head_end]

# Extract <header>
header_start = idx.find('<header>')
header_end = idx.find('</header>') + 9
header_html = idx[header_start:header_end]

# Extract <footer>
footer_start = idx.find('<footer')
footer_end = idx.find('</footer>') + 9
footer_html = idx[footer_start:footer_end]

def process_file(filename, title):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the main content card
    main_start = content.find('<!-- Content Card -->')
    main_end = content.find('</main>')
    main_html = content[main_start:main_end]

    # Replace old [data-theme=dark] with new theme classes
    main_html = main_html.replace('content-card p-8 md:p-12', 'content-card p-8 sm:p-10 mb-20')
    main_html = main_html.replace("[data-theme*='dark']:prose-invert", "dark:prose-invert")

    new_head = head_html.replace('Vuelina | Akıllı Seyahat Rehberi', title + ' | Vuelina')

    new_content = f'''<!DOCTYPE html>
<html lang="tr" data-theme="dark-indigo" class="dark">
{new_head}
<body class="min-h-screen flex flex-col">
    {header_html}
    <main class="container mx-auto px-6 sm:px-6 py-8 sm:py-12 flex-grow">
        <div class="fade-in max-w-4xl mx-auto">
            {main_html}
        <script>
            // Mobil menü işlevselliği
            document.addEventListener('DOMContentLoaded', () => {{
                const mobileMenu = document.getElementById('mobile-menu');
                const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                const toggleMobileMenu = () => {{
                    if (!mobileMenu || !mobileMenuBtn) return;
                    const willOpen = mobileMenu.classList.contains('hidden');
                    mobileMenu.classList.toggle('hidden');
                    mobileMenuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
                }};
                if (mobileMenuBtn) {{
                    mobileMenuBtn.addEventListener('click', (e) => {{
                        e.preventDefault();
                        toggleMobileMenu();
                    }});
                }}
            }});
        </script>
        </div>
    </main>
    {footer_html}
</body>
</html>
'''
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)

process_file('gizlilik.html', 'Gizlilik Politikası')
process_file('kullanim-kosullari.html', 'Kullanım Koşulları')

print('Done')
