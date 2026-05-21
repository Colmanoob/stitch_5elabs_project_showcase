<?php
// ==========================================
// CENTRAL CONFIGURATION
// ==========================================

// 1. Domain Configuration
// Used for generating the absolute verification link sent in the email.
// Example: 'https://www.5elabs.net' (Do not include a trailing slash)
define('SITE_URL', 'https://www.5elabs.net');

// 2. Email Configuration
// The address the automated verification emails will appear to come from.
define('MAIL_FROM', 'no-reply@5elabs.net');

// The superadmin's email address to receive approval requests.
define('BOSS_EMAIL', 'samuel.dallas1395@altmail.kr');

// 3. Google reCAPTCHA v2 (Checkbox) API Keys
// To get these keys, go to: https://www.google.com/recaptcha/admin/create
// Choose "reCAPTCHA v2" and then "I am not a robot Checkbox"
define('RECAPTCHA_SITE_KEY', '6Le3Gq8sAAAAAO5Y9yH2dhmmomAamPB_5k0ya4dw');
define('RECAPTCHA_SECRET_KEY', '6Le3Gq8sAAAAAMnCGzktiOoah039mVg96W7mlEDt');

// Utility function to verify Captcha securely on the server
function verifyCaptcha($responseToken)
{
    if (empty($responseToken))
        return false;
    $verifyResponse = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' . RECAPTCHA_SECRET_KEY . '&response=' . $responseToken);
    $responseData = json_decode($verifyResponse);
    return $responseData->success;
}
?>