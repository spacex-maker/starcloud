import React from 'react';
import { Typography, Row, Col, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ContentWrapper, Section, PriceCard, StyledButton } from '../styles';
import GradientButton from 'components/buttons/GradientButton';

const { Title, Text } = Typography;

const plans = [
  {
    title: '基础版',
    price: '0',
    storage: '10GB',
    features: [
      '10GB 存储空间',
      '基础文件管理',
      '标准传输速度',
      '基础技术支持'
    ]
  },
  {
    title: '专业版',
    price: '29',
    storage: '100GB',
    popular: true,
    features: [
      '100GB 存储空间',
      '高级文件管理',
      '高速传输',
      '优先技术支持',
      '文件协作功能'
    ]
  },
  {
    title: '企业版',
    price: '99',
    storage: '1TB',
    features: [
      '1TB 存储空间',
      '企业级管理功能',
      '极速传输',
      '24/7专属支持',
      '高级协作功能',
      '自定义功能'
    ]
  }
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <Section>
      <ContentWrapper>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          价格方案
        </Title>
        <Row gutter={[24, 24]}>
          {plans.map((plan, index) => (
            <Col xs={24} sm={8} key={index}>
              <PriceCard popular={plan.popular}>
                <Title level={3}>{plan.title}</Title>
                <div className="price">
                  <span className="currency">¥</span>
                  {plan.price}
                  <span className="period">/月</span>
                </div>
                <List
                  dataSource={plan.features}
                  renderItem={item => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
                {plan.title === '企业版' ? (
                  <GradientButton
                    size="large"
                    style={{ marginTop: '24px', width: '100%' }}
                    onClick={() => navigate('/signup')}
                  >
                    开始使用
                  </GradientButton>
                ) : (
                  <StyledButton
                    type={plan.popular ? 'primary' : 'default'}
                    size="large"
                    style={{ marginTop: '24px', width: '100%' }}
                    onClick={() => navigate('/signup')}
                  >
                    开始使用
                  </StyledButton>
                )}
              </PriceCard>
            </Col>
          ))}
        </Row>
      </ContentWrapper>
    </Section>
  );
};

export default PricingSection; 