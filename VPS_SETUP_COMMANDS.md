# 🖥️ VPS Setup Commands - CMS MobileInfoHub

Copy and paste these commands in order on your VPS to set up deployment.

---

## 📋 Prerequisites

- VPS with Ubuntu/Debian
- Root or sudo access
- Domain/subdomain pointed to VPS IP

---

## 🔧 Step 1: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx

# Verify installations
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Nginx version: $(nginx -v 2>&1)"
echo "Git version: $(git --version)"
```

---

## 📁 Step 2: Setup Project Directory

```bash
# Create project directory
sudo mkdir -p /var/www/cms-mobileinfohub

# Set ownership
sudo chown -R $USER:$USER /var/www/cms-mobileinfohub

# Navigate to directory
cd /var/www/cms-mobileinfohub

# Clone repository
git clone https://github.com/shahadathossain4536/cms-mobileinfohub.git .

# Make deploy script executable
chmod +x deploy.sh

# Verify files
ls -la
```

---

## 🔐 Step 3: Generate SSH Key for GitHub Actions

```bash
# Navigate to SSH directory
cd ~/.ssh

# Generate new SSH key
ssh-keygen -t ed25519 -C "github-actions-cms" -f github_actions_cms_key

# When prompted:
# - Enter file name: (press Enter to use default)
# - Enter passphrase: (press Enter for no passphrase)
# - Enter passphrase again: (press Enter)

# Add public key to authorized_keys
cat github_actions_cms_key.pub >> authorized_keys

# Set correct permissions
chmod 600 github_actions_cms_key
chmod 644 github_actions_cms_key.pub
chmod 600 authorized_keys

# Display private key (you'll need this for GitHub)
echo "=========================================="
echo "COPY THIS PRIVATE KEY TO GITHUB SECRETS:"
echo "=========================================="
cat github_actions_cms_key
echo "=========================================="
echo ""
echo "Save this key as VPS_SSH_KEY in GitHub Secrets"
echo ""
```

**📋 Copy the entire output (including BEGIN and END lines) for GitHub Secrets!**

---

## 🌐 Step 4: Configure Nginx

```bash
# Navigate to project directory
cd /var/www/cms-mobileinfohub

# Copy nginx configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/cms-mobileinfohub

# Edit nginx configuration
sudo nano /etc/nginx/sites-available/cms-mobileinfohub
```

**⚠️ IMPORTANT: Change `server_name cms.yourdomain.com;` to your actual domain!**

Press `Ctrl+X`, then `Y`, then `Enter` to save.

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/cms-mobileinfohub /etc/nginx/sites-enabled/

# Remove default nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# Enable nginx to start on boot
sudo systemctl enable nginx

# Check nginx status
sudo systemctl status nginx
```

---

## 🔥 Step 5: Configure Firewall

```bash
# Check firewall status
sudo ufw status

# If firewall is inactive, enable it
sudo ufw enable

# Allow SSH (important!)
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Or allow ports individually
# sudo ufw allow 80/tcp
# sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status verbose
```

---

## 📝 Step 6: Setup Environment File

```bash
# Navigate to project directory
cd /var/www/cms-mobileinfohub

# Create production environment file
cp env.production.example .env.production

# Edit environment file
nano .env.production
```

**Configure your API URL:**
```env
REACT_APP_API_BASE_URL=https://api.mobileinfohub.com/api
NODE_ENV=production
```

If your API is on the same VPS, change to:
```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

## 🚀 Step 7: First Deployment

```bash
# Navigate to project directory
cd /var/www/cms-mobileinfohub

# Run deployment script
bash deploy.sh
```

This will:
- Pull latest code
- Install dependencies
- Build React application
- Deploy to `/var/www/cms-mobileinfohub/html`
- Reload Nginx

**Wait for deployment to complete (3-5 minutes)**

---

## 🔒 Step 8: Setup SSL (HTTPS)

```bash
# Get SSL certificate
sudo certbot --nginx -d cms.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms (Y)
# - Share email with EFF (optional - Y or N)
# - Redirect HTTP to HTTPS (recommended - option 2)

# Certbot will automatically:
# - Get SSL certificate
# - Configure Nginx for HTTPS
# - Set up auto-renewal

# Test auto-renewal
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

---

## ✅ Step 9: Verify Installation

