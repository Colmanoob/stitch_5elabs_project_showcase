<?php
header('Content-Type: application/json');
require_once 'db.php';

$archives_dir = __DIR__ . '/archives';

// Helper to format bytes
function formatSizeUnits($bytes) {
    if ($bytes >= 1073741824) { return number_format($bytes / 1073741824, 2) . ' GB'; }
    elseif ($bytes >= 1048576) { return number_format($bytes / 1048576, 2) . ' MB'; }
    elseif ($bytes >= 1024) { return number_format($bytes / 1024, 2) . ' KB'; }
    elseif ($bytes > 1) { return $bytes . ' bytes'; }
    elseif ($bytes == 1) { return $bytes . ' byte'; }
    return '0 bytes';
}

$result = [];

try {
    // Fetch directly from the DB so descriptions and custom titles are available
    $stmt = $pdo->query("SELECT physical_name, display_name, description, uploaded_at FROM files_metadata ORDER BY uploaded_at DESC");
    $db_files = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($db_files as $f) {
        $path = $archives_dir . '/' . $f['physical_name'];
        if (is_file($path)) {
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $result[] = [
                'name' => htmlspecialchars($f['display_name']),
                'description' => htmlspecialchars($f['description']),
                'url' => 'archives/' . rawurlencode($f['physical_name']),
                'size_formatted' => formatSizeUnits(filesize($path)),
                'ext' => $ext
            ];
        }
    }
} catch (Exception $e) {
    // Fail silently with empty array
}

echo json_encode($result);
