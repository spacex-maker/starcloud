import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Spin, Empty, Select, InputNumber, Row, Col } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { 
  getActiveCloudProviders, 
  createUserStorageNode, 
  getStorageRegions,
  type CloudProvider, 
  type StorageRegion
} from 'services/storageService';

interface NodeCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


const RegionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
`;

const RegionCard = styled.div<{ $isSelected: boolean }>`
  padding: 12px;
  border: 1px solid ${props => {
    if (props.$isSelected) {
      return props.theme.mode === 'dark' ? '#177ddc' : '#1890ff';
    }
    return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#d9d9d9';
  }};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.$isSelected) {
      return props.theme.mode === 'dark' ? 'rgba(23, 125, 220, 0.1)' : '#e6f7ff';
    }
    return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#fff';
  }};

  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#177ddc' : '#1890ff'};
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#f5f5f5'};
  }
`;

const RegionName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'};
  margin-bottom: 4px;
`;

const RegionCode = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
`;

const StyledSelect = styled(Select as any)`
  .ant-select-selector {
    border-radius: 999px !important;
  }
  
  .ant-select-selection-item {
    display: flex;
    align-items: center;
  }
`;

const ProviderOptionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProviderIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
`;

const SelectedRegionBox = styled.div`
  padding: 12px 20px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 999px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
`;

const SelectedRegionName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'};
`;

const SelectedRegionCode = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
`;

