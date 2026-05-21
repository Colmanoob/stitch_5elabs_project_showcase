<?php
session_start();
require_once 'config.php';
require_once 'db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $captchaResponse = $_POST['g-recaptcha-response'] ?? '';

    if (empty($email)) {
        $error = "Please enter your email address.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please provide a valid email address.";
    } elseif (!verifyCaptcha($captchaResponse)) {
        $error = "Captcha verification failed. Please try again.";
    } else {
        // Query to check if email exists in database
        $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // ALWAYS pretend it was successful to prevent malicious actors from checking which emails are registered
        if ($user) {
            // Generate token and expiry (15 mins)
            $token = bin2hex(random_bytes(32));
            $expiry = time() + (15 * 60);

            $update = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
            if ($update->execute([$token, $expiry, $user['id']])) {
                $resetLink = rtrim(SITE_URL, '/') . '/reset_password.php?token=' . $token;
                
                $subject = "Password Reset Request";
                $message = "Hello {$user['username']},\n\nWe received a request to reset the password for your 5ELABS account.\n\nYou can reset your password by clicking the link below. This link will expire in 15 minutes.\n\n$resetLink\n\nIf you did not request a password reset, please ignore this email.";
                $headers = "From: " . MAIL_FROM . "\r\n";
                
                @mail($email, $subject, $message, $headers);
            }
        }
        $success = "If your email is registered, you will receive a password reset link shortly.";
    }
}
?>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Forgot Password | 5ELABS</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    <style>body { font-family: 'Public Sans', sans-serif; }</style>
    <!-- reCAPTCHA API -->
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">

<div class="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
    <div class="text-center mb-6">
        <h1 class="text-2xl font-bold">Reset Password</h1>
        <p class="text-sm text-gray-500 mt-1">Enter your account email to receive a secure link.</p>
    </div>
    
    <?php if (!empty($error)): ?>
        <div class="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <?php if (!empty($success)): ?>
        <div class="bg-indigo-50 text-indigo-700 p-4 rounded mb-6 text-sm border border-indigo-200 shadow-sm leading-relaxed text-center">
            <?php echo htmlspecialchars($success); ?>
        </div>
        <a href="admin.php" class="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors shadow-sm">Return to Login</a>
    <?php else: ?>
        <form method="POST" action="" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" class="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            
            <div class="pt-2 flex justify-center">
                <div class="g-recaptcha" data-sitekey="<?php echo htmlspecialchars(RECAPTCHA_SITE_KEY); ?>"></div>
            </div>
            
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors mt-2 shadow-sm">Send Reset Email</button>
        </form>
        
        <div class="mt-6 text-center text-sm">
            <a href="admin.php" class="text-gray-500 hover:text-gray-800">Back to Login</a>
        </div>
    <?php endif; ?>
</div>
</body>
</html>
