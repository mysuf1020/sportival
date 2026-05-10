<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Perolehan Medali - {{ $event->name }}</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; }
  h1 { font-size: 16px; margin: 0 0 2px 0; }
  .subtitle { font-size: 12px; color: #555; margin: 0 0 16px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: center; font-size: 12px; }
  th.left { text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; }
  td.left { text-align: left; }
  .rank-1 td { background: #fef9c3; font-weight: bold; }
  .rank-2 td { background: #f1f5f9; font-weight: bold; }
  .rank-3 td { background: #fff7ed; font-weight: bold; }
  .gold   { color: #b45309; font-weight: bold; }
  .silver { color: #6b7280; font-weight: bold; }
  .bronze { color: #92400e; font-weight: bold; }
  .footer { margin-top: 20px; font-size: 10px; color: #999; }
</style>
</head>
<body>
  <h1>{{ $event->name }}</h1>
  <p class="subtitle">Perolehan Medali &mdash; Dicetak pada {{ now()->format('d F Y, H:i') }} WIB</p>

  <table>
    <thead>
      <tr>
        <th style="width:8%">Rank</th>
        <th class="left" style="width:42%">Kontingen</th>
        <th style="width:12%">Emas</th>
        <th style="width:12%">Perak</th>
        <th style="width:12%">Perunggu</th>
        <th style="width:14%">Total</th>
      </tr>
    </thead>
    <tbody>
      @forelse($standings as $s)
      <tr @if($s->rank === 1) class="rank-1" @elseif($s->rank === 2) class="rank-2" @elseif($s->rank === 3) class="rank-3" @endif>
        <td>{{ $s->rank ?? '-' }}</td>
        <td class="left">{{ $s->contingent?->name ?? '-' }}</td>
        <td class="gold">{{ $s->gold }}</td>
        <td class="silver">{{ $s->silver }}</td>
        <td class="bronze">{{ $s->bronze }}</td>
        <td>{{ $s->total_medals }}</td>
      </tr>
      @empty
      <tr>
        <td colspan="6" style="text-align:center;color:#999;padding:20px">Belum ada data medali</td>
      </tr>
      @endforelse
    </tbody>
  </table>

  <p class="footer">{{ $event->location }}, {{ $event->city }}</p>
</body>
</html>
