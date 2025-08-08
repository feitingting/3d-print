import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Input, DatePicker, Button, Form } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import { queryProductions } from '@/api';
import { px2vw } from '@/utils/pxConversion';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;
interface ProductionRecord {
  key: number;
  tubeId: string;
  position: string;
  dose: number;
  temperature: string;
  startTime: Dayjs;
  endTime: Dayjs;
  experimentName: string;
}

const ProductionRecordTable: React.FC = () => {
  const columns: ProColumns<ProductionRecord>[] = [
    {
      title: '反应瓶ID',
      dataIndex: 'tubeId',
      key: 'tubeId',
      width: `${px2vw(250)}`,
      search: {
        transform: (value: unknown) => value,
      },
    },
    {
      title: '位置',
      dataIndex: 'position',
      key: 'position',
      search: false,
    },
    {
      title: '剂量',
      dataIndex: 'dose',
      key: 'dose',
      search: false,
    },
    {
      title: '温度',
      dataIndex: 'temperature',
      key: 'temperature',
      search: false,
      render: (_, record) => `${record.temperature}°C`, // 添加单位显示
    },
    // 新增实验ID列
    //  {
    //   title: '实验ID',
    //   dataIndex: 'experimentId',
    //   key: 'experimentId',
    //   width: `${px2vw(200)}`,
    //   search: false,
    // },
    // 新增实验名称列
    {
      title: '实验名称',
      dataIndex: 'experimentName',
      key: 'experimentName',
      width: `${px2vw(300)}`,
      search: false,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      valueType: 'dateTime',
      width: `${px2vw(250)}`,
      search: false,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: `${px2vw(250)}`,
      valueType: 'dateTime',
      search: false,
    },
  ];

  return (
    <div>
      <ProTable
        cardBordered
        search={{
          layout: 'inline',
          labelWidth: 'auto',
          collapsed: false,
          collapseRender(collapsed, props, intl, hiddenNum) {
            return null;
          },
          // 自定义搜索域内容,添加额外的搜索项
          optionRender: ({ searchText, resetText }, { form }, dom) => [
            <Form.Item
              // 设置宽度
              style={{ width: `${px2vw(300)}` }}
              label="日期范围" // 可根据实际需求修改标签文本
              name="dateRange" // 表单字段名
            >
              <RangePicker
                picker="date"
                format="YYYY-MM-DD"
                onChange={() => {}}
              />
            </Form.Item>,
            <Button
              key="searchText"
              type="primary"
              onClick={() => {
                form?.submit();
              }}
            >
              {searchText}
            </Button>,
            <Button
              key="resetText"
              onClick={() => {
                form?.resetFields();
              }}
            >
              {resetText}
            </Button>,
          ],
          // 添加 style 属性让搜索域左对齐
          style: {
            justifyContent: 'flex-start',
          },
        }}
        request={async (params) => {
          // 显式设置分页参数
          const { current = 1, pageSize = 10, ...queryParams } = params;
          const result = await queryProductions({
            pageNum: current, // 使用ProTable的当前页码
            pageSize,
            // 包含其他查询参数
            ...(queryParams.tubeId && {
              tubeId: queryParams.tubeId,
            }),
            // 时间范围
            ...(queryParams.dateRange?.length > 0 && {
              startTime: dayjs(queryParams.dateRange[0])
                .startOf('day')
                .format('YYYY-MM-DD HH:mm:ss'), // 显式格式化
              endTime: dayjs(queryParams.dateRange[1])
                .endOf('day')
                .format('YYYY-MM-DD HH:mm:ss'),
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
        // 配置分页，默认每页显示 10 条数据
        pagination={{
          defaultPageSize: 10,
        }}
        columns={columns}
        headerTitle="生产记录"
      />
    </div>
  );
};

export default ProductionRecordTable;
