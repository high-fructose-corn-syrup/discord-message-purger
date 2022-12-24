node src/index.js "./secret.key" "guild_id=GUILD_ID" "author_id=AUTHOR_ID" "sort_order=asc"
timeout /t 60
start /MIN purge.bat
exit