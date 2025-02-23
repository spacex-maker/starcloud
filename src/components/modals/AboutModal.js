import React from 'react';
import { Modal, Tabs, Table } from 'antd';
import styled from 'styled-components';
import {
  CloudServerOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const AboutContent = styled.div`
  color: ${props => props.theme.mode === 'dark' ? '#9CA3AF' : '#4B5563'};
  > * + * {
    margin-top: 1rem;
  }
`;

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 0;
`;

const PriceCard = styled.div`
  position: relative;
  border: 1px solid var(--ant-color-border);
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;

  ${props => props.popular && `
    border-color: var(--ant-color-primary);
    transform: translateY(-2px);
    box-shadow: 0 2px 12px rgba(24, 144, 255, 0.1);
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--ant-color-primary);
  color: #fff;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
`;

const PlanHeader = styled.div`
  padding: 1rem;
  text-align: center;
  background: var(--ant-color-bg-container);
`;

const PlanTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ant-color-text);
  margin: 0;
`;

const PlanSubtitle = styled.div`
  font-size: 0.75rem;
  color: var(--ant-color-text-secondary);
  margin-top: 0.25rem;
`;

const PlanPrice = styled.div`
  padding: 0.75rem 1rem;
  text-align: center;
  background: var(--ant-color-bg-container);
  border-bottom: 1px solid var(--ant-color-border);

  .amount {
    font-size: 2rem;
    font-weight: 700;
    color: var(--ant-color-primary);
    line-height: 1;
  }

  .currency {
    font-size: 1rem;
    color: var(--ant-color-primary);
    margin-right: 2px;
    vertical-align: super;
  }

  .period {
    font-size: 0.75rem;
    color: var(--ant-color-text-secondary);
    margin-left: 2px;
  }
`;

const FeatureList = styled.div`
  padding: 1rem;
  flex-grow: 1;
  background: var(--ant-color-bg-container);
`;

const FeatureGroup = styled.div`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

const FeatureTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ant-color-text);
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px dashed var(--ant-color-border);
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  color: var(--ant-color-text-secondary);
  font-size: 0.75rem;

  .anticon {
    margin-right: 0.5rem;
    color: var(--ant-color-primary);
    font-size: 1rem;
  }
`;

const PlanButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.875rem;
  
  ${props => props.popular ? `
    background: var(--ant-color-primary);
    color: #fff;
    &:hover {
      background: var(--ant-color-primary-active);
    }
  ` : `
    background: var(--ant-color-bg-container);
    color: var(--ant-color-primary);
    border-top: 1px solid var(--ant-color-border);
    &:hover {
      background: var(--ant-color-primary-bg);
    }
  `}
`;

const StyledTable = styled(Table)`
  margin-top: 1rem;
`;

const NoticeBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: var(--ant-color-bg-container);
  border: 1px solid var(--ant-color-border);
  border-radius: var(--ant-border-radius-base);
