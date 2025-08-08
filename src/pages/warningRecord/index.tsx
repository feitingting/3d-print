import React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Breadcrumb,
  Progress,
  Tag,
  Button,
} from 'antd';
import { DefaultRootState } from 'react-redux';
import styled from 'styled-components';
import styles from './index.module.scss';
import { ProTable, ProColumns } from '@ant-design/pro-components';

interface RootState extends DefaultRootState {
  main: string; // 根据实际情况修改类型
}

// 定义正方形反应堆组件
const SquareReactor = styled.div`
  position: relative;
  width: 250px;
  height: 250px;
  border: 1px solid #ccc;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.3);
`;

// ... 已有代码 ...

// 模拟 20 条报警数据
const mockData = Array.from({ length: 20 }, (_, index) => ({
  key: index,
  alarmInfo: `报警信息 ${index + 1}`,
  solution: `解决方案 ${index + 1}`,
  alarmTime: new Date(Date.now() - index * 3600 * 1000).toLocaleString(),
}));

// ProTable 列配置
const columns: ProColumns<{
  alarmInfo: string;
  solution: string;
  alarmTime: string;
}>[] = [
  {
    title: '报警信息',
    dataIndex: 'alarmInfo',
    key: 'alarmInfo',
    search: true,
    ellipsis: true,
  },
  {
    title: '解决方案',
    dataIndex: 'solution',
    key: 'solution',
    search: true,
    ellipsis: true,
  },
  {
    title: '报警时间',
    dataIndex: 'alarmTime',
    key: 'alarmTime',
    search: true,
    ellipsis: true,
  },
];

const AlarmRecordTable: React.FC = () => {
  return (
    <ProTable
      columns={columns}
      dataSource={mockData}
      search={{
        labelWidth: 100,
      }}
      // 配置分页，默认每页显示 10 条数据
      pagination={{
        defaultPageSize: 10,
      }}
      headerTitle="报警记录"
    />
  );
};

export default AlarmRecordTable;
