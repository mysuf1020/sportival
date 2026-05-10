<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Sertifikat Peserta - {{ $event->name }}</title>
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
    border: 3px solid #2563eb;
  }
  .border-inner {
    position: absolute; top: 13mm; left: 13mm; right: 13mm; bottom: 13mm;
    border: 1px solid #93c5fd;
  }

  .content {
    text-align: center;
    padding: 20mm 30mm;
    position: relative; z-index: 1;
  }

  .event-name  { font-size: 11pt; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4mm; }
  .title       { font-size: 26pt; font-weight: bold; color: #1d4ed8; letter-spacing: 3px; margin-bottom: 4mm; }
  .subtitle    { font-size: 10pt; color: #777; margin-bottom: 8mm; }
  .to-label    { font-size: 10pt; color: #888; }
  .recipient   { font-size: 22pt; font-weight: bold; color: #1e3a5f; border-bottom: 2px solid #3b82f6; display: inline-block; padding-bottom: 2mm; margin: 3mm 0 5mm; }
  .contingent  { font-size: 11pt; color: #555; margin-bottom: 5mm; }
  .reg-number  { font-size: 9pt; color: #999; margin-bottom: 4mm; }
  .category    { font-size: 10pt; color: #444; font-weight: bold; margin-bottom: 4mm; }
  .desc        { font-size: 9pt; color: #777; line-height: 1.5; margin-bottom: 8mm; }
  .event-date  { font-size: 9pt; color: #888; margin-bottom: 10mm; }

  .signatures { display: flex; justify-content: space-between; margin-top: 6mm; padding: 0 15mm; }
  .sig-block  { text-align: center; }
  .sig-line   { width: 45mm; border-bottom: 1px solid #333; margin-bottom: 2mm; }
  .sig-name   { font-size: 8pt; color: #555; }
  .sig-title  { font-size: 7.5pt; color: #888; }
</style>
</head>
<body>
@foreach($registrations as $reg)
<div class="page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="content">
    <p class="event-name">{{ $event->name }}</p>
    <p class="title">SERTIFIKAT PESERTA</p>
    <p class="subtitle">Diberikan kepada:</p>
    <p class="to-label">Nama Atlet</p>
    <p class="recipient">{{ $reg->athlete?->name }}</p>
    <p class="contingent">{{ $reg->athlete?->contingent?->name }}</p>
    <p class="reg-number">No. Registrasi: {{ $reg->registration_number }}</p>
    <p class="category">Kategori: {{ $reg->category?->name }}</p>
    <p class="desc">
      Telah berpartisipasi sebagai peserta dalam kegiatan<br>
      <strong>{{ $event->name }}</strong>
    </p>
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
        <p class="sig-name">Sekretaris</p>
        <p class="sig-title">{{ $event->name }}</p>
      </div>
    </div>
  </div>
</div>
@endforeach
</body>
</html>
