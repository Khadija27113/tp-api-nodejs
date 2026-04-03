// Importer le modèle Etudiant
const mongoose = require('mongoose');
const Etudiant = require('../models/Etudiant');

// Les fonctions CRUD seront ajoutées ici...
// ============================================
// CREATE - Créer un nouvel étudiant
// ============================================
// Route:  POST /api/etudiants
// Cette fonction reçoit les données d'un étudiant dans le body
// de la requête et les enregistre dans la base de données.

exports.createEtudiant = async (req, res) => {
    try {
        // Étape 1: Récupérer les données envoyées par le client
        // req.body contient les données JSON envoyées
        console.log('📥 Données reçues:', req.body);

        const { nom, prenom } = req.body;

        // NOUVELLE ÉTAPE : Vérifier si l'étudiant existe déjà
        const existe = await Etudiant.findOne({ nom, prenom });

        if (existe) {
            return res.status(400).json({
                success: false,
                message: 'Un étudiant avec le même nom et prénom existe déjà'
            });
        }

        // Étape 2: Créer l'étudiant dans la base de données
        // Mongoose valide automatiquement les données selon le schéma
        const etudiant = await Etudiant.create(req.body);

        // Étape 3: Renvoyer une réponse de succès (code 201 = Created)
        res.status(201).json({
            success: true,
            message: 'Étudiant créé avec succès',
            data: etudiant
        });

    } catch (error) {
        // Gestion des erreurs

        // Erreur de doublon (email déjà existant)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Cet email existe déjà'
            });
        }

        // Autres erreurs (validation, etc.)
        res.status(400).json({
            success: false,
            message: 'Données invalides',
            error: error.message
        });
    }
};

// ============================================
// READ ALL - Récupérer tous les étudiants
// ============================================
// Route: GET /api/etudiants
// Cette fonction retourne la liste complète des étudiants dont l'etat est actif.

exports.getAllEtudiants = async (req, res) => {
    try {
        // ✅ Récupérer uniquement les étudiants actifs
        const etudiants = await Etudiant.find({ actif: true });

        res.status(200).json({
            success: true,
            count: etudiants.length,
            data: etudiants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};


// ============================================
// READ ONE - Récupérer un étudiant par son ID
// ============================================
// Route: GET /api/etudiants/:id
// Le : id dans l'URL est un paramètre dynamique.
// Exemple:  GET /api/etudiants/507f1f77bcf86cd799439011

exports.getEtudiantById = async (req, res) => {
    try {
        const id = req.params.id;

        // ✅ Check valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID invalide'
            });
        }

        const etudiant = await Etudiant.findById(id);

        if (!etudiant) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: etudiant
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// ============================================
// UPDATE - Mettre à jour un étudiant
// ============================================
// Route: PUT /api/etudiants/:id
// Cette fonction modifie les champs d'un étudiant existant.

exports.updateEtudiant = async (req, res) => {
    try {
        console.log('✏️ Mise à jour de l\'ID:', req.params.id);
        console.log('📥 Nouvelles données:', req.body);

        // findByIdAndUpdate prend 3 arguments:
        // 1. L'ID du document à modifier
        // 2. Les nouvelles données
        // 3. Options:
        //    - new: true = retourne le document modifié (pas l'ancien)
        //    - runValidators: true = applique les validations du schéma

        const etudiant = await Etudiant.findByIdAndUpdate(
            req.params. id,
            req.body,
            { new: true, runValidators: true }
        );

        // Vérifier si l'étudiant existe
        if (!etudiant) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Étudiant mis à jour avec succès',
            data: etudiant
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur de mise à jour',
            error: error.message
        });
    }
};

// ============================================
// SOFT DELETE - Supprimer un étudiant
// ============================================
// Route: DELETE /api/etudiants/:id
// Cette fonction rend l'etat de l'etudiant inactif.

exports.deleteEtudiant = async (req, res) => {
    try {
        console.log('🗑️ Désactivation de l\'ID:', req.params.id);

        // Soft delete : mettre actif à false au lieu de supprimer
        const etudiant = await Etudiant.findByIdAndUpdate(
            req.params.id,
            { actif: false },
            { new: true } // retourne l'étudiant mis à jour
        );

        // Vérifier si l'étudiant existait
        if (!etudiant) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Étudiant désactivé avec succès',
            data: etudiant // retourne l'étudiant désactivé
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};


// ============================================
// SEARCH - Rechercher des étudiants par filière
// ============================================
// Route:  GET /api/etudiants/filiere/:filiere
// Exemple: GET /api/etudiants/filiere/Informatique

exports.getEtudiantsByFiliere = async (req, res) => {
    try {
        console.log('🔎 Recherche par filière:', req.params.filiere);

        // Chercher tous les étudiants avec cette filière
        const etudiants = await Etudiant. find({ filiere: req.params.filiere });

        res.status(200).json({
            success: true,
            count: etudiants.length,
            filiere: req.params.filiere,
            data: etudiants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error. message
        });
    }
};



// ============================================
// SEARCH - Rechercher des étudiants par nom
// ============================================
// Route:  GET /api/etudiants/search?q=......
// Exemple: GET /api/etudiants/search?q=ahmed

exports.searchEtudiants = async (req, res) => {
    try {
        const { q } = req.query;

        // Vérifier si la requête existe
        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Veuillez fournir un mot-clé de recherche (?q=...)"
            });
        }

        // Recherche insensible à la casse
        const regex = new RegExp(q, 'i');

        const etudiants = await Etudiant.find({
            $or: [
                { nom: regex },
                { prenom: regex }
            ]
        });

        res.status(200).json({
            success: true,
            count: etudiants.length,
            data: etudiants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la recherche",
            error: error.message
        });
    }
};


// ============================================
// ENDPOINT - Afficher les étudiants déactivés
// ============================================
// Route:  GET /api/etudiants/search?q=......
// Exemple: GET /api/etudiants/search?q=ahmed

exports.getEtudiantsInactifs = async (req, res) => {
    try {
        // ✅ PAS DE req.body ici, juste une query ou params si besoin
        const etudiants = await Etudiant.find({ actif: false });

        res.status(200).json({
            success: true,
            count: etudiants.length,
            data: etudiants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

// Recherche avancée avec filtres multiples
exports.advancedSearch = async (req, res) => {
    try {
        const { nom, filiere, anneeMin, anneeMax, moyenneMin } = req.query;
        let filter = { actif: true };

        if (nom) filter.nom = new RegExp(nom, 'i');
        if (filiere) filter.filiere = filiere;
        if (anneeMin || anneeMax) {
            filter.annee = {};
            if (anneeMin) filter.annee.$gte = parseInt(anneeMin);
            if (anneeMax) filter.annee.$lte = parseInt(anneeMax);
        }
        if (moyenneMin) filter.moyenne = { $gte: parseFloat(moyenneMin) };

        const etudiants = await Etudiant.find(filter);

        res.status(200).json({
            success: true,
            count: etudiants.length,
            filters: req.query,
            data: etudiants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

exports.getEtudiantsSorted = async (req, res) => {
    try {
        const etudiants = await Etudiant.find({ actif: true })
                                        .sort({ moyenne: -1 }); // tri décroissant

        res.status(200).json({
            success: true,
            count: etudiants.length,
            data: etudiants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};