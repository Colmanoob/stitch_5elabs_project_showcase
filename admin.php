<?php
session_start();
require_once 'config.php';
require_once 'db.php';

$ARCHIVES_DIR = __DIR__ . '/archives';

// Process Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $captchaResponse = $_POST['g-recaptcha-response'] ?? '';
    
    if (!verifyCaptcha($captchaResponse)) {
        $error = "Captcha verification failed. Please check the 'I am not a robot' box.";
    } else {
        $stmt = $pdo->prepare("SELECT id, username, password_hash, is_verified, is_superadmin, is_approved FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            if ($user['is_verified'] == 0) {
                $error = "Your account is not verified. Please check your email for the verification link.";
            } elseif ($user['is_approved'] == 0) {
                $error = "Your account is pending Superadmin approval. You will receive an email once approved.";
            } else {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['is_superadmin'] = $user['is_superadmin'];
            }
        } else {
            $error = "Incorrect username or password.";
        }
    }
}

// Process Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin.php");
    exit;
}

// Status message helper
$msg = $_SESSION['msg'] ?? '';
$msgType = $_SESSION['msgType'] ?? '';
unset($_SESSION['msg'], $_SESSION['msgType']);

// Helper to format bytes
function formatSizeUnits($bytes) {
    if ($bytes >= 1073741824) { return number_format($bytes / 1073741824, 2) . ' GB'; }
    elseif ($bytes >= 1048576) { return number_format($bytes / 1048576, 2) . ' MB'; }
    elseif ($bytes >= 1024) { return number_format($bytes / 1024, 2) . ' KB'; }
    elseif ($bytes > 1) { return $bytes . ' bytes'; }
    elseif ($bytes == 1) { return $bytes . ' byte'; }
    return '0 bytes';
}

$files = [];
$allUsers = [];

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    // 1. Fetch archives from DB and verify physically
    $stmt = $pdo->query("SELECT id, physical_name, display_name, description, uploaded_at FROM files_metadata ORDER BY uploaded_at DESC");
    $db_files = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($db_files as $f) {
        $path = $ARCHIVES_DIR . '/' . $f['physical_name'];
        if (is_file($path)) {
            $files[] = [
                'id' => $f['id'],
                'display' => htmlspecialchars($f['display_name']),
                'physical' => htmlspecialchars($f['physical_name']),
                'size' => formatSizeUnits(filesize($path)),
                'desc' => htmlspecialchars($f['description'])
            ];
        }
    }
    
    // 2. Fetch Users if Superadmin
    if (isset($_SESSION['is_superadmin']) && $_SESSION['is_superadmin'] == 1) {
        $stmt = $pdo->query("SELECT id, username, email, is_verified, is_superadmin, is_approved, created_at FROM users ORDER BY created_at DESC");
        $allUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 3. Fetch current user's email for the Account Settings section
    $stmtMe = $pdo->prepare("SELECT email, pending_email FROM users WHERE id = ?");
    $stmtMe->execute([$_SESSION['user_id']]);
    $currentUser = $stmtMe->fetch(PDO::FETCH_ASSOC);
    $myEmail = $currentUser['email'] ?? '';
    $myPendingEmail = $currentUser['pending_email'] ?? '';
}
?>
<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Control Panel | 5ELABS</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    <style>body { font-family: 'Public Sans', sans-serif; }</style>
    <!-- reCAPTCHA API -->
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen flex flex-col items-center p-4 py-8">

