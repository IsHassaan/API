const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const collection = require("./config");
const tokenVerif = require('./tokenVerif');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
// définition du dossier static //
app.use(express.static(path.join(__dirname, '../public')));

// fonction de verification de la presence d'un token //
function verifLogged(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        // redirection utilisateurs si un token est présent //
        return res.redirect("/users");
    }
    next();
}

//gestion des pages//
app.get("/",verifLogged, (req, res) => {
    res.render("login");
});
app.get("/users",tokenVerif, async (req, res) => {
    // récupération des utilisateurs//
    const users = await collection.find({});
    res.render("users", { users });
});
app.get("/register",verifLogged, (req, res) => {
    res.render("register");
});
app.get("/logout", (req, res) => {
    // suppression du cookie nommé token //
    res.clearCookie('token');
    // redirection vers la page de connexion //
    res.redirect("/login");
});
app.get("/login",verifLogged, (req, res) => {
    res.render("login");
});


//gestion des informations formulaire et intéractions base de données//
//inscription//
app.post("/register", async (req, res) => {
    const data = {
        email: req.body.email,
        password: req.body.password
    };
    try {
        const utilisateurExistant = await collection.findOne({ email: data.email });

        if (utilisateurExistant) {
            res.render("register", { errorMessage: "Cet email est déjà utilisé" });
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            data.password = hashedPassword;

            await collection.create(data);
            res.redirect("/login");
        }
    } catch (error) {
        console.error(error);
        res.send("Erreur lors de l'inscription");
    }
});

//connexion//
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email });

        if (!check) {
            res.render("login", { errorMessage: "Email ou mot de passe incorrect" });
        } else {
            const matchingPassword = await bcrypt.compare(req.body.password, check.password);

            if (matchingPassword) {
                // Création du token//
                const cleToken = process.env.TOKEN_SECRET
                const token = jwt.sign({ user: check }, cleToken);
                // Stocker le token dans un cookie//
                res.cookie('token', token, { httpOnly: true, secure: true });
                // Redirection vers la page des utilisateurs//
                res.redirect("/users");
            } else {
                res.render("login", { errorMessage: "Mot de passe invalide" });
            }
        }
    } catch (error) {
        console.error(error);
        res.render("login", { errorMessage: "Erreur lors de la connexion" });
    }
});



const port = 3001;
app.listen(port, () => {
    console.log('Le serveur fonctionne sur le port 3001');
});
