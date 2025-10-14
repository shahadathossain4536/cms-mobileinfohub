# 📦 CMS MobileInfoHub - Deployment Documentation

This React CMS application is configured for automatic deployment to your VPS when you push to the `main` branch.

---

## 🎯 Deployment Method

**GitHub Actions** - Automatic deployment triggered on push to `main` branch.

### How It Works:
1. Push code to `main` branch
2. GitHub Actions workflow triggers
3. Connects to your VPS via SSH
4. Runs deployment script
5. Site updates automatically (2-3 minutes)

---

## 📁 Deployment Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-vps.yml` | GitHub Actions workflow for auto-deployment |
| `deploy.sh` | Deployment script that runs on VPS |
| `nginx.conf.example` | Nginx configuration for serving the React app |
| `env.production.example` | Production environment variables template |
| `env.development.example` | Development environment variables template |
| `DEPLOYMENT_SETUP.md` | Complete step-by-step setup guide |
| `QUICK_DEPLOY.md` | Quick reference for deployment |

---

## ⚡ Quick Start

### Option 1: Follow Quick Guide
See `QUICK_DEPLOY.md` for a fast 5-step setup.

### Option 2: Follow Detailed Guide
See `DEPLOYMENT_SETUP.md` for complete instructions with troubleshooting.

---

## 🔑 Prerequisites Checklist

Before deployment, ensure you have:

- [ ] VPS server with SSH access
- [ ] Domain or subdomain (e.g., cms.yourdomain.com)
- [ ] Node.js installed on VPS (v16+)
- [ ] Nginx installed on VPS
- [ ] Git installed on VPS
- [ ] GitHub repository access

---

## 🚀 First Time Setup (Summary)

### 1. VPS Setup
```bash
# SSH into VPS
ssh root@your-vps-ip

# Clone repository
sudo mkdir -p /var/www/cms-mobileinfohub
cd /var/www/cms-mobileinfohub
git clone https://github.com/shahadathossain4536/cms-mobileinfohub.git .

# Make deploy script executable
chmod +x deploy.sh
```

### 2. Environment Configuration
```bash
# Create production env file
cp env.production.example .env.production
nano .env.production
# Edit REACT_APP_API_BASE_URL to your production API
```

### 3. Nginx Setup
```bash
# Copy and configure nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/cms-mobileinfohub
sudo nano /etc/nginx/sites-available/cms-mobileinfohub
# Change cms.yourdomain.com to your domain

# Enable site
sudo ln -s /etc/nginx/sites-available/cms-mobileinfohub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. GitHub Secrets
Add these secrets to your GitHub repository:
- `VPS_HOST` - Your VPS IP address
- `VPS_USERNAME` - SSH username
- `VPS_SSH_KEY` - SSH private key

### 5. First Deploy
```bash
# Run on VPS
cd /var/www/cms-mobileinfohub
bash deploy.sh
```

---

## 🔄 Daily Workflow

After initial setup, deployment is automatic:

```bash
# On your local machine
git add .
git commit -m "Your changes"
git push origin main

# That's it! GitHub Actions will deploy automatically
# Check progress: https://github.com/shahadathossain4536/cms-mobileinfohub/actions
```

---

## 📊 Project Structure

```
cms-mobileinfohub/
├── .github/
│   └── workflows/
│       └── deploy-vps.yml          # Auto-deployment workflow
├── public/                          # Static assets
├── src/                            # React source code
├── deploy.sh                       # Deployment script
├── nginx.conf.example              # Nginx configuration
├── env.production.example          # Production env template
├── env.development.example         # Development env template
├── DEPLOYMENT_SETUP.md            # Complete setup guide
├── QUICK_DEPLOY.md                # Quick reference
└── README_DEPLOYMENT.md           # This file
```

---

## 🌐 Deployment Locations

After deployment, your files will be at:

| Location | Purpose |
|----------|---------|
| `/var/www/cms-mobileinfohub/` | Project root directory |
| `/var/www/cms-mobileinfohub/html/` | Built React app (served by Nginx) |
| `/var/www/cms-mobileinfohub/backup_*` | Previous builds (auto-backup) |
| `/var/log/nginx/cms-mobileinfohub.access.log` | Access logs |
| `/var/log/nginx/cms-mobileinfohub.error.log` | Error logs |

---

## 🔧 Manual Deployment

If you need to deploy manually:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Navigate to project
cd /var/www/cms-mobileinfohub

# Run deployment
bash deploy.sh
```

