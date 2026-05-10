# PHP-JS Frontend

Frontend menggunakan Next.js 16 + Bun + Tailwind CSS v4 + Jotai + TanStack Query.

## Prasyarat
- Bun (package manager)

## Cara Menjalankan
```bash
cp .env.example .env.local
bun install
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Struktur Proyek
```
src/
├── app/
│   ├── (authorized)/        # Halaman yang butuh login (layout sidebar)
│   │   └── dashboard/       # Halaman dashboard
│   ├── login/               # Halaman login
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Redirect ke dashboard
│   └── providers.tsx        # Provider (TanStack Query + Jotai)
├── components/
│   └── ui/                  # Komponen shadcn/ui
├── lib/
│   ├── apis/                # Modul API per domain
│   ├── constants/           # Konstanta aplikasi
│   ├── form-schema/         # Validasi form (Zod)
│   ├── helper/              # Fungsi utilitas umum
│   ├── hooks/               # Custom hooks (TanStack Query)
│   ├── http-request/        # Axios instance + interceptors
│   ├── models/              # TypeScript interface/type
│   ├── stores/              # State management (Jotai atoms)
│   └── utils.ts             # Utility cn() untuk Tailwind
└── middleware.ts            # Next.js middleware (proteksi route)
```

## Menambah shadcn/ui Component
```bash
bunx shadcn@latest add button
bunx shadcn@latest add input
bunx shadcn@latest add dialog
```

## Menambah Domain Baru
1. Buat interface di `lib/models/[nama].ts`
2. Buat API functions di `lib/apis/[nama]/index.ts`
3. Buat Jotai atoms di `lib/stores/[nama]-store.ts`
4. Buat hooks di `lib/hooks/use-[nama].ts`
5. Buat form schema di `lib/form-schema/[nama].ts`