`;

const AboutModal = ({ isVisible, onClose }) => {
  // 存储套餐数据
  const storagePlans = [
    {
      key: '1',
      type: '基础版',
      storage: '50GB',
      price: '6',
      traffic: '50GB',
      features: ['支持所有基础功能', '每月50GB下行流量', '标准技术支持'],
    },
    {
      key: '2',
      type: '专业版',
      storage: '200GB',
      price: '21',
      traffic: '200GB',
      features: ['所有基础版功能', '每月200GB下行流量', '优先技术支持', '文件分享功能'],
    },
    {
      key: '3',
      type: '企业版',
      storage: '2TB',
      price: '68',
      traffic: '2TB',
      features: ['所有专业版功能', '每月2TB下行流量', '24/7专属技术支持', '多用户协作', '高级安全特性'],
    },
  ];

  // 按量计费价格
  const payAsYouGoPrices = [
    {
      key: '1',
      item: '存储空间',
      price: '0.12',
      unit: '元/GB/月',
      description: '超出套餐额外存储空间费用',
    },
    {
      key: '2',
      item: '下行流量',
      price: '0.30',
      unit: '元/GB',
      description: '超出套餐额外下行流量费用',
    },
    {
      key: '3',
      item: 'CDN加速',
      price: '0.40',
      unit: '元/GB',
      description: '使用CDN加速产生的流量费用',
    },
  ];

  const columns = [
    {
      title: '计费项',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `¥${text}`,
    },
    {
      title: '计费单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const getPlanTag = (type) => {
    switch(type) {
      case '基础版':
        return '入门首选';
      case '专业版':
        return '最受欢迎';
      case '企业版':
        return '功能齐全';
      default:
        return '';
    }
  };

  // 获取对应图标
  const getFeatureIcon = (feature) => {
    if (feature.includes('存储')) return <DatabaseOutlined />;
    if (feature.includes('流量')) return <ThunderboltOutlined />;
    if (feature.includes('技术支持')) return <CustomerServiceOutlined />;
    if (feature.includes('分享')) return <GlobalOutlined />;
    if (feature.includes('协作')) return <TeamOutlined />;
    if (feature.includes('安全')) return <SafetyCertificateOutlined />;
    if (feature.includes('API')) return <ApiOutlined />;
    return <CheckCircleOutlined />;
  };

  const items = [
    {
      key: '1',
      label: '关于我们',
      children: (
        <AboutContent>
          <p>
            MyStorageX 是一个现代化的云存储解决方案，致力于为用户提供安全、高效、便捷的文件存储和管理服务。
          </p>
          <p>
            我们的特点：
          </p>
          <ul>
            <li>安全可靠的文件存储</li>
            <li>便捷的文件管理</li>
            <li>高速的文件传输</li>
            <li>跨平台访问支持</li>
            <li>完善的数据备份</li>
          </ul>
          <p>
            版本：1.0.0
          </p>
          <p>
            联系我们：support@mystorageX.com
          </p>
        </AboutContent>
      ),
    },
    {
      key: '2',
      label: '套餐方案',
      children: (
        <div>
          <PlansContainer>
            {storagePlans.map(plan => (
              <PriceCard 
                key={plan.key}
                popular={plan.type === '专业版'}
              >
                {plan.type === '专业版' && <PopularBadge>推荐</PopularBadge>}
                <PlanHeader>
                  <PlanTitle>{plan.type}</PlanTitle>
                  <PlanSubtitle>
                    适用于{plan.type === '基础版' ? '个人用户' : plan.type === '专业版' ? '专业团队' : '大型企业'}
                  </PlanSubtitle>
                </PlanHeader>

                <PlanPrice>
                  <span className="currency">¥</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/月</span>
                </PlanPrice>

                <FeatureList>
                  <FeatureGroup>
                    <FeatureTitle>基础配置</FeatureTitle>
                    <Feature>
                      <DatabaseOutlined />
                      存储空间：{plan.storage}
                    </Feature>
                    <Feature>
                      <ThunderboltOutlined />
                      月流量：{plan.traffic}
                    </Feature>
                  </FeatureGroup>

                  <FeatureGroup>
                    <FeatureTitle>包含功能</FeatureTitle>
                    {plan.features.map((feature, index) => (
                      <Feature key={index}>
                        {getFeatureIcon(feature)}
                        {feature}
                      </Feature>
                    ))}
                  </FeatureGroup>
                </FeatureList>

                <PlanButton popular={plan.type === '专业版'}>
                  {plan.type === '专业版' ? '立即升级' : '开始使用'}
                </PlanButton>
              </PriceCard>
            ))}
          </PlansContainer>

          <NoticeBox>
            <p>说明：</p>
            <ul>
              <li>所有套餐均支持7天无理由退款</li>
              <li>套餐可以按年付费，享受8.5折优惠</li>
              <li>超出套餐限额的使用量将按照按量计费价格收取</li>
              <li>具体价格和优惠方案可能会随时调整，请以实际购买时为准</li>
            </ul>
          </NoticeBox>
        </div>
      ),
    },
    {
      key: '3',
      label: '按需收费',
      children: (
        <div>
          <h3>按量计费价目表</h3>
          <p>根据实际使用量计费，灵活经济</p>
          
          <StyledTable
            columns={columns}
            dataSource={payAsYouGoPrices}
            pagination={false}
          />
          
          <NoticeBox>
            <p>计费说明：</p>
            <ul>
              <li>存储空间：按每天实际使用量计费</li>
              <li>下行流量：按实际使用量计费，上行流量免费</li>
              <li>CDN加速：按实际加速流量计费，按天结算</li>
              <li>账单生成：系统每天凌晨生成前一天账单</li>
              <li>余额不足：系统会提前发出预警通知</li>
              <li>最低消费：无最低消费要求，按实际使用量付费</li>
            </ul>
          </NoticeBox>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>推荐：如果您的使用量稳定，建议选择套餐方案，可以享受更优惠的价格。</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="MyStorageX"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Tabs items={items} />
    </Modal>
  );
};

export default AboutModal; 