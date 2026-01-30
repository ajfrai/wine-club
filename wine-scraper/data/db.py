"""Database operations for wine data using SQLite with FTS5."""
import sqlite3
from pathlib import Path
from typing import Optional, List, Dict, Any
import json


class WineDatabase:
    """SQLite database with FTS5 for 13M wines from Kaggle."""

    def __init__(self, db_path: str = "data/wines.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn: Optional[sqlite3.Connection] = None

    def connect(self):
        """Establish database connection."""
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        return self.conn

    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None

    def initialize_schema(self):
        """Create tables and indexes."""
        if not self.conn:
            self.connect()

        cursor = self.conn.cursor()

        # Main wines table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wine_id TEXT,
                name TEXT NOT NULL,
                winery TEXT,
                region TEXT,
                country TEXT,
                vintage INTEGER,
                rating REAL,
                num_reviews INTEGER,
                price_usd REAL,
                wine_type TEXT,
                grapes TEXT,
                source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(wine_id, source)
            )
        """)

        # Indexes for common queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_country ON wines(country)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_region ON wines(region)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rating ON wines(rating)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_price ON wines(price_usd)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_wine_type ON wines(wine_type)")

        # FTS5 virtual table for full-text search
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS wines_fts USING fts5(
                name, winery, region, grapes,
                content=wines,
                content_rowid=id
            )
        """)

        # Triggers to keep FTS table in sync
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS wines_ai AFTER INSERT ON wines BEGIN
                INSERT INTO wines_fts(rowid, name, winery, region, grapes)
                VALUES (new.id, new.name, new.winery, new.region, new.grapes);
            END
        """)

        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS wines_ad AFTER DELETE ON wines BEGIN
                DELETE FROM wines_fts WHERE rowid = old.id;
            END
        """)

        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS wines_au AFTER UPDATE ON wines BEGIN
                DELETE FROM wines_fts WHERE rowid = old.id;
                INSERT INTO wines_fts(rowid, name, winery, region, grapes)
                VALUES (new.id, new.name, new.winery, new.region, new.grapes);
            END
        """)

        self.conn.commit()

    def insert_wines(self, wines: List[Dict[str, Any]], source: str = "unknown") -> int:
        """Bulk insert wines into database."""
        if not self.conn:
            self.connect()

        cursor = self.conn.cursor()
        inserted = 0

        for wine in wines:
            try:
                cursor.execute("""
                    INSERT OR IGNORE INTO wines
                    (wine_id, name, winery, region, country, vintage,
                     rating, num_reviews, price_usd, wine_type, grapes, source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    wine.get('wine_id'),
                    wine.get('name'),
                    wine.get('winery'),
                    wine.get('region'),
                    wine.get('country'),
                    wine.get('vintage'),
                    wine.get('rating'),
                    wine.get('num_reviews'),
                    wine.get('price_usd'),
                    wine.get('wine_type'),
                    wine.get('grapes'),
                    wine.get('source', source)
                ))
                inserted += cursor.rowcount
            except sqlite3.Error as e:
                print(f"Error inserting wine {wine.get('name')}: {e}")
                continue

        self.conn.commit()
        return inserted

    def search_wines(
        self,
        query: Optional[str] = None,
        country: Optional[str] = None,
        region: Optional[str] = None,
        grapes: Optional[str] = None,
        min_rating: Optional[float] = None,
        max_price: Optional[float] = None,
        wine_type: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Search wines with filters."""
        if not self.conn:
            self.connect()

        conditions = []
        params = []

        # Full-text search
        if query:
            conditions.append("wines.id IN (SELECT rowid FROM wines_fts WHERE wines_fts MATCH ?)")
            params.append(query)

        # Filter conditions
        if country:
            conditions.append("country LIKE ?")
            params.append(f"%{country}%")

        if region:
            conditions.append("region LIKE ?")
            params.append(f"%{region}%")

        if grapes:
            conditions.append("grapes LIKE ?")
            params.append(f"%{grapes}%")

        if min_rating is not None:
            conditions.append("rating >= ?")
            params.append(min_rating)

        if max_price is not None:
            conditions.append("price_usd <= ?")
            params.append(max_price)

        if wine_type:
            conditions.append("wine_type = ?")
            params.append(wine_type)

        where_clause = " AND ".join(conditions) if conditions else "1=1"

        query_sql = f"""
            SELECT * FROM wines
            WHERE {where_clause}
            ORDER BY rating DESC, num_reviews DESC
            LIMIT ? OFFSET ?
        """
        params.extend([limit, offset])

        cursor = self.conn.cursor()
        cursor.execute(query_sql, params)

        return [dict(row) for row in cursor.fetchall()]

    def get_wine_by_id(self, wine_id: int) -> Optional[Dict[str, Any]]:
        """Get a single wine by ID."""
        if not self.conn:
            self.connect()

        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM wines WHERE id = ?", (wine_id,))
        row = cursor.fetchone()

        return dict(row) if row else None

    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics."""
        if not self.conn:
            self.connect()

        cursor = self.conn.cursor()

        stats = {}

        # Total wines
        cursor.execute("SELECT COUNT(*) as count FROM wines")
        stats['total_wines'] = cursor.fetchone()['count']

        # Countries
        cursor.execute("SELECT COUNT(DISTINCT country) as count FROM wines")
        stats['total_countries'] = cursor.fetchone()['count']

        # Regions
        cursor.execute("SELECT COUNT(DISTINCT region) as count FROM wines")
        stats['total_regions'] = cursor.fetchone()['count']

        # Average rating
        cursor.execute("SELECT AVG(rating) as avg FROM wines WHERE rating IS NOT NULL")
        avg_result = cursor.fetchone()['avg']
        stats['avg_rating'] = round(avg_result, 2) if avg_result is not None else 0.0

        # Price range
        cursor.execute("SELECT MIN(price_usd) as min, MAX(price_usd) as max FROM wines WHERE price_usd IS NOT NULL")
        row = cursor.fetchone()
        stats['price_range'] = {
            'min': row['min'] if row['min'] is not None else 0.0,
            'max': row['max'] if row['max'] is not None else 0.0
        }

        return stats
