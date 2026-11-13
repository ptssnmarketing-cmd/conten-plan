# Content Plan Hub — Storypie × Gumik

Web app perencanaan, approval, dan pelaporan konten dua brand. Firebase (Auth + Firestore + Storage), satu file `index.html`, tanpa build step.

## Yang baru di versi ini

| # | Permintaan | Hasil |
|---|---|---|
| 1 | Mobile friendly | Layout dirombak: menu bawah (bottom nav), sidebar geser, tabel berubah jadi kartu di HP, form jadi bottom sheet, semua tombol ≥ 32px, input font 16px biar iOS tidak auto-zoom |
| 2 | Header & footer tidak ikut scroll | Shell `position:fixed`. Header atas dan menu bawah diam, hanya area isi (`.main`) dan isi drawer yang bisa di-scroll. Header tabel juga sticky |
| 3 | Notes revisi | Setiap konten punya thread catatan: tipe **Minta Revisi** / **Catatan biasa**, penulis, role, waktu, dan status **Terbuka / Selesai**. Muncul juga sebagai badge di tabel & kartu |
| 4 | Input engagement IG & TikTok | Form khusus per konten: reach, views, likes, komentar, shares, saves per platform + link post + tanggal ambil data + catatan performa. ER dihitung otomatis |
| 5 | Sortir hari, bulan, tahun | Filter Tahun / Bulan / Tanggal + urutan tanggal naik-turun, di halaman Content Plan dan Engagement |
| 6 | Download report Excel | Tombol **⬇️ Excel** menghasilkan `.xlsx` 4 sheet: Ringkasan, Content Plan, Engagement, Notes Revisi — mengikuti filter yang sedang aktif |
| 7 | Ganti tema warna | 8 tema (Maroon, Rose, Amber, Forest, Ocean, Plum, Dark, Midnight) lewat tombol 🎨 di header. Tersimpan di perangkat **dan** di akun, jadi ikut saat login di HP lain |
| 8 | Report task harian ke WA per role | Menu **Report Harian**: daftar tugas sudah/belum dikerjakan sesuai role + tombol kirim WhatsApp. Ada dua cara: klik manual (gratis tanpa batas) atau otomatis tiap pagi lewat Google Apps Script + Fonnte |
| 9 | Grafik pencapaian bulanan | Bar chart 12 bulan (direncanakan vs tayang) + garis rata-rata ER, bisa difilter per brand & tahun. SVG buatan sendiri, tanpa library berbayar |
| 10 | Menu Rekomendasi | Analisis otomatis dari data sendiri: pillar/format/hari posting paling efektif, daftar hal yang perlu ditindaklanjuti, dan saran untuk bulan depan |
| 11 | Marking konten pakai warna | 7 tanda warna (Urgent, Perlu dicek, Menunggu aset, Siap tayang, Ide baru, Campaign, Ditunda). Muncul sebagai garis kiri di baris tabel, garis + label di kartu HP, bisa difilter, dan ikut terekspor ke Excel |
| 12 | Jenis Konten jadi dropdown | Pilihan baku: **Awareness**, **Value Brand**, **Soft Promo**. Nilai lama tetap tersimpan dan ditandai "(lama)" di dropdown |
| 13 | Pencatatan KPI otomatis | Jejak waktu direkam sendiri saat status berubah: brief selesai, design selesai, dan waktu upload. Tidak ada input manual |
| 14 | Ontime upload (tanggal + jam) | Field **Jam Postingan** baru. Ontime dihitung dari `postedAt` vs `tanggalPosting + jamPosting`, toleransi 60 menit |
| 15 | Ontime pembuatan content plan | Field **Deadline Brief** baru. Ontime dihitung dari `briefSelesaiAt` vs akhir hari deadline brief |
| 16 | Engagement dipisah platform & brand | 4 kartu ringkasan (Storypie IG, Storypie TikTok, Gumik IG, Gumik TikTok) + segmented filter platform + sheet Excel "Per Platform" |
| 17 | KPI bulanan per tim | Tab **Per Tim**: capaian Copywriter, Designer, Content Creator — level tim sekaligus per orang lewat field PIC |
| 18 | Custom KPI | Tab **Custom KPI**: buat KPI sendiri, target, satuan, arah target, sumber nilai otomatis (8 metrik) atau input manual per bulan |
| 19 | Tampilan lebih modern | Segmented control menggantikan tumpukan dropdown, kartu gauge dengan progress bar, sudut lebih membulat, spasi & tap target lebih lega |
| 20 | Modul UGC & KOL | Menu baru untuk mencatat kolaborasi UGC, Influencer, dan KOL per bulan: produk yang diberikan, nominal rupiah, outlet yang dikunjungi, tanggal visit, tanggal upload, plus engagement IG & TikTok |
| 21 | Menu digabung jadi dropdown | Plan Storypie + Plan Gumik jadi satu menu **Content Plan** dengan dropdown brand. UGC & KOL memakai pola yang sama |
| 22 | Panel kirim WA otomatis di menu Admin | URL Apps Script Web App, jam kirim, nomor/ID grup tujuan, dan token keamanan bisa diatur langsung dari aplikasi, lengkap dengan tombol Kirim tes dan Terapkan jadwal |
| 23 | Report Ads Meta & TikTok | Menu baru: campaign iklan per platform & brand, budget vs spend, impresi, klik, CTR, CPC, CPM, hasil, CPA, omset, dan ROAS — semua metrik turunan dihitung otomatis |
| 24 | Transaksi harian per outlet | Menu baru untuk Storypie Pekanbaru, Storypie Medan, dan Gumik: target diinput sekali untuk sebulan, actual diisi harian, lengkap dengan pace terhadap hari berjalan, proyeksi akhir bulan, dan grafik kumulatif |
| 25 | Timeline program (Gantt) | Menu baru: program dengan tahapan, PIC, warna, progress otomatis dari tahapan yang selesai; tampilan Bulan / Kuartal / Tahun dengan garis penanda hari ini |
| 26 | Tampilan kalender di Content Plan | Tombol geser Daftar / Kalender. Kalender bulanan menampilkan konten per tanggal dengan warna status dan tanda; di HP jadi titik warna yang bisa diketuk |
| 27 | Report Budget | Menu baru yang menggabungkan pengeluaran iklan dan UGC & KOL: budget per pos, donat proporsi, hasil yang didapat, dan grafik budget vs realisasi 12 bulan |
| 28 | Grafik target vs actual harian | Di Transaksi Harian: batang per tanggal (hijau kalau mencapai target harian, merah kalau di bawah), grafik kumulatif, dan perbandingan ketiga outlet |
| 29 | Form konten jadi bagian yang bisa dilipat | Brief & Jadwal, Produksi & Status, Penanggung Jawab, File, Notes Revisi, Approval, Engagement — masing-masing bisa dibuka-tutup, dengan ringkasan di judulnya |
| 30 | Backup seluruh data | Panel di menu **Admin**: **Backup Excel** (16 sheet berisi semua modul) dan **Backup JSON** (data mentah untuk dipulihkan). Ada juga **Pulihkan dari Backup JSON** dengan konfirmasi ketik `PULIHKAN` |
| 31 | Kontak pengelola event | Menu baru **Kontak Event**: buku kontak per kota (Pekanbaru / Medan / Lainnya) berisi nama, peran, instansi, WhatsApp, telepon, email, catatan. Ada tombol chat WhatsApp langsung, salin kontak, pencarian, filter peran, dan export Excel |
| 32 | Perbaikan input transaksi harian | `simpanHarian()` dulu memanggil `set({harian:{}}, {merge:true})` sebelum `update()`. Map kosong pada set-merge ditulis sebagai nilai, sehingga seluruh map `harian` tertimpa dan hanya sel terakhir yang tersisa. Sekarang satu kali `set` dengan map bersarang `{harian:{[hh]:{[field]:nilai}}}` + `{merge:true}`. Ditambah: id stabil per input, patch baris & TOTAL tanpa render ulang, penundaan render selama kursor masih di tabel, dan Enter untuk lompat ke tanggal berikutnya |
| 33 | Ringkasan bulanan di 4 modul | Engagement, Report Ads, Report Budget, dan Transaksi Harian masing-masing mendapat kartu **Ringkasan Bulanan**: satu paragraf narasi + 8 angka kunci, dihitung dari data yang sudah diinput tim. Ada badge status (Efisien / Sedikit tertinggal / Perlu tindakan / Belum ada data) |
| 34 | Rekomendasi yang dijalankan | Kartu kedua di tiap modul berisi rekomendasi yang diurutkan menurut prioritas, masing-masing dengan **Kenapa** (alasan berbasis angka), **Target dampak** (perkiraan hasil dalam rupiah atau unit), dan **Aktivitas** (langkah konkret). Contoh di Transaksi Harian: gap antara target omset dan proyeksi diterjemahkan jadi kebutuhan rupiah per hari, jumlah transaksi per hari, dan daftar program yang bisa dijalankan |
| 35 | Perbaikan kolom kalender | Header hari (Min–Sab) dan sel tanggal memakai dua grid terpisah. Sel tanggal memakai `1fr` yang minimumnya `auto`, sehingga judul konten panjang (URL Instagram, kalimat tanpa jeda) melebarkan kolomnya sendiri — grid jadi lebih lebar dari header dan tanggal terlihat bergeser dari nama harinya. Diperbaiki dengan `minmax(0,1fr)` pada kedua grid plus `min-width:0` dan `overflow:hidden` pada `.kal-sel`. Perhitungan hari (`new Date(y, m-1, 1).getDay()`) sendiri tidak pernah salah |
| 36 | Generator content plan dari nama campaign | Tombol **✨ Buat Otomatis** di Content Plan. Dari nama campaign, rentang tanggal, dan frekuensi posting, aplikasi menyusun rangkaian konten satu periode penuh dalam empat fase: Teaser → Peluncuran → Penguatan → Penutup. Tiap konten sudah punya judul, brief, jenis konten, jenis design, pillar, CTA, jam posting, dan deadline brief/design/take/editing. Semua dibuat berstatus **Draft** |
| 37 | Perbaikan zona waktu (WIB) | `toISOString()` mengubah waktu ke UTC. Di WIB (UTC+7) itu membuat `new Date(y,m,1)` selalu jatuh ke bulan sebelumnya — navigasi bulan di Kalender, Report Budget, dan Timeline Program meleset satu bulan — dan membuat `todayISO()` mengembalikan tanggal kemarin setiap pukul 00:00–06:59. Semua perhitungan tanggal sekarang lewat `isoLokal()` / `bulanLokal()` (komponen lokal) dan `keUtc()` (aritmetika ISO bebas zona waktu) |
| 38 | Penulis AI untuk generator | Opsional, memakai **Google AI Studio** (paket gratis, tanpa kartu kredit). Tombol **✨ Perhalus AI** di pratinjau generator menulis ulang judul, brief, dan menambah draf caption. Dua mode koneksi: **Langsung** dari browser (mudah, kunci terbaca user yang login) atau **Lewat Apps Script** (kunci tersimpan di Script Properties, tidak pernah sampai ke browser). Kerangka fase, tanggal, dan deadline tetap dihitung aturan lokal — kalau AI gagal, draf aturan tetap utuh dan tetap bisa disimpan |
| 39 | Urutan tanggal tabel harian | Pilihan **Tanggal 1 di atas** / **Tanggal terbaru di atas** di Transaksi Harian, disimpan di `localStorage` (`trxUrut`). `trxEnter()` ikut arah yang dipilih, jadi Enter selalu pindah ke baris berikutnya yang terlihat, bukan selalu tanggal +1 |
| 40 | Sumber data ESB (omset otomatis) | Omset & jumlah transaksi harian ditarik dari **ESB Core API** lewat proksi Apps Script. Kredensial ESB hidup di Script Properties (`ESB_USER`, `ESB_PASS`) — tidak pernah sampai ke browser |
| 41 | ESB mode langsung — tidak disimpan | Data ESB tidak lagi ditulis ke Firestore sama sekali. Ditarik saat halaman Transaksi Harian dibuka, hidup di memori halaman, hilang saat tab ditutup. Yang tersimpan tinggal target bulanan dan angka yang diketik tim. `trxDoc()` menggabungkan keduanya dengan urutan menang: koreksi manual → ESB → sisa simpanan lama. Tombol **pakai ESB** per tanggal membuang koreksi manual |
| 42 | Jam sepi & rekomendasi program | Penjualan per jam dan per produk dibaca dari ESB, lalu jam buka/tutup, jam sepi, dan jam ramai disimpulkan dari datanya sendiri. Dari situ lahir empat rekomendasi program yang berbeda untuk Storypie (pie — dijual sebagai jeda) dan Gumik (mie pangsit — dijual sebagai alasan harga), lengkap dengan produk jangkar, perkiraan dampak, dan jam tayang kontennya |
| 43 | Jalur laporan ESB dicari sendiri | Jalur laporan per jam dan per produk berbeda antar akun ESB. Apps Script mencoba semua calon berbarengan, memakai yang menjawab dengan baris masuk akal, lalu mengingatnya di `ESB_PATH_JAM` / `ESB_PATH_ITEM`. Tombol **Periksa Laporan ESB** di Admin menampilkan kode dan field tiap jalur |
| 45 | Autentikasi ESB dicari sendiri | Akun ESB bisa memakai API key (`ESB_API_KEY`) atau username/password (`ESB_USER`/`ESB_PASS`), dan pesan error ESB tidak membedakan keduanya. Apps Script mencoba enam bentuk header kunci lalu login, mengingat yang berhasil di `ESB_AUTH_MODE`. `tesEsbAuth()` melaporkan jawaban ESB per cara |
| 47 | Penanda versi Apps Script | `VERSI_KODE` di `Code.gs` dibalas lewat aksi `versi`, dan panel Admin membandingkannya dengan `VERSI_APPS_SCRIPT` di aplikasi. Menjawab kasus paling membingungkan: fungsi tes berhasil di editor tapi aplikasi gagal, karena deployment web app masih memakai kode lama |
| 46 | Outlet dinamis dari ESB | Outlet tidak lagi tiga yang ditulis tangan. Daftarnya ditarik dari ESB dengan brand dan region apa adanya, dikelompokkan brand → region di Transaksi Harian, Dashboard, dan Excel. Kunci outlet = `branchCode`, jadi target menempel pada kode. Brand/region yang tidak dikirim ESB diturunkan dari nama dan bisa dikoreksi di Admin |
| 44 | Tampilan modern minimalis | Menu di dua tempat: baris atas berisi kelompok (Dashboard, Konten, Performa, Program, Laporan, Admin) dengan submenu, dan rail ikon di kiri berisi semua modul yang melebar jadi berlabel saat disentuh. Kartu putih di atas latar netral, tema bawaan **Mint** (hijau = aksi, biru = Storypie, kuning = Gumik). Tema lama tersedia sebagai **Biru** di pemilih tema |

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

