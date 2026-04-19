var lagu = document.getElementById("musik-utama");
    var fotoAktif = ""; 
    var hujanInterval;
    
    // URL Database Lu
    var databaseURL = "https://komentar-bub-4cf68-default-rtdb.asia-southeast1.firebasedatabase.app/";

    // LOGIN & MUSIK
    function putarMusik() { lagu.play().catch(e => console.log("Wait user")); }
    function checkPass() {
        var input = document.getElementById("pass-input").value;
        if (input === "23012026") {
            lagu.play();
            document.getElementById("login-screen").style.display = "none";
            document.getElementById("page-profil").style.display = "block";
        } else {
            document.getElementById("pesan-error").style.display = "block";
            document.getElementById("pass-input").value = "";
        }
    }

    // MODAL & FOTO
    function bukaModal(src, caption, isVideo = false) {
        fotoAktif = src.replace(/\./g, '_'); // Ganti '.' jadi '_' biar Firebase gak error
        document.getElementById("myModal").style.display = "block";
        document.getElementById("caption-text").innerText = caption;
        var container = document.getElementById("modal-media-container");
        
        if (isVideo) {
            container.innerHTML = `<video id="video-modal" src="${src}" controls loop style="width:100%"></video>`;
            setTimeout(function() { document.getElementById("video-modal").play(); }, 100);
        } else {
            container.innerHTML = `<img src="${src}" style="width:100%">`;
        }
        tampilkanKomentar();
    }

    function tutupModal() {
        document.getElementById("myModal").style.display = "none";
        document.getElementById("modal-media-container").innerHTML = "";
    }
 

    // TAMBAHIN FUNGSI INI BIAR TOMBOL BALAS JALAN
    function balasKomen(nama) {
        const input = document.getElementById("input-komen");
        // Hapus emoji buat tag
        const namaTag = nama.replace(/😎|💖/g, '').trim(); 
        input.value = `@${namaTag} `;
        input.focus();
    }


    // Cek komentar baru tiap 3 detik pas modal buka
    setInterval(() => {
        if(document.getElementById("myModal").style.display === "block") tampilkanKomentar();
    }, 3000);

    // EFEK LOVE & HALAMAN SURAT
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = Math.random() * 2 + 3 + 's';
        heart.style.opacity = Math.random();
        document.body.appendChild(heart);
        setTimeout(() => { heart.remove(); }, 5000);
    }

    function masukKeSurat() {
        document.getElementById("musik-utama").volume = 0.06;
        document.getElementById("page-profil").style.display = "none";
        document.getElementById("page-surat").style.display = "block";
        var vSurat = document.getElementById("video-surat");
        vSurat.currentTime = 0; vSurat.play(); vSurat.volume = 1.0;
        hujanInterval = setInterval(createHeart, 300);
        window.scrollTo(0, 0);
    }

    function backToProfil() {
        document.getElementById("musik-utama").volume = 1.0;
        document.getElementById("page-surat").style.display = "none";
        document.getElementById("page-profil").style.display = "block";
        document.getElementById("video-surat").pause();
        clearInterval(hujanInterval);
    }
    
    function hapusKomentar(key) {
    // Lu tentuin password khusus buat hapus, misal: "ibniGanteng"
    var pwHapus = prompt("Masukkan Password Admin buat hapus:");
    
    if (pwHapus === "ibniGanteng") {
        fetch(databaseURL + fotoAktif + "/" + key + ".json", {
            method: "DELETE"
        }).then(() => {
            alert("Komentar terhapus!");
            tampilkanKomentar(); // Refresh list
        });
    } else {
        alert("Password salah, lu bukan Ibni ya? 😜");
    }
}

// --- KONFIGURASI NOTIF ---
const teleToken = "8558797937:AAHPZs_R0bn6R6kLu0qW2g1cbVOLoqB57IM";
const teleChatID = "1865257904";
const emailServiceID = "service_6ssczri";
const emailTemplateID = "template_z4t2k8j";

// Fungsi Notif Telegram (Buat Lu)
function notifTele(pesan) {
    const url = `https://api.telegram.org/bot${teleToken}/sendMessage?chat_id=${teleChatID}&text=${encodeURIComponent(pesan)}`;
    fetch(url);
}

// Fungsi Notif Email (Buat Eka)
function notifEmail(namaKomen, isiKomen) {
    emailjs.send(emailServiceID, emailTemplateID, {
        to_name: "Eka Aulia Kesayangankuu 💗",
        from_name: namaKomen,
        message: isiKomen,
        reply_to: "ekaauliaan@gmail.com" // Email tujuan
    });
}


// --- FITUR OTOMATIS BARU IBNI ---

