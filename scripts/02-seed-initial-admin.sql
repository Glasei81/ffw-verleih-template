-- Seed initial admin user for FF Raubling
-- Admin: Stefan Glas
-- Email: stefan@glasei.email  
-- Password: golF0101

INSERT INTO admins (name, email, password) 
VALUES (
    'Stefan Glas',
    'stefan@glasei.email',
    '$2a$12$LQv3c1yqBwEHFl5aysHdsOu8.VlqmhnqyqSs8/VXk5VrjwdeqHD4C'
) ON CONFLICT (email) DO NOTHING;

-- Note: The password hash above corresponds to 'golF0101'
