var lagu = document.getElementById("musik-utama");
var fotoAktif = ""; 
var hujanInterval;
var databaseURL = "https://komentar-bub-4cf68-default-rtdb.asia-southeast1.firebasedatabase.app/";

// ==========================================
// 1. LOGIN & MUSIK
// ==========================================
function putarMusik() { 
    if(lagu) lagu.play().catch(e => console.log("Wait user")); 
}

function checkPass() {
    var input = document.getElementById("pass-input").value;
    if (input === "23012026") {
        if(lagu) lagu.play();
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("page-profil").style.display = "block";
    } else {
        document.getElementById("pesan-error").style.display = "block";
        document.getElementById("pass-input").value = "";
    }
}

// ==========================================
// 2. MODAL & GRID FOTO
// ==========================================
function loadGridOtomatis() {
    fetch(databaseURL + "posts.json")
    .then(r => r.json())
    .then(data => {
        const grid = document.getElementById("main-grid");
        const postCount = document.getElementById("post-count");
        
        if(!data) {
            if(grid) grid.innerHTML = "<p style='padding:20px; color:gray; text-align:center;'>Belum ada momen...</p>";
            if(postCount) postCount.innerText = "0";
            return;
        }
        
        const jumlahPost = Object.keys(data).length;
        if(postCount) postCount.innerText = jumlahPost;

        let html = "";
        Object.keys(data).reverse().forEach(key => {
            const item = data[key];
            const isVid = item.type === "video" || item.url.includes(".mp4");
            
            let aksiKlik = `bukaModal('${item.url}', '${item.cap}', ${isVid})`;
            if (item.cap === "PINTU_SURAT") aksiKlik = `masukKeSurat()`;
            
            html += `
                <div class="photo-item" onclick="${aksiKlik}">
                    ${isVid ? `<video src="${item.url}" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>` : `<img src="${item.url}">`}
                </div>`;
        });
        if(grid) grid.innerHTML = html;
    });
}

function bukaModal(src, caption, isVideo = false) {
    fotoAktif = src.replace(/\./g, '_'); 
    document.getElementById("myModal").style.display = "block";
    document.getElementById("caption-text").innerText = caption;
    var container = document.getElementById("modal-media-container");
    
    if (isVideo) {
        container.innerHTML = `<video id="video-modal" src="${src}" controls loop style="width:100%"></video>`;
        setTimeout(function() { document.getElementById("video-modal").play(); }, 100);
    } else {
        container.innerHTML = `<img src="${src}" style="width:100%">`;
    }
    tampilkanKomentar(true); // FIX: Panggil true biar pas awal buka langsung ke bawah
}

function tutupModal() {
    document.getElementById("myModal").style.display = "none";
    document.getElementById("modal-media-container").innerHTML = "";
}

// ==========================================
// 3. EFEK LOVE & SURAT
// ==========================================
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
    var musik = document.getElementById("musik-utama");
    if(musik) musik.volume = 0.06;
    document.getElementById("page-profil").style.display = "none";
    document.getElementById("page-surat").style.display = "block";
    var vSurat = document.getElementById("video-surat");
    if(vSurat) { vSurat.currentTime = 0; vSurat.play(); vSurat.volume = 1.0; }
    hujanInterval = setInterval(createHeart, 300);
    window.scrollTo(0, 0);
}

function backToProfil() {
    var musik = document.getElementById("musik-utama");
    if(musik) musik.volume = 1.0;
    document.getElementById("page-surat").style.display = "none";
    document.getElementById("page-profil").style.display = "block";
    var vSurat = document.getElementById("video-surat");
    if(vSurat) vSurat.pause();
    clearInterval(hujanInterval);
}

