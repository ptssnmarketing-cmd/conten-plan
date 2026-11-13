/**
 * CONTENT PLAN HUB — Report Harian otomatis ke WhatsApp
 * Google Apps Script (gratis) + Firestore REST API (gratis, Spark plan) + Fonnte (ada paket gratis)
 *
 * Tanpa Cloud Functions, tanpa upgrade Blaze.
 * Cara pasang lengkap ada di PANDUAN-WA.md
 */

var VERSI_KODE = 'v28';

// ====================== KONFIGURASI ======================
// Semua nilai rahasia diisi lewat Project Settings -> Script Properties.
//
//   SA_JSON       = SELURUH isi file kunci .json dari Google Cloud (tempel utuh, jangan dipecah)
//   FONNTE_TOKEN  = token device dari dashboard Fonnte
//   WEB_TOKEN     = kata sandi bebas, samakan dengan "Token Keamanan" di menu Admin aplikasi
//   DRY_RUN       = true  -> pesan hanya dicatat di log, tidak dikirim
//                   false -> benar-benar dikirim
//
// (Cara lama dengan PROJECT_ID + SA_EMAIL + SA_KEY terpisah tetap didukung.)

function bersih_(s) {
  if (s === null || s === undefined) return '';
  s = String(s).trim();
  if (s.charAt(s.length - 1) === ',') s = s.slice(0, -1).trim();
  if ((s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') ||
      (s.charAt(0) === "'" && s.charAt(s.length - 1) === "'")) s = s.slice(1, -1);
  return s.trim();
}

function bacaKunciJson_(teks) {
  if (!teks) return null;
  var t = String(teks).trim();
  var a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { return null; }
}

function CFG() {
  var P = PropertiesService.getScriptProperties();
  var j = bacaKunciJson_(P.getProperty('SA_JSON'));
  var projectId = (j && j.project_id) || bersih_(P.getProperty('PROJECT_ID'));
  var saEmail   = (j && j.client_email) || bersih_(P.getProperty('SA_EMAIL'));
  var saKey     = (j && j.private_key) || bersih_(P.getProperty('SA_KEY'));
  return {
    PROJECT_ID:   projectId || '',
    SA_EMAIL:     saEmail || '',
    SA_KEY:       saKey || '',
    SUMBER_KUNCI: j ? 'SA_JSON' : (saEmail ? 'SA_EMAIL/SA_KEY' : 'KOSONG'),
    FONNTE_TOKEN: bersih_(P.getProperty('FONNTE_TOKEN')),
    WEB_TOKEN:    bersih_(P.getProperty('WEB_TOKEN')),
    DRY_RUN:      bersih_(P.getProperty('DRY_RUN') || 'true').toLowerCase() !== 'false'
  };
}

/**
 * LANGKAH PERTAMA SETELAH MENGISI SCRIPT PROPERTIES.
 * Memeriksa pengaturan tanpa menampilkan isi kunci rahasia. Aman dibagikan.
 */
function periksa() {
  var P = PropertiesService.getScriptProperties().getProperties();
  Logger.log('Versi kode   : %s  (kalau baris ini tidak muncul, kode lama masih terpasang)', VERSI_KODE);
  Logger.log('=== PROPERTY YANG TERSIMPAN ===');
  Object.keys(P).forEach(function (k) { Logger.log('  [%s]  (%s karakter)', k, String(P[k]).length); });

  var raw = P['SA_JSON'];
  if (raw !== undefined && !bacaKunciJson_(raw)) {
    Logger.log('!! SA_JSON ada tapi BUKAN JSON yang valid. Tempel ulang SELURUH isi file .json, dari { sampai }.');
  }

  var c = CFG();
  var masalah = [];
  Logger.log('=== HASIL BACA ===');
  Logger.log('Sumber kunci : %s', c.SUMBER_KUNCI);
  Logger.log('PROJECT_ID   : [%s]', c.PROJECT_ID);
  Logger.log('SA_EMAIL     : [%s]', c.SA_EMAIL);
  Logger.log('SA_KEY       : %s karakter, BEGIN=%s, END=%s', c.SA_KEY.length,
    c.SA_KEY.indexOf('BEGIN PRIVATE KEY') >= 0, c.SA_KEY.indexOf('END PRIVATE KEY') >= 0);
  Logger.log('FONNTE_TOKEN : %s', c.FONNTE_TOKEN ? 'terisi (' + c.FONNTE_TOKEN.length + ' karakter)' : 'KOSONG');
  Logger.log('WEB_TOKEN    : %s', c.WEB_TOKEN ? 'terisi' : 'kosong (web app bisa dipicu siapa saja yang tahu URL-nya)');
  Logger.log('DRY_RUN      : %s', c.DRY_RUN ? 'true (mode aman, tidak mengirim)' : 'false (BENAR-BENAR MENGIRIM)');

  if (c.SUMBER_KUNCI === 'KOSONG') masalah.push('Kunci belum diisi. Tambahkan property SA_JSON.');
  if (c.PROJECT_ID && c.PROJECT_ID !== 'konten-plan') masalah.push('PROJECT_ID bukan konten-plan. Kunci dibuat di project yang salah.');
  if (c.SA_EMAIL && !/\.iam\.gserviceaccount\.com$/.test(c.SA_EMAIL)) masalah.push('SA_EMAIL tidak berakhiran .iam.gserviceaccount.com');
  if (c.SA_KEY && (c.SA_KEY.indexOf('BEGIN PRIVATE KEY') < 0 || c.SA_KEY.indexOf('END PRIVATE KEY') < 0)) masalah.push('Kunci privat terpotong.');
  if (!c.FONNTE_TOKEN) masalah.push('FONNTE_TOKEN belum diisi (boleh ditunda sampai Langkah 6).');

  if (c.SA_KEY) {
    var pem = rapikanPem_(c.SA_KEY);
    if (!pem) masalah.push('Kunci privat tidak bisa dibaca. Tempel ulang SELURUH isi file .json ke SA_JSON.');
    else {
      try { Utilities.computeRsaSha256Signature('uji', pem); Logger.log('Uji kunci    : OK, kunci bisa dipakai menandatangani'); }
      catch (e) { masalah.push('Kunci privat rusak (' + e.message + '). Buat kunci baru atau tempel ulang SA_JSON.'); }
    }
  }
  Logger.log('=== KESIMPULAN ===');
  if (!masalah.length) Logger.log('Pengaturan terlihat benar. Lanjut jalankan tesKoneksi.');
  else masalah.forEach(function (m) { Logger.log('- %s', m); });
}

var ROLES = {
  admin:'Admin', manager:'Manager', supervisor:'Supervisor',
  copywriter:'Copywriter', content_creator:'Content Creator', designer:'Designer'
};

// ====================== FUNGSI UTAMA ======================
/**
 * ENDPOINT WEB APP — dipanggil dari menu Admin aplikasi.
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me   |   Who has access: Anyone
 * Salin URL /exec-nya ke menu Admin > Kirim Otomatis Setiap Pagi.
 *
 * ?aksi=tes      -> jalankan pengiriman sekarang (hormati DRY_RUN)
 * ?aksi=kirim    -> sama dengan tes, dipakai kalau DRY_RUN sudah false
 * ?aksi=jadwal&jam=08:00 -> pasang ulang trigger harian pada jam tersebut
 * ?aksi=status   -> cek koneksi tanpa mengirim apa pun
 */
function doGet(e) {
  var cfg = CFG();
  var q = (e && e.parameter) || {};
  var aksi = q.aksi || 'status';

  if (cfg.WEB_TOKEN && q.token !== cfg.WEB_TOKEN) {
    return keluar_('TOLAK: token keamanan tidak cocok.');
  }
  try {
    if (aksi === 'jadwal') {
      var jam = parseInt(String(q.jam || '08:00').split(':')[0], 10);
      if (isNaN(jam) || jam < 0 || jam > 23) jam = 8;
      pasangTriggerJam_(jam);
      return keluar_('OK: jadwal harian dipasang jam ' + jam + ':00 WIB.');
    }
    if (aksi === 'status') {
      var token = getAccessToken_(cfg);
      var u = fsList_(cfg, token, 'users');
      var p = fsList_(cfg, token, 'contentPlans');
      return keluar_('OK: terhubung. ' + u.length + ' user, ' + p.length + ' konten. DRY_RUN=' + cfg.DRY_RUN);
    }
    var hasil = kirimReportHarian();
    return keluar_('OK: ' + hasil + (cfg.DRY_RUN ? ' (DRY_RUN aktif, pesan tidak benar-benar dikirim)' : ''));
  } catch (err) {
    return keluar_('GAGAL: ' + (err && err.message ? err.message : err));
  }
}
function keluar_(teks) {
  return ContentService.createTextOutput(teks).setMimeType(ContentService.MimeType.TEXT);
}

/** Jalankan ini manual sekali untuk tes, lalu pasang trigger harian. */
function kirimReportHarian() {
  var cfg = CFG();
  var token = getAccessToken_(cfg);
  var users = fsList_(cfg, token, 'users');
  var plans = fsList_(cfg, token, 'contentPlans');

  Logger.log('User: %s | Konten: %s', users.length, plans.length);

  var setting = bacaPengaturan_(cfg, token);

  var terkirim = 0, dilewati = 0;
  users.forEach(function (u) {
    if (!u.wa) { dilewati++; Logger.log('Lewati %s — nomor WA kosong', u.nama); return; }
    var t = tasksFor_(plans, u.role);
    if (t.sudah.length + t.belum.length === 0) { dilewati++; return; }
    var pesan = buildPesan_(u, t);
    if (cfg.DRY_RUN) { Logger.log('[DRY RUN] ke %s (%s):\n%s', u.nama, u.wa, pesan); terkirim++; return; }
    var ok = kirimFonnte_(cfg, u.wa, pesan);
    if (ok) terkirim++; else dilewati++;
    Utilities.sleep(1200); // jeda supaya tidak kena rate limit gateway
  });
  // Ringkasan seluruh tim ke satu nomor / grup, kalau diisi di menu Admin
  if (setting.targetWa) {
    var ringkas = buildPesanTim_(users, plans);
    if (cfg.DRY_RUN) Logger.log('[DRY RUN] ke grup %s:\n%s', setting.targetWa, ringkas);
    else { kirimFonnte_(cfg, setting.targetWa, ringkas); terkirim++; }
  }

  Logger.log('Selesai. Terkirim: %s, dilewati: %s', terkirim, dilewati);
  return 'terkirim ' + terkirim + ', dilewati ' + dilewati;
}

/** Baca dokumen pengaturan/wa dari Firestore (diisi lewat menu Admin aplikasi). */
function bacaPengaturan_(cfg, token) {
  try {
    var url = 'https://firestore.googleapis.com/v1/projects/' + cfg.PROJECT_ID +
      '/databases/(default)/documents/pengaturan/wa';
    var res = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) return {};
    return decode_(JSON.parse(res.getContentText()).fields || {});
  } catch (e) { return {}; }
}

