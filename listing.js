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

// Inicializimi me kontroll sigurie
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Referencat e elementeve
const grid = document.getElementById('listingsGrid');
const searchInput = document.getElementById('searchInput');

let listaVilave = []; 

// --- 2. LOGJIKA E HERO SLIDER (Smooth Fade) ---
function inicializoHeroSlider() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    let bgContainer = heroSection.querySelector('.hero-bg-container');
    if (!bgContainer) {
        bgContainer = document.createElement('div');
        bgContainer.className = 'hero-bg-container';
        heroSection.prepend(bgContainer);
    }

    const sfondet = [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2000',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=2000',
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80'
    ];

    // Pastrojmë container-in para se të shtojmë sllajdet
    bgContainer.innerHTML = '';
    sfondet.forEach((url, i) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide ${i === 0 ? 'active' : ''}`;
        slide.style.backgroundImage = `url("${url}")`;
        bgContainer.appendChild(slide);
    });

    const slides = bgContainer.querySelectorAll('.hero-slide');
    let currentIndex = 0;

    setInterval(() => {
        if (slides.length === 0) return;
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 6000);
}

// 3. Marrja e të dhënave dhe Përditësimi i Statistikave
function loadVilas() {
    database.ref('vilat').on('value', (snapshot) => {
        const data = snapshot.val();
        listaVilave = [];
        
        if (data) {
            Object.keys(data).forEach(id => {
                listaVilave.push({ id, ...data[id] });
            });
        }
        
        listaVilave.reverse();
        shfaqVilat(listaVilave);
        përditësoStatistikat(listaVilave);
    }, (error) => {
        console.error("Gabim në leximin e Firebase:", error);
    });
}

// 4. Shfaqja e Kartave (me AOS animacione)
function shfaqVilat(data) {
    if (!grid) return; 

    if (data.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;" data-aos="fade-up">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 20px;"></i>
                <h3 style="color: #64748b; font-weight: 700;">Nuk u gjet asnjë vilë.</h3>
                <p style="color: #94a3b8;">Provoni të kërkoni me një term tjetër ose ndryshoni kategorinë.</p>
            </div>
        `;
        përditësoNumruesin(0);
        return;
    }

    grid.innerHTML = data.map((vila, index) => {
        const foto = (vila.imazhi && vila.imazhi.includes('http')) ? vila.imazhi : 'https://via.placeholder.com/400x300?text=Imazhi+Mungon';
        
        return `
            <div class="vila-card" onclick="window.location.href='detajet.html?id=${vila.id}'" data-aos="fade-up" data-aos-delay="${index * 50}">
                <div class="card-img-container">
                    <img src="${foto}" alt="${vila.emri}" onerror="this.src='https://via.placeholder.com/400x300?text=Gabim+ne+Imazh'">
                    <div class="price-tag">
                        €${vila.cmimi || '0'} <span>/natë</span>
                    </div>
                </div>
                <div class="vila-info">
                    <div class="location-info">
                        <i class="fa-solid fa-location-dot"></i> ${vila.lokacioni || 'Kosovë'}
                    </div>
                    <h3>${vila.emri || 'Vila Premium'}</h3>
                    <div style="display: flex; gap: 15px; color: #64748b; font-size: 0.85rem; font-weight: 600;">
                        <span><i class="fa-solid fa-bed"></i> ${vila.dhomat || '3'} Dhoma</span>
                        <span><i class="fa-solid fa-bath"></i> ${vila.banjot || '2'} Banjo</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    përditësoNumruesin(data.length);
}

// Funksioni për numëruesin e titullit
function përditësoNumruesin(numri) {
    const countEl = document.getElementById('countText');
    if (countEl) {
        countEl.innerText = numri === 1 ? `1 vilë e gjetur` : `${numri} vila të disponueshme`;
    }
}

// FUNKSIONI PËR ANIMACIONIN E NUMRAVE
function animoNumrat(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    
    let current = 0;
    const duration = 2000; // Kohëzgjatja totale
    const stepTime = 30; // Shpejtësia e rifreskimit
    const increment = target / (duration / stepTime);

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.innerText = target + (id === 'countVila' || id === 'countQytete' ? "+" : "/7");
            clearInterval(timer);
        } else {
            el.innerText = Math.ceil(current) + (id === 'countVila' || id === 'countQytete' ? "+" : "/7");
        }
    }, stepTime);
}

// Përditësimi i statistikave live
let statsAnimated = false;
function përditësoStatistikat(data) {
    const totalVila = data.length;
    // Gjejmë sa lokacione unike janë (Rugovë, Brezovicë, etj.)
    const qytetetUnique = [...new Set(data.map(v => v.lokacioni))].filter(l => l).length;

    // Vendos vlerat reale në data-target për elementet counter
    const vCountEl = document.getElementById('countVila');
    const qCountEl = document.getElementById('countQytete');

    if(vCountEl) vCountEl.setAttribute('data-target', totalVila);
    if(qCountEl) qCountEl.setAttribute('data-target', qytetetUnique);

    // Nisim animacionin vetëm një herë
    if(!statsAnimated) {
        const statsBar = document.querySelector('.stats-bar');
        if(statsBar) {
            const observer = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting) {
                    setTimeout(() => {
                        animoNumrat('countVila', totalVila);
                        animoNumrat('countQytete', qytetetUnique);
                        // Nëse keni një stat të tretë si p.sh mbështetja 24/7:
                        animoNumrat('countSupport', 24); 
                    }, 300);
                    statsAnimated = true;
                    observer.disconnect();
                }
            }, { threshold: 0.5 });
            observer.observe(statsBar);
        }
    }
}

// 5. Filtrimi sipas Kategorive
window.filtroSipasKategorise = function(kategoria, element) {
    document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');

    const titulli = document.getElementById('titulliSeksionit');
    if (titulli) {
        titulli.innerText = kategoria === 'Të gjitha' ? 'Vilat Ekskluzive' : `Vila: ${kategoria}`;
    }

    if (kategoria === 'Të gjitha') {
        shfaqVilat(listaVilave);
    } else {
        const filtruar = listaVilave.filter(v => v.kategoria === kategoria);
        shfaqVilat(filtruar);
    }
};

// 6. Kërkimi sipas qytetit (nga kartat e destinacioneve)
window.kerkoSipasQytetit = function(qyteti) {
    if (searchInput) {
        searchInput.value = qyteti;
        const term = qyteti.toLowerCase().trim();
        const filtruar = listaVilave.filter(v => 
            v.lokacioni && v.lokacioni.toLowerCase().includes(term)
        );
        shfaqVilat(filtruar);
        
        if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};

// 7. Search Bar me Debounce
if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const filtruar = listaVilave.filter(v => 
                (v.emri && v.emri.toLowerCase().includes(term)) || 
                (v.lokacioni && v.lokacioni.toLowerCase().includes(term))
            );
            shfaqVilat(filtruar);
        }, 300); 
    });
}

// 8. Butoni i kërkimit
const searchBtn = document.getElementById('searchBtn');
if (searchBtn && searchInput) {
    searchBtn.onclick = () => {
        const term = searchInput.value.toLowerCase().trim();
        if (term && grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
}

// NISJA
document.addEventListener('DOMContentLoaded', () => {
    inicializoHeroSlider(); 
    loadVilas(); 
    
    // Inicializo AOS nëse ekziston
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker OK'))
            .catch(err => console.log('Service Worker Error', err));
    });
}
