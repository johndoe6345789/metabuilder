#!/bin/sh
set -e

# Update icecast passwords from environment
ICECAST_CFG="/etc/icecast2/icecast.xml"
if [ -n "$ICECAST_SOURCE_PASSWORD" ]; then
  sed -i "s|<source-password>.*</source-password>|<source-password>${ICECAST_SOURCE_PASSWORD}</source-password>|" "$ICECAST_CFG"
fi
if [ -n "$ICECAST_ADMIN_PASSWORD" ]; then
  sed -i "s|<admin-password>.*</admin-password>|<admin-password>${ICECAST_ADMIN_PASSWORD}</admin-password>|" "$ICECAST_CFG"
fi
if [ -n "$ICECAST_RELAY_PASSWORD" ]; then
  sed -i "s|<relay-password>.*</relay-password>|<relay-password>${ICECAST_RELAY_PASSWORD}</relay-password>|" "$ICECAST_CFG"
fi
if [ -n "$ICECAST_HOSTNAME" ]; then
  sed -i "s|<hostname>.*</hostname>|<hostname>${ICECAST_HOSTNAME}</hostname>|" "$ICECAST_CFG"
fi
if [ -n "$ICECAST_MAX_CLIENTS" ]; then
  sed -i "s|<clients>.*</clients>|<clients>${ICECAST_MAX_CLIENTS}</clients>|" "$ICECAST_CFG"
fi
if [ -n "$ICECAST_MAX_SOURCES" ]; then
  sed -i "s|<sources>.*</sources>|<sources>${ICECAST_MAX_SOURCES}</sources>|" "$ICECAST_CFG"
fi

# Start icecast in background
echo "Starting icecast2..."
icecast2 -c "$ICECAST_CFG" -b

# Start media daemon in foreground
echo "Starting media_daemon..."
exec media_daemon --config /etc/media-daemon/config.yaml "$@"
