import os
import requests
from urllib.parse import quote
from bs4 import BeautifulSoup
from typing import List
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def create_webdriver(headless=True):
    chrome_service = Service(ChromeDriverManager().install())
    chrome_options = webdriver.ChromeOptions()
    if headless:
        chrome_options.add_argument("--headless=new")
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
    if not headless:
        driver.minimize_window()
    return driver

def get(driver, search_url:str, args: List[str]=[]) -> BeautifulSoup:
    for s in args:
        search_url = search_url.replace("{?}", quote(str(s)), 1)
    driver.get(search_url)
    return BeautifulSoup(driver.page_source, 'html.parser')

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
