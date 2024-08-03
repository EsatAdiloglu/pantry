import {db} from "../firebaseAdmin"
console.log("hello world")
export default async function handler(req, res){
    try {

        const collections = await db.listCollections();
        const collectionNames = collections.map((col) => col.id);
        res.json({ collections: collectionNames });
      } catch (error) {
        res.json({ error: 'Error fetching collections' });
      }
}