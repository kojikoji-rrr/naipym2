import json
import multiprocessing
import time
from typing import Any, Dict
import uuid
from sqlalchemy import desc
from src.batch.job_main import create_job_instance
from config import DB_SERVICE
from src.common.models.sqlalchemy.batch_jobs import BatchJobs

def get_job(job_id:str) -> BatchJobs | None:
    con = DB_SERVICE.open_session()
    try:
        job_data = con.query(BatchJobs)\
                      .filter(BatchJobs.job_id == job_id)\
                      .first()
        return job_data
    finally:
        con.close()

def get_last_job(batchname:str) -> BatchJobs | None:
    con = DB_SERVICE.open_session()
    try:
        job_data = con.query(BatchJobs)\
                      .filter(BatchJobs.job_name == batchname)\
                      .order_by(desc(BatchJobs.started_at))\
                      .first()
        return job_data
    finally:
        con.close()

def get_job_list() -> list[str]:
    con = DB_SERVICE.open_session()
    try:
        job_names = con.query(BatchJobs.job_name)\
                       .filter(BatchJobs.job_name.isnot(None))\
                       .distinct()\
                       .all()
        return [name[0] for name in job_names if name[0]]
    finally:
        con.close()

def get_log_lines(log_file:str, lastline:int = 20):
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        new_lines = lines[lastline:] if lastline < len(lines) else []
        return new_lines, len(lines)
    except Exception as e:
        raise e

def execute_batch_job(job_name:str, args:Dict[str, Any] = {}):
    # ジョブID発行
    job_id = str(uuid.uuid4())
    # ジョブ準備
    job = create_job_instance(job_name, job_id)
    
    if job:
        # バッチ実行
        multiprocessing.Process(target=job.execute, args=(args,)).start()
        time.sleep(3)
        return get_job(job_id)
    
    else:
        raise Exception(f"ジョブが見つかりません。（{job_name}）")