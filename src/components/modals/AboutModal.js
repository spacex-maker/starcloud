import React from 'react';
import { Modal, Typography, Space, Divider, Tabs, List } from 'antd';
import {
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AboutModal = ({ open, onClose }) => {
  const items = [
    {
      key: 'product',
      label: (
        <span>
          <InfoCircleOutlined />
          <span style={{ marginLeft: 8 }}>产品介绍</span>
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
          <Title level={4}>MyStorageX 云存储</Title>
          <Paragraph>
            MyStorageX 是一款安全、高效的云存储工具，为用户提供文件存储、加密、分享等功能。
            我们致力于保护用户数据隐私，提供最佳的用户体验。
          </Paragraph>
          <List
            size="small"
            bordered
            dataSource={[
              '便捷的文件管理',
              '强大的搜索功能',
              '灵活的分享选项',
              '多平台同步支持'
            ]}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Space>
      )
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyCertificateOutlined />
          <span style={{ marginLeft: 8 }}>安全特性</span>
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
          <Title level={4}>安全保障</Title>
          <List
            size="small"
            bordered
            dataSource={[
              {
                title: '端到端加密',
                description: '全程加密保护，确保数据传输和存储安全'
              },
              {
                title: '零知识存储',
                description: '服务器无法获取用户文件内容'
              },
              {
                title: '安全密钥管理',
                description: '采用高强度加密算法，保护用户密钥'
              },
              {
                title: '多重身份验证',
                description: '支持多因素认证，提升账户安全性'
              }
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </Space>
      )
    },
    {
      key: 'team',
      label: (
        <span>
          <TeamOutlined />
          <span style={{ marginLeft: 8 }}>关于我们</span>
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
          <Title level={4}>团队介绍</Title>
          <Paragraph>
            我们是一支充满激情的技术团队，致力于为用户提供最好的云存储解决方案。
          </Paragraph>
          <List
            size="small"
            bordered
            dataSource={[
              '专业的技术支持团队',
              '7×24小时客户服务',
              '持续的产品创新',
              '用户至上的服务理念'
            ]}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Space>
      )
    },
    {
      key: 'version',
      label: (
        <span>
          <BookOutlined />
          <span style={{ marginLeft: 8 }}>版本信息</span>
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }}>
          <Title level={4}>系统信息</Title>
          <List
            size="small"
            bordered
            dataSource={[
              { label: '当前版本', value: '1.0.0' },
              { label: '发布日期', value: '2024年3月' },
              { label: '技术支持', value: 'support@mystoragex.com' },
              { label: '官方网站', value: 'www.mystoragex.com' }
            ]}
            renderItem={(item) => (
              <List.Item>
                <Text strong>{item.label}：</Text> {item.value}
              </List.Item>
            )}
          />
        </Space>
      )
    }
  ];

  return (
    <Modal
      title="关于 MyStorageX"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Tabs
        defaultActiveKey="product"
        items={items}
        size="large"
        style={{ marginTop: -16 }}
      />
    </Modal>
  );
};

export default AboutModal; 