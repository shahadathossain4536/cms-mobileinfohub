# 🔄 Deployment Flow Visualization

Visual guide to understand how automatic deployment works.

---

## 🌊 Complete Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  👨‍💻 YOU (Local Development)                                      │
│                                                                 │
│  1. Edit code in VS Code / Cursor                              │
│  2. Test locally (npm start on port 3322)                      │
│  3. Commit changes:                                            │
│     git add .                                                  │
│     git commit -m "Update feature"                            │
│  4. Push to GitHub:                                            │
│     git push origin main ────────────┐                        │
│                                       │                        │
└───────────────────────────────────────┼────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  📦 GITHUB (Repository & Actions)                               │
│                                                                 │
│  1. Receives push to main branch                               │
│  2. Detects .github/workflows/deploy-vps.yml                   │
│  3. Triggers GitHub Actions workflow                           │
│  4. Reads secrets:                                             │
│     • VPS_HOST (your server IP)                               │
│     • VPS_USERNAME (SSH user)                                 │
│     • VPS_SSH_KEY (private key)                               │
│  5. Connects to VPS via SSH ──────────┐                        │
│  6. Logs: github.com/.../actions      │                        │
│                                       │                        │
└───────────────────────────────────────┼────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  🖥️  VPS SERVER (Your Production Server)                        │
│                                                                 │
│  Location: /var/www/cms-mobileinfohub/                         │
│                                                                 │
│  1. GitHub Actions SSH into server                             │
│  2. Navigates to project directory                             │
│  3. Executes: bash deploy.sh                                   │
│                                                                 │
│  deploy.sh does:                                               │
│  ┌──────────────────────────────────────┐                      │
│  │ ✓ git pull origin main               │ Pull latest code    │
│  │ ✓ npm install --legacy-peer-deps     │ Install deps        │
│  │ ✓ npm run build:prod                 │ Build React app     │
│  │ ✓ Backup old build                   │ Safety backup       │
│  │ ✓ Copy build/ → html/                │ Deploy files        │
│  │ ✓ sudo systemctl reload nginx        │ Reload web server   │
│  └──────────────────────────────────────┘                      │
│                                       │                        │
│  Result:                              │                        │
│  /var/www/cms-mobileinfohub/html/     │                        │
│    ├── index.html                     │                        │
│    ├── static/                        │                        │
│    │   ├── css/                       │                        │
│    │   ├── js/                        │                        │
│    │   └── media/                     │                        │
│    └── ... (all built files)         │                        │
│                                       │                        │
└───────────────────────────────────────┼────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  🌐 NGINX (Web Server)                                          │
│                                                                 │
│  Config: /etc/nginx/sites-enabled/cms-mobileinfohub            │
│                                                                 │
│  Serves files from: /var/www/cms-mobileinfohub/html/           │
│                                                                 │
│  Features:                                                     │
│  • Gzip compression                                            │
│  • Static asset caching (1 year)                              │
│  • React Router support (try_files)                           │
│  • Security headers                                            │
│  • SSL/HTTPS (if configured)                                   │
│                                       │                        │
└───────────────────────────────────────┼────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  🌍 YOUR VISITORS                                               │
│                                                                 │
│  Browser → https://cms.yourdomain.com → Your React CMS! 🎉    │
│                                                                 │
│  They see:                                                     │
│  • Fast loading (optimized build)                              │
│  • Cached assets (quick repeat visits)                        │
│  • Secure HTTPS                                                │
│  • Latest version (just deployed!)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Timeline (After Push)

```
0:00  ─  You: git push origin main
      |
0:05  ─  GitHub: Workflow triggered
      |
0:10  ─  GitHub Actions: Starting deployment
      |
0:15  ─  VPS: Pulling latest code
      |
0:30  ─  VPS: Installing dependencies
      |
1:00  ─  VPS: Building React app
      |
1:30  ─  VPS: Deploying to html/
      |
1:35  ─  VPS: Reloading Nginx
      |
1:40  ─  ✅ LIVE! Site updated!
      |
2:00  ─  GitHub Actions: ✅ Success!

Total: ~2 minutes
```

---

## 🔐 Security Flow

```
┌──────────────────────┐
│  GitHub Actions      │
│                      │
│  Has:                │
│  • VPS_SSH_KEY       │ ──────────┐
│    (private key)     │           │
└──────────────────────┘           │
                                   │ SSH Connection
                                   │ (encrypted)
┌──────────────────────┐           │
│  VPS Server          │           │
│                      │           │
│  Has:                │ <─────────┘
│  • authorized_keys   │
│    (public key)      │
└──────────────────────┘

Only matching keys can connect!
```

---

## 📂 File Structure on VPS

```
/var/www/cms-mobileinfohub/
│
├── .git/                          ← Git repository
├── .github/
│   └── workflows/
│       └── deploy-vps.yml         ← GitHub Actions config
│
├── deploy.sh                      ← Deployment script ⭐
├── .env.production                ← Environment config
│
├── node_modules/                  ← Dependencies
├── package.json                   ← Node config
├── src/                          ← React source code
│   ├── components/
│   ├── pages/
│   └── ...
│
├── build/                         ← Build output (temporary)
│   ├── index.html
│   ├── static/
│   └── ...
│
├── html/                          ← DEPLOYED FILES ⭐
│   ├── index.html                 ← Nginx serves from here!
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── media/
│   └── ...
│
└── backup_YYYYMMDD_HHMMSS/       ← Previous builds (auto-backup)
    └── ...
```

---

## 🔄 What Happens During Deployment

