import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../../GUIDE_UTILISATEUR_ET_GESTION_TALENTSCOUT.pdf');

// Total expected content pages = 9
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 45, bottom: 55, left: 50, right: 50 },
  bufferPages: true,
  autoFirstPage: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Primary Color Palette
const PRIMARY = '#16a34a'; // Emerald 600
const DARK = '#0f172a';    // Slate 900
const TEXT = '#334155';    // Slate 700
const MUTED = '#64748b';   // Slate 500
const LIGHT_BG = '#f8fafc';// Slate 50
const BORDER = '#e2e8f0';  // Slate 200
const ACCENT = '#0284c7';  // Sky 600
const WARNING = '#d97706'; // Amber 600

// Helper to draw section header
function drawSectionHeader(title, subtitle) {
  doc.addPage();
  
  // Decorative green bar
  doc.rect(50, 50, 4, 30).fill(PRIMARY);
  
  doc.fillColor(DARK).fontSize(20).font('Helvetica-Bold')
     .text(title, 62, 52);
     
  if (subtitle) {
    doc.fillColor(MUTED).fontSize(10).font('Helvetica')
       .text(subtitle, 62, 74);
  }
  
  doc.strokeColor(BORDER).lineWidth(1).moveTo(50, 92).lineTo(545, 92).stroke();
  doc.y = 106;
}

// Helper to draw callout card
function drawCallout(title, text, type = 'info') {
  const currentY = doc.y;
  const borderColor = type === 'warning' ? WARNING : type === 'success' ? PRIMARY : ACCENT;

  doc.rect(50, currentY, 495, 52).fill(LIGHT_BG);
  doc.rect(50, currentY, 4, 52).fill(borderColor);

  doc.fillColor(borderColor).fontSize(10).font('Helvetica-Bold')
     .text(title, 64, currentY + 8);
  doc.fillColor(TEXT).fontSize(9).font('Helvetica')
     .text(text, 64, currentY + 22, { width: 470, lineGap: 2 });

  doc.y = currentY + 62;
}

// Helper for subsections
function drawSubSection(title) {
  doc.moveDown(0.7);
  doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text(title);
  doc.moveDown(0.3);
}

// Helper for standard paragraph text
function drawParagraph(text) {
  doc.fillColor(TEXT).fontSize(9.5).font('Helvetica').text(text, {
    align: 'justify',
    lineGap: 3,
  });
  doc.moveDown(0.5);
}

// Helper for bullet list item
function drawBullet(boldText, normalText) {
  doc.fillColor(PRIMARY).fontSize(9.5).font('Helvetica-Bold').text('  • ', { continued: true });
  doc.fillColor(DARK).font('Helvetica-Bold').text(boldText + ' : ', { continued: true });
  doc.fillColor(TEXT).font('Helvetica').text(normalText, { lineGap: 2 });
  doc.moveDown(0.35);
}

// ==========================================
// 1. PAGE DE COUVERTURE (COVER PAGE)
// ==========================================

// Top pitch bar
doc.rect(0, 0, 595.28, 16).fill(PRIMARY);

// Logo icon box
doc.roundedRect(50, 160, 64, 64, 16).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('TS', 65, 178);

doc.fillColor(DARK).fontSize(32).font('Helvetica-Bold')
   .text('TalentScout', 50, 245);
   
doc.fillColor(PRIMARY).fontSize(16).font('Helvetica-Bold')
   .text('Football Academy Management & AI Player Development', 50, 285);

doc.strokeColor(PRIMARY).lineWidth(2).moveTo(50, 315).lineTo(220, 315).stroke();

doc.fillColor(MUTED).fontSize(12).font('Helvetica')
   .text('Guide Complet d\'Utilisation, d\'Administration et de Gestion', 50, 330);

doc.rect(50, 420, 495, 130).fill(LIGHT_BG);
doc.rect(50, 420, 4, 130).fill(PRIMARY);

doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text('Résumé de l\'Application :', 70, 435);
doc.fillColor(TEXT).fontSize(9.5).font('Helvetica').text(
  'TalentScout est une plateforme MERN complète (MongoDB, Express, React, Node.js) conçue pour digitaliser l\'intégralité des opérations d\'une académie de football : gestion des effectifs, planification des entraînements, appel des présences, évaluations multicritères standardisées et analyse du développement individuel assistée par Intelligence Artificielle.',
  70, 455, { width: 455, lineGap: 3 }
);

