# FTP Auto-Sync Guide for 5elabs.net

## Recommended Tools

### Option A: WinSCP (Windows - Free, Recommended)

#### Setup Steps:

1. **Download WinSCP**: https://winscp.net/eng/download.php

2. **Connect to your hosting**:
   - Host: `5elabs.net` or your hosting provider's FTP address
   - Username: (from your hosting control panel)
   - Password: (from your hosting control panel)
   - Port: 21 (or 22 for SFTP)

3. **Enable Auto-Upload on Save**:
   - Go to **Options** → **Preferences**
   - Navigate to **Transfer** → **Background**
   - Check **"Queue transfer for files opened in external editor"**
   - Go to **Options** → **Preferences** → **Integration**
   - Check **"Use WinSCP as external editor in Windows"**

4. **Synchronize Folders**:
   - Navigate to your local `public_html` folder on the left panel
   - Navigate to the remote `public_html` folder on the right panel
   - Click **Commands** → **Keep remote directory up to date**
   - This will watch your local folder and auto-upload any changes

   **Keyboard shortcut**: `Ctrl + Shift + U`

### Option B: FileZilla (Cross-Platform - Free)

#### Setup Steps:

1. **Download FileZilla**: https://filezilla-project.org/

2. **Connect to your hosting**:
   - Host: `5elabs.net` or FTP address
   - Username & Password from hosting panel
   - Port: 21

3. **Enable Synchronized Browsing**:
   - Navigate to both local and remote `public_html/` folders
   - Go to **Server** → **Synchronized browsing** → **On**
   - Now when you navigate locally, it mirrors remotely

4. **Auto-Upload on Save**:
   - FileZilla doesn't have built-in file watching
   - Use **File** → **Manual transfer** or drag-and-drop

### Option C: VS Code with SFTP Extension (Developer-Friendly)

#### Setup Steps:

1. **Install VS Code**: https://code.visualstudio.com/

2. **Install SFTP Extension**:
   - Open VS Code
   - Go to Extensions (`Ctrl + Shift + X`)
   - Search for **"SFTP"** by Natizyskuk (or the original by Natizyskuk)
   - Install it

3. **Configure SFTP**:
   - Open your project folder in VS Code
   - Press `Ctrl + Shift + P`
   - Type `SFTP: Config`
   - Edit the configuration:

   ```json
   {
       "name": "5ELABS",
       "host": "your-ftp-host.com",
       "protocol": "ftp",
       "port": 21,
       "username": "your-username",
       "password": "your-password",
       "remotePath": "/public_html/",
       "uploadOnSave": true,
       "useTempFile": false,
       "openSsh": false,
       "watcher": {
           "files": "**/*.{html,css,js}",
           "autoUpload": true
       }
   }
   ```

4. **Enable Auto-Upload**:
   - Right-click in the explorer
   - Select **"SFTP: Upload on Save"** (toggle on)
   - Now every time you save a file, it auto-uploads!

## Connection Details (You Need From Your Host)

- **FTP/SFTP Host**: Usually `ftp.5elabs.net` or your domain
- **Username**: Found in hosting control panel (cPanel, Plesk, etc.)
- **Password**: You set this in hosting
- **Port**: 21 (FTP) or 22 (SFTP/SSH)

## Where to Find FTP Credentials:

- **cPanel**: Look for "FTP Accounts"
- **Plesk**: Look for "FTP Access"  
- **SiteGround**: My Account → Security → FTP Accounts
- **Bluehost**: FTP Management in control panel
- **HostGator**: FTP Accounts in cPanel

## Upload Checklist for First Time:

1. [ ] Connect to your hosting via FTP
2. [ ] Navigate to `public_html/` on remote side
3. [ ] Create `wordpress-backup/` folder
4. [ ] Move all WordPress files into backup folder
5. [ ] Upload all files from local `public_html/` to remote `public_html/`:
   - `index.html`
   - `atomic-city/` folder
   - `cardium/` folder
   - `math-city/` folder
   - `math-city-2/` folder
   - `ethical-land/` folder

## After Initial Upload:

- Every time you edit and save a file locally, it will auto-upload
- Refresh 5elabs.net to see changes immediately
- Test all internal links to make sure they work

## Security Tips:

- Use **SFTP** (port 22) instead of FTP if your host supports it
- Don't share FTP credentials publicly
- Change FTP password periodically
- Consider using SSH keys instead of passwords for SFTP