## Rumus transaksi harian

```
target harian   = target bulanan ÷ jumlah hari dalam bulan
pencapaian      = actual bulan berjalan ÷ target bulanan × 100%
pace            = actual ÷ (target harian × hari berjalan) × 100%
proyeksi        = (actual ÷ hari terisi) × jumlah hari
```

Pace adalah angka terpenting di tengah bulan: 100% berarti sedang tepat di jalur target.

Daftar outlet ada di konstanta `OUTLETS` dalam `index.html` — tambah atau ubah outlet di situ.

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

Sheet di berkas Excel: Ringkasan Backup, Content Plan, Notes Revisi, Engagement Konten, UGC & KOL, Report Ads, Transaksi Harian, Target Transaksi, Timeline Program, Tahapan Program, Kontak Event, Budget, Campaign, User, Undangan, Custom KPI.

Koleksi yang ikut dalam JSON: `contentPlans`, `ugcKol`, `ads`, `programTimeline`, `kontakEvent`, `campaigns`, `users`, `userRoles`, `kpiCustom`, `transaksiHarian`, plus `pengaturan` (jadwal WA & budget UGC).

### Pemulihan

Panel **Pulihkan dari Backup JSON** menerima berkas `.json` hasil backup, menampilkan isinya dulu (jumlah dokumen per koleksi, tanggal dibuat, siapa yang membuat), lalu meminta ketik `PULIHKAN` sebelum tombolnya aktif.

