import { Form } from 'antd';
import cls from './index.module.less';
import React, { useEffect, useRef } from 'react';
import { ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
import SchemaForm from '@/components/SchemaForm';
import thingCtrl from '@/ts/controller/thing';
import { TreeSelect } from 'antd';
import userCtrl from '@/ts/controller/setting';
const { SHOW_PARENT } = TreeSelect;
interface IProps {
  currentFormValue: any;
  operateOrgId?: string;
  modalType: string;
  setOperateOrgId: Function;
  nextStep: (params: any) => void;
  onChange: (params: any) => void;
}
export const toTreeData = (species: any[]): any[] => {
  return species.map((t) => {
    return {
      label: t.name,
      value: t.id,
      children: toTreeData(t.children),
    };
  });
};
/** 傻瓜组件，只负责读取状态 */
const FieldInfo: React.FC<IProps> = ({
  nextStep,
  currentFormValue,
  onChange,
  modalType,
}) => {
  const [form] = Form.useForm();
  const formRef = useRef<ProFormInstance>();
  const getFromColumns = () => {
    const columns: ProFormColumnsType<any>[] = [
      {
        title: '办事名称',
        dataIndex: 'name',
        formItemProps: {
          rules: [{ required: true, message: '办事名称为必填项' }],
        },
        colProps: { span: 12 },
      },

      {
        title: '制定组织',
        dataIndex: 'belongId',
        valueType: 'treeSelect',
        formItemProps: { rules: [{ required: true, message: '组织为必填项' }] },
        request: async () => {
          return await userCtrl.getTeamTree();
        },
        fieldProps: {
          fieldNames: { label: 'teamName', value: 'id', children: 'subTeam' },
          showSearch: true,
          filterTreeNode: true,
          treeNodeFilterProp: 'teamName',
        },
      },
      {
        title: '限定操作实体分类',
        dataIndex: 'sourceIds',
        valueType: 'treeSelect',
        request: async () => {
          const species = await thingCtrl.loadSpeciesTree();
          let tree = toTreeData([species]);
          return tree;
        },
        fieldProps: {
          treeCheckable: true,
          showSearch: true,
          filterTreeNode: true,
          allowClear: true,
          showCheckedStrategy: SHOW_PARENT,
        },
        colProps: { span: 24 },
      },

      // {
      //   title: '选择管理权限',
      //   dataIndex: 'authId',
      //   valueType: 'treeSelect',
      //   // formItemProps: { rules: [{ required: true, message: '管理权限为必填项' }] },
      //   request: async () => {
      //     const data = await userCtrl.company.loadAuthorityTree(false);
      //     return data ? [data] : [];
      //   },
      //   fieldProps: {
      //     fieldNames: { label: 'name', value: 'id' },
      //     showSearch: true,
      //     filterTreeNode: true,
      //     treeNodeFilterProp: 'name',
      //     treeDefaultExpandAll: true,
      //   },
      // },
      // {
      //   title: '向下级组织公开',
      //   dataIndex: 'public',
      //   valueType: 'select',
      //   fieldProps: {
      //     options: [
      //       {
      //         value: true,
      //         label: '公开',
      //       },
      //       {
      //         value: false,
      //         label: '不公开',
      //       },
      //     ],
      //   },
      //   // formItemProps: {
      //   //   rules: [{ required: true, message: '是否公开为必填项' }],
      //   // },
      // },
    ];
    // if (currentFormValue.operateOrgId != undefined) {
    //   columns.push({
    //     title: '当前操作组织',
    //     dataIndex: 'operateOrgId',
    //     readonly: true,
    //     valueType: 'treeSelect',
    //     request: async () => {
    //       return await userCtrl.getTeamTree();
    //     },
    //     fieldProps: {
    //       fieldNames: { label: 'teamName', value: 'id', children: 'subTeam' },
    //       showSearch: true,
    //       filterTreeNode: true,
    //       treeNodeFilterProp: 'teamName',
    //     },
    //   });
    // }
    columns.push({
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      colProps: { span: 24 },
    });
    return columns;
  };

  useEffect(() => {
    form.setFieldsValue(currentFormValue);
  }, [currentFormValue]);

  return (
    <div className={cls['contentMes']}>
      {/* <ProForm
        layout="horizontal"
        onValuesChange={async () => {
          const currentValue = await form.getFieldsValue();
          onChange(currentValue);
        }}
        form={form}
        onFinish={async (e) => {
          nextStep(e);
        }}>
        <ProFormText
          name="name"
          label="办事名称"
          placeholder="输入办事名称"
          rules={[{ required: true, message: '请输入办事名称!' }]}
        />
        <ProFormSelect
          name="belongId"
          label="选择制定组织"
          placeholder="选择制定组织"
          rules={[{ required: true, message: '组织为必填项!' }]}
        />
        <ProFormTextArea name="remark" label="备注信息" placeholder="输入备注信息" />
      </ProForm> */}

      <SchemaForm
        formRef={formRef}
        form={form}
        open={true}
        width={640}
        onValuesChange={async () => {
          const currentValue = await form.getFieldsValue();
          currentValue.sourceIds = currentValue.sourceIds.join(',');
          onChange(currentValue);
        }}
        rowProps={{
          gutter: [24, 0],
        }}
        layoutType="Form"
        onFinish={async (values) => {
          values.sourceIds = values.sourceIds.join(',');
          nextStep(values);
        }}
        columns={getFromColumns()}></SchemaForm>
    </div>
  );
};

export default FieldInfo;
