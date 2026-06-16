# Usamos una imagen ligera de Nginx basada en Alpine Linux
FROM nginx:stable-alpine
COPY . /usr/share/nginx/html
# Render asigna un puerto dinámico mediante la variable de entorno $PORT.
# Modificamos la configuración de Nginx en tiempo de ejecución para escuchar en ese puerto.
# Si $PORT no está definido, fallará silenciosamente a 80.
CMD ["/bin/sh", "-c", "sed -i 's/listen  80;/listen '\"${PORT:-80}\"';/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]