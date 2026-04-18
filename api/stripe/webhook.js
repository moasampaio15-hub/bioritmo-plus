import Stripe from 'stripe';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId;

      // Atualizar usuário para premium no Firebase
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          is_premium: true,
          premium_since: new Date().toISOString(),
          stripe_customer_id: session.customer,
          subscription_id: session.subscription
        });
        console.log(`Usuário ${userId} atualizado para premium`);
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const userId = subscription.metadata.userId;

      // Remover premium do usuário
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          is_premium: false,
          premium_ended: new Date().toISOString()
        });
        console.log(`Premium removido do usuário ${userId}`);
      } catch (error) {
        console.error('Erro ao remover premium:', error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}