doc.fillColor(MUTED).fontSize(9).font('Helvetica-Bold').text('Édition : MERN Stack Edition • Version 1.0.0', 70, 525);

// Metadata box bottom
doc.fillColor(MUTED).fontSize(9).font('Helvetica')
   .text('Auteur : Antigravity Pair-Programming Agent', 50, 715)
   .text('Date d\'édition : Octobre 2026', 50, 730)
   .text('Statut : Conforme aux exigences du référentiel TalentScout_MERN.pdf', 50, 745);

// ==========================================
// 2. SOMMAIRE & ARCHITECTURE GÉNÉRALE
// ==========================================
drawSectionHeader('Table des Matières & Architecture', 'Vue d\'ensemble du système et structure des modules');

drawParagraph('Ce document fournit aux Directeurs d\'Académie, Entraîneurs et Administrateurs techniques un accompagnement pas-à-pas pour exploiter 100% des capacités de TalentScout.');

drawSubSection('Plan du Document :');
drawBullet('Chapitre 1', 'Prise en Main Rapide & Installation Locale (Démarrage, Seed, Comptes)');
drawBullet('Chapitre 2', 'Espace Directeur d\'Académie (Manager Dashboard, Supervision, Staff)');
drawBullet('Chapitre 3', 'Espace Entraîneur (Séances d\'entraînement, Appel, Débriefings)');
drawBullet('Chapitre 4', 'Le Système d\'Évaluation Standardisé (15 métriques sur 4 piliers)');
drawBullet('Chapitre 5', 'Le Moteur IA de Développement (Principes, Détection, Recommandations)');
drawBullet('Chapitre 6', 'Analyses Graphiques, Comparateur d\'Évaluations & Dossier PDF');
drawBullet('Chapitre 7', 'Guide de Maintenance, Sauvegarde & Déploiement en Ligne');

drawSubSection('Architecture Technique (MERN Stack) :');
drawParagraph('Le projet est conçu selon les meilleures pratiques du développement web full-stack en architecture 3-tiers :');
drawBullet('Base de Données (MongoDB + Mongoose)', 'Stockage persistant de 8 collections relationnelles indexées : Utilisateurs, Académie, Joueurs, Séances, Présences, Évaluations, Objectifs, Analyses IA.');
drawBullet('Serveur Backend (Node.js & Express.js)', 'API RESTful modulaire en modules ES6, sécurisée par jetons JWT, chiffrement des mots de passe en Bcrypt, middlewares RBAC (contrôle d\'accès basé sur les rôles) et module d\'analyse IA dédié.');
drawBullet('Frontend Client (React 18 & Vite)', 'Interface réactive ultra-moderne propulsée par Tailwind CSS, navigation par React Router v6, icônes Lucide, graphismes interactifs Chart.js et générateur de PDF.');

// ==========================================
// 3. CHAPITRE 1 : INSTALLATION ET DÉMARRAGE
// ==========================================
drawSectionHeader('1. Prise en Main Rapide & Installation', 'Mise en place de l\'environnement et initialisation');

drawParagraph('Le projet est immédiatement opérationnel sur toute machine disposant de Node.js et d\'une instance MongoDB.');

drawSubSection('Étape 1.1 : Démarrage de la Base de Données MongoDB');
drawParagraph('Assurez-vous que le service MongoDB local est en cours d\'exécution (sur le port par défaut 27017). Sur Windows, vous pouvez vérifier le statut avec la commande PowerShell :');
doc.rect(50, doc.y, 495, 20).fill('#1e293b');
doc.fillColor('#38bdf8').fontSize(8.5).font('Courier').text('Get-Service -Name "*mongo*"', 60, doc.y + 5);
doc.y += 24;
doc.moveDown(0.4);

drawSubSection('Étape 1.2 : Configuration du Fichier d\'Environnement (.env)');
drawParagraph('Le fichier server/.env contient les paramètres essentiels du serveur :');
drawBullet('PORT', 'Port d\'écoute du serveur backend (par défaut : 5000)');
drawBullet('MONGODB_URI', 'Chaîne de connexion MongoDB (mongodb://127.0.0.1:27017/talentscout)');
drawBullet('JWT_SECRET', 'Clé secrète de signature des sessions utilisateurs chiffrées');
drawBullet('GEMINI_API_KEY', '(Optionnel) Clé API Google Gemini pour l\'analyse IA en direct');

