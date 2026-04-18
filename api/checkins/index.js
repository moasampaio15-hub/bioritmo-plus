import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const data = req.body;
      
      const docRef = await addDoc(collection(db, 'checkins'), {
        ...data,
        created_time: new Date().toISOString()
      });
      
      res.json({ success: true, id: docRef.id });

    } else if (req.method === 'GET') {
      const { userId } = req.query;
      
      const q = query(
        collection(db, 'checkins'),
        where('user_id', '==', parseInt(userId)),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const checkins = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json(checkins);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
}
