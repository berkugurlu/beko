import time
from playwright.sync_api import sync_playwright
import subprocess
import sys

def verify_changes():
    # Start server
    server = subprocess.Popen([sys.executable, "-m", "http.server", "8080"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("http://localhost:8080")

            # 1. Verify "Smart Travel Card" exists
            if page.locator("text=Seyahatini Ucuza Getir").count() > 0:
                print("PASS: Smart Travel Card found.")
            else:
                print("FAIL: Smart Travel Card NOT found.")

            # 2. Verify Search Logic (search term 'Amerika' -> 'ABD')
            page.fill("#search-input", "Amerika")
            time.sleep(0.5) # Wait for UI update
            # Check if ABD is visible
            if page.locator("h3:has-text('ABD')").is_visible():
                print("PASS: Search for 'Amerika' found 'ABD'.")
            else:
                print("FAIL: Search for 'Amerika' did NOT find 'ABD'.")

            # 3. Verify No Results
            page.fill("#search-input", "xyznonexistent")
            time.sleep(0.5)
            if page.locator("#no-results").is_visible() and "Aradığınız yeri bulamadık" in page.inner_text("#no-results"):
                print("PASS: No results state verified.")
            else:
                print("FAIL: No results state failed.")

            # Screenshot for visual check
            page.screenshot(path="verification_final.png")

            browser.close()
    finally:
        server.terminate()

if __name__ == "__main__":
    verify_changes()
