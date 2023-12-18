const mongoose = require("mongoose");
// import des valeurs du fichier .env //
require('dotenv').config();
const connectLink = process.env.MONGODB_URI;

const connect = mongoose.connect(connectLink);
// vérification du statut de la connection à la base de données //
connect.then(()=>{
    console.log("Connecté à la base de données");
})
.catch(()=>{
    console.log("Erreur lors de la connexion à la base de données")
});
// construction du schéma pour la base de données //
const loginSchema=new mongoose.Schema({
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    }
});
const collection = new mongoose.model("users",loginSchema);

module.exports=collection;