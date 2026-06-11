// ========== ÉTAT DU JEU ==========
let plateau = [];
let scoreJ1 = 0;
let scoreJ2 = 0;
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
    mettreAJourAffichage();
    afficherMessage("");
}

function afficherMessage(msg, isError = false) {
    const msgDiv = document.getElementById('infoMessage');
    if (msgDiv) {
        msgDiv.textContent = msg;
        msgDiv.style.color = isError ? '#ff6b6b' : '#4caf50';
        if (msg) {
            setTimeout(() => {
                if (msgDiv.textContent === msg) msgDiv.textContent = '';
            }, 2000);
        }
    }
}

// ========== AFFICHAGE ==========
function afficherPlateau() {
    const container = document.getElementById('plateau');
    if (!container) return;
    container.innerHTML = '';
    
    // Rangée du haut (Joueur 2) - cases 7 à 13
    const rangeeHaut = document.createElement('div');
    rangeeHaut.className = 'rangee rangee-du-haut';
    
    for (let i = 13; i >= 7; i--) {
        const caseDiv = creerCase(i);
        rangeeHaut.appendChild(caseDiv);
    }
    container.appendChild(rangeeHaut);
    
    // Rangée du bas (Joueur 1) - cases 0 à 6
    const rangeeBas = document.createElement('div');
    rangeeBas.className = 'rangee rangee-du-bas';
    
    for (let i = 0; i <= 6; i++) {
        const caseDiv = creerCase(i);
        rangeeBas.appendChild(caseDiv);
    }
    container.appendChild(rangeeBas);
}

function creerCase(index) {
    const caseDiv = document.createElement('div');
    caseDiv.className = 'case';
    caseDiv.textContent = plateau[index];
    
    if (plateau[index] === 0) {
        caseDiv.classList.add('vide');
    }
    
    // Vérifier si on peut jouer sur cette case
    const peutJouer = !partieFinie && 
                      ((joueurActuel === 1 && index < 7) || (joueurActuel === 2 && index >= 7)) &&
                      plateau[index] > 0;
    
    if (peutJouer) {
        caseDiv.style.cursor = "pointer";
        caseDiv.onclick = () => gererClic(index);
    } else {
        caseDiv.style.cursor = "not-allowed";
        caseDiv.style.opacity = "0.7";
    }
    
    return caseDiv;
}

function mettreAJourAffichage() {
    document.getElementById('scoreJ1').textContent = scoreJ1;
    document.getElementById('scoreJ2').textContent = scoreJ2;
    
    const messageEl = document.getElementById('messageTour');
    if (messageEl) {
        if (partieFinie) {
            let winnerMsg = "";
            if (scoreJ1 > scoreJ2) winnerMsg = "🏆 Joueur 1 a gagné ! 🏆";
            else if (scoreJ2 > scoreJ1) winnerMsg = "🏆 Joueur 2 a gagné ! 🏆";
            else winnerMsg = "🤝 Match nul !";
            messageEl.innerHTML = `<i class="fas fa-trophy"></i><span>${winnerMsg}</span>`;
        } else {
            messageEl.innerHTML = `<i class="fas fa-hourglass-half"></i><span>🎯 Tour du Joueur ${joueurActuel}</span>`;
        }
    }
}

// Animation de capture
function animerCapture(caseElement) {
    caseElement.classList.add('capture-animation');
    setTimeout(() => {
        caseElement.classList.remove('capture-animation');
    }, 500);
}

// ========== LOGIQUE DU JEU ==========
function gererClic(index) {
    if (partieFinie) {
        afficherMessage("Partie terminée ! Clique sur 'Nouvelle partie'", true);
        return;
    }
    
    if (joueurActuel === 1 && index >= 7) {
        afficherMessage("Joueur 1, choisis une case dans ta rangée (cases du bas) !", true);
        return;
    }
    if (joueurActuel === 2 && index < 7) {
        afficherMessage("Joueur 2, choisis une case dans ta rangée (cases du haut) !", true);
        return;
    }
    
    if (plateau[index] === 0) {
        afficherMessage("Cette case est vide, choisis-en une autre !", true);
        return;
    }
    
    jouerCoup(index);
}

