# PHP-JS Backend (Laravel)

Backend API menggunakan Laravel 12 + Sanctum + MySQL.

## Prasyarat
- PHP >= 8.2
- Composer
- MySQL

## Cara Menjalankan
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Server akan berjalan di [http://localhost:8000](http://localhost:8000).

## Struktur Proyek
```
app/
├── Http/
│   ├── Controllers/Api/    # Controller API
│   └── Requests/           # Validasi form request
├── Models/                 # Model Eloquent
├── Repositories/           # Lapisan akses data
├── Services/               # Logika bisnis
└── Providers/              # Service provider (DI)
database/
└── migrations/             # Migrasi database
routes/
└── api.php                 # Route API
```

## Perintah Artisan Penting
| Perintah | Keterangan |
|----------|------------|
| `php artisan serve` | Jalankan server development |
| `php artisan migrate` | Jalankan migrasi database |
| `php artisan migrate:rollback` | Rollback migrasi terakhir |
| `php artisan make:model Nama -m` | Buat model + file migrasi |
| `php artisan make:controller Api/NamaController` | Buat controller API |
| `php artisan make:request NamaRequest` | Buat form request validasi |
| `php artisan tinker` | Buka REPL interaktif |

## Menambah Domain Baru
1. Buat model: `php artisan make:model NamaModel -m`
2. Buat repository di `app/Repositories/`
3. Buat service di `app/Services/`
4. Buat controller: `php artisan make:controller Api/NamaController`
5. Buat form request: `php artisan make:request CreateNamaRequest`
6. Tambah route di `routes/api.php`
7. Daftarkan binding di `app/Providers/AppServiceProvider.php`
