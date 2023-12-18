const jwt = require('jsonwebtoken');
require('dotenv').config();

function tokenVerif(req, res, next) {
    // récupération du token depuis le cookie //
    const token = req.cookies.token;

    if (!token) {
        console.log('Aucun token fourni, redirection vers la page de connexion');
        // si aucun token n'est trouvé dans le cookie, rediriger vers la page de connexion //
        return res.redirect('/login');
    }
    const cleToken = process.env.TOKEN_SECRET
    jwt.verify(token, cleToken, (err, decoded) => {
        if (err) {
            console.error('Erreur de vérification du token :', err);
            // si le token est invalide, rediriger vers la page de connexion //
            return res.redirect('/login');
        }
        // passer à la prochaine étape de traitement de la requête //
        req.user = decoded.user;
        next();
    });
}

module.exports = tokenVerif;
