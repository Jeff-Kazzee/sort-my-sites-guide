# Open Cookie Database

- Source: https://github.com/jkwakman/Open-Cookie-Database
- License: Apache-2.0, copied unchanged in LICENSE next to this file. Repository license checked through the GitHub API on 2026-11-08.
- Commit: 7786335566460016f07a50705a92fc781c976f6f
- Fetched: 2026-11-08
- File used: open-cookie-database.csv

cookies.json keeps four columns of the CSV: the cookie or storage key name, the platform, the category and the wildcard flag. Rows are otherwise unchanged. Rebuild it with:

    node scripts/import-open-cookie-database.js <downloaded csv> <commit sha> <fetch date>
