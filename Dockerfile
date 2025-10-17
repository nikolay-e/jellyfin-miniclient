FROM nginx:alpine

# Copy the music player to nginx html directory
COPY music-player.html /usr/share/nginx/html/index.html

# Create music directory for mounted samples
RUN mkdir -p /usr/share/nginx/html/music

# Create nginx configuration to serve files properly
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '        index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Serve music directory with JSON directory listing' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /music/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        alias /usr/share/nginx/html/music/;' >> /etc/nginx/conf.d/default.conf && \
    echo '        autoindex on;' >> /etc/nginx/conf.d/default.conf && \
    echo '        autoindex_format json;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Enable CORS for audio files' >> /etc/nginx/conf.d/default.conf && \
    echo '    location ~* \.(mp3|wav|ogg)$ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Origin *;' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Methods "GET, OPTIONS";' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Headers "Range";' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
