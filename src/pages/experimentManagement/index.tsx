import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Space,
  Table,
  Tag,
  Modal,
  Button,
  message,
  Tooltip,
  Popconfirm,
  Card,
  Statistic,
} from 'antd';
// 导入 AddOutlined 图标
import {
  PlusOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import dayjs from 'dayjs'; // 引入 dayjs
import CreateExperimentModal from './components/createModal';
import {
  queryMaterials,
  queryExperiments,
  saveOrUpdateExperiment,
  batchDeleteExperiments,
  batchStartExperiments,
  startAgvTransport,
  batchAgvTransport,
} from '@/api';
import { render } from 'react-dom';

const ExperimentManagement: React.FC = () => {
  // 在状态管理部分添加选中状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const { createModalVisible, materials } = useSelector(
    (state: any) => state.experiment,
  );

  const actionRef = useRef<any>(); // 新增 action 引用

  // 定义实验状态枚举
  enum ExperimentStatus {
    NotStarted = 0, // 未开始
    Ongoing = 1, // 进行中
    Completed = 2, // 已完成
    IngredientReady = 3,
    InReaction = 4,
  }

  // 状态显示映射
  const statusTextMap = {
    [ExperimentStatus.NotStarted]: '未开始',
    [ExperimentStatus.Ongoing]: '进行中',
    [ExperimentStatus.Completed]: '已结束',
    [ExperimentStatus.IngredientReady]: '备料区就位',
    [ExperimentStatus.InReaction]: '反应中',
  };

  // 定义状态颜色映射
  const statusColorMap = {
    [ExperimentStatus.NotStarted]: '#8C8C8C',
    [ExperimentStatus.Ongoing]: '#1890FF',
    [ExperimentStatus.Completed]: '#52C41A',
    [ExperimentStatus.IngredientReady]: '#20B2AA', // 新增蓝绿色表
    [ExperimentStatus.InReaction]: '#FFA500', // 新增橙色表
  };

  // 定义处理暂停操作的函数
  const handlePause = (record: any) => {
    Modal.confirm({
      title: '您确定要暂停当前实验吗？',
      content: '',
      onOk() {
        console.log('用户确认暂停实验', record);
        // 这里可以添加实际的暂停实验逻辑
      },
      onCancel() {
        console.log('用户取消暂停实验');
      },
    });
  };

  // 通知agv搬运
  const handleAgvStart = (record: any) => {
    Modal.confirm({
      title: '您确定要开启AGV传送吗？',
      content: '请确保AGV正确连接且已经手动完成称量操作',
      okText: '确定', // 新增确定按钮中文
      cancelText: '取消', // 新增取消按钮中文
      onOk: async () => {
        const result = await startAgvTransport({
          item: record,
          // type表示是去称重台拿料还是从反应台下料
          type: 0,
        });
        if (result) {
          message.info(result.message);
        }
      },
      onCancel() {
        console.log('用户取消AGV');
      },
    });
  };

  // 定义处理暂停操作的函数
  const handleStart = (record: any) => {
    Modal.confirm({
      title: '您确定要开始当前实验吗？',
      content: '',
      okText: '确定', // 新增确定按钮中文
      cancelText: '取消', // 新增取消按钮中文
      onOk: async () => {
        // 修改为对象方法格式
        try {
          // 正确调用 API 方法
          const result = await batchStartExperiments({ ids: [record._id] });
          if (result) {
            message.success('实验瓶分配成功，称重进行中……');
            // 刷新列表
            initTable();
          }
        } catch (error) {
          console.error('开始实验失败:', error);
          Modal.error({ title: '操作失败', content: '无法开始实验，请重试' });
        }
      },
      onCancel() {
        console.log('用户取消暂停实验');
      },
    });
  };

  // 定义表格列
  const columns: any[] = [
    {
      title: '序号',
      search: false,
      render: (text: any, record: any, index: number) => index + 1, // 使用行索引+1
    },
    {
      title: '实验名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '原料信息',
      dataIndex: 'rawMaterials',
      key: 'rawMaterials',
      search: false,
      render: (rawMaterials: Array<string>) => {
        return (
          <span>
            {rawMaterials
              .map(
                (id: string) =>
                  materials.find((m: { _id: string }) => m._id === id)?.name ||
                  '未知原料',
              )
              .join(', ')}
          </span>
        );
      },
    },
    {
      title: '实验瓶信息',
      dataIndex: 'bottleInfo',
      key: 'bottleInfo',
      search: false,
      render: (bottleInfo: Array<{ specification: number; count: number }>) => {
        if (!bottleInfo?.length) return '-';
        return bottleInfo
          .map((item) => {
            const specText = item.specification === 0 ? '8ml试管' : '10ml试管';
            return `${specText}${item.count}个`;
          })
          .join(', ');
      },
    },
    {
      title: '实验瓶ID',
      dataIndex: 'tubeId',
      key: 'tubeId',
      search: {
        transform: (value: string) => ({ tubeId: value }), // 将查询参数转换为后端需要的格式
      },
      render: (_value: string, record: any) => {
        return record.tubeIds?.join(', ') || '-';
      },
    },
    {
      title: '实验温度',
      dataIndex: 'temperature',
      search: false,
      key: 'temperature',
      render: (temp: number) => `${temp}°`,
    },
    {
      title: '反应时间',
      dataIndex: 'reactionTime',
      search: false,
      key: 'reactionTime',
      render: (time: number) => `${time}小时`,
    },
    {
      title: '实验状态',
      dataIndex: 'status',
      key: 'status',
      search: {
        transform: (value: string) => ({
          status: value,
        }),
        valueType: 'select',
        valueEnum: {
          0: { text: '未开始' },
          1: { text: '进行中' },
          3: { text: '备料区就位' },
          4: { text: '反应中' },
          2: { text: '已结束' },
        },
      } as any,
      render: (_text: any, record: any) => (
        <Tag
          color={statusColorMap[record.status as keyof typeof statusColorMap]}
        >
          {statusTextMap[record.status as keyof typeof statusTextMap]}
        </Tag>
      ),
    },
    // 新增完成度列
    {
      title: '完成度',
      key: 'progress',
      search: false,
      render: (_: any, record: any) => {
        // 使用枚举替代魔术数字
        if (record.status === ExperimentStatus.Completed) {
          const duration = dayjs(record.endTime).diff(
            record.startTime,
            'hour',
            true,
          );
          const progress = Math.min(
            (duration / record.reactionTime) * 100,
            100,
          );
          const percentage = progress.toFixed(2) + '%';

          return progress < 100 ? (
            <span style={{ color: '#ff4d4f' }}>{percentage}</span>
          ) : (
            percentage
          );
        }

        if (record.status === ExperimentStatus.NotStarted) return '0%';

        // 合并进行中状态的逻辑
        const startTime = record.startTime ? dayjs(record.startTime) : null;
        if (!startTime) return '0%';

        const duration = dayjs().diff(startTime, 'hour', true);
        return `${Math.min((duration / record.reactionTime) * 100, 100).toFixed(
          2,
        )}%`;
      },
    },
    {
      title: (
        <Space>
          开始时间
          <Tooltip
            title="实验开始时间记录的是进入反应箱的时间"
            trigger="click"
            overlayStyle={{ maxWidth: 250 }}
          >
            <QuestionCircleOutlined
              style={{ color: '#999', cursor: 'pointer' }}
            />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'startTime',
      search: false,
      key: 'startTime',
      render: (text: string, record: any) =>
        record.startTime
          ? dayjs(record.startTime).format('YYYY-MM-DD HH:mm:ss')
          : '—',
    },
    {
      title: (
        <Space>
          结束时间
          <Tooltip
            title="实验结束时间记录的是离开反应箱的时间"
            trigger="click"
            overlayStyle={{ maxWidth: 250 }}
          >
            <QuestionCircleOutlined
              style={{ color: '#999', cursor: 'pointer' }}
            />
          </Tooltip>
        </Space>
      ),
      search: false,
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string, record: any) =>
        record.endTime
          ? dayjs(record.endTime).format('YYYY-MM-DD HH:mm:ss')
          : '—',
    },
    {
      title: (
        <Space>
          操作
          <Tooltip
            title="实验正在进行中或已结束，不能进行编辑"
            trigger="click"
            overlayStyle={{ maxWidth: 250 }}
          >
            <QuestionCircleOutlined
              style={{ color: '#999', cursor: 'pointer' }}
            />
          </Tooltip>
        </Space>
      ),
      key: 'action',
      search: false,
      render: (_: string, record: any) => (
        <Space>
          <Popconfirm
            title={
              <div>
                您确定要复制当前实验吗？
                <br />
                复制以后会自动生成一个与当前实验参数相同的实验
              </div>
            }
            onConfirm={async () => {
              // 解构时排除 _id 字段
              const { _id, ...restRecord } = record;
              const result = await saveOrUpdateExperiment({
                ...restRecord,
                // 默认实验未开始，未分配试管,
                tubeId: '',
                status: 0,
                // 时间都是null
                startTime: null,
                endTime: null,
              });
              if (result) {
                message.success('复制成功');
                initTable();
              }
            }}
            okText="确定"
            cancelText="取消"
          >
            <CopyOutlined style={{ cursor: 'pointer' }} />
          </Popconfirm>
          <Button
            type="link"
            onClick={() => {
              dispatch({
                type: 'experiment/setCurrentExperiment',
                payload: record,
              });
              dispatch({ type: 'experiment/toggleCreateModalVisible' });
            }}
          >
            {record.status !== 0 ? '查看' : '编辑'}
          </Button>
          {record.status == 1 && (
            <Button
              onClick={() => {
                handleAgvStart(record);
              }}
            >
              AGV运输
            </Button>
          )}
          {record.status === 0 && (
            <Button onClick={() => handleStart(record)}>开始</Button>
          )}
          {/* {record.status === 1 && (
            <Button danger onClick={() => handlePause(record)}>
              暂停
            </Button>
          )} */}
        </Space>
      ),
    },
  ];

  const dispatch = useDispatch();

  const initTable = async (
    params: { pageSize?: number; pageNum?: number } = {},
  ) => {
    const { pageSize = 10, pageNum = 1 } = params;
    const result = await queryExperiments({ pageSize, pageNum });
    if (result) {
      actionRef.current?.reload(); // 触发表格刷新
      // 清空选中的行
      setSelectedRowKeys([]);
      setDataSource(result.data || []);
    }
  };

  const initMaterials = async () => {
    const result = await queryMaterials();
    if (result.length > 0) {
      // 根据错误提示，dispatch 函数期望 1 个参数，这里将参数改为对象形式
      dispatch({ type: 'experiment/setMaterials', payload: result });
    }
  };

  const init = async () => {
    await initMaterials();
  };

  useEffect(() => {
    //初始化，获取实验信息
    init();
  }, []);

  return ( 
    <div>
      <div
        style={{
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontSize: '18px', color: 'black', marginRight: '16px' }}>
          实验管理
        </h1>
        <Space>
          <Popconfirm
            title="确定要批量删除选中实验吗？"
            onConfirm={async () => {
              const result = await batchDeleteExperiments({
                ids: selectedRowKeys,
              });
              if (result) {
                message.success('删除成功');
                // 刷新列表
                initTable();
              }
            }}
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              danger
              disabled={
                selectedRowKeys.length === 0 ||
                !selectedRowKeys.every((key) => {
                  const exp = dataSource.find((e) => e._id === key);
                  // 只有已结束或者未开始的，才可以被删除
                  return (
                    exp?.status === ExperimentStatus.Completed ||
                    exp?.status === ExperimentStatus.NotStarted
                  );
                })
              }
            >
              批量删除
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            onClick={async () => {
              const result = await batchStartExperiments({
                ids: selectedRowKeys,
              });
              if (result) {
                message.info(result.message);
                initTable();
              }
            }}
            disabled={
              selectedRowKeys.length === 0 ||
              !selectedRowKeys.every((key) => {
                const exp = dataSource.find((e) => e._id === key);
                // 检查实验状态是否为已结束或未开始
                return (
                  exp?.status === ExperimentStatus.Completed ||
                  exp?.status === ExperimentStatus.NotStarted
                );
              })
            }
          >
            批量开始
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              Modal.confirm({
                title: `确定要批量运输${selectedRowKeys.length}个实验吗？`,
                content: '请确保AGV设备已就位且实验处于可运输状态',
                onOk: async () => {
                  try {
                    const items = dataSource.filter((exp: any) =>
                      selectedRowKeys.includes(exp._id),
                    );
                    const result = await batchAgvTransport({
                      items: items.map((item: any) => ({
                        _id: item._id,
                        tubeId: item.tubeIds.join(''),
                      })),
                    });
                    if (result) {
                      message.info(result.message);
                      initTable();
                    }
                  } catch (error) {
                    console.error('批量运输失败:', error);
                  }
                },
              });
            }}
            disabled={
              selectedRowKeys.length === 0 ||
              !selectedRowKeys.every((key) => {
                const exp = dataSource.find((e) => e._id === key);
                // 检查实验状态是否为已结束或进行中
                return (
                  exp?.status === ExperimentStatus.Completed ||
                  exp?.status === ExperimentStatus.Ongoing
                );
              })
            }
          >
            批量AGV运输
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              dispatch({ type: 'experiment/toggleCreateModalVisible' });
            }}
          >
            新增
          </Button>
        </Space>
      </div>
      {/* <div style={{ marginBottom: 16 }}>
        <Card>
          <Space size="large">
            <Statistic
              title="总产能"
              value={dataSource
                .filter(item => item.status === ExperimentStatus.Completed)
                .reduce((total, record) => {
                  const validHours = dayjs(record.endTime).diff(record.startTime, 'hour', true);
                  return total + (record.bottleInfo?.reduce((sum: number, bottle: any) =>
                    sum + (bottle.count / record.reactionTime) * validHours, 0) || 0);
                }, 0)
                .toFixed(2)}
              suffix="瓶/时"
            />
            <Statistic title="进行中实验" value={dataSource.filter(item => item.status === ExperimentStatus.Ongoing).length} />
            <Statistic title="已完成实验" value={dataSource.filter(item => item.status === ExperimentStatus.Completed).length} />
          </Space>
        </Card>
      </div> */}
      <ProTable
        rowKey="_id"
        actionRef={actionRef} // 绑定 action 引用
        // 启用搜索表单
        search={{
          layout: 'inline',
          labelWidth: 'auto',
          collapsed: false,
          collapseRender(collapsed, props, intl, hiddenNum) {
            return null;
          },
        }}
        toolBarRender={false}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys) =>
            setSelectedRowKeys(newSelectedRowKeys),
          getCheckboxProps: (record) => ({
            disabled: record.status === ExperimentStatus.InReaction,
          }),
        }}
        request={async (params) => {
          const result = await queryExperiments({
            pageNum: params.current,
            pageSize: params.pageSize,
            ...(params.tubeId && { tubeId: params.tubeId }),
            ...(params.name && { name: params.name }),
            ...(params.status && { status: params.status }),
          });
          setDataSource(result.data || []);
          if (result) {
            return {
              data: result.data,
              total: result.total,
              success: true,
            };
          } else {
            return {
              data: [],
            };
          }
        }}
        // 配置分页，默认每页显示 10 条数据
        pagination={{
          defaultPageSize: 10,
        }}
      />
      <CreateExperimentModal refresh={initTable} />
    </div>
  );
};

export default ExperimentManagement;
