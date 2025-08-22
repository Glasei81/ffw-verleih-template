-- Seeding initial data for the club rental system

-- Insert admin users (passwords will be hashed in the application)
INSERT INTO admins (email, password_hash, name) VALUES
('admin1@club.de', '$2b$10$placeholder1', 'Admin Eins'),
('admin2@club.de', '$2b$10$placeholder2', 'Admin Zwei'), 
('admin3@club.de', '$2b$10$placeholder3', 'Admin Drei')
ON CONFLICT (email) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory (name, description, price_per_day, is_available) VALUES
('Beamer', 'HD Projektor für Präsentationen', 25.00, true),
('Lautsprecher Set', 'Professionelles PA-System', 35.00, true),
('Mikrofon', 'Drahtloses Mikrofon', 15.00, true),
('Laptop', 'Business Laptop für Präsentationen', 20.00, true),
('Flipchart', 'Mobile Flipchart mit Papier', 10.00, true),
('Kamera', 'DSLR Kamera für Events', 30.00, true),
('Tische (10 Stück)', 'Klappbare Veranstaltungstische', 50.00, true),
('Stühle (20 Stück)', 'Stapelbare Veranstaltungsstühle', 40.00, true)
ON CONFLICT DO NOTHING;
