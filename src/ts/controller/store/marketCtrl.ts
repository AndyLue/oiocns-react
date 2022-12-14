import { IMTarget, emitter, DomainTypes } from '@/ts/core';
import { kernel } from '@/ts/base';
import { JOIN_SHOPING_CAR, USER_MANAGEMENT } from '@/constants/const';
import { message } from 'antd';
import { Emitter } from '@/ts/base/common';
import userCtrl from '../setting/userCtrl';
import { XMerchandise } from '@/ts/base/schema';

export enum MarketCallBackTypes {
  'ApplyData' = 'ApplyData',
  'MarketShop' = 'MarketShop',
  'UserManagement' = 'UserManagement',
}

class MarketController extends Emitter {
  /** 市场操作对象 */
  private _target: IMTarget | undefined;
  /** 商店table数据 */
  private _marketTableList: any = {};
  /** 搜索到的商店 */
  public searchMarket: any;
  /** 所有的用户 */
  public marketMenber: any = {};
  /** 购物车商品列表 */
  private _shopinglist: any[] = [];

  constructor() {
    super();
    this.searchMarket = [];
    emitter.subscribePart([DomainTypes.Company, DomainTypes.User], () => {
      setTimeout(() => {
        this._initialization();
      }, 100);
    });
  }

  /**
   * @description: 获取购物车商品列表的方法
   * @return {*}
   */
  public get shopinglist(): any[] {
    return this._shopinglist;
  }

  /**
   * @description: 获取市场商品列表
   * @return {*}
   */
  public get marketTableList(): any {
    return this._marketTableList;
  }

  /** 市场操作对象 */
  public get Market(): IMTarget {
    if (this._target) {
      return this._target;
    } else {
      return {} as IMTarget;
    }
  }

  /**
   * @description: 添加商品进购物车
   * @param {XMerchandise} data
   * @return {*}
   */
  public joinApply = async (data: XMerchandise) => {
    if (this._shopinglist.length === 0) {
      this._shopinglist.push(data);
      message.success('已加入购物车');
    } else if (this._shopinglist.some((item) => item.id === data?.id)) {
      message.warning('您已添加该商品，请勿重复添加');
      return;
    } else {
      this._shopinglist.push(data);
      message.success('已加入购物车');
    }
    this.cacheJoinOrDeleShopingCar(this._shopinglist);
  };

  /**
   * @description: 删除购物车内的商品
   * @param {any} data
   * @return {*}
   */
  public deleApply = async (ids: string[]) => {
    if (this._shopinglist.length > 0) {
      this._shopinglist = this._shopinglist.filter((item) => !ids.includes(item.id));
      message.success('移出成功');
      this.cacheJoinOrDeleShopingCar(this._shopinglist);
    }
  };

  /**
   * @description: 购买商品
   * @param {any} data
   * @return {*}
   */
  public buyShoping = async (ids: string[]) => {
    if (ids.length > 0) {
      const firstProd = this._shopinglist.find((n) => n.id === ids[0]);
      if (
        await this._target?.createOrder(
          '',
          firstProd.caption + (ids.length > 1 ? `...等${ids.length}件商品` : ''),
          new Date().getTime().toString().substring(0, 13),
          userCtrl.space.id,
          ids,
        )
      ) {
        this._shopinglist = this._shopinglist.filter((item) => !ids.includes(item.id));
        this.cacheJoinOrDeleShopingCar(this._shopinglist);
        message.success('下单成功');
      }
    }
  };

  /**
   * 缓存 加入/删除购物车的商品
   * @param message 新消息，无则为空
   */
  public cacheJoinOrDeleShopingCar = (data: any): void => {
    this.changCallbackPart(MarketCallBackTypes.ApplyData);
    kernel.anystore.set(
      JOIN_SHOPING_CAR,
      {
        operation: 'replaceAll',
        data: {
          data: data || [],
        },
      },
      'user',
    );
  };

  /**
   * 缓存 商店用户管理成员
   * @param message 新消息，无则为空
   */
  public cacheUserManagement = (data: any): void => {
    this.changCallbackPart(MarketCallBackTypes.UserManagement);
    kernel.anystore.set(
      USER_MANAGEMENT,
      {
        operation: 'replaceAll',
        data: {
          data: data || [],
        },
      },
      'user',
    );
  };

  private async _initialization() {
    this._target = userCtrl.space;
    await this._target.getJoinMarkets();
    /* 获取 历史缓存的 购物车商品列表 */
    kernel.anystore.subscribed(JOIN_SHOPING_CAR, 'user', (shoplist: any) => {
      const { data = [] } = shoplist;
      this._shopinglist = data || [];
      this.changCallbackPart(MarketCallBackTypes.ApplyData);
    });
    /* 获取 历史缓存的 商店用户管理成员 */
    kernel.anystore.subscribed(USER_MANAGEMENT, 'uset', (managementlist: any) => {
      const { data = [] } = managementlist;
      this.marketMenber = data || [];
      this.changCallbackPart(MarketCallBackTypes.UserManagement);
    });
    this.changCallback();
  }
}
export default new MarketController();