function jouerCoup(indexDepart) {
    let graines = plateau[indexDepart];
    plateau[indexDepart] = 0;
    
    let i = indexDepart;
    let derniereCase = indexDepart;
    
    // Distribution
    while (graines > 0) {
        i = (i + 1) % 14;
        plateau[i]++;
        graines--;
        derniereCase = i;
    }
    
    // Vérification capture
    let estCaseAdverse = false;
    if (joueurActuel === 1 && derniereCase >= 7) estCaseAdverse = true;
    if (joueurActuel === 2 && derniereCase <= 6) estCaseAdverse = true;
    
    if (estCaseAdverse && (plateau[derniereCase] === 2 || plateau[derniereCase] === 3)) {
        let grainesCapturees = plateau[derniereCase];
        
        let totalGrainesAdverses = 0;
        if (joueurActuel === 1) {
            for (let j = 7; j <= 13; j++) totalGrainesAdverses += plateau[j];
        } else {
            for (let j = 0; j <= 6; j++) totalGrainesAdverses += plateau[j];
        }
        
        if (totalGrainesAdverses - grainesCapturees > 0) {
            plateau[derniereCase] = 0;
            if (joueurActuel === 1) scoreJ1 += grainesCapturees;
            else scoreJ2 += grainesCapturees;
            
            afficherMessage(`🎉 Capture ! ${grainesCapturees} graine(s) capturée(s) !`);
            
            // Animation sur la case capturée
            const cases = document.querySelectorAll('.case');
            if (cases[derniereCase]) animerCapture(cases[derniereCase]);
        }
    }
    
    verifierFinPartie();
    
    if (!partieFinie) {
        joueurActuel = (joueurActuel === 1) ? 2 : 1;
        afficherMessage(`C'est au tour du Joueur ${joueurActuel}`);
    }
    
    afficherPlateau();
    mettreAJourAffichage();
}

function verifierFinPartie() {
    let joueur1PeutJouer = false;
    for (let i = 0; i <= 6; i++) if (plateau[i] > 0) joueur1PeutJouer = true;
    
    let joueur2PeutJouer = false;
    for (let i = 7; i <= 13; i++) if (plateau[i] > 0) joueur2PeutJouer = true;
    
    if (!joueur1PeutJouer || !joueur2PeutJouer) {
        partieFinie = true;
        
        if (!joueur1PeutJouer) {
            for (let i = 7; i <= 13; i++) {
                scoreJ2 += plateau[i];
                plateau[i] = 0;
            }
            afficherMessage("Joueur 1 ne peut plus jouer ! Transfert des graines au Joueur 2");
        }
        if (!joueur2PeutJouer) {
            for (let i = 0; i <= 6; i++) {
                scoreJ1 += plateau[i];
                plateau[i] = 0;
            }
            afficherMessage("Joueur 2 ne peut plus jouer ! Transfert des graines au Joueur 1");
        }
        
        afficherPlateau();
        mettreAJourAffichage();
        
        let finalMsg = "";
        if (scoreJ1 > scoreJ2) finalMsg = `🏆 VICTOIRE ! Joueur 1 gagne ${scoreJ1} - ${scoreJ2} ! 🏆`;
        else if (scoreJ2 > scoreJ1) finalMsg = `🏆 VICTOIRE ! Joueur 2 gagne ${scoreJ2} - ${scoreJ1} ! 🏆`;
        else finalMsg = `🤝 MATCH NUL : ${scoreJ1} partout ! 🤝`;
        
        afficherMessage(finalMsg);
        setTimeout(() => alert(finalMsg), 100);
    }
}

// ========== BOUTONS ==========
document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
document.getElementById('resetBtn')?.addEventListener('click', () => {
    initJeu();
    afficherMessage("🔄 Nouvelle partie !");
});

// ========== LANCEMENT ==========
initTheme();
initJeu();
