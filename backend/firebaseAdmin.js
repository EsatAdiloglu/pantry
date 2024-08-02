import admin from 'firebase-admin';

const serviceAccount = require("./pantrytracker-564e4-firebase-adminsdk-4tb2n-2c9b4c03e0.json")

if(!admin.app.length){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
}

const db = admin.firestore();

export{db}