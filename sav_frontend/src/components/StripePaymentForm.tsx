import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Box, CircularProgress, Typography } from '@mui/material';

interface StripePaymentFormProps {
  clientSecret: string;
  factureId: number;
  amount: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  factureId,
  amount,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?factureId=${factureId}&payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Erreur de paiement');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment in backend
        const response = await fetch('https://localhost:7228/api/stripe/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          })
        });

        if (response.ok) {
          onSuccess();
        } else {
          const data = await response.json();
          onError(data.error || 'Erreur lors de la confirmation');
        }
        setIsProcessing(false);
      }
    } catch (err: any) {
      onError(err.message || 'Erreur inattendue');
      setIsProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Informations de paiement sécurisées (Stripe)
      </Typography>
      
      <PaymentElement />
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          variant="contained"
          color="success"
          sx={{
            px: 5,
            py: 1.2,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
            '&:hover': {
              boxShadow: '0 12px 32px rgba(16,185,129,0.35)',
            }
          }}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Traitement...
            </>
          ) : (
            `Payer ${amount} €`
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default StripePaymentForm;
