# Security Protocol: PHP File Manager

This document details the security measures implemented on the custom PHP file manager (CRUD operations) for the 5ELABS project to prevent server compromise. 

## 1. Centralized Action Handler
All write/delete operations run through `action_handler.php`. Direct interaction with the `archives/` folder is denied. The handler strictly checks for a valid authenticated `$_SESSION['admin_logged_in'] === true` before running any action branch (`upload`, `delete`, `rename`).

## 2. Server-Side Execution Prevention (Crucial)
Inside the `archives/` folder where files are stored, we have deployed an `.htaccess` file with strict logic:
```apache
<FilesMatch "\.(php|php3|php4|php5|phtml|pl|cgi|py|sh|exe)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```
Even if a user manages to push or rename a `malware.php` payload, the Apache server is instructed to completely deny execution of it. 

## 3. Strict Extension Whitelisting (Upload & Rename)
We rely on a tight whitelist. We block *everything* unless it belongs to our specific array of safe document, media, and archive extensions. 
**Rename Security:** The `rename` functionality strips the proposed new name and tests the extension against the exact same strict whitelist to ensure an attacker cannot upload a safe `malware.zip` and then use the rename tool to change it to `malware.php`.

## 4. Name Sanitization & Traversal Prevention
Every filename passed to the server (whether during upload, delete, or rename) is stripped.
```php
if (strpos($filename, '..') !== false || strpos($filename, '/') !== false) // Hard block Directory Traversal
preg_replace("/[^A-Z0-9._-]/i", "_", $filename) // Regex alphanumeric stripping
```
This forces all operations to remain exclusively inside the `archives/` sandbox, preventing an attacker from passing `../../index.html` to the Delete function.

## 5. Overwrite Protection vs Validation
Uploads now feature an explicit Overwrite toggle. If an attacker tries to spam identical files, the script handles it gracefully. If a file shares a name with an existing archive and `overwrite` is false, the script appends the UNIX timestamp, guaranteeing 100% collision prevention. 

## 6. Directory Browsing Disabled
The `.htaccess` disables `-Indexes`. If a user goes directly to `yourwebsite.com/archives/`, they will face a generic 403 Forbidden page rather than an apache index of all uploaded files.

## 7. MIME Type Content Inspection
If `fileinfo` is active on the server, the script physically checks the headers of the uploaded file to ensure it's not a disguised PHP file.
