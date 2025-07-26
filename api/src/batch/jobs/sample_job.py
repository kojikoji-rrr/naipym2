import time
from typing import Any, Dict
from src.batch.jobs.base_job import BaseJob

class SampleJob(BaseJob):
    def _process(self, args: Dict[str, Any]):
        self.log("サンプルバッチ開始")
        total_count = 30
        
        for i in range(total_count):
            if (self.is_stopped()):
                break
            # 1秒待機
            time.sleep(1)
            # ログ出力（進捗表示）
            progress = i + 1
            self.log(f"進捗: {progress}/{total_count} ({progress/total_count*100:.1f}%)")
            # 10回ごとに詳細メッセージ
            if progress % 10 == 0:
                self.log(f"--- {progress}回目完了 ---")
