import re
import time
import random
from typing import Dict, Any
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from src.common.services.webdriver_service import get

# Danbooruでアーティストを検索する
def search_artist(driver, artist, max_pages=1):
    soups = []
    html_contents = []
    results = []
    retry_delay = 1  # 初期リトライ遅延（秒）
    
    for page_num in range(1, max_pages + 1):
        retry_count = 0
        max_retries = 3
        
        while retry_count <= max_retries:
            try:
                # ページ間のクールタイム
                if page_num > 1 or retry_count > 0:
                    cooldown = random.uniform(1.0, 2.5) + (retry_count * 0.5)
                    time.sleep(cooldown)
                
                soup = get(driver, "https://danbooru.donmai.us/artists?search%5Bany_name_matches%5D={?}&page={?}",[artist, str(page_num)])
                html_contents.append(driver.page_source)
                
                if soup:
                    table_body = soup.select_one("table tbody")
                    if not table_body:
                        # テーブルが見つからない場合、ページが存在しないとみなして終了
                        return soups, html_contents, results
                    
                    rows = table_body.select("tr")
                    if not rows:
                        # 行が存在しない場合、ページが存在しないとみなして終了
                        return soups, html_contents, results
                    
                    for row in rows:
                        cols = row.select("td")
                        if len(cols) >= 4:
                            results.append((
                                _get_search_aname(cols[0]) |
                                {'post_count': _get_search_pcnt(cols[0])} |
                                {'other_name': _get_search_oname(cols[1])} |
                                _get_search_flags(cols[2]) |
                                {'updated_at': _get_search_updated(cols[3])}
                            ))
                    
                    soups.append(soup)
                    break  # 成功したらリトライループを抜ける
                else:
                    raise Exception("ページの取得に失敗しました")
                    
            except Exception as e:
                retry_count += 1
                if retry_count > max_retries:
                    # 最大リトライ回数に達した場合、エラー情報を結果に含める
                    results.append({
                        'error': True,
                        'page': page_num,
                        'message': f"ページ {page_num} の取得に失敗: {str(e)}",
                        'retry_count': retry_count - 1
                    })
                    break
                else:
                    # 指数関数的バックオフでリトライ遅延を増加
                    retry_delay = min(retry_delay * 2, 10)  # 最大10秒
                    time.sleep(retry_delay + random.uniform(0, 1))
                    
    return soups, html_contents, results

def get_post(driver, url):
    soup = get(driver,url)
    html_content = driver.page_source

    tags = _get_tags(soup,['0','1','2','3','4','5'])
    return soup, html_content, (
            {'id': urlparse(url).path.strip("/").split("/")[-1]} |
            {'image_url': _get_original_url(soup)} |
            _get_info(soup,['width','height','rating','score','source']) |
            {'upload_date': _get_created_at(soup)} |
            {'tags':
                {
                    'general': tags['0'],
                    'artist': tags['1'],
                    'copyright': tags['3'],
                    'character': tags['4'],
                    'metadata': tags['5']
                }
            }
    )

def _get_search_pcnt(soup):
    return soup.select_one(".post-count").get_text()

def _get_search_aname(soup):
    result = {}
    content = soup.select_one("a[href*='/artists/']")
    if content:
        match = re.search(r'/artists/(\d+)', content.get("href", ""))
        if isinstance(match, re.Match): result['id'] = match.group(1)
        result['artist'] = content.get_text(strip=True)
    return result

def _get_search_oname(soup):
    return [a.get_text(strip=True) for a in soup.select("a")]

def _get_search_flags(soup):
    status_text = soup.get_text(strip=True).lower()
    return {
        'is_banned': "banned" in status_text,
        'is_deleted': "deleted" in status_text
    }

def _get_search_updated(soup):
    return soup.get_text(strip=True)

def _get_original_url(soup:BeautifulSoup):
    # まずog:imageを試す
    meta_tag = soup.select_one('meta[property="og:image"]')
    if meta_tag and "content" in meta_tag.attrs:
        return meta_tag["content"]
    
    # 次にdata-large-file-urlを試す
    img_container = soup.select_one('#image')
    if img_container and img_container.get('data-large-file-url'):
        return img_container.get('data-large-file-url')
    
    # 最後にsrcを試す
    img_tag = soup.select_one('#image img')
    if img_tag and img_tag.get('src'):
        return img_tag.get('src')
        
    return None

def _get_info(soup: BeautifulSoup, tags):
    container = soup.select_one('.image-container')
    return {tag: container.get(f"data-{tag}") for tag in tags} if container else {}

def _get_tags(soup:BeautifulSoup, tags):
    result = {}
    for tag in tags:
        entries = soup.select(f'.tag-type-{tag}')
        result[tag] = [e.get('data-tag-name').strip() for e in entries if e.get('data-tag-name')] # type: ignore
    return result

def _get_created_at(soup: BeautifulSoup):
    body_tag = soup.find('body')
    if body_tag and body_tag.get('data-post-created-at'): # type: ignore
        return body_tag.get('data-post-created-at') # type: ignore
    return None
