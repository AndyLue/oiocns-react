import React, { useState } from 'react';
import CardOrTable from '@/components/CardOrTableComp';
import cls from './index.module.less';
import Title from 'antd/lib/typography/Title';
import { Modal, Button, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { schema } from '@/ts/base';
import userCtrl from '@/ts/controller/setting/userCtrl';
import SearchPerson from '@/bizcomponents/SearchPerson';
import { useHistory } from 'react-router-dom';
import useCtrlUpdate from '@/hooks/useCtrlUpdate';
import { emitter } from '@/ts/core';

interface OperationType {
  key: string;
  label: any;
  onClick: () => void;
}
const columns: ColumnsType<any> = [
  {
    title: '好友名称',
    dataIndex: 'team.name',
    key: 'name',
    render: (_, person) => person.team?.name,
  },
  {
    title: '账号',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '昵称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '手机号',
    dataIndex: 'team.code',
    key: 'team.code',
    render: (_, person) => person.team?.code,
  },
  {
    title: '座右铭',
    dataIndex: 'team.remark',
    key: 'team.remark',
    render: (_, person) => person.team?.remark,
  },
];

/**
 * 好友设置
 * @returns
 */
const PersonFriend: React.FC = () => {
  const [key, forceUpdate] = useCtrlUpdate(emitter);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friend, setFriend] = useState<schema.XTarget>();

  const history = useHistory();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
    console.log(friend);
    await userCtrl.user.applyFriend(friend!);
    message.success('发起成功');
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 搜索回调
  const searchCallback = (person: schema.XTarget) => {
    setFriend(person);
  };
  const renderOperation = (item: schema.XTarget): OperationType[] => {
    return [
      {
        key: 'remove',
        label: <span style={{ color: 'red' }}>移除</span>,
        onClick: async () => {
          await userCtrl.user.removeMember(item);
          forceUpdate();
        },
      },
    ];
  };
  const top = (
    <div className={cls['person-friend-top']}>
      <Title level={4}>
        <strong>我的好友</strong>
      </Title>
      <div>
        <Button type="link" onClick={showModal}>
          添加好友
        </Button>

        <Button
          type="link"
          onClick={() => {
            history.push('/todo/friend');
          }}>
          查看申请
        </Button>
      </div>
    </div>
  );
  return (
    <div className={cls['person-friend-container']}>
      {top}
      <CardOrTable
        dataSource={[]}
        total={0}
        params={key}
        request={async (page) => {
          return await userCtrl.user.loadMembers(page);
        }}
        operation={renderOperation}
        columns={columns as any}
        rowKey={'id'}
      />
      <Modal
        title="添加好友"
        okButtonProps={{ disabled: !friend }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={500}>
        <div>{<SearchPerson searchCallback={searchCallback}></SearchPerson>}</div>
      </Modal>
    </div>
  );
};

export default PersonFriend;
