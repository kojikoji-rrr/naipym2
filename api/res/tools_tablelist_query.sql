SELECT
	table_name,
	column_id,
	column_name,
	data_type,
	not_null,
	default_value,
	primary_key
FROM (
	SELECT
		m.name AS table_name,
		p.cid AS column_id,
		p.name AS column_name,
		p.type AS data_type,
		p.`notnull` AS not_null,
		p.dflt_value AS default_value,
		p.pk AS primary_key
	FROM
		sqlite_master m, pragma_table_info(m.name) p
	WHERE
		m.type = 'table'
	)
ORDER BY table_name, column_id