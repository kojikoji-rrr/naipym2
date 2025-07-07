SELECT
    *
FROM (
    SELECT
        list.id  as 'tag_id',
        list.tag as 'tag',
        group_concat(DISTINCT domain) as domain,
        list.artist_id as 'artist_id',
        artist_name,
        other_names,
        post_count,
        is_banned,
        is_deleted, 
        '['||
        group_concat('{'||
            '"url":"'     ||img.url        ||'", '||
            '"filepath":"'||img.image_path ||'", '||
            '"filename":"'||img.image_name ||'", '||
            '"dled_at":"' ||img.download_at||'"}',
            ',')||
        ']' as original_image,
        '['||
        group_concat('{'||
            '"model":"'   ||gen.model      ||'", '||
            '"filepath":"'||gen.image_path ||'", '||
            '"filename":"'||gen.image_name ||'", '||
            '"gened_at":"'||gen.created_at ||'"}',
            ',')||
        ']' as generate_image,
        max(img.download_at) as 'last_dled_at',
        max(gen.created_at)  as 'last_gened_at',
        f.favorite,
        f.memo
    FROM (
            SELECT
                t.id,
                t.tag, 
                t.domain,
                CASE WHEN a.artist_id IS NOT NULL THEN a.artist_id   ELSE rep.artist_id   END as 'artist_id',
                CASE WHEN a.artist_id IS NOT NULL THEN a.artist_name ELSE rep.artist_name END as 'artist_name',
                CASE WHEN a.artist_id IS NOT NULL THEN a.other_names ELSE rep.other_names END as 'other_names',
                CASE WHEN a.artist_id IS NOT NULL THEN a.post_count  ELSE rep.post_count  END as 'post_count',
                CASE WHEN a.artist_id IS NOT NULL THEN a.is_banned   ELSE rep.is_banned   END as 'is_banned',
                CASE WHEN a.artist_id IS NOT NULL THEN a.is_deleted  ELSE rep.is_deleted  END as 'is_deleted'
            FROM
                tag_data t
                LEFT OUTER JOIN artist_data a ON t.tag = a.artist_name
                LEFT OUTER JOIN (
                    SELECT t1.id as 'rid', ra.*
                    FROM   tag_data t1, tag_data t2, tags_relation tr LEFT OUTER JOIN artist_data ra ON t2.tag = ra.artist_name
                    WHERE  t1.id = tr.tag_id AND t2.id = tr.rep_tag_id
                ) rep ON a.artist_id is null AND t.id = rep.rid
            WHERE
                t.type = 'artist'
            ORDER BY artist_name desc, domain
        ) list
        LEFT OUTER JOIN post_tag_relation pt ON list.tag = pt.tag
        LEFT OUTER JOIN image_data img ON pt.url = img.url
        LEFT OUTER JOIN artist_generate_relation gr ON list.artist_id = gr.artist_id
        LEFT OUTER JOIN generate_data gen ON gr.generate_id = gen.id
		LEFT OUTER JOIN favorite f ON list.id = f.tag_id
    GROUP BY
        list.tag, list.artist_id, artist_name, other_names, post_count, is_banned, is_deleted
) result