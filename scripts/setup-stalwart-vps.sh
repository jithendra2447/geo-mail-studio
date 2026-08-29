#!/usr/bin/env bash
# ==============================================================================
# GEO Mail Studio - Dedicated Stalwart SMTP Mail Server Automated Installer
# Run this on a clean Ubuntu 22.04 / 24.04 LTS VPS (Hetzner, DigitalOcean, Vultr)
# Usage: sudo bash setup-stalwart-vps.sh geonixa.com
# ==============================================================================

set -e

DOMAIN=${1:-"geonixa.com"}
STALWART_VERSION="v0.8.0"

echo "🚀 Starting Automated Dedicated SMTP Mail Server Installation for: $DOMAIN"

# 1. Update OS packages
apt-get update && apt-get upgrade -y
apt-get install -y curl wget unzip ufw certbot

# 2. Configure Firewall (Open SMTP 25, 465, 587 + Web Admin 8080)
ufw allow 22/tcp
ufw allow 25/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 465/tcp
ufw allow 587/tcp
ufw allow 8080/tcp
ufw --force enable

# 3. Download & Install Stalwart All-In-One Mail Server
echo "📦 Downloading Stalwart Mail Server..."
mkdir -p /opt/stalwart
cd /opt/stalwart

curl -sSL "https://github.com/stalwartlabs/mail-server/releases/download/${STALWART_VERSION}/stalwart-mail-server-x86_64-unknown-linux-musl.tar.gz" | tar -xz

# 4. Create Systemd Service for Stalwart
cat <<EOF > /etc/systemd/system/stalwart.service
[Unit]
Description=Stalwart Mail Server Dedicated SMTP Engine
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/stalwart
ExecStart=/opt/stalwart/stalwart-mail-server --config=/opt/stalwart/etc/config.toml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable stalwart
systemctl start stalwart

echo "=============================================================================="
echo "🎉 SUCCESS! Dedicated Stalwart SMTP Mail Server installed & running!"
echo "=============================================================================="
echo "🌐 Web Admin Dashboard: http://$(hostname -I | awk '{print $1}'):8080"
echo "🔑 Add this VPS IP into GEO Mail Studio's 'Sender Accounts Pool' as your dedicated SMTP!"
echo "=============================================================================="
