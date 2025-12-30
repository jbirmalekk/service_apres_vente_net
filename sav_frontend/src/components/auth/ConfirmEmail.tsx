import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  CheckCircle,
  Error,
  Email,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const ConfirmEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token && email) {
      confirmEmail();
    } else {
      setStatus('error');
      setMessage('Lien de confirmation invalide');
    }
  }, []);

  const confirmEmail = async () => {
    if (!token || !email) return;
    
    try {
      const success = await authService.confirmEmail(email, token);
      
      if (success) {
        setStatus('success');
        setMessage('Votre email a été confirmé avec succès !');
      } else {
        setStatus('error');
        setMessage('Échec de la confirmation. Le lien est peut-être expiré.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Une erreur est survenue lors de la confirmation.');
    }
  };

  const resendConfirmation = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      await authService.resendConfirmationEmail(email);
      setMessage('Un nouveau lien de confirmation a été envoyé à votre email.');
    } catch (err: any) {
      setMessage(err.message || 'Impossible d\'envoyer un nouveau lien.');
    } finally {
      setLoading(false);
    }
  };

  const SuccessCard = () => (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        borderRadius: '16px',
        animation: `${fadeIn} 0.6s ease`,
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #2196F3 0%, #0EA5E9 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          <CheckCircle sx={{ color: '#fff', fontSize: 48 }} />
        </Box>
        
        <Typography
          variant="h5"
          sx={{
            color: '#fff',
            fontWeight: 800,
            mb: 2,
          }}
        >
          Félicitations ! 🎉
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          Votre email a été confirmé avec succès. Votre compte est maintenant actif.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.6)',
              mb: 1,
              fontWeight: 600,
            }}
          >
            Vous pouvez maintenant :
          </Typography>
          <ul style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            textAlign: 'left', 
            paddingLeft: '20px',
            margin: 0,
          }}>
            <li>Créer et suivre vos réclamations</li>
            <li>Consulter l'état des interventions</li>
            <li>Accéder à votre historique</li>
            <li>Recevoir des notifications importantes</li>
          </ul>
        </Box>
        
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{
            background: 'linear-gradient(135deg, #2196F3 0%, #0EA5E9 100%)',
            color: '#fff',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            '&:hover': {
              background: 'linear-gradient(135deg, #1976D2 0%, #0288D1 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 20px rgba(33, 150, 243, 0.3)',
            },
          }}
        >
          Se connecter
        </Button>
      </CardContent>
    </Card>
  );

  const ErrorCard = () => (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(211, 47, 47, 0.05) 100%)',
        border: '1px solid rgba(244, 67, 54, 0.3)',
        borderRadius: '16px',
        animation: `${fadeIn} 0.6s ease`,
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Error sx={{ color: '#fff', fontSize: 48 }} />
        </Box>
        
        <Typography
          variant="h5"
          sx={{
            color: '#fff',
            fontWeight: 800,
            mb: 2,
          }}
        >
          Oups ! ❌
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          {message || 'Impossible de confirmer votre email.'}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.6)',
              mb: 1,
              fontWeight: 600,
            }}
          >
            Causes possibles :
          </Typography>
          <ul style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            textAlign: 'left', 
            paddingLeft: '20px',
            margin: 0,
          }}>
            <li>Le lien a expiré (24h maximum)</li>
            <li>Le lien a déjà été utilisé</li>
            <li>L'email est déjà confirmé</li>
            <li>Lien malformé ou incomplet</li>
          </ul>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            startIcon={<ArrowBack />}
            sx={{
              color: '#64B5F6',
              borderColor: 'rgba(100, 181, 246, 0.5)',
              '&:hover': {
                borderColor: '#64B5F6',
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
              },
            }}
          >
            Retour
          </Button>
          
          <Button
            variant="contained"
            onClick={resendConfirmation}
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Email />}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
              },
              '&:disabled': {
                background: 'rgba(255, 152, 0, 0.3)',
              },
            }}
          >
            {loading ? 'Envoi...' : 'Renvoyer un lien'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const LoadingCard = () => (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.05) 100%)',
        border: '1px solid rgba(255, 152, 0, 0.3)',
        borderRadius: '16px',
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              border: '3px solid rgba(255, 152, 0, 0.3)',
              borderTopColor: '#ff9800',
              borderRadius: '50%',
              animation: `${spin} 1s linear infinite`,
            }}
          />
        </Box>
        
        <Typography
          variant="h5"
          sx={{
            color: '#fff',
            fontWeight: 800,
            mb: 2,
          }}
        >
          Confirmation en cours...
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.6,
          }}
        >
          Nous vérifions votre lien de confirmation.
          <br />
          Veuillez patienter quelques secondes.
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Confirmation d'email
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          {email && `Email : ${decodeURIComponent(email)}`}
        </Typography>
      </Box>

      {status === 'loading' && <LoadingCard />}
      {status === 'success' && <SuccessCard />}
      {status === 'error' && <ErrorCard />}
    </Box>
  );
};

export default ConfirmEmail;