/** Ringkasan seluruh tim untuk dikirim ke grup. */
function buildPesanTim_(users, plans) {
  var tglTeks = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'EEEE, d MMMM yyyy');
  var s = '*RINGKASAN TIM — CONTENT PLAN HUB*\n_' + tglTeks + '_\n\n';
  var totalBelum = 0;
  users.forEach(function (u) {
    var t = tasksFor_(plans, u.role);
    var total = t.sudah.length + t.belum.length;
    if (!total) return;
    totalBelum += t.belum.length;
    var pct = Math.round(t.sudah.length / total * 100);
    s += '• *' + u.nama + '* (' + (ROLES[u.role] || u.role) + ') — ' +
         t.sudah.length + '/' + total + ' (' + pct + '%)' +
         (t.belum.length ? ', sisa ' + t.belum.length : ', tuntas') + '\n';
  });
  s += '\nTotal tugas belum selesai: *' + totalBelum + '*\nDetailnya ada di aplikasi.';
  return s;
}

/** Pasang trigger harian pada jam tertentu (dipakai oleh ?aksi=jadwal). */
function pasangTriggerJam_(jam) {
  hapusTrigger();
  ScriptApp.newTrigger('kirimReportHarian')
    .timeBased().atHour(jam).nearMinute(0)
    .inTimezone('Asia/Jakarta')
    .everyDays(1).create();
}

/** Pasang trigger otomatis setiap hari jam 08.00 WIB. Jalankan sekali saja. */
function pasangTriggerHarian() {
  pasangTriggerJam_(8);
  Logger.log('Trigger harian 08.00 WIB dipasang.');
}

function hapusTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'kirimReportHarian') ScriptApp.deleteTrigger(t);
  });
}

/** Cek koneksi Firestore tanpa mengirim WA apa pun. */
function tesKoneksi() {
  var cfg = CFG();
  var token = getAccessToken_(cfg);
  var users = fsList_(cfg, token, 'users');
  var plans = fsList_(cfg, token, 'contentPlans');
  Logger.log('OK. %s user, %s konten.', users.length, plans.length);
  users.forEach(function (u) {
    var t = tasksFor_(plans, u.role);
    Logger.log('- %s (%s) wa=%s | belum %s, sudah %s',
      u.nama, u.role, u.wa || 'KOSONG', t.belum.length, t.sudah.length);
  });
}

// ====================== AUTH FIRESTORE ======================
/** Membentuk ulang kunci PEM: menerima \\n literal, baris hilang, atau spasi berlebih. */
function rapikanPem_(k) {
  if (!k) return '';
  var s = String(k).replace(/\\n/g, '\n').replace(/\r/g, '');
  var m = s.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
  if (!m) return '';
  var isi = m[1].replace(/[^A-Za-z0-9+\/=]/g, '');
  if (isi.length < 100) return '';
  var baris = isi.match(/.{1,64}/g).join('\n');
  return '-----BEGIN PRIVATE KEY-----\n' + baris + '\n-----END PRIVATE KEY-----\n';
}

function getAccessToken_(cfg) {
  var now = Math.floor(Date.now() / 1000);
  var header = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  var claim = Utilities.base64EncodeWebSafe(JSON.stringify({
    iss: cfg.SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3500,
    iat: now
  }));
  var unsigned = header + '.' + claim;
  var kunci = rapikanPem_(cfg.SA_KEY);
  if (!kunci) {
    throw new Error('Kunci privat tidak terbaca (sumber: ' + cfg.SUMBER_KUNCI + '). ' +
      'Jalankan fungsi periksa. Biasanya SA_JSON belum tersimpan, salah nama, atau hanya tertempel sebagian.');
  }
  if (!cfg.SA_EMAIL) throw new Error('Email service account kosong. Jalankan fungsi periksa.');
  var sig;
  try {
    sig = Utilities.computeRsaSha256Signature(unsigned, kunci);
  } catch (e) {
    throw new Error('Kunci privat ditolak Google (' + e.message + '). ' +
      'Isi SA_JSON rusak. Buka file .json di Notepad, Ctrl+A, Ctrl+C, tempel ulang ke SA_JSON, lalu Save script properties.');
  }
  var jwt = unsigned + '.' + Utilities.base64EncodeWebSafe(sig);

  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt },
    muteHttpExceptions: true
  });
  var body = JSON.parse(res.getContentText());
  if (!body.access_token) {
    var d = (body.error_description || '') + '';
    var saran = /account not found/i.test(d)
      ? ' -> Service account tidak dikenali. Kunci ini sudah dihapus, atau SA_JSON berasal dari project lain. Buat kunci baru lalu tempel ulang ke SA_JSON.'
      : /signature/i.test(d)
      ? ' -> Kunci privat rusak atau terpotong. Tempel ulang SELURUH isi file .json ke SA_JSON.'
      : '';
    throw new Error('Gagal ambil token: ' + res.getContentText() + saran);
  }
  return body.access_token;
}

function fsList_(cfg, token, collection) {
  var out = [], pageToken = '';
  do {
    var url = 'https://firestore.googleapis.com/v1/projects/' + cfg.PROJECT_ID +
      '/databases/(default)/documents/' + collection + '?pageSize=300' +
      (pageToken ? '&pageToken=' + pageToken : '');
    var res = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) throw new Error('Firestore error: ' + res.getContentText());
    var data = JSON.parse(res.getContentText());
    (data.documents || []).forEach(function (d) {
      var o = decode_(d.fields || {});
      o.id = d.name.split('/').pop();
      out.push(o);
    });
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return out;
}

