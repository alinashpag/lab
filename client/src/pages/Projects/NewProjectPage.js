import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiArrowLeft, 
  FiGlobe, 
  FiFigma, 
  FiImage, 
  FiUpload,
  FiCheck,
  FiTarget,
  FiSettings,
  FiPlay
} from 'react-icons/fi';

const NewProjectContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;

  @media (max-width: 640px) {
    margin-bottom: 2rem;
  }
`;

const StepsIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textMuted};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 0.875rem;
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  color: ${props => props.active ? 'white' : props.theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
`;

const StepSeparator = styled.div`
  width: 2rem;
  height: 1px;
  background: ${props => props.theme.colors.border};
`;

const FormContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
`;

const ProjectTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ProjectTypeCard = styled.div`
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? props.theme.colors.primary + '05' : 'transparent'};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const ProjectTypeIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const ProjectTypeName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const ProjectTypeDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
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
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.background};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}05;
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: ${props => props.theme.colors.textMuted};
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`;

const UploadHint = styled.p`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.875rem;
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}05;
  }
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: ${props => props.theme.colors.primary};
`;

const CheckboxText = styled.div`
  flex: 1;
`;

const CheckboxTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const CheckboxDescription = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.colors.border};

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.875rem 2rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  &.secondary {
    background: transparent;
    border: 1px solid ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.textSecondary};

    &:hover {
      border-color: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.primary};
    }
  }

  &.primary {
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryDark});
    border: none;
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.shadows.medium};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
`;

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectType: '',
    websiteUrl: '',
    figmaUrl: '',
    analysisTypes: []
  });

  const projectTypes = [
    {
      id: 'website',
      name: 'Веб-сайт',
      description: 'Анализ существующего веб-сайта по URL',
      icon: FiGlobe
    },
    {
      id: 'figma',
      name: 'Figma проект',
      description: 'Анализ дизайна из Figma файла',
      icon: FiFigma
    },
    {
      id: 'images',
      name: 'Изображения',
      description: 'Загрузка скриншотов интерфейса',
      icon: FiImage
    }
  ];

  const analysisTypes = [
    {
      id: 'accessibility',
      name: 'Доступность',
      description: 'Проверка соответствия WCAG 2.1'
    },
    {
      id: 'usability',
      name: 'Юзабилити',
      description: 'Анализ удобства использования'
    },
    {
      id: 'performance',
      name: 'Производительность',
      description: 'Скорость загрузки и оптимизация'
    },
    {
      id: 'contrast',
      name: 'Контрастность',
      description: 'Проверка цветовых контрастов'
    },
    {
      id: 'typography',
      name: 'Типографика',
      description: 'Анализ шрифтов и читаемости'
    },
    {
      id: 'responsive',
      name: 'Адаптивность',
      description: 'Проверка мобильной версии'
    }
  ];

  const handleProjectTypeSelect = (typeId) => {
    setFormData({ ...formData, projectType: typeId });
  };

  const handleAnalysisTypeToggle = (typeId) => {
    const newTypes = formData.analysisTypes.includes(typeId)
      ? formData.analysisTypes.filter(id => id !== typeId)
      : [...formData.analysisTypes, typeId];
    
    setFormData({ ...formData, analysisTypes: newTypes });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.name && formData.projectType;
    }
    if (currentStep === 2) {
      if (formData.projectType === 'website') {
        return formData.websiteUrl;
      }
      if (formData.projectType === 'figma') {
        return formData.figmaUrl;
      }
      return true; // для images
    }
    if (currentStep === 3) {
      return formData.analysisTypes.length > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/projects');
    }
  };

  const handleSubmit = () => {
    if (canProceed()) {
      console.log('Создание проекта:', formData);
      // Здесь будет API вызов
      navigate('/projects');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <SectionTitle>Основная информация</SectionTitle>
            
            <FormGroup>
              <Label htmlFor="name">Название проекта *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Введите название проекта"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Краткое описание проекта (необязательно)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </FormGroup>

            <Label>Тип проекта *</Label>
            <ProjectTypeGrid>
              {projectTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <ProjectTypeCard
                    key={type.id}
                    selected={formData.projectType === type.id}
                    onClick={() => handleProjectTypeSelect(type.id)}
                  >
                    <ProjectTypeIcon>
                      <IconComponent size={24} />
                    </ProjectTypeIcon>
                    <ProjectTypeName>{type.name}</ProjectTypeName>
                    <ProjectTypeDescription>{type.description}</ProjectTypeDescription>
                  </ProjectTypeCard>
                );
              })}
            </ProjectTypeGrid>
          </>
        );

      case 2:
        return (
          <>
            <SectionTitle>
              {formData.projectType === 'website' && 'URL веб-сайта'}
              {formData.projectType === 'figma' && 'Ссылка на Figma'}
              {formData.projectType === 'images' && 'Загрузка изображений'}
            </SectionTitle>

            {formData.projectType === 'website' && (
              <FormGroup>
                <Label htmlFor="websiteUrl">URL веб-сайта *</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                />
              </FormGroup>
            )}

            {formData.projectType === 'figma' && (
              <FormGroup>
                <Label htmlFor="figmaUrl">Ссылка на Figma файл *</Label>
                <Input
                  id="figmaUrl"
                  type="url"
                  placeholder="https://figma.com/file/..."
                  value={formData.figmaUrl}
                  onChange={(e) => handleInputChange('figmaUrl', e.target.value)}
                />
              </FormGroup>
            )}

            {formData.projectType === 'images' && (
              <FileUploadArea>
                <UploadIcon>
                  <FiUpload />
                </UploadIcon>
                <UploadText>Перетащите изображения сюда или нажмите для выбора</UploadText>
                <UploadHint>Поддерживаются форматы: JPG, PNG, GIF (до 10 МБ)</UploadHint>
              </FileUploadArea>
            )}
          </>
        );

      case 3:
        return (
          <>
            <SectionTitle>Типы анализа</SectionTitle>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Выберите виды анализа, которые нужно выполнить для проекта
            </p>

            <CheckboxGroup>
              {analysisTypes.map((type) => (
                <CheckboxItem key={type.id}>
                  <Checkbox
                    type="checkbox"
                    checked={formData.analysisTypes.includes(type.id)}
                    onChange={() => handleAnalysisTypeToggle(type.id)}
                  />
                  <CheckboxText>
                    <CheckboxTitle>{type.name}</CheckboxTitle>
                    <CheckboxDescription>{type.description}</CheckboxDescription>
                  </CheckboxText>
                </CheckboxItem>
              ))}
            </CheckboxGroup>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <NewProjectContainer>
      <Header>
        <BackButton onClick={handleBack}>
          <FiArrowLeft size={16} />
          {currentStep === 1 ? 'К проектам' : 'Назад'}
        </BackButton>
        <Title>Создание нового проекта</Title>
        <Subtitle>Настройте параметры анализа UX/UI</Subtitle>
      </Header>

      <StepsContainer>
        <StepsIndicator>
          <Step active={currentStep >= 1}>
            <StepNumber active={currentStep >= 1}>
              {currentStep > 1 ? <FiCheck size={14} /> : '1'}
            </StepNumber>
            Основное
          </Step>
          <StepSeparator />
          <Step active={currentStep >= 2}>
            <StepNumber active={currentStep >= 2}>
              {currentStep > 2 ? <FiCheck size={14} /> : '2'}
            </StepNumber>
            Источник
          </Step>
          <StepSeparator />
          <Step active={currentStep >= 3}>
            <StepNumber active={currentStep >= 3}>3</StepNumber>
            Анализ
          </Step>
        </StepsIndicator>
      </StepsContainer>

      <FormContainer>
        {renderStepContent()}

        <ButtonGroup>
          <Button className="secondary" onClick={handleBack}>
            {currentStep === 1 ? 'Отменить' : 'Назад'}
          </Button>
          
          {currentStep < 3 ? (
            <Button 
              className="primary" 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Далее
              <FiTarget size={16} />
            </Button>
          ) : (
            <Button 
              className="primary" 
              onClick={handleSubmit}
              disabled={!canProceed()}
            >
              <FiPlay size={16} />
              Создать и запустить анализ
            </Button>
          )}
        </ButtonGroup>
      </FormContainer>
    </NewProjectContainer>
  );
};

export default NewProjectPage; 