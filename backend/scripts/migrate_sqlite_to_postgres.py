#!/usr/bin/env python3
"""
Copy shared readings (and any accounts data) from the SQLite file into another
database - typically Postgres - preserving ids, so existing /r/<id> links keep
working.

    DATABASE_URL=postgresql://user:pw@host/zodicog \
        python backend/scripts/migrate_sqlite_to_postgres.py [path/to/results.db]

Safe to re-run: rows whose primary key already exists in the target are skipped.
Stop the backend, run this, then start it with DATABASE_URL set.
"""
import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, insert, select

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import db  # noqa: E402

TABLES = [db.users, db.results, db.profiles, db.sessions, db.login_tokens]
PK = {"users": "id", "results": "id", "profiles": "user_id", "sessions": "token_hash", "login_tokens": "token_hash"}


def migrate(source_url: str, target_url: str) -> dict[str, int]:
    source = create_engine(source_url)
    os.environ["DATABASE_URL"] = target_url
    db.reset_engine()
    target = db.get_engine()  # creates the schema on the target

    copied: dict[str, int] = {}
    with source.connect() as src, target.begin() as dst:
        existing_tables = set(source.dialect.get_table_names(src))
        for table in TABLES:
            if table.name not in existing_tables:
                copied[table.name] = 0
                continue
            cols = [c.name for c in table.columns]
            src_cols = {c["name"] for c in __import__("sqlalchemy").inspect(source).get_columns(table.name)}
            use = [c for c in cols if c in src_cols]
            have = {r[0] for r in dst.execute(select(table.c[PK[table.name]]))}
            n = 0
            for row in src.execute(select(*[table.c[c] for c in use])):
                data = dict(zip(use, row))
                if data[PK[table.name]] in have:
                    continue
                dst.execute(insert(table).values(**data))
                n += 1
            copied[table.name] = n
    return copied


def main() -> int:
    target = os.getenv("DATABASE_URL")
    if not target:
        print("Set DATABASE_URL to the target database (e.g. postgresql://...).", file=sys.stderr)
        return 1
    src_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "results.db"
    if not src_path.exists():
        print(f"No SQLite file at {src_path}", file=sys.stderr)
        return 1
    result = migrate(f"sqlite:///{src_path.as_posix()}", target)
    for name, n in result.items():
        print(f"{name:14} copied {n}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
