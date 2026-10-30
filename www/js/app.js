/* ===== ASSISTANT MEDICAL IA - APPLICATION JAVASCRIPT ===== */

// ===== INITIALISATION =====
document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('DOMContentLoaded', function() {
    // Pour le test dans le navigateur
    if (!window.cordova) {
        initApp();
    }
});

function onDeviceReady() {
    console.log('Cordova est pret - Platforme: ' + device.platform);
    initApp();
}

function initApp() {
    // Masquer le splash screen apres 2.5 secondes
    setTimeout(function() {
        var splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('hidden');
    }, 2500);

    // Charger l'historique
    loadHistory();
    updateStats();
}

// ===== NAVIGATION ENTRE PAGES =====
function showPage(pageId) {
    var pages = document.querySelectorAll('.page');
    pages.forEach(function(page) {
        page.classList.remove('active');
    });

    var target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        target.querySelector('.page-content').scrollTop = 0;
    }

    // Mettre a jour la barre de navigation
    var navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageId) {
            item.classList.add('active');
        }
    });

    // Mettre a jour le centre bouton
    var centerBtns = document.querySelectorAll('.nav-item-center');
    centerBtns.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === pageId) {
            btn.classList.add('active');
        }
    });

    // Si on va sur l'historique, rafraichir
    if (pageId === 'page-history') {
        loadHistory();
    }

    // Si on va sur le profil, mettre a jour les stats
    if (pageId === 'page-profile') {
        updateStats();
    }
}

// ===== GESTION DES ETAPES (SYMPTOMES) =====
function goToStep(step) {
    var stepPatient = document.getElementById('step-patient');
    var stepSymptoms = document.getElementById('step-symptoms');
    var stepResults = document.getElementById('step-results');

    stepPatient.classList.add('hidden');
    stepSymptoms.classList.add('hidden');
    stepResults.classList.add('hidden');

    if (step === 1) stepPatient.classList.remove('hidden');
    if (step === 2) stepSymptoms.classList.remove('hidden');
    if (step === 3) stepResults.classList.remove('hidden');

    // Scroll en haut
    var activePage = document.querySelector('.page.active .page-content');
    if (activePage) activePage.scrollTop = 0;
}

// ===== ANALYSE DES SYMPTOMES =====
function analyzeSymptoms() {
    // Recueillir les symptomes selectionnes
    var checkboxes = document.querySelectorAll('input[name="symptom"]:checked');
    var selectedSymptoms = [];
    checkboxes.forEach(function(cb) {
        selectedSymptoms.push(cb.value);
    });

    if (selectedSymptoms.length === 0) {
        showAlert('Veuillez selectionner au moins un symptome.');
        return;
    }

    var age = document.getElementById('patient-age').value;
    var sexe = document.querySelector('input[name="sexe"]:checked');
    var conditions = document.getElementById('patient-conditions').value;
    var duration = document.getElementById('symptom-duration').value;
    var notes = document.getElementById('symptom-notes').value;

    if (!age) {
        showAlert('Veuillez entrer votre age.');
        goToStep(1);
        return;
    }

    // Passer a l'etape des resultats
    goToStep(3);

    // Afficher le loader
    var loadingEl = document.getElementById('analysis-loading');
    var resultsEl = document.getElementById('analysis-results');
    loadingEl.classList.remove('hidden');
    resultsEl.classList.add('hidden');

    // Simuler l'analyse IA (delai de 2 secondes)
    setTimeout(function() {
        var analysis = performSymptomAnalysis(selectedSymptoms, age, sexe ? sexe.value : null, conditions, duration);
        displaySymptomResults(analysis);

        // Sauvegarder dans l'historique
        saveToHistory({
            type: 'symptom',
            date: new Date().toISOString(),
            symptoms: selectedSymptoms,
            age: age,
            sexe: sexe ? sexe.value : null,
            conditions: conditions,
            duration: duration,
            notes: notes,
            results: analysis
        });

        loadingEl.classList.add('hidden');
        resultsEl.classList.remove('hidden');
    }, 2000);
}

