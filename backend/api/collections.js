const express = require('express');
const router = express.Router();
const db = require('../firebaseAdmin');
const { collection, addDoc } = require('firebase/firestore');

// Define the "/collections" endpoint
router.get('/collections', async (req, res) => {
  try {
    const collections = await db.listCollections();
    const collectionNames = collections.map((col) => col.id);
    res.json({collections: collectionNames});
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).send('Error fetching collections');
  }
});

router.post('/collections', async (req, res) => {
  try{
    const {collectionName, data} = req.body;

    const docRef = await addDoc(collection(firestore,collectionName),data);
    res.status(200).json({message: "doucment added!", id: docRef.id})
  }
  catch(error){
    console.error("Error adding collections:", error)
    res.status(500).send("Error adding collections")
  }
})

module.exports = router;