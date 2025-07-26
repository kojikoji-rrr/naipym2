import uuid
from fastapi import APIRouter, File, UploadFile
from src.batch.services.batch_service import execute_batch_job, get_job, get_job_list, get_last_job, get_log_lines
from src.batch.models.exec_request import ExecRequest
from util import get_file_info
from config import API_BASE, BOOKMARKS_DIR, LOGS_DIR

BASE_URI = f"{API_BASE}/batch"
router = APIRouter()

@router.get(f"{BASE_URI}/bookmarks")
def get_bookmark_list():
    try:
        bookmark_files = []
        for file_path in BOOKMARKS_DIR.iterdir():
            fileinfo = get_file_info(file_path)
            bookmark_files.append(fileinfo)
        
        bookmark_files.sort(key=lambda x: (x["created_at"], x["filename"]))
        return bookmark_files
    
    except Exception as e:
        return {"code": 500, "error": str(e)}

@router.post(f"{BASE_URI}/bookmarks")
async def upload_bookmark(file: UploadFile = File(...)):
    try:
        if file.filename:
            file_path = BOOKMARKS_DIR / file.filename
            file_content = await file.read()

            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            return {"code": 200}
        else:
            return {"code": 400, "error": "invalid filename: {file}"}
    except Exception as e:
        return {"code": 500, "error": str(e)}

@router.delete(f"{BASE_URI}/bookmarks/{{filename}}")
def delete_bookmark(filename: str):
    try:
        file_path = BOOKMARKS_DIR / filename
        if not file_path.exists():
            return {"code": 404, "error": "ファイルが見つかりません"}
        # ファイルを削除
        file_path.unlink()
        return {"code": 200}

    except Exception as e:
        return {"code": 500, "error": str(e)}

@router.get(f"{BASE_URI}/info")
def get_batches_info():
    # batch_jobsテーブルからbatch_nameの種類を抽出
    job_list = get_job_list()

    result = {}
    for job_name in job_list:
        job_data = get_last_job(job_name)
        logs, lastline = get_log_lines(LOGS_DIR / job_data.log_file) # type: ignore

        result[job_name] = {
            **job_data.to_dict(), # type: ignore
            "logs": logs,
            "lastline": lastline
        }
    
    return {"code": 200, "result": result}
    
@router.get(f"{BASE_URI}/info/{{job_id}}")
def get_batch_info(job_id: str, lastline:int):
    # job_idでDBからデータを取得
    job_data = get_job(job_id)

    # lasttime以降のログの差分取得
    logs, lastline = get_log_lines(LOGS_DIR / job_data.log_file, lastline)  # type: ignore

    result = {
        **job_data.to_dict(), # type: ignore
        "logs": logs,
        "lastline": lastline
    }

    return {"code": 200, "result": result}

@router.post(f"{BASE_URI}/exec")
def execute_batch(request:ExecRequest):
    # batchnameでDBから最後のデータを取得
    job_data = get_last_job(request.batchname)

    # バッチが実行中であれば返却
    if job_data and job_data.status == 'running': # type: ignore
        return {"code":400, "error":f"バッチは実行中です。(job_id={job_data.job_id}, status={job_data.status})"}

    # バッチを別プロセスで実行。job_idを取得
    job_data = execute_batch_job(request.batchname, request.args)

    return {"code":200, "result": job_data}
