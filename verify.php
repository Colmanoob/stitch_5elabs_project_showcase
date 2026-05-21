<?php
require_once 'config.php';
require_once 'db.php';

$msg = '';
$msgType = '';

if (isset($_GET['token'])) {
    $token = $_GET['token'];
    
    // Find user with this token
    $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE verification_token = ? AND is_verified = 0");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Mark as verified
        $update = $pdo->prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?");
        $update->execute([$user['id']]);
        
        // --- NEW: Notify Boss ---
        $subject = "New User Pending Approval: " . $user['username'];
        $message = "Hello Superadmin,\n\nA new user has verified their email and is waiting for your approval to access the system.\n\nUsername: " . $user['username'] . "\nEmail: " . $user['email'] . "\n\nPlease log in to the admin panel to approve or reject them.\n\n" . SITE_URL . "/admin.php";
        $headers = "From: " . MAIL_FROM . "\r\n";
        @mail(BOSS_EMAIL, $subject, $message, $headers);
        // ------------------------

        $msg = "Your email has been successfully verified! However, your account requires Superadmin approval before you can log in. You will receive an email once a decision is made.";
        $msgType = "success";
    } else {
        $msg = "Invalid or expired verification token. You may have already verified your account.";
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
    <title>Email Verification | 5ELABS</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    <style>body { font-family: 'Public Sans', sans-serif; }</style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">
<div class="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
    
    <div class="mb-6 flex justify-center">
        <?php if ($msgType === 'success'): ?>
            <div class="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
        <?php else: ?>
            <div class="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
        <?php endif; ?>
    </div>
    
    <h1 class="text-2xl font-bold mb-4">Account Verification</h1>
    
    <div class="mb-8 p-5 rounded-lg <?php echo $msgType === 'success' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-red-50 text-red-700 border border-red-200'; ?>">
        <?php echo htmlspecialchars($msg); ?>
    </div>

    <a href="admin.php" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded transition-colors shadow-sm">Go to Login</a>
</div>
</body>
</html>
