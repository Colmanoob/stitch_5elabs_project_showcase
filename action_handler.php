<?php
session_start();
require_once 'config.php';
require_once 'db.php';

$ARCHIVES_DIR = __DIR__ . '/archives';

// 1. Ensure User is Logged In
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true || !isset($_SESSION['user_id'])) {
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

// Comprehensive general list of allowed non-executable extensions
$allowed_extensions = [
    'zip', 'rar', '7z', 'tar', 'gz', 
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
    'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
    'mp3', 'wav', 'mp4', 'mov', 'avi'
];
$dangerous = ['php', 'php3', 'php4', 'php5', 'phtml', 'exe', 'sh', 'bat', 'cgi', 'pl'];

// Validate Filename internally
function sanitizeAndCheck($filename, $allowed_extensions, $dangerous) {
    if (strpos($filename, '..') !== false || strpos($filename, '/') !== false || strpos($filename, '\\') !== false) return false;
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed_extensions) || in_array($ext, $dangerous)) return false;
    return preg_replace("/[^A-Z0-9._-]/i", "_", $filename);
}

// Utility: Send Emails
function notifyUser($email, $username, $subject, $messageBody) {
    if(empty($email)) return;
    $headers = "From: " . MAIL_FROM . "\r\n";
    @mail($email, $subject, $messageBody, $headers);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    // ==========================================
    // ACTION: UPLOAD
    // ==========================================
    if ($action === 'upload' && isset($_FILES['archiveFile'])) {
        $file = $_FILES['archiveFile'];
        $overwrite = isset($_POST['overwrite']) && $_POST['overwrite'] === 'yes';
        
        if ($file['error'] !== UPLOAD_ERR_OK) redirect("Upload failed with error code: " . $file['error'], 'error');

        $maxSize = 500 * 1024 * 1024;
        if ($file['size'] > $maxSize) redirect("File is too large. Maximum size is 500MB.", 'error');

        $fileName = basename($file['name']);
        $safeFileName = sanitizeAndCheck($fileName, $allowed_extensions, $dangerous);
        
        if ($safeFileName === false) redirect("Invalid file type or name format.", 'error');

        if (function_exists('mime_content_type')) {
            $mime = @mime_content_type($file['tmp_name']);
            if ($mime && (strpos($mime, 'php') !== false || strpos($mime, 'executable') !== false)) {
                 redirect("Security violation: File content is forbidden.", 'error');
            }
        }

        $targetPath = $ARCHIVES_DIR . '/' . $safeFileName;
        
        global $pdo;
        $displayName = !empty($_POST['display_name']) ? trim($_POST['display_name']) : $safeFileName;
        $desc = !empty($_POST['description']) ? trim($_POST['description']) : '';
        $uploaderId = $_SESSION['user_id'];
        
        $stmt_check = $pdo->prepare("SELECT id FROM files_metadata WHERE physical_name = ?");
        $stmt_check->execute([$safeFileName]);
        $exists_in_db = $stmt_check->fetch();

        if (file_exists($targetPath) && !$overwrite) {
            $ext = pathinfo($safeFileName, PATHINFO_EXTENSION);
            $nameWithoutExt = pathinfo($safeFileName, PATHINFO_FILENAME);
            $safeFileName = $nameWithoutExt . '_' . time() . '.' . $ext;
            $targetPath = $ARCHIVES_DIR . '/' . $safeFileName;
            $displayName = $safeFileName; // fallback
            $exists_in_db = false;
        }

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            if ($exists_in_db && $overwrite) {
                $stmt = $pdo->prepare("UPDATE files_metadata SET display_name = ?, description = ?, uploaded_by = ? WHERE physical_name = ?");
                $stmt->execute([$displayName, $desc, $uploaderId, $safeFileName]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO files_metadata (physical_name, display_name, description, uploaded_by) VALUES (?, ?, ?, ?)");
                $stmt->execute([$safeFileName, $displayName, $desc, $uploaderId]);
            }
            redirect("File '{$safeFileName}' successfully uploaded.", 'success');
        } else {
             redirect("An error occurred. Check folder permissions.", 'error');
        }

    // ==========================================
    // ACTION: DELETE FILE (DB Integrated)
    // ==========================================
    } elseif ($action === 'delete_file' && isset($_POST['file_id'])) {
        global $pdo;
        $fileId = $_POST['file_id'];
        
        $stmt = $pdo->prepare("SELECT physical_name FROM files_metadata WHERE id = ?");
        $stmt->execute([$fileId]);
        $fileMeta = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($fileMeta) {
            $filename = basename($fileMeta['physical_name']);
            if (strpos($filename, '..') !== false || strpos($filename, '/') !== false) redirect("Security violation: Traversal attempt.", 'error');
            
            $targetPath = $ARCHIVES_DIR . '/' . $filename;
            
            $pdo->prepare("DELETE FROM files_metadata WHERE id = ?")->execute([$fileId]);
            
            if (file_exists($targetPath) && is_file($targetPath)) {
                if (unlink($targetPath)) redirect("File '{$filename}' was deleted.", 'success');
                else redirect("DB entry removed, but could not delete '{$filename}' physically.", 'error');
            } else redirect("File deleted from registry.", 'success');
        } else redirect("File registry not found.", 'error');

    // ==========================================
    // ACTION: EDIT META (Replaces rename physical)
    // ==========================================
    } elseif ($action === 'edit_meta' && isset($_POST['file_id']) && isset($_POST['display_name'])) {
        global $pdo;
        $fileId = $_POST['file_id'];
        $newName = trim($_POST['display_name']);
        $newDesc = trim($_POST['description'] ?? '');

        if(empty($newName)) redirect("Display name cannot be empty.", "error");

        $stmt = $pdo->prepare("UPDATE files_metadata SET display_name = ?, description = ? WHERE id = ?");
        if ($stmt->execute([$newName, $newDesc, $fileId])) redirect("File details updated successfully.", 'success');
        else redirect("Failed to update file metadata.", 'error');

    // ==========================================
    // ACTION: CHANGE PASSWORD
    // ==========================================
    } elseif ($action === 'change_password' && isset($_POST['current_password'])) {
        $user_id = $_SESSION['user_id'];
        $current = $_POST['current_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        $confirm = $_POST['confirm_password'] ?? '';

        if (empty($current) || empty($new) || empty($confirm)) redirect("All password fields are required.", 'error');
        elseif ($new !== $confirm) redirect("New passwords do not match.", 'error');
        elseif (strlen($new) < 6) redirect("New password must be at least 6 characters.", 'error');

        global $pdo;
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($current, $user['password_hash'])) {
            $new_hash = password_hash($new, PASSWORD_DEFAULT);
            $update = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            if ($update->execute([$new_hash, $user_id])) redirect("Password successfully updated!", 'success');
            else redirect("Database error. Could not update password.", 'error');
        } else {
            redirect("Incorrect current password.", 'error');
        }

    // ==========================================
    // ACTION: SUPERADMIN - APPROVE USER (NEW)
    // ==========================================
    } elseif ($action === 'admin_approve_user' && isset($_POST['user_id'])) {
        if (!isset($_SESSION['is_superadmin']) || $_SESSION['is_superadmin'] != 1) redirect("Access Denied.", 'error');
        
        global $pdo;
        $uid = $_POST['user_id'];
        
        $stmt = $pdo->prepare("SELECT username, email, is_approved FROM users WHERE id = ?");
        $stmt->execute([$uid]);
        $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($targetUser && $targetUser['is_approved'] == 0) {
            $update = $pdo->prepare("UPDATE users SET is_approved = 1 WHERE id = ?");
            if ($update->execute([$uid])) {
                // Email the user
                $subject = "Your 5ELABS Account is Approved!";
                $message = "Hello {$targetUser['username']},\n\nGood news! The superadmin has approved your account.\nYou can now log in to the admin panel using the link below:\n\n" . SITE_URL . "/admin.php";
                notifyUser($targetUser['email'], $targetUser['username'], $subject, $message);
                redirect("User approved and notified.", 'success');
            } else redirect("Database error.", 'error');
        } else redirect("User already approved or does not exist.", 'error');

    // ==========================================
    // ACTION: SUPERADMIN - TOGGLE VERIFY
    // ==========================================
    } elseif ($action === 'admin_toggle_verify' && isset($_POST['user_id'])) {
        if (!isset($_SESSION['is_superadmin']) || $_SESSION['is_superadmin'] != 1) redirect("Access Denied.", 'error');
        
        global $pdo;
        $uid = $_POST['user_id'];
        $stmt = $pdo->prepare("UPDATE users SET is_verified = CASE WHEN is_verified = 1 THEN 0 ELSE 1 END WHERE id = ?");
        if ($stmt->execute([$uid])) redirect("User verification status updated.", 'success');
        else redirect("Database error.", 'error');

    // ==========================================
    // ACTION: SUPERADMIN - DELETE/REJECT USER
    // ==========================================
    } elseif ($action === 'admin_delete_user' && isset($_POST['user_id'])) {
        if (!isset($_SESSION['is_superadmin']) || $_SESSION['is_superadmin'] != 1) redirect("Access Denied.", 'error');
        
        global $pdo;
        $uid = $_POST['user_id'];
        if ($uid == $_SESSION['user_id']) redirect("You cannot delete yourself.", 'error');
        
        // Fetch info for email rejection notice if they were pending
        $stmtInfo = $pdo->prepare("SELECT username, email, is_approved FROM users WHERE id = ?");
        $stmtInfo->execute([$uid]);
        $targetUser = $stmtInfo->fetch(PDO::FETCH_ASSOC);

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        if ($stmt->execute([$uid])) {
            // Send Rejection Email if they were pending
            if($targetUser && $targetUser['is_approved'] == 0) {
                $subject = "Your 5ELABS Account Request";
                $message = "Hello {$targetUser['username']},\n\nWe are writing to inform you that your request for an account on the 5ELABS platform has been declined.\n\nThank you for your interest.";
                notifyUser($targetUser['email'], $targetUser['username'], $subject, $message);
                redirect("User request rejected and account deleted.", 'success');
            } else {
                redirect("User account deleted permanently.", 'success');
            }
        } else redirect("Database error.", 'error');

    // ==========================================
    // ACTION: SUPERADMIN - RESET PASSWORD
    // ==========================================
    } elseif ($action === 'admin_reset_password' && isset($_POST['user_id']) && isset($_POST['new_password'])) {
        if (!isset($_SESSION['is_superadmin']) || $_SESSION['is_superadmin'] != 1) redirect("Access Denied.", 'error');
        
        $uid = $_POST['user_id'];
        $new = $_POST['new_password'];
        if (strlen($new) < 6) redirect("New password must be at least 6 characters.", 'error');
        
        global $pdo;
        $new_hash = password_hash($new, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        if ($stmt->execute([$new_hash, $uid])) redirect("User password reset successfully.", 'success');
        else redirect("Database error.", 'error');

    // ==========================================
    // ACTION: CHANGE EMAIL (Relink)
    // ==========================================
    } elseif ($action === 'change_email' && isset($_POST['new_email'])) {
        $user_id = $_SESSION['user_id'];
        $password = $_POST['current_password_email'] ?? '';
        $newEmail = trim($_POST['new_email'] ?? '');

        if (empty($password)) redirect("Please enter your current password to change your email.", 'error');
        if (empty($newEmail) || !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) redirect("Please enter a valid email address.", 'error');

        global $pdo;

        // Verify current password
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            redirect("Incorrect password. Email was not changed.", 'error');
        }

        // Check if this email is already used by another account
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$newEmail, $user_id]);
        if ($stmt->fetch()) {
            redirect("This email address is already linked to another account.", 'error');
        }

        // Generate verification token and save pending email
        $token = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare("UPDATE users SET pending_email = ?, email_change_token = ? WHERE id = ?");
        $stmt->execute([$newEmail, $token, $user_id]);

        // Send verification email to the NEW address
        $verifyLink = SITE_URL . "/verify_email_change.php?token=" . $token;
        $subject = "5ELABS — Confirm Your New Email Address";
        $message = "Hello,\n\nYou requested to change your email address on 5ELABS.\n\nPlease click the link below to confirm this new email:\n\n" . $verifyLink . "\n\nIf you did not request this change, you can safely ignore this email.\n\nThank you.";
        $headers = "From: " . MAIL_FROM . "\r\n";
        @mail($newEmail, $subject, $message, $headers);

        redirect("A verification link has been sent to " . htmlspecialchars($newEmail) . ". Please check your inbox and click the link to confirm the change.", 'success');

    // ==========================================
    // ACTION: CANCEL PENDING EMAIL CHANGE
    // ==========================================
    } elseif ($action === 'cancel_pending_email') {
        global $pdo;
        $user_id = $_SESSION['user_id'];
        $stmt = $pdo->prepare("UPDATE users SET pending_email = NULL, email_change_token = NULL WHERE id = ?");
        if ($stmt->execute([$user_id])) redirect("Pending email change has been cancelled.", 'success');
        else redirect("Database error.", 'error');

    } else {
        redirect("Invalid action requested.", 'error');
    }
} else {
    redirect("Bad query.", 'error');
}
