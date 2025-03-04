import React from 'react';
import { Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { LanguageButton } from './styles';

const LanguageSelector = ({ locale, languages, onLanguageChange }) => {
  const languageItems = languages.map(language => ({
    key: language.languageCode,
    label: language.languageNameNative
  }));

  return (
    <Dropdown
      menu={{
        items: languageItems,
        selectedKeys: [locale],
        onClick: ({ key }) => onLanguageChange(key),
      }}
      placement="bottomRight"
    >
      <LanguageButton>
        <GlobalOutlined />
      </LanguageButton>
    </Dropdown>
  );
};

export default LanguageSelector; 