drawSubSection('Étape 1.3 : Chargement des Données de Démonstration (Seeder)');
drawParagraph('Pour injecter les comptes d\'évaluation, l\'effectif de l\'académie et le scénario complet du joueur Adam Belkacem (Page 10 du PDF), exécutez depuis la racine :');
doc.rect(50, doc.y, 495, 20).fill('#1e293b');
doc.fillColor('#4ade80').fontSize(8.5).font('Courier').text('npm run seed', 60, doc.y + 5);
doc.y += 24;
doc.moveDown(0.4);

drawSubSection('Étape 1.4 : Lancement des Serveurs');
drawParagraph('Une commande unique permet d\'exécuter simultanément l\'API Backend et l\'application Frontend :');
doc.rect(50, doc.y, 495, 20).fill('#1e293b');
doc.fillColor('#4ade80').fontSize(8.5).font('Courier').text('npm run dev', 60, doc.y + 5);
doc.y += 24;
doc.moveDown(0.4);

drawParagraph('Ouvrez ensuite votre navigateur sur http://localhost:5173 pour accéder à l\'interface.');

drawCallout(
  'Connexions Démo One-Click Disponibles',
  'L\'écran de connexion intègre deux raccourcis pour tester instantanément l\'application sans saisie manuelle : Carlos Mendes (Manager) et Marcus Vance (Coach).',
  'success'
);

// ==========================================
// 4. CHAPITRE 2 : ESPACE DIRECTEUR D'ACADÉMIE
// ==========================================
drawSectionHeader('2. Espace Directeur d\'Académie', 'Supervision stratégique, gestion du staff et de l\'académie');

drawParagraph('Le rôle d\'Academy Manager confère une vue globale sur l\'ensemble des activités sportives et administratives de l\'organisation.');

drawSubSection('2.1 Le Tableau de Bord Directeur (Overview Dashboard)');
drawParagraph('Dès la connexion, le Manager accède aux métriques clés en temps réel :');
drawBullet('Joueurs Actifs', 'Nombre total de jeunes licenciés actuellement inscrits à l\'académie.');
drawBullet('Staff Technique', 'Nombre de coachs en activité encadrant les catégories U-11 à U-19.');
drawBullet('Séances Programmées & Complétées', 'Volume d\'entraînements réalisés et à venir.');
drawBullet('Taux de Présence Global', 'Moyenne générale de ponctualité et d\'assiduité sur l\'ensemble des catégories.');

drawSubSection('2.2 Alertes de Suivi des Évaluations (Section 3.2.D du PDF)');
drawParagraph('Pour garantir un suivi pédagogique rigoureux, le système analyse automatiquement la date de la dernière évaluation de chaque joueur :');
drawBullet('Alerte « Jamais Évalué »', 'Identifie les nouveaux inscrits n\'ayant pas encore passé leur bilan de compétences initial.');
drawBullet('Alerte « Retard > 30 jours »', 'Signale les joueurs dont la dernière évaluation remonte à plus d\'un mois, permettant au directeur d\'ordonner un nouveau point de contrôle auprès du coach référent.');

drawSubSection('2.3 Gestion des Comptes Entraîneurs (Coach Management)');
drawParagraph('Accessible via le menu latéral Administration > Coach Management :');
drawBullet('Création de compte', 'Saisie du nom, email, mot de passe initial, numéro de téléphone et biographie.');
drawBullet('Spécialisation sportive', 'Attribution de l\'expertise du coach (ex : « Milieu de terrain & Vision de jeu », « Vitesse & Finition »).');
drawBullet('Catégories assignées', 'Affectation des tranches d\'âge sous sa responsabilité (U-13, U-15, U-17, etc.).');
drawBullet('Désactivation sécurisée', 'Possibilité de suspendre un compte coach tout en conservant l\'historique intégral de ses séances et évaluations.');

drawSubSection('2.4 Paramètres de l\'Académie (Academy Settings)');
drawParagraph('Permet de mettre à jour la raison sociale de l\'académie, sa devise, son adresse d\'entraînement, ses coordonnées officielles, ainsi que le texte de sa Philosophie Pédagogique et Technique (qui apparaîtra sur les dossiers PDF officiels).');

// ==========================================
// 5. CHAPITRE 3 : ESPACE ENTRAÎNEUR & SÉANCES
// ==========================================
drawSectionHeader('3. Espace Entraîneur & Séances', 'Organisation du terrain, appel des présences et débriefings');

