from sqlalchemy import Column
from main import DB_SERVICE
from src.common.models.sqlalchemy.favorite import Favorite

# favoriteテーブル更新
def upsert_favorite(tag_id, fav, memo):
    con = DB_SERVICE.open_session()

    try:
        existing_favorite = con.query(Favorite).filter(Favorite.tag_id == tag_id).one_or_none()
        if existing_favorite:
            if memo is not None:
                existing_favorite.memo = memo
            if fav is not None:
                existing_favorite.favorite = fav
        else:
            new_favorite = Favorite(tag_id=tag_id, memo=memo if memo is not None else '', favorite=fav if fav is not None else False)
            con.add(new_favorite)
        con.commit()
    
    except Exception as e:
        con.rollback()
        raise e
    finally:
        con.close()