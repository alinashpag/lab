import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiTarget, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const LoginContainer = styled.div`
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

const LoginCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.extraLarge};
  box-shadow: ${props => props.theme.shadows.extraLarge};
  padding: 3rem;
  width: 100%;
  max-width: 400px;
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

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: ${props => props.theme.colors.primary};
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
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

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      errors.username = 'Введите имя пользователя или email';
    }

    if (!formData.password) {
      errors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Header>
          <Logo>
            <LogoIcon>
              <FiTarget size={24} />
            </LogoIcon>
            <LogoText>UX/UI Lab</LogoText>
          </Logo>
          <Subtitle>Войдите в свой аккаунт</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Имя пользователя или Email</Label>
            <InputContainer>
              <InputIcon>
                <FiMail size={18} />
              </InputIcon>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username или email@example.com"
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
            <Label htmlFor="password">Пароль</Label>
            <InputContainer>
              <InputIcon>
                <FiLock size={18} />
              </InputIcon>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
                disabled={loading}
                autoComplete="current-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </PasswordToggle>
            </InputContainer>
            {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
          </FormGroup>

          <RememberMeContainer>
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
            />
            <CheckboxLabel htmlFor="rememberMe">
              Запомнить меня
            </CheckboxLabel>
          </RememberMeContainer>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <LoadingSpinner size="small" text="" />
            ) : (
              <>
                Войти
                <FiArrowRight size={18} />
              </>
            )}
          </SubmitButton>
        </Form>

        <Footer>
          <FooterText>
            Нет аккаунта?{' '}
            <FooterLink to="/register">
              Зарегистрироваться
            </FooterLink>
          </FooterText>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage; 