#!/bin/bash


# Store PROJECT_ID from metadata server for later use
export PROJECT_ID=$(curl -s "http://metadata.google.internal/computeMetadata/v1/project/project-id" -H "Metadata-Flavor: Google")


# Install logging monitor
curl -s "https://storage.googleapis.com/signals-agents/logging/google-fluentd-install.sh" | bash
service google-fluentd restart &


# Install dependencies from apt
apt-get update
apt-get install -yq ca-certificates git build-essential supervisor psmisc


# Install nodejs
mkdir -p /opt/nodejs
curl https://nodejs.org/dist/v16.14.0/node-v16.14.0-linux-x64.tar.gz | tar xvzf - -C /opt/nodejs --strip-components=1
ln -sf /opt/nodejs/bin/node /usr/bin/node
ln -sf /opt/nodejs/bin/npm /usr/bin/npm


# Get the application source code from the Google Cloud Storage bucket
mkdir -p /monolith-app
gsutil -m cp -r gs://monolith-store-$PROJECT_ID/monolith-to-microservices/monolith/* /monolith-app/


# Install app dependencies
cd /monolith-app/
npm install


# Create a nodeapp user. The application will run as this user
useradd -m -d /home/nodeapp nodeapp
chown -R nodeapp:nodeapp /monolith-app


# Configure supervisor to run the node app
cat >/etc/supervisor/conf.d/node-app.conf << EOF
[program:nodeapp]
directory=/monolith-app
command=npm start
autostart=true
autorestart=true
user=nodeapp
environment=HOME="/home/nodeapp",USER="nodeapp",NODE_ENV="production"
stdout_logfile=syslog
stderr_logfile=syslog
EOF


# Make sure supervisord is running
service supervisor start


# Use supervisorctl without sudo (it should run as root already in startup script)
supervisorctl reread
supervisorctl update


# Output status for logging
echo "Startup script completed, checking supervisor status:"
supervisorctl status nodeapp