// ===== MOTEUR D'ANALYSE IA (SIMULE) =====
function performSymptomAnalysis(symptoms, age, sexe, conditions, duration) {
    // Base de donnees medicale simplifiee pour la demonstration
    var diseaseDB = {
        'rhume': {
            symptoms: ['mal_de_tete', 'gorge_irritee', 'congestion_nasale', 'fievre', 'fatigue', 'toux'],
            name: 'Rhume / Rhinopharyngite',
            recommendations: [
                'Reposez-vous et dormez suffisamment',
                'Hydratez-vous regulierement (eau, tisanes)',
                'Prenez du paracetamol pour la fievre et les douleurs',
                'Utilisez des sprays nasaux pour la congestion'
            ]
        },
        'grippe': {
            symptoms: ['fievre', 'frissons', 'fatigue', 'douleurs_musculaires', 'mal_de_tete', 'toux', 'nausee'],
            name: 'Grippe',
            recommendations: [
                'Repos strict au lit pendant 3-5 jours',
                'Antiviraux si prescrits dans les 48 heures',
                'Hydratation abondante',
                'Consultez un medecin si symptomes graves'
            ]
        },
        'covid19': {
            symptoms: ['fievre', 'toux', 'fatigue', 'douleurs_musculaires', 'perte_goût', 'difficulte_respirer', 'mal_de_tete', 'gorge_irritee'],
            name: 'COVID-19 (suspect)',
            recommendations: [
                'Isolez-vous et faites un test de depistage',
                'Surveillez votre temperature et votre saturation en oxygene',
                'Consultez un medecin si difficulte respiratoire',
                'Portez un masque si contact avec d\'autres personnes'
            ]
        },
        'allergie': {
            symptoms: ['congestion_nasale', 'yeux_rouges', 'eruption_cutanee', 'démangeaisons', 'toux', 'éternuements'],
            name: 'Allergie saisonniere',
            recommendations: [
                'Evitez les allergenes identifies',
                'Prenez des antihistaminiques en pharmacie',
                'Utilisez des collyres pour les yeux rouges',
                'Consultez un allergologue si recurrent'
            ]
        },
        'gastroenterite': {
            symptoms: ['nausee', 'diarrhee', 'douleur_abdominale', 'fievre', 'fatigue', 'frissons'],
            name: 'Gastro-enterite',
            recommendations: [
                'Hydratez-vous en petites quantites frequentes',
                'Suivez un regime sans residus',
                'Prenez des solutes de rehydration orale',
                'Consultez si signes de deshydratation'
            ]
        },
        'migraine': {
            symptoms: ['mal_de_tete', 'vertige', 'nausee', 'yeux_rouges'],
            name: 'Migraine',
            recommendations: [
                'Reposez-vous dans une piece calme et sombre',
                'Prenez des analgesiques specifiques (triptans sur ordonnance)',
                'Appliquez du froid sur le front',
                'Identifiez et evitez vos declencheurs'
            ]
        },
        'bronchite': {
            symptoms: ['toux', 'fievre', 'fatigue', 'douleur_poumon', 'essoufflement', 'gorge_irritee'],
            name: 'Bronchite aigue',
            recommendations: [
                'Repos et hydratation abondante',
                'Antitussifs ou expectorants selon le type de toux',
                'Consultez un medecin si toux persistante plus de 3 semaines',
                'Evitez le tabac et les irritants'
            ]
        },
        'infection_oreille': {
            symptoms: ['douleur_oreille', 'mal_de_tete', 'fievre', 'vertige'],
            name: 'Otite (infection de l\'oreille)',
            recommendations: [
                'Consultez un medecin pour un examen',
                'Prenez des antalgiques pour la douleur',
                'Appliquez des compresses chaudes',
                'Ne mettez rien dans le conduit auditif'
            ]
        }
    };

    // Calculer les scores pour chaque maladie
    var scores = {};
    for (var key in diseaseDB) {
        var disease = diseaseDB[key];
        var matchCount = 0;
        symptoms.forEach(function(s) {
            if (disease.symptoms.indexOf(s) !== -1) {
                matchCount++;
            }
        });
        // Score base sur le pourcentage de symptomes correspondants
        var score = (matchCount / disease.symptoms.length) * 0.6 + (matchCount / symptoms.length) * 0.4;
        scores[key] = {
            name: disease.name,
            score: score,
            matchCount: matchCount,
            recommendations: disease.recommendations
        };
    }

    // Trier par score
    var sorted = Object.keys(scores).sort(function(a, b) {
        return scores[b].score - scores[a].score;
    });

    // Determiner le niveau d'urgence
    var urgency = 'low';
    var urgentSymptoms = ['difficulte_respirer', 'douleur_poumon', 'fievre'];
    var hasUrgent = symptoms.some(function(s) {
        return urgentSymptoms.indexOf(s) !== -1;
    });
    if (hasUrgent) urgency = 'medium';
    if (symptoms.indexOf('difficulte_respirer') !== -1 && duration === 'plus_7_jours') urgency = 'high';

    // Ajuster l'urgence selon l'age
    var ageNum = parseInt(age);
    if (ageNum < 5 || ageNum > 70) {
        if (urgency === 'low') urgency = 'medium';
        if (urgency === 'medium') urgency = 'high';
    }

    // Prendre les 3 meilleurs resultats
    var topResults = sorted.slice(0, 3).filter(function(k) {
        return scores[k].score > 0.15;
    }).map(function(k) {
        return {
            name: scores[k].name,
            confidence: Math.min(Math.round(scores[k].score * 100), 95),
            recommendations: scores[k].recommendations,
            matchCount: scores[k].matchCount
        };
    });

    // Quand consulter
    var whenConsult = [];
    if (urgency === 'high') {
        whenConsult.push('Consultez immediatement un medecin ou appelez le 15.');
    } else if (urgency === 'medium') {
        whenConsult.push('Consultez un medecin dans les 24 a 48 heures.');
    }
    whenConsult.push('Si les symptomes s\'aggravent progressivement.');
    whenConsult.push('Si la fievre depasse 39 degres C pendant plus de 3 jours.');
    whenConsult.push('Si vous ne constatez aucune amelioration apres 5 jours.');
    if (conditions !== 'aucune') {
        whenConsult.push('En tant que personne avec une condition pre-existante (' + conditions + '), consultez plus rapidement.');
    }

    return {
        urgency: urgency,
        diagnoses: topResults,
        whenConsult: whenConsult,
        totalSymptoms: symptoms.length,
        analysisDate: new Date().toLocaleString('fr-FR')
    };
}

