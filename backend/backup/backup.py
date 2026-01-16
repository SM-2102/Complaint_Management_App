"""
Standalone database backup script.
Exports all tables from the database to CSV files.
Excludes 'alembic_version' table."""

import csv
import os
import shutil
from datetime import datetime
from pathlib import Path

import psycopg2
from config_backup import Config_backup

# Get database URL from environment
DATABASE_URL = Config_backup.DATABASE_URL_CONNECT
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set.")


# Parse the database URL (format: postgresql+asyncpg://user:pass@host:port/dbname)
# Convert asyncpg to psycopg2 format
db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

# Get backup folder from config_backup
BACKUP_FOLDER = Config_backup.BACKUP_FOLDER


def create_backup_directory():
    """Create a backup directory with timestamp in 'dd-mm-yyyy_hh-mm' format inside BACKUP_FOLDER."""
    timestamp = datetime.now().strftime("%d-%m-%Y_%H-%M")
    backup_dir = Path(f"{BACKUP_FOLDER}/backups/backup_{timestamp}")
    backup_dir.mkdir(parents=True, exist_ok=True)
    return backup_dir, timestamp


def get_all_tables(cursor):
    """Get all table names from the database, excluding certain tables."""
    exclude_tables = {"alembic_version"}
    cursor.execute(
        """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """
    )
    return [row[0] for row in cursor.fetchall() if row[0] not in exclude_tables]

def purge_old_complaints(cursor):
    """
    Delete complaints older than 6 months based on complaint_date.
    """
    print("[PURGE] Removing complaints older than 6 months...")

    cursor.execute(
        """
        DELETE FROM complaints
        WHERE complaint_date < CURRENT_DATE - INTERVAL '6 months'
        """
    )

    deleted = cursor.rowcount
    print(f"[PURGE] Complaints deleted: {deleted}")

def purge_notifications(cursor):
    """
    Delete resolved notifications
    """
    print("\n[PURGE] Removing Resolved Notifications...")

    cursor.execute(
        """
        DELETE FROM notifications
        WHERE resolved = 'Y'
        """
    )

    deleted = cursor.rowcount
    print(f"[PURGE] Notifications deleted: {deleted}")

def purge_old_stock_and_grc(cursor):
    """
    Delete GRC and stock records older than 1 year.
    """
    print("\n[PURGE] Removing GRC and Stock Indent data older than 1 year...")

    purge_statements = [
        (
            "grc_cgcel_return_history",
            "challan_date",
            """
            DELETE FROM grc_cgcel_return_history
            WHERE challan_date < CURRENT_DATE - INTERVAL '1 year'
            """
        ),
        (
            "grc_cgpisl_return_history",
            "challan_date",
            """
            DELETE FROM grc_cgpisl_return_history
            WHERE challan_date < CURRENT_DATE - INTERVAL '1 year'
            """
        ),
        (
            "stock_cgcel_indent",
            "indent_date",
            """
            DELETE FROM stock_cgcel_indent
            WHERE indent_date < CURRENT_DATE - INTERVAL '1 year'
            """
        ),
        (
            "stock_cgpisl_indent",
            "indent_date",
            """
            DELETE FROM stock_cgpisl_indent
            WHERE indent_date < CURRENT_DATE - INTERVAL '1 year'
            """
        ),
    ]

    total_deleted = 0

    for table, column, sql in purge_statements:
        cursor.execute(sql)
        deleted = cursor.rowcount
        total_deleted += deleted
        print(f"[PURGE] {table}: {deleted} rows deleted")


def export_table_to_csv(cursor, table_name, backup_dir):
    """Export a single table to CSV file."""
    try:
        cursor.execute(f'SELECT * FROM "{table_name}"')
        column_names = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        csv_file = backup_dir / f"{table_name}.csv"
        with open(csv_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(column_names)
            writer.writerows(rows)
        return len(rows)
    except Exception:
        return None


def backup_database():
    """Main backup function."""
    print("\n─────────────────────────────────────────────────────────────────────────────────")
    print("                     Complaint Management DB Backup Utility")
    print("─────────────────────────────────────────────────────────────────────────────────")
    print("─────────────────────────────────────────────────────────────────────────────────")
    print("[START] Connecting to database ...")
    print(f"[INFO] Datbase URL: {db_url.split('@')[1] if '@' in db_url else 'Unknown'}")
    print("─────────────────────────────────────────────────────────────────────────────────")

    connection = None
    backup_dir = None
    try:
        # Connect to the database
        connection = psycopg2.connect(db_url)
        cursor = connection.cursor()

        # Create backup directory and get timestamp
        backup_dir, timestamp = create_backup_directory()

        # Get all tables
        tables = get_all_tables(cursor)

        # Export each table
        successful = 0
        failed = 0

        for table in tables:
            classy_table = f"[EXPORT] {table:<30}... "
            row_count = export_table_to_csv(cursor, table, backup_dir)
            if row_count is not None:
                print(f"{classy_table}✔️  Success ({row_count} records)")
                successful += 1
            else:
                print(f"{classy_table}❌  Failed")
                failed += 1

        # Prepare zip file path
        zip_name = f"{BACKUP_FOLDER}/backups/backup_{timestamp}.zip"
        if os.path.exists(zip_name):
            os.remove(zip_name)

        # Zip the backup directory
        zip_path = shutil.make_archive(str(backup_dir), "zip", root_dir=backup_dir)

        # Move/rename the zip to the correct name if needed
        if not zip_path.endswith(".zip"):
            zip_path = zip_path + ".zip"
        if zip_path != zip_name:
            shutil.move(zip_path, zip_name)
            zip_path = zip_name

        # Delete the unzipped backup directory
        shutil.rmtree(backup_dir)
        print(f"\n[ZIP] Backup zipped : {zip_path}")

        # Summary
        print("\n─────────────────────────────────────────────────────────────────────────────────")
        print(f"[RESULT] Tables backed up:   {successful}")
        print(f"[RESULT] Tables failed:      {failed}")
        print("─────────────────────────────────────────────────────────────────────────────────")
        print(
            f"[COMPLETE] Backup finished at {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}"
        )
        print("─────────────────────────────────────────────────────────────────────────────────")

        # Purge old complaints AFTER successful backup
        purge_old_complaints(cursor)
        purge_old_stock_and_grc(cursor)
        purge_notifications(cursor)
        # Commit purge
        connection.commit()
        connection.autocommit = True
        cursor.execute("VACUUM ANALYZE complaints;")
        cursor.execute("VACUUM ANALYZE grc_cgcel_return_history;")
        cursor.execute("VACUUM ANALYZE stock_cgcel_indent;")
        cursor.execute("VACUUM ANALYZE notifications;")
        connection.autocommit = False
        print()
        print("[VACUUM] Complaints Table vacuumed")
        print("[VACUUM] Stock Indent Table vacuumed")
        print("[VACUUM] GRC Return Table vacuumed")
        print("[VACUUM] Notifications Table vacuumed")
        print()
        print("─────────────────────────────────────────────────────────────────────────────────")
        print("─────────────────────────────────────────────────────────────────────────────────")


    except psycopg2.Error as e:
        print(f"[ERROR] Database error: {str(e)}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    backup_database()
