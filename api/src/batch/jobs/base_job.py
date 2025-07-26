import os
import json
from abc import abstractmethod
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict

from config import DB_SERVICE, LOGS_DIR
from src.common.models.sqlalchemy.batch_jobs import BatchJobs
from src.common.services.db_service import now

JST = timezone(timedelta(hours=9))

class BaseJob:
    job_id:str
    job_name:str
    log_path:Path
    wait_exit:bool

    def __init__(self, job_id:str, job_name:str):
        self.job_id = job_id
        self.job_name = job_name
        self.log_path = LOGS_DIR / f"{job_name}_{job_id}.log"
        self.wait_exit = False

    def _entry(self, args:Dict[str, Any]):
        # ログ作成
        if not self.log_path.exists():
            self.log_path.touch()
        
        # DB登録
        data = BatchJobs()
        data.job_id = self.job_id # type: ignore
        data.job_name = self.job_name # type: ignore
        data.argument = json.dumps(args, ensure_ascii=False)  # type: ignore
        data.pid = os.getpid() # type: ignore
        data.log_file = self.log_path.name # type: ignore
        data.status = "running" # type: ignore
        DB_SERVICE.insert(data)

    @abstractmethod
    def _process(self, args:Dict[str, Any]):
        pass
        
    def _final(self, e:Any|None=None):
        status = "completed"
        message = "正常終了しました"
        if(e):
            status = "error"
            message = str(e)
        elif self.wait_exit:
            status = "stopped"
            message = "ユーザにより手動停止されました。"
        
        # ログ出力
        self.log(f"<{status}>: {message}")
        # DB更新
        con = DB_SERVICE.open_session()
        try:
            job = con.query(BatchJobs).filter_by(job_id=self.job_id).first()
            if job:
                job.stopped_at = now() # type: ignore
                job.status = status # type: ignore
                job.message = message # type: ignore
                con.commit()
        finally:
            if self.log_path.with_suffix(".stop").exists():
                self.log_path.with_suffix(".stop").unlink()
            con.close()
            os._exit(0)

    def log(self, text:str = ""):
        timestamp = datetime.now(JST).strftime('%Y-%m-%d %H:%M:%S')
        with open(self.log_path, 'a', encoding='utf-8') as f:
            f.write(f"[{timestamp}] {text}\n")

    def execute(self, args:Dict[str, Any]):
        self._entry(args)
        try:
            self._process(args)
            self._final()
        except Exception as e:
            self._final(e)

    def is_stopped(self) -> bool:
        if self.log_path.with_suffix(".stop").exists():
            if not self.wait_exit:
                self.wait_exit = True
                self.log("停止要求を受信しました。")
        return self.wait_exit
