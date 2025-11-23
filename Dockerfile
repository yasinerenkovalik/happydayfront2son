server {
    listen 80;
    server_name _;

    # STATIC FILES
    root /usr/share/nginx/html;
    index index.html;

    # En kritik satır → MIME tipi yüklenmesi
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|mjs)$ {
        types { }
        default_type application/javascript;
        try_files $uri =404;
    }

    location ~* \.(css)$ {
        default_type text/css;
        try_files $uri =404;
    }
}
