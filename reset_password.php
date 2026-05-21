<?php
require_once 'config.php';
require_once 'db.php';

$error = '';
$success = '';
$validToken = false;
$userId = null;

if (isset($_GET['token'])) {
    $token = $_GET['token'];
    
    // Check if token exists and hasn't expired
    $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?");
    $stmt->execute([$token, time()]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $validToken = true;
        $userId = $user['id'];
    } else {
        $error = "This password reset link is invalid or has expired. Please request a new one.";
    }
} else {
    $error = "No reset token provided.";
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $validToken) {
    $new = $_POST['new_password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';

    if (empty($new) || empty($confirm)) {
        $error = "Both password fields are required.";
    } elseif ($new !== $confirm) {
        $error = "The new passwords do not match.";
    } elseif (strlen($new) < 6) {
        $error = "Your new password must be at least 6 characters long.";
    } else {
        // Securely hash the new password, then clear the token payload so it cannot be reused
        $new_hash = password_hash($new, PASSWORD_DEFAULT);
        $update = $pdo->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
        
        if ($update->execute([$new_hash, $userId])) {
            $success = "Your password has been successfully reset! You can now log in securely.";
            $validToken = false; // hiding the form
        } else {
            $error = "A database error occurred. Your password could not be reset.";
        }
    }
}
?>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Create New Password | 5ELABS</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    <style>body { font-family: 'Public Sans', sans-serif; }</style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">

<div class="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
    
    <div class="text-center mb-6">
        <h1 class="text-2xl font-bold">Secure Password Reset</h1>
    </div>
    
    <?php if (!empty($error)): ?>
        <div class="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <?php if (!empty($success)): ?>
        <div class="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm border border-green-200 shadow-sm leading-relaxed text-center">
            <?php echo htmlspecialchars($success); ?>
        </div>
        <a href="admin.php" class="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors shadow-sm">Proceed to Login</a>
    <?php elseif ($validToken): ?>
        <form method="POST" action="" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" name="new_password" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" name="confirm_password" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors mt-2 shadow-sm">Save New Password</button>
        </form>
    <?php elseif (!$validToken && empty($success)): ?>
        <!-- Invalid token state -->
        <a href="forgot_password.php" class="block text-center w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded transition-colors shadow-sm mt-4">Request New Reset Link</a>
        <div class="mt-4 text-center text-sm">
            <a href="admin.php" class="text-gray-500 hover:text-gray-800">Cancel and Return to Login</a>
        </div>
    <?php endif; ?>
    
</div>
</body>
</html>
