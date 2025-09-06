#!/bin/bash

# BookMa Deployment Script for Ubuntu Homelab
# Usage: ./deploy.sh [docker|bare-metal]

set -e

DEPLOY_TYPE=${1:-docker}
APP_DIR="/opt/bookma"
SERVICE_USER="www-data"

echo "🚀 Deploying BookMa using $DEPLOY_TYPE method..."

# Create application directory
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy files (assuming you're running this from the project directory)
echo "📁 Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

if [ "$DEPLOY_TYPE" = "docker" ]; then
    echo "🐳 Docker deployment..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        echo "Please log out and back in for Docker permissions to take effect"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Build and run with Docker Compose
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build
    
    echo "✅ BookMa deployed with Docker!"
    echo "🌐 Access at: http://$(hostname -I | awk '{print $1}'):3000"
    
elif [ "$DEPLOY_TYPE" = "bare-metal" ]; then
    echo "🖥️  Bare metal deployment..."
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install dependencies and build
    echo "📦 Installing dependencies..."
    npm ci --only=production
    npm run build
    
    # Create data directory
    mkdir -p data
    
    # Install systemd service
    echo "⚙️  Setting up systemd service..."
    sudo cp bookma.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable bookma
    sudo systemctl restart bookma
    
    echo "✅ BookMa deployed as systemd service!"
    echo "🔍 Check status: sudo systemctl status bookma"
    echo "🌐 Access at: http://$(hostname -I | awk '{print $1}'):3000"
fi

echo ""
echo "🎉 Deployment complete!"
echo "📝 Your bookmarks will be stored in: $APP_DIR/data/"
echo "🔧 To update, run this script again"
