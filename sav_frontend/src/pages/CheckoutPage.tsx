import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { factureService } from '../services/factureService';
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
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const factureId = Number(searchParams.get('factureId')) || null;

  const [facture, setFacture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<'paypal' | 'adomicile'>('paypal');
  const [payer, setPayer] = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [card, setCard] = useState({ number: '', cvv: '' });
  const [status, setStatus] = useState<string | null>(null);

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

  if (!factureId) return <Container sx={{ py: 6 }}>FactureId manquant dans l'URL.</Container>;
  if (loading) return <Container sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Container>;
  if (!facture) return <Container sx={{ py: 6 }}>Facture introuvable.</Container>;

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
      setStatus('Paiement confirmé !');
      setTimeout(() => navigate('/factures'), 900);
    } catch (err: any) {
      setStatus('Erreur: ' + (err.message || err));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ width: 760, borderRadius: 3, boxShadow: '0 20px 50px rgba(16,24,40,0.12)', position: 'relative', overflow: 'visible' }}>
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">Détail facture {facture.NumeroFacture}</Typography>
              <Typography variant="caption" color="text.secondary">Date : {facture.DateCreation || facture.Date || ''}</Typography>
            </Box>
            <IconButton onClick={() => navigate('/factures')} size="small">
              <CloseRounded />
            </IconButton>
          </Box>

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
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckoutPage;
