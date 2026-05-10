<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Daftar Peserta - {{ $event->name }}</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #222; }
  h1 { font-size: 16px; margin: 0 0 2px 0; }
  .subtitle { font-size: 12px; color: #555; margin: 0 0 16px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #1e3a5f; color: #fff; padding: 7px 8px; text-align: left; font-size: 11px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .category-row td { background: #dbeafe; font-weight: bold; color: #1e40af; padding: 6px 8px; }
  .footer { margin-top: 20px; font-size: 10px; color: #999; }
</style>
</head>
<body>
  <h1>{{ $event->name }}</h1>
  <p class="subtitle">Daftar Peserta Terverifikasi &mdash; Dicetak pada {{ now()->format('d F Y, H:i') }} WIB</p>

  @php
    $currentCategoryId = null;
    $no = 0;
  @endphp

  <table>
    <thead>
      <tr>
        <th style="width:4%">No</th>
        <th style="width:13%">No. Reg</th>
        <th style="width:28%">Nama Atlet</th>
        <th style="width:22%">Kontingen</th>
        <th style="width:8%">Gender</th>
        <th style="width:8%">Seeding</th>
      </tr>
    </thead>
    <tbody>
      @forelse($registrations as $reg)
        @if($currentCategoryId !== $reg->category_id)
          @php $currentCategoryId = $reg->category_id; $no = 0; @endphp
          <tr class="category-row">
            <td colspan="6">{{ $reg->category?->name ?? 'Kategori Tidak Diketahui' }}</td>
          </tr>
        @endif
        @php $no++ @endphp
        <tr>
          <td>{{ $no }}</td>
          <td>{{ $reg->registration_number }}</td>
          <td>{{ $reg->athlete?->name ?? '-' }}</td>
          <td>{{ $reg->athlete?->contingent?->name ?? '-' }}</td>
          <td>{{ $reg->athlete?->gender === 'male' ? 'Putra' : 'Putri' }}</td>
          <td>{{ $reg->seeding ?? '-' }}</td>
        </tr>
      @empty
        <tr>
          <td colspan="6" style="text-align:center;color:#999;padding:20px">Belum ada peserta terverifikasi</td>
        </tr>
      @endforelse
    </tbody>
  </table>

  <p class="footer">Total: {{ $registrations->count() }} peserta &bull; {{ $event->location }}, {{ $event->city }}</p>
</body>
</html>
