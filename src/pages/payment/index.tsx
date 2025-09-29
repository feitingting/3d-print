import React, { useState, useEffect } from "react";
import { Card, Button, Descriptions, Typography, Alert, Space, Divider, Row, Col, Statistic, message } from "antd";
import { PayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { history } from 'umi';
import { createCheckoutSession } from '@/api';
import './index.module.scss';

const { Title, Text } = Typography;

interface OrderDetails {
    orderId: string;
    serviceName: string;
    process: string;
    material: string;
    infill: string;
    quantity: number;
    status: string;
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
}

const PaymentPage = () => {
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 从localStorage获取订单信息
        const currentOrder = localStorage.getItem('currentOrder');
        if (currentOrder) {
            try {
                const order = JSON.parse(currentOrder);
                setOrderDetails(order);
            } catch (error) {
                console.error('解析订单信息失败:', error);
                message.error('订单信息格式错误');
                history.push('/order-list');
            }
        } else {
            // 检查支付结果
            const query = new URLSearchParams(window.location.search);
            if (query.get("success")) {
                setMessage("支付成功！您将收到一封确认邮件。");
                setMessageType('success');
            } else if (query.get("canceled")) {
                setMessage("订单已取消 - 您可以继续浏览并在准备好时重新支付。");
                setMessageType('warning');
            } else {
                message.error('未找到订单信息');
                history.push('/order-list');
            }
        }
    }, []);

    const handleSubmit = async () => {
        if (!orderDetails) return;
        
        setLoading(true);
        try {
            const result = await createCheckoutSession();
            if (result && result.url) {
                // 清除localStorage中的订单信息
                localStorage.removeItem('currentOrder');
                // 跳转到Stripe支付页面
                window.location.href = result.url;
            } else {
                message.error('创建支付会话失败');
            }
        } catch (error) {
            console.error('支付请求失败:', error);
            message.error('支付请求失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const goBackToOrders = () => {
        history.push('/order-list');
    };

    if (message) {
        return (
            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <Card>
                    <Alert
                        message={message}
                        type={messageType}
                        icon={
                            messageType === 'success' ? <CheckCircleOutlined /> :
                            messageType === 'error' ? <CloseCircleOutlined /> :
                            <PayCircleOutlined />
                        }
                        showIcon
                        action={
                            <Button type="primary" onClick={goBackToOrders}>
                                返回订单列表
                            </Button>
                        }
                    />
                </Card>
            </div>
        );
    }

    if (!orderDetails) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Card>
                    <Title level={3}>加载订单信息中...</Title>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2} style={{ marginBottom: '24px' }}>
                <PayCircleOutlined style={{ marginRight: '8px' }} />
                订单支付
            </Title>

            <Row gutter={24}>
                {/* 订单详情 */}
                <Col span={16}>
                    <Card title="订单详情" style={{ marginBottom: '24px' }}>
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="订单号" span={2}>
                                <Text code>{orderDetails.orderId}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="服务名称">
                                {orderDetails.serviceName}
                            </Descriptions.Item>
                            <Descriptions.Item label="状态">
                                <Text type="warning">待支付</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="工艺">
                                {orderDetails.process}
                            </Descriptions.Item>
                            <Descriptions.Item label="材料">
                                {orderDetails.material}
                            </Descriptions.Item>
                            <Descriptions.Item label="填充率">
                                {orderDetails.infill}%
                            </Descriptions.Item>
                            <Descriptions.Item label="数量">
                                {orderDetails.quantity}件
                            </Descriptions.Item>
                            <Descriptions.Item label="预计时间">
                                {orderDetails.estimatedTime}小时
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>模型信息</Divider>
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="体积">
                                {orderDetails.modelInfo.volume.toFixed(2)} cm³
                            </Descriptions.Item>
                            <Descriptions.Item label="表面积">
                                {orderDetails.modelInfo.surfaceArea.toFixed(2)} cm²
                            </Descriptions.Item>
                            <Descriptions.Item label="尺寸 (长×宽×高)">
                                {orderDetails.modelInfo.boundingBox.width.toFixed(1)} × 
                                {orderDetails.modelInfo.boundingBox.height.toFixed(1)} × 
                                {orderDetails.modelInfo.boundingBox.depth.toFixed(1)} mm
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* 支付信息 */}
                <Col span={8}>
                    <Card title="支付信息" style={{ marginBottom: '24px' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            <div>
                                <Title level={4}>价格明细</Title>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="材料成本">
                                        ¥{orderDetails.priceCalculation.materialCost.toFixed(2)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="加工费">
                                        ¥{orderDetails.priceCalculation.processingFee.toFixed(2)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="总成本">
                                        ¥{orderDetails.priceCalculation.totalCost.toFixed(2)}
                                    </Descriptions.Item>
                                </Descriptions>
                                <Divider />
                                <Statistic
                                    title="最终价格"
                                    value={orderDetails.priceCalculation.finalPrice}
                                    precision={2}
                                    prefix="¥"
                                    valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                                />
                            </div>

                            <div>
                                <Title level={4}>支付方式</Title>
                                <Card size="small" style={{ textAlign: 'center' }}>
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png"
                                        alt="Stripe"
                                        style={{ height: '40px' }}
                                    />
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                        安全支付 · 支持Visa/MasterCard等主流信用卡
                                    </div>
                                </Card>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                icon={<PayCircleOutlined />}
                                loading={loading}
                                onClick={handleSubmit}
                                block
                                style={{ height: '50px', fontSize: '16px' }}
                            >
                                立即支付 ¥{orderDetails.priceCalculation.finalPrice.toFixed(2)}
                            </Button>

                            <Button
                                onClick={goBackToOrders}
                                block
                            >
                                返回订单列表
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PaymentPage;