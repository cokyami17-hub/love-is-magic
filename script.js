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

‎// --- KONFIGURASI NOTIF FIX (EMAIL: ekaauliaan@gmail.com) ---
‎const teleToken = "8558797937:AAHPZs_R0bn6R6kLu0qW2g1cbVOLoqB57IM";
‎const teleChatID = "1865257904";
‎const emailServiceID = "service_6ssczri";
‎const emailTemplateID = "template_z4t2k8j";
‎
‎// 1. Fungsi Notif Telegram (Buat Lu)
‎function notifTele(pesan) {
‎    const url = `https://api.telegram.org/bot${teleToken}/sendMessage?chat_id=${teleChatID}&text=${encodeURIComponent(pesan)}`;
‎    fetch(url);
‎}
‎
‎// 2. SATU FUNGSI EMAIL UNTUK SEMUA (Upload, Komen, DM)
‎function kirimEmailKeEka(subjek, isiPesan, foto = "Momen Kita") {
‎    emailjs.send(emailServiceID, emailTemplateID, {
‎        to_name: "Eka Aulia Kesayangankuu 💗",
‎        from_name: subjek,
‎        message: isiPesan,
‎        foto_url: foto,
‎        reply_to: "ekaauliaan@gmail.com" // Email tujuan yang bener sesuai kata lu
‎    }).then(() => {
‎        console.log("Email Meluncur!");
‎    });
‎}
‎
‎// 3. Fungsi Simpan Momen (Update Foto)
‎function tambahMomen() {
‎    const fName = document.getElementById("inp-filename").value;
‎    const fCap = document.getElementById("inp-cap").value;
‎    const fType = document.getElementById("inp-type").value;
‎    if(!fName || !fCap) return alert("Isi dulu datanya!");
‎
‎    const btn = document.querySelector("button[onclick='tambahMomen()']");
‎    if(btn) btn.disabled = true;
‎
‎    fetch(databaseURL + "posts.json", {
‎        method: "POST",
‎        body: JSON.stringify({ url: fName, cap: fCap, type: fType, t: Date.now() })
‎    }).then(() => {
‎        notifTele(`📸 Momen Baru: ${fCap}`);
‎        kirimEmailKeEka("Ibni Ganteng 😎", `Sayang, ada momen baru di web kita! ❤️\nCek ya: https://cokyami17-hub.github.io/love-is-magic/`, fName);
‎        alert("Momen tersimpan!");
‎        location.reload(); 
‎    });
‎}
‎
‎// 4. Fungsi Kirim Komentar
‎function kirimKomentar() {
‎    const input = document.getElementById("input-komen");
‎    let teks = input.value.trim();
‎    if (teks !== "") {
‎        let userSkrg = "Ayang";
‎        let namaTampil = "Eka Aulia 💖";
‎
‎        if (teks.startsWith("#")) {
‎            userSkrg = "Ibni";
‎            namaTampil = "Ibni Ganteng 😎";
‎            teks = teks.substring(1);
‎        } else if (teks.startsWith("!!")) {
‎            userSkrg = "Admin";
‎            namaTampil = "sweet moment💗";
‎            teks = teks.substring(2);
‎        }
‎
‎        fetch(databaseURL + fotoAktif + ".json", {
‎            method: "POST",
‎            body: JSON.stringify({ user: userSkrg, teks: teks, t: Date.now() })
‎        }).then(() => {
‎            input.value = "";
‎            tampilkanKomentar();
‎            notifTele(`🔔 Komen Baru!\n\n${namaTampil} bilang: "${teks}"`);
‎
‎            if (userSkrg === "Ibni" || userSkrg === "Admin") {
‎                const linkWeb = "https://cokyami17-hub.github.io/love-is-magic/";
‎                kirimEmailKeEka(namaTampil, `${teks} \n\nCek di sini: ${linkWeb}`, fotoAktif);
‎            }
‎        });
‎    }
‎}
‎
‎// --- FITUR PESAN RAHASIA (DM) ---
‎
‎// 1. Fungsi Buka Modal & Load Pesan
‎function bukaBoxPesan() {
‎    // Set tinggi layar asli (fix buat Chrome/Safari Mobile)
‎    let vh = window.innerHeight * 0.01;
‎    document.documentElement.style.setProperty('--vh', `${vh}px`);
‎
‎    document.getElementById('modal-pesan').style.display = 'block';
‎    loadPesanDM(); // Langsung load pesannya pas dibuka
‎
‎    // Update tinggi kalau layar berubah (keyboard naik)
‎    window.addEventListener('resize', () => {
‎        let vh = window.innerHeight * 0.01;
‎        document.documentElement.style.setProperty('--vh', `${vh}px`);
‎    });
‎}
‎
‎// 2. Fungsi Kirim Pesan DM
‎function kirimPesanDM() {
‎    const input = document.getElementById("isi-pesan-eka");
‎    let teks = input.value.trim();
‎    if(!teks) return;
‎
‎    let pengirim = "Eka Aulia";
‎    let buatEmail = false;
‎
‎    // Cek kalau lu yang bales (pake tanda #)
‎    if(teks.startsWith("#")) {
‎        pengirim = "Ibni";
‎        teks = teks.substring(1);
‎        buatEmail = true;
‎    }
‎
‎    fetch(databaseURL + "pesan_rahasia.json", {
‎        method: "POST",
‎        body: JSON.stringify({ u: pengirim, m: teks, t: Date.now() })
‎    }).then(() => {
‎        input.value = "";
‎        loadPesanDM();
‎        
‎        // Notif ke Telegram Lu
‎        notifTele(`📩 DM DARI: ${pengirim}\nIsi: "${teks}"`);
‎
‎        // Notif ke Email Eka (Kalau Ibni yang bales)
‎        if(buatEmail) {
‎            const linkWeb = "https://cokyami17-hub.github.io/love-is-magic/";
‎            kirimEmailKeEka("Ibni Ganteng 😎", `Sayang, aku baru aja bales DM rahasia kamu nih.. ❤️\nCek ya: ${linkWeb}`);
‎            notifTele(`✅ KONFIRMASI: Email notif DM sudah dikirim ke ekaauliaan@gmail.com!`);
‎        }
‎    });
‎}
‎
‎// 3. Fungsi Tampilkan Chat
‎function loadPesanDM() {
‎    fetch(databaseURL + "pesan_rahasia.json")
‎    .then(r => r.json())
‎    .then(data => {
‎        const container = document.getElementById("chat-container");
‎        if(!data) {
‎            container.innerHTML = "<p style='text-align:center; color:gray; font-size:13px; margin-top:20px;'>Mulai obrolan rahasia...</p>";
‎            return;
‎        }
‎        
‎        let html = "";
‎        Object.keys(data).forEach(key => {
‎            const item = data[key];
‎            const isMe = item.u === "Ibni"; 
‎            
‎            html += `
‎                <div style="display:flex; flex-direction:column; align-items: ${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:10px;">
‎                    <div style="max-width:80%; padding:8px 12px; border-radius:18px; font-size:14px; 
‎                        background: ${isMe ? '#0095f6' : '#efefef'}; 
‎                        color: ${isMe ? '#white' : '#000'}; 
‎                        border-bottom-${isMe ? 'right' : 'left'}-radius: 2px;">
‎                        ${item.m}
‎                    </div>
‎                    <span style="font-size:9px; color:gray; margin-top:2px;">${new Date(item.t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
‎                </div>`;
‎        });
‎        container.innerHTML = html;
‎        container.scrollTop = container.scrollHeight; // Auto scroll ke bawah
‎    });
‎}
‎
