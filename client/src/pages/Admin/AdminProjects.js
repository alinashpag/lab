import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiGlobe, FiFigma, FiSmartphone, FiMonitor, FiFolder, FiUser, FiCalendar, FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
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

const HeaderInfo = styled.div``;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textMuted};
  font-size: 1rem;
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const ProjectCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const ProjectTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`;

const ProjectDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectTypeIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-left: 1rem;
`;

const ProjectMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
`;

const MetaIcon = styled.div`
  color: ${props => props.theme.colors.textMuted};
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#059669';
      case 'archived': return '#D97706';
      case 'deleted': return '#DC2626';
      default: return '#6B7280';
    }
  }}20;
  color: ${props => {
    switch (props.status) {
      case 'active': return '#059669';
      case 'archived': return '#D97706';
      case 'deleted': return '#DC2626';
      default: return '#6B7280';
    }
  }};
`;

const ProjectStats = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  margin-top: 0.25rem;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  background: ${props => props.variant === 'danger' ? '#dc3545' : '#6c757d'};
  color: white;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface || props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textMuted};
  padding: 0.5rem;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${props => props.variant === 'primary' ? props.theme.colors.primary : '#6c757d'};
  color: white;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textMuted};
`;

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website_url: '',
    project_type: 'website',
    user_id: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/projects?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Ошибка загрузки проектов:', err);
      setError(err.message || 'Неизвестная ошибка загрузки проектов');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
    }
  };

  const handleOpenModal = (project = null) => {
    setEditingProject(project);
    setFormData({
      name: project?.name || '',
      description: project?.description || '',
      website_url: project?.websiteUrl || '',
      project_type: project?.projectType || 'website',
      user_id: project?.user_id || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      website_url: '',
      project_type: 'website',
      user_id: ''
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const url = editingProject 
        ? `/api/admin/projects/${editingProject.id}`
        : '/api/admin/projects';
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Ошибка при сохранении');
      }

      await loadProjects();
      handleCloseModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот проект? Все связанные анализы и отчеты также будут удалены.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Ошибка при удалении');
      }

      await loadProjects();
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'website': return <FiGlobe />;
      case 'figma': return <FiFigma />;
      case 'mobile': return <FiSmartphone />;
      case 'app': return <FiMonitor />;
      default: return <FiFolder />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'website': return '#059669';
      case 'figma': return '#F24E1E';
      case 'mobile': return '#7C3AED';
      case 'app': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'archived': return 'Архивирован';
      case 'deleted': return 'Удален';
      default: return 'Неизвестно';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <h2>Ошибка загрузки данных</h2>
          <p>{error}</p>
          <button onClick={loadProjects}>Попробовать снова</button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderInfo>
          <Title>
            <FiFolder />
            Управление проектами
          </Title>
          <Subtitle>Обзор всех проектов в системе</Subtitle>
        </HeaderInfo>
        <AddButton onClick={() => handleOpenModal()}>
          <FiPlus />
          Добавить проект
        </AddButton>
      </Header>

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      <ProjectsGrid>
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id}>
              <ProjectHeader>
                <ProjectInfo>
                  <ProjectTitle>{project.name}</ProjectTitle>
                  <ProjectDescription>
                    {project.description || 'Описание отсутствует'}
                  </ProjectDescription>
                </ProjectInfo>
                <ProjectTypeIcon color={getTypeColor(project.projectType || project.project_type)}>
                  {getTypeIcon(project.projectType || project.project_type)}
                </ProjectTypeIcon>
              </ProjectHeader>

              <ProjectMeta>
                <MetaItem>
                  <MetaIcon>
                    <FiUser />
                  </MetaIcon>
                  {project.user?.name || project.username || 'Неизвестный автор'}
                </MetaItem>
                
                <MetaItem>
                  <MetaIcon>
                    <FiCalendar />
                  </MetaIcon>
                  {formatDate(project.createdAt || project.created_at)}
                </MetaItem>

                <StatusBadge status={project.status}>
                  {getStatusText(project.status)}
                </StatusBadge>

                {project.websiteUrl && (
                  <MetaItem>
                    <MetaIcon>
                      <FiGlobe />
                    </MetaIcon>
                    <a 
                      href={project.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      Открыть сайт
                    </a>
                  </MetaItem>
                )}
              </ProjectMeta>

              <ProjectStats>
                <StatItem>
                  <StatValue>{project.analysisCount || project.analysis_count || 0}</StatValue>
                  <StatLabel>Анализов</StatLabel>
                </StatItem>
                
                <StatItem>
                  <StatValue>{project.reportCount || project.report_count || 0}</StatValue>
                  <StatLabel>Отчетов</StatLabel>
                </StatItem>
                
                <StatItem>
                  <StatValue>
                    {project.projectType || project.project_type || 'unknown'}
                  </StatValue>
                  <StatLabel>Тип</StatLabel>
                </StatItem>
              </ProjectStats>

              <ProjectActions>
                <ActionButton onClick={() => handleOpenModal(project)}>
                  <FiEdit2 size={14} />
                  Редактировать
                </ActionButton>
                <ActionButton 
                  variant="danger" 
                  onClick={() => handleDelete(project.id)}
                >
                  <FiTrash2 size={14} />
                  Удалить
                </ActionButton>
              </ProjectActions>
            </ProjectCard>
          ))
        ) : (
          <EmptyMessage>
            <FiFolder size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Проекты не найдены</h3>
            <p>В системе пока нет созданных проектов</p>
          </EmptyMessage>
        )}
      </ProjectsGrid>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingProject ? 'Редактировать проект' : 'Добавить проект'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            {formError && (
              <ErrorMessage>{formError}</ErrorMessage>
            )}

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Название проекта</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Описание</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>URL сайта</Label>
                <Input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Тип проекта</Label>
                <Select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                >
                  <option value="website">Веб-сайт</option>
                  <option value="figma">Figma дизайн</option>
                  <option value="mobile">Мобильное приложение</option>
                  <option value="app">Веб-приложение</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Владелец проекта</Label>
                <Select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  required
                >
                  <option value="">Выберите пользователя</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormActions>
                <Button type="button" onClick={handleCloseModal}>
                  Отмена
                </Button>
                <Button type="submit" variant="primary" disabled={formLoading}>
                  {formLoading ? 'Сохранение...' : (editingProject ? 'Обновить' : 'Создать')}
                </Button>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AdminProjects; 