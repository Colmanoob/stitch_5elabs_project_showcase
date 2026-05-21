<?php
require_once 'config.php';
require_once 'db.php';

$msg = '';
$msgType = '';

if (isset($_GET['token'])) {
    $token = $_GET['token'];

    // Find user with this email change token
    $stmt = $pdo->prepare("SELECT id, username, email, pending_email FROM users WHERE email_change_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && !empty($user['pending_email'])) {
        $oldEmail = $user['email'];
        $newEmail = $user['pending_email'];

        // Check again that the new email isn't taken by someone else
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $checkStmt->execute([$newEmail, $user['id']]);
        if ($checkStmt->fetch()) {
            $msg = "This email address has since been taken by another account. Please try a different email.";
            $msgType = "error";
        } else {
            // Swap the email
            $update = $pdo->prepare("UPDATE users SET email = ?, pending_email = NULL, email_change_token = NULL WHERE id = ?");
            $update->execute([$newEmail, $user['id']]);

            $msg = "Your email has been successfully updated to " . htmlspecialchars($newEmail) . ". You can now use this email for login recovery and notifications.";
            $msgType = "success";
        }
    } else {
        $msg = "Invalid or expired email change token. The link may have already been used.";
        $msgType = "error";
    }
} else {
    $msg = "No token provided.";
    $msgType = "error";
}
?>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Email Change Verification | 5ELABS</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    <style>body { font-family: 'Public Sans', sans-serif; }</style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">
<div class="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">

    <div class="mb-6 flex justify-center">
        <?php if ($msgType === 'success'): ?>
            <div class="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
        <?php else: ?>
            <div class="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
        <?php endif; ?>
    </div>

    <h1 class="text-2xl font-bold mb-4">Email Change Verification</h1>

    <div class="mb-8 p-5 rounded-lg <?php echo $msgType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'; ?>">
        <?php echo htmlspecialchars($msg); ?>
    </div>

    <a href="admin.php" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded transition-colors shadow-sm">Go to Control Panel</a>
</div>
</body>
</html>
