import cls from './index.module.less';

import React, { useEffect, useState } from 'react';
import AppShowComp from '@/bizcomponents/AppTableWithBuy';
import MarketService from '@/module/appstore/market';
// import usePageApi from '@/hooks/usePageApi';
import StoreContent from '@/ts/controller/store/content';

const service = new MarketService({
  nameSpace: 'publicStore',
});
const Index: React.FC = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    StoreContent.marketTableCallBack = setData;
    StoreContent.getStoreProduct();
  }, []);

  return (
    <>
      <AppShowComp
        headerTitle="共享仓库"
        className={cls['market-public-wrap']}
        list={data}
        columns={service.getShopappColumns()}
        queryFun={StoreContent.getStoreProduct}
      />
    </>
  );
};

export default Index;