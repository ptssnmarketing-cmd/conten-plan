# Marketing SSN — Storypie × Gumik

Web app perencanaan, approval, dan pelaporan konten dua brand. Firebase (Auth + Firestore + Storage), satu file `index.html`, tanpa build step.

## Yang baru di versi ini

**Nama aplikasi menjadi Marketing SSN.** Restore tetap menerima berkas backup lama yang bertuliskan "Content Plan Hub".

**WhatsApp otomatis diperbaiki.** Dua kegagalan diam-diam: sakelar Nonaktif di menu Admin tidak pernah dibaca Apps Script (pesan tetap terkirim), dan jam kirim yang diubah tidak berlaku sampai tombol "Terapkan jadwal" ditekan terpisah. Keduanya beres; Simpan sekarang sekalian menerapkan jadwal. Pesan grup juga mendapat bagian **Report Harian** — tayang hari ini, lewat tanggal, menunggu approval, tayang kemarin — di atas rekap per orang. Ada pilihan **hari kirim**.

**Modul Sumber Info.** Konsumen mengisi sendiri dari mana mereka tahu tentang Storypie atau Gumik, lewat halaman publik `form.html` tanpa login. Pertanyaan, pilihan jawaban, dan daftar store diatur dari dalam aplikasi — tidak ada yang ditulis di kode, jadi tim bisa mengubahnya tanpa deploy ulang.

## Fitur lengkap

- **Login per role** — Admin, Manager, Supervisor, Copywriter, Content Creator, Designer.
- **Content plan per brand** dengan kolom sesuai template spreadsheet + kolom **Notes Revisi**.
- **Approval** hanya oleh Supervisor (SPV) dan Manager (MGR), dikunci di security rules.
- **Minta revisi** otomatis menanyakan alasan dan menyimpannya ke Notes Revisi.
- **Upload file** gambar/video maks. 10MB per konten.
- **Halaman Engagement** — daftar konten Posted, ringkasan reach / views / interaksi / ER, dan konten terbaik.
- **Dashboard** — campaign berjalan, pencapaian per brand, revisi terbuka, dan ringkasan engagement.
- **Admin** — kelola user, role, nomor WhatsApp, dan campaign, plus panel **Undangan Belum Dipakai** untuk memantau email yang sudah diundang tapi belum mendaftar.
- **Rekomendasi** — pillar / format design / hari posting terbaik berdasarkan ER, plus daftar aksi mendesak (lewat deadline, approval menggantung, revisi terbuka, engagement belum diisi).
- **Report Harian** — checklist tugas per role, progress ring, pratinjau pesan, dan pengiriman WhatsApp.
- **8 tema warna** termasuk dua mode gelap.

## Setup Firebase (sekali saja, ±10 menit)