Sifat pemulihan:

- **Additive.** Dokumen ditulis dengan `set(..., {merge:true})`. Dokumen yang ada di aplikasi tapi tidak ada di berkas **tidak dihapus**.
- Dokumen dengan ID yang sama akan **ditimpa** oleh isi berkas.
- Berkas yang bukan backup Content Plan Hub ditolak (dicek lewat field `aplikasi`).
- Password tidak ikut dibackup — akun Auth tetap harus ada. Koleksi `users` yang dipulihkan hanya mengembalikan nama, role, dan preferensi.
- Hanya role **admin** yang melihat panel ini.

Saran ritme: backup JSON + Excel minimal sebulan sekali, simpan di Google Drive perusahaan. Wajib backup sebelum melakukan pemulihan.

## Ringkasan bulanan & rekomendasi

Empat modul — **Engagement**, **Report Ads**, **Report Budget**, dan **Transaksi Harian** — menampilkan dua kartu tambahan di bawah kartu angka: **Ringkasan Bulanan** dan **Rekomendasi yang Dijalankan**.

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

## Sumber data ESB

Omset, jumlah transaksi, penjualan per jam dan per produk berasal dari **ESB Core API v2.0.0** (`https://services.esb.co.id/core`).

### Mode langsung: tidak ada data ESB yang disimpan

