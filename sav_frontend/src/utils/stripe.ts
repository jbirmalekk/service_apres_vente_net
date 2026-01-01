import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    // The publishable key will be set dynamically when creating a payment intent
    stripePromise = loadStripe('pk_test_51Saji12Od9CVpu437FnzmkExZdJvBNWf0IU45TRP4qNT1Ek22PtSs62gsR7EMBU1P18LaZPrceoQD2trz9JYONA100htI6vC1r');
  }
  return stripePromise;
};