drawParagraph('L\'entraîneur dispose des outils nécessaires pour animer son groupe au quotidien et consigner les données de terrain en quelques clics.');

drawSubSection('3.1 Planification d\'une Séance d\'Entraînement');
drawParagraph('Depuis la page Training Sessions, le bouton « Schedule Session » ouvre le formulaire :');
drawBullet('Intitulé de séance', 'Titre précis précisant l\'orientation (ex : « U-15 Passes sous Pression & Transition »).');
drawBullet('Date et Horaires', 'Sélection de la date, heure de début et heure de fin.');
drawBullet('Lieu et Installation', 'Terrain synthétique, salle de musculation, terrain principal, etc.');
drawBullet('Catégorie d\'Âge', 'Sélection du groupe d\'âge concerné (U-11, U-13, U-15, U-17, U-19 ou Tout le club).');
drawBullet('Thèmes Techniques & Tactiques', 'Sélection par tags des objectifs de travail : passes, contrôle orienté, endurance, jeu sous pression, finition, etc.');
drawBullet('Niveau d\'Intensité', 'Graduation : Faible (récupération), Modéré (standard), ou Élevé (intensité de match).');

drawSubSection('3.2 Feuille d\'Appel Interactive (Session Attendance)');
drawParagraph('En ouvrant le détail d\'une séance, le coach accède à la liste d\'appel des joueurs convoqués :');
drawBullet('Statut Présent (Vert)', 'Le joueur a participé activement à l\'entraînement.');
drawBullet('Statut Absent (Rouge)', 'Absence non justifiée impactant l\'indice d\'assiduité du joueur.');
drawBullet('Statut Excusé (Orange)', 'Absence justifiée par motif scolaire ou médical.');
drawBullet('Notes individuelles', 'Saisie possible de l\'heure d\'arrivée ou d\'une observation ponctuelle.');
drawBullet('Enregistrement en lot (1 clic)', 'Le bouton « Save Attendance » sauvegarde l\'intégralité des présences en une seule requête.');

drawSubSection('3.3 Débriefing d\'Après-Séance (Post-Session Debrief)');
drawParagraph('En bas de la feuille de séance, un espace dédié permet au coach de noter ses constats à chaud : état de forme du groupe, respect des consignes tactiques, intensité mesurée et axes à corriger lors de la prochaine session.');

// ==========================================
// 6. CHAPITRE 4 : ÉVALUATIONS DE PERFORMANCE
// ==========================================
drawSectionHeader('4. Évaluations de Performance', 'Structure des 15 métriques et saisie des bilans');

drawParagraph('TalentScout applique une méthodologie d\'évaluation objective et reproductible, découpée en 4 piliers fondamentaux avec une notation cohérente de 1 à 10.');

drawSubSection('Les 4 Piliers et 15 Métriques Standardisées :');
drawBullet('Pilier 1 : Capacités Physiques (Physical Abilities)', 'Évalue la motricité et l\'explosivité de base : Vitesse (accélération), Endurance (capacité aérobie 90 min), Agilité (changements de direction), et Force (gainage et duel).');
drawBullet('Pilier 2 : Habiletés Techniques (Technical Skills)', 'Évalue la maîtrise du ballon : Précision des passes (courtes et longues), Frappe et finition, Dribble en 1 contre 1, et Premier contrôle (prise de balle).');
drawBullet('Pilier 3 : Intelligence Tactique (Tactical Abilities)', 'Évalue la lecture du jeu : Placement défensif/offensif, Prise de décision sous pression, et Vision / prise d\'information avant réception.');
drawBullet('Pilier 4 : Développement Personnel (Personal Development)', 'Évalue l\'attitude mentale : Discipline et respect des consignes, Esprit d\'équipe et communication, et Motivation / combativité.');

drawSubSection('4.2 Saisie d\'une Évaluation Joueur');
drawParagraph('Sur le profil du joueur, cliquez sur « Record Evaluation » :');
drawBullet('Curseurs interactifs', 'Ajustez chaque note par pas de 0.5. Le système calcule automatiquement la moyenne générale en temps réel.');
drawBullet('Points forts & Axes de progrès', 'Saisissez les qualités distinctives et les priorités de travail.');
drawBullet('Observations qualitatives du Coach', 'Point capital ! C\'est ici que le coach formule des remarques précises (ex : « Adam montre une excellente endurance mais perd sa lucidité sur les passes courtes dès qu\'un adversaire le presse »). Ces notes sont directement exploitées par l\'IA.');

