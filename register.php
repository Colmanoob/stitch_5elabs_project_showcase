<?php
session_start();
require_once 'config.php';
require_once 'db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm'] ?? '';
    $captchaResponse = $_POST['g-recaptcha-response'] ?? '';

    if (empty($username) || empty($password) || empty($email)) {
        $error = "Please fill in all required fields.";
    } elseif ($password !== $confirm) {
        $error = "Passwords do not match.";
    } elseif (strlen($password) < 6) {
        $error = "Password must be at least 6 characters long.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please provide a valid email address.";
    } elseif (!verifyCaptcha($captchaResponse)) {
        $error = "Captcha verification failed. Please try again.";
    } else {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            $error = "Username is already taken.";
        } else {
            // Check if email exists
            $stmtEmail = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmtEmail->execute([$email]);
            if ($stmtEmail->fetch()) {
                $error = "An account with this email already exists.";
            } else {
                // Securely Hash the password & Generate token
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $token = bin2hex(random_bytes(32));
                
                $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, email, is_verified, verification_token) VALUES (?, ?, ?, 0, ?)");
                try {
                    $stmt->execute([$username, $hash, $email, $token]);
                    
                    // Send Email
                    $verifyLink = rtrim(SITE_URL, '/') . '/verify.php?token=' . $token;
                    $subject = "Verify your 5ELABS Account";
                    $message = "Hello $username,\n\nThanks for registering. Please click the link below to verify your email address:\n\n$verifyLink\n\nIf you did not request this, please ignore this email.";
                    $headers = "From: " . MAIL_FROM . "\r\n";
                    
                    @mail($email, $subject, $message, $headers);
                    
                    $success = "Account created! We have sent a verification link to your email. Please check your inbox (and spam folder) to activate your account before logging in.";
                } catch (Exception $e) {
                    $error = "An error occurred during registration. Please try again later.";
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Register | 5ELABS</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    <style>body { font-family: 'Public Sans', sans-serif; }</style>
    <!-- reCAPTCHA API -->
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">

<div class="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
    <div class="text-center mb-6">
        <h1 class="text-2xl font-bold">Create Account</h1>
        <p class="text-sm text-gray-500 mt-1">Register for admin access</p>
    </div>
    
    <?php if (!empty($error)): ?>
        <div class="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <?php if (!empty($success)): ?>
        <div class="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm border border-green-200 shadow-sm leading-relaxed text-center">
            <?php echo htmlspecialchars($success); ?>
        </div>
        <a href="admin.php" class="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors shadow">Go to Log In</a>
    <?php else: ?>
        <form method="POST" action="" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" name="username" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" name="password" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" name="confirm" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            
            <!-- Google reCAPTCHA Widget -->
            <div class="pt-2 flex justify-center">
                <div class="g-recaptcha" data-sitekey="<?php echo htmlspecialchars(RECAPTCHA_SITE_KEY); ?>"></div>
            </div>
            <p class="text-xs text-center text-gray-400">If captcha does not load, you must add site keys in config.php</p>
            
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors mt-2 shadow-sm">Sign Up</button>
        </form>
    <?php endif; ?>
    
    <div class="mt-6 text-center text-sm">
        <a href="admin.php" class="text-blue-600 hover:underline">Already have an account? Log in</a>
    </div>
</div>
</body>
</html>
