import re
from typing import Dict, Any
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
from src.common.services.webdriver_service import get

def get_post(driver, url):
    soup = get(driver,url)
    html_content = driver.page_source

    stats = _get_statistics(soup)
    path = str(urlparse(url).scheme) + "://" + str(stats.get('source'))
    return soup, html_content, (
            {'id': parse_qs(urlparse(url).query).get("id",[""])[0]} |
            {'image_url': _get_original_url(soup)} |
            _get_info(soup,['width','height','rating','score']) |
            {'tags':_get_tags(soup,['general','artist','character','copyright','metadata','deprecated'])} |
            {'source': path} |
            {'score': stats.get('score')} |
            {'upload_date': stats.get('posted')}
    )

def _get_original_url(soup:BeautifulSoup):
    meta_tag = soup.select_one('meta[property="og:image"]')
    return meta_tag["content"] if (meta_tag and "content" in meta_tag.attrs) else None

def _get_info(soup: BeautifulSoup, tags):
    container = soup.select_one('.image-container')
    return {tag: container.get(f"data-{tag}") for tag in tags} if container else {}

def _get_tags(soup:BeautifulSoup, tags):
    result = {}
    for tag in tags:
        entries = soup.select(f'.tag-type-{tag} a[href*="tags="]')
        result[tag] = [e.text.strip() for e in entries if e.text]
    return result

def _get_statistics(soup: BeautifulSoup):
    result: Dict[str, Any] = {}
    container = soup.select_one('section ul:has(h3:-soup-contains("Statistics"))')
    if container:
        for li in container.find_all('li'):
            text_all = " ".join(li.stripped_strings)
            kv_pairs = re.findall(r'(\w+):\s+([^:]+?)(?=\s*\w+:|$)', text_all)
            for k, v in kv_pairs:
                key = k.lower()
                val = v.strip() if v else ""
                # scoreキーの場合のみ "(vote Up )" を空文字に置換する
                if key == "score":
                    # 必要に応じてパターンを調整
                    val = re.sub(r'\(vote\s+Up\s*\)', '', val)
                result[key] = val.strip() if val else ""

            # SourceキーがあればリンクURLを取りたい場合
            if 'Source' in result and not result.get('Source_link'):
                a_tag = li.find('a')
                if a_tag and a_tag.get('href'):
                    result['source'] = a_tag['href']  # href属性
    return result