---

## 🧪 Testing Deployment

```bash
# Test website is accessible
curl -I http://cms.yourdomain.com

# Check files are deployed
ssh root@your-vps-ip "ls -la /var/www/cms-mobileinfohub/html"

# View logs
ssh root@your-vps-ip "sudo tail -f /var/log/nginx/cms-mobileinfohub.access.log"
```

---

## 📝 Environment Variables

### Development (.env.development)
```env
REACT_APP_API_BASE_URL=http://localhost:2000/api
PORT=3322
NODE_ENV=development
```

### Production (.env.production)
```env
REACT_APP_API_BASE_URL=https://api.mobileinfohub.com/api
PORT=3322
NODE_ENV=production
```

**Important:** Update `REACT_APP_API_BASE_URL` to match your production API endpoint!

---

## 🛠️ Build Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Run development server (port 3322) |
| `npm run build` | Build for production (uses .env) |
| `npm run build:prod` | Build with .env.production |
| `npm run build:staging` | Build with .env.staging |

---

## 🔒 Security Notes

1. **SSL/HTTPS** - Always use HTTPS in production (Certbot recommended)
2. **Environment Files** - Never commit `.env` files to Git
3. **SSH Keys** - Keep private keys secure, never share
4. **API URLs** - Use HTTPS URLs for production API
5. **Secrets** - GitHub secrets are encrypted and secure

---

## 🆘 Common Issues

### Auto-deployment not working?
- Check GitHub Actions tab for errors
- Verify GitHub secrets are correct
- Test SSH connection manually

### Site showing old version?
- Hard refresh browser (Ctrl+Shift+R)
- Check deployment completed successfully
- Verify build files updated on VPS

### Build fails?
- Check `.env.production` exists
- Verify Node.js version on VPS (v16+)
- Check npm install completed

### 502 Bad Gateway?
- Check nginx configuration
- Verify build files exist in `/var/www/cms-mobileinfohub/html/`
- Check nginx error logs

---

## 📚 Documentation Files

1. **DEPLOYMENT_SETUP.md** - Complete step-by-step setup guide
   - Prerequisites
   - VPS setup
   - Nginx configuration
   - GitHub Actions setup
   - Troubleshooting

2. **QUICK_DEPLOY.md** - Quick reference guide
   - Fast 5-step setup
   - Common commands
   - Quick fixes

3. **README_DEPLOYMENT.md** (this file) - Overview and reference

---

## 🔗 Useful Links

- **GitHub Repository:** https://github.com/shahadathossain4536/cms-mobileinfohub
- **GitHub Actions:** https://github.com/shahadathossain4536/cms-mobileinfohub/actions
- **React Documentation:** https://react.dev
- **Nginx Documentation:** https://nginx.org/en/docs/

---

## 📞 Support

For detailed help:
1. Check `DEPLOYMENT_SETUP.md` for complete guide
2. Check `QUICK_DEPLOY.md` for quick reference
3. View GitHub Actions logs for deployment issues
4. Check nginx logs on VPS for runtime issues

---

## ✅ Deployment Checklist

Use this checklist for first-time setup:

- [ ] VPS server accessible via SSH
- [ ] Node.js, Nginx, Git installed on VPS
- [ ] Project cloned to `/var/www/cms-mobileinfohub`
- [ ] `.env.production` created and configured
- [ ] Nginx configured and enabled
- [ ] Domain/subdomain pointed to VPS
- [ ] SSL certificate installed (optional but recommended)
- [ ] SSH key generated for GitHub Actions
- [ ] GitHub secrets configured (VPS_HOST, VPS_USERNAME, VPS_SSH_KEY)
- [ ] First deployment completed successfully
- [ ] Website accessible at domain
- [ ] Auto-deployment tested (push to main)

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Deployment Method:** GitHub Actions  
**Target:** VPS with Nginx  

---

**Happy Deploying! 🚀**