<div class="max-w-5xl w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Control Panel</h1>
        <?php if (isset($_SESSION['username'])): ?>
            <div class="flex items-center gap-2">
                <?php if($_SESSION['is_superadmin'] == 1): ?>
                    <span class="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">Ultimate Admin</span>
                <?php endif; ?>
                <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                    Logged in as: <?php echo htmlspecialchars($_SESSION['username']); ?>
                </span>
            </div>
        <?php endif; ?>
    </div>
    
    <?php if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true): ?>
        <p class="text-center text-gray-500 mb-6">Please log in to access the control panel.</p>
        
        <?php if (!empty($error)): ?>
            <div class="max-w-sm mx-auto bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm border border-red-200">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>
        
        <form method="POST" action="" class="max-w-sm mx-auto space-y-4">
            <input type="hidden" name="login" value="1">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" name="username" class="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" name="password" class="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required>
            </div>
            
            <div class="pt-2 flex justify-center">
                <div class="g-recaptcha" data-sitekey="<?php echo htmlspecialchars(RECAPTCHA_SITE_KEY); ?>"></div>
            </div>
            
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow">Log In</button>
        </form>
        
        <div class="mt-8 text-center text-sm border-t border-gray-100 pt-6 space-y-2">
            <a href="forgot_password.php" class="text-gray-500 hover:text-gray-800 block">Forgot your password?</a>
            <a href="register.php" class="text-blue-600 hover:underline block">Don't have an account? Register here</a>
        </div>
    <?php else: ?>
        
        <?php if (!empty($msg)): ?>
            <div class="bg-<?php echo $msgType === 'error' ? 'red' : 'green'; ?>-50 text-<?php echo $msgType === 'error' ? 'red' : 'green'; ?>-700 p-4 rounded-lg mb-6 text-sm border border-<?php echo $msgType === 'error' ? 'red' : 'green'; ?>-200 shadow-sm">
                <?php echo htmlspecialchars($msg); ?>
            </div>
        <?php endif; ?>
        
        <!-- DASHBOARD GRID -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <!-- LEFT COLUMN (Upload & Account Settings) -->
            <div class="space-y-6">
                <!-- UPLOAD SECTION -->
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h2 class="font-bold mb-3 border-b border-gray-200 pb-2 text-gray-800">Upload New Archive</h2>
                    <form method="POST" action="action_handler.php" enctype="multipart/form-data" class="space-y-3">
                        <input type="hidden" name="action" value="upload">
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-white transition-colors bg-white cursor-pointer relative" onclick="document.getElementById('archiveFile').click()">
                            <input type="file" name="archiveFile" id="archiveFile" class="hidden" required>
                            <svg class="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            <span class="text-sm font-medium text-gray-600">Select file</span>
                            <div class="text-xs text-gray-400 mt-1 truncate px-2" id="fileName">No file chosen</div>
                        </div>
                        <div>
                            <input type="text" name="display_name" placeholder="Title (Optional)" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-1.5">
                        </div>
                        <div>
                            <textarea name="description" placeholder="Short description for visitors (Optional)" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-1.5" rows="2"></textarea>
                        </div>
                        <div class="flex items-start">
                            <input id="overwrite" name="overwrite" type="checkbox" value="yes" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5">
                            <label for="overwrite" class="ml-2 block text-xs text-gray-600">
                                Replace physical file if name match
                            </label>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors shadow-sm">Upload to Server</button>
                    </form>
                </div>

                <!-- PERSONAL ACCOUNT SETTINGS -->
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h2 class="font-bold mb-3 border-b border-gray-200 pb-2 text-gray-800">My Password</h2>
                    <form method="POST" action="action_handler.php" class="space-y-3">
                        <input type="hidden" name="action" value="change_password">
                        <div>
                            <input type="password" name="current_password" placeholder="Current Password" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-1.5" required>
                        </div>
                        <div>
                            <input type="password" name="new_password" placeholder="New Password" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-1.5" required>
                        </div>
                        <div>
                            <input type="password" name="confirm_password" placeholder="Confirm New" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-1.5" required>
                        </div>
                        <button type="submit" class="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium py-2 rounded transition-colors shadow-sm mt-1">Update Password</button>
                    </form>
                </div>

                <!-- CHANGE EMAIL SECTION -->
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h2 class="font-bold mb-3 border-b border-gray-200 pb-2 text-gray-800">My Email</h2>
                    
                    <!-- Current email display -->
                    <div class="mb-3 bg-white border border-gray-200 rounded-lg p-3">
                        <div class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Current Email</div>
                        <div class="text-sm font-semibold text-gray-800"><?php echo htmlspecialchars($myEmail ?: 'No email set'); ?></div>
                    </div>

                    <?php if (!empty($myPendingEmail)): ?>
                    <!-- Pending email change notice -->
                    <div class="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div class="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">⏳ Pending Change</div>
                        <div class="text-sm text-amber-800">
                            Awaiting verification for:<br>
                            <span class="font-semibold"><?php echo htmlspecialchars($myPendingEmail); ?></span>
                        </div>
                        <button onclick="cancelPendingEmail()" class="mt-2 text-xs text-red-600 hover:text-red-800 font-semibold underline underline-offset-2">Cancel pending change</button>
                    </div>
                    <?php endif; ?>

                    <form method="POST" action="action_handler.php" class="space-y-3">
                        <input type="hidden" name="action" value="change_email">
                        <div>
                            <input type="email" name="new_email" placeholder="New email address" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-1.5" required>
                        </div>
                        <div>
                            <input type="password" name="current_password_email" placeholder="Enter your password to confirm" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-1.5" required>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors shadow-sm">Send Verification to New Email</button>
                    </form>
                    <p class="text-[11px] text-gray-400 mt-2 leading-relaxed">A verification link will be sent to the new email. Your email won't change until you click the link.</p>
                </div>
            </div>

            <!-- RIGHT COLUMN (File List) -->
            <div class="md:col-span-2">
                <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="font-bold text-gray-800">Server Archives</h2>
                        <span class="text-xs font-medium text-gray-500 px-2 py-1 bg-white rounded border border-gray-200"><?php echo count($files); ?> Items</span>
                    </div>
                    
                    <div class="overflow-y-auto flex-grow" style="max-height: 550px;">
                        <?php if (empty($files)): ?>
                            <div class="text-center py-12 text-gray-400">No archives uploaded.</div>
                        <?php else: ?>
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-white sticky top-0 shadow-sm z-10">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100">Name</th>
                                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100 w-24">Size</th>
                                        <th class="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100 w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-100">
                                    <?php foreach($files as $file): ?>
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="px-4 py-3 text-sm font-medium text-gray-800 max-w-xs truncate" title="<?php echo $file['display']; ?>">
                                            <?php echo $file['display']; ?>
                                            <div class="text-xs text-gray-400 font-normal truncate" title="<?php echo $file['desc']; ?>">
                                                <?php echo empty($file['desc']) ? 'No description provided.' : $file['desc']; ?>
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            <?php echo $file['size']; ?>
                                        </td>
                                        <td class="px-4 py-3 text-right text-xs font-medium whitespace-nowrap">
                                            <button onclick="editFileDetails(<?php echo $file['id']; ?>, '<?php echo addslashes($file['display']); ?>', '<?php echo addslashes($file['desc']); ?>')" class="text-blue-600 hover:text-blue-800 mr-3" title="Edit Meta">
                                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </button>
                                            <button onclick="deleteFile(<?php echo $file['id']; ?>, '<?php echo addslashes($file['physical']); ?>')" class="text-red-500 hover:text-red-700" title="Delete">
                                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- ULTIMATE ADMIN: USER MANAGEMENT TAB -->
        <?php if($_SESSION['is_superadmin'] == 1): ?>
        <div class="mt-8 border-t border-purple-200 pt-8 w-full">
            <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-purple-100 rounded-lg text-purple-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-800">Superadmin: Manage Users</h2>
            </div>
            
            <div class="bg-white border border-purple-200 rounded-xl shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                         <thead class="bg-purple-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Username</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Email</th>
                                <th class="px-6 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-right text-xs font-semibold text-purple-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                            <?php foreach($allUsers as $u): ?>
                            <tr class="hover:bg-purple-50/50 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900 flex items-center gap-2">
                                        <?php echo htmlspecialchars($u['username']); ?>
                                        <?php if($u['is_superadmin']): ?>
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">Supreme</span>
                                        <?php endif; ?>
                                    </div>
                                    <div class="text-xs text-gray-500">Joined: <?php echo date('M j, Y', strtotime($u['created_at'])); ?></div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <?php echo htmlspecialchars($u['email'] ?? 'No email'); ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center flex flex-col gap-1 items-center">
                                    <?php if($u['is_verified']): ?>
                                        <span class="px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full bg-green-100 text-green-800">Email Verified</span>
                                    <?php else: ?>
                                        <span class="px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Email Pending</span>
                                    <?php endif; ?>
                                    
                                    <?php if($u['is_approved']): ?>
                                        <span class="px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Superadmin Approved</span>
                                    <?php else: ?>
                                        <span class="px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Review Required</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <?php if($u['id'] != $_SESSION['user_id']): ?>
                                        <?php if(!$u['is_approved']): ?>
                                            <button onclick="adminApproveUser(<?php echo $u['id']; ?>)" class="text-green-600 hover:text-green-900 mr-2 font-semibold text-xs border border-green-200 bg-green-50 px-2 py-1 rounded">Approve</button>
                                        <?php endif; ?>
                                        <button onclick="adminResetPassword(<?php echo $u['id']; ?>, '<?php echo addslashes($u['username']); ?>')" class="text-blue-600 hover:text-blue-900 mr-3 font-semibold text-xs">Reset Pass</button>
                                        <button onclick="adminToggleVerify(<?php echo $u['id']; ?>)" class="text-gray-600 hover:text-gray-900 mr-3 font-semibold text-xs">Toggle Verify</button>
                                        <button onclick="adminDeleteUser(<?php echo $u['id']; ?>, '<?php echo addslashes($u['username']); ?>', <?php echo $u['is_approved'] ? 'false' : 'true'; ?>)" class="text-red-500 hover:text-red-700 font-semibold text-xs"><?php echo $u['is_approved'] ? 'Delete' : 'Reject'; ?></button>
                                    <?php else: ?>
                                        <span class="text-gray-400 text-xs italic">Current Session</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Superadmin Action Forms -->
        <form id="adminApproveForm" method="POST" action="action_handler.php" class="hidden">
            <input type="hidden" name="action" value="admin_approve_user">
            <input type="hidden" name="user_id" id="adminApproveId">
        </form>
        <form id="adminDeleteForm" method="POST" action="action_handler.php" class="hidden">
            <input type="hidden" name="action" value="admin_delete_user">
            <input type="hidden" name="user_id" id="adminDeleteId">
        </form>
        <form id="adminToggleForm" method="POST" action="action_handler.php" class="hidden">
            <input type="hidden" name="action" value="admin_toggle_verify">
            <input type="hidden" name="user_id" id="adminToggleId">
        </form>
        <form id="adminResetForm" method="POST" action="action_handler.php" class="hidden">
            <input type="hidden" name="action" value="admin_reset_password">
            <input type="hidden" name="user_id" id="adminResetId">
            <input type="hidden" name="new_password" id="adminResetPass">
        </form>
        <?php endif; ?>
        
        <div class="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-sm w-full">
            <a href="downloads.html" class="text-blue-600 hover:underline flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                View Public Site
            </a>
            <a href="admin.php?logout=1" class="text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors">Log Out</a>
        </div>
        
        <!-- File Action Forms -->
        <form id="deleteForm" method="POST" action="action_handler.php" class="hidden">
            <input type="hidden" name="action" value="delete_file">
            <input type="hidden" name="file_id" id="deleteFileId">
        </form>
        <form id="editMetaForm" method="POST" action="action_handler.php" class="hidden">
            <input type="hidden" name="action" value="edit_meta">
            <input type="hidden" name="file_id" id="editFileId">
            <input type="hidden" name="display_name" id="editDisplayName">
            <input type="hidden" name="description" id="editDesc">
        </form>
        <form id="cancelPendingEmailForm" method="POST" action="action_handler.php" class="hidden">
            <input type="hidden" name="action" value="cancel_pending_email">
        </form>

        <script>
            // File Handling Checkbox logic
            document.getElementById('archiveFile')?.addEventListener('change', function(e) {
                const name = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
                document.getElementById('fileName').textContent = name;
            });

            function deleteFile(fileId, physicalName) {
                if (confirm('Are you sure you want to completely delete "' + physicalName + '"? This cannot be undone.')) {
                    document.getElementById('deleteFileId').value = fileId;
                    document.getElementById('deleteForm').submit();
                }
            }
            function editFileDetails(fileId, oldTitle, oldDesc) {
                const newTitle = prompt('Enter a new display title:', oldTitle);
                if (newTitle !== null) {
                    const newDesc = prompt('Enter a new description:', oldDesc);
                    if(newDesc !== null) {
                        document.getElementById('editFileId').value = fileId;
                        document.getElementById('editDisplayName').value = newTitle.trim();
                        document.getElementById('editDesc').value = newDesc.trim();
                        document.getElementById('editMetaForm').submit();
                    }
                }
            }
            
            // Superadmin Logic
            function adminApproveUser(id) {
                if(confirm('Are you sure you want to approve this user? They will be emailed immediately.')) {
                    document.getElementById('adminApproveId').value = id;
                    document.getElementById('adminApproveForm').submit();
                }
            }
            function adminDeleteUser(id, username, isRejecting) {
                const actionWord = isRejecting ? "REJECT" : "delete";
                if(confirm('WARNING: Are you sure you want to ' + actionWord + ' user "' + username + '"?')) {
                    document.getElementById('adminDeleteId').value = id;
                    document.getElementById('adminDeleteForm').submit();
                }
            }
            function adminToggleVerify(id) {
                document.getElementById('adminToggleId').value = id;
                document.getElementById('adminToggleForm').submit();
            }
            function adminResetPassword(id, username) {
                const newPass = prompt("Enter a new password for '" + username + "' (minimum 6 characters):");
                if (newPass !== null && newPass.length >= 6) {
                    if (confirm("Are you sure you want to overwrite their password? They will be logged out of current sessions.")) {
                        document.getElementById('adminResetId').value = id;
                        document.getElementById('adminResetPass').value = newPass;
                        document.getElementById('adminResetForm').submit();
                    }
                } else if(newPass !== null) {
                    alert("Password must be at least 6 characters.");
                }
            }
            function cancelPendingEmail() {
                if(confirm('Cancel the pending email change?')) {
                    document.getElementById('cancelPendingEmailForm').submit();
                }
            }
        </script>
    <?php endif; ?>
</div>
</body>
</html>