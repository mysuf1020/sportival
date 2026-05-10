<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Sertifikat Juara - {{ $event->name }}</title>
<style>
  @page { margin: 0; size: A4 landscape; }
  body { font-family: DejaVu Sans, sans-serif; margin: 0; padding: 0; background: #fff; }

  .page {
    width: 297mm; height: 210mm;
    display: flex; align-items: center; justify-content: center;
    page-break-after: always;
    position: relative;
  }
  .page:last-child { page-break-after: auto; }

  .border-outer {
    position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
    border: 4px solid #1e3a5f;
  }
  .border-inner {
    position: absolute; top: 13mm; left: 13mm; right: 13mm; bottom: 13mm;
    border: 1.5px solid #c9a227;
  }

  .content {
    text-align: center;
    padding: 20mm 30mm;
    position: relative;
    z-index: 1;
  }

  .event-name  { font-size: 11pt; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4mm; }
  .title       { font-size: 28pt; font-weight: bold; color: #1e3a5f; letter-spacing: 3px; margin-bottom: 6mm; }
  .subtitle    { font-size: 10pt; color: #777; margin-bottom: 8mm; }
  .to-label    { font-size: 10pt; color: #888; }
  .recipient   { font-size: 22pt; font-weight: bold; color: #1e3a5f; border-bottom: 2px solid #c9a227; display: inline-block; padding-bottom: 2mm; margin: 3mm 0 6mm; }
  .contingent  { font-size: 11pt; color: #555; margin-bottom: 6mm; }
  .medal-badge {
    display: inline-block; padding: 3mm 10mm; border-radius: 20px;
    font-size: 14pt; font-weight: bold; margin-bottom: 6mm;
  }
  .gold   { background: #fef3c7; color: #92400e; border: 2px solid #f59e0b; }
  .silver { background: #f1f5f9; color: #374151; border: 2px solid #94a3b8; }
  .bronze { background: #fff7ed; color: #7c2d12; border: 2px solid #f97316; }

  .category   { font-size: 10pt; color: #666; margin-bottom: 10mm; }
  .event-date { font-size: 9pt; color: #888; margin-bottom: 10mm; }

  .signatures { display: flex; justify-content: space-between; margin-top: 8mm; padding: 0 15mm; }
  .sig-block  { text-align: center; }
  .sig-line   { width: 45mm; border-bottom: 1px solid #333; margin-bottom: 2mm; }
  .sig-name   { font-size: 8pt; color: #555; }
  .sig-title  { font-size: 7.5pt; color: #888; }
</style>
</head>
<body>
@foreach($winners as $w)
<div class="page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="content">
    <p class="event-name">{{ $event->name }}</p>
    <p class="title">SERTIFIKAT JUARA</p>
    <p class="subtitle">Diberikan kepada:</p>
    <p class="to-label">Nama Atlet</p>
    <p class="recipient">{{ $w['athlete_name'] }}</p>
    <p class="contingent">{{ $w['contingent_name'] }}</p>

    <div class="medal-badge {{ $w['medal'] }}">
      @if($w['medal'] === 'gold') JUARA I — Medali Emas
      @elseif($w['medal'] === 'silver') JUARA II — Medali Perak
      @else JUARA III — Medali Perunggu
      @endif
    </div>

    <p class="category">Kategori: {{ $w['category_name'] }}</p>
    <p class="event-date">
      {{ $event->location }}, {{ $event->city }} &bull;
      {{ \Carbon\Carbon::parse($event->event_start)->format('d F Y') }}
    </p>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <p class="sig-name">Ketua Panitia</p>
        <p class="sig-title">{{ $event->name }}</p>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <p class="sig-name">Ketua Dewan Juri</p>
        <p class="sig-title">{{ $event->name }}</p>
      </div>
    </div>
  </div>
</div>
@endforeach
</body>
</html>
