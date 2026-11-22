# Naskah Voice Over: Ruang Tanya (±54 detik)

Gaya bicara: hangat, santai, percaya diri, seperti kakak tingkat yang sedang menunjukkan aplikasi buatannya. Jangan terdengar seperti iklan TV yang berteriak.

| # | Scene (nama file) | Durasi visual | Naskah |
|---|---|---|---|
| 1 | `chaos` | 6 dtk | Biasanya, pertanyaan dikirim ke grup kelas… lalu tenggelam di antara puluhan chat. |
| 2 | `shy` | 4 dtk | Yang malu? Akhirnya nggak jadi bertanya. |
| 3 | `reveal` | 4 dtk | Kenalin, Ruang Tanya. Tanya jawab kelas, cukup satu link. |
| 4 | `share` | 6 dtk | Penyaji tinggal bagikan link atau QR. Teman sekelas langsung masuk dari HP, tanpa install. |
| 5 | `ask` | 8 dtk | Pilih avatar, tulis pertanyaan, kirim. Yang malu bisa pakai nama avatar, dan NIM nggak pernah terlihat teman. |
| 6 | `screen` | 8 dtk | Pertanyaan langsung muncul di layar proyektor. Teman bisa ikut mendukung, dan yang paling ditunggu naik ke atas antrean. |
| 7 | `ai` | 6 dtk | Sementara itu, AI menyiapkan jawabannya dari materimu. Kamu tinggal pilih versi terbaik. |
| 8 | `word` | 6 dtk | Sesi selesai? Unduh rekap Word yang rapi, siap dikirim ke dosen. |
| 9 | `outro` | 6 dtk | Semua berani bertanya. Semua tercatat rapi. … Ruang Tanya. |

> Di scene 9, kata **"Ruang Tanya"** sebaiknya jatuh sekitar detik ke-3, bersamaan dengan logo yang muncul. Beri jeda sebentar sebelum mengucapkannya.

## Teks lengkap (untuk ditempel sekaligus)

```
Biasanya, pertanyaan dikirim ke grup kelas… lalu tenggelam di antara puluhan chat.

Yang malu? Akhirnya nggak jadi bertanya.

Kenalin, Ruang Tanya. Tanya jawab kelas, cukup satu link.

Penyaji tinggal bagikan link atau QR. Teman sekelas langsung masuk dari HP, tanpa install.

Pilih avatar, tulis pertanyaan, kirim. Yang malu bisa pakai nama avatar, dan NIM nggak pernah terlihat teman.

Pertanyaan langsung muncul di layar proyektor. Teman bisa ikut mendukung, dan yang paling ditunggu naik ke atas antrean.

Sementara itu, AI menyiapkan jawabannya dari materimu. Kamu tinggal pilih versi terbaik.

Sesi selesai? Unduh rekap Word yang rapi, siap dikirim ke dosen.

Semua berani bertanya. Semua tercatat rapi. Ruang Tanya.
```

## Saran pengaturan ElevenLabs
- Model: **Eleven Multilingual v2** (atau v3 kalau tersedia). Keduanya mendukung bahasa Indonesia.
- Stability ±45%, Similarity ±75%, Style ±20%, Speed 1.0 (boleh 1.05 kalau terasa lambat).
- Pilih suara yang terdengar muda dan natural.

## Cara mengirim hasilnya ke saya
**Paling bagus:** buat 9 file terpisah, satu per baris tabel, lalu beri nama sesuai kolom "nama file":
`chaos.mp3, shy.mp3, reveal.mp3, share.mp3, ask.mp3, screen.mp3, ai.mp3, word.mp3, outro.mp3`

Taruh di `my-video/public/vo/`. Setelah itu saya akan:
1. menyesuaikan durasi tiap scene dengan panjang narasinya,
2. menggeser animasi dan SFX supaya pas dengan kata-katanya,
3. membuat ulang musik agar drop dan nada akhirnya tetap jatuh di momen yang tepat,
4. menurunkan volume musik di bawah suara (otomatis begitu ada file VO).

**Alternatif:** satu file utuh `full.mp3` juga bisa. Saya akan memotongnya per scene berdasarkan jeda antarkalimat.