// ===== AFFICHAGE DES RESULTATS =====
function displaySymptomResults(analysis) {
    // Banniere d'urgence
    var banner = document.getElementById('urgency-banner');
    banner.className = 'urgency-banner';
    if (analysis.urgency === 'low') {
        banner.classList.add('urgency-low');
        banner.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Niveau d\'urgence : FAIBLE - Surveillance recommandee';
    } else if (analysis.urgency === 'medium') {
        banner.classList.add('urgency-medium');
        banner.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Niveau d\'urgence : MODERE - Consultation recommandee';
    } else {
        banner.classList.add('urgency-high');
        banner.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Niveau d\'urgence : ELEVE - Consultation urgente !';
    }

    // Liste des diagnostics
    var diagList = document.getElementById('diagnosis-list');
    diagList.innerHTML = '';
    if (analysis.diagnoses.length === 0) {
        diagList.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">Aucun diagnostic clair. Consultez un medecin pour un examen approfondi.</p>';
    } else {
        analysis.diagnoses.forEach(function(d) {
            diagList.innerHTML += '<div class="diagnosis-item"><span class="diagnosis-name">' + d.name + '</span><span class="diagnosis-prob">' + d.confidence + '%</span></div>';
        });
    }

    // Barres de confiance
    var confBars = document.getElementById('confidence-bars');
    confBars.innerHTML = '';
    var colors = ['#0077B6', '#00B4D8', '#48CAE4'];
    analysis.diagnoses.forEach(function(d, i) {
        var color = colors[i] || colors[2];
        confBars.innerHTML += '<div class="confidence-bar"><div class="confidence-label"><span>' + d.name + '</span><span>' + d.confidence + '%</span></div><div class="confidence-track"><div class="confidence-fill" style="width:0%;background:' + color + ';" data-width="' + d.confidence + '%"></div></div></div>';
    });

    // Animer les barres
    setTimeout(function() {
        document.querySelectorAll('.confidence-fill').forEach(function(bar) {
            bar.style.width = bar.getAttribute('data-width');
        });
    }, 100);

    // Recommandations
    var recList = document.getElementById('recommendations-list');
    recList.innerHTML = '';
    if (analysis.diagnoses.length > 0) {
        analysis.diagnoses[0].recommendations.forEach(function(r) {
            recList.innerHTML += '<div class="recommendation-item"><div class="recommendation-bullet"></div><p>' + r + '</p></div>';
        });
    }

    // Quand consulter
    var consultEl = document.getElementById('when-consult');
    consultEl.innerHTML = '';
    analysis.whenConsult.forEach(function(w) {
        consultEl.innerHTML += '<div class="recommendation-item"><div class="recommendation-bullet" style="background:var(--warning);"></div><p>' + w + '</p></div>';
    });
}