### Phase 1: Preparation
```
┌─────────────────────────────────┐
│ 1. Fetch from GitHub            │
│    git fetch origin main        │
│                                 │
│ 2. Check for changes            │
│    Compare local vs remote      │
│                                 │
│ 3. If no changes:               │
│    ✓ Skip deployment            │
│    ✓ Exit gracefully            │
└─────────────────────────────────┘
```

### Phase 2: Update
```
┌─────────────────────────────────┐
│ 1. Pull latest code             │
│    git reset --hard origin/main │
│                                 │
│ 2. Install dependencies         │
│    npm install --legacy-p...    │
│                                 │
│ 3. Verify .env.production       │
│    Check environment config     │
└─────────────────────────────────┘
```

### Phase 3: Build
```
┌─────────────────────────────────┐
│ 1. Build React application      │
│    npm run build:prod           │
│                                 │
│ 2. Optimize assets              │
│    • Minify JS/CSS              │
│    • Compress images            │
│    • Generate hashes            │
│                                 │
│ 3. Output to build/             │
│    All static files ready       │
└─────────────────────────────────┘
```

### Phase 4: Deploy
```
┌─────────────────────────────────┐
│ 1. Backup current version       │
│    html/ → backup_timestamp/    │
│                                 │
│ 2. Deploy new version           │
│    build/* → html/              │
│                                 │
│ 3. Set permissions              │
│    chown www-data:www-data      │
│                                 │
│ 4. Reload Nginx                 │
│    systemctl reload nginx       │
└─────────────────────────────────┘
```

### Phase 5: Verification
```
┌─────────────────────────────────┐
│ 1. Check files exist            │
│    ✓ html/index.html            │
│    ✓ html/static/               │
│                                 │
│ 2. Test Nginx                   │
│    ✓ nginx -t (config OK)       │
│                                 │
│ 3. Report status                │
│    ✅ Deployment complete!       │
│    📊 Show statistics           │
└─────────────────────────────────┘
```

---

## 🔍 Monitoring & Logs

### During Deployment

**On GitHub:**
```
github.com/shahadathossain4536/cms-mobileinfohub/actions
│
├── Workflow runs
│   ├── ✅ Deploy CMS to VPS (2 min ago)
│   ├── ✅ Deploy CMS to VPS (1 hour ago)
│   └── ✅ Deploy CMS to VPS (1 day ago)
│
└── Live logs during deployment
```

**On VPS:**
```bash
# Deployment script output
/var/www/cms-mobileinfohub/deploy.sh

# Nginx access log
/var/log/nginx/cms-mobileinfohub.access.log

# Nginx error log
/var/log/nginx/cms-mobileinfohub.error.log
```

---

## 🚨 Failure Scenarios & Recovery

### Scenario 1: Build Fails
```
Error → Build fails
  ↓
deploy.sh stops
  ↓
Old version still running ✅
  ↓
Fix code → Push again
```

### Scenario 2: Deploy Fails
```
Error → Deploy fails
  ↓
Backup exists in backup_*/
  ↓
Restore: cp -r backup_*/* html/
  ↓
Site back online ✅
```

### Scenario 3: Nginx Issue
```
Error → Nginx config error
  ↓
nginx -t shows error
  ↓
Fix config
  ↓
systemctl reload nginx ✅
```

---

## 📊 Performance Features

### Build Optimizations
```
React Production Build:
├── Code splitting
├── Tree shaking
├── Minification
├── Dead code elimination
└── Asset optimization
```

### Nginx Optimizations
```
Nginx Configuration:
├── Gzip compression (60-80% smaller)
├── Static caching (1 year)
├── Browser caching
├── Compression (JS, CSS, HTML)
└── Asset preloading
```

### Result
```
Before Optimization:
  Bundle size: ~2MB
  Load time: ~3-5 seconds

After Optimization:
  Bundle size: ~300-500KB
  Load time: ~0.5-1 second ⚡
```

---

## 🎯 Key Paths to Remember

| Path | Purpose |
|------|---------|
| **GitHub** |
| `.github/workflows/deploy-vps.yml` | Deployment trigger |
| **VPS** |
| `/var/www/cms-mobileinfohub/` | Project root |
| `/var/www/cms-mobileinfohub/html/` | Live site (nginx serves) |
| `/var/www/cms-mobileinfohub/deploy.sh` | Deployment script |
| **Nginx** |
| `/etc/nginx/sites-available/cms-mobileinfohub` | Site config |
| `/etc/nginx/sites-enabled/cms-mobileinfohub` | Enabled config |
| **Logs** |
| `/var/log/nginx/cms-mobileinfohub.access.log` | Access log |
| `/var/log/nginx/cms-mobileinfohub.error.log` | Error log |

---

## 🔄 Rollback Process

If you need to rollback to previous version:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Navigate to project
cd /var/www/cms-mobileinfohub

# List available backups
ls -lt backup_*/

# Restore specific backup
sudo cp -r backup_20241013_123456/* html/

# Reload Nginx
sudo systemctl reload nginx

# ✅ Previous version restored!
```

---

## 🎊 Summary

**This deployment setup gives you:**

✅ **Automated CI/CD Pipeline**
- Push code → Auto-deploy

✅ **Zero-Downtime Deployment**
- Site stays up during updates

✅ **Automatic Backups**
- Easy rollback if needed

✅ **Production Optimized**
- Fast loading, cached assets

✅ **Secure**
- SSH key authentication
- HTTPS ready

✅ **Monitored**
- GitHub Actions logs
- Nginx logs

✅ **Professional**
- Industry-standard workflow

---

**Next:** Open `START_HERE.md` to begin setup! 🚀

---

**Created:** October 2025  
**Visual Guide:** Deployment Flow & Architecture  
**Repository:** github.com/shahadathossain4536/cms-mobileinfohub