Sejak v27 tidak ada satu angka ESB pun yang masuk Firestore. Alurnya satu arah:

```
browser  ->  Apps Script  ->  ESB
                            <-  JSON
browser  <-  JSON  (hanya hidup di memori halaman)
```

Yang tersimpan di `transaksiHarian` tinggal dua hal: **target bulanan** dan **angka yang diketik tim**. Sisanya dibaca ulang tiap kali halaman Transaksi Harian dibuka.

Konsekuensi yang perlu disadari:

- Halaman Transaksi tidak bisa dibaca saat ESB atau Apps Script sedang mati — yang muncul hanya koreksi manual dan sisa data versi lama.
- Tidak ada riwayat ESB di luar apa yang ESB sendiri simpan. Kalau butuh arsip, ekspor ke Excel.
- Sebagai gantinya: tidak ada data yang basi, tidak ada trigger yang diam-diam menulis, dan kuota Firestore tidak terpakai untuk angka yang bukan milik aplikasi ini.

Cache hanya ada di `sessionStorage` dengan umur 10 menit, supaya pindah menu lalu kembali tidak menarik ulang. Tombol **Perbarui dari ESB** selalu memaksa segar.

### Urutan menang di satu tanggal

`trxDoc(outlet, bulan)` menggabungkan dua sumber, dan semua yang membaca transaksi lewat sana — rekap, grafik, Excel, rekomendasi:

1. **Koreksi manual** (`manual:true` di Firestore) — selalu menang.
2. **Angka ESB hari ini** — dasar untuk tanggal yang belum dikoreksi.
3. **Sisa simpanan versi lama** — hanya kalau ESB tidak punya tanggal itu, ditandai `Tersimpan`.

Tombol kecil **pakai ESB** di kolom Status menghapus koreksi manual satu tanggal (`FieldValue.delete()` pada `harian.DD`) sehingga angka ESB dipakai lagi.

### Endpoint yang dipakai

| Panggilan | Guna |
|---|---|
| `POST /auth/login` `{username,password}` | → `result.accessToken`, dipakai sebagai `Authorization: Bearer`. Di-cache 40 menit di `CacheService` |
| `GET /branch?flagActive=1` | daftar `branchCode` / `branchName` untuk pemetaan outlet |
| `GET /report/sales-payment-summary?salesDate=&branchCode=` | → `result[].payments[]` dengan `paymentAmount` dan `paymentCount` |
| laporan per jam | jalur dicari otomatis, lihat di bawah |
| laporan per produk | jalur dicari otomatis, lihat di bawah |

Omset = jumlah seluruh `paymentAmount`. Transaksi = jumlah seluruh `paymentCount`.

**Keterbatasan yang diketahui:** `paymentCount` menghitung pembayaran, bukan struk. Satu bill yang dibayar dua metode terhitung dua. ESB Core tidak menyediakan hitungan struk di API-nya, jadi angka ini dipakai apa adanya dan diberi tanda di aplikasi.