1. **Buat project** di [console.firebase.google.com](https://console.firebase.google.com) → Add project.
2. **Authentication** → Get started → aktifkan **Email/Password**.
3. **Firestore Database** → Create database (lokasi `asia-southeast2` / Jakarta) → production mode.
4. **Storage** → Get started.
5. **Config web app** → Project Settings → General → Your apps → ikon `</>` → salin objek `firebaseConfig`.
6. **Tempel config** ke `firebase-config.js` (ganti semua nilai `GANTI_...`).
7. **Pasang security rules**:
   - Firestore → Rules → tempel isi `firestore.rules` → Publish.
   - Storage → Rules → tempel isi `storage.rules` → Publish.

> Tidak perlu index Firestore tambahan. Kalau console minta index, kosongkan dulu array `indexes` di `firestore.indexes.json`.

## Buat akun admin pertama (bootstrap)

1. Firestore Console → Start collection → nama koleksi: `userRoles`.
2. Document ID: **email admin** (huruf kecil semua), field `role` (string) = `admin`.
3. Buka website → **Daftar** → isi nama, email tersebut, dan password.
4. Setelah login, daftarkan email tim lain lewat menu **Admin**.

> **Penting:** mendaftarkan email hanya membuat *undangan* (dokumen di koleksi `userRoles`). Orangnya tetap harus mendaftar sendiri di halaman login memakai email yang sama, baru profilnya dibuat di koleksi `users` dan namanya muncul di tabel **User Terdaftar**. Panel **Undangan Belum Dipakai** menampilkan siapa saja yang masih tertahan di tahap ini, lengkap dengan tombol kirim instruksi lewat WhatsApp.

## Menjalankan / deploy

Tes lokal: buka `index.html` di browser setelah `firebase-config.js` diisi.

Paket ini **sudah menyertakan `firebase.json` dan `.firebaserc`**, jadi tidak perlu `firebase init`. Salin seluruh isi folder `content-plan-app` ke folder kerja (mis. `c:\content-plan`), lalu:

```bash
npm install -g firebase-tools
firebase login
cd c:\content-plan
firebase deploy --only hosting,firestore:rules --project konten-plan
```

`firebase.json` harus sejajar dengan `index.html`, bukan di dalam subfolder.

### Isi firebase.json

| Bagian | Guna |
|---|---|
| `public: "."` | folder kerja langsung jadi root hosting, tanpa `public/` |
| `ignore` | README, PANDUAN, `apps-script/`, dan berkas rules tidak ikut diunggah ke web |
| `rewrites` | semua path diarahkan ke `index.html` (aplikasi satu halaman) |
| `headers` | `Cache-Control: no-cache` untuk `.html` dan `.js`, supaya versi baru langsung terlihat tanpa hard refresh |

Header no-cache itu sengaja dipasang: aplikasi ini satu file HTML besar, dan tanpa header tersebut browser menahan versi lama sampai cache-nya kedaluwarsa — penyebab paling sering laporan "sudah deploy tapi tampilannya belum berubah".

### Jangan timpa firebase-config.js

`firebase-config.js` di paket berisi contoh kosong. Berkas milik pengguna berisi kunci project asli — simpan dulu sebelum mengekstrak paket baru, atau kembalikan setelahnya.

### Error "Not in a Firebase app directory"

```
Error: Not in a Firebase app directory (could not locate firebase.json)
```

Firebase tidak menemukan `firebase.json` di folder tempat perintah dijalankan. Dua sebab yang paling sering:

1. **Berkasnya tidak ada.** Paket sebelum v26 tidak menyertakannya. Salin ulang dari paket ini.
2. **Namanya salah.** Notepad di Windows diam-diam menambahkan `.txt`, dan Explorer menyembunyikan akhiran berkas yang dikenalnya — jadi `firebase.json.txt` terlihat seperti `firebase.json`. Cek dengan `dir /a firebase*`, perbaiki dengan `ren firebase.json.txt firebase.json`.

Panduan langkah demi langkahnya ada di PANDUAN.md bagian 41.

## Matriks hak akses

| Aksi | Admin | Manager | Supervisor | Copywriter | Content Creator | Designer |
|---|---|---|---|---|---|---|
| Lihat semua plan, dashboard, engagement | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Tambah/hapus konten | ✔ | — | — | ✔ | — | — |
| Edit brief (isi konten) | ✔ | — | — | ✔ | — | — |
| Update status, file, link | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Tambah catatan revisi | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Tandai catatan selesai | ✔ | ✔ | ✔ | ✔ | — | — |
| Hapus catatan | ✔ | — | — | — | — | — |
| Input data engagement | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| Appr Brief SPV | ✔ | — | ✔ | — | — | — |
| Appr Brief MGR | ✔ | ✔ | — | — | — | — |
| Kelola campaign | ✔ | ✔ | — | — | — | — |
| Kelola user & role | ✔ | — | — | — | — | — |
| Download report Excel | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

## Struktur data (Firestore)

- `users/{uid}` — nama, email, role, `wa` (nomor WhatsApp), `theme` (tema pilihan)
- `userRoles/{email}` — role (dibuat admin, dipakai saat pendaftaran)
- `campaigns/{id}` — nama, brand, mulai, selesai, aktif
- `ads/{id}` — platform (`meta`|`tiktok`), brand, nama, objective, status, tanggalMulai/Selesai, budget, spend, impressions, reach, clicks, hasil, omset, catatan
- `transaksiHarian/{outlet}_{YYYY-MM}` — outlet, bulan, targetTransaksi, targetOmset, `harian: {'01': {trx, omset}, ...}`
- `programTimeline/{id}` — nama, brand, kategori, status, pic, tanggalMulai/Selesai, warna, catatan, `tahapan: [{nama, mulai, selesai, pic, selesaiFlag}]`
- `kontakEvent/{id}` — nama, kota (`Pekanbaru` / `Medan` / `Lainnya`), peran, instansi, wa, telepon, email, catatan, dibuatOleh, dibuatAt, diubahAt
- `pengaturan/budgetUgc` — `budget: {'storypie_2026-09': 4000000, 'ads_storypie_2026-09': 10000000, ...}`
  Kunci tanpa awalan = budget UGC & KOL; kunci berawalan `ads_` = budget iklan. Keduanya per brand per bulan.
- `pengaturan/wa` — webAppUrl, jamKirim, targetWa, token, aktif, updatedBy, updatedAt, terakhirTes
- `kpiCustom/{id}` — nama, autoMetrik, target, satuan, role, brand, arah, aktif, `nilai: {'YYYY-MM': angka}`
- `ugcKol/{id}`:

```js
{
  brand: 'storypie' | 'gumik',
  tipe: 'UGC' | 'Influencer' | 'KOL',
  nama, akunIg, akunTiktok, followerIg, followerTt,
  produk,                       // produk yang diberikan
  nilaiProduk, feeVisit,        // rupiah; total = nilaiProduk + feeVisit
  nominal,                      // total (disimpan juga untuk kompatibilitas)
  statusBayar: 'Belum dibayar' | 'Sudah dibayar' | 'Tanpa fee', tanggalBayar,
  outlet,                       // outlet yang dikunjungi
  tanggalVisit, tanggalUpload,  // 'YYYY-MM-DD'
  status: 'Dijadwalkan' | 'Sudah Visit' | 'Sudah Upload' | 'Batal',
  linkIg, linkTt, catatan,
  engagement: { ig:{...}, tiktok:{...}, tanggalUkur }
}
```
- `contentPlans/{id}`:

```js
{
  brand: 'storypie' | 'gumik',
  jenisDesign, jenisKonten, pillar, cta, refrensi,
  keyMessage, brief, kebutuhanThumbnail,
  tanggalPosting, deadlineDesign, tanggalTake, tanggalEditing,  // 'YYYY-MM-DD'
  status: 'Draft'|'Brief Ready'|'On Design'|'On Editing'|'Scheduled'|'Posted'|'Revisi',
  jenisKonten: 'Awareness'|'Value Brand'|'Soft Promo',                 // dropdown
  warna: ''|'merah'|'oranye'|'kuning'|'hijau'|'biru'|'ungu'|'abu',     // penanda warna

  jamPosting: 'HH:MM',            // jadwal jam upload
  deadlineBrief: 'YYYY-MM-DD',    // deadline pembuatan content plan
  briefSelesaiAt: ISO datetime,   // distempel otomatis
  designSelesaiAt: ISO datetime,  // distempel otomatis
  postedAt: ISO datetime,         // distempel otomatis
  fileUploadedAt: ISO datetime,
  picCopywriter, picDesigner, picContentCreator,   // nama PIC untuk KPI per orang
  link, fileUrl, fileName, filePath,
  apprSpv: 'pending'|'approved'|'revisi', apprSpvBy, apprSpvAt,
  apprMgr: 'pending'|'approved'|'revisi', apprMgrBy, apprMgrAt,

  revisiNotes: [                       // BARU
    { note, by, role, at, tipe:'revisi'|'catatan', selesai, selesaiBy, selesaiAt }
  ],

  engagement: {                        // BARU
    ig:     { reach, views, likes, comments, shares, saves },
    tiktok: { views, likes, comments, shares, saves },
    igLink, ttLink, tanggalUkur, catatan, updatedBy, updatedAt
  }
}
```

## Cara KPI dihitung

Tidak ada input manual. Aplikasi menstempel waktu sendiri saat status konten diubah:

| Stempel | Kapan direkam | Dibandingkan dengan |
|---|---|---|
| `briefSelesaiAt` | pertama kali status keluar dari Draft/Revisi | `deadlineBrief` (akhir hari) |
| `designSelesaiAt` | status mencapai On Editing ke atas, atau file pertama diupload | `deadlineDesign` (akhir hari) |
| `postedAt` | status berubah jadi Posted | `tanggalPosting` + `jamPosting` |

Hasilnya tiga kategori: **Ontime**, **Telat**, atau **Belum**. Yang "Belum" (belum dikerjakan atau deadline-nya kosong) tidak ikut menurunkan capaian — capaian dihitung `ontime / (ontime + telat)`.

Toleransi keterlambatan upload: **60 menit**. Ubah di konstanta `TOLERANSI_MENIT` dalam `index.html`. Kalau jam postingan kosong, dipakai `JAM_DEFAULT` (23:59).

KPI per orang memakai field PIC (`picCopywriter`, `picDesigner`, `picContentCreator`) yang dipilih dari daftar user dengan role tersebut. Kalau kosong, kontennya masuk baris "(belum ditentukan)" tapi tetap terhitung di level tim.

### Metrik otomatis untuk Custom KPI

`ontime_brief`, `ontime_design`, `ontime_upload`, `jumlah_konten`, `isi_engagement`, `total_reach_ig`, `total_views_tt`, `rata_er`, `jumlah_kolaborasi`, `jumlah_kol`, `jumlah_ugc`, `nominal_kolaborasi`, `jangkauan_kolaborasi`, `ads_spend`, `ads_roas`, `ads_hasil`, `ads_ctr`, `trx_pencapaian`, `trx_total`, `omset_total`, `program_selesai` — atau kosongkan untuk input manual per bulan. Nilai manual disimpan sebagai map `nilai: {'2026-09': 12}` di dokumen KPI itu sendiri, jadi tidak ada koleksi tambahan.

## Rumus metrik iklan

```
CTR  = klik ÷ impresi × 100%
CPC  = spend ÷ klik
CPM  = spend ÷ impresi × 1.000
CPA  = spend ÷ hasil
ROAS = omset ÷ spend
```

Warna ROAS: hijau ≥ 3x, kuning 1–3x, abu < 1x.

## Arti tanda warna

| Warna | Label baku | Dipakai untuk |
|---|---|---|
| 🔴 Merah | Urgent | harus dikerjakan hari ini |
| 🟠 Oranye | Perlu dicek | ada yang meragukan, minta second opinion |
| 🟡 Kuning | Menunggu aset | nunggu foto produk, footage, atau data |
| 🟢 Hijau | Siap tayang | semua beres, tinggal posting |
| 🔵 Biru | Ide baru | belum masuk jadwal pasti |
| 🟣 Ungu | Campaign | bagian dari campaign tertentu |
| ⚪ Abu | Ditunda | sengaja digeser ke periode lain |

Label bisa diubah di `index.html`, cari konstanta `MARKS`.

Menambah pilihan jenis konten: ubah konstanta `JENIS_KONTEN` di file yang sama.

Menambah kota atau peran di Kontak Event: ubah konstanta `KOTA` dan `PERAN_KONTAK` di `index.html`.

## Rumus engagement rate

- **ER Instagram** = (likes + komentar + shares + saves) ÷ reach × 100
  Kalau reach kosong, pakai views Reels.
- **ER TikTok** = (likes + komentar + shares + saves) ÷ views × 100

Warna di tabel: hijau ≥ 4%, kuning 1,5–4%, abu < 1,5%.

## Backup & pemulihan

Semua data hidup di Firestore. Firebase paket Spark tidak menyediakan export terjadwal, jadi backup dilakukan manual dari aplikasi — menu **Admin** → panel **Backup Seluruh Data**.

Dua format, keduanya dibuat di browser tanpa server:

| Tombol | Berkas | Isi | Dipakai untuk |
|---|---|---|---|
| **Backup Excel** | `BackupLengkap_ContentPlanHub_YYYYMMDD_HHMM.xlsx` | 16 sheet | dibaca manusia, diarsipkan, dianalisa di Excel / Google Sheets |
| **Backup JSON** | `BackupLengkap_ContentPlanHub_YYYYMMDD_HHMM.json` | data mentah + metadata | dipulihkan kembali ke aplikasi |

Sheet di berkas Excel: Ringkasan Backup, Content Plan, Notes Revisi, Engagement Konten, UGC & KOL, Report Ads, Timeline Program, Tahapan Program, Kontak Event, Budget, Campaign, User, Undangan, Custom KPI.

Data `transaksiHarian` tidak lagi punya sheet Excel karena modulnya sudah dihapus, tapi **tetap ikut di berkas backup JSON**: dibaca sekali saat login lewat `.get()` tanpa listener, dan ikut dipulihkan oleh Restore. Jadi kalau modulnya dikembalikan, datanya masih utuh.

Koleksi yang ikut dalam JSON: `contentPlans`, `ugcKol`, `ads`, `programTimeline`, `kontakEvent`, `campaigns`, `users`, `userRoles`, `kpiCustom`, `transaksiHarian`, plus `pengaturan` (jadwal WA & budget UGC).

### Pemulihan

Panel **Pulihkan dari Backup JSON** menerima berkas `.json` hasil backup, menampilkan isinya dulu (jumlah dokumen per koleksi, tanggal dibuat, siapa yang membuat), lalu meminta ketik `PULIHKAN` sebelum tombolnya aktif.

Sifat pemulihan:

- **Additive.** Dokumen ditulis dengan `set(..., {merge:true})`. Dokumen yang ada di aplikasi tapi tidak ada di berkas **tidak dihapus**.
- Dokumen dengan ID yang sama akan **ditimpa** oleh isi berkas.
- Berkas yang bukan backup aplikasi ini ditolak (dicek lewat field `aplikasi`). Nama lama "Content Plan Hub" tetap diterima.
- Password tidak ikut dibackup — akun Auth tetap harus ada. Koleksi `users` yang dipulihkan hanya mengembalikan nama, role, dan preferensi.
- Hanya role **admin** yang melihat panel ini.

Saran ritme: backup JSON + Excel minimal sebulan sekali, simpan di Google Drive perusahaan. Wajib backup sebelum melakukan pemulihan.

## Ringkasan bulanan & rekomendasi

Tiga modul — **Engagement**, **Report Ads**, dan **Report Budget** — menampilkan dua kartu tambahan di bawah kartu angka: **Ringkasan Bulanan** dan **Rekomendasi yang Dijalankan**.

Semuanya dihitung di browser dari data yang sudah diinput tim. Tidak ada API, tidak ada model bahasa, tidak ada biaya — hanya aturan yang dituliskan eksplisit di kode, jadi hasilnya bisa ditelusuri dan diperdebatkan.

### Struktur kode

Tiap modul punya sepasang fungsi:

| Fungsi | Mengembalikan |
|---|---|
| `dataInsightTrx(outlet, bulan)` | `{narasi, fakta[], status, rek[]}` |
| `dataInsightEng(rows, judulPeriode)` | idem |
| `dataInsightAds(rows, judulPeriode, namaBrand)` | idem |
| `dataInsightBudget(brand, bulan)` | idem |
| `renderInsight(d)` | HTML dua kartu (dipakai `insightTrx()` dkk.) |
| `sheetInsight(d, judul)` | baris untuk sheet Excel, HTML sudah dibersihkan `polos()` |

Bentuk satu rekomendasi:

```js
{ pri: 'tinggi' | 'sedang' | 'rendah',
  judul: 'Kejar kekurangan omset Rp 4,7 jt dalam 1 hari tersisa',
  kenapa: 'Target omset <b>…</b>, proyeksi saat ini <b>…</b>…',
  dampak: 'Butuh tambahan <b>Rp … per hari</b> — setara …',
  aktivitas: ['…', '…'] }
```

Rekomendasi hanya muncul kalau syarat datanya terpenuhi, lalu diurutkan tinggi → sedang → rendah. Kalau tidak ada yang mendesak, kartunya menampilkan pesan bahwa semuanya dalam batas wajar.

### Ambang yang dipakai

| Modul | Aturan |
|---|---|
| Transaksi | proyeksi omset < target → rekomendasi kejar gap; AOV < 95% AOV target → rekomendasi naikkan nilai struk; tren 7 hari < −8% → rekomendasi tahan penurunan; hari terkuat > 1,4× hari terlemah → rekomendasi ratakan; `pctPace` ≥ 100 → rekomendasi amankan |
| Engagement | ada konten Posted tanpa engagement → lengkapi; jenis konten terbaik > 1,5× terlemah → geser porsi; platform kuat > 1,6× lemah → perbaiki platform lemah; ER gabungan < 1,5% → perbaiki hook |
| Report Ads | campaign dengan spend tapi omset kosong → lengkapi; ROAS < 1 → hentikan/rombak; ROAS ≥ 3 → tambah budget; CTR < 1% di atas 5.000 impresi → ganti creative; sisa budget > 25% → alokasikan |
| Report Budget | realisasi > budget → tahan pengeluaran; realisasi < 60% → alokasikan sisa; ada fee visit belum dibayar → bayar; ROAS iklan < 1 → geser porsi anggaran; budget belum diatur → tetapkan |

Angka proyeksi memakai rumus yang sama dengan kartu gauge (`trxRekap`), jadi ringkasan dan grafik tidak pernah berbeda.

### Ikut terbawa ke Excel

Export Excel keempat modul mendapat sheet baru **Ringkasan & Rekomendasi** berisi narasi, semua angka kunci, dan seluruh rekomendasi lengkap dengan Kenapa / Target dampak / Aktivitas — tag HTML dibersihkan lewat `polos()` supaya rapi di sel spreadsheet.

## Generator content plan

Tombol **✨ Buat Otomatis** di halaman Content Plan (hanya untuk role `copywriter` dan `admin`, sama seperti tombol Tambah Konten).

Semuanya dihitung di browser dari aturan yang ditulis eksplisit di `index.html` — tanpa API, tanpa model bahasa, tanpa biaya.

### Cara kerja

1. **Kenali tema** — `kenaliTema(nama)` mencocokkan nama campaign dengan `TEMA_KUNCI` (11 tema: gifting, promo, milestone, launch, ramadan, akhir tahun, valentine, nilai produk, kolaborasi, kemitraan, edukasi). Maksimal 2 tema diambil.
2. **Susun tanggal** — `jadwalTanggal()` menyaring rentang tanggal menurut pola posting (`POLA_TANGGAL`: harian, 5x, 4x, 3x, 2x seminggu) dan opsional melewati tanggal yang sudah ada kontennya.
3. **Bagi fase** — `bagiFase(n)` membagi tanggal ke empat fase dengan proporsi Teaser 20% · Peluncuran 20% · Penguatan 45% · Penutup 15%. Rentang pendek punya aturan sendiri (1 tanggal → hanya Peluncuran; 3 tanggal → Teaser, Peluncuran, Penutup).
4. **Ambil template** — `kolamFase()` menggabungkan kerangka dasar (`RANGKA`, selalu dipakai) dengan konten bertema (`BUMBU`, sesuai tema terdeteksi). Keduanya **diselang-seling**, bukan ditempel, supaya konten bertema tetap kebagian saat satu fase hanya dapat 2–3 slot.
5. **Isi kosakata brand** — `isiTemplate()` mengganti `{brand}`, `{produk}`, `{sapaan}`, `{konteks}`, `{momen}`, `{campaign}` memakai `BRAND_KATA` (Storypie: pie, oleh-oleh dan hadiah; Gumik: mie pangsit ayam, makan enak yang mengenyangkan).

### Yang dihasilkan per konten

| Field | Asal |
|---|---|
| `keyMessage` | judul template + kosakata brand |
| `brief` | arahan kerja template |
| `jenisKonten` | Awareness / Value Brand / Soft Promo sesuai fase |
| `jenisDesign`, `pillar` | dari template |
| `cta` | isian form, atau CTA baku brand |
| `tanggalPosting`, `jamPosting` | jadwal + jam dari form |
| `deadlineBrief` / `deadlineDesign` | H-5 / H-3 dari tanggal posting |
| `tanggalTake` / `tanggalEditing` | H-4 / H-2, hanya untuk design Reels/Video/Story |
| `warna` | penanda fase — biru (teaser), ungu (peluncuran), tanpa tanda (penguatan), merah (penutup) |
| `status` | selalu `Draft` |
| `campaignId`, `campaignNama`, `fase`, `dibuatGenerator` | penanda asal |

Penulisan memakai `db.batch()` per 400 dokumen agar aman terhadap batas 500 operasi per batch Firestore.

### Menambah atau mengubah template

- Kerangka dasar: konstanta `RANGKA` — empat kunci fase, tiap fase array template.
- Konten bertema: konstanta `BUMBU` — dikunci per tema lalu per fase.
- Kata kunci pendeteksi tema: konstanta `TEMA_KUNCI`.
- Kosakata brand: konstanta `BRAND_KATA`.

Bentuk satu template: `{jenis, design, pillar, judul, brief}` — `judul` dan `brief` boleh memakai placeholder di atas.

## Penanganan tanggal & zona waktu

Aplikasi ini dipakai di WIB (UTC+7), dan itu penting karena `Date.prototype.toISOString()` selalu mengubah waktu ke UTC lebih dulu.

Dua akibatnya di UTC+7:

- `new Date(2026, 9, 1).toISOString().slice(0,7)` → `"2026-09"`, bukan `"2026-10"`. Tengah malam waktu lokal masih pukul 17:00 UTC hari sebelumnya. Ini membuat navigasi bulan meleset satu bulan.
- `new Date().toISOString().slice(0,10)` mengembalikan tanggal kemarin untuk setiap jam 00:00–06:59 waktu lokal.

Aturan di kode ini:

| Kebutuhan | Pakai |
|---|---|
| Tanggal hari ini menurut kalender pengguna | `isoLokal(d)` / `todayISO()` |
| Bulan menurut kalender pengguna | `bulanLokal(d)` |
| Aritmetika atas string `YYYY-MM-DD` | `keUtc()`, `geserHari()`, `selisihHari()`, `hariKe()` — seluruhnya komponen UTC murni, hasilnya sama di zona waktu mana pun |

Jangan memakai `toISOString().slice()` langsung pada `Date` yang dibentuk dari komponen lokal.

## Penulis AI (opsional)

Dipakai **hanya untuk memperhalus** hasil generator. Semua yang menentukan struktur — pembagian fase, jadwal tanggal, deadline, komposisi jenis konten — tetap dihitung aturan lokal. AI hanya menulis ulang `keyMessage`, `brief`, dan mengisi `captionIde`.

Konsekuensinya: kalau kunci salah, kuota habis, jaringan mati, atau model menjawab ngawur, generator tetap menghasilkan rencana yang lengkap dan bisa disimpan. Ini diuji untuk enam mode kegagalan.

### Tiga penyedia

| Penyedia | Biaya | Endpoint | Autentikasi | CORS browser |
|---|---|---|---|---|
| **Google Gemini** | **ada paket gratis** | `generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` | kunci di query `?key=` | aman |
| **OpenAI (ChatGPT)** | berbayar | `api.openai.com/v1/chat/completions` | `Authorization: Bearer` | **tidak andal** — pernah diblokir, sarankan mode proksi |
| **Anthropic (Claude)** | berbayar | `api.anthropic.com/v1/messages` | `x-api-key` + `anthropic-version` | aman, lewat header `anthropic-dangerous-direct-browser-access: true` |

Hanya Gemini yang punya paket gratis; dua lainnya wajib isi saldo lebih dulu. Panel Admin menampilkan peringatan merah saat penyedia berbayar dipilih.

Semua beda antar penyedia dikurung di tabel `AI_PENYEDIA` — URL, header, bentuk badan permintaan, cara membaca jawaban, endpoint daftar model, dan urutan prioritas model. Sisa kodenya (`panggilAi`, `perhalusDenganAi`, `cariModelJalan`) tidak tahu-menahu soal penyedia.

Kunci dan model disimpan **terpisah per penyedia** (`apiKey_gemini`, `model_openai`, dan seterusnya), jadi berganti penyedia tidak menghapus isian penyedia sebelumnya. Field lama `apiKey` / `model` dari versi sebelumnya tetap dibaca sebagai milik Gemini.

Prompt meminta jawaban berbentuk **objek** `{"konten":[…]}`, bukan array, karena mode `response_format: json_object` milik OpenAI menolak array di tingkat atas.

Proksi Apps Script juga meneruskan `penyedia`, dengan kunci terpisah di Script Properties: `AI_KEY`, `AI_KEY_OPENAI`, `AI_KEY_ANTHROPIC`.

### Dua mode koneksi

| Mode | Jalur | Kunci API | Setup |
|---|---|---|---|
| **Langsung** | browser → Google | tersimpan di `pengaturan/ai`, ikut terkirim ke browser setiap user yang login | tempel kunci di panel Admin |
| **Lewat Apps Script** | browser → Apps Script → Google | tersimpan di Script Properties `AI_KEY`, tidak pernah meninggalkan server Google | tambah `AI_KEY`, pakai `Code.gs` yang punya `doPost` |

Firebase paket Spark tidak menyediakan Cloud Functions, jadi tidak ada cara menyembunyikan kunci di sisi aplikasi sendiri. Mode proksi memakai Apps Script yang memang sudah dipasang untuk report WhatsApp, jadi tidak menambah layanan baru.

Rules Firestore mengunci tulis `pengaturan/ai` ke role `admin` saja (baca tetap semua user yang login — itu yang membuat kunci terbaca di mode Langsung).

### Daftar model: diambil, lalu dicoba

Dua lapis, karena satu saja tidak cukup:

Nama model Google berubah cukup sering, jadi daftar yang ditulis di kode hanya dipakai sebagai cadangan. Tombol **🔄 Muat Daftar Model** memanggil `ambilDaftarModel()` → `GET /v1beta/models` (atau `aksi:'ai_models'` lewat proksi), menyaring yang mendukung `generateContent`, membuang model non-teks (`embedding`, `imagen`, `veo`, `tts`, `aqa`), lalu mengurutkan flash-lite → flash → pro supaya yang hemat kuota ada di atas. Kolom ketik diganti `<select>` oleh `gambarPilihanModel()`.

Kalau pengambilan gagal, kolomnya tetap berupa input teks dengan `datalist` cadangan — pengaturan tetap bisa diselesaikan manual.

**Daftar itu tidak menjamin model bisa dipakai.** Google mengembalikan model di `models.list` lengkap dengan `supportedGenerationMethods: ["generateContent"]`, tapi `generateContent` tetap membalas **404** kalau model itu dibatasi ke akun yang sudah pernah memakainya. Akun baru kena ini pada seluruh seri 2.5.

Karena itu ada `cariModelJalan()`: mengambil daftar, lalu memanggil `cobaSatuModel()` berurutan dengan permintaan 8 token sampai ada yang membalas 200, lalu memilihnya. Hasilnya disimpan di `aiModelStatus` dan ditampilkan sebagai ✅/❌ di dropdown. Urutan coba: flash-lite → flash → pro, lalu versi terbaru dulu.

Daftar cadangan `AI_MODEL_PILIHAN` dan `AI_MODEL_BAKU` harus diperbarui kalau Google merilis seri baru — tapi keduanya hanya dipakai sampai pengguna menekan salah satu tombol di atas.

### Alur kode

| Fungsi | Tugas |
|---|---|
| `aiAktif()` | apakah AI siap dipakai (mode + kunci/URL terisi) |
| `ambilDaftarModel()` / `muatModelAi()` | mengambil daftar model asli dari kunci yang dipakai |
| `cobaSatuModel()` / `cariModelJalan()` | mencoba tiap model sungguhan sampai ketemu yang tidak ditolak |
| `panggilAi(prompt, opt)` | satu panggilan model, timeout 90 detik, `AbortController`, error diterjemahkan ke bahasa Indonesia oleh `terjemahGalatAi()` |
| `uraiJsonAi(teks)` | membaca JSON walau dibungkus ```` ```json ```` atau didahului teks pengantar |
| `promptPerhalus()` | menyusun prompt: konteks brand + catatan tim + daftar draf |
| `perhalusDenganAi()` | memecah jadi batch 8 konten, menggabungkan hasil, menghitung berhasil/gagal |
| `genPerhalus()` | tombol di pratinjau — bekerja pada **salinan** `genHasil`, baru menimpa kalau ada yang berhasil |

Batch 8 dipilih supaya satu kegagalan tidak menjatuhkan seluruh rencana, dan supaya mutu tulisan tidak turun karena konteks terlalu panjang. Kegagalan sebagian dilaporkan apa adanya ("8 ditulis ulang, 5 gagal dan tetap memakai draf aturan").

### Catatan brand

Panel Admin punya kolom **Catatan Brand** per brand yang ikut dikirim di setiap prompt. Ini yang paling menentukan mutu hasil — tanpa itu model hanya tahu "pie" dan "mie pangsit ayam". Isi dengan varian produk, karakter pembeli, dan nada bicara yang dipakai.

### Yang dilarang di prompt

Prompt secara eksplisit melarang model mengarang harga, diskon, angka, tanggal, alamat, dan klaim kesehatan, serta melarang gaya iklan lama ("kualitas terbaik", "jangan sampai ketinggalan"). Hasilnya tetap berstatus Draft dan tetap lewat approval Supervisor dan Manager seperti biasa.

## Sumber Info (survei konsumen)

Satu-satunya bagian aplikasi yang terbuka untuk publik.

### Dua halaman

| Berkas | Siapa | Guna |
|---|---|---|
| `form.html` | konsumen, tanpa login | mengisi dari mana mereka tahu tentang kita |
| menu **Sumber Info** | tim, setelah login | rekap jawaban + mengatur isi form |

`form.html` berdiri sendiri: punya CSS-nya sendiri, hanya memuat Firebase App + Firestore, dan tidak menyentuh `index.html`. Firebase Hosting menyajikan berkas statis sebelum menerapkan rewrite `**` → `/index.html`, jadi tautannya bekerja tanpa perubahan `firebase.json`.

### Tidak ada pertanyaan yang ditulis di kode

Semuanya dibaca dari `pengaturan/survei`:

```js
{ aktif, judul, sapaan, terimaKasih,
  outlets:    [{nama, aktif}],
  pertanyaan: [{teks, tipe:'pilihan'|'teks', wajib, opsi:[]}] }
```

Jawaban masuk ke `surveiJawaban`: `{outlet, outletNama, jawaban:{<teks pertanyaan>: <jawaban>}, at}`.

**Kunci jawaban adalah teks pertanyaannya, bukan nomor urut.** Kalau tim menambah atau memindahkan pertanyaan, jawaban lama tetap menempel pada pertanyaan yang benar. Dengan nomor urut, menyisipkan satu pertanyaan di tengah akan menggeser seluruh riwayat ke pertanyaan yang salah — diam-diam, tanpa error.

### Menulis tanpa login

Ini satu-satunya tulisan tanpa autentikasi di seluruh basis data, jadi pintunya dibuat sesempit mungkin di `firestore.rules`:

- hanya empat field yang diterima (`hasOnly`), masing-masing dibatasi panjangnya
- `jawaban` wajib berisi 1–12 kunci
- `get()` ke `pengaturan/survei` — **create ditolak kalau form sedang dimatikan**, jadi sakelar di menu Sumber Info benar-benar menutup pintunya
- `update` dikunci mati: jawaban yang masuk tidak bisa diubah siapa pun, termasuk admin. Kalau bisa diedit, angkanya berhenti menjadi bukti.
- `delete` hanya admin & manager

`pengaturan/survei` sengaja `allow read: if true` karena halaman publik perlu membaca pertanyaannya. Isinya memang untuk dibaca umum dan tidak memuat kredensial apa pun.

**Yang tidak bisa dicegah aturan Firestore:** pengiriman berulang oleh orang yang sama, atau spam. Tidak ada rate limit di sisi aturan pada paket Spark. Penangkalnya adalah sakelar aktif/mati dan hak hapus admin. Untuk survei di meja kasir, risikonya kecil; kalau tautannya disebar luas, pantau jumlah jawaban yang masuk.

### Tautan per store

`form.html?o=<nama store>` melewati pertanyaan "kamu di store mana" dan langsung mengisinya. Ini yang dipakai untuk QR yang ditempel di satu store — konsumen tidak perlu memilih, dan datanya tidak bisa salah store. Tombol **Salin tautan** dan **Download barcode A4** per store ada di panel pengaturan. Barcode A4 berupa PDF siap cetak: judul "Bantu kami untuk berkomunikasi lebih baik lagi", ajakan "Scan barcode di bawah ya", QR berisi tautan store, nama store, dan tautannya.

### Pilihan "Lainnya"

Pilihan yang teksnya mengandung kata "lain" memunculkan kotak isian bebas. Yang disimpan adalah **teks yang diketik konsumen**, bukan kata "Lainnya" — jadi jawaban seperti "spanduk di jalan" langsung muncul sebagai barisnya sendiri di rekap, bukan tenggelam di satu kantong "Lainnya". Itu sebabnya `surveiHitung()` menambahkan kunci yang belum ada di daftar opsi, bukan membuangnya.

### Batas 2000

Langganan `surveiJawaban` dibatasi 2000 terbaru. Koleksi ini diisi publik, jadi tidak boleh tumbuh tanpa batas di memori browser. Rekap di luar batas itu tetap bisa diambil lewat ekspor Excel.

### Yang tidak dikumpulkan

Tidak ada nama, nomor telepon, email, cookie, atau pelacak. Yang tersimpan hanya jawaban, nama store, dan waktu kirim. Halaman form mengatakan ini apa adanya ke konsumen, dan `meta robots noindex` menjaganya tidak muncul di hasil pencarian.

## Deploy lewat GitHub

`.github/workflows/deploy.yml` menerbitkan hosting dan `firestore.rules` setiap kali ada push ke `main`. Penyiapannya sekali, langkah demi langkah ada di tutorial deploy bagian 9.

### Yang perlu disiapkan di GitHub

| Jenis | Nama | Isi |
|---|---|---|
| Secret | `FIREBASE_SERVICE_ACCOUNT` | seluruh isi JSON kunci service account |
| Variable | `FIREBASE_PROJECT_ID` | Project ID, hanya kalau bukan `konten-plan` |

Service account perlu tiga role: **Firebase Hosting Admin**, **Firebase Rules Admin**, dan **Service Usage Consumer**. Kalau ditolak karena izin, **Firebase Admin** mencakup ketiganya.

### Keputusan di dalam workflow

- **Kunci ditulis lewat `printf` dari variabel env**, bukan `echo` langsung di YAML — isi JSON mengandung tanda kutip dan newline yang akan merusak baris perintahnya.
- **`firebase-config.js` ikut repo, bukan jadi secret.** Isinya memang dikirim Firebase ke browser setiap pengunjung, jadi bukan rahasia; yang menjaga data adalah `firestore.rules`. Menjadikannya secret hanya menambah satu cara deploy bisa gagal diam-diam.
- **Ada langkah yang memeriksa `firebase-config.js` masih berisi `GANTI_` atau tidak**, dan menggagalkan deploy kalau iya. Tanpa itu, deploy "berhasil" tapi aplikasinya blank putih di browser — kegagalan yang paling lama ketahuan.
- **`concurrency` dengan `cancel-in-progress`** supaya dua push beruntun tidak berlomba, dan yang terbit selalu yang terakhir.
- **Versi `firebase-tools` dikunci di mayor `^15`** — patch tetap masuk, perubahan besar tidak tiba-tiba mematahkan deploy.
- **`.github` tidak ikut terdeploy** karena pola `**/.*` sudah ada di `ignore` pada `firebase.json`.

### Yang tidak diurus GitHub

Apps Script. Setelah `Code.gs` berubah, deployment-nya tetap perlu diperbarui tangan lewat **Manage deployments → New version**. Penanda versi (`VERSI_KODE` / aksi `versi`) ada supaya kelalaian itu kelihatan di panel Admin.

## Catatan teknis

- **Pendaftaran bebas kondisi balapan.** `createUserWithEmailAndPassword` otomatis memicu `onAuthStateChanged`, yang dulu bisa membaca `users/{uid}` sebelum dokumennya selesai ditulis lalu memaksa sign-out. Sekarang ada flag `registering` yang menahan handler tersebut, dan `bootProfile()` dipanggil manual setelah penulisan profil benar-benar selesai.
- **Pemulihan profil otomatis.** Kalau akun Auth ada tapi dokumen `users/{uid}` hilang, `bootProfile()` mencari undangan di `userRoles/{email}`. Bila ketemu, profil dibuat ulang (nama diambil dari `displayName`, atau ditanyakan sekali) dan user langsung bisa masuk. Kalau undangannya juga tidak ada, pesan errornya menyebutkan email mana yang perlu didaftarkan admin.
- Mendaftar dengan email yang akun Auth-nya sudah ada akan otomatis dialihkan ke sign-in lalu dipulihkan, bukan ditolak mentah-mentah.

- Library Excel: SheetJS via CDN (`cdn.sheetjs.com`). Kalau device offline, tombol Excel akan memberi tahu dan tidak crash.
- **Grid dua lapis harus sama-sama `minmax(0,1fr)`.** Kalender memakai satu grid untuk header hari dan satu grid untuk sel tanggal. `repeat(7,1fr)` berarti `minmax(auto,1fr)`, dan minimum `auto` mengikuti min-content isi selnya — satu URL panjang tanpa spasi cukup untuk melebarkan kolom itu dan menggeser seluruh baris terhadap headernya. `text-overflow:ellipsis` pada anaknya tidak menolong karena min-content tetap merambat naik lewat `.kal-sel` yang masih `min-width:auto`. Aturannya: setiap grid yang isinya bisa panjang perlu `minmax(0,1fr)` di templatenya DAN `min-width:0` di itemnya.
- **Map bersarang & `set` merge.** Menulis `{harian:{}}` dengan `{merge:true}` TIDAK aman: map kosong tidak punya leaf path sehingga SDK menulisnya sebagai nilai dan menimpa map yang sudah ada. Untuk memperbarui satu sel, tulis map bersarang sampai ke leaf-nya: `set({harian:{'02':{trx:273}}}, {merge:true})` — cara ini juga membuat dokumen baru kalau belum ada, jadi tidak perlu `update()` terpisah yang gagal saat dokumen belum eksis.
- **Render ulang vs input yang sedang diketik.** `onSnapshot` menggambar ulang seluruh halaman. Saat kursor berpindah antar kolom ada jeda singkat di mana `document.activeElement` adalah `<body>`, jadi pengecekan activeElement saja tidak cukup — dipakai flag `trxSedangIsi` yang diset di `onfocus` dan baru dilepas 180 ms setelah `onblur` kalau fokusnya benar-benar keluar dari tabel. Selama flag aktif, render ditunda (`trxRenderTertunda`) dan hanya baris terkait + baris TOTAL yang di-patch.
- `revisiNotes` ditambahkan dengan `arrayUnion` supaya dua orang yang menulis bersamaan tidak saling menimpa.
- Filter dan pencarian tidak mereset posisi kursor: fokus input dipertahankan setiap render.
- Semua data engagement disimpan sebagai angka bulat (dibulatkan, minimal 0).


## Semua komponen gratis

| Komponen | Paket | Catatan |
|---|---|---|
| Firebase Hosting, Firestore, Auth, Storage | **Spark (gratis)** | tidak ada Cloud Functions sama sekali |
| SheetJS (export Excel) | gratis, open source | via CDN |
| Grafik bulanan | SVG buatan sendiri | tanpa library |
| Rekomendasi | dihitung di browser dari data sendiri | tanpa API AI berbayar |
| Kirim WA manual (link `wa.me`) | **gratis tanpa batas** | tidak perlu daftar apa pun |
| Kirim WA otomatis | Google Apps Script (gratis) + Fonnte (ada paket gratis) | opsional, lihat `apps-script/PANDUAN-WA.md` |

## Isi paket

```
content-plan-app/
├─ index.html              aplikasi utama (satu file)
├─ firebase-config.js      isi config Firebase kamu di sini
├─ firestore.rules         security rules Firestore
├─ storage.rules           security rules Storage
├─ README.md               dokumentasi teknis (file ini)
├─ PANDUAN.md              panduan pemakaian untuk tim (Bahasa Indonesia)
└─ apps-script/
   ├─ Code.gs              script report harian otomatis ke WhatsApp
   └─ PANDUAN-WA.md        cara pasang, langkah demi langkah
```
