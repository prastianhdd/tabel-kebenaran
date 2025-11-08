#  Kalkulator Logika Informatika

Sebuah *tool* web interaktif untuk membantu mahasiswa dan pengembang memvisualisasikan Logika Informatika. Aplikasi ini secara otomatis menghasilkan tabel kebenaran (*truth table*) lengkap berdasarkan ekspresi proposisional yang Anda masukkan.

Dibangun menggunakan **React (Vite)** dan **CSS murni** dengan fokus pada desain yang bersih, modern, dan responsif.

---

##  Fitur Utama

* **Pembuat Tabel Dinamis:** Menghasilkan tabel kebenaran lengkap dari ekspresi logika.
* **Variabel Dinamis:** Mendukung 1 hingga 5 variabel (p, q, r, s, t).
* **Multi-Ekspresi:** Tambahkan beberapa kolom perhitungan (ekspresi) sekaligus (cth: `p V q`, `p → q`).
* **Urutan 'False-First':** Tabel diurutkan dari `F, F...` (False) terlebih dahulu, sesuai standar akademik.
* **Operator Penuh:** Mendukung AND (`&`), OR (`V`), NOT (`¬`), XOR (`⊕`), Implikasi (`→`), dan Biimplikasi (`↔`).
* **Input Keyboard:** Papan ketik virtual khusus untuk input logika yang mudah dan rapi.
* **UI Terpisah:** Halaman input dan halaman hasil yang bersih dan terpisah untuk pengalaman pengguna yang lebih baik.
* **Desain Responsif:** Tampilan modern yang berfungsi dengan baik di perangkat desktop maupun *mobile*.

---

##  Cara Menjalankan Secara Lokal

Untuk menjalankan proyek ini di mesin lokal Anda:

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/prastianhdd/nama-repo-anda.git](https://github.com/prastianhdd/nama-repo-anda.git)
    ```

2.  **Masuk ke direktori proyek:**
    ```bash
    cd nama-repo-anda
    ```

3.  **Instal semua dependensi:**
    ```bash
    npm install
    ```

4.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```
    Buka `http://localhost:5173` (atau port yang tertera di terminal) di browser Anda.

---

##  Deployment

Proyek ini dikonfigurasi untuk *deployment* instan ke Vercel:

1.  *Push* kode Anda ke repositori GitHub.
2.  Impor proyek Anda di *dashboard* Vercel.
3.  Vercel akan otomatis mendeteksi bahwa ini adalah proyek Vite dan menggunakan pengaturan yang benar (`npm run build`, *output directory* `dist`).
4.  Klik **Deploy**.

---

##  Kredit

Dibuat oleh [PrastianHD](https://github.com/prastianhdd/).