### Jalur laporan per jam dan per produk dicari sendiri

Jalur untuk kedua laporan ini tidak sama tersedianya di tiap akun ESB, dan spesifikasinya tidak bisa dipastikan dari luar. Jadi Apps Script mencobanya satu per satu:

1. Semua calon di `ESB_CALON_JAM` / `ESB_CALON_ITEM` dipanggil berbarengan untuk satu tanggal.
2. Yang dianggap hidup: HTTP 200, ada barisnya, dan baris pertama memuat angka **dan** penanda yang dicari (jam, atau nama item).
3. Jalur pertama yang lolos disimpan di Script Properties `ESB_PATH_JAM` / `ESB_PATH_ITEM`, jadi penjajakan hanya terjadi sekali.

Kalau jalur yang benar sudah diketahui, isi saja kedua properti itu sendiri dan langkah pencarian dilewati. `lupakanJalurEsb()` menghapusnya supaya dicari ulang.

Pembacaan jawabannya sengaja tidak rewel soal nama field: `esbAngka_` dan `esbTeks_` mencoba beberapa nama yang lazim (`paymentAmount`, `netSales`, `grandTotal`, …) dan memakai yang pertama berisi. Kalau tidak ada yang cocok hasilnya `null`, bukan `0` — supaya "tidak terbaca" tidak tersamar jadi "tidak ada penjualan". `esbBaris_` mencari array berisi objek di mana pun letaknya dalam jawaban (`result`, `data`, `rows`, …).

Parameter tanggal juga dikirim dengan beberapa nama sekaligus (`salesDate`, `startDate`/`endDate`, `dateFrom`/`dateTo`); yang tidak dikenal diabaikan server.

### Autentikasi: dua kemungkinan, dicari sendiri

Akun ESB memakai salah satu dari dua cara, dan tidak ada cara memastikannya dari luar:

| Cara | Script Property | Yang dikirim |
|---|---|---|
| Login | `ESB_USER` + `ESB_PASS` | `POST /auth/login` → `accessToken` → `Authorization: Bearer` |
| API key | `ESB_API_KEY` | satu kunci di header tiap permintaan |

Kunci API yang dipakai sebagai password menghasilkan persis `400 Invalid username or password`, dan sebaliknya — sehingga pesan errornya tidak membedakan keduanya. Jadi `esbHeader_()` mencoba enam bentuk header kunci (`Authorization: Bearer`, `x-api-key`, `apikey`, `api-key`, `Authorization` mentah, `X-ESB-API-KEY`) lalu login username/password, dan menyimpan yang berhasil di `ESB_AUTH_MODE`. Panggilan berikutnya langsung memakai cara itu; `401`/`403` memicu pencarian ulang sekali.

`tesEsbAuth()` menjalankan semuanya dan menuliskan jawaban ESB per cara di Execution log — dipakai saat ESB menolak, supaya tidak perlu menebak mana yang salah. `lupakanAuthEsb()` menghapus cara yang tersimpan.

### Kenapa lewat Apps Script

