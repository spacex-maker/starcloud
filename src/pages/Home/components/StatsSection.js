import React from 'react';
import { Row, Col, Statistic } from 'antd';
import styled from 'styled-components';
import { ContentWrapper, Section } from '../styles';

const StatsContainer = styled(Section)`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(180deg, #1a365d 0%, #2d3748 100%)' 
    : 'linear-gradient(180deg, #ebf8ff 0%, #e6fffa 100%)'};
`;

const StatsSection = () => {
  return (
    <StatsContainer>
      <ContentWrapper>
        <Row gutter={[48, 24]} justify="center">
          <Col xs={12} sm={6}>
            <Statistic title="注册用户" value={100000} suffix="+" />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="文件存储量" value={500} suffix="TB+" />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="正常运行时间" value={99.9} suffix="%" />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="每日上传文件" value={1000000} suffix="+" />
          </Col>
        </Row>
      </ContentWrapper>
    </StatsContainer>
  );
};

export default StatsSection; 