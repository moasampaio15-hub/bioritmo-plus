import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, planType, email } = req.body;

    // Preços dos planos
    const prices = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_YEARLY_PRICE_ID
    };

    const priceId = prices[planType];
    if (!priceId) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/subscription?canceled=true`,
      metadata: {
        userId: userId.toString(),
        planType
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planType
        }
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro Stripe:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
}
