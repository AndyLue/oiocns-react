import type { ProFormColumnsType } from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import cls from './index.module.less';
import React from 'react';
import { Space } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { ProductType } from '@/ts/core';

type Resources = {
  name: string;
  code: string;
  link: string;
  privateKey: string;
  customId: number;
  flows: Flows[];
  components: Components[];
};
type Field = {
  name: string;
  code: string;
  type: string;
  customId: number;
};
type Flows = {
  business: string;
  customId: number;
  field: Field[];
};
type Components = {
  name: string;
  url: string;
  width: string;
  height: string;
  customId: number;
};

const valueEnum = {
  all: { text: '全部', status: 'Default' },
  open: {
    text: '未解决',
    status: 'Error',
  },
  closed: {
    text: '已解决',
    status: 'Success',
    disabled: true,
  },
  processing: {
    text: '解决中',
    status: 'Processing',
  },
};

type DataItem = {
  name: string;
  // state: string;
  code: string;
  remark: string;
  typeName: string;
  resources: Resources[];
};
const groupTitle = (name: string) => {
  return (
    <Space className={cls[`new-store-title`]} size={8}>
      <div className={cls[`new-store-title-before`]}></div>
      <span className={cls[`new-store-info`]}>{name}</span>
    </Space>
  );
};
/**
 * 基础信息Columns
 */
const baseColumns: ProFormColumnsType<DataItem> = {
  title: groupTitle('基础信息'),
  tooltip: '基础信息',
  valueType: 'group',
  width: 'md',
  colProps: { md: 24 },
  columns: [
    {
      title: '应用名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
      width: 'md',
    },
    {
      title: '应用编码',
      dataIndex: 'code',
      colProps: { span: 12 },
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
    },
    {
      title: '应用类型',
      dataIndex: 'typeName',
      valueType: 'select',
      valueEnum: ProductType,
      colProps: { span: 24 },
    },
    {
      title: '应用详情',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
    },
  ],
};

/**
 * 流程信息相关Columns 组合：
 * 业务信息+ 流程字段 +字段类型为枚举时的Columns
 */
const flows: ProFormColumnsType<Flows> = {
  title: groupTitle(`业务信息`),
  valueType: 'formList',
  dataIndex: 'flows',
  width: '100%',
  colProps: { md: 24 },
  tip: '创建应用成功后，可根据业务信息与流程绑定。',
  fieldProps: {
    // 新增按钮样式配置
    creatorButtonProps: {
      type: 'text',
      position: 'top',
      creatorButtonText: '',
      block: false,
      className: cls.addFormListBtn2,
      title: '添加新业务',
    },
    copyIconProps: false,
    deleteIconProps: {
      Icon: CloseCircleOutlined,
      tooltipText: '删除该业务',
    },
    itemRender: ({ listDom, action }: any, { record, index }: any) => {
      //
      return (
        <ProCard
          bordered
          extra={action}
          title={record?.business || `业务${index + 1}`}
          style={{
            marginBlockEnd: 8,
          }}>
          {listDom}
        </ProCard>
      );
    },
  },
  columns: [
    {
      title: '业务信息',
      dataIndex: 'business',
      width: 'md',
    },
  ],
};

/**
 * @name componentsColumns 应用组件Columns
 */
const componentsColumns: ProFormColumnsType<Components> = {
  title: groupTitle(`应用组件`),
  valueType: 'formList',
  dataIndex: 'components',
  width: '100%',
  colProps: { md: 24 },
  fieldProps: {
    // 新增按钮样式配置
    creatorButtonProps: {
      type: 'text',
      position: 'top',
      creatorButtonText: '',
      block: false,
      className: cls.addFormListBtn2,
    },
    copyIconProps: false,
    deleteIconProps: {
      tooltipText: '删除该组组件信息',
    },
  },
  columns: [
    {
      valueType: 'group',
      width: 'md',
      colProps: { md: 24, xs: 8 },
      rowProps: { gutter: 48 },
      columns: [
        {
          title: '组件名称',
          dataIndex: 'name',
          width: 'md',
          colProps: { span: 8 },
        },

        {
          title: '组件宽度',
          width: 'md',
          colProps: { span: 8 },
          dataIndex: 'width',
        },
        {
          title: '组件高度',
          width: 'md',
          colProps: { span: 8 },
          dataIndex: 'height',
        },
        {
          title: '链接地址',
          colProps: { span: 24 },
          dataIndex: 'url',
        },
      ],
    },
  ],
};

/**
 * @name sourceColumns 资源信息Columns
 * 流程信息Columns + 应用组件Columns
 *
 */
const sourceColumns: ProFormColumnsType<Resources> = {
  title: groupTitle(`资源信息`),
  valueType: 'formList',
  dataIndex: 'resources',
  colProps: { md: 24 },
  initialValue: [{ name: '', code: '', link: '' }],

  fieldProps: {
    // 新增按钮样式配置
    creatorButtonProps: {
      type: 'text',
      position: 'top',
      creatorButtonText: '',
      block: false,
      className: cls.addFormListBtn2,
    },
    // convertValue: (value) => JSON.parse(value),
    itemRender: ({ listDom, action }: any, { record, index }: any) => {
      return (
        <ProCard
          bordered
          extra={action}
          title={record?.name || `资源 ${index + 1}`}
          style={{
            marginBlockEnd: 8,
          }}>
          {listDom}
        </ProCard>
      );
    },
    rules: [
      {
        required: true,
        validator: async (_: any, value: string | any[]) => {
          console.log(value);
          if (value && value.length > 0) {
            return;
          }
          throw new Error('至少要有一项资源信息！');
        },
      },
    ],
  },
  columns: [
    {
      dataIndex: 'sourceBase',
      valueType: 'group',
      width: 'md',
      colProps: { md: 24 },
      rowProps: { gutter: 48 },
      columns: [
        {
          title: '资源名称',
          dataIndex: 'name',
          colProps: { span: 12 },
          formItemProps: {
            rules: [
              {
                required: true,
                message: '此项为必填项',
              },
            ],
          },
        },
        {
          title: '资源编码',
          colProps: { span: 12 },
          dataIndex: 'code',
          formItemProps: {
            rules: [
              {
                required: true,
                message: '此项为必填项',
              },
            ],
          },
        },
        {
          title: '资源地址',
          colProps: { span: 24 },
          dataIndex: 'link',
          formItemProps: {
            rules: [
              {
                required: true,
                message: '此项为必填项',
              },
            ],
          },
        },
      ],
    },
    flows as Resources,
    componentsColumns as Resources,
  ],
};

/**
 * 组合后的Columns  基础信息+资源信息
 */
const columns: ProFormColumnsType<DataItem>[] = [baseColumns, sourceColumns as DataItem];

export { columns, sourceColumns, valueEnum };

export type { Components, DataItem, Field, Flows, Resources };