/** Ubah format Firestore REST (typed values) jadi objek JS biasa. */
function decode_(fields) {
  var o = {};
  Object.keys(fields).forEach(function (k) { o[k] = val_(fields[k]); });
  return o;
}
function val_(v) {
  if (v === null || v === undefined) return null;
  if ('stringValue'  in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue'  in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue'    in v) return null;
  if ('mapValue'     in v) return decode_(v.mapValue.fields || {});
  if ('arrayValue'   in v) return (v.arrayValue.values || []).map(val_);
  return null;
}

// ====================== LOGIKA TUGAS (cermin dari aplikasi) ======================
function iso_(offsetHari) {
  var d = new Date();
  if (offsetHari) d.setDate(d.getDate() + offsetHari);
  return Utilities.formatDate(d, 'Asia/Jakarta', 'yyyy-MM-dd');
}
function tgl_(s) {
  if (!s) return '-';
  var p = String(s).slice(0, 10).split('-');
  if (p.length !== 3) return '-';
  var B = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return Number(p[2]) + ' ' + B[Number(p[1]) - 1] + ' ' + p[0];
}
function n_(v) { return Number(v) || 0; }
function notesTerbuka_(r) {
  var a = Array.isArray(r.revisiNotes) ? r.revisiNotes : [];
  return a.filter(function (x) { return x && !x.selesai; });
}
function adaEng_(r) {
  var e = r.engagement || {}, ig = e.ig || {}, tt = e.tiktok || {};
  return (n_(ig.reach) + n_(ig.likes) + n_(ig.comments) + n_(ig.shares) + n_(ig.saves) +
          n_(tt.views) + n_(tt.likes) + n_(tt.comments) + n_(tt.shares) + n_(tt.saves)) > 0;
}
function brand_(r) { return r.brand === 'storypie' ? 'Storypie' : 'Gumik'; }
function judul_(r) {
  var s = String(r.keyMessage || r.brief || r.jenisKonten || '').trim();
  if (!s) return 'Konten tanpa judul';
  return s.length > 60 ? s.slice(0, 60).trim() + '...' : s;
}

function tasksFor_(plans, role) {
  var today = iso_(0), soon = iso_(10);
  var sudah = [], belum = [];
  function push(done, tt, ts) { (done ? sudah : belum).push({ tt: tt, ts: ts }); }

  if (role === 'copywriter' || role === 'admin') {
    plans.filter(function (r) { return r.tanggalPosting && r.tanggalPosting <= soon && r.status !== 'Posted'; })
      .forEach(function (r) {
        var done = (r.status || 'Draft') !== 'Draft' && r.status !== 'Revisi';
        push(done, 'Brief: ' + judul_(r),
          brand_(r) + ' • ' + (r.jenisKonten || '-') + ' • tayang ' + tgl_(r.tanggalPosting) + ' • ' + (r.status || 'Draft'));
      });
    plans.filter(function (r) { return notesTerbuka_(r).length; })
      .forEach(function (r) {
        push(false, 'Kerjakan revisi: ' + judul_(r),
          notesTerbuka_(r).length + ' catatan terbuka');
      });
  }
  if (role === 'designer' || role === 'admin') {
    plans.filter(function (r) { return r.deadlineDesign && r.deadlineDesign <= soon && r.status !== 'Posted'; })
      .forEach(function (r) {
        var done = !!r.fileUrl || ['On Editing','Scheduled','Posted'].indexOf(r.status) >= 0;
        push(done, 'Design: ' + judul_(r),
          'deadline ' + tgl_(r.deadlineDesign) + (r.deadlineDesign < today && !done ? ' [LEWAT]' : '') +
          ' • ' + (r.jenisDesign || '-'));
      });
  }
  if (role === 'content_creator' || role === 'admin') {
    plans.filter(function (r) {
      return ((r.tanggalTake && r.tanggalTake <= soon) || (r.tanggalEditing && r.tanggalEditing <= soon)) && r.status !== 'Posted';
    }).forEach(function (r) {
      var done = ['Scheduled','Posted'].indexOf(r.status) >= 0;
      push(done, 'Take/Edit: ' + judul_(r),
        'take ' + tgl_(r.tanggalTake) + ' • edit ' + tgl_(r.tanggalEditing));
    });
    plans.filter(function (r) { return r.status === 'Posted'; })
      .forEach(function (r) {
        push(adaEng_(r), 'Input engagement: ' + judul_(r),
          'tayang ' + tgl_(r.tanggalPosting));
      });
  }
  if (role === 'supervisor' || role === 'admin') {
    plans.filter(function (r) { return (r.status || 'Draft') !== 'Draft'; })
      .forEach(function (r) {
        push(r.apprSpv === 'approved', 'Approve SPV: ' + judul_(r),
          brand_(r) + ' • tayang ' + tgl_(r.tanggalPosting));
      });
  }
  if (role === 'manager' || role === 'admin') {
    plans.filter(function (r) { return (r.status || 'Draft') !== 'Draft'; })
      .forEach(function (r) {
        push(r.apprMgr === 'approved', 'Approve MGR: ' + judul_(r),
          brand_(r) + ' • tayang ' + tgl_(r.tanggalPosting));
      });
  }
  return { sudah: sudah, belum: belum };
}

function buildPesan_(u, t) {
  var total = t.sudah.length + t.belum.length;
  var pct = total ? Math.round(t.sudah.length / total * 100) : 100;
  var tglTeks = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'EEEE, d MMMM yyyy');

  var s = '*CONTENT PLAN HUB*\n_Report Harian ' + tglTeks + '_\n\n';
  s += 'Halo ' + u.nama + ' (' + (ROLES[u.role] || u.role) + ')\n';
  s += 'Progress: *' + t.sudah.length + '/' + total + '* selesai (' + pct + '%)\n\n';

  s += '*BELUM DIKERJAKAN (' + t.belum.length + ')*\n';
  s += t.belum.length
    ? t.belum.slice(0, 15).map(function (x, i) { return (i + 1) + '. ' + x.tt + '\n   ' + x.ts; }).join('\n')
    : '- Tidak ada. Mantap!';
  if (t.belum.length > 15) s += '\n...dan ' + (t.belum.length - 15) + ' lainnya';

  s += '\n\n*SUDAH DIKERJAKAN (' + t.sudah.length + ')*\n';
  s += t.sudah.length
    ? t.sudah.slice(0, 10).map(function (x, i) { return (i + 1) + '. ' + x.tt; }).join('\n')
    : '- Belum ada';
  if (t.sudah.length > 10) s += '\n...dan ' + (t.sudah.length - 10) + ' lainnya';

  s += '\n\nBuka aplikasi untuk detailnya.';
  return s;
}

// ====================== PENGIRIM WHATSAPP ======================
function normalWa_(v) {
  var d = String(v || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.indexOf('0') === 0) d = '62' + d.slice(1);
  else if (d.indexOf('8') === 0) d = '62' + d;
  return d;
}

function kirimFonnte_(cfg, nomor, pesan) {
  var no = normalWa_(nomor);
  if (!no) return false;
  try {
    var res = UrlFetchApp.fetch('https://api.fonnte.com/send', {
      method: 'post',
      headers: { Authorization: cfg.FONNTE_TOKEN },
      payload: { target: no, message: pesan, countryCode: '62' },
      muteHttpExceptions: true
    });
    var body = res.getContentText();
    Logger.log('Fonnte -> %s : %s', no, body);
    return res.getResponseCode() === 200 && body.indexOf('"status":true') >= 0;
  } catch (e) {
    Logger.log('Gagal kirim ke %s: %s', no, e);
    return false;
  }
}

/* ==========================================================
 * PROKSI PENULIS AI  (opsional)
 * Dipanggil aplikasi lewat POST supaya kunci API TIDAK PERNAH
 * sampai ke browser. Simpan kuncinya di Project Settings ->
 * Script Properties:
 *   AI_KEY            kunci Google Gemini
 *   AI_KEY_OPENAI     kunci OpenAI      (kalau dipakai)
 *   AI_KEY_ANTHROPIC  kunci Anthropic   (kalau dipakai)
 * ========================================================== */
