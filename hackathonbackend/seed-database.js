const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// ── Helpers ──────────────────────────────────────────────────────────
const ObjectId = mongoose.Types.ObjectId;

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Seed Data ────────────────────────────────────────────────────────

const usersData = [
  { nom: 'Admin', prenom: 'Super', email: 'admin@formapro.com', role: 'Admin' },
  { nom: 'Benali', prenom: 'Ahmed', email: 'ahmed.benali@formapro.com', role: 'Formateurs' },
  { nom: 'Lahmidi', prenom: 'Fatima', email: 'fatima.lahmidi@formapro.com', role: 'Formateurs' },
  { nom: 'Tazi', prenom: 'Youssef', email: 'youssef.tazi@formapro.com', role: 'Formateurs' },
  { nom: 'El Amrani', prenom: 'Sara', email: 'sara.elamrani@formapro.com', role: 'responsableformation' },
  { nom: 'Bouazza', prenom: 'Karim', email: 'karim.bouazza@formapro.com', role: 'responsableformation' },
];

const elevesData = [
  { nom: 'Alaoui', prenom: 'Mehdi', email: 'mehdi.alaoui@email.com', telephone: '0612345678', adresse: 'Casablanca' },
  { nom: 'Bouzid', prenom: 'Amina', email: 'amina.bouzid@email.com', telephone: '0623456789', adresse: 'Rabat' },
  { nom: 'Chakir', prenom: 'Omar', email: 'omar.chakir@email.com', telephone: '0634567890', adresse: 'Marrakech' },
  { nom: 'Dahbi', prenom: 'Nadia', email: 'nadia.dahbi@email.com', telephone: '0645678901', adresse: 'Fès' },
  { nom: 'El Fassi', prenom: 'Rachid', email: 'rachid.elfassi@email.com', telephone: '0656789012', adresse: 'Tanger' },
  { nom: 'Filali', prenom: 'Layla', email: 'layla.filali@email.com', telephone: '0667890123', adresse: 'Agadir' },
  { nom: 'Ghazi', prenom: 'Samir', email: 'samir.ghazi@email.com', telephone: '0678901234', adresse: 'Oujda' },
  { nom: 'Hassani', prenom: 'Khadija', email: 'khadija.hassani@email.com', telephone: '0689012345', adresse: 'Meknès' },
  { nom: 'Idrissi', prenom: 'Yassine', email: 'yassine.idrissi@email.com', telephone: '0690123456', adresse: 'Kenitra' },
  { nom: 'Jabri', prenom: 'Salma', email: 'salma.jabri@email.com', telephone: '0601234567', adresse: 'Tétouan' },
  { nom: 'Kabbaj', prenom: 'Hamza', email: 'hamza.kabbaj@email.com', telephone: '0611223344', adresse: 'Casablanca' },
  { nom: 'Lamrani', prenom: 'Zineb', email: 'zineb.lamrani@email.com', telephone: '0622334455', adresse: 'Rabat' },
  { nom: 'Mansouri', prenom: 'Anas', email: 'anas.mansouri@email.com', telephone: '0633445566', adresse: 'Marrakech' },
  { nom: 'Naciri', prenom: 'Imane', email: 'imane.naciri@email.com', telephone: '0644556677', adresse: 'Fès' },
  { nom: 'Ouazzani', prenom: 'Bilal', email: 'bilal.ouazzani@email.com', telephone: '0655667788', adresse: 'Tanger' },
];

