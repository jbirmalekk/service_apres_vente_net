import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authService } from '../../services/authService';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)',
  color: '#fff',
  fontWeight: 700,
  padding: '14px 28px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 30px rgba(33, 150, 243, 0.4)',
    background: 'linear-gradient(135deg, #1976D2 0%, #0097A7 100%)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

const StyledTextField = styled(TextField)(({ theme, error }) => ({
  '& .MuiFilledInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(33, 150, 243, 0.3)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid #2196F3',
      boxShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
      transform: 'scale(1.02)',
    },
    '&:before, &:after': {
      display: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#64B5F6',
  },
  '& .MuiFilledInput-input': {
    color: '#fff',
  },
  '& .MuiFormHelperText-root': {
    color: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.5)',
  },
}));

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email requis');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email invalide');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setLoading(true);
    setSuccess('');
    
    try {
      const response = await authService.forgotPassword(email);
      
      // Le backend retourne toujours OK même si l'email n'existe pas (pour la sécurité)
      setSuccess(response.message || 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.');
      
      // Effacer le champ email
      setEmail('');
      
      // Réinitialiser le formulaire après 5 secondes
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const SuccessCard = () => (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '16px',
        animation: `${fadeIn} 0.6s ease`,
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          <CheckCircle sx={{ color: '#fff', fontSize: 32 }} />
        </Box>
        
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 700,
            mb: 2,
          }}
        >
          Email envoyé avec succès ! 📧
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans votre boîte Mailtrap.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.5)',
              mb: 1,
              fontWeight: 600,
            }}
          >
            Conseils :
          </Typography>
          <ul style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            textAlign: 'left', 
            paddingLeft: '20px',
            margin: 0,
          }}>
            <li>Vérifiez votre dossier spam si vous ne voyez pas l'email</li>
            <li>Le lien expire dans 24 heures</li>
            <li>Ne partagez jamais ce lien avec d'autres personnes</li>
          </ul>
        </Box>
        
        <Button
          variant="outlined"
          onClick={() => navigate('/login')}
          startIcon={<ArrowBack />}
          sx={{
            mt: 4,
            color: '#64B5F6',
            borderColor: 'rgba(100, 181, 246, 0.5)',
            '&:hover': {
              borderColor: '#64B5F6',
              backgroundColor: 'rgba(100, 181, 246, 0.1)',
            },
          }}
        >
          Retour à la connexion
        </Button>
      </CardContent>
    </Card>
  );

  if (success) {
    return (
      <Box sx={{ animation: `${fadeIn} 0.6s ease`, width: '100%' }}>
        <SuccessCard />
      </Box>
    );
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        width: '100%',
        animation: `${fadeIn} 0.6s ease`,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            boxShadow: '0 10px 30px rgba(33, 150, 243, 0.3)',
          }}
        >
          🔐
        </Box>
        
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #64B5F6 0%, #00BCD4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Mot de passe oublié ?
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
          }}
        >
          Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: '#fff',
            borderRadius: '12px',
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <StyledTextField
        fullWidth
        variant="filled"
        label="Adresse email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError('');
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          validateEmail();
        }}
        error={!!error}
        helperText={error}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <Email 
              sx={{ 
                mr: 1, 
                color: focused ? '#00BCD4' : 'rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s',
              }} 
            />
          ),
        }}
        autoComplete="email"
        autoFocus
      />

      <GradientButton
        type="submit"
        fullWidth
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : null}
      >
        {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
      </GradientButton>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
          💡 <strong>Où trouver l'email ?</strong><br />
          Connectez-vous à Mailtrap et vérifiez votre inbox "sandbox".
        </Typography>
        
        <Link
          component={RouterLink}
          to="/login"
          sx={{
            color: '#64B5F6',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            transition: 'color 0.3s',
            '&:hover': {
              color: '#00BCD4',
              textDecoration: 'underline',
            },
          }}
        >
          <ArrowBack sx={{ fontSize: 16 }} />
          Retour à la page de connexion
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPassword;