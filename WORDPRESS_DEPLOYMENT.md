# 5ELABS Website - WordPress Deployment Guide

## Overview

Your 5ELABS website is a **static HTML site** using Tailwind CSS (via CDN) with multiple interconnected pages. There are several ways to deploy this on WordPress, each with different complexity levels.

---

## Option 1: Static HTML Upload (Easiest - Recommended for Quick Setup)

### Steps:

1. **Upload HTML files directly to your WordPress hosting**
   - Use FTP/File Manager to upload the entire project to `public_html/` or your domain root
   - The HTML files will sit alongside (or outside) WordPress

2. **Access the site at:**
   - Main Hub: `yourdomain.com/5elabs_main_lab_hub/code.html`
   - Or rename the files to use clean URLs

### Pros:
- No code changes needed
- Works immediately
- No WordPress theme development required

### Cons:
- Not integrated into WordPress admin
- Can't use WordPress pages/posts

---

## Option 2: Convert to WordPress Theme (Recommended for Full Integration)

### Recommended File Structure:

```
wp-content/themes/5elabs-theme/
├── style.css                    # WordPress theme stylesheet
├── functions.php                # Theme functions, enqueue scripts
├── header.php                   # Common header (TopAppBar)
├── footer.php                   # Common footer
├── sidebar.php                  # Common sidebar
├── index.php                    # Main hub page
├── page-atomic-city.php         # Atomic City page template
├── page-cardium.php             # Cardium page template
├── page-math-city.php           # Math City page template
├── page-math-city-2.php         # Math City 2.0 page template
├── page-ethical-land.php        # Ethical Land page template
├── assets/
│   ├── css/
│   │   └── custom.css           # Tailwind CSS (compiled)
│   └── images/                   # Local images (download from Google URLs)
└── screenshot.png               # Theme preview
```

### Steps to Convert:

#### Step 1: Create Theme Folder Structure
Create a folder named `5elabs-theme` with the files above.

#### Step 2: Create `style.css`
```css
/*
Theme Name: 5ELABS Project Showcase
Theme URI: https://yourdomain.com
Author: 5ELABS
Author URI: https://yourdomain.com
Description: Custom theme for 5ELABS project showcase
Version: 1.0
*/
```

#### Step 3: Create `functions.php`
```php
<?php
function 5elabs_enqueue_scripts() {
    // Tailwind CSS CDN
    wp_enqueue_script('tailwind', 'https://cdn.tailwindcss.com?plugins=forms,container-queries', array(), null, true);
    
    // Google Fonts
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Public+Sans:wght@300;400;500;600&family=Inter:wght@300;400;500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap', array(), null);
    
    // Material Symbols
    wp_enqueue_style('material-symbols', 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap', array(), null);
}
add_action('wp_enqueue_scripts', '5elabs_enqueue_scripts');

// Support custom menus
function 5elabs_register_menus() {
    register_nav_menus(array(
        'primary' => __('Primary Menu', '5elabs'),
        'project-archive' => __('Project Archive Menu', '5elabs'),
    ));
}
add_action('after_setup_theme', '5elabs_register_menus');
?>
```

#### Step 4: Create `header.php`
Extract the common header from all pages:
```php
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="light">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php wp_title('|', true, 'right'); bloginfo('name'); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-background text-on-surface font-body'); ?>>

<header class="fixed top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
    <div class="flex justify-between items-center max-w-7xl mx-auto px-8 h-16">
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-blue-700 text-2xl">biotech</span>
            <a href="<?php echo home_url(); ?>" class="text-2xl font-extrabold tracking-tighter text-slate-900">5ELABS</a>
        </div>
        <nav class="hidden md:flex gap-8 items-center">
            <a href="<?php echo home_url(); ?>" class="font-manrope font-bold tracking-tight text-slate-600 hover:text-slate-900">Archive</a>
            <!-- Add more nav items as needed -->
        </nav>
    </div>
</header>
<div class="flex pt-16 min-h-screen">
```