const formationsData = [
  {
    nom_formation: 'Développement Web Full-Stack',
    description: 'Formation complète en développement web moderne : HTML, CSS, JavaScript, React, Node.js et bases de données.',
    niveaux: [
      { nom: 'Les Fondamentaux du Web', seances: ['Introduction HTML', 'Structure & Sémantique HTML', 'CSS - Les bases', 'CSS Flexbox & Grid', 'JavaScript - Variables & Types', 'JavaScript - Fonctions & DOM'] },
      { nom: 'Frontend Avancé', seances: ['ES6+ & Modules', 'Introduction à React', 'Composants & Props', 'State & Hooks', 'React Router', 'Projet Frontend'] },
      { nom: 'Backend & API', seances: ['Node.js & Express', 'API REST', 'MongoDB & Mongoose', 'Authentification JWT', 'Upload de fichiers', 'Projet API'] },
      { nom: 'Projet Final & Déploiement', seances: ['Architecture Full-Stack', 'Intégration Front-Back', 'Tests unitaires', 'Docker & CI/CD', 'Déploiement Cloud', 'Soutenance Projet'] },
    ],
  },
  {
    nom_formation: 'Data Science & Intelligence Artificielle',
    description: 'Maîtrisez Python, l\'analyse de données, le machine learning et le deep learning.',
    niveaux: [
      { nom: 'Python & Analyse de Données', seances: ['Python - Les bases', 'Structures de données', 'NumPy', 'Pandas - Manipulation', 'Pandas - Nettoyage', 'Visualisation Matplotlib'] },
      { nom: 'Statistiques & Probabilités', seances: ['Statistiques descriptives', 'Probabilités', 'Distributions', 'Tests d\'hypothèse', 'Régression linéaire', 'Projet Analyse'] },
      { nom: 'Machine Learning', seances: ['Intro au ML', 'Classification', 'Arbres de décision', 'SVM & KNN', 'Clustering', 'Évaluation de modèles'] },
      { nom: 'Deep Learning & Projet', seances: ['Réseaux de neurones', 'TensorFlow / Keras', 'CNN - Vision', 'NLP - Texte', 'Projet ML complet', 'Soutenance'] },
    ],
  },
  {
    nom_formation: 'Design UX/UI & Prototypage',
    description: 'Apprenez à concevoir des interfaces utilisateur intuitives avec Figma et les principes UX.',
    niveaux: [
      { nom: 'Fondamentaux UX', seances: ['Introduction à l\'UX', 'Recherche utilisateur', 'Personas & User Journey', 'Architecture de l\'information', 'Wireframing', 'Tests utilisateurs'] },
      { nom: 'Design UI', seances: ['Théorie des couleurs', 'Typographie', 'Composition & Layout', 'Design System', 'Icônes & Illustrations', 'Responsive Design'] },
      { nom: 'Figma Avancé', seances: ['Figma - Interface', 'Composants & Variants', 'Auto Layout', 'Prototypage interactif', 'Animations', 'Collaboration'] },
      { nom: 'Projet & Portfolio', seances: ['Brief client', 'Recherche & Idéation', 'Maquettes HD', 'Prototype final', 'Présentation client', 'Soutenance Portfolio'] },
    ],
  },
];

