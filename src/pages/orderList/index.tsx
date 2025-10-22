import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  message, 
  Modal, 
  Descriptions, 
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  Alert
} from 'antd';
import { 
  EyeOutlined, 
  PayCircleOutlined, 
  ReloadOutlined,
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { history } from 'umi';
import { getUserOrders, getOrderStatus } from '@/api';
import './index.less';

const { Title, Text } = Typography;

interface Order {
  orderId: string;
  serviceName: string;
  process: string;
  material: string;
  infill: string;
  quantity: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  modelInfo: {
    volume: number;
    surfaceArea: number;
    boundingBox: {
      width: number;
      height: number;
      depth: number;
    };
  };
  priceCalculation: {
    materialCost: number;
    processingFee: number;
    totalCost: number;
    finalPrice: number;
  };
  estimatedTime: number;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // 获取用户订单列表
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        history.push('/');
        return;
      }

      const userEmail = localStorage.getItem('userEmail') || '';
      const result = await getUserOrders({
        customerEmail: userEmail,
        page: 1,
        limit: 50
      });

      if (result && result.orders) {
        setOrders(result.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      message.error('获取订单列表失败');
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 查看订单详情
  const viewOrderDetail = async (orderId: string) => {
    try {
      const result = await getOrderStatus(orderId);
      if (result) {
        setSelectedOrder(result);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error('获取订单详情失败');
      console.error('获取订单详情失败:', error);
    }
  };

  // 去支付
  const goToPayment = (order: Order) => {
    if (order.status === 'pending') {
      // 将订单信息存储到localStorage，支付页面使用
      localStorage.setItem('currentOrder', JSON.stringify(order));
      history.push('/payment');
    } else {
      message.info('该订单状态不允许支付');
    }
  };

  // 状态标签颜色
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'orange',
      paid: 'blue',
      processing: 'processing',
      completed: 'success',
      cancelled: 'error'
    };
    return statusMap[status] || 'default';
  };

  // 状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待支付',
      paid: '已支付',
      processing: '制作中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  // 表格列定义
  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (text: string) => (
        <Text code style={{ fontSize: '12px' }}>{text.slice(-8)}</Text>
      )
    },
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 120
    },
    {
      title: '工艺',
      dataIndex: 'process',
      key: 'process',
      width: 100
    },
    {
      title: '材料',
      dataIndex: 'material',
      key: 'material',
      width: 100
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (text: number) => `${text}件`
    },
    {
      title: '价格',
      dataIndex: 'priceCalculation',
      key: 'price',
      width: 100,
      render: (priceCalculation: any) => (
        <Text strong style={{ color: '#2c3e50' }}>
          ¥{priceCalculation?.finalPrice?.toFixed(2) || '0.00'}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (text: string) => new Date(text).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => viewOrderDetail(record.orderId)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<PayCircleOutlined />}
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => goToPayment(record)}
            >
              支付
            </Button>
          )}
        </Space>
      )
    }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="order-list-container">
      <div className="page-header">
        <Title level={2} style={{ margin: 0 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          我的订单
        </Title>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchOrders}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <Alert
            message="暂无订单"
            description="您还没有任何订单，去在线报价页面创建您的第一个订单吧！"
            type="info"
            showIcon
            action={
              <Button 
                type="primary" 
                onClick={() => history.push('/online-quotation')}
              >
                去报价
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* 订单统计 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总订单数"
                  value={orders.length}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="待支付"
                  value={orders.filter(o => o.status === 'pending').length}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="制作中"
                  value={orders.filter(o => o.status === 'processing').length}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#2c3e50' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="已完成"
                  value={orders.filter(o => o.status === 'completed').length}
                  prefix={<PayCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 订单列表 */}
          <Card>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="orderId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条订单`
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </>
      )}

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedOrder?.status === 'pending' && (
            <Button
              key="pay"
              type="primary"
              icon={<PayCircleOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                goToPayment(selectedOrder);
              }}
            >
              去支付
            </Button>
          )
        ].filter(Boolean)}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="订单号" span={2}>
                <Text code>{selectedOrder.orderId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="服务名称">
                {selectedOrder.serviceName}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="工艺">
                {selectedOrder.process}
              </Descriptions.Item>
              <Descriptions.Item label="材料">
                {selectedOrder.material}
              </Descriptions.Item>
              <Descriptions.Item label="填充率">
                {selectedOrder.infill}%
              </Descriptions.Item>
              <Descriptions.Item label="数量">
                {selectedOrder.quantity}件
              </Descriptions.Item>
              <Descriptions.Item label="预计时间">
                {selectedOrder.estimatedTime}小时
              </Descriptions.Item>
            </Descriptions>

            <Divider>模型信息</Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="体积">
                {selectedOrder.modelInfo.volume.toFixed(2)} cm³
              </Descriptions.Item>
              <Descriptions.Item label="表面积">
                {selectedOrder.modelInfo.surfaceArea.toFixed(2)} cm²
              </Descriptions.Item>
              <Descriptions.Item label="尺寸 (长×宽×高)">
                {selectedOrder.modelInfo.boundingBox.width.toFixed(1)} × 
                {selectedOrder.modelInfo.boundingBox.height.toFixed(1)} × 
                {selectedOrder.modelInfo.boundingBox.depth.toFixed(1)} mm
              </Descriptions.Item>
            </Descriptions>

            <Divider>价格明细</Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="材料成本">
                ¥{selectedOrder.priceCalculation.materialCost.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="加工费">
                ¥{selectedOrder.priceCalculation.processingFee.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="总成本">
                ¥{selectedOrder.priceCalculation.totalCost.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="最终价格" span={1}>
                <Text strong style={{ color: '#2c3e50', fontSize: '16px' }}>
                  ¥{selectedOrder.priceCalculation.finalPrice.toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.customerInfo && (
              <>
                <Divider>客户信息</Divider>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="姓名">
                    {selectedOrder.customerInfo.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="邮箱">
                    {selectedOrder.customerInfo.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="电话">
                    {selectedOrder.customerInfo.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="地址" span={2}>
                    {selectedOrder.customerInfo.address}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Divider>时间信息</Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="创建时间">
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(selectedOrder.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderListPage;
