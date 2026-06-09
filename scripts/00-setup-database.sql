-- FFW Raubling Geräteverleih – Datenbank einrichten
-- Dieses Skript erstellt alle benötigten Tabellen.
-- Einmal ausführen in Neon (oder PostgreSQL allgemein).

CREATE TABLE IF NOT EXISTS inventory (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_available  BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rentals (
    id           SERIAL PRIMARY KEY,
    item_id      INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    renter_name  VARCHAR(255) NOT NULL,
    renter_email VARCHAR(255) NOT NULL,
    renter_phone VARCHAR(50),
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    total_price  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status       VARCHAR(50)  NOT NULL DEFAULT 'pending',
    -- Status-Werte: pending | confirmed | returned | cancelled
    notes        TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rentals_status  ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_dates   ON rentals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_inventory_avail ON inventory(is_available);

-- Beispiel-Inventar (optional)
-- INSERT INTO inventory (name, description, price_per_day) VALUES
--   ('Bierzeltgarnitur 10er Set', '10 Tische + 20 Bänke', 25.00),
--   ('Partyzelt 4x6m', 'Weißes Festzelt mit Seitenteilen', 40.00),
--   ('Lautsprecher Set', '2x Aktivboxen mit Mischpult', 20.00);
