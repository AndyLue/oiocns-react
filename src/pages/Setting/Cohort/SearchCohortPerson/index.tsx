import React, { useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import cls from './index.module.less';
import { Input, Tooltip } from 'antd';
import { schema } from '@/ts/base';
import CardOrTable from '@/components/CardOrTableComp';
import type { ProColumns } from '@ant-design/pro-components';
import { ICohort } from '@/ts/core/target/itarget';
interface indexType {
  searchCallback: Function;
  cohort: ICohort;
}

const CohortPerson: React.FC<indexType> = (props) => {
  useEffect(() => {}, []);

  const [value, setValue] = useState<string>('');

  const keyWordChange = async (e: any) => {
    setValue(e.target.value);
  };

  const cohortColumn: ProColumns<any>[] = [
    {
      title: '序号',
      fixed: 'left',
      dataIndex: 'index',
      width: 50,
      render: (_key: any, _record: any, index: number) => {
        return index + 1;
      },
    },
    {
      title: '账号',
      dataIndex: 'code',
    },
    {
      title: '昵称',
      dataIndex: 'name',
    },
    {
      title: '姓名',
      dataIndex: ['team', 'name'],
    },
    {
      title: '手机号',
      dataIndex: ['team', 'code'],
    },
    {
      title: '座右铭',
      dataIndex: ['team', 'remark'],
    },
  ];

  return (
    <>
      <div style={{ paddingBottom: '16px' }}>
        <Input
          className={cls['search-person-input']}
          placeholder="请输入用户账号"
          suffix={
            <Tooltip title="搜索用户">
              <SearchOutlined />
            </Tooltip>
          }
          value={value}
          onChange={keyWordChange}
        />
      </div>
      <CardOrTable<schema.XTarget>
        dataSource={[]}
        width={400}
        params={{ filter: value }}
        request={(page) => props.cohort.loadMembers(page)}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        showChangeBtn={false}
        hideOperation={true}
        columns={cohortColumn as any}
        rowKey={'id'}
      />
    </>
  );
};

export default CohortPerson;