Firebase paket Spark tidak punya Cloud Functions, jadi tidak ada tempat di sisi aplikasi untuk menyimpan kredensial. Panggilan dari browser akan membocorkan kredensial ESB ke setiap user yang login, dan API bisnis seperti ini umumnya juga menolak panggilan lintas-origin. Apps Script sudah terpasang untuk report WA dan Penulis AI, jadi tidak ada layanan baru yang perlu ditambah.

Pemetaan outlet → `branchCode` dikirim aplikasi di tiap permintaan, jadi Apps Script tidak lagi perlu membaca Firestore sama sekali untuk ESB — tidak ada service-account JWT di jalur ini.

### Satu bulan, satu panggilan

Menarik sebulan untuk tiga outlet berarti sekitar 90 permintaan ke ESB. Satu per satu akan menabrak batas 6 menit Apps Script, jadi `esbGetBanyak_` menjalankannya berbarengan lewat `UrlFetchApp.fetchAll` per rombongan 25. Token basi di tengah jalan ditangani sekali: yang kena 401/403 diulang dengan token baru.

### Fungsi di Code.gs

| Fungsi | Guna |
|---|---|
| `esbHeader_(paksaBaru)` | header siap pakai; mencari cara masuk kalau belum terbukti, cache 40 menit |
| `esbGetBanyak_(daftar)` | banyak GET berbarengan, dengan login ulang sekali |
| `esbDaftarCabang_()` | `{cabang:[{kode,nama,brand,region}], field:[...]}` — `field` = nama field apa adanya dari ESB |
| `tesEsbAuth()` | coba semua cara masuk, laporkan jawaban ESB satu per satu |
| `lupakanAuthEsb()` | hapus cara masuk tersimpan |
| `esbLive(dari, sampai, cabang)` | omset & transaksi per tanggal per outlet, dikirim balik apa adanya |
| `esbJam(dari, sampai, cabang)` | penjualan per jam, dijumlahkan sebulan |
| `esbProduk(dari, sampai, cabang, batas)` | penjualan per item, diurutkan |
| `esbJelajah(tanggal, branchCode)` | coba semua calon jalur, laporkan kode & field tiap jawaban |
| `esbCariJalur_(jenis, …)` | cari jalur hidup lalu ingat di Script Properties |
| `tesEsb()` | tes dari editor: login → cabang → satu hari |
| `tesEsbLaporan()` | jalankan sekali; log-nya menunjukkan jalur mana yang hidup |
| `lupakanJalurEsb()` | hapus jalur tersimpan |
| `copotTriggerEsb()` | copot trigger harian lama yang dulu menulis ke Firestore |

Aksi `doPost`: `esb_cabang`, `esb_live`, `esb_jam`, `esb_produk`, `esb_jelajah`.

## Daftar outlet

Outlet tidak lagi ditulis tangan di kode. Daftarnya datang dari ESB, dengan brand dan region apa adanya, dan tim hanya mengisi target.

### Kunci outlet = branchCode

`OUTLETS` adalah `let`, dibangun ulang oleh `terapkanOutlet()` setiap kali `pengaturan/esb` berubah. Kuncinya adalah `branchCode` ESB, jadi target dan koreksi manual menempel pada kode itu — bukan pada nama, yang bisa berubah di ESB.

`OUTLET_BAWAAN` menyimpan tiga outlet versi lama dengan kunci lamanya (`storypie_pekanbaru`, `storypie_medan`, `gumik`). Dipakai sebelum ESB pernah tersambung dan sebagai cadangan, sehingga data lama tidak kehilangan rumahnya.

### Yang disimpan dan yang tidak

| | Disimpan di Firestore | Alasan |
|---|---|---|
| Daftar outlet (kode, nama, brand, region, aktif) | ya, di `pengaturan/esb.outlets` | ini pengaturan, bukan data transaksi: target menempel padanya, dan tanpa itu halaman Transaksi kosong saat ESB mati |
| Target transaksi & omset | ya, di `transaksiHarian` | diisi tim, bukan dari ESB |
| Omset & jumlah transaksi harian | **tidak** | ditarik langsung tiap halaman dibuka |
| Penjualan per jam & per produk | **tidak** | sama |

