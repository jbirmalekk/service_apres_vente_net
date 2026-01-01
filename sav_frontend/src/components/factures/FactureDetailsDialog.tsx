import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Close, ReceiptLong, CalendarToday, Paid } from '@mui/icons-material';
import { Facture } from '../../types/facture';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    animation: `${fadeIn} 0.4s ease`,
    width: '100%',
    maxWidth: '640px',
  },
}));

const HeaderChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  borderRadius: '16px',
}));

interface Props {
  open: boolean;
  facture: Facture | null;
  onClose: () => void;
}

const FactureDetailsDialog: React.FC<Props> = ({ open, facture, onClose }) => {
  if (!facture) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullWidth
      disablePortal
      container={() => (document.getElementById('root') as HTMLElement | null) || undefined}
    >
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Détail facture {facture.numeroFacture}
                            </Typography>
                            <IconButton onClick={onClose}>
                              <Close />
                            </IconButton>
                          </DialogTitle>
                          <DialogContent dividers>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <HeaderChip
                                icon={<ReceiptLong />}
                                label={`Statut : ${facture.statut}`}
                                color={facture.statut.toLowerCase() === 'payée' ? 'success' : 'warning'}
                              />
                              <Typography variant="body2" color="text.secondary">
                                Date : {new Date(facture.dateFacture).toLocaleDateString('fr-FR')}
                              </Typography>
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Paid sx={{ color: '#4CAF50' }} />
                                  <Typography variant="subtitle2">Montant TTC</Typography>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(facture.montantTTC)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatCurrency(facture.montantHT)} + TVA ({(facture.tva * 100).toFixed(0)}%)
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CalendarToday sx={{ color: '#2196F3' }} />
                                  <Typography variant="subtitle2">Intervention</Typography>
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  #{facture.interventionId}
                                </Typography>
                                {facture.datePaiement && (
                                  <Typography variant="caption" color="text.secondary">
                                    Payée le {new Date(facture.datePaiement).toLocaleDateString('fr-FR')}
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>

                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Informations client
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {facture.clientNom}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {facture.clientEmail}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {facture.clientAdresse}
                              </Typography>
                            </Box>

                            {facture.descriptionServices && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                  Services facturés
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {facture.descriptionServices}
                                </Typography>
                              </Box>
                            )}
                          </DialogContent>
                          <DialogActions sx={{ p: 3, pr: 4 }}>
                            {/* If not paid, show a Payer button that starts an online payment flow */}
                            {facture.statut?.toLowerCase() !== 'payée' && (
                              <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  onClick={async () => {
                                    try {
                                      const mod = await import('../../services/factureService');
                                      const service = (mod && (mod.factureService || mod.default)) || mod;
                                      const resp = await service.createPaymentSession(facture.id);
                                      if (resp?.url) {
                                        const payerData = {
                                          firstName: facture.clientNom ? facture.clientNom.split(' ')[0] : '',
                                          lastName: facture.clientNom ? facture.clientNom.split(' ').slice(1).join(' ') : '',
                                          phone: facture.clientTelephone || '',
                                          address: facture.clientAdresse || '',
                                          clientEmail: facture.clientEmail || '',
                                        };

                                        try {
                                          sessionStorage.setItem(`INIT_PAYMENT_${facture.id}`, JSON.stringify(payerData));
                                        } catch (e) {
                                          // ignore storage errors
                                        }

                                        const checkoutPath = `/checkout?factureId=${facture.id}`;
                                        window.location.href = checkoutPath;
                                      } else {
                                        alert('Impossible de démarrer le paiement.');
                                      }
                                    } catch (err: any) {
                                      console.error('Payment error', err);
                                      alert(err?.message || 'Erreur lors du démarrage du paiement');
                                    }
                                  }}
                                >
                                  Payer
                                </Button>
                              </Box>
                            )}
                          </DialogActions>
                        </StyledDialog>
                      );
                    };

                    export default FactureDetailsDialog;