drawCallout(
  'Règle d\'Intégrité Méthodologique',
  'Les évaluations doivent refléter des faits observés sur le terrain. L\'application conserve l\'historique intégral sans jamais écraser les bilans précédents afin de permettre le calcul des courbes d\'évolution.',
  'info'
);

// ==========================================
// 7. CHAPITRE 5 : LE MOTEUR IA DE DÉVELOPPEMENT
// ==========================================
drawSectionHeader('5. Le Moteur IA de Développement', 'Principes algorithmiques, anti-hallucination et recommandations');

drawParagraph('Le module d\'Intelligence Artificielle de TalentScout est hébergé directement dans le backend Express (server/services/aiService.js). Il a été conçu pour assister le coach dans la prise de décision, sans jamais se substituer à son jugement professionnel.');

drawSubSection('5.1 Principes Fondamentaux et Garde-Fous :');
drawBullet('1. Ancrage strict dans les données réelles', 'L\'IA s\'interdit d\'inventer des progrès, des notes ou des régressions imaginaires. Chaque constat s\'appuie impérativement sur une métrique chiffrée ou une note du coach.');
drawBullet('2. Déclaration explicite des limites d\'historique', 'Si un joueur a 0 évaluation, l\'IA signale l\'absence de bilan. S\'il a 1 seule évaluation, elle établit le profil initial mais avertit formellement qu\'aucune tendance chronologique ne peut encore être confirmée.');
drawBullet('3. Détection des deltas mathématiques (>= 2 évaluations)', 'L\'IA calcule la variation exacte note par note entre les bilans et classe la dynamique : En progression (progressing), En recul (regressing), Stable (stable), ou Fluctuante (fluctuating).');
drawBullet('4. Sécurité sportive & Non-médicalisation', 'L\'IA ne pose aucun diagnostic médical et n\'émet aucune prescription de soin. Les exercices proposés respectent scrupuleusement la tranche d\'âge et les charges physiologiques sécurisées.');

drawSubSection('5.2 Structure d\'une Fiche de Recommandation IA :');
drawParagraph('Pour chaque axe de progression détecté, l\'IA génère une fiche d\'exercice prête pour l\'entraînement :');
drawBullet('Compétence ciblée', 'Exemple : « Passes sous pression défensive et prise d\'information »');
drawBullet('Nom de l\'exercice', 'Exemple : « Rondo 4 contre 2 en surintensité avec portes de transition »');
drawBullet('Objectif pédagogique', 'Exemple : « Développer la vitesse d\'exécution en 1-2 touches et l\'orientation du buste avant réception »');
drawBullet('Dosage et Répétitions', 'Exemple : « 4 séries de 3 minutes avec 90 secondes de récupération active »');
drawBullet('Preuve d\'évaluation citée', 'Exemple : « Cité d\'après la note de passe (5.4/10) et l\'observation du coach Marcus Vance : "perd sa lucidité sur les passes courtes sous pression" »');

// ==========================================
// 8. CHAPITRE 6 : GRAPHIQUES, COMPARAISONS & PDF
// ==========================================
drawSectionHeader('6. Graphiques, Comparateur & PDF', 'Outils d\'analyse visuelle et édition des dossiers sportifs');

drawParagraph('TalentScout offre des outils de visualisation modernes pour communiquer efficacement les progrès aux joueurs, parents et recruteurs.');

drawSubSection('6.1 Radar de Compétences (Skill Footprint)');
drawParagraph('Le graphique radar affiche l\'empreinte globale du joueur sur 12 dimensions clés. Lorsque deux évaluations existent, il superpose en pointillé l\'empreinte précédente pour rendre le progrès visuellement immédiat.');

drawSubSection('6.2 Courbes d\'Évolution Chronologique (Line Chart)');
drawParagraph('Permet de sélectionner individuellement ou collectivement des métriques (Endurance, Passes, Vitesse, Note globale) pour observer leur courbe d\'évolution dans le temps après chaque séance d\'évaluation.');

