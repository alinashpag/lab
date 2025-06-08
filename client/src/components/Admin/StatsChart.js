import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ChartContainer = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
`;

const ChartHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
  margin: 0;
`;

const ChartTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ChartTab = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.textMuted};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
    color: ${props => props.active ? 'white' : props.theme.colors.text};
  }
`;

const StatsChart = ({ data }) => {
  const [activeTab, setActiveTab] = React.useState('users');

  // Заглушка данных для демонстрации
  const mockData = {
    users: [
      { name: 'Янв', value: 12 },
      { name: 'Фев', value: 19 },
      { name: 'Мар', value: 15 },
      { name: 'Апр', value: 25 },
      { name: 'Май', value: 22 },
      { name: 'Июн', value: 30 },
      { name: 'Июл', value: 28 }
    ],
    projects: [
      { name: 'Янв', value: 8 },
      { name: 'Фев', value: 12 },
      { name: 'Мар', value: 10 },
      { name: 'Апр', value: 15 },
      { name: 'Май', value: 18 },
      { name: 'Июн', value: 20 },
      { name: 'Июл', value: 25 }
    ],
    analyses: [
      { name: 'Янв', value: 45 },
      { name: 'Фев', value: 52 },
      { name: 'Мар', value: 38 },
      { name: 'Апр', value: 61 },
      { name: 'Май', value: 55 },
      { name: 'Июн', value: 67 },
      { name: 'Июл', value: 73 }
    ]
  };

  const chartData = data?.[activeTab] || mockData[activeTab];

  const getChartColor = (tab) => {
    switch (tab) {
      case 'users': return '#4F46E5';
      case 'projects': return '#059669';
      case 'analyses': return '#DC2626';
      default: return '#4F46E5';
    }
  };

  const getChartTitle = (tab) => {
    switch (tab) {
      case 'users': return 'Регистрация пользователей';
      case 'projects': return 'Создание проектов';
      case 'analyses': return 'Запуск анализов';
      default: return 'Статистика';
    }
  };

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>{getChartTitle(activeTab)}</ChartTitle>
        <ChartSubtitle>Динамика за последние 7 месяцев</ChartSubtitle>
      </ChartHeader>

      <ChartTabs>
        <ChartTab 
          active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </ChartTab>
        <ChartTab 
          active={activeTab === 'projects'} 
          onClick={() => setActiveTab('projects')}
        >
          Проекты
        </ChartTab>
        <ChartTab 
          active={activeTab === 'analyses'} 
          onClick={() => setActiveTab('analyses')}
        >
          Анализы
        </ChartTab>
      </ChartTabs>

      <ResponsiveContainer width="100%" height={300}>
        {activeTab === 'analyses' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill={getChartColor(activeTab)}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getChartColor(activeTab)}
              strokeWidth={3}
              dot={{ fill: getChartColor(activeTab), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default StatsChart; 