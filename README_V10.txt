CERITA KITA V10

1. Hero (halaman pertama) disederhanakan
- Hanya: "Untukmu, dari cerita kita", nama "Andhara" dari serpihan bintang yang berkumpul
  membentuk huruf, "Felicia Evelyn Rantelino" di bawahnya, dan tombol "Buka kisah ini".
- Interaktif: gerakkan kursor / jari di atas nama, serpihannya menyibak lalu kembali.
  Ketuk nama untuk memecahnya dan membunyikan lonceng.
- Kalimat "Aku tidak pernah menyangka..." dan paragraf pembuka dihapus dari hero.

2. Nama dan tanggal
- Nama pacar di mana pun: Andhara Felicia Evelyn Rantelino (hero + surat).
- Hitungan "52 hari" dihapus. Di bab 04 timeline tinggal tanggal 16 Agustus 2026.

3. Suara surat (rekamanmu)
- assets/audio/voice.mp3 = rekamanmu yang sudah dirapikan: dikeraskan ke sekitar -17 LUFS
  (aslinya -28, jadi lebih jelas), dibuat rata volumenya, bagian bawah dibersihkan, dan diberi
  fade in/out. Durasi tetap 2:05.
- Tulisan sekarang mengikuti rekamanmu kata per kata (dicocokkan lewat transkripsi + jeda
  bicara), bukan lagi dibagi rata. Saat rekaman menyebut "Untukmu, Andhara", judul dan nama
  di surat ikut menyala.
- Saat suara surat diputar, musik latar dan suasana mengecil otomatis.
- Penyesuaian ini khusus untuk rekaman yang kamu kirim. Kalau suatu hari rekamannya diganti
  atau suratnya diubah, waktu per kata (VOICE_CUES di script.js) perlu dibuat ulang.

4. Efek suara (tombol speaker di kiri bawah menyalakan / mematikan)
- Semua bunyi dibuat lewat kode dan disimpan di assets/audio (click, chime, paper-open, pop,
  whoosh, clink, block, star, flip, heartbeat, connect, cafe, night). Bisa kamu timpa dengan
  file sendiri dengan nama yang sama.
- Nama di hero & kartu kenangan: lonceng pentatonik (nada apa pun yang terdengar serasi).
- Jendela malam di section 01: Kopi Kenangan = dentingan cangkir + suasana kafe,
  Roblox & Minecraft = bunyi balok disusun, Sampai subuh = nada tersambung + suasana malam.
- Bintang jatuh, hati yang pecah, bab 04 (detak jantung), buka/tutup surat (kertas),
  geser galeri, buka foto, "Kembali ke awal".
- Suara baru berbunyi setelah pengunjung menyentuh halaman sekali (aturan browser).
- Pengaturan suara tersimpan di browser (localStorage).

5. Lain-lain
- Font Cormorant Garamond sekarang memuat huruf miring aslinya (sebelumnya miring buatan).
- Cara memutar: buka lewat server (mis. Live Server), bukan klik dua kali file index.html,
  supaya efek suara dan seek rekaman bisa bekerja.

Tetap dari versi sebelumnya: section 01 jendela malam, galeri foto + game, nama & tanda tangan
di surat, perbaikan tombol "Kembali ke awal", tutup surat, dan sinkron paragraf.

Catatan: paper-open, click, cafe, night yang tadinya 0 byte sekarang terisi. Jangan lupa
cek volume efek suara di perangkatmu; saya tidak bisa mendengarnya langsung.