```bash
# Test website locally
curl -I http://localhost

# Test with your domain
curl -I http://api.mobileinfohub.com

# Check if files exist
ls -la /var/www/cms-mobileinfohub/html

# View nginx access log
sudo tail -f /var/log/nginx/cms-mobileinfohub.access.log

# View nginx error log
sudo tail -f /var/log/nginx/cms-mobileinfohub.error.log

# Check nginx status
sudo systemctl status nginx

# Check git status
cd /var/www/cms-mobileinfohub
git status
git log -1
```

---

## 🔧 GitHub Secrets Configuration

After generating SSH key, add these secrets to GitHub:

**Go to:** `https://github.com/shahadathossain4536/cms-mobileinfohub/settings/secrets/actions`

**Add these secrets:**

1. **VPS_HOST**
   - Value: Your VPS IP address (e.g., `123.456.78.90`)

2. **VPS_USERNAME**
   - Value: Your SSH username (usually `root` or your username)

3. **VPS_SSH_KEY**
   - Value: The private key from Step 3 (entire output including BEGIN/END lines)

---

## 🧪 Step 10: Test Auto-Deployment

```bash
# On your LOCAL machine (not VPS)
cd /Users/shahadathossain/Desktop/own/mobileinfohub-main/cms-mobileinfohub

# Make a small test change
echo "# Test auto-deploy" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deployment"
git push origin main
```

**Monitor deployment:**
1. Go to: `https://github.com/shahadathossain4536/cms-mobileinfohub/actions`
2. Watch the workflow run
3. Wait for ✅ green checkmark
4. Refresh your website

---

## 🔍 Useful Monitoring Commands

```bash
# Watch nginx access logs in real-time
sudo tail -f /var/log/nginx/cms-mobileinfohub.access.log

# Watch nginx error logs in real-time
sudo tail -f /var/log/nginx/cms-mobileinfohub.error.log

# Check deployment files
ls -lth /var/www/cms-mobileinfohub/html | head -20

# Check disk space
df -h

# Check memory usage
free -h

# Check nginx processes
ps aux | grep nginx

# Restart nginx if needed
sudo systemctl restart nginx
```

---

## 🆘 Troubleshooting Commands

### If website not loading:

```bash
# Check nginx status
sudo systemctl status nginx

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check if files exist
ls -la /var/www/cms-mobileinfohub/html/index.html

# Check permissions
sudo chown -R www-data:www-data /var/www/cms-mobileinfohub/html
sudo chmod -R 755 /var/www/cms-mobileinfohub/html
```

### If auto-deploy fails:

```bash
# Check git status
cd /var/www/cms-mobileinfohub
git status

# Check SSH access
ssh -i ~/.ssh/github_actions_cms_key $USER@localhost

# View deployment script
cat /var/www/cms-mobileinfohub/deploy.sh

# Run deployment manually
cd /var/www/cms-mobileinfohub
bash deploy.sh
```

### If build fails:

```bash
# Check Node.js version
node --version  # Should be v16 or higher

# Check npm
npm --version

# Try manual build
cd /var/www/cms-mobileinfohub
npm install --legacy-peer-deps
npm run build:prod

# Check build output
ls -la build/
```

---

## 📊 System Requirements

**Minimum:**
- 1 CPU core
- 1 GB RAM
- 10 GB disk space
- Ubuntu 20.04+ or Debian 10+

**Recommended:**
- 2 CPU cores
- 2 GB RAM
- 20 GB disk space
- Ubuntu 22.04 LTS

---

## 🎯 Quick Command Reference

```bash
# Deploy manually
cd /var/www/cms-mobileinfohub && bash deploy.sh

# Restart nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/cms-mobileinfohub.error.log

# Update code manually
cd /var/www/cms-mobileinfohub && git pull origin main

# Check certificate expiry
sudo certbot certificates

# Renew certificate manually
sudo certbot renew
```

---

## ✅ Setup Checklist

- [ ] Node.js, Nginx, Git installed
- [ ] Project cloned to `/var/www/cms-mobileinfohub`
- [ ] SSH key generated
- [ ] Nginx configured with your domain
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] `.env.production` created
- [ ] First deployment successful
- [ ] SSL certificate installed
- [ ] GitHub secrets configured
- [ ] Auto-deployment tested

---

**🎉 Setup Complete!**

Your CMS should now be:
- ✅ Accessible at `https://cms.yourdomain.com`
- ✅ Auto-deploying on push to main branch
- ✅ Secured with HTTPS
- ✅ Serving optimized production build

---

**Need Help?** See `DEPLOYMENT_SETUP.md` for detailed troubleshooting.