function aiPenyedia_(nama, kunci) {
  if (nama === 'openai') return {
    kirim: 'https://api.openai.com/v1/chat/completions',
    daftar: 'https://api.openai.com/v1/models',
    header: { 'Authorization': 'Bearer ' + kunci }
  };
  if (nama === 'anthropic') return {
    kirim: 'https://api.anthropic.com/v1/messages',
    daftar: 'https://api.anthropic.com/v1/models?limit=100',
    header: { 'x-api-key': kunci, 'anthropic-version': '2023-06-01' }
  };
  return { gemini: true };   // URL-nya butuh nama model, dibentuk di bawah
}
function aiKunciProperti_(nama) {
  var P = PropertiesService.getScriptProperties();
  if (nama === 'openai')    return P.getProperty('AI_KEY_OPENAI');
  if (nama === 'anthropic') return P.getProperty('AI_KEY_ANTHROPIC');
  return P.getProperty('AI_KEY');
}
function doPost(e) {
  var keluarJson_ = function (obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  };
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var AKSI_DIKENAL = ['versi', 'ai', 'ai_models', 'esb_cabang', 'esb_live', 'esb_jam',
                        'esb_produk', 'esb_jelajah'];
    if (AKSI_DIKENAL.indexOf(body.aksi) < 0) {
      return keluarJson_({ galat: 'Aksi tidak dikenal.' });
    }
    var P = PropertiesService.getScriptProperties();
    var webToken = (typeof WEB_TOKEN_TERTANAM !== 'undefined' && WEB_TOKEN_TERTANAM)
      ? WEB_TOKEN_TERTANAM : P.getProperty('WEB_TOKEN');
    if (webToken && body.token !== webToken) {
      return keluarJson_({ galat: 'Token keamanan tidak cocok.' });
    }

    // Versi kode yang BENAR-BENAR terpasang di deployment ini. Dipakai
    // aplikasi untuk tahu apakah Apps Script sudah di-deploy ulang —
    // "jalan di editor tapi gagal di aplikasi" hampir selalu berarti
    // deployment-nya masih memakai kode lama.
    if (body.aksi === 'versi') {
      return keluarJson_({ versi: VERSI_KODE, waktu: new Date().toISOString() });
    }

    // ---- sumber data ESB ----
    if (body.aksi === 'esb_cabang') {
      try { return keluarJson_(esbDaftarCabang_()); }
      catch (e) { return keluarJson_({ galat: e.message || String(e) }); }
    }
    // Pemetaan outlet -> branchCode dikirim aplikasi; Apps Script tidak
    // membaca maupun menulis Firestore untuk data ESB.
    if (body.aksi === 'esb_live' || body.aksi === 'esb_jam' || body.aksi === 'esb_produk') {
      var dari = String(body.dari || '').slice(0, 10);
      var sampai = String(body.sampai || '').slice(0, 10) || dari;
      var cabang = (body.cabang && typeof body.cabang === 'object') ? body.cabang : {};
      try {
        if (body.aksi === 'esb_live')   return keluarJson_(esbLive(dari, sampai, cabang));
        if (body.aksi === 'esb_jam')    return keluarJson_(esbJam(dari, sampai, cabang));
        return keluarJson_(esbProduk(dari, sampai, cabang, Number(body.batas) || 40));
      } catch (e) { return keluarJson_({ galat: e.message || String(e) }); }
    }
    if (body.aksi === 'esb_jelajah') {
      try { return keluarJson_(esbJelajah(String(body.tanggal || '').slice(0, 10),
                                          String(body.branchCode || ''))); }
      catch (e) { return keluarJson_({ galat: e.message || String(e) }); }
    }
    var nama = String(body.penyedia || 'gemini');
    var kunci = aiKunciProperti_(nama);
    if (!kunci) {
      var propName = nama === 'openai' ? 'AI_KEY_OPENAI'
                   : nama === 'anthropic' ? 'AI_KEY_ANTHROPIC' : 'AI_KEY';
      return keluarJson_({ galat: propName + ' belum diisi di Script Properties Apps Script.' });
    }
    var cfg = aiPenyedia_(nama, kunci);
    var model = String(body.model || '').replace(/[^a-zA-Z0-9._\-]/g, '');

    // ---- daftar model ----
    if (body.aksi === 'ai_models') {
      var urlD = cfg.gemini
        ? 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' + encodeURIComponent(kunci)
        : cfg.daftar;
      var resD = UrlFetchApp.fetch(urlD, {
        headers: cfg.gemini ? {} : cfg.header, muteHttpExceptions: true });
      if (resD.getResponseCode() !== 200) {
        var pD = resD.getContentText();
        try { pD = JSON.parse(pD).error.message; } catch (x) {}
        return keluarJson_({ galat: pD });
      }
      return ContentService.createTextOutput(resD.getContentText())
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---- kirim prompt ----
    var urlK = cfg.gemini
      ? 'https://generativelanguage.googleapis.com/v1beta/models/' + model +
        ':generateContent?key=' + encodeURIComponent(kunci)
      : cfg.kirim;
    var opsi = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(body.badan || {}),
      muteHttpExceptions: true
    };
    if (!cfg.gemini) opsi.headers = cfg.header;

    var res = UrlFetchApp.fetch(urlK, opsi);
    var kode = res.getResponseCode();
    var teks = res.getContentText();
    if (kode < 200 || kode >= 300) {
      var pesan = teks;
      try { pesan = JSON.parse(teks).error.message; } catch (x) {}
      if (kode === 404) pesan = 'Model "' + model + '" tidak bisa dipakai kunci ini. Klik "Cari Model yang Jalan" di panel Penulis AI.';
      if (kode === 429) pesan = 'Kuota atau saldo habis, atau permintaan terlalu cepat. Tunggu sebentar lalu coba lagi.';
      if (kode === 401) pesan = 'Kunci ' + nama + ' ditolak. Perbarui di Script Properties.';
      if (kode === 400 && /API key/i.test(pesan)) pesan = 'Kunci tidak valid. Perbarui di Script Properties.';
      return keluarJson_({ galat: pesan });
    }
    return ContentService.createTextOutput(teks).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return keluarJson_({ galat: 'Proksi AI gagal: ' + (err && err.message ? err.message : err) });
  }
}

/** Tes cepat proksi AI dari editor Apps Script. Ganti 'gemini' kalau perlu. */
function tesAiProksi() {
  var nama = 'gemini';   // 'gemini' | 'openai' | 'anthropic'
  var P = PropertiesService.getScriptProperties();
  if (!aiKunciProperti_(nama)) { Logger.log('Kunci untuk ' + nama + ' belum diisi di Script Properties.'); return; }
  var badan = nama === 'gemini'
    ? { contents: [{ role: 'user', parts: [{ text: 'Balas satu kata: siap' }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 16 } }
    : nama === 'anthropic'
    ? { model: 'claude-haiku-4-5-20251001', max_tokens: 16,
        messages: [{ role: 'user', content: 'Balas satu kata: siap' }] }
    : { model: 'gpt-5-mini', max_completion_tokens: 16,
        messages: [{ role: 'user', content: 'Balas satu kata: siap' }] };
  var palsu = { postData: { contents: JSON.stringify({
    aksi: 'ai', penyedia: nama,
    token: (typeof WEB_TOKEN_TERTANAM !== 'undefined' && WEB_TOKEN_TERTANAM)
      ? WEB_TOKEN_TERTANAM : P.getProperty('WEB_TOKEN'),
    model: badan.model || 'gemini-3.5-flash-lite',
    badan: badan
  }) } };
  Logger.log(doPost(palsu).getContent());
}

/* ==========================================================
 * SUMBER DATA ESB  (omset & jumlah transaksi harian)
 *
 * Kredensial disimpan di Project Settings -> Script Properties:
 *   ESB_USER   username ESB
 *   ESB_PASS   password / kredensial ESB
 *   ESB_BASE   opsional, bawaan https://services.esb.co.id/core
 *
 * Kredensial TIDAK PERNAH dikirim ke browser. Aplikasi hanya
 * memanggil Apps Script ini, dan Apps Script yang memanggil ESB.
 *
 * Sumber: ESB Core API v2.0.0 — developers.esb.co.id/esb-core
 *   POST /auth/login                  -> result.accessToken
 *   GET  /branch                      -> daftar branchCode & branchName
 *   GET  /report/sales-payment-summary?salesDate=&branchCode=
 *        -> result[].payments[] { paymentAmount, paymentCount }
 * ========================================================== */

function esbBase_() {
  var b = PropertiesService.getScriptProperties().getProperty('ESB_BASE');
  return (b || 'https://services.esb.co.id/core').replace(/\/+$/, '');
}

/* ---------- autentikasi: dua kemungkinan, dicari sendiri ----------
 *
 * Akun ESB bisa memakai salah satu dari dua cara, dan tidak ada cara
 * memastikannya dari luar:
 *
 *   a. LOGIN   POST /auth/login {username, password} -> accessToken
 *   b. API KEY satu kunci panjang yang dikirim di header tiap permintaan
 *
 * Kunci API yang dipakai sebagai password menghasilkan persis error
 * "400 Invalid username or password", dan sebaliknya. Jadi daripada
 * menebak, semua cara dicoba sekali lalu yang berhasil diingat di
 * Script Property ESB_AUTH_MODE.
 */

/** Semua bentuk header yang mungkin untuk satu kunci API. */
function esbCaraKunci_(kunci) {
  return [
    { mode: 'bearer',    header: { Authorization: 'Bearer ' + kunci } },
    { mode: 'x-api-key', header: { 'x-api-key': kunci } },
    { mode: 'apikey',    header: { apikey: kunci } },
    { mode: 'api-key',   header: { 'api-key': kunci } },
    { mode: 'auth-raw',  header: { Authorization: kunci } },
    { mode: 'esb-key',   header: { 'X-ESB-API-KEY': kunci } }
  ];
}

/** Login username/password. Melempar kalau ditolak. */
function esbLoginToken_() {
  var P = PropertiesService.getScriptProperties();
  var u = P.getProperty('ESB_USER'), p = P.getProperty('ESB_PASS');
  if (!u || !p) throw new Error('ESB_USER / ESB_PASS belum diisi di Script Properties.');

  var res = UrlFetchApp.fetch(esbBase_() + '/auth/login', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ username: u, password: p }),
    muteHttpExceptions: true
  });
  var teks = res.getContentText();
  if (res.getResponseCode() !== 200) {
    throw new Error('Login ESB gagal (' + res.getResponseCode() + '): ' + esbPesan_(teks));
  }
  var j = JSON.parse(teks);
  var t = j && j.result && j.result.accessToken;
  if (!t) throw new Error('Login ESB berhasil tapi tidak ada accessToken di jawabannya.');
  return t;
}

