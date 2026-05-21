<?php
// Define the secure directory where the database will live
$DB_DIR = __DIR__ . '/secure_data';
$DB_FILE = $DB_DIR . '/users.db';
$HTACCESS_FILE = $DB_DIR . '/.htaccess';

// 1. Automatically create the directory if it doesn't exist
if (!is_dir($DB_DIR)) {
    mkdir($DB_DIR, 0755, true);
}

// 2. Automatically create the .htaccess to block direct HTTP access to the database
if (!file_exists($HTACCESS_FILE)) {
    $htaccess_content = "Order allow,deny\nDeny from all\n";
    file_put_contents($HTACCESS_FILE, $htaccess_content);
}

// 3. Connect to SQLite database
try {
    $pdo = new PDO('sqlite:' . $DB_FILE);
    // Set error mode to exceptions
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 4. Create the users table if it doesn't exist
    $create_table_sql = "
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email TEXT,
        is_verified INTEGER DEFAULT 0,
        verification_token TEXT,
        is_superadmin INTEGER DEFAULT 0,
        is_approved INTEGER DEFAULT 0,
        reset_token TEXT,
        reset_expires INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($create_table_sql);

    // Attempt to add new columns for existing databases (Phase 3 Upgrade)
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0");
    } catch (PDOException $e) { /* Ignore if exists */
    }
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN verification_token TEXT");
    } catch (PDOException $e) { /* Ignore if exists */
    }
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN is_superadmin INTEGER DEFAULT 0");
    } catch (PDOException $e) { /* Ignore if exists */
    }
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN is_approved INTEGER DEFAULT 0");
    } catch (PDOException $e) { /* Ignore if exists */
    }
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN reset_token TEXT");
    } catch (PDOException $e) { /* Ignore if exists */
    }
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN reset_expires INTEGER");
    } catch (PDOException $e) { /* Ignore if exists */
    }
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN pending_email TEXT");
    } catch (PDOException $e) { /* Ignore if exists */
    }
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN email_change_token TEXT");
    } catch (PDOException $e) { /* Ignore if exists */
    }

    // Auto-provision Superadmin 'boss' account
    $boss_hash = password_hash('boss1234', PASSWORD_DEFAULT);
    $pdo->exec("INSERT OR IGNORE INTO users (username, password_hash, is_verified, is_superadmin, is_approved) VALUES ('boss', '{$boss_hash}', 1, 1, 1)");

    // Explicitly enforce approval in case the account already existed before the Phase 5 schema upgrade
    $pdo->exec("UPDATE users SET is_approved = 1 WHERE username = 'boss'");

    // Auto-provision regular Admin 'Singh' account
    $singh_hash = password_hash('Singh1234', PASSWORD_DEFAULT);
    $pdo->exec("INSERT OR IGNORE INTO users (username, password_hash, is_verified, is_superadmin, is_approved) VALUES ('Singh', '{$singh_hash}', 1, 0, 1)");
    $pdo->exec("UPDATE users SET is_approved = 1, is_verified = 1, is_superadmin = 0 WHERE username = 'Singh'");

    // 5. Create files metadata table
    $create_files_sql = "
    CREATE TABLE IF NOT EXISTS files_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        physical_name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        uploaded_by INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($create_files_sql);

    // Sync existing files in archives/ directory silently
    $archives_dir = __DIR__ . '/archives';
    if (is_dir($archives_dir)) {
        $raw_files = scandir($archives_dir);
        $stmt_check = $pdo->prepare("SELECT id FROM files_metadata WHERE physical_name = ?");
        $stmt_insert = $pdo->prepare("INSERT INTO files_metadata (physical_name, display_name, description) VALUES (?, ?, 'Legacy uploaded file without a description.')");

        foreach ($raw_files as $f) {
            if ($f !== '.' && $f !== '..' && $f !== '.htaccess' && is_file($archives_dir . '/' . $f)) {
                $stmt_check->execute([$f]);
                if (!$stmt_check->fetch()) {
                    $stmt_insert->execute([$f, $f]);
                }
            }
        }
    }

} catch (PDOException $e) {
    die("Database connection failed: Cannot initialize SQLite storage.");
}
?>