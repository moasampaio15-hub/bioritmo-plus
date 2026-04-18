import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import crypto from 'crypto';

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

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);

    // Buscar usuário
    const q = query(
      collection(db, 'users'), 
      where('email', '==', email),
      where('password', '==', hashedPassword)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    res.json({
      id: userDoc.id,
      full_name: userData.full_name,
      email: userData.email,
      is_premium: userData.is_premium
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro no login.' });
  }
}