### Brand dan region

Nama field untuk brand dan region berbeda antar akun ESB, jadi `esbDaftarCabang_()` mencoba beberapa nama yang lazim (`brandName`, `companyName`, …; `regionName`, `areaName`, `cityName`, …) dan memakai yang pertama berisi. Jawaban ESB juga membawa `field` — daftar nama field apa adanya — sehingga kalau tebakan ini meleset, yang sebenarnya dikirim ESB terlihat di panel Admin.

Kalau ESB tidak mengirimnya, aplikasi menurunkan sendiri:

- `tebakBrand()` — `gumik` / `storypie` dari nama; nama lain memakai kata pertamanya sebagai brand sendiri, bukan dipaksa jadi salah satu dari dua brand yang ada.
- `tebakRegion()` — sisa nama setelah brand dibuang.

Keduanya bisa dikoreksi tangan di tabel panel Admin, dan koreksinya bertahan saat daftar ditarik ulang (dicocokkan per `kode`).

### Pengurutan

`outletTerurut()` mengurutkan brand → region → nama; `outletBergrup()` menyusunnya jadi `{brand: {region: [...]}}` untuk `<optgroup>`. `<select>` hanya mengenal satu tingkat optgroup, jadi tingkat keduanya ditulis di labelnya (`Storypie · Riau`); dengan satu brand saja, labelnya cukup region.

Brand di modul konten (Content Plan, Engagement, Ads, UGC) tetap dua — `storypie` dan `gumik`. Yang dinamis hanya outlet, karena di sanalah ESB jadi sumbernya.

## Jam sepi & rekomendasi program

Panel di bawah halaman Transaksi Harian, semuanya dihitung di browser dari data ESB yang baru ditarik.

### Jam buka dibaca dari datanya sendiri

Tidak ada pengaturan jam operasional yang perlu diisi — jam yang omsetnya di bawah 2% puncak dianggap belum buka atau sudah tutup, dan rentang di antara jam hidup pertama dan terakhir itulah jam operasional. Dari rentang itu:

- **Jam sepi** — omsetnya di bawah 55% rata-rata jam operasional.
- **Jam ramai** — dua jam tertinggi.

Jam yang berurutan digabung jadi satu blok (`14, 15, 16` → `14.00–17.00`) supaya terbaca sebagai rentang, bukan daftar angka.

### Perkiraan dampaknya

Potensi tambahan dihitung konservatif: seandainya tiap jam sepi naik sampai **75% rata-rata jam operasional**, berapa selisihnya. Angka itu dibagi jumlah hari data untuk mendapat angka per hari. Di layar ditulis apa adanya sebagai hitungan kasar, bukan janji — ini perkiraan dari pola, bukan hasil uji.

### Kerangka program per brand

`PROGRAM_BRAND` memisahkan Storypie dan Gumik karena cara orang membelinya beda: pie dibeli santai dan sering untuk orang lain, mie pangsit dibeli karena lapar. Jadi jam sepi di Storypie dijual sebagai *jeda*, di Gumik sebagai *alasan harga*. Isi angkanya tetap dari ESB; yang dibedakan hanya nama program, bentuk tawaran, dan daftar aktivitasnya.

Empat rekomendasi yang keluar:

1. **Program jam sepi** (prioritas tinggi) — blok jamnya, tawarannya, produk jangkarnya, perkiraan dampak, dan aktivitas konten dengan jam tayang yang menempel ke jam sepi.
2. **Jaga jam ramai** (sedang) — jangan didiskon, margin jam penuh tidak perlu dipotong.
3. **Produk lambat** (sedang) — diukur dari porsi terjual, bukan rupiah, dan yang sudah masuk daftar terlaris dikecualikan.
4. **Pemanfaatan lain jam sepi** (rendah) — hampers untuk Storypie, uji menu untuk Gumik.

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
