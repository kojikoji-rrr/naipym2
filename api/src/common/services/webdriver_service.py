import os
import time
import requests
import pickle
from urllib.parse import quote, urlparse
from bs4 import BeautifulSoup
from typing import List
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from config import API_RESOURCE_DIR

def create_webdriver(headless=False, minimum=True):
    chrome_service = Service(ChromeDriverManager().install())
    chrome_options = webdriver.ChromeOptions()

    # Cloudflare回避用の設定
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    if headless: chrome_options.add_argument("--headless=new")
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    # WebDriverプロパティを隠す
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    # 最小化
    if minimum and not headless:
        driver.minimize_window()

    return driver

def get(driver, search_url:str, args: List[str]=[]) -> BeautifulSoup:
    for s in args:
        search_url = search_url.replace("{?}", quote(str(s)), 1)
    
    # まずドメインにアクセス
    domain = urlparse(search_url).netloc
    driver.get(search_url)
    
    # クッキーを読み込み
    _load_cookies(driver, domain)
    
    # クッキーを読み込んだ後、ページを再読み込み
    driver.get(search_url)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    # Cloudflareチャレンジ検知
    if _detect_cloudflare_challenge(soup):
        if _wait_for_manual_intervention(driver):
            soup = BeautifulSoup(driver.page_source, 'html.parser')
        else:
            raise Exception("Cloudflareチャレンジのタイムアウト")

    # クッキー保存
    _save_cookies(driver, domain)

    return soup

def download_image(url, file_path):
    result = None
    try:
        # フォルダ作成（存在していなければ）
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        r = requests.get(url, stream=True, timeout=15)
        r.raise_for_status()
        with open(file_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    except Exception as e:
        result = e
    return result

def save_image(file_path: str, data):
    # タプルの2番目の要素が画像データ
    image_data = data[1] if isinstance(data, tuple) else data
    # フォルダ作成（存在していなければ）
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(image_data)

    return True

def _detect_cloudflare_challenge(soup):
    page_text = soup.get_text().lower()
    
    # 強い検知条件（確実にChallenge画面）
    strong_indicators = [
        # タイトルが「しばらくお待ちください」
        soup.title and 'しばらくお待ちください' in soup.title.string,
        # 特定のCloudflare要素
        soup.find('div', {'class': 'cf-browser-verification'}),
        soup.find('div', {'id': 'cf-wrapper'}),
        soup.find('iframe', {'title': 'Widget containing a Cloudflare security challenge'}),
        # Challenge特有のフレーズ
        'あなたが人間であることを確認' in page_text and 'アクションを完了' in page_text,
        'checking your browser before accessing' in page_text,
        'verify you are human' in page_text and 'challenge' in page_text
    ]
    
    # 弱い検知条件（通常ページでも出現する可能性）
    weak_indicators = [
        'しばらくお待ちください' in page_text,
        'cloudflare' in page_text,
        'security check' in page_text
    ]
        
    # 強い条件が1つでもあれば確実にChallenge
    if any(strong_indicators):
        print(f"Cloudflareチャレンジ検知（強条件）: {soup.title}, テキスト抜粋: {page_text[:100]}...")
        return True
    
    # 除外条件があれば通常ページ
    if 'しばらくお待ちください' not in soup.title:
        return False
    
    # 弱い条件が複数あればChallenge可能性
    weak_count = sum(1 for indicator in weak_indicators if indicator)
    if weak_count >= 2:
        print(f"Cloudflareチャレンジ検知（弱条件複数）: {soup.title}, テキスト抜粋: {page_text[:100]}...")
        return True
    
    return False

def _wait_for_manual_intervention(driver, timeout=300):
    auto_reloaded = True

    """手動介入を待機（デフォルト5分）"""
    print("Cloudflareチャレンジを検知しました。")
    
    # 手動解決を待機
    print("手動でチャレンジを解決してください。")
    start_time = time.time()
    current_url = driver.current_url
    while time.time() - start_time < timeout:
        # URLが変わったか確認
        if driver.current_url != current_url:
            print("URLが変更されました。処理を継続します。")
            return True
        # Cloudflareページから脱出したか確認
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        if auto_reloaded and soup.find('p', string='以下のアクションを完了して、あなたが人間であることを確認してください。'):
            for i in range(3):
                print(f"画面更新試行 {i+1}/3")
                time.sleep(2)
                driver.refresh()
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                if not _detect_cloudflare_challenge(soup): return True
            
            auto_reloaded = False
            print("3回の更新でも解決されませんでした。手動解決を待機します。")
        
        if not _detect_cloudflare_challenge(soup):
            print("Cloudflareチャレンジを通過しました。")
            return True
        time.sleep(1)
    print("タイムアウトしました。")
    return False

def _load_cookies(driver, domain):
    cookies_file = f"{API_RESOURCE_DIR}/cookies_{domain}.pki"
    if os.path.exists(cookies_file):
        try:
            with open(cookies_file, 'rb') as f:
                cookies = pickle.load(f)
            for cookie in cookies:
                driver.add_cookie(cookie)
        except Exception as e:
            print(f"クッキー読み込みエラー: {e}")
    else:
        print(f"クッキーファイルが存在しません: {cookies_file}")

def _save_cookies(driver, domain):
    cookies_file = f"{API_RESOURCE_DIR}/cookies_{domain}.pki"
    try:
        os.makedirs(os.path.dirname(cookies_file), exist_ok=True)
        cookies = driver.get_cookies()
        with open(cookies_file, 'wb') as f:
            pickle.dump(cookies, f)
        print(f"クッキーを保存しました: {cookies_file}")
    except Exception as e:
        print(f"クッキー保存エラー: {e}")
