import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiTarget, FiArrowRight, FiUser } from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary}15 0%, 
    ${props => props.theme.colors.secondary}10 100%
  );
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const RegisterCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.extraLarge};
  box-shadow: ${props => props.theme.shadows.extraLarge};
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  border: 1px solid ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: ${props => props.theme.borderRadius.large};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: ${props => props.theme.borderRadius.large};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const LogoText = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &:disabled {
    background: ${props => props.theme.colors.gray100};
    cursor: not-allowed;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
  display: flex;
  align-items: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.875rem;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const ErrorMessage = styled.span`
  color: ${props => props.theme.colors.error};
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
`;

const PasswordStrengthBar = styled.div`
  height: 4px;
  background: ${props => props.theme.colors.gray200};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
`;

const PasswordStrengthFill = styled.div`
  height: 100%;
  background: ${props => {
    switch (props.strength) {
      case 1: return props.theme.colors.error;
      case 2: return props.theme.colors.warning;
      case 3: return props.theme.colors.info;
      case 4: return props.theme.colors.success;
      default: return props.theme.colors.gray200;
    }
  }};
  width: ${props => (props.strength / 4) * 100}%;
  transition: all 0.3s ease;
`;

const PasswordStrengthText = styled.span`
  font-size: 0.75rem;
  color: ${props => {
    switch (props.strength) {
      case 1: return props.theme.colors.error;
      case 2: return props.theme.colors.warning;
      case 3: return props.theme.colors.info;
      case 4: return props.theme.colors.success;
      default: return props.theme.colors.textMuted;
    }
  }};
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryDark});
  color: white;
  border: none;
  padding: 1rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.medium};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const FooterText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primaryDark};
    text-decoration: underline;
  }
`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 1: return 'Слабый';
      case 2: return 'Средний';
      case 3: return 'Хороший';
      case 4: return 'Отличный';
      default: return 'Слишком короткий';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очистка ошибок при изменении поля
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    clearError();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Введите имя пользователя';
    } else if (formData.username.length < 3) {
      errors.username = 'Имя пользователя должно содержать минимум 3 символа';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Имя пользователя может содержать только буквы, цифры и подчеркивания';
    }

    if (!formData.email.trim()) {
      errors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      errors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Пароль должен содержать строчные и заглавные буквы, а также цифры';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (formData.firstName && formData.firstName.length > 50) {
      errors.firstName = 'Имя не должно превышать 50 символов';
    }

    if (formData.lastName && formData.lastName.length > 50) {
      errors.lastName = 'Фамилия не должна превышать 50 символов';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined
    });
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  return (
    <RegisterContainer>
      <RegisterCard>
        <Header>
          <Logo>
            <LogoIcon>
              <FiTarget size={24} />
            </LogoIcon>
            <LogoText>UX/UI Lab</LogoText>
          </Logo>
          <Subtitle>Создайте новый аккаунт</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="firstName">Имя</Label>
              <InputContainer>
                <InputIcon>
                  <FiUser size={18} />
                </InputIcon>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={formErrors.firstName}
                  disabled={loading}
                />
              </InputContainer>
              {formErrors.firstName && <ErrorMessage>{formErrors.firstName}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="lastName">Фамилия</Label>
              <InputContainer>
                <InputIcon>
                  <FiUser size={18} />
                </InputIcon>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Ваша фамилия"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={formErrors.lastName}
                  disabled={loading}
                />
              </InputContainer>
              {formErrors.lastName && <ErrorMessage>{formErrors.lastName}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="username">Имя пользователя *</Label>
            <InputContainer>
              <InputIcon>
                <FiUser size={18} />
              </InputIcon>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                error={formErrors.username}
                disabled={loading}
                autoComplete="username"
              />
            </InputContainer>
            {formErrors.username && <ErrorMessage>{formErrors.username}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email *</Label>
            <InputContainer>
              <InputIcon>
                <FiMail size={18} />
              </InputIcon>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
                disabled={loading}
                autoComplete="email"
              />
            </InputContainer>
            {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Пароль *</Label>
            <InputContainer>
              <InputIcon>
                <FiLock size={18} />
              </InputIcon>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Придумайте пароль"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
                disabled={loading}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </PasswordToggle>
            </InputContainer>
            {formData.password && (
              <PasswordStrength>
                <PasswordStrengthBar>
                  <PasswordStrengthFill strength={passwordStrength} />
                </PasswordStrengthBar>
                <PasswordStrengthText strength={passwordStrength}>
                  {getPasswordStrengthText(passwordStrength)}
                </PasswordStrengthText>
              </PasswordStrength>
            )}
            {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Подтверждение пароля *</Label>
            <InputContainer>
              <InputIcon>
                <FiLock size={18} />
              </InputIcon>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formErrors.confirmPassword}
                disabled={loading}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </PasswordToggle>
            </InputContainer>
            {formErrors.confirmPassword && <ErrorMessage>{formErrors.confirmPassword}</ErrorMessage>}
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <LoadingSpinner size="small" text="" />
            ) : (
              <>
                Зарегистрироваться
                <FiArrowRight size={18} />
              </>
            )}
          </SubmitButton>
        </Form>

        <Footer>
          <FooterText>
            Уже есть аккаунт?{' '}
            <FooterLink to="/login">
              Войти
            </FooterLink>
          </FooterText>
        </Footer>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage; 