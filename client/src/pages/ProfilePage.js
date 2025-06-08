import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  FiUser, FiMail, FiCalendar, FiEdit3, FiSave,
  FiCamera, FiBarChart2, FiTrendingUp, FiAward,
  FiShield, FiLock, FiEye, FiEyeOff, FiCheck,
  FiX, FiRefreshCw, FiSettings
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  text-align: center;
  height: fit-content;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  margin: 0 auto 1rem;
  position: relative;
  overflow: hidden;
`;

const AvatarUpload = styled.input`
  display: none;
`;

const AvatarButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: ${props => props.theme.colors.primary};
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: scale(1.1);
  }
`;

const UserName = styled.h2`
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
`;

const UserEmail = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
`;

const UserRole = styled.div`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 1.5rem;
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' 
    ? `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primaryDark})`
    : props.variant === 'success'
    ? `linear-gradient(135deg, ${props.theme.colors.success}, ${props.theme.colors.success}dd)`
    : props.variant === 'danger'
    ? `linear-gradient(135deg, ${props.theme.colors.error}, ${props.theme.colors.error}dd)`
    : props.theme.colors.surface};
  color: ${props => ['primary', 'success', 'danger'].includes(props.variant)
    ? 'white' 
    : props.theme.colors.text};
  border: ${props => ['primary', 'success', 'danger'].includes(props.variant)
    ? 'none'
    : `1px solid ${props.theme.colors.border}`};
  padding: 0.75rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.medium};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  font-size: 0.875rem;
`;

const Input = styled.input`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 0.25rem;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 1.5rem;
  text-align: center;
