// --- MASUKIN API KEY IMGBB LU DISINI ---
const imgbb_api_key = "4404bf0574badbfede0a677991b7dae9"; 

const lagu = document.getElementById("musik-utama");
let fotoAktif = ""; 
let hujanInterval;
const databaseURL = "https://komentar-bub-4cf68-default-rtdb.asia-southeast1.firebasedatabase.app/";

// 1. LOGIN & VOLUME AWAL
function putarMusik() { if(lagu) lagu.play().catch(e => console.log("Wait user")); }

function checkPass() {
    var input = document.getElementById("pass-input").value;
    if (input === "23012026") {
        if(lagu) { lagu.play(); lagu.volume = 1.0; }
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("page-profil").style.display = "block";
        loadGridOtomatis();
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

// 3. LOGIKA UPLOAD (HYBRID: LINK & GALERI)
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

    // JALUR 1: JIKA PAKAE LINK (VIDEO/LINK GITHUB IBNI)
    if (linkInput !== "") {
        const tipe = document.getElementById('inp-link-type').value;
        simpanKeFirebase(linkInput, caption, tipe);
        return;
    }

    // JALUR 2: JIKA PAKE FOTO GALERI
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    try {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbb_api_key}`, { method: "POST", body: formData });
        const result = await res.json();
        if (result.success) simpanKeFirebase(result.data.url, caption, "image");
        else { alert("Gagal upload!"); btn.innerHTML = "Upload Momen 🚀"; btn.disabled = false; }
    } catch (e) { alert("Error koneksi!"); btn.innerHTML = "Upload Momen 🚀"; btn.disabled = false; }
}

function simpanKeFirebase(url, cap, tipe) {
    fetch(databaseURL + "posts.json", {
        method: "POST",
        body: JSON.stringify({ url: url, cap: cap, type: tipe, t: Date.now() })
    }).then(() => {
        notifTele(`📸 MOMEN BARU!\nType: ${tipe}\nCap: ${cap}`);
        //kirimEmailKeEka("Admin Sweet Moment", `Sayang, ada momen baru berhasil diupload! ❤️`, url);
        notifTele(`✅ KONFIRMASI:  post terbaru sudah dikirim ke Eka!`);
        alert("Momen Berhasil Terkirim! ❤️"); location.reload();
    });
}

// 4. GRID & MODAL (DENGAN FIX VOLUME & FIX UKURAN FOTO)
function loadGridOtomatis() {
    fetch(databaseURL + "posts.json").then(r => r.json()).then(data => {
        const grid = document.getElementById("main-grid");
        if(!data) return;
        document.getElementById("post-count").innerText = Object.keys(data).length;
        let h = "";
        Object.keys(data).reverse().forEach(k => {
            const i = data[k];
            const isVid = i.type === "video" || i.url.includes(".mp4");
            let aksi = i.cap === "PINTU_SURAT" ? "masukKeSurat()" : `bukaModal('${i.url}', '${i.cap}', ${isVid})`;
            
            // FIX UKURAN: Balikin class photo-item dan paksain width 100% object-fit cover
            h += `
                 <div onclick="${aksi}" style="width: 100%; aspect-ratio: 1/1; position: relative; overflow: hidden; cursor: pointer; border: 1px solid #fff;">
                    ${isVid ? 
                        `<video src="${i.url}" autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"></video>` : 
                        `<img src="${i.url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">`
                    }
                </div>`;
        });
        grid.innerHTML = h;
    });
}


function bukaModal(src, cap, isVid) {
    // FIX PENTING: Ganti semua titik, slash, dan simbol jadi underscore biar Firebase gak ngamuk
    fotoAktif = src.replace(/[\.\/\:\#\$\[\]]/g, '_');
    
    document.getElementById("myModal").style.display = "block";
    document.getElementById("caption-text").innerText = cap;
    const cont = document.getElementById("modal-media-container");
    
    if(isVid) {
        if(lagu) lagu.volume = 0.1; // KECILIN MUSIK
        cont.innerHTML = `<video src="${src}" controls autoplay loop style="width:100%"></video>`;
    } else {
        cont.innerHTML = `<img src="${src}" style="width:100%">`;
    }
    tampilkanKomentar(true);
}


function tutupModal() {
    document.getElementById("myModal").style.display = "none";
    document.getElementById("modal-media-container").innerHTML = "";
    if(lagu) lagu.volume = 1.0; // BALIKIN MUSIK JADI KENCENG
}

// 5. KOMENTAR & DM (FIX)
function tampilkanKomentar(scroll) {
    fetch(databaseURL + fotoAktif + ".json").then(r => r.json()).then(data => {
        const list = document.getElementById("comment-list");
        if(!data) { list.innerHTML = "<p style='font-size:12px; color:gray;'>Belum ada komen...</p>"; return; }
        let h = "";
        Object.keys(data).forEach(k => {
            const i = data[k];
            const isIbni = i.user === "Ibni";
            h += `<div style="font-size:14px; margin-bottom:5px;"><b style="color:${isIbni ? '#0095f6' : '#000'}">${isIbni ? 'Ibni' : 'Eka'}</b>: ${i.teks}</div>`;
        });
        list.innerHTML = h;
        if(scroll) list.scrollTop = list.scrollHeight;
    });
}

function kirimKomentar() {
    const inp = document.getElementById("input-komen");
    let teks = inp.value.trim(); if(!teks) return;
    let u = "Eka", isIbni = false;
    if(teks.startsWith("#")) { u = "Ibni"; teks = teks.substring(1); isIbni = true; }
    fetch(databaseURL + fotoAktif + ".json", { method: "POST", body: JSON.stringify({ user: u, teks: teks, t: Date.now() }) }).then(() => {
        inp.value = ""; tampilkanKomentar(true);
        notifTele(`🔔 KOMEN: ${u} bilang "${teks}"`);
        if(isIbni) kirimEmailKeEka("Ibni", `Bales komen aku dong sayang! ❤️ Link: https://cokyami17-hub.github.io/love-is-magic/`);
        notifTele(`✅ KONFIRMASI: Email notif komen sudah dikirim!`);
    });
}

