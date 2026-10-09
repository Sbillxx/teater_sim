# 🎬 Cinema XXI - 3D Theater Experience Simulator

Sebuah web simulator 3D bioskop imersif bergaya **Cinema XXI / The Premiere** yang dibangun menggunakan **Three.js** dan **Vite**.

Aplikasi ini mengajak pengguna merasakan pengalaman langsung menjadi pengunjung bioskop: mulai dari lobi, memilih film, memilih nomor kursi, masuk ke dalam studio teater bertingkat dengan POV orang pertama (*first-person walkthrough*), duduk di kursi pilihan, hingga lampu studio meredup perlahan dan film diputar di layar lebar!

---

## ✨ Fitur Utama

1. **Lobi & Registrasi Penonton**:
   - Input nama pengunjung & pilihan jenis studio (*XXI The Premiere, Deluxe, IMAX*).
2. **Katalog Film & Pemutar Video Lokal**:
   - Pilihan trailer film berdefinisi tinggi (*Sci-Fi, Animasi, Misteri*).
   - **Fitur Putar Video Lokal (`📂 Pilih File Video Lokal`)**: Pengguna bisa memilih file video apa saja dari komputer (*.mp4, .webm, .mkv*) untuk diputar langsung di layar bioskop 3D!
   - Generator trailer animasi prosedural otomatis sebagai cadangan jika sedang offline.
3. **Pemesanan Kursi Interaktif (2D Seat Map)**:
   - Denah kursi bioskop ala XXI (Baris A s/d F, Kolom 1 s/d 8) dengan lorong tangga di tengah.
   - Realisme kursi: ada kursi yang sudah terisi penonton lain dan kursi yang tersedia.
   - Tiket bioskop digital fisik interaktif yang otomatis mencetak nama, film, dan kode kursi pilihan.
4. **Studio Bioskop 3D Megah (First-Person Simulator)**:
   - **POV Orang Pertama**: Navigasi menggunakan **W, A, S, D** dan **Mouse** (*PointerLockControls*).
   - **Tangga & Tribun Bertingkat**: Lantai berundak 6 baris dengan deteksi elevasi otomatis saat menaiki tangga.
   - **Pencahayaan Detail**: Lampu neon LED biru di setiap anak tangga (*step lights*), lampu dinding artistik (*wall sconces*), dan papan neon hijau **EXIT**.
   - **48 Kursi Beludru Mewah**: Kursi bioskop merah tua dengan sandaran ergonomis, cup holder, dan plat nomor kuningan (A1 - F8).
   - **Layar Raksasa Melengkung (Curved IMAX Screen)**: Dengan bingkai velvet hitam, logo emas XXI Premiere, dan pantulan cahaya dinamis (*screen bounce*).
   - **Proyektor & Volumetric Light Beam**: Sorotan sinar proyektor dari jendela ruang proyektor di belakang studio menembus kegelapan ke layar.
5. **Interaksi Duduk Khusus Kursi Pilihan**:
   - Kursi yang Anda pesan diberi penanda khusus berupa **Halo Glow Emas & Panah Berputar** di atasnya.
   - Saat mendekati kursi pilihan, muncul prompt HUD: **`[E] Duduk di Kursi {ID}`**.
   - Kursi lain tidak bisa diduduki (muncul peringatan *"Kursi ini milik penonton lain"*).
6. **Mode Menonton & Kontrol Sinematik**:
   - Transisi kamera halus (*cinematic smooth lerp*) dari berdiri ke sudut pandang mata duduk penonton.
   - **Lampu Studio Meredup Otomatis**: Efek *fade-out house lights* disertai suara dentuman *sub-bass boom* sinematik (Dolby/THX vibe).
   - **Film Mulai Berputar Otomatis**: Layar bioskop memutar film dengan audio jernih.
   - **Panel Kontrol Pemutaran**: Play/Pause, Rewind 10s, Forward 10s, Volume slider, Progress bar seek, tombol ganti video, dan tombol **`[Space] Berdiri`** untuk jalan-jalan kembali di studio.

---

## 🎮 Kontrol Navigasi

| Tombol / Aksi | Fungsi |
|---|---|
| **Klik Layar** | Mengunci kursor mouse untuk melihat sekeliling |
| **W, A, S, D** | Berjalan maju, kiri, mundur, kanan |
| **Shift** | Berlari pelan / berjalan cepat |
| **Mouse** | Menoleh / melihat sekeliling studio 3D |
| **E** | Duduk di kursi yang Anda pilih (saat berada di dekat kursi) |
| **Space** | Berdiri dari kursi |
| **Esc** | Melepaskan kursor mouse |
| **Tombol Lampu (💡)** | Menyalakan / meredupkan lampu studio secara manual |

---

## 🚀 Cara Menjalankan

Aplikasi ini sudah berjalan di komputer lokal Anda:

```bash
# Jalankan development server
npm run dev
```

Buka browser Anda di:
👉 **`http://localhost:5173/`**
