import configparser
from pathlib import Path

def load_config(path: Path) -> configparser.ConfigParser:
    result = configparser.ConfigParser()
    if path.exists():
        result.read(path, encoding='utf-8')
        print(f"設定ファイルを読み込みました: {path}")
    else:
        print(f"設定ファイルが見つかりません: {path}")
    return result