// 1. Fungsi Buka Panel Admin (Pake Password)
function bukaAdmin() {
    if(prompt("Password Admin:") === "23012026") {
        document.getElementById("admin-panel").style.display = "block";
        alert("Panel Admin Terbuka! Lu bisa tambah momen tanpa ngoding lagi.");
    }
}

// 2. Fungsi Simpan Momen ke Firebase Database (Gratis)
function tambahMomen() {
    const fName = document.getElementById("inp-filename").value; // Gua ganti biar singkat
    const fCap = document.getElementById("inp-cap").value;
    const fType = document.getElementById("inp-type").value;

    if(!fName || !fCap) return alert("Isi dulu semua datanya, Ibni!");

    // Biar gak dipencet berkali-kali, kita disable tombolnya
    const btn = document.querySelector("button[onclick='tambahMomen()']");
    if(btn) btn.disabled = true;

    fetch(databaseURL + "posts.json", {
        method: "POST",
        body: JSON.stringify({
            url: fName,
            cap: fCap,
            type: fType,
            t: Date.now()
        })
    }).then(() => {
        // --- NOTIF TELEGRAM (Variabel sudah disesuaikan) ---
        notifTele(`📸 Momen Baru Berhasil Diupload!\n\nJudul: ${fCap}\nFile: ${fName}`);

        // --- NOTIF EMAIL ---
        notifEmail("Ibni Ganteng 😎", `Sayang, ada momen baru di web kita! ❤️`);

        alert("Momen tersimpan di Database! 🔥");
        
        // REFRESH HALAMAN
        location.reload(); 
    }).catch(err => {
        alert("Gagal simpan: " + err);
        if(btn) btn.disabled = false;
    });
}


// 3. Fungsi Load Grid Otomatis (VERSI FIX PINTU SURAT)
function loadGridOtomatis() {
    fetch(databaseURL + "posts.json")
    .then(r => r.json())
    .then(data => {
        const grid = document.getElementById("main-grid");
        const postCount = document.getElementById("post-count");
        
        if(!data) {
            grid.innerHTML = "<p style='padding:20px; color:gray; text-align:center;'>Belum ada momen...</p>";
            if(postCount) postCount.innerText = "0";
            return;
        }
        
        const jumlahPost = Object.keys(data).length;
        if(postCount) postCount.innerText = jumlahPost;

        let html = "";
        Object.keys(data).reverse().forEach(key => {
            const item = data[key];
            const isVid = item.type === "video" || item.url.includes(".mp4");
            
            // --- LOGIKA PINTU SURAT DISINI ---
            let aksiKlik = `bukaModal('${item.url}', '${item.cap}', ${isVid})`;
            
            if (item.cap === "PINTU_SURAT") {
                aksiKlik = `masukKeSurat()`; // Kalau captionnya PINTU_SURAT, pindah halaman
            }
            // ---------------------------------
            
            html += `
                <div class="photo-item" onclick="${aksiKlik}">
                    ${isVid ? `<video src="${item.url}" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>` : `<img src="${item.url}">`}
                </div>`;
        });
        grid.innerHTML = html;
    });
}




// 4. Update Fungsi Komentar (Versi 3 Nama: Ibni, Eka, Sweet Moment)
function tampilkanKomentar() {
    const list = document.getElementById("comment-list");
    fetch(databaseURL + fotoAktif + ".json")
    .then(response => response.json())
    .then(data => {
        if (!data) {
            list.innerHTML = '<p style="color: #8e8e8e; font-size: 13px;">Belum ada komentar...</p>';
            return;
        }
        let htmlKomen = "";
        Object.keys(data).forEach(key => {
            const item = data[key];
            let userSkrg = "Eka Aulia 💖", warnaNama = "#262626";
            
            if (item.user === "Ibni") { userSkrg = "Ibni Ganteng 😎"; warnaNama = "#0095f6"; }
            else if (item.user === "Admin") { userSkrg = "sweet moment💗"; }

            htmlKomen += `
                <div style="margin-bottom: 12px; font-size: 14px; text-align: left;">
                    <div ondblclick="hapusKomentar('${key}')">
                        <b style="font-family: 'Style Script', cursive; font-size: 18px; color: ${warnaNama};">${userSkrg}</b> 
                        <span style="font-size: 13px;">${item.teks}</span>
                    </div>
                </div>`;
        });
        list.innerHTML = htmlKomen;
        list.scrollTop = list.scrollHeight;
    });
}

// Panggil fungsi grid saat web pertama kali dibuka
loadGridOtomatis();

