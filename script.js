// ========== BARRE DE CHARGEMENT ==========
let progress = 0;
const steps = [
    { text: "Chargement des assets...", width: 20 },
    { text: "Connexion au serveur...", width: 40 },
    { text: "Initialisation du plateau...", width: 70 },
    { text: "Prêt à jouer !", width: 100 }
];

function updateProgress(stepIndex) {
    if (stepIndex >= steps.length) {
        setTimeout(() => {
            const loader = document.getElementById('loaderScreen');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    const main = document.getElementById('mainContent');
                    if (main) main.style.display = 'block';
                }, 500);
            }
        }, 500);
        return;
    }
    
    const step = steps[stepIndex];
    const progressFill = document.getElementById('progressFill');
    const loadingText = document.getElementById('loadingText');
    
    if (progressFill) progressFill.style.width = step.width + '%';
    if (loadingText) loadingText.textContent = step.text;
    
    setTimeout(() => updateProgress(stepIndex + 1), 800);
}

updateProgress(0);

// ========== ÉTAT DU JEU ==========
let plateau = [];
let scoreJ1 = 0, scoreJ2 = 0;
let joueurActuel = 1;
let partieFinie = false;

// ========== THÈME ==========
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        const isDark = theme === 'dark';
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i><span>Thème clair</span>' : '<i class="fas fa-moon"></i><span>Thème sombre</span>';
    }
}

// ========== INITIALISATION ==========
function initJeu() {
    plateau = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
    scoreJ1 = 0;
    scoreJ2 = 0;
    joueurActuel = 1;
    partieFinie = false;
    afficherPlateau();
    miseAJourAffichage();
}

function afficherPlateau() {
    const container = document.getElementById('plateau');
    if (!container) return;
    container.innerHTML = '';
    
    const rangeeHaut = document.createElement('div');
    rangeeHaut.className = 'rangee';
    for (let i = 13; i >= 7; i--) {
        rangeeHaut.appendChild(creerCase(i));
    }
    container.appendChild(rangeeHaut);
    
    const rangeeBas = document.createElement('div');
    rangeeBas.className = 'rangee';
    for (let i = 0; i <= 6; i++) {
        rangeeBas.appendChild(creerCase(i));
    }
    container.appendChild(rangeeBas);
}

function creerCase(index) {
    const caseDiv = document.createElement('div');
    caseDiv.className = 'case';
    if (plateau[index] === 0) caseDiv.classList.add('vide');
    caseDiv.textContent = plateau[index];
    
    const peutJouer = !partieFinie && 
        ((joueurActuel === 1 && index < 7) || (joueurActuel === 2 && index >= 7)) &&
        plateau[index] > 0;
    
    if (peutJouer) {
        caseDiv.style.cursor = 'pointer';
        caseDiv.onclick = () => jouerCoup(index);
    }
    return caseDiv;
}

function jouerCoup(index) {
    let graines = plateau[index];
    plateau[index] = 0;
    let i = index;
    let derniereCase = index;
    
    while (graines > 0) {
        i = (i + 1) % 14;
        plateau[i]++;
        graines--;
        derniereCase = i;
    }
    
    let estAdverse = (joueurActuel === 1 && derniereCase >= 7) ||
                     (joueurActuel === 2 && derniereCase <= 6);
    
    if (estAdverse && (plateau[derniereCase] === 2 || plateau[derniereCase] === 3)) {
        let capture = plateau[derniereCase];
        let totalAdv = 0;
        if (joueurActuel === 1) {
            for (let j = 7; j <= 13; j++) totalAdv += plateau[j];
        } else {
            for (let j = 0; j <= 6; j++) totalAdv += plateau[j];
        }
        if (totalAdv - capture > 0) {
            plateau[derniereCase] = 0;
            if (joueurActuel === 1) scoreJ1 += capture;
            else scoreJ2 += capture;
            const msg = document.getElementById('infoMessage');
            if (msg) {
                msg.textContent = `🎉 Capture ! ${capture} graine(s) !`;
                setTimeout(() => msg.textContent = '', 2000);
            }
        }
    }
    
    verifierFinPartie();
    
    if (!partieFinie) {
        joueurActuel = joueurActuel === 1 ? 2 : 1;
    }
    
    afficherPlateau();
    miseAJourAffichage();
}

function verifierFinPartie() {
    let j1Peut = false, j2Peut = false;
    for (let i = 0; i <= 6; i++) if (plateau[i] > 0) j1Peut = true;
    for (let i = 7; i <= 13; i++) if (plateau[i] > 0) j2Peut = true;
    
    if (!j1Peut || !j2Peut) {
        partieFinie = true;
        if (!j1Peut) {
            for (let i = 7; i <= 13; i++) { scoreJ2 += plateau[i]; plateau[i] = 0; }
        }
        if (!j2Peut) {
            for (let i = 0; i <= 6; i++) { scoreJ1 += plateau[i]; plateau[i] = 0; }
        }
        let msg = scoreJ1 > scoreJ2 ? `🏆 Joueur 1 gagne ${scoreJ1}-${scoreJ2} !` :
                   scoreJ2 > scoreJ1 ? `🏆 Joueur 2 gagne ${scoreJ2}-${scoreJ1} !` :
                   `🤝 Match nul ${scoreJ1}-${scoreJ2} !`;
        setTimeout(() => alert(msg), 100);
    }
}

function miseAJourAffichage() {
    document.getElementById('scoreJ1').textContent = scoreJ1;
    document.getElementById('scoreJ2').textContent = scoreJ2;
    const messageSpan = document.querySelector('#messageTour span');
    if (messageSpan) {
        messageSpan.textContent = partieFinie ? "Partie terminée" : `🎯 Tour du Joueur ${joueurActuel}`;
    }
}

// ========== BOUTONS ==========
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        initJeu();
        const msg = document.getElementById('infoMessage');
        if (msg) msg.textContent = "🔄 Nouvelle partie !";
    });
}

// ========== LANCEMENT ==========
initTheme();
initJeu();