// ── Main Seed Function ───────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon';
  console.log(`\n🔌 Connexion à MongoDB: ${uri}\n`);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // ── 1. Clean existing data ──
  console.log('🗑️  Nettoyage de la base de données...');
  const collections = ['users', 'eleves', 'formations', 'niveaus', 'seances', 'inscriptions', 'presences', 'certifications'];
  for (const col of collections) {
    try { await db.collection(col).deleteMany({}); } catch (_) { /* collection may not exist */ }
  }

  // ── 2. Create Users ──
  console.log('👤 Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];
  for (const u of usersData) {
    const result = await db.collection('users').insertOne({
      ...u,
      password: hashedPassword,
      actif: true,
      date_creation: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });
    users.push({ ...u, _id: result.insertedId });
    console.log(`   ✅ ${u.role}: ${u.prenom} ${u.nom} (${u.email})`);
  }
  const formateurs = users.filter(u => u.role === 'Formateurs');

  // ── 3. Create Eleves ──
  console.log('\n🎓 Création des élèves...');
  const eleves = [];
  for (const e of elevesData) {
    const result = await db.collection('eleves').insertOne({
      ...e,
      date_naissance: randomDate(new Date(1995, 0), new Date(2005, 0)),
      date_inscription: new Date(),
      statut: 'actif',
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });
    eleves.push({ ...e, _id: result.insertedId });
    console.log(`   ✅ ${e.prenom} ${e.nom}`);
  }

  // ── 4. Create Formations + Niveaux + Séances ──
  console.log('\n📚 Création des formations, niveaux et séances...');
  const allFormations = [];
  const allNiveaux = [];
  const allSeances = [];

  for (let fi = 0; fi < formationsData.length; fi++) {
    const fd = formationsData[fi];
    const formateur = formateurs[fi % formateurs.length];
    const formationId = new ObjectId();

    await db.collection('formations').insertOne({
      _id: formationId,
      nom_formation: fd.nom_formation,
      description: fd.description,
      id_formateur: formateur._id,
      date_creation: new Date(),
      statut: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });
    allFormations.push({ _id: formationId, ...fd, id_formateur: formateur._id });
    console.log(`   📘 ${fd.nom_formation} (formateur: ${formateur.prenom} ${formateur.nom})`);

    for (let ni = 0; ni < fd.niveaux.length; ni++) {
      const nd = fd.niveaux[ni];
      const niveauId = new ObjectId();
      // Niveau 1 is enabled by default, others disabled
      const niveauStatut = ni === 0;

      await db.collection('niveaus').insertOne({
        _id: niveauId,
        id_formation: formationId,
        numero_niveau: ni + 1,
        nom_niveau: nd.nom,
        statut: niveauStatut,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });
      allNiveaux.push({ _id: niveauId, id_formation: formationId, numero_niveau: ni + 1, nom_niveau: nd.nom, statut: niveauStatut });

      for (let si = 0; si < nd.seances.length; si++) {
        const seanceId = new ObjectId();
        // For niveau 1, mark some seances as completed for realism
        const seanceStatut = (ni === 0 && si < 4);
        const datePrevue = new Date();
        datePrevue.setDate(datePrevue.getDate() + (ni * 14) + (si * 2));

        await db.collection('seances').insertOne({
          _id: seanceId,
          id_niveau: niveauId,
          numero_seance: si + 1,
          titre: nd.seances[si],
          date_prevue: datePrevue,
          heure_debut: '09:00',
          heure_fin: '12:00',
          statut: seanceStatut,
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0,
        });
        allSeances.push({
          _id: seanceId,
          id_niveau: niveauId,
          id_formation: formationId,
          numero_seance: si + 1,
          numero_niveau: ni + 1,
          statut: seanceStatut,
        });
      }
    }
  }

  // ── 5. Create Inscriptions ──
  console.log('\n📝 Création des inscriptions...');
  const allInscriptions = [];

  // Distribute students across formations (each student enrolled in 1 or 2 formations)
  const assignments = [
    // Formation 0 (Web Full-Stack): 8 élèves
    { formationIdx: 0, eleveIndices: [0, 1, 2, 3, 4, 5, 6, 7] },
    // Formation 1 (Data Science): 7 élèves
    { formationIdx: 1, eleveIndices: [3, 4, 5, 8, 9, 10, 11] },
    // Formation 2 (UX/UI): 6 élèves
    { formationIdx: 2, eleveIndices: [1, 6, 10, 12, 13, 14] },
  ];

  for (const assignment of assignments) {
    const formation = allFormations[assignment.formationIdx];
    for (const ei of assignment.eleveIndices) {
      const eleve = eleves[ei];
      const inscriptionId = new ObjectId();

      await db.collection('inscriptions').insertOne({
        _id: inscriptionId,
        id_eleve: eleve._id,
        id_formation: formation._id,
        date_inscription: randomDate(new Date(2025, 8, 1), new Date(2025, 10, 1)),
        niveau_actuel: 1,
        statut_formation: 'en_cours',
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });

      allInscriptions.push({
        _id: inscriptionId,
        id_eleve: eleve._id,
        id_formation: formation._id,
        eleveNom: `${eleve.prenom} ${eleve.nom}`,
      });
      console.log(`   ✅ ${eleve.prenom} ${eleve.nom} → ${formation.nom_formation}`);
    }
  }

  // ── 6. Create Presences ──
  console.log('\n✋ Création des présences...');
  let presenceCount = 0;

  for (const inscription of allInscriptions) {
    // Get seances for this formation's niveau 1 that are validated
    const formationSeances = allSeances.filter(
      s => s.id_formation.toString() === inscription.id_formation.toString()
        && s.numero_niveau === 1
        && s.statut === true
    );

    for (const seance of formationSeances) {
      // 85% chance of being present
      const present = Math.random() < 0.85;
      await db.collection('presences').insertOne({
        id_inscription: inscription._id,
        id_seance: seance._id,
        present: present,
        date_pointage: new Date(),
        remarques: present ? '' : pick(['Absent sans justification', 'Maladie', 'Problème de transport']),
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });
      presenceCount++;
    }
  }
  console.log(`   ✅ ${presenceCount} enregistrements de présence créés`);

  // ── Summary ──
  console.log('\n' + '═'.repeat(55));
  console.log('   ✅  BASE DE DONNÉES CHARGÉE AVEC SUCCÈS !');
  console.log('═'.repeat(55));
  console.log(`   👤 Utilisateurs  : ${usersData.length}`);
  console.log(`   🎓 Élèves        : ${elevesData.length}`);
  console.log(`   📘 Formations    : ${formationsData.length}`);
  console.log(`   📊 Niveaux       : ${allNiveaux.length}`);
  console.log(`   📅 Séances       : ${allSeances.length}`);
  console.log(`   📝 Inscriptions  : ${allInscriptions.length}`);
  console.log(`   ✋ Présences     : ${presenceCount}`);
  console.log('═'.repeat(55));
  console.log('\n   🔑 Identifiants de connexion :');
  console.log('   ─────────────────────────────────');
  for (const u of usersData) {
    console.log(`   ${u.role.padEnd(22)} ${u.email} / password123`);
  }
  console.log('');

  await mongoose.disconnect();
  console.log('🔌 Déconnecté de MongoDB.\n');
}

seed().catch(err => {
  console.error('❌ Erreur lors du seed:', err);
  process.exit(1);
});
