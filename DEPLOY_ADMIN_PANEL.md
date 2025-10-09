# 🚀 Deploy React Admin Panel to VPS

## Overview
Deploy `mobile_project_backend` (React Admin Panel) to your VPS on port 3001.

---

## Step 1: Upload to VPS

### Option A: Using rsync (Recommended)

From your local machine:
```bash
# Upload the admin panel to VPS
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  /Users/shahadathossain/Desktop/own/deviceinfohub-main/mobile_project_backend/ \
  root@72.60.205.42:/var/www/mobile_project_backend/
```

### Option B: Using Git (if you have a repo)

On VPS:
```bash
ssh root@72.60.205.42
cd /var/www
git clone https://github.com/your-repo/mobile_project_backend.git
```

---

## Step 2: Configure Environment

### SSH into VPS:

```bash
ssh root@72.60.205.42
cd /var/www/mobile_project_backend
```

### Create .env File:

```bash
nano .env
```

Add:
```env
# API URL - Point to your backend
REACT_APP_API_URL=http://72.60.205.42:2000/api

# Or use domain after Nginx setup
# REACT_APP_API_URL=https://api.mobileinfohub.com/api

# Port for development server (if running in dev mode)
PORT=3001
```

**Save:** `Ctrl+X` → `Y` → `Enter`

---

## Step 3: Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `build/` folder with optimized static files.

---

## Step 4: Serve with PM2

### Option A: Using 'serve' package (Recommended)

```bash
# Install serve globally
npm install -g serve

# Start with PM2
pm2 start serve --name "admin-panel" -- -s build -l 3001

# Save PM2 list
pm2 save
```

### Option B: Using PM2 ecosystem file

Create `ecosystem.config.js`:
```bash
nano ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [{
    name: 'admin-panel',
    script: 'serve',
    args: '-s build -l 3001',
    env: {
      NODE_ENV: 'production',
      PM2_SERVE_PATH: './build',
      PM2_SERVE_PORT: 3001,
      PM2_SERVE_SPA: 'true'
    }
  }]
};
```

Start:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Step 5: Verify Admin Panel is Running

### Check PM2:

```bash
pm2 list
```

Should show:
```
┌────┬─────────────────┬─────────┬─────────┬──────────┐
│ id │ name            │ mode    │ ↺       │ status   │
├────┼─────────────────┼─────────┼─────────┼──────────┤
│ 2  │ admin-panel     │ fork    │ 0       │ online   │
└────┴─────────────────┴─────────┴─────────┴──────────┘
```

### Test Locally:

```bash
# Test if admin panel is accessible
curl http://localhost:3001

# Should return HTML content
```

### Test from Browser:

Open: `http://72.60.205.42:3001`

**You should see your admin panel!** ✅

---

## Step 6: Configure Nginx (Optional - for domain)

### Create Nginx Config:

```bash
sudo nano /etc/nginx/sites-available/admin-mobileinfohub
```

Add:
```nginx
server {
    listen 80;
    server_name cms.mobileinfohub.com;

    location / {
        proxy_pass http://127.0.0.1:3322;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # For React Router (SPA)
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /static {
        proxy_pass http://127.0.0.1:3322;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/admin-mobileinfohub /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Add SSL:

```bash
sudo certbot --nginx -d admin.mobileinfohub.com
```

---

## Step 7: DNS Configuration

Add to your domain DNS:

| Type | Name  | Value         | TTL  |
|------|-------|---------------|------|
| A    | admin | 72.60.205.42  | 3600 |

---

## ✅ **All PM2 Processes Running**

After setup, `pm2 list` should show:

```
┌────┬──────────────────────────┬─────────┬─────────┬──────────┐
│ id │ name                     │ mode    │ ↺       │ status   │
├────┼──────────────────────────┼─────────┼─────────┼──────────┤
│ 0  │ mobileinfohub            │ fork    │ 0       │ online   │
│ 1  │ deviceinfohub-backend    │ cluster │ 0       │ online   │
│ 2  │ admin-panel              │ fork    │ 0       │ online   │
└────┴──────────────────────────┴─────────┴─────────┴──────────┘
```

---

## 🎯 **Access Your Admin Panel:**

- **Via IP**: `http://72.60.205.42:3001`
- **Via Domain** (after DNS/Nginx): `https://admin.mobileinfohub.com`

---

## 🔧 **PM2 Management Commands**

```bash
# View logs
pm2 logs admin-panel

# Restart
pm2 restart admin-panel

# Stop
pm2 stop admin-panel

# Delete
pm2 delete admin-panel
```

---

## 🔄 **Update Admin Panel**

When you make changes:

```bash
# 1. Upload new files (from local machine)
rsync -avz --exclude 'node_modules' /Users/shahadathossain/Desktop/own/deviceinfohub-main/mobile_project_backend/ root@72.60.205.42:/var/www/mobile_project_backend/

# 2. SSH into VPS
ssh root@72.60.205.42
cd /var/www/mobile_project_backend

# 3. Rebuild
npm run build

# 4. Restart PM2
pm2 restart admin-panel
```

---

## 🎉 **Your Admin Panel is Deployed!**

Access at: `http://72.60.205.42:3001`

It will connect to your backend at: `http://72.60.205.42:2000`