// 5. Fungsi Kirim Komentar (Notif Tele & Email dengan Link)
function kirimKomentar() {
    const input = document.getElementById("input-komen");
    let teks = input.value.trim();
    if (teks !== "") {
        let userSkrg = "Ayang"; // Default
        let namaTampil = "Eka Aulia 💖"; // Nama buat notif

        // LOGIKA KODE RAHASIA
        if (teks.startsWith("#")) {
            userSkrg = "Ibni";
            namaTampil = "Ibni Ganteng 😎";
            teks = teks.substring(1);
        } else if (teks.startsWith("!!")) {
            userSkrg = "Admin";
            namaTampil = "sweet moment💗";
            teks = teks.substring(2);
        }

        fetch(databaseURL + fotoAktif + ".json", {
            method: "POST",
            body: JSON.stringify({ user: userSkrg, teks: teks, t: Date.now() })
        }).then(() => {
            input.value = "";
            tampilkanKomentar();

            // NOTIF TELEGRAM (Buat Lu)
            notifTele(`🔔 Komen Baru!\n\n${namaTampil} bilang: "${teks}"\ndi foto: ${fotoAktif}`);

            // NOTIF EMAIL KE EKA (Kirim link biar dia langsung klik)
            if (userSkrg === "Ibni" || userSkrg === "Admin") {
                const linkWeb = "https://cokyami17-hub.github.io/love-is-magic/";
                const pesanLengkap = `${teks} \n\nbaless dongg sayanggg, nii linknyaa: ${linkWeb}`;
                
                notifEmail(namaTampil, pesanLengkap);
            }
        });
    }
}function kirimNotifUpdate() {
    let konfirmasi = confirm("Kirim notif update foto ke Eka sekarang?");
    if (konfirmasi) {
        // Link website lu
        const linkWeb = "https://cokyami17-hub.github.io/love-is-magic/"; 
        
        notifTele("✅ Notif 'Update Foto' + Link sudah dikirim ke email Eka!");
        alert("Notif meluncur ke email Ayang! 🚀");
    }

}

function bukaBoxPesan() {
    // 1. Set tinggi layar asli (khusus mobile)
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // 2. Munculin modal
    document.getElementById('modal-pesan').style.display = 'block';
    
    // 3. Scroll ke bawah biar chat terbaru keliatan
    loadPesanDM();

    // 4. Tambahin event listener biar pas keyboard naik, dia ngitung ulang
    window.addEventListener('resize', () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
}


// Kirim Pesan (Bisa Ibni, Bisa Eka)
function kirimPesanDM() {
    const input = document.getElementById("isi-pesan-eka");
    let teks = input.value;
    if(!teks) return;

    let pengirim = "Eka Aulia";
    // Trik buat Ibni: Kalau awali pesan pake '#', berarti itu balasan lu
    if(teks.startsWith("#")) {
        pengirim = "Ibni";
        teks = teks.substring(1);
    }

    fetch(databaseURL + "pesan_rahasia.json", {
        method: "POST",
        body: JSON.stringify({
            u: pengirim,
            m: teks,
            t: Date.now()
        })
    }).then(() => {
        input.value = "";
        loadPesanDM();
        // Notif ke Tele tetep jalan biar lu tau ada pesan baru
        notifTele(`📩 DM BARU!\nDari: ${pengirim}\nIsi: "${teks}"`);
          // 2. NOTIF KE EMAIL EKA (Hanya kalau Ibni yang bales)
        if(emailKeEka) {
            const linkWeb = "https://cokyami17-hub.github.io/love-is-magic/";
            const pesanEmail = `Sayang, adaa DM rahasia nih.. ❤️\nCek di sini ya: ${linkWeb}`;
            
            notifEmail("Ibni Ganteng 😎", pesanEmail);
            
            // Konfirmasi ke Tele lu kalau email sudah meluncur
            notifTele(`✅ KONFIMASI: Notif DM sudah dikirim ke email Eka!`);
        }
        
    });
}

// Tampilkan Pesan ala DM Instagram
function loadPesanDM() {
    fetch(databaseURL + "pesan_rahasia.json")
    .then(r => r.json())
    .then(data => {
        const container = document.getElementById("chat-container");
        if(!data) return container.innerHTML = "<p style='text-align:center; color:gray;'>Mulai obrolan rahasia...</p>";
        
        let html = "";
        Object.keys(data).forEach(key => {
            const item = data[key];
            const isMe = item.u === "Ibni"; // Cek siapa yang kirim
            
            html += `
                <div style="display:flex; flex-direction:column; align-items: ${isMe ? 'flex-end' : 'flex-start'};">
                    <div style="max-width:80%; padding:8px 12px; border-radius:18px; font-size:14px; 
                        background: ${isMe ? '#0095f6' : '#efefef'}; 
                        color: ${isMe ? '#fff' : '#000'};">
                        ${item.m}
                    </div>
                    <span style="font-size:10px; color:gray; margin:2px 5px;">${new Date(item.t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>`;
        });
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    });
}

