# ⚡ Quick Deploy Guide - CMS MobileInfoHub

Fast setup guide for deploying your React CMS to VPS with auto-deployment.

---

## 🚀 Quick Setup (5 Steps)

### 1️⃣ VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install requirements (if not already installed)
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Clone project
sudo mkdir -p /var/www/cms-mobileinfohub
sudo chown -R $USER:$USER /var/www/cms-mobileinfohub
cd /var/www/cms-mobileinfohub
git clone https://github.com/shahadathossain4536/cms-mobileinfohub.git .

# Make deploy script executable
chmod +x deploy.sh
```

### 2️⃣ Configure Environment

```bash
# Create .env file
nano .env.production
```

Add:
```env
REACT_APP_API_BASE_URL=http://api.mobileinfohub.com/api
NODE_ENV=production
```

Save (Ctrl+X, Y, Enter)

### 3️⃣ Setup Nginx

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/cms-mobileinfohub
```

Paste:
```nginx
server {
    listen 80;
    server_name http://cms.mobileinfohub.com;  # Change this!
    
    root /var/www/cms-mobileinfohub/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    access_log /var/log/nginx/cms-mobileinfohub.access.log;
    error_log /var/log/nginx/cms-mobileinfohub.error.log;
}
```

**Important:** Change `http://cms.mobileinfohub.com` to your actual domain!

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cms-mobileinfohub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL (optional but recommended)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d http://cms.mobileinfohub.com
```

### 4️⃣ Setup GitHub Auto-Deploy

```bash
# On VPS - Generate SSH key
cd ~/.ssh
ssh-keygen -t ed25519 -C "github-actions-cms" -f github_actions_cms_key
cat github_actions_cms_key.pub >> authorized_keys

# Display private key (copy this)
cat github_actions_cms_key
```

**Add to GitHub:**
1. Go to: `https://github.com/shahadathossain4536/cms-mobileinfohub/settings/secrets/actions`
2. Add these secrets:

| Name | Value |
|------|-------|
| `VPS_HOST` | Your VPS IP (e.g., 123.456.78.90) |
| `VPS_USERNAME` | Your username (usually `root`) |
| `VPS_SSH_KEY` | The private key you copied above |

### 5️⃣ First Deploy

```bash
# On VPS
cd /var/www/cms-mobileinfohub
bash deploy.sh
```

**✅ Done!** Your CMS is now live at `http://api.mobileinfohub.com`

---

## 🔄 Auto-Deploy

**Already configured!** Just push to main:

```bash
# On your local machine
cd /Users/shahadathossain/Desktop/own/mobileinfohub-main/cms-mobileinfohub

git add .
git commit -m "Update CMS"
git push origin main
```

Your site will auto-update in 2-3 minutes! 🎉

Monitor at: `https://github.com/shahadathossain4536/cms-mobileinfohub/actions`

---

## 🔍 Quick Tests

```bash
# Test website
curl -I http://api.mobileinfohub.com

# Check deployment
ssh root@your-vps-ip "ls -la /var/www/cms-mobileinfohub/html"

# View logs
ssh root@your-vps-ip "sudo tail -f /var/log/nginx/cms-mobileinfohub.error.log"
```

---

## 🆘 Quick Fixes

### Site not loading?

```bash
# Check nginx
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx

# Check files exist
ls -la /var/www/cms-mobileinfohub/html
```

### Auto-deploy not working?

1. Check GitHub Actions: Repository → Actions tab
2. Look for errors in workflow logs
3. Verify GitHub secrets are correct
4. Test SSH: `ssh -i ~/.ssh/github_actions_cms_key $USER@your-vps-ip`

### 502 Error?

```bash
# Check nginx error log
sudo tail -100 /var/log/nginx/cms-mobileinfohub.error.log

# Verify files exist
ls -la /var/www/cms-mobileinfohub/html/index.html

# Check permissions
sudo chown -R www-data:www-data /var/www/cms-mobileinfohub/html
```

---

## 📝 Useful Commands

```bash
# Manual deploy
ssh root@your-vps-ip "cd /var/www/cms-mobileinfohub && bash deploy.sh"

# View nginx logs
ssh root@your-vps-ip "sudo tail -f /var/log/nginx/cms-mobileinfohub.access.log"

# Restart nginx
ssh root@your-vps-ip "sudo systemctl restart nginx"

# Check git status
ssh root@your-vps-ip "cd /var/www/cms-mobileinfohub && git status"
```

---

## 🎯 Common Issues

| Issue | Solution |
|-------|----------|
| Permission denied | `sudo chown -R $USER:$USER /var/www/cms-mobileinfohub` |
| Build fails | Check .env.production exists and has correct API URL |
| Routes 404 | Make sure nginx has `try_files $uri $uri/ /index.html;` |
| Old version shows | Hard refresh browser (Ctrl+Shift+R) |

---

## 📚 Full Documentation

For detailed setup, troubleshooting, and advanced configuration, see:
- `DEPLOYMENT_SETUP.md` - Complete deployment guide
- `nginx.conf.example` - Full nginx configuration
- `.github/workflows/deploy-vps.yml` - GitHub Actions workflow

---

**Need Help?** Check the full deployment guide or contact support.

**Happy Deploying! 🚀**

