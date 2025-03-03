import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Timeline, Spin, Typography, Tag } from 'antd';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import instance from 'api/axios';
import { CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProductLog {
  version: string;
  releaseDate: string;
  updateType: string;
  updateContent: string;
  remarks: string;
}

interface ProductLogModalProps {
  open: boolean;
  onClose: () => void;
}

interface PaginationResponse {
  data: ProductLog[];
  totalNum: number;
}

const FullScreenOverlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.45)'
    : 'rgba(255, 255, 255, 0.45)'};
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: ${props => props.visible ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
`;

const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 40px 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
    border-radius: 3px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const Title = styled.h1`
  text-align: center;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  margin-bottom: 40px;
  font-size: 28px;
  font-weight: 600;
`;

const StyledTimeline = styled(Timeline)`
  .ant-timeline-item-tail {
    border-inline-start: 2px solid ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
  }

  .ant-timeline-item-content {
    margin-bottom: 32px;
  }
`;

const VersionTag = styled(Tag)`
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
`;

const DateText = styled(Text)`
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(0, 0, 0, 0.65)'};
  margin-left: 8px;
`;

const UpdateTypeTag = styled(Tag)`
  margin: 0 8px;
`;

const ContentWrapper = styled.div`
  margin-top: 8px;
  padding: 16px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
`;

const LoadingWrapper = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const ProductLogModal: React.FC<ProductLogModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ProductLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  const fetchLogs = async (page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await instance.get('/productx/product-update-log/list', {
        params: {
          currentPage: page,
          pageSize
        }
      });

      if (response.data.success) {
        const { data, totalNum }: PaginationResponse = response.data.data;
        setTotal(totalNum);
        
        if (page === 1) {
          setLogs(data);
        } else {
          setLogs(prevLogs => [...prevLogs, ...data]);
        }
        
        setHasMore((page * pageSize) < totalNum);
      }
    } catch (error) {
      console.error('Failed to fetch product logs:', error);
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (open) {
      setCurrentPage(1);
      setHasMore(true);
      setLogs([]);
      fetchLogs(1);
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchLogs(nextPage);
    }
  }, [loading, loadingMore, hasMore, currentPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case '新功能':
        return 'success';
      case '优化':
        return 'processing';
      case '修复':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <FullScreenOverlay visible={open}>
      <CloseButton onClick={onClose}>
        <CloseOutlined />
      </CloseButton>
      <ScrollContainer ref={containerRef}>
        <ContentContainer>
          <Title>
            <FormattedMessage id="productLog.title" defaultMessage="产品更新日志" />
          </Title>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <StyledTimeline>
                {logs.map((log, index) => (
                  <Timeline.Item key={index}>
                    <div>
                      <VersionTag color="blue">v{log.version}</VersionTag>
                      <DateText>{log.releaseDate}</DateText>
                      <UpdateTypeTag color={getUpdateTypeColor(log.updateType)}>
                        {log.updateType}
                      </UpdateTypeTag>
                    </div>
                    <ContentWrapper>
                      <Text style={{ color: 'inherit' }}>{log.updateContent}</Text>
                      {log.remarks && (
                        <div style={{ marginTop: 12 }}>
                          <Text type="secondary" style={{ opacity: 0.8 }}>{log.remarks}</Text>
                        </div>
                      )}
                    </ContentWrapper>
                  </Timeline.Item>
                ))}
              </StyledTimeline>
              {loadingMore && (
                <LoadingWrapper>
                  <Spin />
                </LoadingWrapper>
              )}
            </>
          )}
        </ContentContainer>
      </ScrollContainer>
    </FullScreenOverlay>
  );
};

export default ProductLogModal; 