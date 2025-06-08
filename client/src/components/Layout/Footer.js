import React from 'react';
import styled from 'styled-components';
import { FiHeart, FiGithub, FiMail, FiExternalLink } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: 1.5rem 2rem;
  margin-top: auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Copyright = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeartIcon = styled(FiHeart)`
  color: ${props => props.theme.colors.error};
  animation: heartbeat 1.5s ease-in-out infinite;

  @keyframes heartbeat {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const Version = styled.span`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.75rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 640px) {
    gap: 1rem;
  }
`;

const FooterLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 640px) {
    span {
      display: none;
    }
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background: ${props => props.theme.colors.border};

  @media (max-width: 640px) {
    display: none;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.75rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.status === 'online' ? props.theme.colors.success : props.theme.colors.warning};
  animation: ${props => props.status === 'online' ? 'pulse' : 'none'} 2s infinite;

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = process.env.REACT_APP_VERSION || '1.0.0';
  const buildDate = process.env.REACT_APP_BUILD_DATE || new Date().toLocaleDateString();

  return (
    <FooterContainer>
      <FooterContent>
        <LeftSection>
          <Copyright>
            © {currentYear} UX/UI Lab. Создано с <HeartIcon size={14} /> для лучшего UX
          </Copyright>
          <Version>
            Версия {appVersion} • Сборка от {buildDate}
          </Version>
        </LeftSection>

        <RightSection>
          <FooterLinks>
            <FooterLink 
              href="https://github.com/uxui-lab" 
              target="_blank" 
              rel="noopener noreferrer"
              title="GitHub репозиторий"
            >
              <FiGithub size={16} />
              <span>GitHub</span>
            </FooterLink>

            <Divider />

            <FooterLink 
              href="mailto:support@uxuilab.com"
              title="Написать в поддержку"
            >
              <FiMail size={16} />
              <span>Поддержка</span>
            </FooterLink>

            <Divider />

            <FooterLink 
              href="/docs" 
              target="_blank"
              title="Документация"
            >
              <FiExternalLink size={16} />
              <span>Документация</span>
            </FooterLink>
          </FooterLinks>

          <StatusIndicator>
            <StatusDot status="online" />
            <span>Все системы работают</span>
          </StatusIndicator>
        </RightSection>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 