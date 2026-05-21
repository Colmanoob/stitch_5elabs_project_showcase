<?php
session_start();

$ARCHIVES_DIR = __DIR__ . '/archives';

// 1. Ensure User is Logged In
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: admin.php');
    exit;
}

// Ensure directory exists
if (!is_dir($ARCHIVES_DIR)) {
    mkdir($ARCHIVES_DIR, 0755, true);
}

// Redirect helper
function redirect($msg, $type = 'success') {
    $_SESSION['msg'] = $msg;
    $_SESSION['msgType'] = $type;
    header('Location: admin.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['archiveFile'])) {
    
    $file = $_FILES['archiveFile'];
    
    // 2. Check for actual upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        redirect("Upload failed with error code: " . $file['error'], 'error');
    }

    // 3. Size limit (Set to 500MB)
    $maxSize = 500 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        redirect("File is too large. Maximum size is 500MB.", 'error');
    }

    // 4. White-list Extentions ONLY
    $fileName = basename($file['name']);
    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Comprehensive general list of allowed non-executable extensions
    $allowed_extensions = [
        'zip', 'rar', '7z', 'tar', 'gz', 
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
        'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
        'mp3', 'wav', 'mp4', 'mov', 'avi'
    ];

    if (!in_array($ext, $allowed_extensions)) {
        redirect("File type rarely used or forbidden (." . $ext . "). Only general files/archives are allowed.", 'error');
    }

    // 5. Blacklist Danger Extensions (double check)
    $dangerous = ['php', 'php3', 'php4', 'php5', 'phtml', 'exe', 'sh', 'bat', 'cgi', 'pl'];
    if (in_array($ext, $dangerous)) {
        redirect("Security violation: Executable files are not allowed.", 'error');
    }

    // 6. Sanitize File Name
    $safeFileName = preg_replace("/[^A-Z0-9._-]/i", "_", $fileName);
    
    // Prevent overwriting existing files by appending a timestamp if needed
    $targetPath = $ARCHIVES_DIR . '/' . $safeFileName;
    if (file_exists($targetPath)) {
        $nameWithoutExt = pathinfo($safeFileName, PATHINFO_FILENAME);
        $safeFileName = $nameWithoutExt . '_' . time() . '.' . $ext;
        $targetPath = $ARCHIVES_DIR . '/' . $safeFileName;
    }

    // 7. Final Security Check on MIME type locally
    // Note: mime_content_type requires fileinfo extension on server
    if (function_exists('mime_content_type')) {
        $mime = mime_content_type($file['tmp_name']);
        if (strpos($mime, 'php') !== false || strpos($mime, 'executable') !== false) {
             redirect("Security violation: File content is forbidden.", 'error');
        }
    }

    // Attempt Move
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        redirect("Super! '{$safeFileName}' was successfully uploaded and is now live on the Downloads page.", 'success');
    } else {
        redirect("An error occurred while moving the file to the archives directory. Check folder permissions.", 'error');
    }

} else {
    redirect("No file was sent.", 'error');
}
