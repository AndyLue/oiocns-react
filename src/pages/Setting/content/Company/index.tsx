import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Dropdown,
  message,
  Modal,
  Space,
  Typography,
} from 'antd';
import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import userCtrl from '@/ts/controller/setting';
import { ICompany, TargetType } from '@/ts/core';
import { schema } from '@/ts/base';
import {
  DictColumns,
  DictItemColumns,
  GroupColumn,
  PersonColumns,
  PropertyColumns,
} from '../../config/columns';
import CardOrTable from '@/components/CardOrTableComp';
import PageCard from '@/components/PageCard';
import IndentityManage from '@/bizcomponents/Indentity';
import cls from './index.module.less';
import SearchCompany from '@/bizcomponents/SearchCompany';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import { IsRelationAdmin, IsSuperAdmin, IsThingAdmin } from '@/utils/authority';
import { Property } from '@/ts/core/thing/property';
import { XDict, XDictItem, XProperty } from '@/ts/base/schema';
import { Dict } from '@/ts/core/thing/dict';
import DictModal from '../../components/dict/dictModal';
import DictItemModal from '../../components/dict/dictItemModal';
import { DictModel, PropertyModel } from '@/ts/base/model';
import Authority from '../../components/authority';
import PropertyModal from '../../components/propertyModal';

interface IProps {
  current: ICompany;
}
/**
 * 单位信息
 * @returns
 */
