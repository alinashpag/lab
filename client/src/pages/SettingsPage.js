import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  FiSettings, FiBell, FiShield,
  FiGlobe, FiEye, FiDatabase, FiDownload,
  FiTrash2, FiRefreshCw, FiSave, FiCheck,
  FiX, FiSliders
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 900px;
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SettingsContent = styled.div`
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
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
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

const SectionDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  font-size: 0.875rem;
  display: block;
  margin-bottom: 0.25rem;
`;

const SettingSubtext = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.4;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${props => props.theme.colors.primary};
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.border};
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const Select = styled.select`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.5rem 1rem;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Input = styled.input`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.5rem 1rem;
  color: ${props => props.theme.colors.text};
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
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

const ThemePreview = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ThemeOption = styled.div`
  width: 80px;
  height: 50px;
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.border};
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: scale(1.05);
  }
`;

const LightTheme = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #ffffff 50%, #f8fafc 50%);
`;

const DarkTheme = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1a202c 50%, #2d3748 50%);
`;

const AutoTheme = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #ffffff 50%, #1a202c 50%);
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

const DangerZone = styled.div`
  border: 1px solid ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 1.5rem;
  margin-top: 1rem;
`;

const DangerTitle = styled.h4`
  color: ${props => props.theme.colors.error};
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const { setTheme } = useThemeContext();
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [settings, setSettings] = useState({
    // Внешний вид
    theme: 'auto',
    
    // Уведомления
    emailNotifications: true,
    analysisCompleteNotifications: true,
    weeklyReports: false,
    marketingEmails: false,
    
    // Приватность
    profileVisibility: 'private',
    shareAnalytics: false,
    
    // Язык и регион
    language: 'ru',
    timezone: 'Europe/Moscow',
    dateFormat: 'dd.mm.yyyy',
    
    // Производительность
    autoSaveInterval: 300, // секунды
    maxFileSize: 10, // MB
    enableAnimations: true,
    
    // API настройки
    apiRateLimit: 100,
    webhookUrl: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/users/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data.settings
        }));
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setSuccessMessage('Настройки успешно сохранены');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Ошибка сохранения настроек');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Применяем изменения темы сразу
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const exportData = async () => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/users/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uxui-lab-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccessMessage('Данные успешно экспортированы');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Ошибка экспорта данных');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Вы уверены, что хотите удалить аккаунт? Это действие необратимо!'
    );
    
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'Все ваши данные будут безвозвратно удалены. Продолжить?'
    );
    
    if (!doubleConfirmed) return;

    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        logout();
      } else {
        throw new Error('Ошибка удаления аккаунта');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FiSettings size={28} />
          Настройки
        </Title>
        <Button 
          variant="primary" 
          onClick={saveSettings}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="small" /> : <FiSave size={16} />}
          Сохранить изменения
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

      <SettingsContent>
        {/* Внешний вид */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FiEye size={20} />
              Внешний вид
            </SectionTitle>
          </SectionHeader>
          <SectionDescription>
            Настройте интерфейс приложения под свои предпочтения
          </SectionDescription>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Тема интерфейса</SettingLabel>
                <SettingSubtext>Выберите цветовую схему интерфейса</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <option value="light">Светлая</option>
                  <option value="dark">Темная</option>
                  <option value="auto">Автоматически</option>
                </Select>
              </SettingControl>
            </SettingItem>

            <ThemePreview>
              <ThemeOption 
                selected={settings.theme === 'light'}
                onClick={() => handleSettingChange('theme', 'light')}
              >
                <LightTheme />
              </ThemeOption>
              <ThemeOption 
                selected={settings.theme === 'dark'}
                onClick={() => handleSettingChange('theme', 'dark')}
              >
                <DarkTheme />
              </ThemeOption>
              <ThemeOption 
                selected={settings.theme === 'auto'}
                onClick={() => handleSettingChange('theme', 'auto')}
              >
                <AutoTheme />
              </ThemeOption>
            </ThemePreview>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Анимации</SettingLabel>
                <SettingSubtext>Включить анимации интерфейса</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.enableAnimations}
                    onChange={(e) => handleSettingChange('enableAnimations', e.target.checked)}
                  />
                  <ToggleSlider />
                </Toggle>
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </Section>

        {/* Уведомления */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FiBell size={20} />
              Уведомления
            </SectionTitle>
          </SectionHeader>
          <SectionDescription>
            Управляйте уведомлениями и рассылками
          </SectionDescription>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Email уведомления</SettingLabel>
                <SettingSubtext>Получать важные уведомления на почту</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                  <ToggleSlider />
                </Toggle>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Завершение анализа</SettingLabel>
                <SettingSubtext>Уведомления о завершении анализа</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.analysisCompleteNotifications}
                    onChange={(e) => handleSettingChange('analysisCompleteNotifications', e.target.checked)}
                  />
                  <ToggleSlider />
                </Toggle>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Еженедельные отчеты</SettingLabel>
                <SettingSubtext>Получать сводку активности еженедельно</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.weeklyReports}
                    onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                  />
                  <ToggleSlider />
                </Toggle>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Маркетинговые рассылки</SettingLabel>
                <SettingSubtext>Получать информацию о новых функциях</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.marketingEmails}
                    onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                  />
                  <ToggleSlider />
                </Toggle>
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </Section>

        {/* Приватность */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FiShield size={20} />
              Приватность и безопасность
            </SectionTitle>
          </SectionHeader>
          <SectionDescription>
            Контролируйте видимость ваших данных и их использование
          </SectionDescription>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Видимость профиля</SettingLabel>
                <SettingSubtext>Кто может видеть ваш профиль</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.profileVisibility}
                  onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                >
                  <option value="public">Публичный</option>
                  <option value="team">Только команда</option>
                  <option value="private">Приватный</option>
                </Select>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Аналитика использования</SettingLabel>
                <SettingSubtext>Разрешить сбор анонимной аналитики</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.shareAnalytics}
                    onChange={(e) => handleSettingChange('shareAnalytics', e.target.checked)}
                  />
                  <ToggleSlider />
                </Toggle>
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </Section>

        {/* Язык и регион */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FiGlobe size={20} />
              Язык и регион
            </SectionTitle>
          </SectionHeader>
          <SectionDescription>
            Настройте локализацию и форматы отображения
          </SectionDescription>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Язык интерфейса</SettingLabel>
                <SettingSubtext>Язык отображения интерфейса</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </Select>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Часовой пояс</SettingLabel>
                <SettingSubtext>Временная зона для отображения дат</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                >
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/London">Лондон (UTC+0)</option>
                  <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                  <option value="Asia/Tokyo">Токио (UTC+9)</option>
                </Select>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Формат даты</SettingLabel>
                <SettingSubtext>Формат отображения дат</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                >
                  <option value="dd.mm.yyyy">ДД.ММ.ГГГГ</option>
                  <option value="mm/dd/yyyy">ММ/ДД/ГГГГ</option>
                  <option value="yyyy-mm-dd">ГГГГ-ММ-ДД</option>
                </Select>
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </Section>

        {/* Производительность */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FiSliders size={20} />
              Производительность
            </SectionTitle>
          </SectionHeader>
          <SectionDescription>
            Настройки производительности и ограничений
          </SectionDescription>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Автосохранение (секунды)</SettingLabel>
                <SettingSubtext>Интервал автоматического сохранения</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Input
                  type="number"
                  min="60"
                  max="3600"
                  value={settings.autoSaveInterval}
                  onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Максимальный размер файла (MB)</SettingLabel>
                <SettingSubtext>Лимит размера загружаемых файлов</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                />
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </Section>

        {/* Данные и экспорт */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FiDatabase size={20} />
              Данные и экспорт
            </SectionTitle>
          </SectionHeader>
          <SectionDescription>
            Управление вашими данными
          </SectionDescription>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Экспорт данных</SettingLabel>
                <SettingSubtext>Скачать все ваши данные в формате JSON</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Button onClick={exportData}>
                  <FiDownload size={16} />
                  Экспортировать
                </Button>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Очистка кэша</SettingLabel>
                <SettingSubtext>Очистить локальные данные браузера</SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Button onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}>
                  <FiRefreshCw size={16} />
                  Очистить кэш
                </Button>
              </SettingControl>
            </SettingItem>
          </SettingGroup>

          <DangerZone>
            <DangerTitle>Опасная зона</DangerTitle>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Удаление аккаунта</SettingLabel>
                <SettingSubtext>
                  Безвозвратно удалить ваш аккаунт и все связанные данные
                </SettingSubtext>
              </SettingInfo>
              <SettingControl>
                <Button variant="danger" onClick={deleteAccount}>
                  <FiTrash2 size={16} />
                  Удалить аккаунт
                </Button>
              </SettingControl>
            </SettingItem>
          </DangerZone>
        </Section>
      </SettingsContent>
    </Container>
  );
};

export default SettingsPage;