/** Uji satu set header dengan panggilan paling murah yang ada. */
function esbCoba_(header) {
  var res = UrlFetchApp.fetch(esbBase_() + '/branch?flagActive=1', {
    headers: header, muteHttpExceptions: true
  });
  return { kode: res.getResponseCode(), teks: res.getContentText() };
}

/**
 * Header siap pakai untuk setiap permintaan ke ESB.
 * paksaBaru = buang yang tersimpan dan cari ulang (dipakai saat kena 401).
 */
function esbHeader_(paksaBaru) {
  var cache = CacheService.getScriptCache();
  if (!paksaBaru) {
    var simpan = cache.get('ESB_HEADER');
    if (simpan) return JSON.parse(simpan);
  }
  var P = PropertiesService.getScriptProperties();
  var kunci = P.getProperty('ESB_API_KEY');
  var mode = P.getProperty('ESB_AUTH_MODE');
  var header = null;

  // cara yang sudah terbukti sebelumnya
  if (mode === 'login') {
    header = { Authorization: 'Bearer ' + esbLoginToken_() };
  } else if (mode && kunci) {
    esbCaraKunci_(kunci).forEach(function (c) { if (c.mode === mode) header = c.header; });
  }

  // belum pernah terbukti, atau yang tersimpan sudah tidak berlaku
  if (!header) {
    var catatan = [];
    if (kunci) {
      var cara = esbCaraKunci_(kunci);
      for (var i = 0; i < cara.length && !header; i++) {
        var r = esbCoba_(cara[i].header);
        catatan.push(cara[i].mode + ': ' + r.kode);
        if (r.kode === 200) {
          header = cara[i].header;
          P.setProperty('ESB_AUTH_MODE', cara[i].mode);
        }
      }
    }
    if (!header) {
      try {
        header = { Authorization: 'Bearer ' + esbLoginToken_() };
        P.setProperty('ESB_AUTH_MODE', 'login');
      } catch (e) {
        catatan.push('login: ' + (e.message || e));
        throw new Error('ESB menolak semua cara masuk. ' + catatan.join(' | ') +
          '. Periksa ESB_API_KEY atau ESB_USER/ESB_PASS di Script Properties, ' +
          'lalu jalankan tesEsbAuth untuk melihat jawaban ESB satu per satu.');
      }
    }
  }
  cache.put('ESB_HEADER', JSON.stringify(header), 2400);   // 40 menit
  return header;
}

/** Dipakai bagian lain yang masih meminta token mentah. */
function esbToken_(paksaBaru) {
  var h = esbHeader_(paksaBaru);
  return String(h.Authorization || '').replace(/^Bearer\s+/, '');
}

/**
 * Jalankan ini di editor kalau ESB menolak. Mencoba SEMUA cara masuk dan
 * menuliskan jawaban ESB untuk masing-masing, jadi ketahuan mana yang dipakai
 * akun ini — tanpa perlu menebak-nebak.
 */
function tesEsbAuth() {
  var P = PropertiesService.getScriptProperties();
  var kunci = P.getProperty('ESB_API_KEY');
  var u = P.getProperty('ESB_USER'), p = P.getProperty('ESB_PASS');

  Logger.log('Base URL: ' + esbBase_());
  Logger.log('ESB_API_KEY: ' + (kunci ? 'terisi (' + kunci.length + ' karakter)' : 'KOSONG'));
  Logger.log('ESB_USER: ' + (u ? u : 'KOSONG') + '   ESB_PASS: ' + (p ? 'terisi' : 'KOSONG'));
  // Semua cara dicoba sampai habis supaya terlihat gambaran lengkapnya.
  // Baris "gagal" itu wajar: satu akun hanya memakai SATU cara, jadi yang
  // lain memang akan ditolak. Yang menentukan cuma apakah ADA yang berhasil.
  var berhasil = [];

  Logger.log('--- cara API key ---');
  if (kunci) {
    esbCaraKunci_(kunci).forEach(function (c) {
      var r = esbCoba_(c.header);
      if (r.kode === 200) berhasil.push(c.mode);
      Logger.log('  ' + (r.kode === 200 ? 'BERHASIL' : 'gagal  ') + '  ' + c.mode +
                 '  -> ' + r.kode + '  ' + esbPesan_(r.teks).slice(0, 120));
    });
  } else {
    Logger.log('  dilewati, ESB_API_KEY kosong');
  }
  Logger.log('--- cara username/password ---');
  if (u && p) {
    try {
      esbLoginToken_();
      berhasil.push('login');
      Logger.log('  BERHASIL  login -> accessToken didapat');
    } catch (e) {
      Logger.log('  gagal     login -> ' + (e.message || e));
    }
  } else {
    Logger.log('  dilewati, ESB_USER / ESB_PASS kosong');
  }

  Logger.log('');
  if (berhasil.length) {
    // pakai yang pertama berhasil, supaya panggilan aplikasi langsung tepat
    if (!P.getProperty('ESB_AUTH_MODE')) P.setProperty('ESB_AUTH_MODE', berhasil[0]);
    Logger.log('==> BERES. ESB menerima: ' + berhasil.join(', ') + '.');
    Logger.log('    Baris "gagal" di atas tidak perlu diperbaiki — satu akun memang');
    Logger.log('    hanya memakai satu cara, sisanya wajar ditolak.');
    Logger.log('    Cara yang dipakai: ' + P.getProperty('ESB_AUTH_MODE'));
    Logger.log('    Langkah berikutnya: menu Admin -> Sumber Data ESB -> Tarik Daftar Outlet dari ESB.');
  } else {
    Logger.log('==> BELUM BISA MASUK. Tidak ada satu cara pun yang diterima ESB.');
    Logger.log('    Kredensialnya memang belum benar — minta ulang ke ESB, dan sebutkan');
    Logger.log('    kamu mengaksesnya lewat API, bukan lewat aplikasi ESB biasa.');
    Logger.log('    Cara yang sedang diingat: ' + (P.getProperty('ESB_AUTH_MODE') || 'belum ada'));
  }
}

/** Lupakan cara masuk yang tersimpan, supaya dicari ulang. */
function lupakanAuthEsb() {
  PropertiesService.getScriptProperties().deleteProperty('ESB_AUTH_MODE');
  CacheService.getScriptCache().remove('ESB_HEADER');
  Logger.log('ESB_AUTH_MODE dihapus. Panggilan berikutnya akan mencari ulang.');
}