function bukaBoxPesan() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.getElementById('modal-pesan').style.display = 'block';
    loadPesanDM();
}

function kirimPesanDM() {
    const inp = document.getElementById("isi-pesan-eka");
    let teks = inp.value.trim(); if(!teks) return;
    let p = "Eka Aulia", isEmail = false;
    if(teks.startsWith("#")) { p = "Ibni"; teks = teks.substring(1); isEmail = true; }
    fetch(databaseURL + "pesan_rahasia.json", { method: "POST", body: JSON.stringify({ u: p, m: teks, t: Date.now() }) }).then(() => {
        inp.value = ""; loadPesanDM();
        notifTele(`📩 DM DARI: ${p}\nIsi: "${teks}"`);
        if(isEmail) {
            kirimEmailKeEka("Ibni", `Ada DM rahasia nih sayanggg! ❤️ Link: https://cokyami17-hub.github.io/love-is-magic/`);
            notifTele(`✅ KONFIRMASI: Email notif DM sudah dikirim!`);
        }
    });
}

function loadPesanDM() {
    fetch(databaseURL + "pesan_rahasia.json").then(r => r.json()).then(data => {
        const c = document.getElementById("chat-container");
        if(!data) return;
        let h = "";
        Object.keys(data).forEach(k => {
            const i = data[k]; const isMe = i.u === "Ibni";
            h += `<div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'};"><div style="background:${isMe ? '#0095f6' : '#efefef'}; color:${isMe ? '#fff' : '#000'}; padding:8px 12px; border-radius:15px; max-width:80%; font-size:14px;">${i.m}</div></div>`;
        });
        c.innerHTML = h; c.scrollTop = c.scrollHeight;
    });
}

// 6. KONFIGURASI NOTIF
const teleToken = "8558797937:AAHPZs_R0bn6R6kLu0qW2g1cbVOLoqB57IM";
const teleChatID = "1865257904";
const emailServiceID = "service_6ssczri";
const emailTemplateID = "template_z4t2k8j";

function notifTele(m) { fetch(`https://api.telegram.org/bot${teleToken}/sendMessage?chat_id=${teleChatID}&text=${encodeURIComponent(m)}`); }
function kirimEmailKeEka(sub, isi, foto = "Momen Kita") { emailjs.send(emailServiceID, emailTemplateID, { from_name: sub, message: isi, foto_url: foto, reply_to: "ekaauliaan@gmail.com" }); }

// 7. SURAT & REFRESH
function createHeart() { const h = document.createElement('div'); h.className = 'heart'; h.innerHTML = '❤️'; h.style.left = Math.random() * 100 + 'vw'; document.body.appendChild(h); setTimeout(() => h.remove(), 5000); }
function masukKeSurat() { if(lagu) lagu.volume = 0.5; document.getElementById("page-profil").style.display = "none"; document.getElementById("page-surat").style.display = "block"; hujanInterval = setInterval(createHeart, 300); }
function backToProfil() { if(lagu) lagu.volume = 1.0; document.getElementById("page-surat").style.display = "none"; document.getElementById("page-profil").style.display = "block"; clearInterval(hujanInterval); }

loadGridOtomatis();
