CERITA KITA — V3

Struktur:

cerita_kita_v3/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── audio/
    │   ├── voice.mp3
    │   └── rest-of-my-life.mp3
    └── images/
        ├── foto1.jpg
        ├── foto2.jpg
        └── foto3.jpg

Fitur utama V3:
- Surat menjadi centerpiece di tengah halaman.
- Voice letter digabung langsung dengan surat.
- Saat voice.mp3 diputar, teks surat muncul bertahap dan bagian yang sedang dibaca diberi highlight.
- Progress suara bisa digeser menggunakan slider.
- Tombol “Baca sendiri” membuka semua isi surat tanpa voice.
- Ada memory replay untuk Kopi Kenangan, Roblox/Minecraft, dan telepon sampai subuh.
- Bootstrap 5 + Bootstrap Icons digunakan dari CDN.

Catatan sinkronisasi:
Sistem V3 memakai pembagian otomatis berdasarkan jumlah kata agar dapat mengikuti panjang rekaman voice.mp3. Jika nanti ingin sinkronisasi sangat presisi per kalimat, timestamp dapat ditambahkan secara manual pada tiap paragraf.

Cara pakai:
1. Taruh voice.mp3 di assets/audio/.
2. Taruh rest-of-my-life.mp3 di assets/audio/.
3. Taruh foto1.jpg, foto2.jpg, foto3.jpg di assets/images/.
4. Buka index.html di browser.
