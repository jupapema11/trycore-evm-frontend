#!/bin/sh
set -e

API_URL="${API_URL:-http://localhost:5022/api}"
PORT="${PORT:-8080}"

mkdir -p /usr/share/nginx/html/assets/config
sed "s|__API_URL__|${API_URL}|g" /usr/share/nginx/html/assets/config/env.template.js \
  > /usr/share/nginx/html/assets/config/env.js

sed -i "s/listen 8080;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
