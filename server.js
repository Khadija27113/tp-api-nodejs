const express = require('express')
const dotenv = require('dotenv')
const connectDB=require('./config/database')

dotenv.config();
connectDB();
const app = express();
// MIDDLEWARES
// ============================================

// Middleware pour parser le JSON dans les requêtes
// Sans cela, req.body serait undefined
app.use(express.json());

// ============================================
// ROUTES
// ============================================

// Route d'accueil - pour tester que le serveur fonctionne
app.get('/', (req, res) => {
    res.json({
        message: '🎓 Bienvenue sur l\'API de gestion des étudiants! ',
        version: '1.0.0',
        endpoints: {
            listeEtudiants: 'GET /api/etudiants',
            creerEtudiant: 'POST /api/etudiants',
            voirEtudiant: 'GET /api/etudiants/:id',
            modifierEtudiant: 'PUT /api/etudiants/:id',
            supprimerEtudiant: 'DELETE /api/etudiants/: id',
            parFiliere: 'GET /api/etudiants/filiere/: filiere'
        }
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Monter les routes des étudiants sur /api/etudiants
app.use('/api/etudiants', require('./routes/etudiantRoutes'));

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404 pour les URLs non trouvées
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} non trouvée`
    });
});

// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║   🚀 Serveur démarré avec succès!          ║
    ╠════════════════════════════════════════════╣
    ║   📍 URL: http://localhost:${PORT}             ║
    ║   📚 API: http://localhost:${PORT}/api/etudiants║
    ╚════════════════════════════════════════════╝
    `);
});
