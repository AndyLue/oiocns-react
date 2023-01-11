import { Form } from 'antd';
import cls from './index.module.less';
import React, { useEffect } from 'react';
import { ProFormText, ProForm, ProFormTextArea } from '@ant-design/pro-components';

interface IProps {
  currentFormValue: {};
  nextStep: (params: any) => void;
  onChange: (params: any) => void;
}

/** 傻瓜组件，只负责读取状态 */
const FieldInfo: React.FC<IProps> = ({ nextStep, currentFormValue, onChange }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(currentFormValue);
  }, [currentFormValue]);

  return (
    <div className={cls['contentMes']}>
      <ProForm
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
          label="流程名称"
          placeholder="输入流程名称"
          rules={[{ required: true, message: '请输入流程名称!' }]}
        />
        <ProFormTextArea
          name="remark"
          label="备注信息"
          placeholder="输入备注信息"
          // rules={[{ required: true, message: '请输入备注信息!' }]}
        />
        {/* <ProFormList
          name="fields"
          label="流程字段"
          initialValue={[{ label: '' }]}
          deleteIconProps={{
            Icon: CloseCircleOutlined,
            tooltipText: '删除这个流程字段',
          }}
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: '新增字段',
          }}>
          <ProFormGroup key="group">
            <ProFormText
              name="label"
              label="字段名称"
              rules={[{ required: true, message: '请填写字段名称!' }]}
            />
            <ProFormText
              name="value"
              label="字段编号"
              rules={[{ required: true, message: '请填写字段编号!' }]}
            />
            <ProFormSelect
              name="type"
              label="字段类型"
              options={[
                { label: '字符串', value: dataType.STRING },
                { label: '数字', value: dataType.NUMERIC },
                { label: '枚举', value: dataType.DICT },
                { label: '日期', value: dataType.DATE },
              ]}
              placeholder="请选择类型"
              rules={[{ required: true, message: '请选择类型!' }]}
            />
          </ProFormGroup>
          <ProFormDependency key="type" name={['type']}>
            {({ type }) => {
              if (type !== 'DICT') {
                return false;
              }
              return (
                <ProFormList
                  name="dict"
                  label="枚举信息"
                  deleteIconProps={{
                    Icon: CloseCircleOutlined,
                    tooltipText: '删除这个枚举值',
                  }}
                  initialValue={[{}]}
                  creatorButtonProps={{
                    position: 'bottom',
                    creatorButtonText: '新增枚举值',
                  }}>
                  <ProFormGroup key="group">
                    <ProFormText
                      name="label"
                      label="枚举名称"
                      rules={[{ required: true, message: '请输入枚举名称!' }]}
                    />
                    <ProFormText
                      name="value"
                      label="枚举值"
                      rules={[{ required: true, message: '请输入枚举值!' }]}
                    />
                  </ProFormGroup>
                </ProFormList>
              );
            }}
          </ProFormDependency>
        </ProFormList> */}
      </ProForm>
    </div>
  );
};

export default FieldInfo;
