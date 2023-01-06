import { ConfigProvider, Spin, message, notification } from 'antd';
import React, { Suspense, useState } from 'react';
import { renderRoutes } from 'react-router-config';
import { HashRouter } from 'react-router-dom';

import routes from '@/routes';
import './global.less';

// import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('cn');

message.config({
  prefixCls: 'ogo-message',
});

ConfigProvider.config({
  prefixCls: 'ogo',
});

notification.config({
  prefixCls: 'ogo-notification',
});

const App = () => {
  const [locale] = useState(zhCN);
  return (
    <HashRouter>
      <ConfigProvider prefixCls="ogo" locale={locale}>
        <Suspense fallback={<Spin size="large" className="layout__loading" />}>
          {renderRoutes(routes)}
          <div className="DialogTempalte" id="DialogTempalte"></div>
        </Suspense>
      </ConfigProvider>
    </HashRouter>
  );
};

export default App;
