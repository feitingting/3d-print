import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { saveOrUpdateMaterial, queryMaterials } from '@/api/index';

interface MaterialItem {
  _id: string;
  name: string;
  stock: number;
  unit: string;
  remark: string;
  startTime: Date;
  updateTime: Date;
}

const MaterialManagement: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [dataSource, setDataSource] = useState<Array<MaterialItem>>([]);
  // 当前编辑的原料ID
  const [currentId, setCurrentId] = useState('');
  const [form] = Form.useForm();

  const columns = [
    { title: '原料名称', dataIndex: 'name', key: 'name', width: 300 },
    { title: '库存', dataIndex: 'stock', key: 'stock', width: 150 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 150 },
    {
      title: '入库时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 300,
      render: (text: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 300,
      render: (text: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      render: (text: string) => (
        <Tooltip title={text} trigger="click">
          <span
            style={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maxWidth: '200px',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            }}
          >
            {text || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (text: unknown, record: MaterialItem) => (
        <Button
          style={{ padding: 0 }}
          type="link"
          icon={<EditOutlined />}
          onClick={() => setCurrentId(record._id)}
        >
          编辑
        </Button>
      ),
    },
  ];

  const handleFinish = () => {
    form
      .validateFields()
      .then(async (values) => {
        console.log('Form values:', values);
        // 调用API
        const result = await saveOrUpdateMaterial({
          ...(currentId && { _id: currentId }),
          ...values,
        });
        if (result?._id) {
          message.success(currentId ? '更新成功' : '创建成功');
          // 刷新
          init();
        }
        setVisible(false);
        setCurrentId('');
        // 在这里可以添加表单提交的逻辑
      })
      .catch((error) => {
        console.error('Form validation failed:', error);
      });
  };

  const init = async () => {
    const result = await queryMaterials();
    if (result.length > 0) {
      setDataSource(result);
    }
  };

  // 监听currentId
  useEffect(() => {
    if (currentId) {
      setVisible(true);
      const currentInfo = dataSource.find((item: any) => item._id == currentId);
      if (currentInfo) {
        // 重设表单域
        form.setFieldsValue({
          name: currentInfo.name,
          stock: currentInfo.stock,
          unit: currentInfo.unit,
          remark: currentInfo.remark,
        });
      }
    }
  }, [currentId]);

  useEffect(() => {
    init();
  }, []);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontSize: '18px' }}>原料管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setVisible(true)}
        >
          新增
        </Button>
      </div>

      <Table
        rowKey={'_id'}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        scroll={{ x: true }}
      />

      <Modal
        title={currentId ? '编辑原料' : '新增原料'}
        open={visible}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          onFinish={handleFinish}
        >
          <Form.Item
            label="原料名称"
            name="name"
            rules={[{ required: true, message: '请输入原料名称' }]}
          >
            <Input placeholder="请输入原料名称" />
          </Form.Item>

          <Form.Item
            label="库存"
            name="stock"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="请输入库存数量"
            />
          </Form.Item>

          <Form.Item
            label="单位"
            name="unit"
            rules={[{ required: true, message: '请选择单位' }]}
          >
            <Input placeholder="请输入单位（如：mg、g、ml）" />
          </Form.Item>

          <Form.Item label="说明" name="remark">
            <Input.TextArea placeholder="请输入原料说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialManagement;
