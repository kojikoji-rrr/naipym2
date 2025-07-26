import multiprocessing
from typing import Any, Dict
import uuid
from src.batch.jobs.sample_job import SampleJob
from src.common.models.sqlalchemy.batch_jobs import BatchJobs
from src.batch.jobs.fetch_bookmark_job import FetchBookmarkJob
from src.batch.jobs.generate_image_job import GenerateImageJob
from src.batch.jobs.re_fetch_job import ReFetchJob
from config import DB_SERVICE, LOGS_DIR

def create_job_instance(job_name:str, job_id:str):
    match job_name:
        case "fetchBookmark": 
            return FetchBookmarkJob(job_id, job_name)
        case "reFetch":
            return ReFetchJob(job_id, job_name)
        case "generateImage":
            return GenerateImageJob(job_id, job_name)
        case "sampleBatch":
            return SampleJob(job_id, job_name)
        case _:
            print(f"{job_name} is not found.")

# 直接実行する時のメインメソッド（基本的にはbatch_service.pyから実行）
def __main__(args:Dict[str, Any]):
    # ジョブID発行
    job_id = str(uuid.uuid4())
    # ジョブ準備
    job = create_job_instance(args["job_name"], job_id)
    
    if job:
        # バッチ実行
        process = multiprocessing.Process(target=job.execute, args=(args,))
        process.start()
        return job_id    
    else:
        raise Exception(f"ジョブが見つかりません。（{args["job_name"]}）")