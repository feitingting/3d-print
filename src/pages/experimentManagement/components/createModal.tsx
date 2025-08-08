import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  message,
  Alert,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { saveOrUpdateExperiment } from '@/api/index';
import experiment from '@/models/experiment';

const { Option } = Select;

const CreateExperimentModal = (props: any) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [bottleInfoFields, setBottleInfoFields] = useState([{ key: '0' }]);
  const { createModalVisible, materials, currentExperiment } = useSelector(
    (state: any) => state.experiment,
  );

  const handleFinish = () => {
    form.validateFields().then(async (values) => {
      const result = await saveOrUpdateExperiment({
        ...(currentExperiment?._id && { _id: currentExperiment._id }),
        ...values,
      });
      if (result?._id) {
        // 替换为实际的 action 类型和参数
        dispatch({ type: 'experiment/toggleCreateModalVisible' });
        message.success(currentExperiment?._id ? '编辑成功' : '创建成功');
        // 刷新列表
        if (props.refresh) {
          props.refresh();
        }
      }
    });
  };

  useEffect(() => {
    if (createModalVisible) {
      if (Object.keys(currentExperiment).length > 0) {
        form.setFieldsValue({
          ...currentExperiment,
          bottleInfo: currentExperiment.bottleInfo.map((item: any) => ({
            specification: item.specification,
            count: item.count,
          })),
        });
      } else {
        form.resetFields();
      }
    }
  }, [createModalVisible, currentExperiment]);

  // 原料下拉框选项
  const materialOptions =
    materials.map((material: any) => ({
      value: material._id,
      label: material.name,
    })) || [];

  return (
    <Modal
      title={
        currentExperiment?._id
          ? currentExperiment.status == 0
            ? '编辑实验'
            : '查看详情'
          : '新增实验'
      }
      open={createModalVisible}
      onCancel={() => {
        // 关闭弹窗，对象清空
        dispatch({ type: 'experiment/setCurrentExperiment', payload: {} });
        dispatch({ type: 'experiment/toggleCreateModalVisible' });
      }}
      onOk={() => form.submit()}
    >
      <Alert
        style={{ marginBottom: 16 }}
        message={
          <span style={{ color: 'rgba(0,0,0,0.5)' }}>
            原料选择顺序即为原料混合顺序，请谨慎操作。
          </span>
        }
        type="warning"
        showIcon
      />
      <Form
        disabled={currentExperiment._id && currentExperiment?.status !== 0}
        form={form}
        wrapperCol={{ span: 19 }}
        labelCol={{ span: 5 }}
        initialValues={{ bottleInfo: [{}] }}
        onFinish={handleFinish}
      >
        {/* 实验名称 */}
        <Form.Item
          name="name"
          label="实验名称"
          rules={[{ required: true, message: '请输入实验名称' }]}
        >
          <Input />
        </Form.Item>
        {/* 实验温度 */}
        <Form.Item
          name="temperature"
          label="实验温度"
          rules={[{ required: true, message: '请输入实验所需温度' }]}
        >
          <InputNumber style={{ width: '100%' }} addonAfter="°" />
        </Form.Item>
        <Form.Item
          name="reactionTime"
          label="反应时间"
          rules={[{ required: true, message: '请输入反应所需时间' }]}
        >
          <InputNumber style={{ width: '100%' }} addonAfter="h" />
        </Form.Item>
        {/* 原料 */}
        <Form.Item
          name="rawMaterials"
          label="原料"
          rules={[{ required: true, message: '请选择原料' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择原料"
            options={materialOptions}
          />
        </Form.Item>
        {/* 实验瓶信息 */}
        <Form.Item
          label="规格"
          required
          rules={[
            {
              validator: (_, value) =>
                value?.length > 0
                  ? Promise.resolve()
                  : Promise.reject('至少需要添加一个实验瓶配置'),
            },
          ]}
        >
          <Form.List name="bottleInfo">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space
                    key={key}
                    align="baseline"
                    style={{
                      display: 'flex',
                      marginBottom: 8,
                      width: '100%',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* 规格下拉框 */}
                    <Form.Item
                      name={[name, 'specification']}
                      rules={[
                        { required: true, message: '请选择规格' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const bottleInfo =
                              getFieldValue('bottleInfo') || [];
                            // 统计当前规格值的出现次数
                            const count = bottleInfo.filter(
                              (item: any, index: number) =>
                                item?.specification === value && index !== name,
                            ).length;

                            if (count > 0) {
                              return Promise.reject(
                                new Error('规格值不能重复'),
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Select placeholder="请选择规格" style={{ width: 150 }}>
                        <Option value={0} label="8ml">
                          8ml
                        </Option>
                        <Option value={1} label="20ml">
                          20ml
                        </Option>
                      </Select>
                    </Form.Item>

                    {/* 数量输入框 */}
                    <Form.Item
                      name={[name, 'count']}
                      rules={[{ required: true, message: '请输入个数' }]}
                    >
                      <InputNumber
                        placeholder="请输入个数"
                        min={1}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    {/* 删除按钮（最后一个不可删除） */}
                    <Button
                      type="link"
                      danger
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                    >
                      删除
                    </Button>
                  </Space>
                ))}
                {/* 添加按钮 */}
                {currentExperiment.status != 1 && (
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加实验瓶配置
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </Form.Item>
        {currentExperiment?.status == 1 && (
          <Form.Item label="试管分配：" style={{ marginBottom: 16 }}>
            <div style={{ color: '#666', fontSize: 14 }}>
              {currentExperiment?.bottleInfo
                ?.map((item: any) => {
                  const specText =
                    item.specification === 0 ? '8ml试管' : '10ml试管';
                  const countText = `${item.count}个`;
                  const ids = currentExperiment.tubeIds?.join(', ') || '暂无';
                  return `${specText}${countText}\u00A0\u00A0\u00A0\u00A0ID：${ids}`;
                })
                .join('；')}
            </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CreateExperimentModal;