const NodeCreateModal: React.FC<NodeCreateModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>(undefined);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [creating, setCreating] = useState(false);
  const [regions, setRegions] = useState<StorageRegion[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [nodeName, setNodeName] = useState<string>('');
  const intl = useIntl();

  // 默认值常量
  const DEFAULT_CREDENTIAL_ID = 1;
  const DEFAULT_NODE_TYPE = 'STANDARD';
  const DEFAULT_STORAGE_LIMIT = 10737418240; // 10GB

  // 加载提供商列表
  useEffect(() => {
    if (open) {
      loadProviders();
      form.resetFields();
      form.setFieldsValue({
        nodeType: DEFAULT_NODE_TYPE,
        storageLimit: DEFAULT_STORAGE_LIMIT,
      });
      setSelectedProviderId(undefined);
      setSelectedRegionId(undefined);
      setRegions([]);
      setNodeName('');
    }
  }, [open]);

  // 当选择云厂商时，加载地域列表
  useEffect(() => {
    if (selectedProviderId) {
      loadRegions(selectedProviderId);
    } else {
      setRegions([]);
      setSelectedRegionId(undefined);
    }
  }, [selectedProviderId]);

  const loadProviders = async () => {
    setLoadingProviders(true);
    try {
      const response = await getActiveCloudProviders();
      if (response.success && response.data) {
        setProviders(response.data);
      } else {
        message.error(response.message || intl.formatMessage({ id: 'cloudDrive.nodeCreate.loadProvidersFailed', defaultMessage: '获取云厂商列表失败' }));
      }
    } catch (error) {
      console.error('加载云厂商列表失败:', error);
      message.error(intl.formatMessage({ id: 'cloudDrive.nodeCreate.loadProvidersFailed', defaultMessage: '加载云厂商列表失败' }));
    } finally {
      setLoadingProviders(false);
    }
  };

  const loadRegions = async (providerId: number) => {
    setLoadingRegions(true);
    try {
      const response = await getStorageRegions(providerId);
      if (response.success && response.data) {
        setRegions(response.data);
      } else {
        message.error(response.message || intl.formatMessage({ id: 'cloudDrive.nodeCreate.loadRegionsFailed', defaultMessage: '获取地域列表失败' }));
      }
    } catch (error) {
      console.error('加载地域列表失败:', error);
      message.error(intl.formatMessage({ id: 'cloudDrive.nodeCreate.loadRegionsFailed', defaultMessage: '加载地域列表失败' }));
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleProviderChange = (providerId: number | undefined) => {
    if (providerId !== undefined) {
      setSelectedProviderId(providerId);
    }
  };

  const handleRegionSelect = (regionId: number) => {
    setSelectedRegionId(regionId);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedProviderId) {
        message.warning(intl.formatMessage({ id: 'cloudDrive.nodeCreate.selectProviderRequired', defaultMessage: '请先选择云厂商' }));
        return;
      }

      if (!selectedRegionId) {
        message.warning(intl.formatMessage({ id: 'cloudDrive.nodeCreate.selectRegionRequired', defaultMessage: '请先选择地域' }));
        return;
      }

      const values = await form.validateFields();
      
      const selectedProvider = providers.find(p => p.id === selectedProviderId);
      
      setCreating(true);
      const response = await createUserStorageNode({
        providerId: selectedProviderId,
        regionId: selectedRegionId,
        credentialId: DEFAULT_CREDENTIAL_ID,
        nodeName: nodeName || (selectedProvider ? `${selectedProvider.providerName}节点` : '新节点'),
        nodeType: values.nodeType || DEFAULT_NODE_TYPE,
        storageLimit: values.storageLimit || DEFAULT_STORAGE_LIMIT,
      });

      if (response.success) {
        message.success(intl.formatMessage({ id: 'cloudDrive.nodeCreate.success', defaultMessage: '存储节点创建成功' }));
        onSuccess();
        onClose();
        form.resetFields();
        setSelectedProviderId(undefined);
        setSelectedRegionId(undefined);
        setRegions([]);
        setNodeName('');
      } else {
        message.error(response.message || intl.formatMessage({ id: 'cloudDrive.nodeCreate.failed', defaultMessage: '创建存储节点失败' }));
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setCreating(false);
    }
  };

  const selectedProvider = providers.find(p => p.id === selectedProviderId);
  const selectedRegion = regions.find(r => r.id === selectedRegionId);

  return (
    <Modal
      title={<FormattedMessage id="cloudDrive.nodeCreate.title" defaultMessage="新增存储节点" />}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={creating}
      destroyOnClose
      width={700}
      okText={intl.formatMessage({ id: 'common.confirm', defaultMessage: '确认' })}
      cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
    >
      <Spin spinning={loadingProviders}>
        <Form
          form={form}
          layout="vertical"
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              <FormattedMessage id="cloudDrive.nodeCreate.selectProvider" defaultMessage="选择云厂商" />
              <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
            </div>
            <StyledSelect
              placeholder={intl.formatMessage({ id: 'cloudDrive.nodeCreate.selectProviderPlaceholder', defaultMessage: '请选择云厂商' })}
              value={selectedProviderId}
              onChange={(value: number) => handleProviderChange(value)}
              loading={loadingProviders}
              style={{ width: '100%' }}
              getPopupContainer={(triggerNode: HTMLElement) => {
                const container = triggerNode?.parentElement;
                return container || document.body;
              }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{
                borderRadius: '12px',
              }}
              notFoundContent={
                providers.length === 0 ? (
                  <Empty 
                    description={intl.formatMessage({ id: 'cloudDrive.nodeCreate.noProviders', defaultMessage: '暂无可用云厂商' })} 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : null
              }
              optionLabelProp="label"
            >
              {providers.map(provider => (
                <Select.Option 
                  key={provider.id} 
                  value={provider.id}
                  label={
                    <ProviderOptionContent>
                      {provider.iconImg && (
                        <ProviderIcon 
                          src={provider.iconImg} 
                          alt={provider.providerName}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{provider.providerName}</span>
                    </ProviderOptionContent>
                  }
                >
                  <ProviderOptionContent>
                    {provider.iconImg && (
                      <ProviderIcon 
                        src={provider.iconImg} 
                        alt={provider.providerName}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span>{provider.providerName}</span>
                  </ProviderOptionContent>
                </Select.Option>
              ))}
            </StyledSelect>
          </div>

          {selectedProviderId && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <FormattedMessage id="cloudDrive.nodeCreate.selectRegion" defaultMessage="选择地域" />
                <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
              </div>
              <Spin spinning={loadingRegions}>
                {regions.length === 0 ? (
                  <Empty 
                    description={intl.formatMessage({ id: 'cloudDrive.nodeCreate.noRegions', defaultMessage: '暂无可用地域' })} 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <RegionGrid>
                    {regions.map(region => {
                      const isSelected = selectedRegionId === region.id;
                      return (
                        <RegionCard
                          key={region.id}
                          $isSelected={isSelected}
                          onClick={() => handleRegionSelect(region.id)}
                        >
                          <RegionName>{region.regionName}</RegionName>
                          <RegionCode>{region.regionCode}</RegionCode>
                        </RegionCard>
                      );
                    })}
                  </RegionGrid>
                )}
              </Spin>
            </div>
          )}

          {selectedRegion && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <FormattedMessage id="cloudDrive.nodeCreate.selectedRegion" defaultMessage="已选地域" />
              </div>
              <SelectedRegionBox>
                <SelectedRegionName>{selectedRegion.regionName}</SelectedRegionName>
                <SelectedRegionCode>{selectedRegion.regionCode}</SelectedRegionCode>
              </SelectedRegionBox>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              <FormattedMessage id="cloudDrive.nodeCreate.nodeName" defaultMessage="节点名称" />
            </div>
            <Input 
              placeholder={intl.formatMessage({ 
                id: 'cloudDrive.nodeCreate.nodeNamePlaceholder', 
                defaultMessage: '留空将使用默认名称' 
              })}
              value={nodeName}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 50) {
                  setNodeName(value);
                }
              }}
              autoComplete="off"
            />
            {nodeName.length > 0 && nodeName.length >= 50 && (
              <div style={{ marginTop: 4, fontSize: 12, color: '#ff4d4f' }}>
                {intl.formatMessage({ id: 'cloudDrive.nodeCreate.nameMaxLength', defaultMessage: '节点名称不能超过50个字符' })}
              </div>
            )}
          </div>

          <Form.Item
            name="nodeType"
            label={<FormattedMessage id="cloudDrive.nodeCreate.nodeType" defaultMessage="节点类型" />}
            initialValue={DEFAULT_NODE_TYPE}
          >
            <StyledSelect
              getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement || document.body}
              dropdownStyle={{
                borderRadius: '12px',
              }}
            >
              <Select.Option value="STANDARD">
                {intl.formatMessage({ id: 'cloudDrive.nodeCreate.nodeType.standard', defaultMessage: '标准存储' })}
              </Select.Option>
              <Select.Option value="LOW_FREQ">
                {intl.formatMessage({ id: 'cloudDrive.nodeCreate.nodeType.lowFreq', defaultMessage: '低频存储' })}
              </Select.Option>
              <Select.Option value="ARCHIVE">
                {intl.formatMessage({ id: 'cloudDrive.nodeCreate.nodeType.archive', defaultMessage: '归档存储' })}
              </Select.Option>
            </StyledSelect>
          </Form.Item>

          <Form.Item
            name="storageLimit"
            label={<FormattedMessage id="cloudDrive.nodeCreate.storageLimit" defaultMessage="存储限制" />}
            initialValue={DEFAULT_STORAGE_LIMIT}
            rules={[
              { required: true, message: intl.formatMessage({ id: 'cloudDrive.nodeCreate.storageLimitRequired', defaultMessage: '请输入存储限制' }) },
              { type: 'number', min: 1073741824, message: intl.formatMessage({ id: 'cloudDrive.nodeCreate.storageLimitMin', defaultMessage: '存储限制不能小于1GB' }) }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1073741824}
              step={1073741824}
              formatter={(value) => {
                if (value === undefined || value === null) return '';
                const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
                if (isNaN(numValue) || numValue <= 0) return '';
                const gb = numValue / 1073741824;
                return `${gb} GB`;
              }}
              parser={(value: string | undefined) => {
                if (!value || typeof value !== 'string') return 0;
                const num = parseFloat(value.replace(/[^\d.]/g, ''));
                if (isNaN(num) || num <= 0) return 0;
                return num * 1073741824;
              }}
              placeholder={intl.formatMessage({ 
                id: 'cloudDrive.nodeCreate.storageLimitPlaceholder', 
                defaultMessage: '请输入存储限制（GB）' 
              })}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default NodeCreateModal;
