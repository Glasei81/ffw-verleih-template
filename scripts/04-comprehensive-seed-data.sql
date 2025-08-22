-- Comprehensive seed data for production-ready club rental system

-- Clear existing data (for fresh setup)
TRUNCATE TABLE rentals, inventory, admins RESTART IDENTITY CASCADE;

-- Insert admin users with proper hashed passwords (password: admin123)
INSERT INTO admins (email, password_hash, name) VALUES
('admin1@club.de', '$2b$12$LQv3c1yqBw2LeOI.UKc31.qUjrKrwdstBxriav.Jls10Zq5YNVSPW', 'Max Mustermann'),
('admin2@club.de', '$2b$12$LQv3c1yqBw2LeOI.UKc31.qUjrKrwdstBxriav.Jls10Zq5YNVSPW', 'Anna Schmidt'),
('admin3@club.de', '$2b$12$LQv3c1yqBw2LeOI.UKc31.qUjrKrwdstBxriav.Jls10Zq5YNVSPW', 'Thomas Weber');

-- Insert comprehensive inventory items
INSERT INTO inventory (name, description, price_per_day, is_available) VALUES
('HD Beamer', 'Hochauflösender Projektor mit HDMI und VGA Anschlüssen, ideal für Präsentationen und Events', 25.00, true),
('Professionelles PA-System', 'Komplettes Lautsprechersystem mit Mischpult, Mikrofonen und Kabeln für Events bis 200 Personen', 45.00, true),
('Drahtloses Mikrofon Set', 'Zwei drahtlose Handmikrofone mit Empfänger und Ladestationen', 20.00, true),
('Business Laptop', 'Moderner Laptop mit Office-Software, ideal für Präsentationen und Verwaltungsaufgaben', 30.00, true),
('Mobile Flipchart', 'Höhenverstellbare Flipchart mit Papierrolle und Markern', 12.00, true),
('DSLR Kamera Set', 'Professionelle Kamera mit Objektiven und Zubehör für Event-Dokumentation', 40.00, true),
('Veranstaltungstische (10 Stück)', 'Klappbare Tische 180x80cm, stapelbar und transportabel', 60.00, true),
('Stapelstühle (20 Stück)', 'Gepolsterte Stapelstühle für Veranstaltungen, inklusive Transportwagen', 50.00, true),
('LED Beleuchtungsset', 'Professionelle LED-Scheinwerfer mit Stativen für Bühnen- und Eventbeleuchtung', 35.00, true),
('Moderationskoffer', 'Komplettes Set mit Moderationskarten, Markern, Pins und Zubehör', 15.00, true),
('Getränkespender (5L)', 'Edelstahl-Getränkespender mit Zapfhahn für kalte Getränke', 18.00, true),
('Partyzelt 3x3m', 'Wasserdichtes Faltzelt mit Seitenwänden, ideal für Outdoor-Events', 55.00, true);

-- Insert sample rental data for demonstration
INSERT INTO rentals (item_id, renter_name, renter_email, renter_phone, start_date, end_date, total_price, status, notes) VALUES
(1, 'Maria Müller', 'maria.mueller@email.de', '+49 123 456789', '2024-12-25', '2024-12-27', 75.00, 'confirmed', 'Für Weihnachtsfeier im Vereinsheim'),
(3, 'Peter Klein', 'peter.klein@email.de', '+49 987 654321', '2024-12-30', '2024-12-31', 40.00, 'pending', 'Silvesterparty - benötige 2 Mikrofone'),
(7, 'Sarah Wagner', 'sarah.wagner@email.de', '+49 555 123456', '2025-01-15', '2025-01-17', 180.00, 'active', 'Firmenveranstaltung mit 80 Gästen'),
(2, 'Michael Bauer', 'michael.bauer@email.de', '+49 444 987654', '2025-01-20', '2025-01-22', 135.00, 'confirmed', 'Hochzeitsfeier im Garten'),
(12, 'Lisa Hoffmann', 'lisa.hoffmann@email.de', '+49 333 567890', '2025-02-01', '2025-02-02', 110.00, 'pending', 'Geburstagsfeier bei schlechtem Wetter als Backup');
