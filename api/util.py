import configparser
from datetime import datetime
from pathlib import Path
from typing import Any

def load_config(path: Path) -> configparser.ConfigParser:
    result = configparser.ConfigParser()
    if path.exists():
        result.read(path, encoding='utf-8')
        print(f"設定ファイルを読み込みました: {path}")
    else:
        print(f"設定ファイルが見つかりません: {path}")
    return result

def get_file_info(file_path:Path) -> dict[str, Any]:
    stat = file_path.stat()
    return{
        'filename': file_path.name,
        'size': stat.st_size,
        'created_at': datetime.fromtimestamp(stat.st_atime).isoformat(),
        'updated_at': datetime.fromtimestamp(stat.st_mtime).isoformat()
    }