import os
import time
import subprocess
import requests
from playwright.sync_api import sync_playwright

def main():
    screenshot_dir = os.path.join(os.getcwd(), "screenshot")
    os.makedirs(screenshot_dir, exist_ok=True)
    print(f"[+] Output directory for screenshots: {screenshot_dir}")

    # Start Flask server
    print("[+] Starting Flask server...")
    server_process = subprocess.Popen(["python3", "app.py"])
    time.sleep(2) # Give server time to bind

    # Verify server is up
    base_url = "http://127.0.0.1:5000"
    for _ in range(10):
        try:
            r = requests.get(base_url)
            if r.status_code == 200:
                print("[+] Flask server is live!")
                break
        except Exception:
            time.sleep(1)

    routes_to_capture = [
        ("/", "01_home_hero.png"),
        ("/products", "02_products_vault.png"),
        ("/product/1", "03_product_detail_3d.png"),
        ("/cart", "04_shopping_cart.png"),
        ("/admin", "05_admin_dashboard.png"),
        ("/admin/products/new", "06_admin_create_perfume.png"),
        ("/admin/products/1/edit", "07_admin_edit_perfume.png")
    ]

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900})

            for route, filename in routes_to_capture:
                target_url = f"{base_url}{route}"
                print(f"[+] Navigating to {target_url}...")
                page.goto(target_url, wait_until="networkidle")
                time.sleep(1.5) # Wait for WebGL/Three.js rendering & GSAP animations

                out_path = os.path.join(screenshot_dir, filename)
                page.screenshot(path=out_path, full_page=True)
                print(f"    └─ Saved screenshot: {out_path}")

            browser.close()
            print("[+] All Playwright screenshots captured successfully!")

    finally:
        print("[+] Terminating Flask server process...")
        server_process.terminate()
        server_process.wait()

if __name__ == "__main__":
    main()
