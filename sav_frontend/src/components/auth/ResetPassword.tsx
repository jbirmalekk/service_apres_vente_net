import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

// Styled Components
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
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
    boxShadow: '0 10px 30px rgba(76, 175, 80, 0.4)',
    background: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)',
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
      border: '1px solid rgba(76, 175, 80, 0.3)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid #4CAF50',
      boxShadow: '0 0 20px rgba(76, 175, 80, 0.3)',
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
    color: '#4CAF50',
  },
  '& .MuiFilledInput-input': {
    color: '#fff',
  },
  '& .MuiFormHelperText-root': {
    color: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.5)',
  },
}));

const PasswordStrengthIndicator = styled(Box)<{ strength: number }>(({ strength }) => ({
  height: '4px',
  borderRadius: '2px',
  background: getStrengthColor(strength),
  width: `${strength * 25}%`,
  transition: 'all 0.3s ease',
}));

const getStrengthColor = (strength: number) => {
  if (strength === 0) return '#f44336';
  if (strength === 1) return '#ff9800';
  if (strength === 2) return '#ffeb3b';
  if (strength === 3) return '#8bc34a';
  return '#4caf50';
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Récupérer le token et l'email depuis l'URL
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setIsTokenValid(false);
      setApiError('Lien de réinitialisation invalide ou expiré.');
    }
  }, [token, email]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nouveau mot de passe requis';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Minimum 6 caractères';
    } else if (passwordStrength < 2) {
      newErrors.newPassword = 'Le mot de passe est trop faible';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !email) {
      setApiError('Lien de réinitialisation invalide.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setApiError('');
    setApiSuccess('');
    
      try {
      // Send token/email as provided by URLSearchParams to avoid
      // double-decoding issues when tokens are percent-encoded multiple times.
      await authService.resetPassword({
        email: email || '',
        token: token || '',
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      
      setApiSuccess('Mot de passe réinitialisé avec succès ! Redirection vers la page de connexion...');
      
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      setApiError(err.message || 'Échec de la réinitialisation. Le lien est peut-être expiré.');
    } finally {
      setLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
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
              width: 60,
              height: 60,
              margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Error sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Lien invalide ou expiré ⏰
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            Ce lien de réinitialisation est invalide ou a expiré.
            <br />
            Veuillez demander un nouveau lien.
          </Typography>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/forgot-password')}
            sx={{
              color: '#64B5F6',
              borderColor: 'rgba(100, 181, 246, 0.5)',
              '&:hover': {
                borderColor: '#64B5F6',
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
              },
            }}
          >
            Demander un nouveau lien
          </Button>
        </CardContent>
      </Card>
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
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)',
          }}
        >
          🔑
        </Box>
        
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Nouveau mot de passe
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            mb: 2,
          }}
        >
          Créez un nouveau mot de passe sécurisé pour votre compte
        </Typography>
        
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'rgba(255, 255, 255, 0.5)',
            fontStyle: 'italic',
          }}
        >
          Pour : {email}
        </Typography>
      </Box>

      {apiError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: '#fff',
            borderRadius: '12px',
            animation: errors.newPassword ? `${shake} 0.5s ease` : 'none',
          }}
          onClose={() => setApiError('')}
        >
          {apiError}
        </Alert>
      )}

      {apiSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            color: '#fff',
            borderRadius: '12px',
          }}
        >
          {apiSuccess}
        </Alert>
      )}

      <StyledTextField
        fullWidth
        variant="filled"
        label="Nouveau mot de passe"
        name="newPassword"
        type={showPassword ? 'text' : 'password'}
        value={formData.newPassword}
        onChange={handlePasswordChange}
        onFocus={() => setFocusedField('newPassword')}
        onBlur={() => setFocusedField(null)}
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <Lock 
              sx={{ 
                mr: 1, 
                color: focusedField === 'newPassword' ? '#4CAF50' : 'rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s',
              }} 
            />
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&:hover': { color: '#4CAF50' },
                }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        autoComplete="new-password"
        autoFocus
      />

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Force du mot de passe
          </Typography>
          <Typography variant="caption" sx={{ color: getStrengthColor(passwordStrength) }}>
            {['Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon'][passwordStrength]}
          </Typography>
        </Box>
        <PasswordStrengthIndicator strength={passwordStrength} />
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
              <li>Minimum 6 caractères</li>
              <li>Recommandé : 8+ caractères avec majuscules, chiffres et caractères spéciaux</li>
            </ul>
          </Typography>
        </Box>
      </Box>

      <StyledTextField
        fullWidth
        variant="filled"
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handlePasswordChange}
        onFocus={() => setFocusedField('confirmPassword')}
        onBlur={() => setFocusedField(null)}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <Lock 
              sx={{ 
                mr: 1, 
                color: focusedField === 'confirmPassword' ? '#4CAF50' : 'rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s',
              }} 
            />
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&:hover': { color: '#4CAF50' },
                }}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        autoComplete="new-password"
      />

      <GradientButton
        type="submit"
        fullWidth
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : null}
      >
        {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
      </GradientButton>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          ⚠️ <strong>Sécurité :</strong> Après réinitialisation, vous serez déconnecté de tous les appareils.
        </Typography>
      </Box>
    </Box>
  );
};

export default ResetPassword;