import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiTarget, 
  FiGlobe, 
  FiFigma,
  FiImage,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiBarChart2
} from 'react-icons/fi';

const ProjectsContainer = styled.div`
  padding: 0;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
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

const SearchIcon = styled.div`
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textMuted};
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryDark});
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.active ? props.theme.colors.primary + '15' : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProjectCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProjectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProjectName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProjectType = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: ${props => {
    switch (props.type) {
      case 'website': return props.theme.colors.primary + '15';
      case 'figma': return props.theme.colors.secondary + '15';
      case 'images': return props.theme.colors.info + '15';
      default: return props.theme.colors.gray200;
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'website': return props.theme.colors.primary;
      case 'figma': return props.theme.colors.secondary;
      case 'images': return props.theme.colors.info;
      default: return props.theme.colors.textMuted;
    }
  }};
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.75rem;
  font-weight: 500;
`;

const ProjectActions = styled.div`
  position: relative;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.small};
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }
`;

const ProjectDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  margin-top: 0.25rem;
`;

const ProjectFooter = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FooterButton = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &.primary {
    background: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    color: white;

    &:hover {
      background: ${props => props.theme.colors.primaryDark};
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textMuted};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Мок данные для демонстрации
  const mockProjects = [
    {
      id: 1,
      name: 'E-commerce Dashboard',
      description: 'Анализ интерфейса административной панели для интернет-магазина',
      project_type: 'website',
      website_url: 'https://example-shop.com/admin',
      status: 'active',
      created_at: '2024-01-15',
      analyses_count: 3,
      issues_count: 12,
      score: 87
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      description: 'UX анализ мобильного приложения банка',
      project_type: 'figma',
      figma_url: 'https://figma.com/file/xyz',
      status: 'active',
      created_at: '2024-01-10',
      analyses_count: 5,
      issues_count: 8,
      score: 92
    },
    {
      id: 3,
      name: 'Landing Page Design',
      description: 'Анализ посадочной страницы продукта',
      project_type: 'images',
      status: 'completed',
      created_at: '2024-01-05',
      analyses_count: 2,
      issues_count: 15,
      score: 78
    }
  ];

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'website': return FiGlobe;
      case 'figma': return FiFigma;
      case 'images': return FiImage;
      default: return FiTarget;
    }
  };

  const getProjectTypeLabel = (type) => {
    switch (type) {
      case 'website': return 'Веб-сайт';
      case 'figma': return 'Figma';
      case 'images': return 'Изображения';
      default: return 'Проект';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || project.project_type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <ProjectsContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div>Загрузка проектов...</div>
        </div>
      </ProjectsContainer>
    );
  }

  return (
    <ProjectsContainer>
      <Header>
        <HeaderLeft>
          <Title>Проекты</Title>
          <Subtitle>Управляйте своими проектами UX/UI анализа</Subtitle>
        </HeaderLeft>
        
        <HeaderActions>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Поиск проектов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon>
              <FiSearch size={16} />
            </SearchIcon>
          </SearchContainer>
          
          <CreateButton to="/projects/new">
            <FiPlus size={18} />
            Новый проект
          </CreateButton>
        </HeaderActions>
      </Header>

      <FiltersBar>
        <FilterButton 
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          <FiFilter size={16} />
          Все проекты
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'website'}
          onClick={() => setActiveFilter('website')}
        >
          <FiGlobe size={16} />
          Веб-сайты
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'figma'}
          onClick={() => setActiveFilter('figma')}
        >
          <FiFigma size={16} />
          Figma
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'images'}
          onClick={() => setActiveFilter('images')}
        >
          <FiImage size={16} />
          Изображения
        </FilterButton>
      </FiltersBar>

      {filteredProjects.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FiTarget />
          </EmptyIcon>
          <h3>Проекты не найдены</h3>
          <p>Попробуйте изменить фильтры или создайте новый проект</p>
        </EmptyState>
      ) : (
        <ProjectsGrid>
          {filteredProjects.map((project) => {
            const TypeIcon = getProjectTypeIcon(project.project_type);
            
            return (
              <ProjectCard key={project.id}>
                <ProjectHeader>
                  <ProjectInfo>
                    <ProjectName>{project.name}</ProjectName>
                    <ProjectType type={project.project_type}>
                      <TypeIcon size={14} />
                      {getProjectTypeLabel(project.project_type)}
                    </ProjectType>
                  </ProjectInfo>
                  
                  <ProjectActions>
                    <ActionButton>
                      <FiMoreVertical size={16} />
                    </ActionButton>
                  </ProjectActions>
                </ProjectHeader>

                <ProjectDescription>
                  {project.description}
                </ProjectDescription>

                <ProjectStats>
                  <StatItem>
                    <StatValue>{project.analyses_count}</StatValue>
                    <StatLabel>Анализов</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{project.issues_count}</StatValue>
                    <StatLabel>Проблем</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{project.score}%</StatValue>
                    <StatLabel>Оценка</StatLabel>
                  </StatItem>
                </ProjectStats>

                <ProjectFooter>
                  <FooterButton>
                    <FiEdit3 size={14} />
                    Редактировать
                  </FooterButton>
                  <FooterButton className="primary">
                    <FiBarChart2 size={14} />
                    Анализ
                  </FooterButton>
                </ProjectFooter>
              </ProjectCard>
            );
          })}
        </ProjectsGrid>
      )}
    </ProjectsContainer>
  );
};

export default ProjectsPage; 