const admin = require('firebase-admin');

const serviceAccount = require("./pantrytracker-564e4-firebase-adminsdk-4tb2n-2c9b4c03e0.json")


admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore();

module.exports = db;