/** Satu panggilan GET ke ESB. Kalau token kedaluwarsa, login ulang sekali. */
function esbGet_(path, params) {
  var q = [];
  Object.keys(params || {}).forEach(function (k) {
    if (params[k] !== '' && params[k] !== null && params[k] !== undefined) {
      q.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
    }
  });
  var url = esbBase_() + path + (q.length ? '?' + q.join('&') : '');
  var panggil = function (header) {
    return UrlFetchApp.fetch(url, { headers: header, muteHttpExceptions: true });
  };
  var res = panggil(esbHeader_(false));
  if (res.getResponseCode() === 401 || res.getResponseCode() === 403) {
    res = panggil(esbHeader_(true));         // token basi -> masuk ulang
  }
  if (res.getResponseCode() !== 200) {
    throw new Error('ESB ' + path + ' gagal (' + res.getResponseCode() + '): ' + esbPesan_(res.getContentText()));
  }
  return JSON.parse(res.getContentText());
}
function esbPesan_(teks) {
  try {
    var j = JSON.parse(teks);
    return j.message || (j.errors && JSON.stringify(j.errors)) || String(teks).slice(0, 200);
  } catch (e) { return String(teks).slice(0, 200); }
}

/* ---------- daftar outlet, berikut brand dan regionnya ----------
 * Nama field untuk brand dan region berbeda-beda antar akun ESB, jadi
 * beberapa nama yang lazim dicoba dan yang pertama berisi dipakai. Kalau
 * tidak ada satu pun yang cocok, nilainya dikosongkan — bukan ditebak —
 * dan aplikasi menurunkannya dari nama outlet, yang bisa dikoreksi tangan
 * di menu Admin. `field` membawa daftar nama field apa adanya supaya
 * kalau tebakan ini meleset, ketahuan apa sebenarnya yang ESB kirim.     */

var ESB_F_BRAND = ['brandName', 'brand', 'companyName', 'company', 'groupName',
                   'merchantName', 'tenantName', 'businessUnit', 'brandCode'];
var ESB_F_REGION = ['regionName', 'region', 'areaName', 'area', 'zoneName', 'zone',
                    'cityName', 'city', 'provinceName', 'province', 'districtName'];

function esbDaftarCabang_() {
  var j = esbGet_('/branch', { flagActive: 1 });
  var baris = esbBaris_(j);
  var field = baris.length ? Object.keys(baris[0]) : [];
  var out = baris.map(function (b) {
    return {
      kode: esbTeks_(b, ['branchCode', 'code', 'outletCode']),
      nama: esbTeks_(b, ['branchName', 'name', 'outletName']),
      id: esbTeks_(b, ['branchID', 'branchId', 'id']),
      brand: esbTeks_(b, ESB_F_BRAND),
      region: esbTeks_(b, ESB_F_REGION)
    };
  }).filter(function (b) { return b.kode; });
  return { cabang: out, field: field };
}

/**
 * Omset & jumlah transaksi satu cabang pada satu tanggal.
 * Catatan: paymentCount menghitung PEMBAYARAN, bukan struk. Satu struk yang
 * dibayar dua metode terhitung dua. ESB Core tidak menyediakan hitungan struk,
 * jadi angka ini dipakai apa adanya dan diberi tanda di aplikasi.
 */
function esbPenjualan_(tanggal, branchCode) {
  var j = esbGet_('/report/sales-payment-summary', { salesDate: tanggal, branchCode: branchCode });
  var omset = 0, trx = 0;
  (j.result || []).forEach(function (r) {
    (r.payments || []).forEach(function (p) {
      omset += Number(p.paymentAmount) || 0;
      trx   += Number(p.paymentCount)  || 0;
    });
  });
  return { tanggal: tanggal, branchCode: branchCode, omset: Math.round(omset), trx: Math.round(trx) };
}

/* ==========================================================
 * MODE LANGSUNG (live)
 *
 * Sejak versi 27 data ESB TIDAK disimpan ke Firestore sama sekali.
 * Apps Script hanya meneruskan: aplikasi minta -> ESB dijawab ->
 * jawabannya dikirim balik ke browser dan hanya hidup di layar.
 * Yang tersimpan di Firestore tinggal angka yang diketik tim sendiri
 * (koreksi manual) dan target bulanan.
 *
 * Pemetaan outlet -> branchCode dikirim oleh aplikasi di tiap permintaan,
 * jadi Apps Script tidak perlu membaca Firestore sama sekali untuk ini.
 * Kredensial ESB tetap hanya ada di Script Properties.
 * ========================================================== */

/**
 * Beberapa GET sekaligus. Menarik sebulan untuk tiga outlet berarti
 * sekitar 90 panggilan; satu per satu akan menabrak batas 6 menit
 * Apps Script, jadi dikerjakan berbarengan per rombongan.
 */
function esbGetBanyak_(daftar) {
  if (!daftar.length) return [];
  var hasil = new Array(daftar.length);
  var header = esbHeader_(false);
  var ROMBONGAN = 25;

  var kerjakan = function (indeks, hdr) {
    var req = indeks.map(function (i) {
      var d = daftar[i], q = [];
      Object.keys(d.params || {}).forEach(function (k) {
        var v = d.params[k];
        if (v !== '' && v !== null && v !== undefined) {
          q.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }
      });
      return {
        url: esbBase_() + d.path + (q.length ? '?' + q.join('&') : ''),
        headers: hdr, muteHttpExceptions: true
      };
    });
    return UrlFetchApp.fetchAll(req);
  };

  for (var mulai = 0; mulai < daftar.length; mulai += ROMBONGAN) {
    var indeks = [];
    for (var i = mulai; i < Math.min(mulai + ROMBONGAN, daftar.length); i++) indeks.push(i);
    var res = kerjakan(indeks, header);

    // token basi -> masuk ulang sekali, lalu ulangi yang tertolak saja
    var ulangi = [];
    res.forEach(function (r, n) {
      var kode = r.getResponseCode();
      if (kode === 401 || kode === 403) ulangi.push(indeks[n]);
    });
    if (ulangi.length) {
      header = esbHeader_(true);
      var res2 = kerjakan(ulangi, header);
      ulangi.forEach(function (idx, n) { res[indeks.indexOf(idx)] = res2[n]; });
    }

    res.forEach(function (r, n) {
      var idx = indeks[n], kode = r.getResponseCode(), teks = r.getContentText();
      var isi = { tag: daftar[idx].tag, path: daftar[idx].path, kode: kode, ok: kode === 200 };
      if (kode === 200) {
        try { isi.json = JSON.parse(teks); }
        catch (e) { isi.ok = false; isi.pesan = 'Jawaban ESB bukan JSON.'; }
      } else {
        isi.pesan = esbPesan_(teks);
      }
      hasil[idx] = isi;
    });
  }
  return hasil;
}

/* ---------- pembaca jawaban yang tidak rewel soal nama field ----------
 * Nama field laporan ESB berbeda-beda antar endpoint, dan sebagian
 * tidak terdokumentasi untuk akun ini. Daripada menebak satu nama lalu
 * menghasilkan nol terus, pembaca di bawah mencoba beberapa nama yang
 * lazim dan memakai yang pertama berisi angka. Kalau tidak ada yang
 * cocok, hasilnya null — bukan 0 — supaya "tidak terbaca" tidak
 * tersamar jadi "tidak ada penjualan".                                 */

