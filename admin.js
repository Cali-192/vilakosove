// 1. Konfigurimi i Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC0LGt0z1gVH_I2FvnWZj2sy1YSfVXVGCk",
    authDomain: "vilakosove.firebaseapp.com",
    databaseURL: "https://vilakosove-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "vilakosove",
    storageBucket: "vilakosove.firebasestorage.app",
    messagingSenderId: "1060074168881",
    appId: "1:1060074168881:web:8d8a6694a6559b91d8eb10",
    measurementId: "G-2E4773YX24"
};

// Inicializimi i Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
const auth = firebase.auth();

// 2. Kontrolli i Autorizimit (Siguria)
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        console.log("Mirëseerdhe Admin:", user.email);
        loadVilasForManagement();
    }
});

// Funksioni për Logout
window.logout = function() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
};

// 3. Inicializimi i EmailJS
emailjs.init("sLcObY_Fg6HrOOkWX");

// 4. Logjika për ruajtjen/përditësimin e vilës
const vilaForm = document.getElementById('vilaForm');

if (vilaForm) {
    vilaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Kontrollojmë nëse kemi një ID (Edit Mode) apo po krijojmë të re
        const existingId = document.getElementById('vilaId').value;
        const vilaId = existingId ? existingId : Date.now().toString();

        // Marrja e vlerave bazë
        const emri = document.getElementById('emri').value;
        const lokacioni = document.getElementById('lokacioni').value;
        const cmimi = document.getElementById('cmimi').value;
        
        // Pastrojmë numrin e tel nga hapësirat për siguri në WhatsApp
        const telRaw = document.getElementById('tel').value;
        const tel = telRaw.replace(/\s+/g, ''); 

        const kategoria = document.getElementById('kategoria').value; 
        const pershkrimi = document.getElementById('pershkrimi').value;
        
        // Marrja e koordinatave
        const latValue = document.getElementById('lat').value;
        const lngValue = document.getElementById('lng').value;
        const lat = latValue ? parseFloat(latValue) : null;
        const lng = lngValue ? parseFloat(lngValue) : null;

        // Galeria e Imazheve
        const imazhiKryesor = document.getElementById('imazhi').value;
        const fotoShtese = [
            document.getElementById('imazhi2').value,
            document.getElementById('imazhi3').value,
            document.getElementById('imazhi4').value,
            document.getElementById('imazhi5').value
        ];

        const galeria = [imazhiKryesor];
        fotoShtese.forEach(url => {
            if (url && url.trim() !== "") {
                galeria.push(url);
            }
        });

        // Marrja e pajisjeve (Amenities)
        const pajisjet = [];
        const checkboxes = document.querySelectorAll('.amenity:checked');
        checkboxes.forEach((checkbox) => {
            pajisjet.push(checkbox.value);
        });

        const templateParams = {
            emri_villes: emri,
            lokacioni: lokacioni,
            cmimi: cmimi,
            tel: tel
        };

        // RUAJTJA / PËRDITËSIMI NË FIREBASE
        database.ref('vilat/' + vilaId).set({
            id: vilaId,
            emri: emri,
            lokacioni: lokacioni,
            cmimi: cmimi,
            imazhi: imazhiKryesor,
            galeria: galeria,
            tel: tel,
            kategoria: kategoria,
            pershkrimi: pershkrimi,
            lat: lat,
            lng: lng,
            amenities: pajisjet
        })
        .then(() => {
            console.log("Sukses në Firebase!");
            
            // Dërgojmë email vetëm nëse është vilë e re
            if (!existingId) {
                emailjs.send('service_esu53c8', 'template_dybbtpl', templateParams)
                    .then(() => console.log("Email u dërgua!"))
                    .catch((err) => console.error("Gabim në dërgimin e emailit:", err));
            }

            alert(existingId ? "Vila u përditësua me sukses!" : "Vila u publikua me sukses!");
            anuloEditimin(); 
        })
        .catch((error) => {
            console.error('Gabim:', error);
            alert("Ndodhi një gabim gjatë ruajtjes: " + error.message);
        });
    });
}