// ==========================================
// 4. KOMENTAR FOTO
// ==========================================
function tampilkanKomentar(scrollBawah = false) {
    const list = document.getElementById("comment-list");
    if(!list) return;
    
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
                    <span onclick="balasKomen('${userSkrg}')" style="font-size: 11px; color: #8e8e8e; font-weight: bold; cursor: pointer; margin-left: 2px;">Balas</span>
                </div>`;
        });
        list.innerHTML = htmlKomen;
        
        // FIX: Scroll ke bawah hanya pas diminta
        if(scrollBawah === true) {
            list.scrollTop = list.scrollHeight;
        }
    });
}

function balasKomen(nama) {
    const input = document.getElementById("input-komen");
    const namaTag = nama.replace(/😎|💖/g, '').trim(); 
    input.value = `@${namaTag} `;
    input.focus();
}

function hapusKomentar(key) {
    var pwHapus = prompt("Masukkan Password Admin buat hapus:");
    if (pwHapus === "ibniGanteng") {
        fetch(databaseURL + fotoAktif + "/" + key + ".json", { method: "DELETE" })
        .then(() => { alert("Komentar terhapus!"); tampilkanKomentar(true); });
    } else {
        alert("Password salah, lu bukan Ibni ya? 😜");
    }
}

function kirimKomentar() {
    const input = document.getElementById("input-komen");
    let teks = input.value.trim();
    if (teks !== "") {
        let userSkrg = "Ayang";
        let namaTampil = "Eka Aulia 💖";

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
            tampilkanKomentar(true); // FIX: Layar scroll pas lu ngirim komen
            notifTele(`🔔 Komen Baru!\n\n${namaTampil} bilang: "${teks}"`);

            if (userSkrg === "Ibni" || userSkrg === "Admin") {
                const linkWeb = "https://cokyami17-hub.github.io/love-is-magic/";
                kirimEmailKeEka(namaTampil, `${teks} \n\nCek di sini: ${linkWeb}`, fotoAktif);
            }
        });
    }
}

// Auto Refresh tanpa bikin layar loncat-loncat
setInterval(() => {
    const modal = document.getElementById("myModal");
    if(modal && modal.style.display === "block") tampilkanKomentar(false); 
}, 3000);

// ==========================================
// 5. ADMIN PANEL & UPLOAD MOMEN
// ==========================================
function bukaAdmin() {
    if(prompt("Password Admin:") === "23012026") {
        document.getElementById("admin-panel").style.display = "block";
        alert("Panel Admin Terbuka!");
    }
}

function tambahMomen() {
    const fName = document.getElementById("inp-filename").value;
    const fCap = document.getElementById("inp-cap").value;
    const fType = document.getElementById("inp-type").value;
    if(!fName || !fCap) return alert("Isi dulu datanya!");

    const btn = document.querySelector("button[onclick='tambahMomen()']");
    if(btn) btn.disabled = true;

    fetch(databaseURL + "posts.json", {
        method: "POST",
        body: JSON.stringify({ url: fName, cap: fCap, type: fType, t: Date.now() })
    }).then(() => {
        notifTele(`📸 Momen Baru: ${fCap}`);
        kirimEmailKeEka("Ibni Ganteng 😎", `Sayang, ada momen baru di web kita! ❤️\nCek ya: https://cokyami17-hub.github.io/love-is-magic/`, fName);
        
        // FIX: Laporan Tele buat Lu Pas Momen Baru Dipost
        notifTele(`✅ KONFIRMASI: Email Notif Post/Momen Baru sudah mendarat di ekaauliaan@gmail.com!`);
        
        alert("Momen tersimpan!");
        location.reload(); 
    });
}

// ==========================================
// 6. FITUR PESAN RAHASIA (DM)
// ==========================================
function bukaBoxPesan() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.getElementById('modal-pesan').style.display = 'block';
    loadPesanDM(); 

    window.addEventListener('resize', () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
}

function kirimPesanDM() {
    const input = document.getElementById("isi-pesan-eka");
    let teks = input.value.trim();
    if(!teks) return;

    let pengirim = "Eka Aulia";
    let buatEmail = false;

    if(teks.startsWith("#")) {
        pengirim = "Ibni";
        teks = teks.substring(1);
        buatEmail = true;
    }

    fetch(databaseURL + "pesan_rahasia.json", {
        method: "POST",
        body: JSON.stringify({ u: pengirim, m: teks, t: Date.now() })
    }).then(() => {
        input.value = "";
        loadPesanDM();
        
        notifTele(`📩 DM DARI: ${pengirim}\nIsi: "${teks}"`);

        if(buatEmail) {
            const linkWeb = "https://cokyami17-hub.github.io/love-is-magic/";
            kirimEmailKeEka("Ibni Ganteng 😎", `Sayang, aku baru aja bales DM rahasia kamu nih.. ❤️\nCek ya: ${linkWeb}`);
            notifTele(`✅ KONFIRMASI: Email notif DM sudah dikirim ke ekaauliaan@gmail.com!`);
        }
    });
}

function loadPesanDM() {
    fetch(databaseURL + "pesan_rahasia.json")
    .then(r => r.json())
    .then(data => {
        const container = document.getElementById("chat-container");
        if(!container) return;
        if(!data) {
            container.innerHTML = "<p style='text-align:center; color:gray; font-size:13px; margin-top:20px;'>Mulai obrolan rahasia...</p>";
            return;
        }
        
        let html = "";
        Object.keys(data).forEach(key => {
            const item = data[key];
            const isMe = item.u === "Ibni"; 
            
            html += `
                <div style="display:flex; flex-direction:column; align-items: ${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:10px;">
                    <div style="max-width:80%; padding:8px 12px; border-radius:18px; font-size:14px; 
                        background: ${isMe ? '#0095f6' : '#efefef'}; 
                        color: ${isMe ? '#fff' : '#000'}; 
                        border-bottom-${isMe ? 'right' : 'left'}-radius: 2px;">
                        ${item.m}
                    </div>
                    <span style="font-size:9px; color:gray; margin-top:2px;">${new Date(item.t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>`;
        });
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight; 
    });
}

// ==========================================
// 7. NOTIF EMAIL & TELEGRAM (INTI)
// ==========================================
const teleToken = "8558797937:AAHPZs_R0bn6R6kLu0qW2g1cbVOLoqB57IM";
const teleChatID = "1865257904";
const emailServiceID = "service_6ssczri";
const emailTemplateID = "template_z4t2k8j";

function notifTele(pesan) {
    const url = `https://api.telegram.org/bot${teleToken}/sendMessage?chat_id=${teleChatID}&text=${encodeURIComponent(pesan)}`;
    fetch(url);
}

function kirimEmailKeEka(subjek, isiPesan, foto = "Momen Kita") {
    emailjs.send(emailServiceID, emailTemplateID, {
        to_name: "Eka Aulia Kesayangankuu 💗",
        from_name: subjek,
        message: isiPesan,
        foto_url: foto,
        reply_to: "ekaauliaan@gmail.com" 
    }).then(() => {
        console.log("Email Meluncur!");
    });
}

// Eksekusi Saat Web Dibuka
loadGridOtomatis();