const CompanySetting: React.FC<IProps> = ({ current }) => {
  const [ellipsis] = useState(true);
  const parentRef = useRef<any>(null);
  const [key, forceUpdate] = useObjectUpdate(current);
  const [isSuperAdmin, SetIsSuperAdmin] = useState(false);
  const [isRelationAdmin, SetIsRelationAdmin] = useState(false);
  const [isThingAdmin, SetIsThingAdmin] = useState(false);
  const [activeModal, setActiveModal] = useState<string>(''); // 模态框
  const [activeTab, setActiveTab] = useState<string>('');
  const [selectPerson, setSelectPerson] = useState<schema.XTarget[]>(); // 需要邀请的部门成员
  const [dict, setDict] = useState<XDict>();
  const [dictItem, setDictItem] = useState<XDictItem>();
  const [property, setProperty] = useState<XProperty>();
  const dictOperate = new Dict(current.id);
  const propertyOperate = new Property(current.id);

  useEffect(() => {
    if (TitleItems.findIndex((a) => a.key == userCtrl.currentTabKey) < 0) {
      setActiveTab('members');
    } else {
      setActiveTab(userCtrl.currentTabKey);
    }
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      SetIsSuperAdmin(await IsSuperAdmin(current));
      SetIsThingAdmin(await IsThingAdmin(current));
      SetIsRelationAdmin(await IsRelationAdmin(current));
    }, 10);
  }, [current]);

  const menu = [
    { key: 'auth', label: '认证' },
    {
      key: 'quit',
      label: <span style={{ color: 'red' }}>退出</span>,
      onClick: async () => {
        Modal.confirm({
          title: `是否退出${current.name}?`,
          icon: <ExclamationCircleOutlined />,
          okText: '确认',
          okType: 'danger',
          cancelText: '取消',
          async onOk() {
            const success = await userCtrl.user.quitCompany(current.id);
            if (success) {
              message.success(`退出${current.name}单位成功!`);
              userCtrl.setCurSpace(userCtrl.user.target.id);
            } else {
              message.error('退出单位失败!');
            }
          },
          onCancel() {},
        });
      },
    },
  ];
  // 标题tabs页
  const TitleItems = [
    {
      tab: `单位的成员`,
      key: 'members',
    },
    {
      tab: `加入的集团`,
      key: 'groups',
    },
  ];

  const dictItemRender = (dict: XDict) => {
    return (
      <CardOrTable<schema.XDictItem>
        key="groups"
        rowKey={'id'}
        pagination={false}
        dataSource={[]}
        defaultExpandAllRows={true}
        operation={(item) => {
          return isThingAdmin
            ? [
                {
                  key: 'edit',
                  label: '编辑',
                  onClick: async () => {
                    setDictItem(item);
                    setActiveModal('dictItem');
                  },
                },
                {
                  key: 'remove',
                  label: '删除',
                  onClick: async () => {
                    if (await dictOperate.deleteDictItem(item.id)) {
                      message.success('删除成功');
                      forceUpdate();
                    }
                  },
                },
              ]
            : [];
        }}
        columns={DictItemColumns}
        showChangeBtn={false}
        request={async (page) => {
          return new Dict(current.id).loadDictItem(dict.id, page);
        }}
      />
    );
  };

  const content = () => {
    switch (activeTab) {
      case 'members':
        return (
          <CardOrTable<schema.XTarget>
            dataSource={[]}
            key="member"
            rowKey={'id'}
            request={(page) => {
              return userCtrl.space.loadMembers(page);
            }}
            parentRef={parentRef}
            operation={(item) => {
              return isSuperAdmin
                ? [
                    {
                      key: 'remove',
                      label: '踢出',
                      onClick: async () => {
                        if (await userCtrl.space.removeMember(item)) {
                          message.success('踢出成功');
                          forceUpdate();
                        }
                      },
                    },
                  ]
                : [];
            }}
            columns={PersonColumns}
            showChangeBtn={false}
          />
        );
      case 'groups':
        return (
          <CardOrTable<schema.XTarget>
            key="groups"
            rowKey={'id'}
            pagination={false}
            dataSource={[]}
            defaultExpandAllRows={true}
            request={async (page) => {
              const targets = await current.getJoinedGroups();
              return {
                result: targets?.map((i) => i.target),
                limit: page.limit,
                offset: page.offset,
                total: targets?.length ?? 0,
              };
            }}
            hideOperation={true}
            columns={GroupColumn}
            showChangeBtn={false}
          />
        );
    }
  };

  return (
    <div className={cls.companyContainer}>
      <Card bordered={false} className={cls['company-info-content']} extra={[]}>
        <Descriptions
          title={'当前单位'}
          bordered
          size="middle"
          column={2}
          labelStyle={{ textAlign: 'center', width: '200px' }}
          extra={[
            <Dropdown menu={{ items: menu }} placement="bottom" key="more">
              <EllipsisOutlined
                style={{ fontSize: '20px', marginLeft: '10px', cursor: 'pointer' }}
                rotate={90}
              />
            </Dropdown>,
          ]}>
          <Descriptions.Item label="单位名称" contentStyle={{ textAlign: 'center' }}>
            <Space>
              {current.shareInfo.avatar && (
                <Avatar src={current.shareInfo.avatar.thumbnail} />
              )}
              <strong>{current.teamName}</strong>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item
            label="社会统一信用代码"
            contentStyle={{ textAlign: 'center' }}>
            {current.target.code}
          </Descriptions.Item>
          <Descriptions.Item label="团队简称" contentStyle={{ textAlign: 'center' }}>
            {current.name}
          </Descriptions.Item>
          <Descriptions.Item label="团队代号" contentStyle={{ textAlign: 'center' }}>
            {current.teamName}
          </Descriptions.Item>
          <Descriptions.Item label="单位简介" span={2}>
            <Typography.Paragraph
              ellipsis={ellipsis ? { rows: 2, expandable: true, symbol: '更多' } : false}>
              {current.target.team?.remark}
            </Typography.Paragraph>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className={cls['pages-wrap']}>
        <PageCard
          key={key}
          bordered={false}
          activeTabKey={activeTab}
          tabList={TitleItems}
          onTabChange={(key) => {
            userCtrl.currentTabKey = key;
            setActiveTab(key);
          }}
          tabBarExtraContent={
            <>
              <Button type="link" onClick={() => setActiveModal('indentity')}>
                角色设置
              </Button>
              {isRelationAdmin && (
                <>
                  <Button type="link" onClick={() => setActiveModal('addOne')}>
                    邀请成员
                  </Button>
                  <Button type="link" onClick={() => setActiveModal('joinGroup')}>
                    加入集团
                  </Button>
                </>
              )}
            </>
          }>
          <div className={cls['page-content-table']} ref={parentRef}>
            {content()}
          </div>
        </PageCard>
      </div>
      <IndentityManage
        isAdmin={isSuperAdmin}
        open={activeModal === 'indentity'}
        current={userCtrl.space}
        onCancel={() => setActiveModal('')}
      />
      {/* 邀请成员*/}
      <Modal
        title="邀请成员"
        destroyOnClose
        open={activeModal === 'addOne'}
        width={600}
        onCancel={() => setActiveModal('')}
        onOk={async () => {
          if (selectPerson && userCtrl.company) {
            const success = await userCtrl.company.pullMembers(
              selectPerson.map((n) => n.id),
              selectPerson[0].typeName,
            );
            if (success) {
              setActiveModal('');
              message.success('添加成功');
              userCtrl.changCallback();
            } else {
              message.error('添加失败');
            }
          }
        }}>
        <SearchCompany searchCallback={setSelectPerson} searchType={TargetType.Person} />
      </Modal>
      {/* 申请加入集团*/}
      <Modal
        title="申请加入集团"
        destroyOnClose
        open={activeModal === 'joinGroup'}
        width={600}
        onCancel={() => setActiveModal('')}
        onOk={async () => {
          if (selectPerson && userCtrl.company) {
            selectPerson.forEach(async (group) => {
              const success = await userCtrl.company.applyJoinGroup(group.id);
              if (success) {
                message.success('添加成功');
                userCtrl.changCallback();
                setActiveModal('');
              } else {
                message.error('添加失败');
              }
            });
          }
        }}>
        <SearchCompany searchCallback={setSelectPerson} searchType={TargetType.Group} />
      </Modal>
    </div>
  );
};

export default CompanySetting;
