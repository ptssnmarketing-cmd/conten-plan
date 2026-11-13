# Aktivasi Report WhatsApp Otomatis — Ringkasan Langkah

Panduan lengkap bergambar ada di dokumen "Panduan Aktivasi Report WhatsApp Otomatis".
File ini ringkasan cepatnya. Ikuti berurutan, jangan lompat sebelum langkah sebelumnya berhasil.

Biaya: Rp0. Waktu: sekitar 30 menit, dikerjakan sekali oleh Admin di laptop.

## Persiapan
- Nomor WhatsApp KEDUA sebagai pengirim (bukan nomor pribadi / bisnis utama). HP-nya harus tetap menyala.
- Nomor WA tiap anggota tim sudah diisi di aplikasi: menu Admin → tabel User Terdaftar.
- File di folder ini: `Code.gs` dan `appsscript.json` (versi v11).

## 1. Kunci Google Cloud
1. console.cloud.google.com → pilih project **konten-plan** di dropdown atas.
2. IAM & Admin → Service Accounts. Kalau belum ada `apps-script-wa`, buat: Create Service Account → nama `apps-script-wa` → role **Cloud Datastore User** → Done.
3. Klik `apps-script-wa` → tab Keys → **hapus semua kunci lama**.
4. Add Key → Create new key → JSON → Create. File `.json` terunduh. JANGAN dikirim ke siapa pun.
5. APIs & Services → pastikan **Cloud Firestore API** aktif.

## 2. Fonnte
1. Daftar di fonnte.com, paket Free.
2. Device → Add Device → nomor WA kedua → Connect → scan QR dari WhatsApp HP itu (Linked devices).
3. Status Connected → salin **Token** device.

## 3. Apps Script
1. script.google.com → New project → beri nama `Report Harian Content Plan`.
2. Hapus isi `Code.gs`, tempel isi `Code.gs` dari folder ini, Ctrl+S.
3. Project Settings → centang "Show appsscript.json manifest file in editor" → buka `appsscript.json` → ganti isinya dengan file dari folder ini → Ctrl+S.

## 4. Script Properties
Project Settings → Script Properties → Edit script properties → Add script property:

| Property | Isi |
|---|---|
| `SA_JSON` | SELURUH isi file `.json` (buka di Notepad → Ctrl+A → Ctrl+C → tempel) |
| `FONNTE_TOKEN` | token device Fonnte |
| `WEB_TOKEN` | kata sandi bebas buatan sendiri, catat |
| `DRY_RUN` | `true` |

Hapus property lama `PROJECT_ID`, `SA_EMAIL`, `SA_KEY` kalau ada.
**Klik "Save script properties"** — tanpa ini tidak tersimpan.

## 5. Tes koneksi
Pilih fungsi di dropdown atas → Run → baca Execution log.
1. `periksa` — izinkan akses (Review permissions → Advanced → Go to … (unsafe) → Allow). KESIMPULAN harus "Pengaturan terlihat benar".
2. `tesKoneksi` — harus muncul `OK. N user, N konten.`

## 6. Tes kirim
1. `kirimReportHarian` dengan DRY_RUN=true → baca isi pesan di log.
2. Kosongkan sementara nomor WA orang lain di aplikasi, sisakan nomormu.
3. Ubah `DRY_RUN` jadi `false` → Save script properties → Run `kirimReportHarian` → cek WA-mu.
4. Isi kembali nomor WA semua orang.

## 7. Deploy web app
Deploy → New deployment → Web app → Execute as **Me**, Who has access **Anyone** → Deploy → salin URL `/exec`.

## 8. Hubungkan ke aplikasi
Menu Admin → panel Kirim Otomatis Setiap Pagi:
- URL Apps Script Web App = URL `/exec`
- Jam kirim harian = misalnya 08:00
- Token Keamanan = sama persis dengan `WEB_TOKEN`
- Status = Aktif

Simpan pengaturan → Kirim tes sekarang → Terapkan jadwal. Selesai.

## Kalau kode diperbarui
Deploy → Manage deployments → pensil → Version: New version → Deploy. Jangan "New deployment" (URL akan berubah).

## Error yang sering muncul
| Pesan | Solusi |
|---|---|
| `account not found` | Kunci sudah dihapus / dari project lain. Buat kunci baru, tempel ulang ke `SA_JSON` |
| `Invalid JWT Signature` | `SA_JSON` terpotong. Tempel ulang utuh |
| `Firestore error: 403` | Tambah role Cloud Datastore User ke `apps-script-wa` di IAM |
| `Kunci belum diisi` | Nama property bukan persis `SA_JSON`, atau belum Save |
| `TOLAK: token keamanan tidak cocok` | Samakan Token Keamanan di aplikasi dengan `WEB_TOKEN` |
| Terkirim di log tapi WA tidak masuk | `DRY_RUN` masih `true` |
| Fonnte `status:false` | Device Fonnte terputus, scan ulang QR |

Selalu jalankan `periksa` dulu saat ada masalah. Hasilnya aman dibagikan.

## Tambahan: proksi Penulis AI

Kalau ingin memakai Penulis AI dengan kunci tersembunyi (mode "Lewat Apps Script"):

1. Pastikan `Code.gs` versi terbaru — yang punya fungsi `doPost` dan `tesAiProksi`.
2. Script Properties → tambah property berisi kuncinya, namanya sesuai penyedia:
   - `AI_KEY` — Google Gemini (aistudio.google.com)
   - `AI_KEY_OPENAI` — OpenAI (platform.openai.com)
   - `AI_KEY_ANTHROPIC` — Anthropic (console.anthropic.com)

   Lalu Save script properties.
3. Deploy → Manage deployments → pensil → Version: New version → Deploy.
4. Jalankan fungsi `tesAiProksi` di editor (ubah baris `var nama = 'gemini'` kalau memakai penyedia lain), baca Execution log. Harus muncul jawaban model, bukan `galat`.
5. Di aplikasi: menu Admin → panel Penulis AI → Cara Menghubungi AI = **Lewat Apps Script**.

Token keamanan yang dipakai sama dengan `WEB_TOKEN` report WhatsApp, jadi tidak perlu diisi ulang.

## Tambahan: sumber data ESB

Untuk menarik omset & transaksi harian dari ESB:

1. Pastikan `Code.gs` versi terbaru (ada fungsi `esbTarikHarian` dan `tesEsb`).
2. Script Properties → tambah `ESB_USER` dan `ESB_PASS` berisi kredensial ESB → Save script properties.
3. Deploy → Manage deployments → pensil → Version: New version → Deploy.
4. Jalankan `tesEsb` di editor, baca Execution log. Harus muncul "Login ESB: BERHASIL" dan daftar cabang.
5. Jalankan `pasangTriggerEsb` sekali — tarikan otomatis tiap pagi 06.00 WIB untuk data kemarin.
6. Di aplikasi: menu Admin → panel Sumber Data ESB → Muat Daftar Cabang → petakan outlet → Simpan.

Kalau `tesEsb` gagal di login, kredensialnya salah. Kalau daftar cabangnya kosong, akun ESB belum diberi akses cabang.