drawSubSection('6.3 Outil Comparateur d\'Évaluations (Compare Tool)');
drawParagraph('Accessible depuis le menu Evaluations & Trends :');
drawBullet('Sélection de deux évaluations', 'Permet de confronter le bilan initial (baseline) et le bilan de suivi (follow-up).');
drawBullet('Calcul automatique des deltas chiffrés', 'Met en valeur les gains (+1.5 en passes) et les reculs (-0.3).');
drawBullet('Pastilles de classification', 'Badge vert pour Progrès, rouge pour Régression, gris pour Stabilité.');
drawBullet('Comparaison des notes qualitatives', 'Affiche en vis-à-vis les remarques de l\'entraîneur d\'une période à l\'autre.');

drawSubSection('6.4 Édition du Dossier PDF Joueur (Player Dossier)');
drawParagraph('Depuis la fiche d\'un joueur, le bouton « PDF Report » génère instantanément un rapport officiel contenant :');
drawBullet('En-tête officielle', 'Logo et coordonnées complètes de l\'académie.');
drawBullet('Fiche d\'identité', 'Poste de jeu, pied fort, mensurations, catégorie, assiduité.');
drawBullet('Tableau récapitulatif', 'Les 15 métriques chiffrées de la dernière évaluation.');
drawBullet('Observations du coach', 'Remarques qualitatives et axes prioritaires.');
drawBullet('Recommandations IA', 'Exercices spécifiques avec objectifs et dosages.');
drawBullet('Boutons d\'action', 'Impression directe ou enregistrement PDF.');

// ==========================================
// 9. CHAPITRE 7 : MAINTENANCE ET DÉPLOIEMENT
// ==========================================
drawSectionHeader('7. Maintenance & Déploiement', 'Administration technique, dépannage et mise en production');

drawSubSection('7.1 Commandes Principales de Gestion :');
drawBullet('npm run dev', 'Lance à la fois le serveur Express (port 5000) et le client React Vite (port 5173).');
drawBullet('npm run seed', 'Réinitialise proprement la base de données et recharge le jeu de test standard.');
drawBullet('npm run build', 'Compile le frontend React sous le dossier client/dist pour la production.');

drawSubSection('7.2 Dépannage des Erreurs Courantes :');
drawParagraph('• Port 5000 déjà utilisé : Arrêtez tout processus Node résiduel via le gestionnaire des tâches ou modifiez le PORT dans server/.env.');
drawParagraph('• MongoDB refuse la connexion : Vérifiez que le service local MongoDB est démarré (Get-Service "*mongo*") ou vérifiez votre URI MongoDB Atlas.');
drawParagraph('• Token expiré : Déconnectez-vous et reconnectez-vous pour renouveler le token JWT de session.');

drawSubSection('7.3 Guide de Déploiement en Ligne :');
drawBullet('Base de données (MongoDB Atlas)', 'Créez un cluster gratuit M0 sur MongoDB Cloud, créez un utilisateur de base, autorisez l\'adresse 0.0.0.0/0 et copiez l\'URI de connexion.');
drawBullet('Backend (Render ou Railway)', 'Déclarez le répertoire server comme racine, configurez la commande node server.js et ajoutez MONGODB_URI et JWT_SECRET.');
drawBullet('Frontend (Vercel ou Netlify)', 'Déclarez le répertoire client, configurez la commande de build npm run build et le dossier de sortie dist.');

// ==========================================
// FOOTERS & PAGE NUMBERING (SAFE NO-OVERFLOW)
// ==========================================
// Temporarily expand bottom margin to allow drawing footer without triggering page-break
const totalPages = 9; // Cover + 8 chapters
for (let i = 1; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0;
  
  // Header
  doc.fillColor(MUTED).fontSize(8).font('Helvetica')
     .text('TalentScout - Guide d\'Utilisation & d\'Administration', 50, 25, { lineBreak: false });
  doc.strokeColor(BORDER).lineWidth(0.5).moveTo(50, 36).lineTo(545, 36).stroke();

  // Footer
  doc.strokeColor(BORDER).lineWidth(0.5).moveTo(50, 805).lineTo(545, 805).stroke();
  doc.fillColor(MUTED).fontSize(8).font('Helvetica')
     .text('MERN Stack Edition • Football Academy Management Platform', 50, 812, { lineBreak: false });
  doc.text(`Page ${i + 1} / ${totalPages}`, 450, 812, { width: 95, align: 'right', lineBreak: false });
}

doc.end();

writeStream.on('finish', () => {
  console.log(`[PDF Generator] Guide generated cleanly at exactly ${totalPages} pages: ${outputPath}`);
});