// ===== CAMERA =====
var capturedPhotoData = null;

function capturePhoto(source) {
    if (navigator.camera) {
        // Environnement Cordova
        var options = {
            quality: 80,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: source === 'camera' ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 600,
            correctOrientation: true,
            saveToPhotoAlbum: false
        };

        navigator.camera.getPicture(function(imageData) {
            onPhotoCaptured('data:image/jpeg;base64,' + imageData);
        }, function(error) {
            console.log('Erreur camera: ' + error);
            showAlert('Impossible d\'acceder a la camera. Verifiez les permissions.');
        }, options);
    } else {
        // Mode navigateur (demo) - simuler une capture
        simulatePhotoCapture();
    }
}

function simulatePhotoCapture() {
    // Creer un canvas pour generer une image de demonstration
    var canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    var ctx = canvas.getContext('2d');

    // Fond gradient
    var gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#1a3a5c');
    gradient.addColorStop(1, '#0d1f3c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    // Texte
    ctx.fillStyle = '#90E0EF';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Image de demonstration (mode navigateur)', 200, 140);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#5C8A97';
    ctx.fillText('Sur appareil mobile, la camera sera activee', 200, 170);

    var dataUrl = canvas.toDataURL('image/jpeg');
    onPhotoCaptured(dataUrl);
}

function onPhotoCaptured(imageData) {
    capturedPhotoData = imageData;

    var preview = document.getElementById('camera-preview');
    var placeholder = document.getElementById('camera-placeholder');
    var btnAnalyze = document.getElementById('btn-analyze-photo');

    preview.src = imageData;
    preview.classList.add('visible');
    placeholder.classList.add('hidden');
    btnAnalyze.disabled = false;
}

function analyzePhoto() {
    if (!capturedPhotoData) return;

    var bodyZone = document.getElementById('body-zone').value;
    var resultsSection = document.getElementById('photo-analysis-results');
    var resultsContent = document.getElementById('photo-analysis-content');

    resultsContent.innerHTML = '<div class="analysis-loading"><div class="spinner"></div><p>Analyse visuelle en cours...</p></div>';
    resultsSection.classList.remove('hidden');

    // Simuler l'analyse IA
    setTimeout(function() {
        var analysis = performPhotoAnalysis(bodyZone);

        var html = '';

        // Banniere de resultat
        html += '<div class="urgency-banner urgency-low"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Analyse terminee - Zone analysee : ' + bodyZone + '</div>';

        // Observations
        html += '<div class="photo-result-card"><h4>Observations detectees</h4>';
        analysis.observations.forEach(function(obs) {
            html += '<p>• ' + obs + '</p>';
        });
        html += '</div>';

        // Evaluation
        html += '<div class="photo-result-card"><h4>Evaluation</h4><p>' + analysis.evaluation + '</p></div>';

        // Recommandations
        html += '<div class="photo-result-card"><h4>Recommandations</h4>';
        analysis.recommendations.forEach(function(rec) {
            html += '<p>• ' + rec + '</p>';
        });
        html += '</div>';

        // Avertissement
        html += '<div class="photo-result-card" style="border:1px solid rgba(231,111,81,0.3);background:rgba(231,111,81,0.05);"><h4 style="color:var(--warning);">Avertissement</h4><p>Cette analyse visuelle est une estimation et ne constitue pas un diagnostic medical. Consultez un professionnel de sante pour un avis fiable.</p></div>';

        resultsContent.innerHTML = html;

        // Sauvegarder
        saveToHistory({
            type: 'photo',
            date: new Date().toISOString(),
            bodyZone: bodyZone,
            results: analysis
        });

    }, 2500);
}

function performPhotoAnalysis(zone) {
    var analyses = {
        'peau': {
            observations: [
                'Texture cutanee analysee : aspect general normal',
                'Coloration uniforme detectee dans la zone capturee',
                'Aucune lesion evolutive detectee automatiquement'
            ],
            evaluation: 'L\'analyse visuelle automatique ne detecte pas d\'anomalie majeure dans l\'image fournie. Cependant, certains details peuvent necessiter un examen clinique professionnel pour une evaluation precise.',
            recommendations: [
                'Surveillez l\'evolution de la zone pendant 48 heures',
                'Appliquez une creme hydratante si la peau est seche',
                'Consultez un dermatologue si l\'etat persiste ou s\'aggrave'
            ]
        },
        'yeux': {
            observations: [
                'Sclerotypique analyse : coloration normale',
                'Zone periorbitaire examinee',
                'Pas d\'edema majeur detecte automatiquement'
            ],
            evaluation: 'L\'analyse automatique ne revele pas de signe inquietant sur l\'image fournie. Une evaluation ophtalmologique reste recommandee pour tout symptome persistant comme des rougeurs, des demangeaisons ou une vision trouble.',
            recommendations: [
                'Reposez vos yeux regulierement (regle 20-20-20)',
                'Utilisez des larmes artificielles si sensation de secheresse',
                'Consultez un ophtalmologiste si les symptomes persistent plus de 3 jours'
            ]
        },
        'gorge': {
            observations: [
                'Analyse de la coloration de la zone pharyngee',
                'Texture muqueuse evaluee',
                'Aspect general captured dans l\'image'
            ],
            evaluation: 'L\'image capturee permet une evaluation preliminaire. L\'analyse IA ne peut remplacer l\'examen clinique d\'un medecin qui peut observer directement les amygdales et le pharynx.',
            recommendations: [
                'Gargarisez avec de l\'eau salee tiede',
                'Buvez des liquides tiedes (tisanes, miel-citron)',
                'Consultez un medecin si la douleur persiste plus de 5 jours ou si vous avez de la fievre'
            ]
        },
        'langue': {
            observations: [
                'Coloration de la surface linguale analysee',
                'Texture et aspect de la langue evalues',
                'Presence d\'enduit detectee dans l\'image'
            ],
            evaluation: 'L\'analyse visuelle de la langue peut fournir des indices sur l\'etat de sante general. Cependant, cette evaluation est indicative et ne remplace pas un examen medical professionnel.',
            recommendations: [
                'Maintenez une bonne hygiene bucco-dentaire',
                'Buvez suffisamment d\'eau',
                'Consultez si vous observez des changements de couleur persistants'
            ]
        },
        'ongles': {
            observations: [
                'Couleur et texture des ongles analyses',
                'Forme generale evaluee',
                'Presence de stries ou taches detectee'
            ],
            evaluation: 'L\'analyse des ongles peut reveler certaines carences ou conditions medicales. Cette evaluation automatique est basique et un examen medical est recommande pour tout changement inhabituel.',
            recommendations: [
                'Maintenez une alimentation equilibree riche en vitamines B et fer',
                'Hydratez vos onles et cuticules regulierement',
                'Consultez un medecin si vous observez des changements de couleur importants'
            ]
        },
        'autre': {
            observations: [
                'Image capturee et analysee par l\'IA',
                'Zone selectionnee : autre / non specifiee',
                'Analyse generale effectuee sur l\'image fournie'
            ],
            evaluation: 'L\'analyse visuelle automatique a ete effectuee sur l\'image fournie. Pour une evaluation plus precise, selectionnez la zone du corps specifique concernee ou consultez directement un professionnel de sante.',
            recommendations: [
                'Pour de meilleurs resultats, selectionnez la zone du corps concernee',
                'Assurez-vous que l\'image est claire et bien eclairee',
                'Consultez un medecin pour toute preoccupation medicale'
            ]
        }
    };

    return analyses[zone] || analyses['autre'];
}

// ===== HISTORIQUE (LOCALSTORAGE) =====
function getHistory() {
    try {
        var data = localStorage.getItem('medical_assistant_history');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveToHistory(entry) {
    var history = getHistory();
    history.unshift(entry); // Ajouter au debut
    // Limiter a 50 entrees
    if (history.length > 50) history = history.slice(0, 50);
    try {
        localStorage.setItem('medical_assistant_history', JSON.stringify(history));
    } catch (e) {
        console.log('Erreur sauvegarde historique: ' + e);
    }
    updateStats();
}

function loadHistory() {
    var history = getHistory();
    var listEl = document.getElementById('history-list');

    if (history.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#CAF0F8" stroke-width="1.5"><circle cx="32" cy="32" r="28"/><line x1="32" y1="16" x2="32" y2="36"/><circle cx="32" cy="42" r="2" fill="#CAF0F8"/></svg><p>Aucune analyse dans l\'historique</p><p class="empty-hint">Vos analyses de symptomes et de photos apparaitront ici.</p></div>';
        return;
    }

    var html = '';
    history.forEach(function(item) {
        var date = new Date(item.date);
        var dateStr = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});

        if (item.type === 'symptom') {
            var symptomNames = item.symptoms.map(function(s) { return s.replace(/_/g, ' '); }).join(', ');
            var diagText = item.results && item.results.diagnoses && item.results.diagnoses.length > 0 ? item.results.diagnoses[0].name : 'Analyse incomplete';

            html += '<div class="history-item">';
            html += '<div class="history-icon history-icon-symptom"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0077B6" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>';
            html += '<div class="history-info"><div class="history-title">' + diagText + '</div><div class="history-date">' + dateStr + '</div><div class="history-detail">' + symptomNames + '</div></div>';
            html += '</div>';
        } else if (item.type === 'photo') {
            html += '<div class="history-item">';
            html += '<div class="history-icon history-icon-photo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2EC4B6" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>';
            html += '<div class="history-info"><div class="history-title">Analyse photo - ' + (item.bodyZone || 'zone') + '</div><div class="history-date">' + dateStr + '</div><div class="history-detail">Analyse visuelle par IA</div></div>';
            html += '</div>';
        }
    });

    listEl.innerHTML = html;
}

function clearHistory() {
    if (navigator.notification) {
        navigator.notification.confirm(
            'Voulez-vous supprimer tout l\'historique ?',
            function(button) {
                if (button === 1) {
                    localStorage.removeItem('medical_assistant_history');
                    loadHistory();
                    updateStats();
                }
            },
            'Effacer l\'historique',
            ['Oui', 'Non']
        );
    } else {
        if (confirm('Voulez-vous supprimer tout l\'historique ?')) {
            localStorage.removeItem('medical_assistant_history');
            loadHistory();
            updateStats();
        }
    }
}

// ===== STATISTIQUES =====
function updateStats() {
    var history = getHistory();
    var total = history.length;
    var symptomCount = history.filter(function(h) { return h.type === 'symptom'; }).length;
    var photoCount = history.filter(function(h) { return h.type === 'photo'; }).length;

    var elTotal = document.getElementById('stat-total');
    var elSymptom = document.getElementById('stat-symptom');
    var elPhoto = document.getElementById('stat-photo');

    if (elTotal) elTotal.textContent = total;
    if (elSymptom) elSymptom.textContent = symptomCount;
    if (elPhoto) elPhoto.textContent = photoCount;
}

// ===== ALERTE / DIALOGUE =====
function showAlert(message) {
    if (navigator.notification) {
        navigator.notification.alert(message, null, 'Assistant Medical', 'OK');
    } else {
        alert(message);
    }
}