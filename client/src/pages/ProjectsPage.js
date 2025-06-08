import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiGrid, FiList, FiSearch, FiFileText,
  FiExternalLink, FiImage
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
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

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' 
    ? `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primaryDark})`
    : props.theme.colors.surface};
  color: ${props => props.variant === 'primary' 
    ? 'white' 
    : props.theme.colors.text};
  border: ${props => props.variant === 'primary' 
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

const Filters = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  color: ${props => props.theme.colors.text};
  min-width: 250px;
  position: relative;

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  z-index: 1;
`;

const Select = styled.select`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem 1rem;
  color: ${props => props.theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  overflow: hidden;
`;

const ViewButton = styled.button`
  background: ${props => props.active 
    ? props.theme.colors.primary 
    : 'transparent'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme.colors.text};
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active 
      ? props.theme.colors.primaryDark 
      : props.theme.colors.surfaceHover};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ProjectCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.large};
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProjectTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ProjectType = styled.span`
  background: ${props => {
    switch (props.type) {
      case 'website': return props.theme.colors.info + '20';
      case 'figma': return props.theme.colors.warning + '20';
      case 'screenshot': return props.theme.colors.success + '20';
      default: return props.theme.colors.textMuted + '20';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'website': return props.theme.colors.info;
      case 'figma': return props.theme.colors.warning;
      case 'screenshot': return props.theme.colors.success;
      default: return props.theme.colors.textMuted;
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ProjectDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ProjectStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  padding: 0.5rem;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  background: ${props => props.active 
    ? props.theme.colors.primary 
    : props.theme.colors.surface};
  color: ${props => props.active 
    ? 'white' 
    : props.theme.colors.text};
  border: 1px solid ${props => props.active 
    ? props.theme.colors.primary 
    : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.active 
      ? props.theme.colors.primaryDark 
      : props.theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
`;

// Модальное окно создания проекта
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
  z-index: ${props => props.theme.zIndex.modal};
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  width: 90%;
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
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.small};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem;
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem;
  color: ${props => props.theme.colors.text};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  text-align: center;
  margin: 2rem 0;
