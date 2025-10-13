#!/bin/bash

# ====================================
# Auto-deploy script for cms-mobileinfohub
# React Frontend Application
# ====================================

echo "🚀 Starting deployment for MobileInfoHub CMS..."
echo "================================================"

# Store the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in a git repository
if [ ! -d .git ]; then
    print_error "Not a git repository. Please ensure this is a git project."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
print_status "Current branch: $CURRENT_BRANCH"

# Fetch latest changes
echo ""
echo "📥 Fetching latest changes from remote..."
if git fetch origin main; then
    print_status "Fetch completed successfully"
else
    print_error "Failed to fetch from remote"
    exit 1
fi

# Check if there are changes
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    print_warning "Already up to date. No deployment needed."
    echo ""
    print_status "CMS is running and up to date"
    exit 0
fi

# Pull latest changes
echo ""
echo "📥 Pulling latest changes from main branch..."
if git reset --hard origin/main; then
    print_status "Pull completed successfully"
else
    print_error "Failed to pull latest changes"
    exit 1
fi

# Install/update dependencies
echo ""
echo "📦 Installing dependencies..."
if npm install --legacy-peer-deps; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_warning ".env.production file not found. Creating from example..."
    if [ -f .env.example ]; then
        cp .env.example .env.production
        print_warning "Please edit .env.production with your production settings:"
        echo "  nano .env.production"
    else
        print_error "No .env.example file found. Please create .env.production manually."
    fi
fi

# Build the React application
echo ""
echo "🔨 Building React application..."
if npm run build:prod; then
    print_status "Build completed successfully"
else
    print_error "Failed to build application"
    exit 1
fi

# Check if build directory exists
if [ ! -d "build" ]; then
    print_error "Build directory not found. Build may have failed."
    exit 1
fi

# Create deployment directory if it doesn't exist
DEPLOY_DIR="/var/www/cms-mobileinfohub"
if [ ! -d "$DEPLOY_DIR" ]; then
    print_warning "Deployment directory doesn't exist. Creating..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown -R $USER:$USER "$DEPLOY_DIR"
fi

# Backup old build (optional)
if [ -d "$DEPLOY_DIR/html" ]; then
    echo ""
    echo "📦 Backing up previous build..."
    BACKUP_DIR="$DEPLOY_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    sudo mv "$DEPLOY_DIR/html" "$BACKUP_DIR"
    print_status "Previous build backed up to: $BACKUP_DIR"
    
    # Keep only last 3 backups
    BACKUP_COUNT=$(ls -d $DEPLOY_DIR/backup_* 2>/dev/null | wc -l)
    if [ $BACKUP_COUNT -gt 3 ]; then
        ls -dt $DEPLOY_DIR/backup_* | tail -n +4 | xargs sudo rm -rf
        print_status "Old backups cleaned up"
    fi
fi

# Deploy the build
echo ""
echo "🚀 Deploying to production..."
sudo mkdir -p "$DEPLOY_DIR/html"
sudo cp -r build/* "$DEPLOY_DIR/html/"
sudo chown -R www-data:www-data "$DEPLOY_DIR/html"
print_status "Files deployed successfully"

# Reload nginx
echo ""
echo "🔄 Reloading Nginx..."
if sudo nginx -t; then
    if sudo systemctl reload nginx; then
        print_status "Nginx reloaded successfully"
    else
        print_warning "Failed to reload Nginx. You may need to do this manually:"
        echo "  sudo systemctl reload nginx"
    fi
else
    print_error "Nginx configuration test failed. Please check your nginx config."
fi

# Show deployment summary
echo ""
echo "================================================"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "================================================"
echo ""
echo "📊 Deployment Details:"
echo "  - Deployed to: $DEPLOY_DIR/html"
echo "  - Build size: $(du -sh $DEPLOY_DIR/html | cut -f1)"
echo "  - Files deployed: $(find $DEPLOY_DIR/html -type f | wc -l) files"
echo ""

# Show last commit info
echo "📌 Deployed commit:"
git log -1 --pretty=format:"%h - %s (%ar by %an)" && echo ""
echo ""

# Test the deployment
echo "🔍 Testing deployment..."
if [ -f "$DEPLOY_DIR/html/index.html" ]; then
    print_status "index.html exists"
else
    print_error "index.html not found. Deployment may have issues."
fi

if [ -d "$DEPLOY_DIR/html/static" ]; then
    print_status "static assets directory exists"
fi

echo ""
print_status "Deployment completed at $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "🌐 Your CMS should now be live at your domain!"
echo "   Visit: http://cms.mobileinfohub.com (or your configured domain)"
echo ""

