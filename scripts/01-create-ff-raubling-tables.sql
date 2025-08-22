-- FF Raubling Rental System Database Setup
-- Creates tables for inventory (inventar), rentals (ausleihen), and admins

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory table (inventar)
CREATE TABLE IF NOT EXISTS inventar (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    menge INTEGER NOT NULL DEFAULT 1,
    preis DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    verfuegbar BOOLEAN NOT NULL DEFAULT true,
    verliehen_bis DATE,
    beschreibung TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rentals table (ausleihen)
CREATE TABLE IF NOT EXISTS ausleihen (
    id SERIAL PRIMARY KEY,
    gegenstand_id INTEGER REFERENCES inventar(id) ON DELETE CASCADE,
    person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefon VARCHAR(50),
    ausleihe_datum DATE NOT NULL,
    rueckgabe_datum DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    menge INTEGER NOT NULL DEFAULT 1,
    gesamtpreis DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notizen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventar_verfuegbar ON inventar(verfuegbar);
CREATE INDEX IF NOT EXISTS idx_ausleihen_status ON ausleihen(status);
CREATE INDEX IF NOT EXISTS idx_ausleihen_datum ON ausleihen(ausleihe_datum);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventar_updated_at BEFORE UPDATE ON inventar 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ausleihen_updated_at BEFORE UPDATE ON ausleihen 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
