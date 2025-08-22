-- Sample inventory items for FF Raubling
INSERT INTO inventar (name, menge, preis, beschreibung) VALUES
('Feuerwehrschlauch 20m', 5, 15.00, 'Professioneller Feuerwehrschlauch, 20 Meter Länge'),
('Löschdecke', 10, 5.00, 'Feuerlöschdecke für kleine Brände'),
('Erste-Hilfe-Koffer', 3, 10.00, 'Vollständig ausgestatteter Erste-Hilfe-Koffer'),
('Warnweste', 20, 2.00, 'Reflektierende Sicherheitsweste'),
('Megafon', 2, 8.00, 'Batteriebetriebenes Megafon für Durchsagen'),
('Absperrband 50m', 8, 3.00, 'Rot-weißes Absperrband, 50 Meter'),
('Taschenlampe LED', 15, 4.00, 'Wasserdichte LED-Taschenlampe'),
('Schutzhelm', 12, 6.00, 'Feuerwehr-Schutzhelm nach DIN-Norm'),
('Atemschutzmaske', 6, 25.00, 'Professionelle Atemschutzmaske'),
('Verkehrsleitkegel', 25, 1.50, 'Orange Verkehrsleitkegel, 50cm hoch')
ON CONFLICT DO NOTHING;
