# Ruang Tanya

**Web tanya jawab interaktif untuk presentasi kelas.** Teman sekelas bertanya lewat HP, pertanyaan muncul langsung di layar proyektor, AI menyiapkan jawaban, dan penyaji tinggal mengunduh rekap Word untuk dosen.

> Dibuat untuk sesi tanya jawab mata kuliah Pendidikan Agama Islam, tapi bisa dipakai untuk presentasi apa pun.

## Kenapa dibuat

Biasanya pertanyaan dikirim ke grup WhatsApp dan tercecer di antara obrolan lain. Setelah presentasi, penyaji masih harus menyalin satu per satu ke Word, merapikan nama dan NIM, lalu mencari jawabannya. Sesi tanya jawab juga sering sepi karena banyak yang malu bertanya.

Ruang Tanya merangkum semuanya dalam satu link:

1. Penyaji membagikan link atau QR.
2. Teman memilih avatar, lalu mengirim pertanyaan.
3. Pertanyaan tampil di layar presentasi, dan AI langsung menyiapkan jawabannya.
4. Setelah sesi, penyaji memilih jawaban terbaik dan mengunduh file Word yang siap dikirim.

## Fitur

### Untuk penanya (tanpa login)
- **12 avatar lucu buatan tangan**, misalnya Si Kepo, Kak Ambis, Profesor Mini, Neng Ceria, Alien Nyasar, dan Kucing Oren.
- **Tampil dengan nama asli atau nama avatar**, supaya yang malu tetap berani bertanya. NIM tidak pernah ditampilkan ke teman.
- **Jawaban versi sendiri (opsional)** di samping pertanyaan.
- **Feed pertanyaan teman** dengan tombol "Aku juga penasaran", diurutkan berdasarkan pertanyaan terpopuler atau terbaru.
- **Reaksi** 👏 🔥 🤯 😂 🤲 yang melayang di layar proyektor.
- **Edit dan tarik pertanyaan sendiri.** Keduanya terkunci otomatis saat pertanyaan sedang dibahas, sudah dijawab, atau sesi ditutup.
- **Lencana "Berani Bertanya"** untuk pertanyaan pertama.

### Layar presentasi (proyektor)
- Kartu besar **"Sedang dibahas"** dan **antrean** yang diurutkan berdasarkan dukungan.
- QR untuk ikut bertanya, notifikasi pertanyaan baru, dan reaksi yang melayang secara realtime.
- **Podium penanya terbaik** di akhir sesi.
- Untuk penyaji: klik pertanyaan di antrean untuk membahasnya, atau pakai pintasan keyboard (`N` berikutnya, `P` podium, `F` layar penuh).

### Untuk penyaji (admin)
- Kelola banyak sesi: buat, duplikat, buka, dan tutup. Tiap sesi punya link pendek dan QR sendiri.
- **Tiga versi jawaban berdampingan**: jawaban AI, versi penanya, dan versi sendiri. Pilih satu versi untuk tiap pertanyaan, lalu tandai "Masuk Word".
- Jawaban AI otomatis memakai konteks topik dan ringkasan materi, dengan aturan agar tidak mengarang rujukan ayat atau hadits.
- Sembunyikan spam, tambah pertanyaan lisan secara manual, dan ubah data penanya yang salah ketik.
- **Rekap Word (.docx)**: A4 landscape, Times New Roman, tabel No, Nama, NIM, Kelompok, Pertanyaan, Jawaban. File dibuat langsung di browser.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Web & API | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Database & login | [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security) |
| Realtime | Supabase Realtime Broadcast |
| AI | [Gemini API](https://ai.google.dev) |
| Dokumen | [`docx`](https://docx.js.org) (Word dibuat di browser), [`qrcode`](https://github.com/soldair/node-qrcode) |
| Hosting | [Vercel](https://vercel.com) |

Semua layanan di atas dipakai di paket gratisnya.

### Catatan desain
- **Privasi lebih dulu.** Tabel database tertutup untuk pengunjung (RLS tanpa policy publik). Semua penulisan lewat API server, dan halaman publik hanya menerima kolom yang aman ditampilkan. NIM dan jawaban hanya terlihat oleh admin.
- **Realtime yang hemat.** Server hanya mengirim sinyal "ada perubahan" lewat Broadcast, lalu tiap layar mengambil ulang data sesuai haknya. Ada polling cadangan bila koneksi realtime terputus.
- **AI yang tahan gangguan.** Jawaban dibuat di latar belakang (`after()`), dicoba ulang hingga 3 kali, dan bisa pindah ke model cadangan. Pertanyaan yang tertinggal diproses ulang otomatis.
- **Tampilan "Stiker Kelas".** Garis tebal, bayangan keras, warna cerah, huruf Bricolage Grotesque dan Plus Jakarta Sans. Avatar digambar sebagai SVG di kode, tanpa file gambar.

## Dokumen proyek

- [`docs/PRD.md`](docs/PRD.md): kebutuhan produk lengkap, mulai dari alur, fitur, model data, risiko, sampai kriteria selesai.
- [`docs/mockup.html`](docs/mockup.html): mockup interaktif yang disetujui sebelum coding. Unduh, lalu buka di browser.

## Menjalankan sendiri

### 1. Supabase
1. Buat proyek baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, tempel seluruh isi [`supabase/schema.sql`](supabase/schema.sql), lalu klik **Run**.
3. Buka **Authentication → Users → Add user**, lalu buat akun admin dengan mencentang *Auto Confirm User*.
4. Buka **Project Settings → API**, lalu salin Project URL, anon/publishable key, dan service role/secret key.

### 2. Gemini
Buat API key di [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 3. Jalankan
```bash
cp .env.example .env.local   # lalu isi nilainya
npm install
npm run dev
```
Buka http://localhost:3000/admin, login, lalu buat sesi.

### 4. Deploy ke Vercel
1. Import repositori ini di [vercel.com/new](https://vercel.com/new).
2. Masukkan semua variabel dari `.env.example` di **Environment Variables**.
3. Klik **Deploy**. Untuk memakai domain sendiri, buka **Settings → Domains**, lalu tambahkan record CNAME di DNS domainmu.

> Supabase paket gratis menjeda proyek setelah 1 minggu tidak dipakai. Sebelum presentasi, buka dashboard Supabase dan klik **Restore** bila proyek dijeda.

## Struktur

```
src/
  app/
    [kode]/            form penanya, /teman (feed), /layar (proyektor)
    admin/             login, daftar sesi, panel, pratinjau Word
    api/s/[kode]/      API publik: kirim, edit, tarik, dukung
    api/admin/         API admin (wajib login)
  components/          Avatar, pemilih avatar, QR, toast
  lib/                 akses data, AI (Gemini), avatar SVG, realtime, aturan Word
supabase/schema.sql    tabel, trigger, RLS, izin
docs/                  PRD dan mockup
```
