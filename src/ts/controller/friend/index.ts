import Person from '../../core/target/person';
import Company from '../../core/target/company';
import { model, schema } from '../../base';
import provider from '../../core/provider';
/**
 * 群组控制器
 */
class CohortController {
  private workSpace: Person | Company;
  private _myFriends: schema.XTarget[];
  public callBack!: Function;

  constructor() {
    this._myFriends = [];
    this.workSpace = provider.getPerson!;
  }
  public setCallBack(fun: Function) {
    this.callBack = fun;
  }
  /**
   * 获取好友列表
   * @returns
   */
  public getMyFriend = async (): Promise<schema.XTarget[]> => {
    if (provider.getPerson?.target.id == provider.userId) {
      const obj = this.workSpace as Person;
      this._myFriends = await obj.getFriends();
    }
    const data = this._myFriends;
    console.log('我的好友', this._myFriends);
    return data;
  };
  /**
   * 删除好友
   * @param obj
   * @param name
   * @returns
   */
  public async deleteFriend(obj: Person, id: string): Promise<model.ResultType<any>> {
    const res = await obj.removeFriend([id]);
    const friendData = await this.getMyFriend();
    this.callBack([...friendData]);
    return res;
  }
  /**
   * 发起好友申请
   * @param obj
   * @param name
   * @returns
   */
  public async applyFriend(
    obj: Person,
    target: schema.XTarget,
  ): Promise<model.ResultType<any>> {
    const res = await obj.applyFriend(target);
    // const friendData = await this.getMyFriend();
    // this.callBack([...friendData]);
    return res;
  }
}

export default new CohortController();