SELECT DISTINCT memo
FROM
	favorite
WHERE
	memo IS NOT NULL AND memo <> ''
