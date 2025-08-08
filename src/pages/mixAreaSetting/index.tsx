import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, Select, message } from 'antd';
import { queryStirAreaSetting, updateStirAreaSetting } from '@/api/index';
import { render } from 'react-dom';

// 定义数据类型，修改为 moduleTemperature
interface TableData {
  _id: string;
  module1Type: {
    pos: Array<number>;
    posType: number;
  };
  module2Type: {
    pos: Array<number>;
    posType: number;
  };
  module3Type: {
    pos: Array<number>;
    posType: number;
  };
  module4Type: {
    pos: Array<number>;
    posType: number;
  };
  name: string;
  moduleTemperature: string; // 修改字段名
}

// 下拉框选项
const dropdownOptions = [
  { value: 0, label: '2*2反应盘' },
  { value: 1, label: '1*1反应盘' },
];

const MixAreaSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState<TableData[]>([]);
  const [currentId, setCurrentId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // 带出索引
  const showModal = (id: string, index: number) => {
    // 保存当前ID
    setCurrentId(id);
    setCurrentIndex(index + 1);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFinish = () => {
    // 更新搅拌区设置
    form
      .validateFields()
      .then(async (values) => {
        console.log('Form values:', values);
        const result = await updateStirAreaSetting({
          _id: currentId,
          index: currentIndex,
          ...{
            ...values,
            module1Type: {
              posType: values.module1Type.posType,
              // 根据选择的 posType 设置 pos
              pos: values.module1Type.posType === 0 ? [1, 2, 3, 4] : [17],
            },
            module2Type: {
              posType: values.module2Type.posType,
              // 根据选择的 posType 设置 pos
              pos: values.module2Type.posType === 0 ? [5, 6, 7, 8] : [18],
            },
            module3Type: {
              posType: values.module3Type.posType,
              // 根据选择的 posType 设置 pos
              pos: values.module3Type.posType === 0 ? [9, 10, 11, 12] : [19],
            },
            module4Type: {
              posType: values.module4Type.posType,
              // 根据选择的 posType 设置 pos
              pos: values.module4Type.posType === 0 ? [13, 14, 15, 16] : [20],
            },
          },
        });
        if (result?._id) {
          // 提示成功并更新数据源
          message.success('设置成功');
          setIsModalVisible(false);
          init();
        }
      })
      .catch((errorInfo) => {
        console.log('Failed:', errorInfo);
      });
  };

  const init = async () => {
    const result = await queryStirAreaSetting();
    // 表格数据源
    if (result) {
      setDataSource(result);
    }
  };

  useEffect(() => {
    if (currentId) {
      const currentInfo = dataSource.find((item) => item._id === currentId);
      if (currentInfo) {
        form.setFieldsValue({
          name: currentInfo.name,
          module1Type: { posType: currentInfo.module1Type.posType },
          module2Type: { posType: currentInfo.module2Type.posType },
          module3Type: { posType: currentInfo.module3Type.posType },
          module4Type: { posType: currentInfo.module4Type.posType },
        });
      }
    }
  }, [currentId]);

  useEffect(() => {
    init();
  }, []);

  // 定义表头，修改为模块温度
  const columns = [
    {
      title: '序号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text: any, record: any, index: number) => index + 1, // 使用行索引生成序号
    },
    {
      title: '拌料区名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '模块温度', // 修改标题
      dataIndex: 'outerTemperature', // 修改数据索引
      key: 'outerTemperature', // 修改键
      render: (value: number) => `${value}°C`, // 添加单位符号
    },
    {
      title: '自定义配置',
      dataIndex: 'customConfig',
      key: 'customConfig',
      render: (text: string, record: TableData, index: number) => {
        return (
          <>
            <a onClick={() => showModal(record._id, index)}>模块设置</a>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <h1 style={{ color: '#000', fontSize: 18, marginBottom: 12 }}>
        拌料区设置
      </h1>
      <Table columns={columns} dataSource={dataSource} pagination={false} />
      <Modal
        style={{ width: 600 }}
        title="模块设置"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={handleFinish}
        >
          <Form.Item
            rules={[{ required: true, message: '请输入搅拌区名称' }]}
            label="拌料区名称"
            name="name"
          >
            <Input />
          </Form.Item>
          <Form.Item label="自定义模块1" name={['module1Type', 'posType']}>
            <Select options={dropdownOptions} />
          </Form.Item>
          <Form.Item label="自定义模块2" name={['module2Type', 'posType']}>
            <Select options={dropdownOptions} />
          </Form.Item>
          <Form.Item label="自定义模块3" name={['module3Type', 'posType']}>
            <Select options={dropdownOptions} />
          </Form.Item>
          <Form.Item label="自定义模块4" name={['module4Type', 'posType']}>
            <Select options={dropdownOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MixAreaSetting;
