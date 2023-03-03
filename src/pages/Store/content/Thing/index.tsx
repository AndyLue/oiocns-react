import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import storeCtrl from '@/ts/controller/store';
import { ISpeciesItem } from '@/ts/core/target/species/ispecies';
import useCtrlUpdate from '@/hooks/useCtrlUpdate';
import userCtrl from '@/ts/controller/setting';
import { XAttribute } from '@/ts/base/schema';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import DataGrid, {
  Button,
  Column,
  ColumnChooser,
  ColumnFixing,
  Editing,
  HeaderFilter,
  FilterRow,
  Pager,
  Paging,
  Lookup,
} from 'devextreme-react/data-grid';
import config from 'devextreme/core/config';
import { loadMessages, locale } from 'devextreme/localization';
import zhMessage from 'devextreme/localization/messages/zh.json';
interface IProps {
  current: ISpeciesItem;
  checkedList?: any[];
}
/**
 * 仓库-物
 */
const Thing: React.FC<IProps> = (props: IProps) => {
  const [key] = useCtrlUpdate(storeCtrl);
  const [thingAttrs, setThingAttrs] = useState<any[]>([]);
  const allowedPageSizes = [10, 20];

  const getSortedList = (
    speciesArray: ISpeciesItem[],
    array: any[],
    front: boolean,
  ): any[] => {
    for (let species of speciesArray) {
      if (!array.includes(species)) {
        //没有就放在最前面 改为父级放前，子级放后
        if (front) {
          array = [species, ...array];
        } else {
          array = [...array, species];
        }
      }
      if (species.parent) {
        array = getSortedList([species.parent], array, true);
      }
    }
    return array;
  };

  const loadAttrs = async (speciesArray: ISpeciesItem[]) => {
    let parentHeaders: any[] = [];
    let speciesIds = speciesArray.map((item) => item.id);
    //带属性的分类
    let instances = storeCtrl.checkedSpeciesList.filter((item: ISpeciesItem) =>
      speciesIds.includes(item.id),
    );
    //属性set
    let attrArray: XAttribute[] = [];
    for (let instance of instances) {
      for (let attr of instance.attrs || []) {
        if (!attrArray.map((item) => item.id).includes(attr.id)) {
          attrArray.push(attr);
        }
      }
    }

    let sortedSpecies = getSortedList(instances, [], false);
    for (let species of sortedSpecies) {
      if (attrArray.map((attr: XAttribute) => attr.speciesId).includes(species.id)) {
        let attrs =
          attrArray?.filter((attr: XAttribute) => attr.speciesId == species.id) || [];
        parentHeaders.push({
          caption: attrs[0].species?.name || species.name,
          children: attrs,
        });
      }
    }
    setThingAttrs(parentHeaders);
  };

  useEffect(() => {
    config({ defaultCurrency: 'zh' });
    loadMessages(zhMessage);
    locale('zh');
    if (storeCtrl.checkedSpeciesList.length > 0) {
      if (props.checkedList && props.checkedList.length > 0) {
        loadAttrs(props.checkedList.map((item) => item.item));
      } else if (props.current && userCtrl.space.id) {
        loadAttrs([props.current]);
      }
    }
  }, [props.current, props.checkedList, storeCtrl.checkedSpeciesList]);

  const getComponent = () => {
    return (
      <>
        <DataGrid
          dataSource={[]}
          keyExpr="key"
          columnMinWidth={80}
          remoteOperations={true}
          focusedRowEnabled={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          showColumnLines={true}
          showRowLines={true}
          rowAlternationEnabled={true}
          hoverStateEnabled={true}
          height={'calc(100vh - 175px)'}
          width={'calc(100vw - 300px)'}
          showBorders={true}>
          <ColumnChooser
            enabled={true}
            title={'列选择器'}
            height={'500px'}
            allowSearch={true}
            mode={'select'}
            sortOrder={'asc'}
          />
          <ColumnFixing enabled={true} />
          <Editing
            allowUpdating={true}
            allowDeleting={true}
            selectTextOnEditStart={true}
            useIcons={true}
          />
          <HeaderFilter visible={true} />
          <FilterRow visible={true} />
          <Pager
            visible={true}
            allowedPageSizes={allowedPageSizes}
            showPageSizeSelector={true}
            showNavigationButtons={true}
            showInfo={true}
            infoText={'共{2}条'}
            displayMode={'full'}
          />
          <Paging defaultPageSize={10} />
          {thingAttrs.map((parentHeader: any) => (
            <Column key={parentHeader.caption} caption={parentHeader.caption}>
              {parentHeader.children.map((attr: any) => (
                <Column key={attr.id} dataField={attr.id} caption={attr.name}>
                  {attr.valueType == '选择型' && (
                    <Lookup
                      dataSource={attr.dictItems || []}
                      displayExpr="name"
                      valueExpr="value"
                    />
                  )}
                </Column>
              ))}
            </Column>
          ))}
          <Column type="buttons" width={150} caption={'操作'}>
            <Button name="edit" />
            <Button name="delete" />
          </Column>
        </DataGrid>
      </>
    );
  };

  return (
    <Card id={key} bordered={false}>
      {thingAttrs && thingAttrs.length > 0 && getComponent()}
    </Card>
  );
};
export default Thing;