#### Step 5: Create `footer.php`
```php
</div><!-- end .min-h-screen -->

<footer class="bg-slate-100 dark:bg-slate-950 w-full mt-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto px-8 py-12">
        <div>
            <span class="font-bold text-slate-900 uppercase tracking-widest">5ELABS</span>
            <p class="text-xs uppercase tracking-widest text-slate-500 mt-4">© 2026 5elabs. All rights reserved.</p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
```

#### Step 6: Create `sidebar.php`
```php
<aside class="hidden lg:flex w-64 h-[calc(100vh-4rem)] sticky top-16 flex-col bg-slate-50 dark:bg-slate-900 rounded-r-lg shadow-2xl">
    <div class="p-6">
        <h2 class="text-xl font-bold text-slate-900 font-headline mb-6">Project Archive</h2>
        <nav class="space-y-1">
            <a href="<?php echo home_url('/atomic-city/'); ?>" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg">
                <span class="material-symbols-outlined">precision_manufacturing</span>
                Atomic City
            </a>
            <a href="<?php echo home_url('/cardium/'); ?>" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg">
                <span class="material-symbols-outlined">monitor_heart</span>
                Cardium
            </a>
            <a href="<?php echo home_url('/math-city/'); ?>" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg">
                <span class="material-symbols-outlined">functions</span>
                Math City
            </a>
            <a href="<?php echo home_url('/math-city-2/'); ?>" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg">
                <span class="material-symbols-outlined">calculate</span>
                Math City 2.0
            </a>
            <a href="<?php echo home_url('/ethical-land/'); ?>" class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg">
                <span class="material-symbols-outlined">balance</span>
                Ethical Land
            </a>
        </nav>
    </div>
</aside>
```

#### Step 7: Create Page Templates
For each page, create a WordPress page template:

**`index.php`** (Main Hub):
```php
<?php get_header(); ?>
<?php get_sidebar(); ?>

<main class="flex-1 px-8 py-12">
    <div class="max-w-6xl mx-auto">
        <!-- Paste the hero section and bento grid from 5elabs_main_lab_hub/code.html -->
    </div>
</main>

<?php get_footer(); ?>
```

#### Step 8: Install the Theme
1. Zip the `5elabs-theme` folder
2. Go to WordPress Admin → Appearance → Themes → Add New → Upload Theme
3. Activate the theme

#### Step 9: Create WordPress Pages
Create pages in WordPress matching your structure:
- Home (set as front page)
- Atomic City
- Cardium
- Math City
- Math City 2.0
- Ethical Land

Then assign the correct template to each page.

---

## Option 3: Use "Insert Headers and Footers" Plugin (Quick Integration)

If you want to keep WordPress but add your existing HTML:

1. Install plugin: **WPCode** (formerly Insert Headers and Footers)
2. Create new pages in WordPress
3. Use the Classic Editor or HTML blocks
4. Paste your HTML content into each page
5. Add Tailwind CSS CDN to the header via the plugin

---

## Important Recommendations

### 1. Download External Images
Your images are hosted on Google servers. Download them and host locally:
```
assets/images/
├── logo.png
├── atomic-city-hero.png
├── cardium-hero.png
├── math-city-hero.png
├── math-city-2-hero.png
├── ethical-land-hero.png
└── etc.
```

### 2. Use Tailwind CSS Properly
For production, compile Tailwind CSS instead of using CDN:
```bash
npm install tailwindcss
npx tailwindcss init
# Configure and build
```

### 3. Update Internal Links
Change all relative paths to WordPress permalinks:
- Old: `../project_atomic_city/code.html`
- New: `<?php echo home_url('/atomic-city/'); ?>`

---

## Quick Deployment Checklist

- [ ] Choose deployment option (1, 2, or 3)
- [ ] Download all external images
- [ ] Update image paths to local
- [ ] Create WordPress pages
- [ ] Upload theme/files to server
- [ ] Configure navigation menus
- [ ] Test all internal links
- [ ] Test responsive design on mobile
- [ ] Configure WordPress permalinks (Settings → Permalinks → Post name)
- [ ] Set front page (Settings → Reading → Static page)

---

## Server Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Theme supports block editor (optional)