`;

const ProjectsPage = () => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Модальное окно
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'website',
    website_url: '',
    figma_url: ''
  });

  // Просмотр проекта
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Редактирование проекта
  const [showEditModal, setShowEditModal] = useState(false);

  // Состояние для просматриваемого проекта
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);

  // Загрузка проектов
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        status: statusFilter,
        ...(typeFilter && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error('Ошибка загрузки проектов');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Создание проекта
  const createProject = async (e) => {
    e.preventDefault();
    
    try {
      setCreateLoading(true);
      
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          project_type: 'website',
          website_url: '',
          figma_url: ''
        });
        loadProjects();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка создания проекта');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Удаление проекта
  const deleteProject = async (projectId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      return;
    }

    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadProjects();
      } else {
        throw new Error('Ошибка удаления проекта');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Получение иконки для типа проекта
  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'website': return <FiExternalLink size={14} />;
      case 'figma': return <FiFileText size={14} />;
      case 'screenshot': return <FiImage size={14} />;
      default: return <FiExternalLink size={14} />;
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Эффект для загрузки проектов
  useEffect(() => {
    const loadProjectsOnMount = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('uxui_lab_token');
        const url = new URL('/api/projects', window.location.origin);
        
        // Добавляем параметры запроса
        url.searchParams.append('page', currentPage.toString());
        url.searchParams.append('limit', '12');
        
        if (searchTerm) {
          url.searchParams.append('search', searchTerm);
        }
        
        if (typeFilter) {
          url.searchParams.append('type', typeFilter);
        }
        
        if (statusFilter) {
          url.searchParams.append('status', statusFilter);
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
          setTotalPages(data.pagination.totalPages);
        } else {
          throw new Error('Ошибка загрузки проектов');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadProjectsOnMount();
  }, [currentPage, searchTerm, typeFilter, statusFilter]);

  // Просмотр проекта
  const viewProject = async (projectId) => {
    try {
      setProjectLoading(true);
      setShowViewModal(true);
      setSelectedProjectId(projectId);

      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedProject(data.project);
      } else {
        throw new Error('Ошибка загрузки проекта');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setProjectLoading(false);
    }
  };

  // Редактирование проекта
  const editProject = (project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      project_type: project.project_type,
      website_url: project.website_url || '',
      figma_url: project.figma_url || ''
    });
    setSelectedProjectId(project.id);
    setShowEditModal(true);
  };

  // Обновление проекта
  const updateProject = async (e) => {
    e.preventDefault();
    
    try {
      setCreateLoading(true);
      
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedProjectId(null);
        setFormData({
          name: '',
          description: '',
          project_type: 'website',
          website_url: '',
          figma_url: ''
        });
        loadProjects();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка обновления проекта');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Мои проекты</Title>
        <Actions>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={18} />
            Новый проект
          </Button>
          <ViewToggle>
            <ViewButton 
              active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
            >
              <FiGrid size={18} />
            </ViewButton>
            <ViewButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              <FiList size={18} />
            </ViewButton>
          </ViewToggle>
        </Actions>
      </Header>

      <Filters>
        <SearchContainer>
          <SearchIcon>
            <FiSearch size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Поиск проектов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <Select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="active">Активные</option>
          <option value="archived">Архивированные</option>
          <option value="all">Все проекты</option>
        </Select>

        <Select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Все типы</option>
          <option value="website">Веб-сайты</option>
          <option value="figma">Figma</option>
          <option value="screenshot">Скриншоты</option>
        </Select>
      </Filters>

      {loading && <LoadingSpinner />}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && projects.length === 0 && (
        <EmptyState>
          <EmptyIcon>📁</EmptyIcon>
          <h3>Нет проектов</h3>
          <p>Создайте свой первый проект для анализа UX/UI</p>
        </EmptyState>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <Grid>
              {projects.map((project) => (
                <ProjectCard key={project.id}>
                  <ProjectHeader>
                    <div>
                      <ProjectTitle>{project.name}</ProjectTitle>
                      <ProjectType type={project.project_type}>
                        {getProjectTypeIcon(project.project_type)}
                        {project.project_type}
                      </ProjectType>
                    </div>
                    <ProjectActions>
                      <IconButton title="Просмотр" onClick={() => viewProject(project.id)}>
                        <FiEye size={16} />
                      </IconButton>
                      <IconButton title="Редактировать" onClick={() => editProject(project)}>
                        <FiEdit size={16} />
                      </IconButton>
                      <IconButton 
                        title="Удалить"
                        onClick={() => deleteProject(project.id)}
                      >
                        <FiTrash2 size={16} />
                      </IconButton>
                    </ProjectActions>
                  </ProjectHeader>

                  {project.description && (
                    <ProjectDescription>{project.description}</ProjectDescription>
                  )}

                  <ProjectMeta>
                    <ProjectStats>
                      <span>📊 {project.analysis_count || 0} анализов</span>
                      <span>📅 {formatDate(project.created_at)}</span>
                    </ProjectStats>
                  </ProjectMeta>
                </ProjectCard>
              ))}
            </Grid>
          ) : (
            <List>
              {projects.map((project) => (
                <ProjectCard key={project.id}>
                  <ProjectHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <ProjectTitle>{project.name}</ProjectTitle>
                      <ProjectType type={project.project_type}>
                        {getProjectTypeIcon(project.project_type)}
                        {project.project_type}
                      </ProjectType>
                    </div>
                    <ProjectActions>
                      <IconButton title="Просмотр" onClick={() => viewProject(project.id)}>
                        <FiEye size={16} />
                      </IconButton>
                      <IconButton title="Редактировать" onClick={() => editProject(project)}>
                        <FiEdit size={16} />
                      </IconButton>
                      <IconButton 
                        title="Удалить"
                        onClick={() => deleteProject(project.id)}
                      >
                        <FiTrash2 size={16} />
                      </IconButton>
                    </ProjectActions>
                  </ProjectHeader>
                  <ProjectMeta>
                    <ProjectStats>
                      <span>📊 {project.analysis_count || 0} анализов</span>
                      <span>📅 {formatDate(project.created_at)}</span>
                    </ProjectStats>
                  </ProjectMeta>
                </ProjectCard>
              ))}
            </List>
          )}

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Назад
              </PageButton>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 2
                )
                .map((page) => (
                  <PageButton
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PageButton>
                ))}

              <PageButton
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Вперед
              </PageButton>
            </Pagination>
          )}
        </>
      )}

      {/* Модальное окно создания проекта */}
      {showCreateModal && (
        <Modal onClick={(e) => {
          if (e.target === e.currentTarget) setShowCreateModal(false);
        }}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Создать новый проект</ModalTitle>
              <CloseButton onClick={() => setShowCreateModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            <form onSubmit={createProject}>
              <FormGroup>
                <Label htmlFor="name">Название проекта *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Мой новый проект"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Описание</Label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Краткое описание проекта..."
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="project_type">Тип проекта *</Label>
                <Select
                  id="project_type"
                  value={formData.project_type}
                  onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                  required
                >
                  <option value="website">Веб-сайт</option>
                  <option value="figma">Figma дизайн</option>
                  <option value="screenshot">Скриншоты</option>
                </Select>
              </FormGroup>

              {formData.project_type === 'website' && (
                <FormGroup>
                  <Label htmlFor="website_url">URL сайта</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://example.com"
                  />
                </FormGroup>
              )}

              {formData.project_type === 'figma' && (
                <FormGroup>
                  <Label htmlFor="figma_url">Ссылка на Figma</Label>
                  <Input
                    id="figma_url"
                    type="url"
                    value={formData.figma_url}
                    onChange={(e) => setFormData({...formData, figma_url: e.target.value})}
                    placeholder="https://www.figma.com/file/..."
                  />
                </FormGroup>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={createLoading}
                >
                  {createLoading ? <LoadingSpinner size="small" /> : 'Создать проект'}
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Модальное окно просмотра проекта */}
      {showViewModal && (
        <Modal onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowViewModal(false);
            setSelectedProject(null);
            setSelectedProjectId(null);
          }
        }}>
          <ModalContent style={{ maxWidth: '800px' }}>
            <ModalHeader>
              <ModalTitle>Просмотр проекта</ModalTitle>
              <CloseButton onClick={() => {
                setShowViewModal(false);
                setSelectedProject(null);
                setSelectedProjectId(null);
              }}>
                ✕
              </CloseButton>
            </ModalHeader>

            {projectLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <LoadingSpinner />
                <p>Загрузка данных проекта...</p>
              </div>
            ) : selectedProject ? (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                  }}>
                    {selectedProject.name}
                    <ProjectType type={selectedProject.project_type}>
                      {getProjectTypeIcon(selectedProject.project_type)}
                      {selectedProject.project_type}
                    </ProjectType>
                  </h3>
                  {selectedProject.description && (
                    <p style={{ 
                      color: '#6b7280', 
                      margin: '0.5rem 0' 
                    }}>
                      {selectedProject.description}
                    </p>
                  )}
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem', 
                  marginBottom: '1.5rem' 
                }}>
                  <div>
                    <strong>Дата создания:</strong>
                    <div>{formatDate(selectedProject.created_at)}</div>
                  </div>
                  <div>
                    <strong>Последнее обновление:</strong>
                    <div>{formatDate(selectedProject.updated_at)}</div>
                  </div>
                  <div>
                    <strong>Количество анализов:</strong>
                    <div>{selectedProject.analysis_count || 0}</div>
                  </div>
                  <div>
                    <strong>Завершенных анализов:</strong>
                    <div>{selectedProject.completed_analyses || 0}</div>
                  </div>
                </div>

                {(selectedProject.website_url || selectedProject.figma_url) && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <strong>Ссылки:</strong>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      marginTop: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {selectedProject.website_url && (
                        <a 
                          href={selectedProject.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#6366f1',
                            textDecoration: 'none',
                            fontSize: '0.875rem'
                          }}
                        >
                          <FiExternalLink size={14} />
                          Веб-сайт
                        </a>
                      )}
                      {selectedProject.figma_url && (
                        <a 
                          href={selectedProject.figma_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#6366f1',
                            textDecoration: 'none',
                            fontSize: '0.875rem'
                          }}
                        >
                          <FiFileText size={14} />
                          Figma
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {selectedProject.recentAnalyses && selectedProject.recentAnalyses.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <strong>Последние анализы:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      {selectedProject.recentAnalyses.slice(0, 3).map((analysis) => (
                        <div 
                          key={analysis.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0',
                            borderBottom: '1px solid #e5e7eb'
                          }}
                        >
                          <span style={{ fontSize: '0.875rem' }}>
                            {analysis.analysis_type || 'Полный анализ'} 
                          </span>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280' 
                          }}>
                            {formatDate(analysis.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'flex-end',
                  marginTop: '2rem' 
                }}>
                  <Button onClick={() => editProject(selectedProject)}>
                    <FiEdit size={16} />
                    Редактировать
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedProject(null);
                      setSelectedProjectId(null);
                    }}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Не удалось загрузить данные проекта</p>
              </div>
            )}
          </ModalContent>
        </Modal>
      )}

      {/* Модальное окно редактирования проекта */}
      {showEditModal && (
        <Modal onClick={(e) => {
          if (e.target === e.currentTarget) setShowEditModal(false);
        }}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Редактирование проекта</ModalTitle>
              <CloseButton onClick={() => setShowEditModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            <form onSubmit={updateProject}>
              <FormGroup>
                <Label htmlFor="name">Название проекта *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Мой новый проект"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Описание</Label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Краткое описание проекта..."
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="project_type">Тип проекта *</Label>
                <Select
                  id="project_type"
                  value={formData.project_type}
                  onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                  required
                >
                  <option value="website">Веб-сайт</option>
                  <option value="figma">Figma дизайн</option>
                  <option value="screenshot">Скриншоты</option>
                </Select>
              </FormGroup>

              {formData.project_type === 'website' && (
                <FormGroup>
                  <Label htmlFor="website_url">URL сайта</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://example.com"
                  />
                </FormGroup>
              )}

              {formData.project_type === 'figma' && (
                <FormGroup>
                  <Label htmlFor="figma_url">Ссылка на Figma</Label>
                  <Input
                    id="figma_url"
                    type="url"
                    value={formData.figma_url}
                    onChange={(e) => setFormData({...formData, figma_url: e.target.value})}
                    placeholder="https://www.figma.com/file/..."
                  />
                </FormGroup>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  disabled={createLoading}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={createLoading}
                >
                  {createLoading ? <LoadingSpinner size="small" /> : 'Сохранить изменения'}
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ProjectsPage; 