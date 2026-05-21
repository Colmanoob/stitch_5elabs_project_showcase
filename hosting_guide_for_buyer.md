# Your Website Hosting & Management Guide

Welcome to your new website! Right now, the front-end (the design and layout) is completed, but as we add functionality—like allowing users to download larger project archives in the future—you'll need to know the basics of how your web hosting works.

This guide is written in plain English, without complicated tech jargon, to help you understand exactly how to set up your domain and keep the website running.

---

## 1. What You Need: Domain & Web Hosting

To have the website online and ready for future features (like archive downloads), you will need two things:
1. **A Domain Name:** The address people type in (e.g., `www.yourwebsite.com`).
2. **Web Hosting:** The server space that stores all your website's files, images, and future downloadable archives.

### Option A: Taking Over the Current Host
If you prefer, I can simply update the billing information and email address on the current hosting account to yours. From then on, you pay the annual renewal fee, and the site stays exactly where it is without any changes needed.

### Option B: Buying Your Own Hosting (Recommended)
If you want to set up your own account from scratch:
1. Go to a beginner-friendly hosting provider that includes an easy control panel (like **Hostinger**, **Namecheap**, or **SiteGround**).
2. Purchase a basic **"Shared Web Hosting"** plan. This gives you plenty of space for the website and the future archives users will be able to download.
3. During sign-up, you can register a new domain name or transfer an existing one.
4. Once you have an account, we can move the website files over to it.

---

## 2. Pushing the Website Live (The Easy Way)

When you are ready to upload the website files to your new host, follow these simple steps. You don't need any special software or technical skills:

1. Log into your new web hosting account.
2. Look for a button called **"File Manager"** (usually found in your "cPanel" or main dashboard).
3. Inside the File Manager, look for a folder named **`public_html`**. This is your public folder—anything you put in here is visible on the internet.
4. Click the **Upload** button.
5. Select all the files and folders I sent you (like `index.html` and the `atomic-city`, `cardium` folders).
6. Wait for the upload to finish. If you visit your domain name straight after, your website will be live!

---

## 3. Adding Downloadable Archives in the Future

Since the website will eventually allow users to download archives, here is how you will manage them when they are ready:

1. Go to your hosting **File Manager** and open the `public_html` folder.
2. Create a new folder there and call it something simple, like `downloads` or `archives`.
3. Click the **Upload** button and upload your `.zip` or `.pdf` archive files into this new folder.
4. Once uploaded, the direct link to the file will just be your domain name plus the folder and file name. For example:
   `www.yourwebsite.com/downloads/project1-archive.zip`
5. You can then provide this link to your users when the download feature is fully built!

---

## 4. Editing Website Text (If Needed)

If you ever need to change a piece of simple text on the site (like a headline or a project description) before larger management systems are added, you can do it yourself easily:

1. On your personal computer, right-click the file you want to edit (for example, `index.html` or `math-city/index.html`).
2. Select **Open With** -> **Notepad** (on Windows) or **TextEdit** (on Mac).
3. The file will look like a lot of code, but don't panic! Just slowly scroll through until you see the normal English sentence you want to change.
4. Carefully delete the old text and type your new text. *Important: Do not accidentally delete any of the `< >` brackets around the text!*
5. Save the file.
6. Go back to your hosting **File Manager**, and upload just that one file, replacing the old one. 

*Keep this document safe as a reference for whenever you need to manage your website setup or upload future archives.*