`;

const StatIcon = styled.div`
  background: ${props => props.color + '20'};
  color: ${props => props.color};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatText = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background: ${props => props.theme.colors.success}20;
  color: ${props => props.theme.colors.success};
  padding: 1rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}20;
  color: ${props => props.theme.colors.error};
  padding: 1rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProfilePage = () => {
  const { user, updateUser, changePassword } = useAuth();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    projects: 0,
    analyses: 0,
    reports: 0,
    joinDate: null
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    company: '',
    position: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Загрузка данных профиля
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        company: user.company || '',
        position: user.position || '',
        phone: user.phone || ''
      });
      
      // Загрузка статистики
      const loadStatsForUser = async () => {
        try {
          const token = localStorage.getItem('uxui_lab_token');
          const [projectsResponse, analysesResponse, reportsResponse] = await Promise.all([
            fetch('/api/projects?limit=1000', {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('/api/analysis?limit=1000', {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('/api/reports?limit=1000', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);

          const [projectsData, analysesData, reportsData] = await Promise.all([
            projectsResponse.json(),
            analysesResponse.json(),
            reportsResponse.json()
          ]);

          setStats({
            projects: projectsData.pagination?.total || 0,
            analyses: analysesData.pagination?.total || 0,
            reports: reportsData.pagination?.total || 0,
            joinDate: user?.created_at
          });
        } catch (error) {
          // Ошибка загрузки статистики - игнорируем
        }
      };
      
      loadStatsForUser();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const result = await updateUser(formData);
      
      if (result.success) {
        setSuccessMessage('Профиль успешно обновлен');
        setEditMode(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'Ошибка обновления профиля');
      }
    } catch (error) {
      setErrorMessage('Произошла ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrorMessage('Пароли не совпадают');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setErrorMessage('Пароль должен содержать минимум 6 символов');
        return;
      }

      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (result.success) {
        setSuccessMessage('Пароль успешно изменен');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'Ошибка смены пароля');
      }
    } catch (error) {
      setErrorMessage('Произошла ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Container>
      <Header>
        <Title>Мой профиль</Title>
        <Button 
          variant="primary" 
          onClick={() => setEditMode(!editMode)}
          disabled={loading}
        >
          {editMode ? <FiX size={18} /> : <FiEdit3 size={18} />}
          {editMode ? 'Отменить' : 'Редактировать'}
        </Button>
      </Header>

      {successMessage && (
        <SuccessMessage>
          <FiCheck size={18} />
          {successMessage}
        </SuccessMessage>
      )}

      {errorMessage && (
        <ErrorMessage>
          <FiX size={18} />
          {errorMessage}
        </ErrorMessage>
      )}

      <ProfileContent>
        {/* Левая колонка - Карточка профиля */}
        <ProfileCard>
          <Avatar>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name?.charAt(0)?.toUpperCase() || 'U'
            )}
            <AvatarButton htmlFor="avatar-upload">
              <FiCamera size={16} />
            </AvatarButton>
            <AvatarUpload
              id="avatar-upload"
              type="file"
              accept="image/*"
              // onChange={handleAvatarUpload}
            />
          </Avatar>

          <UserName>{user.name || 'Пользователь'}</UserName>
          <UserEmail>{user.email}</UserEmail>
          <UserRole>
            <FiShield size={14} style={{ marginRight: '0.25rem' }} />
            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </UserRole>

          <UserStats>
            <StatItem>
              <StatValue>{stats.projects}</StatValue>
              <StatLabel>Проектов</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.analyses}</StatValue>
              <StatLabel>Анализов</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.reports}</StatValue>
              <StatLabel>Отчетов</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{formatDate(stats.joinDate)}</StatValue>
              <StatLabel>Дата регистрации</StatLabel>
            </StatItem>
          </UserStats>
        </ProfileCard>

        {/* Правая колонка - Информация и настройки */}
        <InfoSection>
          {/* Основная информация */}
          <Section>
            <SectionHeader>
              <SectionTitle>
                <FiUser size={20} />
                Основная информация
              </SectionTitle>
              {editMode && (
                <Button 
                  variant="success"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="small" /> : <FiSave size={16} />}
                  Сохранить
                </Button>
              )}
            </SectionHeader>

            <FormGrid>
              <FormGroup>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="Введите имя"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="Введите email"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="company">Компания</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="Введите название компании"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  name="position"
                  type="text"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="Введите должность"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="+7 (999) 123-45-67"
                />
              </FormGroup>

              <FormGroup style={{ gridColumn: '1 / -1' }}>
                <Label htmlFor="bio">О себе</Label>
                <TextArea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="Расскажите о себе..."
                />
              </FormGroup>
            </FormGrid>
          </Section>

          {/* Статистика активности */}
          <Section>
            <SectionHeader>
              <SectionTitle>
                <FiBarChart2 size={20} />
                Статистика активности
              </SectionTitle>
            </SectionHeader>

            <StatsGrid>
              <StatCard>
                <StatIcon color={theme.colors.primary}>
                  <FiUser size={20} />
                </StatIcon>
                <StatNumber>{stats.projects}</StatNumber>
                <StatText>Всего проектов</StatText>
              </StatCard>

              <StatCard>
                <StatIcon color={theme.colors.success}>
                  <FiBarChart2 size={20} />
                </StatIcon>
                <StatNumber>{stats.analyses}</StatNumber>
                <StatText>Выполнено анализов</StatText>
              </StatCard>

              <StatCard>
                <StatIcon color={theme.colors.warning}>
                  <FiTrendingUp size={20} />
                </StatIcon>
                <StatNumber>{stats.reports}</StatNumber>
                <StatText>Создано отчетов</StatText>
              </StatCard>

              <StatCard>
                <StatIcon color={theme.colors.info}>
                  <FiAward size={20} />
                </StatIcon>
                <StatNumber>
                  {user.created_at ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0}
                </StatNumber>
                <StatText>Дней с нами</StatText>
              </StatCard>
            </StatsGrid>
          </Section>

          {/* Безопасность */}
          <Section>
            <SectionHeader>
              <SectionTitle>
                <FiLock size={20} />
                Безопасность
              </SectionTitle>
              <Button 
                variant="success"
                onClick={handleChangePassword}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {loading ? <LoadingSpinner size="small" /> : <FiSave size={16} />}
                Изменить пароль
              </Button>
            </SectionHeader>

            <FormGrid>
              <FormGroup>
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <PasswordContainer>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Введите текущий пароль"
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </PasswordToggle>
                </PasswordContainer>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Введите новый пароль"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Подтвердите новый пароль"
                />
              </FormGroup>
            </FormGrid>
          </Section>
        </InfoSection>
      </ProfileContent>
    </Container>
  );
};

export default ProfilePage; 