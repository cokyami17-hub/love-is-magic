// --- API KEY IMGBB LU ---
const imgbb_api_key = "4404bf0574badbfede0a677991b7dae9"; 

const lagu = document.getElementById("musik-utama");
let fotoAktif = ""; 
let hujanInterval;
const databaseURL = "https://komentar-bub-4cf68-default-rtdb.asia-southeast1.firebasedatabase.app/";

// Variabel Buat Geser Grid
let listMomen = [];
let indexSkrg = 0;

// 1. LOGIN & VOLUME AWAL
function putarMusik() { if(lagu) lagu.play().catch(e => console.log("Wait user")); }

function checkPass() {
    var input = document.getElementById("pass-input").value;
    if (input === "23012026") {
        if(lagu) { lagu.play(); lagu.volume = 1.0; }
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("page-profil").style.display = "block";
        loadGridOtomatis();
        setInterval(cekStatusPesan, 3000); 
    } else {
        document.getElementById("pesan-error").style.display = "block";
    }
}

// 2. TABS
function bukaTab(tab) {
    document.getElementById('tab-grid').className = (tab === 'grid') ? 'tab-active' : 'tab-inactive';
    document.getElementById('tab-upload').className = (tab === 'upload') ? 'tab-active' : 'tab-inactive';
    document.getElementById('grid-section').style.display = (tab === 'grid') ? 'block' : 'none';
    document.getElementById('upload-section').style.display = (tab === 'upload') ? 'block' : 'none';
}

// 3. PANEL ADMIN (MUSIK)
function bukaAdmin() {
    const pwd = prompt("Masukkan Password Admin:");
    if (pwd === "23012026") {
        document.getElementById("admin-panel").style.display = "block";
    } else if (pwd !== null) {
        alert("Password Salah! Lu bukan Ibni ya? 😜");
    }
}

function tutupAdmin() {
    document.getElementById("admin-panel").style.display = "none";
}

function updateMusik() {
    const linkLaguBaru = document.getElementById("inp-musik").value.trim();
    if (!linkLaguBaru) return alert("Isi dulu link lagunya dong, Bos! 😅");

    fetch(databaseURL + "config.json", {
        method: "PATCH",
        body: JSON.stringify({ musikUtama: linkLaguBaru })
    }).then(() => {
        alert("Wihhh, Musik Utama berhasil diganti! 🎶");
        location.reload(); 
    }).catch(e => alert("Yah, gagal nyimpen lagu. Coba lagi ya!"));
}

fetch(databaseURL + "config.json")
    .then(r => r.json())
    .then(data => {
        if (data && data.musikUtama) document.getElementById("musik-utama").src = data.musikUtama;
    }).catch(e => console.log("Gagal memuat musik"));


// 4. LOGIKA UPLOAD FOTO/VIDEO
function previewFile() {
    const file = document.getElementById('inp-file').files[0];
    const preview = document.getElementById('img-preview');
    const label = document.getElementById('label-pilih');
    if (file) {
        const reader = new FileReader();
        reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; label.style.display = 'none'; }
        reader.readAsDataURL(file);
    }
}