function esbAngka_(o, nama) {
  for (var i = 0; i < nama.length; i++) {
    var v = o[nama[i]];
    if (v === undefined || v === null || v === '') continue;
    var n = Number(String(v).replace(/[^0-9.\-]/g, ''));
    if (!isNaN(n)) return n;
  }
  return null;
}
function esbTeks_(o, nama) {
  for (var i = 0; i < nama.length; i++) {
    var v = o[nama[i]];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}
/** Cari array berisi objek di mana pun letaknya dalam jawaban. */
function esbBaris_(j) {
  if (!j) return [];
  if (Object.prototype.toString.call(j) === '[object Array]') return j;
  var kandidat = ['result', 'data', 'rows', 'items', 'records', 'content', 'list'];
  for (var i = 0; i < kandidat.length; i++) {
    var v = j[kandidat[i]];
    if (Object.prototype.toString.call(v) === '[object Array]') return v;
    if (v && typeof v === 'object') {
      var dalam = esbBaris_(v);
      if (dalam.length) return dalam;
    }
  }
  return [];
}
/** "14", 14, "14:00", "2026-11-06 14:05:00" -> 14. Di luar 0–23 -> null. */
function esbKeJam_(v) {
  if (v === undefined || v === null || v === '') return null;
  var s = String(v);
  var m = s.match(/(\d{1,2})\s*:\s*\d{2}/);
  var n = m ? Number(m[1]) : Number(s.replace(/[^0-9]/g, '').slice(0, 2));
  return (!isNaN(n) && n >= 0 && n <= 23) ? n : null;
}

var ESB_F_OMSET = ['paymentAmount', 'netSales', 'netSale', 'grandTotal', 'totalAmount',
                   'salesAmount', 'amount', 'totalSales', 'total', 'subTotal', 'nettAmount'];
var ESB_F_JUMLAH = ['paymentCount', 'billCount', 'transactionCount', 'totalBill', 'countBill',
                    'trxCount', 'checkCount', 'count', 'qty', 'quantity'];
var ESB_F_JAM = ['hour', 'salesHour', 'hourOfDay', 'jam', 'timeHour', 'hourly', 'periodHour',
                 'salesTime', 'time', 'transactionTime', 'billTime', 'createdTime'];
var ESB_F_ITEM = ['itemName', 'menuName', 'productName', 'name', 'itemDescription', 'product'];
var ESB_F_KATEGORI = ['categoryName', 'itemCategory', 'groupName', 'category', 'menuCategory'];

/* ---------- omset & jumlah transaksi harian (live) ---------- */

/** Satu cabang, satu tanggal. Dipakai esb_live dan tesEsb. */
function esbPenjualan_(tanggal, branchCode) {
  var j = esbGet_('/report/sales-payment-summary', { salesDate: tanggal, branchCode: branchCode });
  var omset = 0, trx = 0;
  (j.result || []).forEach(function (r) {
    (r.payments || []).forEach(function (p) {
      omset += Number(p.paymentAmount) || 0;
      trx   += Number(p.paymentCount)  || 0;
    });
  });
  return { tanggal: tanggal, branchCode: branchCode, omset: Math.round(omset), trx: Math.round(trx) };
}

function esbDeretTanggal_(dari, sampai, maks) {
  var a = new Date(dari + 'T00:00:00Z'), b = new Date(sampai + 'T00:00:00Z');
  var n = Math.round((b - a) / 86400000);
  if (isNaN(n)) throw new Error('Tanggal tidak terbaca.');
  if (n < 0) throw new Error('Tanggal selesai lebih awal dari tanggal mulai.');
  if (n > (maks || 30)) throw new Error('Rentang maksimal ' + ((maks || 30) + 1) + ' hari dalam satu permintaan.');
  var out = [];
  for (var i = 0; i <= n; i++) out.push(new Date(a.getTime() + i * 86400000).toISOString().slice(0, 10));
  return out;
}

/**
 * esb_live — omset & transaksi per tanggal per outlet, langsung dikirim
 * balik ke browser. Tidak ada satu pun tulisan ke Firestore di sini.
 *   cabang: { storypie_medan: 'SPMDN', ... }
 */
function esbLive(dari, sampai, cabang) {
  var outlets = Object.keys(cabang || {}).filter(function (o) { return cabang[o]; });
  if (!outlets.length) return { galat: 'Belum ada outlet yang dipetakan ke cabang ESB.' };
  var tanggal = esbDeretTanggal_(dari, sampai, 31);

  var minta = [];
  outlets.forEach(function (o) {
    tanggal.forEach(function (t) {
      minta.push({ tag: o + '|' + t, path: '/report/sales-payment-summary',
                   params: { salesDate: t, branchCode: cabang[o] } });
    });
  });

  var data = {}, gagal = [];
  outlets.forEach(function (o) { data[o] = {}; });
  esbGetBanyak_(minta).forEach(function (r) {
    var p = r.tag.split('|'), o = p[0], t = p[1];
    if (!r.ok) { gagal.push({ outlet: o, tanggal: t, pesan: r.pesan }); return; }
    var omset = 0, trx = 0;
    ((r.json || {}).result || []).forEach(function (x) {
      (x.payments || []).forEach(function (p2) {
        omset += Number(p2.paymentAmount) || 0;
        trx   += Number(p2.paymentCount)  || 0;
      });
    });
    data[o][t.slice(8, 10)] = { omset: Math.round(omset), trx: Math.round(trx) };
  });

  return { dari: dari, sampai: sampai, bulan: dari.slice(0, 7), data: data,
           gagal: gagal, diambilAt: new Date().toISOString() };
}

/* ---------- penjualan per jam & per produk ----------
 * Jalur laporan per jam dan per item tidak sama di tiap akun ESB, dan
 * spesifikasinya tidak bisa dibaca dari sini. Jadi: dicoba satu per satu
 * sampai ada yang menjawab 200 dengan baris yang masuk akal, lalu jalur
 * yang berhasil disimpan di Script Properties supaya panggilan berikutnya
 * langsung tepat sasaran. Kalau kamu sudah tahu jalur yang benar, isi saja
 * ESB_PATH_JAM / ESB_PATH_ITEM sendiri dan penjajakan ini dilewati.      */

var ESB_CALON_JAM = [
  '/report/sales-hourly', '/report/hourly-sales', '/report/sales-per-hour',
  '/report/sales-by-hour', '/report/sales-hour-summary', '/report/sales-summary-hourly',
  '/report/sales-time-summary', '/report/hourly'
];
var ESB_CALON_ITEM = [
  '/report/sales-item-summary', '/report/sales-item', '/report/item-sales',
  '/report/sales-product', '/report/product-sales', '/report/sales-menu',
  '/report/sales-menu-summary', '/report/menu-sales', '/report/sales-item-detail'
];

function esbParam_(tanggal, branchCode) {
  // nama parameter tanggal juga berbeda antar laporan, jadi semuanya dikirim;
  // yang tidak dikenal diabaikan server.
  return { salesDate: tanggal, startDate: tanggal, endDate: tanggal,
           dateFrom: tanggal, dateTo: tanggal, branchCode: branchCode };
}

/** Coba semua calon jalur, kembalikan laporan apa adanya. */
function esbJelajah(tanggal, branchCode) {
  var minta = [];
  ESB_CALON_JAM.forEach(function (p) { minta.push({ tag: 'jam|' + p, path: p, params: esbParam_(tanggal, branchCode) }); });
  ESB_CALON_ITEM.forEach(function (p) { minta.push({ tag: 'item|' + p, path: p, params: esbParam_(tanggal, branchCode) }); });

  var out = { tanggal: tanggal, branchCode: branchCode, jam: [], item: [] };
  esbGetBanyak_(minta).forEach(function (r) {
    var jenis = r.tag.split('|')[0];
    var baris = r.ok ? esbBaris_(r.json) : [];
    out[jenis].push({
      path: r.path, kode: r.kode, baris: baris.length,
      field: baris.length ? Object.keys(baris[0]).slice(0, 25) : [],
      contoh: baris.length ? JSON.stringify(baris[0]).slice(0, 400) : '',
      pesan: r.pesan || ''
    });
  });
  return out;
}

/** Jalur yang sudah terbukti, kalau ada. */
function esbJalur_(jenis) {
  return PropertiesService.getScriptProperties().getProperty(
    jenis === 'jam' ? 'ESB_PATH_JAM' : 'ESB_PATH_ITEM') || '';
}
function esbSimpanJalur_(jenis, path) {
  PropertiesService.getScriptProperties().setProperty(
    jenis === 'jam' ? 'ESB_PATH_JAM' : 'ESB_PATH_ITEM', path);
}

/**
 * Cari jalur yang hidup untuk satu jenis laporan, lalu ingat.
 * "Hidup" = 200, ada barisnya, dan baris pertama memuat angka yang kita cari.
 */
function esbCariJalur_(jenis, tanggal, branchCode) {
  var tersimpan = esbJalur_(jenis);
  if (tersimpan) return tersimpan;
  var calon = jenis === 'jam' ? ESB_CALON_JAM : ESB_CALON_ITEM;
  var minta = calon.map(function (p) { return { tag: p, path: p, params: esbParam_(tanggal, branchCode) }; });
  var ketemu = '';
  esbGetBanyak_(minta).forEach(function (r) {
    if (ketemu || !r.ok) return;
    var baris = esbBaris_(r.json);
    if (!baris.length) return;
    var b = baris[0];
    var adaAngka = esbAngka_(b, ESB_F_OMSET) !== null || esbAngka_(b, ESB_F_JUMLAH) !== null;
    var adaPenanda = jenis === 'jam'
      ? esbKeJam_(esbTeks_(b, ESB_F_JAM)) !== null
      : esbTeks_(b, ESB_F_ITEM) !== '';
    if (adaAngka && adaPenanda) ketemu = r.path;
  });
  if (ketemu) esbSimpanJalur_(jenis, ketemu);
  return ketemu;
}

/**
 * esb_jam — penjualan per jam, dijumlahkan dari beberapa tanggal.
 * Keluaran: { outlet: { 0..23: {omset, trx, hari} } }
 */
function esbJam(dari, sampai, cabang) {
  var outlets = Object.keys(cabang || {}).filter(function (o) { return cabang[o]; });
  if (!outlets.length) return { galat: 'Belum ada outlet yang dipetakan ke cabang ESB.' };
  var tanggal = esbDeretTanggal_(dari, sampai, 31);

  var jalur = esbCariJalur_('jam', tanggal[tanggal.length - 1], cabang[outlets[0]]);
  if (!jalur) {
    return { galat: 'Laporan per jam tidak ditemukan di ESB untuk akun ini.',
             dicoba: ESB_CALON_JAM, petunjuk: 'Buka Admin -> Sumber Data ESB -> Periksa Laporan ESB untuk melihat jawaban tiap jalur, atau isi Script Property ESB_PATH_JAM kalau jalur yang benar sudah diketahui.' };
  }

  var minta = [];
  outlets.forEach(function (o) {
    tanggal.forEach(function (t) {
      minta.push({ tag: o + '|' + t, path: jalur, params: esbParam_(t, cabang[o]) });
    });
  });

  var data = {}, gagal = [], terbaca = 0;
  outlets.forEach(function (o) { data[o] = {}; });
  esbGetBanyak_(minta).forEach(function (r) {
    var p = r.tag.split('|'), o = p[0];
    if (!r.ok) { gagal.push({ outlet: o, tanggal: p[1], pesan: r.pesan }); return; }
    var hariIni = {};
    esbBaris_(r.json).forEach(function (b) {
      var jam = esbKeJam_(esbTeks_(b, ESB_F_JAM));
      if (jam === null) return;
      var omset = esbAngka_(b, ESB_F_OMSET) || 0;
      var trx = esbAngka_(b, ESB_F_JUMLAH) || 0;
      if (!hariIni[jam]) hariIni[jam] = true;
      if (!data[o][jam]) data[o][jam] = { omset: 0, trx: 0, hari: 0 };
      data[o][jam].omset += omset;
      data[o][jam].trx += trx;
      terbaca++;
    });
    Object.keys(hariIni).forEach(function (jam) { data[o][jam].hari++; });
  });

  return { jalur: jalur, dari: dari, sampai: sampai, data: data, baris: terbaca,
           gagal: gagal, diambilAt: new Date().toISOString() };
}

/**
 * esb_produk — penjualan per item, dijumlahkan dari beberapa tanggal.
 * Keluaran: { outlet: [ {nama, kategori, qty, omset} ] } sudah diurutkan.
 */
function esbProduk(dari, sampai, cabang, batas) {
  var outlets = Object.keys(cabang || {}).filter(function (o) { return cabang[o]; });
  if (!outlets.length) return { galat: 'Belum ada outlet yang dipetakan ke cabang ESB.' };
  var tanggal = esbDeretTanggal_(dari, sampai, 31);

  var jalur = esbCariJalur_('item', tanggal[tanggal.length - 1], cabang[outlets[0]]);
  if (!jalur) {
    return { galat: 'Laporan per produk tidak ditemukan di ESB untuk akun ini.',
             dicoba: ESB_CALON_ITEM, petunjuk: 'Buka Admin -> Sumber Data ESB -> Periksa Laporan ESB, atau isi Script Property ESB_PATH_ITEM.' };
  }

  var minta = [];
  outlets.forEach(function (o) {
    tanggal.forEach(function (t) {
      minta.push({ tag: o + '|' + t, path: jalur, params: esbParam_(t, cabang[o]) });
    });
  });

  var kumpul = {}, gagal = [];
  outlets.forEach(function (o) { kumpul[o] = {}; });
  esbGetBanyak_(minta).forEach(function (r) {
    var o = r.tag.split('|')[0];
    if (!r.ok) { gagal.push({ outlet: o, tanggal: r.tag.split('|')[1], pesan: r.pesan }); return; }
    esbBaris_(r.json).forEach(function (b) {
      var nama = esbTeks_(b, ESB_F_ITEM);
      if (!nama) return;
      var k = kumpul[o][nama] || (kumpul[o][nama] = {
        nama: nama, kategori: esbTeks_(b, ESB_F_KATEGORI), qty: 0, omset: 0 });
      k.qty += esbAngka_(b, ['qty', 'quantity', 'itemQty', 'salesQty', 'totalQty', 'count']) || 0;
      k.omset += esbAngka_(b, ESB_F_OMSET) || 0;
    });
  });

  var data = {};
  Object.keys(kumpul).forEach(function (o) {
    data[o] = Object.keys(kumpul[o]).map(function (n) { return kumpul[o][n]; })
      .sort(function (a, b) { return b.omset - a.omset || b.qty - a.qty; })
      .slice(0, batas || 40);
  });

  return { jalur: jalur, dari: dari, sampai: sampai, data: data,
           gagal: gagal, diambilAt: new Date().toISOString() };
}

/* ---------- tes cepat dari editor Apps Script ---------- */

/** Login, ambil cabang, tarik kemarin untuk cabang pertama. */
function tesEsb() {
  try {
    esbToken_(true);
    Logger.log('Login ESB: BERHASIL');
    var dc = esbDaftarCabang_(), cab = dc.cabang;
    Logger.log('Field yang dikirim ESB per cabang: ' + dc.field.join(', '));
    Logger.log('Cabang (' + cab.length + '): ' + JSON.stringify(cab).slice(0, 800));
    if (!cab.length) return;
    var t = Utilities.formatDate(new Date(Date.now() - 86400000), 'Asia/Jakarta', 'yyyy-MM-dd');
    Logger.log('Penjualan ' + t + ' @ ' + cab[0].kode + ': ' +
      JSON.stringify(esbPenjualan_(t, cab[0].kode)));
  } catch (e) {
    Logger.log('GAGAL: ' + (e.message || e));
  }
}

/**
 * Cari laporan per jam dan per produk, lalu tampilkan jawabannya.
 * Jalankan ini sekali; dari log-nya ketahuan jalur mana yang hidup.
 */
function tesEsbLaporan() {
  try {
    var cab = esbDaftarCabang_().cabang;
    if (!cab.length) { Logger.log('Tidak ada cabang.'); return; }
    var t = Utilities.formatDate(new Date(Date.now() - 86400000), 'Asia/Jakarta', 'yyyy-MM-dd');
    var j = esbJelajah(t, cab[0].kode);
    ['jam', 'item'].forEach(function (k) {
      Logger.log('===== ' + k.toUpperCase() + ' (' + t + ' @ ' + cab[0].kode + ') =====');
      j[k].forEach(function (r) {
        Logger.log(r.kode + '  ' + r.path + '  baris=' + r.baris +
          (r.field.length ? '  field=' + r.field.join(',') : '') +
          (r.pesan ? '  ' + r.pesan : ''));
        if (r.baris) Logger.log('      contoh: ' + r.contoh);
      });
    });
  } catch (e) {
    Logger.log('GAGAL: ' + (e.message || e));
  }
}

/** Hapus jalur yang pernah tersimpan, supaya dicari ulang. */
function lupakanJalurEsb() {
  var P = PropertiesService.getScriptProperties();
  P.deleteProperty('ESB_PATH_JAM');
  P.deleteProperty('ESB_PATH_ITEM');
  Logger.log('ESB_PATH_JAM dan ESB_PATH_ITEM dihapus.');
}

/**
 * Trigger harian ESB tidak dipakai lagi — data sekarang ditarik saat
 * halaman dibuka, bukan disimpan tiap pagi. Jalankan sekali untuk
 * mencopot trigger lama kalau dulu sempat dipasang.
 */
function copotTriggerEsb() {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'esbTarikHarian') { ScriptApp.deleteTrigger(t); n++; }
  });
  Logger.log(n + ' trigger esbTarikHarian dicopot.');
}
