-- Update admin passwords with proper hashes for testing
-- Password for all test accounts: admin123

UPDATE admins SET password_hash = '$2b$12$LQv3c1yqBw2LeOI.UKc31.qUjrKrwdstBxriav.Jls10Zq5YNVSPW' WHERE email = 'admin1@club.de';
UPDATE admins SET password_hash = '$2b$12$LQv3c1yqBw2LeOI.UKc31.qUjrKrwdstBxriav.Jls10Zq5YNVSPW' WHERE email = 'admin2@club.de';
UPDATE admins SET password_hash = '$2b$12$LQv3c1yqBw2LeOI.UKc31.qUjrKrwdstBxriav.Jls10Zq5YNVSPW' WHERE email = 'admin3@club.de';
