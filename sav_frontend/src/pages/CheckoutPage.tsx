import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { factureService } from '../services/factureService';
<<<<<<< HEAD
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../utils/stripe';
=======
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
<<<<<<< HEAD
  Divider,
  CircularProgress,
  Box,
  Chip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import Payment from '@mui/icons-material/Payment';
import StripePaymentForm from '../components/StripePaymentForm';
=======
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const factureId = Number(searchParams.get('factureId')) || null;

  const [facture, setFacture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [method, setMethod] = useState<'stripe' | 'adomicile'>('stripe');
  const [payer, setPayer] = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [card, setCard] = useState({ number: '', cvv: '' });
  const [status, setStatus] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
=======
  const [method, setMethod] = useState<'paypal' | 'adomicile'>('paypal');
  const [payer, setPayer] = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [card, setCard] = useState({ number: '', cvv: '' });
  const [status, setStatus] = useState<string | null>(null);
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead

  useEffect(() => {
    if (!factureId) return;
    (async () => {
      try {
        const f = await factureService.getById(factureId);
        setFacture(f);
        if (f?.ClientNom) {
          const parts = f.ClientNom.split(' ');
          setPayer((p) => ({ ...p, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' }));
        }
      } catch (e: any) {
        setStatus('Impossible de charger la facture: ' + (e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [factureId]);

  // If redirected from the app, prefill from sessionStorage key
  useEffect(() => {
    try {
      const key = `INIT_PAYMENT_${factureId}`;
      const v = sessionStorage.getItem(key);
      if (v) {
        const data = JSON.parse(v);
        if (data) setPayer((p) => ({ ...p, ...data }));
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      // ignore
    }
  }, [factureId]);

<<<<<<< HEAD
  // Create Stripe PaymentIntent when method is stripe
  useEffect(() => {
    if (method === 'stripe' && factureId && !clientSecret) {
      (async () => {
        try {
          const response = await fetch('https://localhost:7228/api/stripe/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ factureId })
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors de la création du PaymentIntent');
          }
          
          const data = await response.json();
          setClientSecret(data.clientSecret);
          setStripeReady(true);
        } catch (error: any) {
          setStatus('Erreur Stripe: ' + (error.message || error));
        }
      })();
    }
  }, [method, factureId, clientSecret]);

=======
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead
  if (!factureId) return <Container sx={{ py: 6 }}>FactureId manquant dans l'URL.</Container>;
  if (loading) return <Container sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Container>;
  if (!facture) return <Container sx={{ py: 6 }}>Facture introuvable.</Container>;

<<<<<<< HEAD
  const amount = facture.MontantTTC ?? facture.montantTTC ?? 0;
  const amountFormatted = typeof amount === 'number' ? amount.toFixed(2) : String(amount);

=======
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Traitement...');
    try {
      const payload: any = {
        paymentMethod: method,
        amount: facture.MontantTTC,
        payer,
      };
      if (method === 'paypal') payload.card = card;

      await factureService.confirmPayment(factureId, payload);
<<<<<<< HEAD
      setStatus('✅ Paiement confirmé avec succès !');
      setTimeout(() => {
        // Redirection vers la page des factures avec un message de succès
        navigate('/factures', { state: { message: 'Paiement effectué avec succès', factureId } });
      }, 1500);
    } catch (err: any) {
      setStatus('❌ Erreur: ' + (err.message || err));
=======
      setStatus('Paiement confirmé !');
      setTimeout(() => navigate('/factures'), 900);
    } catch (err: any) {
      setStatus('Erreur: ' + (err.message || err));
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead
    }
  };

  return (
<<<<<<< HEAD
    <Container maxWidth="lg" sx={{ py: 6, display: 'flex', justifyContent: 'center', minHeight: '90vh', alignItems: 'center' }}>
      <Paper sx={{ maxWidth: 960, width: '100%', borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <Box component="form" onSubmit={onSubmit}>
          {/* Header */}
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Paiement — Facture {facture.NumeroFacture || facture.numeroFacture}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Complétez les informations pour finaliser votre paiement
              </Typography>
            </Box>
            <IconButton onClick={() => navigate('/factures')} size="small" sx={{ color: 'text.secondary' }}>
=======
    <Container maxWidth="lg" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ width: 760, borderRadius: 3, boxShadow: '0 20px 50px rgba(16,24,40,0.12)', position: 'relative', overflow: 'visible' }}>
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">Détail facture {facture.NumeroFacture}</Typography>
              <Typography variant="caption" color="text.secondary">Date : {facture.DateCreation || facture.Date || ''}</Typography>
            </Box>
            <IconButton onClick={() => navigate('/factures')} size="small">
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead
              <CloseRounded />
            </IconButton>
          </Box>

<<<<<<< HEAD
          {/* Full-Width Summary Section */}
          <Box sx={{ bgcolor: 'grey.50', px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, mb: 2, display: 'block' }}>
              Récapitulatif
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Numéro de facture</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{facture.NumeroFacture || facture.numeroFacture}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Client</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{facture.ClientNom || facture.clientNom}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{facture.ClientEmail || facture.clientEmail}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Date</Typography>
                <Typography variant="body1">{new Date(facture.DateCreation || facture.dateFacture).toLocaleDateString('fr-FR')}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Montant HT</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{facture.MontantHT?.toFixed(2) || '—'} €</Typography>
              </Grid>

              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Total TTC</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>{amountFormatted} €</Typography>
              </Grid>
            </Grid>

            {status && (
              <Box sx={{ mt: 3, p: 2, bgcolor: status.includes('Erreur') ? 'error.light' : 'success.light', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: status.includes('Erreur') ? 'error.dark' : 'success.dark' }}>
                  {status}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Form Section */}
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Informations personnelles</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Prénom" value={payer.firstName} onChange={(e) => setPayer({ ...payer, firstName: e.target.value })} variant="outlined" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nom" value={payer.lastName} onChange={(e) => setPayer({ ...payer, lastName: e.target.value })} variant="outlined" required />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Téléphone" value={payer.phone} onChange={(e) => setPayer({ ...payer, phone: e.target.value })} placeholder="+33 6 12 34 56 78" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Adresse" value={payer.address} onChange={(e) => setPayer({ ...payer, address: e.target.value })} placeholder="Tunis, Tunisie" variant="outlined" />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Méthode de paiement</Typography>
                <ToggleButtonGroup
                  value={method}
                  exclusive
                  onChange={(_, v) => v && setMethod(v)}
                  aria-label="payment-method"
                  color="primary"
                  fullWidth
                >
                  <ToggleButton value="stripe" sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}>
                    Paiement par carte (Stripe)
                  </ToggleButton>
                  <ToggleButton value="adomicile" sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}>
                    À domicile
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {method === 'stripe' && clientSecret && stripeReady && (
                <Grid item xs={12}>
                  <Elements stripe={getStripe()} options={{ clientSecret }}>
                    <StripePaymentForm 
                      clientSecret={clientSecret}
                      factureId={factureId}
                      amount={amountFormatted}
                      onSuccess={() => {
                        setStatus('Paiement confirmé !');
                        setTimeout(() => navigate('/factures'), 1500);
                      }}
                      onError={(error: string) => setStatus('Erreur: ' + error)}
                    />
                  </Elements>
                </Grid>
              )}

              {method === 'adomicile' && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="outlined" onClick={() => navigate('/factures')} sx={{ px: 4, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                      Annuler
                    </Button>
                    <Button 
                      type="submit"
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
                      Confirmer paiement à domicile
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
=======
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip label={facture.Statut || 'En attente'} color="warning" sx={{ fontWeight: 700 }} />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" color="success.main">Montant TTC</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{facture.MontantTTC?.toFixed(2)} €</Typography>
              <Typography variant="caption" color="text.secondary">{(facture.MontantHT || '') + (facture.TVA ? ` • TVA ${facture.TVA}%` : '')}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Informations client</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{facture.ClientNom}</Typography>
            <Typography variant="body2" color="text.secondary">{facture.ClientEmail || ''}</Typography>
            <Typography variant="body2" color="text.secondary">{facture.ClientVille || ''}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="success" onClick={() => { /* keep existing flow: open form area */ }} sx={{ borderRadius: 3, px: 3, py: 1.2, boxShadow: '0 8px 24px rgba(16,185,129,0.18)' }}>Payer</Button>
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead
          </Box>
        </Box>
      </Paper>
    </Container>
  );
<<<<<<< HEAD
}
=======
};
>>>>>>> cee27030d3d04a518224c290aab9f331afc95ead

export default CheckoutPage;
