FROM php:8.3-fpm-alpine

WORKDIR /var/www

RUN apk add --no-cache \
    zip unzip git curl \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    && docker-php-ext-install pdo pdo_mysql gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .
RUN composer install --no-dev --optimize-autoloader

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
