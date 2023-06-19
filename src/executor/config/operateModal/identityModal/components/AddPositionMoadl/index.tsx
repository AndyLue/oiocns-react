import React, { useRef } from 'react';
import { message } from 'antd';
import { ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
import SchemaForm from '@/components/SchemaForm';
import { XIdentity } from '@/ts/base/schema';
import { IIdentity, ITarget } from '@/ts/core';

/*
  编辑
*/
interface Iprops {
  title: string;
  open: boolean;
  handleCancel: () => void;
  handleOk: () => void;
  editData?: IIdentity;
  current: ITarget;
}
const EditCustomModal = (props: Iprops) => {
  const { open, title, handleOk, current, editData, handleCancel } = props;
  const formRef = useRef<ProFormInstance>();
  const columns: ProFormColumnsType<XIdentity>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
    {
      title: '角色编号',
      dataIndex: 'code',
      formItemProps: {
        rules: [{ required: true, message: '编码为必填项' }],
      },
    },
    {
      title: '设置权限',
      dataIndex: 'authId',
      colProps: { span: 24 },
      valueType: 'treeSelect',
      formItemProps: { rules: [{ required: true, message: '设置权限为必填项' }] },
      request: async () => {
        const data = await current.space.loadSuperAuth(false);
        return data ? [data.metadata] : [];
      },
      fieldProps: {
        disabled: title === '编辑',
        fieldNames: { label: 'name', value: 'id', children: 'nodes' },
        showSearch: true,
        filterTreeNode: true,
        treeNodeFilterProp: 'name',
        treeDefaultExpandAll: true,
      },
    },

    {
      title: '角色简介',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
    },
  ];

  return (
    <SchemaForm<XIdentity>
      formRef={formRef}
      title={title}
      open={open}
      width={520}
      onOpenChange={(open: boolean) => {
        if (open) {
          if (editData) {
            formRef.current?.setFieldsValue({ ...editData.metadata });
          }
        } else {
          formRef.current?.resetFields();
          handleCancel();
        }
      }}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onFinish={async (values) => {
        if (title === '新增') {
          const res = await current.createIdentity({
            id: values.id,
            shareId: values.shareId,
            name: values.name,
            code: values.code,
            remark: values.remark,
            authId: values.authId,
          });
          if (res) {
            message.success('新增成功');
            handleOk();
          } else {
            message.error('新增失败');
            return false;
          }
        } else {
          if (!editData) return;
          const res = await editData.update({ ...editData.metadata, ...values });
          if (res) {
            message.success('修改成功');
            handleOk();
          }
        }
      }}
      columns={columns}
    />
  );
};

export default EditCustomModal;