const express = require('express');
const router = express.Router();
const db = require('../firebaseAdmin');

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

module.exports = router;