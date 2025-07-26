from datetime import datetime, timedelta, timezone
from pathlib import Path

import sqlalchemy
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.declarative import declarative_base
from typing import Dict

Base = declarative_base()

JST = timezone(timedelta(hours=9))
def now():
    return datetime.now(JST).strftime('%Y-%m-%d %H:%M:%S')

class DBService:
    def __init__(self, path):
        self.engine: sqlalchemy.Engine = sqlalchemy.create_engine(f'sqlite:///{path}', echo=True)

    def open_session(self):
        return sessionmaker(bind=self.engine)()
    
    def insert(self, obj, update: bool = False, session=None):
        ses = session if session is not None else self.open_session()
        try:
            if isinstance(obj, list):
                for item in obj:
                    self._insert_one(item, update, ses)
            else:
                self._insert_one(obj, update, ses)
            ses.commit()
        except Exception:
            ses.rollback()
            raise
        finally:
            if session is None:
                ses.close()

    def _insert_one(self, obj, update, ses):
        model = type(obj)
        pk_keys = [key.name for key in sqlalchemy.inspect(model).primary_key]
        pk_filter = {key: getattr(obj, key) for key in pk_keys}
        existing = ses.query(model).filter_by(**pk_filter).first()
        if existing:
            if update:
                for col in obj.__table__.columns.keys():
                    if col not in pk_keys:
                        setattr(existing, col, getattr(obj, col))
            else:
                raise ValueError("Duplicate entry")
        else:
            ses.add(obj)
    
    def update(self, query, filter_by: dict, update_data: dict, session=None):
        ses = session if session is not None else self.open_session()
        try:
            query = ses.query(query).filter_by(**filter_by)
            query.update(update_data)
            ses.commit()
        except Exception as e:
            ses.rollback()
            raise
        finally:
            if session is None:
                ses.close()
    
    def get_query_count(self, query):
        return query.count()

    def get_query_result(self, query, limit=None, offset=None):
        q = query
        if limit is not None:
            q = q.limit(limit)
        if offset is not None:
            q = q.offset(offset)
        return q.all()

    def load_sql(self, sql_file_path: Path) -> str:
        if not sql_file_path.exists():
            raise FileNotFoundError(f"SQLファイルが見つかりません: {sql_file_path}")
        
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        return sql_content

    def _create_order_by(self, sort: Dict[str, bool]) -> str:
        order_clauses = []
        for field, asc in sort.items():
            direction = 'ASC' if asc else 'DESC'
            order_clauses.append(f"{field} {direction}")
        return "ORDER BY " + ", ".join(order_clauses) if order_clauses else ""

    def _create_limit_offset(self, limit:int, offset:int=0) -> str:
        return f"LIMIT {limit} OFFSET {offset}"
    
    def get_query_count_by_text(self, con:Session, query:str):
        try:
            total_query = text(query)
            total:int = len(con.execute(total_query).fetchall())
        except Exception as e:
            raise e

        return total

    def get_query_result_by_text(self, con:Session, query:str, sort:Dict[str,bool]|None = None, limit:int|None = None, offset:int|None = None) -> tuple[list[dict|str], int]:
        try:
            q = query
            if sort is not None:
                q = q + " " + self._create_order_by(sort)
            if limit is not None and offset is not None:
                q = q + " " + self._create_limit_offset(limit, offset)
            result_query = text(q)
            execute_result = con.execute(result_query)
            data = execute_result.fetchall()
            
            # データが取得できた場合（SELECT系）は取得行数、それ以外はマニュアルでROWCOUNTを取得
            if data:
                row_count = len(data)
            else:
                # INSERT/UPDATE/DELETE等の場合、changes()を使用
                try:
                    row_count = con.execute(text("SELECT changes()")).scalar() or 0
                except:
                    row_count = 0
            
            return self._convert_result_by_list(data), row_count
        except Exception as e:
            raise e

    def _convert_result_by_list(self, result) -> list[dict|str]:
        if not result:
            return []
        
        if hasattr(result[0], '_mapping'):
            values = list(result[0]._mapping.values())
        else:
            values = list(result[0].values()) if hasattr(result[0], 'values') else list(result[0])
        
        if len(values) == 1:
            return [row[0] for row in result]
        else:
            return [dict(row._mapping) if hasattr(row, '_mapping') else dict(row) for row in result]
    