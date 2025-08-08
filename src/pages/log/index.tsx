import { QuestionCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Dropdown, Space, Tag, Popover, Tooltip } from 'antd';
import { useRef } from 'react';
import dayjs from 'dayjs';
import { queryLogs } from '@/api';

export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

// 定义新的数据类型
type NewTableItem = {
  _id: string;
  tubeId: string;
  dose: string;
  temperature: number;
  operatorType: number;
  pos1: string;
  pos2: string;
  pos3: string;
  startTime: Date;
  // 备注
  remark: string;
};

const columns: ProColumns<NewTableItem>[] = [
  {
    title: '编号',
    dataIndex: 'tubeId',
    copyable: true,
    ellipsis: true,
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
    search: {
      transform: (value) => ({ tubeId: value }),
    },
  },
  {
    title: '剂量',
    dataIndex: 'dose',
    ellipsis: true,
    // 显式设置不支持搜索
    search: false,
  },
  {
    title: '温度',
    dataIndex: 'temperature',
    ellipsis: true,
    search: false,
    render: (_, record) => `${record.temperature}°C`, // 添加单位显示
  },
  {
    title: '备料区位置',
    dataIndex: 'pos1',
    ellipsis: true,
    search: false,
  },
  {
    title: '拌料区位置',
    dataIndex: 'pos2',
    ellipsis: true,
    search: false,
  },
  {
    title: '下料区位置',
    dataIndex: 'pos3',
    ellipsis: true,
    search: false,
  },
  {
    title: '操作类型',
    dataIndex: 'operatorType',
    ellipsis: true,
    search: {
      transform: (value: string) => ({
        operatorType: value === 'auto' ? 0 : 1,
      }),
      valueType: 'select',
      valueEnum: {
        auto: { text: '自动' },
        manual: { text: '人工' },
      },
    } as any,
    render: (text, record) => (
      <span>{record.operatorType == 0 ? '自动' : '人工'}</span>
    ),
  },
  {
    title: '时间',
    dataIndex: 'startTime',
    search: false,
    hideInSearch: true,
    render: (text, record) => {
      return (
        <span>{dayjs(record.startTime).format('YYYY-MM-DD HH:mm:ss')}</span>
      ); 
    },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    search: false,
  },
];

// 在组件渲染前添加描述常量
const tableDescription = `日志记录的是单个反应瓶从上料区进入反应箱或从反应箱进入下料区的瞬时过程。`;

export default () => {
  const actionRef = useRef<ActionType>();
  return (
    <ProTable<NewTableItem>
      columns={columns}
      toolBarRender={false}
      actionRef={actionRef}
      cardBordered
      request={async (params) => {
        // 计算分页偏移量
        const pageNum = params.current || 1;
        const pageSize = params.pageSize || 10;
        const result = await queryLogs({
          pageNum,
          pageSize,
          ...(params.tubeId && { tubeId: params.tubeId }),
          ...(params.operatorType != undefined && {
            operatorType: params.operatorType,
          }),
        });
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
      columnsState={{
        persistenceKey: 'pro-table-singe-demos',
        persistenceType: 'localStorage',
        defaultValue: {
          option: { fixed: 'right', disable: true },
        },
      }}
      rowKey="id"
      search={{
        // layout:'inline',
        collapsed: false,
        labelWidth: 'auto',
        // span:6,
        span: { xs: 24, sm: 12, md: 8, lg: 4, xl: 4, xxl: 4 },
        collapseRender(collapsed, props, intl, hiddenNum) {
          return null;
        },
      }}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      pagination={{
        pageSize: 10,
        onChange: (page) => console.log(page),
      }}
      dateFormatter="string"
      headerTitle={
        <Space>
          日志记录
          <Tooltip
            title={tableDescription}
            trigger="click"
            overlayStyle={{ maxWidth: 300 }}
          >
            <QuestionCircleOutlined
              style={{
                color: '#999',
                cursor: 'pointer',
                marginLeft: 8,
              }}
            />
          </Tooltip>
        </Space>
      }
    />
  );
};
