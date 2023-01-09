import React, { useState } from 'react';
import { INullSpeciesItem, ISpeciesItem, ITarget } from '@/ts/core';
import CardOrTable from '@/components/CardOrTableComp';
import userCtrl from '@/ts/controller/setting';
import { XAttribute } from '@/ts/base/schema';
import { PageRequest } from '@/ts/base/model';
import thingCtrl from '@/ts/controller/thing';
import { AttributeColumns } from '@/pages/Setting/config/columns';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import AttributeModal from '../../../components/attributeModal';

interface IProps {
  target?: ITarget;
  current: ISpeciesItem;
  modalType: string;
  setModalType: (modalType: string) => void;
}

/**
 * @description: 分类特性标准
 * @return {*}
 */
const Attritube = ({ current, target, modalType, setModalType }: IProps) => {
  const [tkey, tforceUpdate] = useObjectUpdate(current);
  const [editData, setEditData] = useState<XAttribute>();
  // 操作内容渲染函数
  const renderOperate = (item: XAttribute) => {
    return [
      {
        key: '修改特性',
        label: '编辑特性',
        onClick: () => {
          setEditData(item);
          setModalType('修改特性');
        },
      },
      {
        key: '删除特性',
        label: '删除特性',
        onClick: async () => {
          await current?.deleteAttr(item.id);
          tforceUpdate();
        },
      },
    ];
  };

  const findSpecesName = (species: INullSpeciesItem, id: string) => {
    if (species) {
      if (species.id == id) {
        return species.name;
      }
      for (const item of species.children) {
        if (findSpecesName(item, id) != id) {
          return item.name;
        }
      }
    }
    return id;
  };

  const loadAttrs = async (page: PageRequest) => {
    const res = await current!.loadAttrs(userCtrl.space.id, page);
    if (res && res.result) {
      for (const item of res.result) {
        const team = userCtrl.findTeamInfoById(item.belongId);
        if (team) {
          item.belongId = team.name;
        }
        item.speciesId = findSpecesName(thingCtrl.teamSpecies, item.speciesId);
      }
    }
    return res;
  };
  return (
    <>
      <CardOrTable<XAttribute>
        rowKey={'id'}
        params={tkey}
        request={async (page) => {
          return await loadAttrs(page);
        }}
        operation={renderOperate}
        columns={AttributeColumns}
        showChangeBtn={false}
        dataSource={[]}
      />
      {/** 新增/编辑特性模态框 */}
      <AttributeModal
        data={editData}
        title={modalType}
        open={modalType.includes('特性')}
        handleCancel={function (): void {
          setModalType('');
        }}
        handleOk={function (success: boolean): void {
          setModalType('');
          if (success) {
            tforceUpdate();
          }
        }}
        target={target}
        current={current}
      />
    </>
  );
};
export default Attritube;
