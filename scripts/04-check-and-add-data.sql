-- Prüfen und Daten hinzufügen für FF Raubling System

-- Admin-Benutzer hinzufügen (falls nicht vorhanden)
INSERT INTO admins (name, email, password) 
VALUES ('Stefan Glas', 'stefan@glasei.email', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9S/EG')
ON CONFLICT (email) DO NOTHING;

-- Beispiel-Inventar hinzufügen
INSERT INTO inventar (name, menge, preis, verfügbar) VALUES
('Feuerlöscher 6kg', 10, 5.00, true),
('Löschschlauch 20m', 5, 8.00, true),
('Atemschutzgerät', 8, 15.00, true),
('Erste-Hilfe-Koffer', 12, 3.00, true),
('Warnweste', 25, 2.00, true),
('Absperrband 100m', 15, 1.50, true),
('Megafon', 3, 10.00, true),
('Taschenlampe LED', 20, 2.50, true),
('Schutzhelm', 18, 4.00, true),
('Warnschilder Set', 8, 6.00, true)
ON CONFLICT DO NOTHING;

-- Prüfen der eingefügten Daten
SELECT 'Admins:' as table_name, count(*) as count FROM admins
UNION ALL
SELECT 'Inventar:', count(*) FROM inventar
UNION ALL  
SELECT 'Ausleihen:', count(*) FROM ausleihen;