// 5. Funksioni për të shfaqur listën e vilave për menaxhim
function loadVilasForManagement() {
    const listaDiv = document.getElementById('listaMenaxhimit');
    if (!listaDiv) return;

    database.ref('vilat').on('value', (snapshot) => {
        const data = snapshot.val();
        listaDiv.innerHTML = ""; 

        if (data) {
            Object.keys(data).forEach(id => {
                const vila = data[id];
                const item = document.createElement('div');
                item.className = "admin-vila-card";
                
                item.innerHTML = `
                    <div class="vila-meta">
                        <h4>${vila.emri}</h4>
                        <p>📍 ${vila.lokacioni} | 📸 ${vila.galeria ? vila.galeria.length : 1} foto</p>
                        <p style="color: #0ea5e9; font-weight: bold;">${vila.cmimi}€ / natë</p>
                    </div>
                    <div class="action-btns">
                        <button onclick="editoVilen('${id}')" class="btn-edit" title="Edito">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="fshijVilen('${id}')" class="btn-delete" title="Fshij">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                listaDiv.appendChild(item);
            });
        } else {
            listaDiv.innerHTML = "<p style='text-align:center; color: #64748b; padding: 20px;'>Nuk ka vila për të shfaqur.</p>";
        }
    });
}

// 6. Funksioni për Editim (Mbushja e formës)
window.editoVilen = function(id) {
    database.ref('vilat/' + id).once('value').then((snapshot) => {
        const vila = snapshot.val();
        if (!vila) return;

        // Mbushim fushat e fshehura dhe tekstet
        document.getElementById('vilaId').value = id;
        document.getElementById('formTitle').innerText = "Edito Vilën: " + vila.emri;
        document.getElementById('submitBtn').innerText = "Ruaj Ndryshimet";
        document.getElementById('cancelBtn').style.display = "block";

        // Mbushim inputet
        document.getElementById('emri').value = vila.emri || "";
        document.getElementById('lokacioni').value = vila.lokacioni || "";
        document.getElementById('cmimi').value = vila.cmimi || "";
        document.getElementById('tel').value = vila.tel || "";
        document.getElementById('kategoria').value = vila.kategoria || "";
        document.getElementById('pershkrimi').value = vila.pershkrimi || "";
        document.getElementById('lat').value = vila.lat || "";
        document.getElementById('lng').value = vila.lng || "";

        // Mbushim galerisë (deri në 5 foto)
        // Resetojmë fillimisht të gjitha inputet e galerisë
        document.getElementById('imazhi').value = "";
        document.getElementById('imazhi2').value = "";
        document.getElementById('imazhi3').value = "";
        document.getElementById('imazhi4').value = "";
        document.getElementById('imazhi5').value = "";

        if (vila.galeria && Array.isArray(vila.galeria)) {
            if(vila.galeria[0]) document.getElementById('imazhi').value = vila.galeria[0];
            if(vila.galeria[1]) document.getElementById('imazhi2').value = vila.galeria[1];
            if(vila.galeria[2]) document.getElementById('imazhi3').value = vila.galeria[2];
            if(vila.galeria[3]) document.getElementById('imazhi4').value = vila.galeria[3];
            if(vila.galeria[4]) document.getElementById('imazhi5').value = vila.galeria[4];
        } else if (vila.imazhi) {
            document.getElementById('imazhi').value = vila.imazhi;
        }

        // Resetojmë dhe mbushim pajisjet (checkboxes)
        const checkboxes = document.querySelectorAll('.amenity');
        checkboxes.forEach(cb => {
            cb.checked = vila.amenities && vila.amenities.includes(cb.value);
        });

        // Scroll lart te forma
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

// Funksioni për të anuluar editimin
window.anuloEditimin = function() {
    if (vilaForm) vilaForm.reset();
    document.getElementById('vilaId').value = "";
    document.getElementById('formTitle').innerText = "Shto një Vilë të Re";
    document.getElementById('submitBtn').innerText = "Publiko Vilën";
    document.getElementById('cancelBtn').style.display = "none";
};

// 7. Funksioni për fshirjen e vilës
window.fshijVilen = function(id) {
    if (confirm("A jeni i sigurt që dëshironi ta fshini këtë vilë përgjithmonë?")) {
        database.ref('vilat/' + id).remove()
            .then(() => { 
                console.log("Vila u fshi.");
                if (document.getElementById('vilaId').value === id) {
                    anuloEditimin();
                }
            })
            .catch((error) => { 
                alert("Gabim gjatë fshirjes: " + error.message); 
            });
    }
};