async function prosesUpload() {
    const fileInput = document.getElementById('inp-file');
    const linkInput = document.getElementById('inp-link-url').value.trim();
    const caption = document.getElementById('inp-cap').value.trim();
    
    if (!fileInput.files[0] && !linkInput) return alert("Pilih foto galeri ATAU isi link dulu sayang!");
    if (!caption) return alert("Tulis captionnya dulu!");

    const btn = document.getElementById('btn-upload');
    btn.innerHTML = "Lagi Upload... ⏳"; btn.disabled = true;

    if (linkInput !== "") {
        const tipe = document.getElementById('inp-link-type').value;
        simpanKeFirebase(linkInput, caption, tipe);
        return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    try {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbb_api_key}`, { method: "POST", body: formData });
        const result = await res.json();
        if (result.success) {
            simpanKeFirebase(result.data.url, caption, "image");
        }
        else { alert("Gagal upload!"); btn.innerHTML = "Kirim Momen 🚀"; btn.disabled = false; }
    } catch (e) { alert("Error koneksi!"); btn.innerHTML = "Kirim Momen 🚀"; btn.disabled = false; }
}

function simpanKeFirebase(url, cap, tipe) {
    fetch(databaseURL + "posts.json", {
        method: "POST",
        body: JSON.stringify({ url: url, cap: cap, type: tipe, t: Date.now() })
    }).then(() => {
        notifTele(`📸 MOMEN BARU!\nType: ${tipe}\nCap: ${cap}`);
        kirimEmailKeEka("Admin Sweet Moment", `Sayang, ada momen baru berhasil diupload! ❤️`, url);
        alert("Momen Berhasil Terkirim! ❤️"); location.reload();
    });
}

// 5. GRID & MODAL FOTO DENGAN GESER (SCROLL)
function loadGridOtomatis() {
    fetch(databaseURL + "posts.json").then(r => r.json()).then(data => {
        const grid = document.getElementById("main-grid");
        if(!data) return;
        
        listMomen = Object.keys(data).reverse().map(k => data[k]);
        document.getElementById("post-count").innerText = listMomen.length;
        
        let h = "";
        listMomen.forEach((i, idx) => {
            let urlAman = i.url;
            if(urlAman.includes("i.ibb.co")) {
                urlAman = "https://i0.wp.com/" + i.url.replace("https://", "").replace("http://", "");
            }
            const isVid = i.type === "video" || i.url.includes(".mp4");
            h += `
                <div onclick="bukaModalIndex(${idx})" style="width: 100%; aspect-ratio: 1/1; position: relative; overflow: hidden; cursor: pointer; border: 1px solid #fff;">
                    ${isVid ? 
                        `<video src="${i.url}" autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"></video>` : 
                        `<img src="${urlAman}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='${i.url}';">`
                    }
                </div>`;
        });
        grid.innerHTML = h;
    });
}

function bukaModalIndex(idx) {
    indexSkrg = idx;
    const item = listMomen[idx];
    
    // FIX MACET: Kalo ketemunya surat, tutup layar item (modal) dulu baru buka suratnya
    if(item.cap === "PINTU_SURAT") {
        tutupModal(); 
        return masukKeSurat();
    }
    
    fotoAktif = item.url.replace(/[\.\/\:\#\$\[\]]/g, '_');
    document.getElementById("myModal").style.display = "block";
    document.getElementById("caption-text").innerText = item.cap;
    const cont = document.getElementById("modal-media-container");
    const isVid = item.type === "video" || item.url.includes(".mp4");
    
    let urlAman = item.url;
    if(urlAman.includes("i.ibb.co")) { urlAman = "https://i0.wp.com/" + item.url.replace("https://",""); }

    if(isVid) {
        if(lagu) lagu.volume = 0.1; 
        cont.innerHTML = `<video src="${item.url}" controls autoplay loop style="width:100%"></video>`;
    } else {
        // FIX VOLUME: Balikin volume ke 1.0 kalau yang digeser ternyata foto biasa
        if(lagu) lagu.volume = 1.0; 
        cont.innerHTML = `<img src="${urlAman}" style="width:100%; max-height:80vh; object-fit:contain;" onerror="this.onerror=null; this.src='${item.url}';">`;
    }
    tampilkanKomentar(true);
}

function geserMomen(arah) {
    indexSkrg += arah;
    if (indexSkrg < 0) indexSkrg = listMomen.length - 1;
    if (indexSkrg >= listMomen.length) indexSkrg = 0;
    bukaModalIndex(indexSkrg);
}

function tutupModal() {
    document.getElementById("myModal").style.display = "none";
    document.getElementById("modal-media-container").innerHTML = "";
    if(lagu) lagu.volume = 1.0; 
}

// DETEKSI SWIPE LAYAR HP
let touchstartX = 0; let touchendX = 0;
document.getElementById('myModal').addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; });
document.getElementById('myModal').addEventListener('touchend', e => { 
    touchendX = e.changedTouches[0].screenX; 
    if (touchendX < touchstartX - 50) geserMomen(1); 
    if (touchendX > touchstartX + 50) geserMomen(-1); 
});

// 6. KOMENTAR 3 KARAKTER
function tampilkanKomentar(scroll) {
    fetch(databaseURL + fotoAktif + ".json").then(r => r.json()).then(data => {
        const list = document.getElementById("comment-list");
        if(!data) { list.innerHTML = "<p style='font-size:12px; color:gray;'>Belum ada komen...</p>"; return; }
        let h = "";
        Object.keys(data).forEach(k => {
            const item = data[k];
            let userSkrg = "Eka Aulia 😚";
            let warnaNama = "#262626";

            if (item.user === "Ibni") { userSkrg = "Ibni Ganteng 😎"; warnaNama = "#0095f6"; } 
            else if (item.user === "Admin") { userSkrg = "sweet moment💗"; warnaNama = "#ff007f"; }

            h += `<div style="margin-bottom: 8px; font-size: 14px; text-align: left;">
                    <b style="font-family: 'Style Script', cursive; font-size: 18px; color: ${warnaNama};">${userSkrg}</b> 
                    <span style="font-size: 13px;">${item.teks}</span>
                  </div>`;
        });
        list.innerHTML = h;
        if(scroll) list.scrollTop = list.scrollHeight;
    });
}

function kirimKomentar() {
    const inp = document.getElementById("input-komen");
    let teks = inp.value.trim(); if(!teks) return;
    
    let u = "Eka", namaTampil = "Eka Aulia 😚", kirimEmail = false;

    if(teks.startsWith("#")) { 
        u = "Ibni"; namaTampil = "Ibni Ganteng 😎"; teks = teks.substring(1).trim(); kirimEmail = true; 
        localStorage.setItem('role_web', 'Ibni'); 
    } 
    else if (teks.startsWith("!!")) { u = "Admin"; namaTampil = "sweet moment💗"; teks = teks.substring(2).trim(); kirimEmail = true; }
    else { localStorage.setItem('role_web', 'Eka'); } 

    fetch(databaseURL + fotoAktif + ".json", { 
        method: "POST", body: JSON.stringify({ user: u, teks: teks, t: Date.now() }) 
    }).then(() => {
        inp.value = ""; tampilkanKomentar(true);
        notifTele(`🔔 KOMEN: ${namaTampil} bilang "${teks}"`);
        if(kirimEmail) kirimEmailKeEka(namaTampil, `Ada komentar baru sayang! ❤️ Cek web yaa`, fotoAktif);
    });
}

// 7. DM RAHASIA DENGAN TYPING & READ STATUS
function handleTyping() {
    let siapa = localStorage.getItem('role_web') || 'Eka';
    fetch(databaseURL + "status.json", { method: "PATCH", body: JSON.stringify({ typing: Date.now(), typper: siapa }) });
}

function cekStatusPesan() {
    fetch(databaseURL + "status.json").then(r => r.json()).then(data => {
        if(!data) return;
        const sedangNgetik = (Date.now() - data.typing) < 3000;
        const bukanGua = data.typper !== localStorage.getItem('role_web'); 
        const typingEl = document.getElementById("typing-indicator");
        
        if(typingEl) typingEl.style.display = (sedangNgetik && bukanGua) ? "block" : "none";
    });
}

function bukaBoxPesan() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.getElementById('modal-pesan').style.display = 'block';
    loadPesanDM();
    
    if(localStorage.getItem('role_web') !== 'Ibni') {
        fetch(databaseURL + "status.json", { method: "PATCH", body: JSON.stringify({ read: true }) });
    }
}

function tutupDM() { 
    document.getElementById('modal-pesan').style.display = 'none'; 
}

function kirimPesanDM() {
    const inp = document.getElementById("isi-pesan-eka");
    let teks = inp.value.trim(); if(!teks) return;
    let p = "Eka Aulia", isEmail = false;
    
    if(teks.startsWith("#")) { 
        p = "Ibni"; teks = teks.substring(1); isEmail = true; 
        localStorage.setItem('role_web', 'Ibni'); 
    } else {
        localStorage.setItem('role_web', 'Eka'); 
    }

    fetch(databaseURL + "pesan_rahasia.json", { method: "POST", body: JSON.stringify({ u: p, m: teks, t: Date.now() }) }).then(() => {
        fetch(databaseURL + "status.json", { method: "PATCH", body: JSON.stringify({ read: false }) });
        inp.value = ""; loadPesanDM();
        notifTele(`📩 DM DARI: ${p}\nIsi: "${teks}"`);
        if(isEmail) {
            kirimEmailKeEka("Ibni", `Ada DM rahasia nih! ❤️`);
        }
    });
}

function loadPesanDM() {
    fetch(databaseURL + "pesan_rahasia.json").then(r => r.json()).then(data => {
        const c = document.getElementById("chat-container");
        fetch(databaseURL + "status.json").then(r => r.json()).then(st => {
            if(!data) return;
            let h = "";
            const keys = Object.keys(data);
            keys.forEach((k, idx) => {
                const i = data[k]; const isMe = i.u === "Ibni";
                h += `<div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'}; margin-bottom: 8px;">
                        <div style="background:${isMe ? '#0095f6' : '#efefef'}; color:${isMe ? '#fff' : '#000'}; padding:8px 12px; border-radius:15px; max-width:80%; font-size:14px;">${i.m}</div>
                      </div>`;
                if(idx === keys.length - 1 && isMe && st && st.read) h += `<div class="status-read">Dibaca</div>`;
                else if(idx === keys.length - 1 && isMe && st && !st.read) h += `<div class="status-read">Terkirim</div>`;
            });
            c.innerHTML = h; c.scrollTop = c.scrollHeight;
        });
    });
}

// 8. NOTIFIKASI
const teleToken = "8558797937:AAHPZs_R0bn6R6kLu0qW2g1cbVOLoqB57IM";
const teleChatID = "1865257904";
const emailServiceID = "service_6ssczri";
const emailTemplateID = "template_z4t2k8j";

function notifTele(m) { fetch(`https://api.telegram.org/bot${teleToken}/sendMessage?chat_id=${teleChatID}&text=${encodeURIComponent(m)}`); }
function kirimEmailKeEka(sub, isi, foto = "Momen Kita") { emailjs.send(emailServiceID, emailTemplateID, { from_name: sub, message: isi, foto_url: foto, reply_to: "ekaauliaan@gmail.com" }); }

// 9. SURAT & HUJAN LOVE (FIXED)
function createHeart() { 
    const h = document.createElement('div'); 
    h.innerHTML = '❤️'; 
    h.className = 'love-terbang'; // Ditambahin nama/class buat gampang dihapus
    h.style.position = 'fixed';
    h.style.bottom = '-20px';
    h.style.left = Math.random() * 100 + 'vw'; 
    h.style.fontSize = (Math.random() * 15 + 10) + 'px';
    h.style.opacity = Math.random() * 0.5 + 0.5;
    h.style.zIndex = '99999';
    h.style.animation = `terbang ${Math.random() * 3 + 2}s linear`;
    
    if(!document.getElementById('animasi-love')) {
        const style = document.createElement('style');
        style.id = 'animasi-love';
        style.innerHTML = `@keyframes terbang { to { transform: translateY(-120vh); } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(h); 
    setTimeout(() => h.remove(), 5000); 
}

function masukKeSurat() { 
    if(lagu) lagu.volume = 0.1; 
    document.getElementById("page-profil").style.display = "none"; 
    document.getElementById("page-surat").style.display = "block"; 
    
    // FIX BOCOR: Reset mesin sebelum nyalain baru
    clearInterval(hujanInterval); 
    hujanInterval = setInterval(createHeart, 300); 
}

function backToProfil() { 
    if(lagu) lagu.volume = 1.0; 
    document.getElementById("page-surat").style.display = "none"; 
    document.getElementById("page-profil").style.display = "block"; 
    
    // FIX BOCOR: Matiin mesin & sapu bersih sisa love di layar
    clearInterval(hujanInterval); 
    document.querySelectorAll('.love-terbang').forEach(el => el.remove());
}

loadGridOtomatis();
