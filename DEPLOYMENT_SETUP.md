# 🚀 CMS MobileInfoHub - VPS Deployment Guide

Complete guide to deploy your React CMS to VPS with auto-deployment from GitHub.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial VPS Setup](#initial-vps-setup)
3. [Configure GitHub Secrets](#configure-github-secrets)
4. [Setup Nginx](#setup-nginx)
5. [First Deployment](#first-deployment)
6. [Auto-Deploy Configuration](#auto-deploy-configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have:

- ✅ VPS server with Ubuntu/Debian (recommended)
- ✅ SSH access to your VPS
- ✅ Domain or subdomain pointed to your VPS IP (e.g., cms.yourdomain.com)
- ✅ Node.js installed on VPS (v16 or higher)
- ✅ Nginx installed on VPS
- ✅ Git installed on VPS
- ✅ GitHub repository for this project

---

## 🖥️ Initial VPS Setup

### Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
# Or: ssh your-username@your-vps-ip
```

### Step 2: Install Required Software

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx (if not already installed)
sudo apt install -y nginx

# Install Git (if not already installed)
sudo apt install -y git

# Verify installations
node --version
npm --version
nginx -v
git --version
```

### Step 3: Setup Project Directory

```bash
# Create project directory
sudo mkdir -p /var/www/cms-mobileinfohub
sudo chown -R $USER:$USER /var/www/cms-mobileinfohub

# Navigate to directory
cd /var/www/cms-mobileinfohub

# Clone your repository
git clone https://github.com/shahadathossain4536/cms-mobileinfohub.git .

# Or if you need to use SSH
# git clone git@github.com:shahadathossain4536/cms-mobileinfohub.git .
```

### Step 4: Make Deploy Script Executable

```bash
chmod +x /var/www/cms-mobileinfohub/deploy.sh
```

### Step 5: Configure Environment

```bash
# Create production environment file
cd /var/www/cms-mobileinfohub
cp .env.production .env

# Edit if needed
nano .env

# Make sure REACT_APP_API_BASE_URL points to your production API
# Example: REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 🔐 Configure GitHub Secrets

### Step 1: Generate SSH Key on VPS (if not exists)

```bash
# On your VPS
cd ~/.ssh

# Generate new SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-cms" -f github_actions_cms_key

# Add public key to authorized_keys
cat github_actions_cms_key.pub >> authorized_keys

# Display private key (you'll need this for GitHub)
cat github_actions_cms_key
```

**Copy the entire private key** (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

### Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository: `https://github.com/shahadathossain4536/cms-mobileinfohub`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VPS_HOST` | Your VPS IP address | Example: `123.456.78.90` |
| `VPS_USERNAME` | Your SSH username | Usually `root` or your username |
| `VPS_SSH_KEY` | Your private key | The private key you copied above |
| `VPS_PORT` | SSH port (optional) | Default is `22` |

**Example:**
- Name: `VPS_HOST`
- Secret: `123.456.78.90`
- Click **Add secret**

Repeat for all secrets.

---

## 🌐 Setup Nginx

### Step 1: Create Nginx Configuration

```bash
# On your VPS
sudo nano /etc/nginx/sites-available/cms-mobileinfohub
```

**Copy the configuration from `nginx.conf.example`** or paste this:

```nginx
server {
    listen 80;
    listen [::]:80;
    
    # Change this to your domain
    server_name cms.yourdomain.com;
    
    root /var/www/cms-mobileinfohub/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router - handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Disable caching for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    access_log /var/log/nginx/cms-mobileinfohub.access.log;
    error_log /var/log/nginx/cms-mobileinfohub.error.log;
}
```

**Important:** Replace `cms.yourdomain.com` with your actual domain/subdomain!

### Step 2: Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/cms-mobileinfohub /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### Step 3: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
sudo ufw status
```

### Step 4: Setup SSL (HTTPS) - Recommended

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d cms.yourdomain.com

# Follow the prompts
# Certbot will automatically configure HTTPS and redirect HTTP to HTTPS
```

---

## 🎯 First Deployment

### Manual First Deployment

```bash
# On your VPS
cd /var/www/cms-mobileinfohub

# Run deployment script
bash deploy.sh
```

This will:
1. ✅ Pull latest code from GitHub
2. ✅ Install dependencies
3. ✅ Build the React application
4. ✅ Deploy to `/var/www/cms-mobileinfohub/html`
5. ✅ Reload Nginx

**If successful, your CMS should now be accessible at your domain!**

---

## 🔄 Auto-Deploy Configuration

Auto-deployment is already configured via **GitHub Actions**!

### How It Works

1. You push code to the `main` branch
2. GitHub Actions triggers automatically
3. Connects to your VPS via SSH
4. Runs the `deploy.sh` script
5. Your site is updated automatically!

### Test Auto-Deploy

```bash
# On your local machine
cd /Users/shahadathossain/Desktop/own/mobileinfohub-main/cms-mobileinfohub

# Make a small change (optional)
echo "# Test deploy" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main
```

### Monitor Deployment

1. Go to GitHub: `https://github.com/shahadathossain4536/cms-mobileinfohub`
2. Click **Actions** tab
3. You'll see your deployment workflow running
4. Click on it to see live logs
5. Wait for ✅ green checkmark

**Your site should update automatically in 2-3 minutes!**

---

## ✅ Testing

### Test Website

```bash
# Test HTTP
curl -I http://api.mobileinfohub.com

# Test HTTPS (if SSL configured)
curl -I https://cms.yourdomain.com

# Check if index.html exists
curl http://api.mobileinfohub.com | grep "<title>"
```

### Test in Browser

1. Open: `http://api.mobileinfohub.com` (or your domain)
2. You should see your CMS login page
3. Check browser console for any errors
4. Try logging in

### Check Nginx Status

```bash
# Check Nginx is running
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/cms-mobileinfohub.access.log

# View error logs
sudo tail -f /var/log/nginx/cms-mobileinfohub.error.log
```

### Check Deployment Files

```bash
# Check if files are deployed
ls -la /var/www/cms-mobileinfohub/html

# Check build directory size
du -sh /var/www/cms-mobileinfohub/html

# Verify index.html exists
cat /var/www/cms-mobileinfohub/html/index.html
```

---

## 🆘 Troubleshooting

### Issue: GitHub Actions Fails

**Error: Permission denied (publickey)**

```bash
# On VPS, check SSH key is in authorized_keys
cat ~/.ssh/authorized_keys | grep "github-actions"

# If not found, add it again
cat ~/.ssh/github_actions_cms_key.pub >> ~/.ssh/authorized_keys
```

**Error: Connection refused**

- Check if VPS firewall allows SSH on port 22
- Verify VPS_HOST secret is correct IP address
- Check if SSH service is running: `sudo systemctl status ssh`

### Issue: Build Fails

**Error: npm install failed**

```bash
# On VPS, try manual install
cd /var/www/cms-mobileinfohub
npm install --legacy-peer-deps
```

**Error: Build command failed**

```bash
# Check if .env.production exists
cat /var/www/cms-mobileinfohub/.env.production

# Try building manually
npm run build:prod
```

### Issue: 502 Bad Gateway

**Nginx is running but site shows 502 error**

```bash
# Check if files exist
ls -la /var/www/cms-mobileinfohub/html

# Check nginx configuration
sudo nginx -t

# Check error logs
sudo tail -100 /var/log/nginx/cms-mobileinfohub.error.log
```

### Issue: 404 Not Found on Routes

**React Router routes return 404**

- Make sure your nginx config has: `try_files $uri $uri/ /index.html;`
- Reload nginx: `sudo systemctl reload nginx`

### Issue: Old Version Shows After Deploy

**Browser shows old version**

```bash
# Clear browser cache (Hard refresh)
# Chrome/Edge: Ctrl+Shift+R or Cmd+Shift+R
# Firefox: Ctrl+F5 or Cmd+Shift+R

# On VPS, verify new files are deployed
cd /var/www/cms-mobileinfohub/html
ls -lt | head -20  # Check file modification times
```

### Issue: Permission Denied

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/cms-mobileinfohub

# Fix permissions for nginx
sudo chown -R www-data:www-data /var/www/cms-mobileinfohub/html
sudo chmod -R 755 /var/www/cms-mobileinfohub/html
```

### Check System Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check if any process is using too much memory
top
```

---

## 📝 Useful Commands

### Deploy Manually

```bash
# SSH into VPS
ssh root@your-vps-ip

# Navigate to project
cd /var/www/cms-mobileinfohub

# Run deployment
bash deploy.sh
```

### View Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/cms-mobileinfohub.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/cms-mobileinfohub.error.log

# GitHub Actions logs
# Go to GitHub → Actions → Click on workflow run
```

### Update Code Manually

```bash
# On VPS
cd /var/www/cms-mobileinfohub
git pull origin main
npm install
npm run build:prod
sudo cp -r build/* html/
sudo systemctl reload nginx
```

### Restart Nginx

```bash
# Test configuration first
sudo nginx -t

# Reload (recommended - no downtime)
sudo systemctl reload nginx

# Restart (if reload doesn't work)
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## 🔒 Security Best Practices

1. **Use HTTPS** - Setup SSL with Certbot (shown above)
2. **Secure SSH** - Use SSH keys, disable password auth
3. **Firewall** - Only allow necessary ports (80, 443, 22)
4. **Keep Updated** - Regularly update system packages
5. **Backup** - The deploy script automatically backs up previous builds
6. **Monitor Logs** - Regularly check nginx logs for suspicious activity

---

## 🎉 Success!

Your CMS is now deployed and configured for auto-deployment!

**Workflow:**
1. Code changes pushed to `main` branch
2. GitHub Actions automatically triggers
3. Site updates within 2-3 minutes
4. Zero downtime deployment

**Access your CMS:**
- Production: `https://cms.yourdomain.com`
- Admin panel: Login with your credentials

**Need help?** Check the logs or troubleshooting section above.

---

## 📚 Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Let's Encrypt SSL](https://letsencrypt.org/getting-started/)

---

**Last Updated:** October 2025
**Version:** 1.0
**Support:** shahadathossain4536@github.com

