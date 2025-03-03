import React from 'react';
import { Layout } from 'antd';
import { FormattedMessage } from 'react-intl';

const { Content } = Layout;

const Trash = () => {
  return (
    <Content>
      <div style={{ padding: 24 }}>
        <h2><FormattedMessage id="sidebar.trash" /></h2>
        <p>回收站功能开发中...</p>
      </div>
    </Content>
  );
};

export default Trash; 