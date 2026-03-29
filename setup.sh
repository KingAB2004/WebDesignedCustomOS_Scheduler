set -e 

echo " Starting Full-Stack Zero-to-Hero Deployment..."


echo " Installing Linux packages and Node.js..."
sudo apt update
echo " Installing C++ build tools and utilities..."
sudo apt install -y build-essential libsqlite3-dev sqlite3 xdg-utils libnotify-bin wget curl

echo " Installing official Node.js & NPM via NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install -y nodejs
ROOT_DIR=$(pwd)


echo " Building the React UI..."
cd "$ROOT_DIR/frontend"

npm install
npm run build 

echo "Frontend compiled successfully."


echo " Setting up the C++ Backend..."
cd "$ROOT_DIR/backend"

if [ ! -f "crow_all.h" ]; then
    echo " Downloading Crow Framework..."
    wget -qO - https://github.com/CrowCpp/Crow/releases/download/v1.0+5/crow_all.h > crow_all.h
fi

echo " Initializing SQLite Database..."
sqlite3 scheduler.db <<EOF
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    priority INTEGER DEFAULT 3,
    delay_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
EOF

echo "🔨 Compiling C++ Worker Daemon..."
g++ worker_daemon.cpp -o worker_daemon -lpthread -lsqlite3

echo "🔨 Compiling C++ API Server..."
g++ api_server.cpp -o api_server -lpthread -lsqlite3


echo "🔌 Wiring into Systemd..."
SERVICE_DIR="$HOME/.config/systemd/user"
mkdir -p "$SERVICE_DIR"

cat <<EOF > "$SERVICE_DIR/os-dashboard-worker.service"
[Unit]
Description=OS Dashboard Background Worker
After=network.target

[Service]
Type=simple
ExecStart=$ROOT_DIR/backend/worker_daemon
WorkingDirectory=$ROOT_DIR/backend
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF

cat <<EOF > "$SERVICE_DIR/os-dashboard-api.service"
[Unit]
Description=OS Dashboard API Server
After=network.target

[Service]
Type=simple
ExecStart=$ROOT_DIR/backend/api_server
WorkingDirectory=$ROOT_DIR/backend
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF


echo " Reloading Systemd..."
systemctl --user daemon-reload

echo " Starting services..."
systemctl --user enable --now os-dashboard-worker.service
systemctl --user enable --now os-dashboard-api.service

echo " FULL-STACK DEPLOYMENT COMPLETE!"
echo "------------------------------------------------"
echo "Your backend and worker are running in the background."