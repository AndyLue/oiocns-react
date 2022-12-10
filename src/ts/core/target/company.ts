import Group from './group';
import consts from '../consts';
import MarketTarget from './mbase';
import { companyTypes, TargetType } from '../enum';
import { TargetModel } from '@/ts/base/model';
import Department from './department';
import { validIsSocialCreditCode } from '@/utils/tools';
import { schema, kernel, common } from '@/ts/base';
import {
  IGroup,
  ICompany,
  IDepartment,
  IWorking,
  SpaceType,
  ITarget,
  TargetParam,
  ICohort,
} from './itarget';
import Working from './working';
import { logger } from '@/ts/base/common';
import Cohort from './cohort';
/**
 * 公司的元操作
 */
export default class Company extends MarketTarget implements ICompany {
  departments: IDepartment[];
  joinedGroup: IGroup[];
  userId: string;
  cohorts: ICohort[] = [];
  workings: IWorking[] = [];

  constructor(target: schema.XTarget, userId: string) {
    super(target);
    this.userId = userId;

    this.departments = [];
    this.joinedGroup = [];
    this.subTeamTypes = [TargetType.Department, TargetType.Working];
    this.extendTargetType = [TargetType.Department, TargetType.Working, ...companyTypes];
    this.joinTargetType = [TargetType.Group, TargetType.Cohort];
    this.createTargetType = [
      TargetType.Department,
      TargetType.Working,
      TargetType.Group,
      TargetType.Cohort,
    ];
    this.searchTargetType = [TargetType.Person, TargetType.Group];
  }
  public get subTeam(): ITarget[] {
    return [...this.departments, ...this.workings];
  }
  public getCohorts = async (reload?: boolean): Promise<ICohort[]> => {
    if (!reload && this.cohorts.length > 0) {
      return this.cohorts;
    }
    const res = await kernel.queryJoinedTargetById({
      id: this.userId,
      typeName: TargetType.Person,
      page: {
        offset: 0,
        filter: '',
        limit: common.Constants.MAX_UINT_16,
      },
      spaceId: this.id,
      JoinTypeNames: [TargetType.Cohort],
    });
    if (res.success && res.data.result) {
      this.cohorts = res.data.result.map((a) => {
        return new Cohort(a);
      });
    }
    return this.cohorts;
  };

  public async create(data: TargetModel): Promise<ITarget | undefined> {
    switch (data.typeName as TargetType) {
      case TargetType.Department:
        return this.createDepartment(data);
      case TargetType.Working:
        return this.createWorking(data);
      case TargetType.Group:
        return this.createGroup(data);
      case TargetType.Cohort:
        return this.createGroup(data);
    }
  }

  public async createCohort(
    avatar: string,
    name: string,
    code: string,
    remark: string,
  ): Promise<ICohort | undefined> {
    const res = await this.createTarget({
      code,
      name,
      avatar,
      teamCode: code,
      teamName: name,
      belongId: this.id,
      typeName: TargetType.Cohort,
      teamRemark: remark,
    });
    if (res.success && res.data != undefined) {
      const cohort = new Cohort(res.data);
      this.cohorts.push(cohort);
      cohort.pullMembers([this.userId], TargetType.Person);
      return cohort;
    }
  }
  public async deleteCohort(id: string): Promise<boolean> {
    let res = await kernel.deleteTarget({
      id: id,
      typeName: TargetType.Cohort,
      belongId: this.id,
    });
    if (res.success) {
      this.cohorts = this.cohorts.filter((a) => a.id != id);
    }
    return res.success;
  }
  public async loadSubTeam(reload?: boolean): Promise<ITarget[]> {
    await this.getWorkings(reload);
    await this.getDepartments(reload);
    return [...this.departments, ...this.cohorts];
  }
  public async searchGroup(code: string): Promise<schema.XTargetArray> {
    return await this.searchTargetByName(code, [TargetType.Group]);
  }
  public get spaceData(): SpaceType {
    return {
      id: this.target.id,
      name: this.target.team!.name,
      icon: this.target.avatar,
      typeName: this.target.typeName as TargetType,
    };
  }
  public async createGroup(data: TargetParam): Promise<IGroup | undefined> {
    const tres = await this.searchTargetByName(data.code, [TargetType.Group]);
    if (!tres.result) {
      const res = await this.createTarget({ ...data, belongId: this.target.id });
      if (res.success) {
        const group = new Group(res.data, () => {
          this.joinedGroup = this.joinedGroup.filter((item) => {
            return item.id != group.id;
          });
        });
        this.joinedGroup.push(group);
        await group.pullMember(this.target);
        return group;
      }
    } else {
      logger.warn('该集团已存在!');
    }
  }
  public async createDepartment(
    data: Omit<TargetModel, 'id' | 'belongId'>,
  ): Promise<IDepartment | undefined> {
    data.teamCode = data.teamCode == '' ? data.code : data.teamCode;
    data.teamName = data.teamName == '' ? data.name : data.teamName;
    data.typeName = TargetType.Department;
    const res = await this.createSubTarget({ ...data, belongId: this.target.id });
    if (res.success) {
      const department = new Department(res.data, () => {
        this.departments = this.departments.filter((item) => {
          return item.id != department.id;
        });
      });
      this.departments.push(department);
      return department;
    }
  }
  public async createWorking(
    data: Omit<TargetModel, 'id' | 'belongId'>,
  ): Promise<IWorking | undefined> {
    data.teamCode = data.teamCode == '' ? data.code : data.teamCode;
    data.teamName = data.teamName == '' ? data.name : data.teamName;
    data.typeName = TargetType.Working;
    const res = await this.createSubTarget({ ...data, belongId: this.target.id });
    if (res.success) {
      const working = new Working(res.data, () => {
        this.workings = this.workings.filter((item) => {
          return item.id != working.id;
        });
      });
      this.workings.push(working);
      return working;
    }
  }
  public async deleteDepartment(id: string): Promise<boolean> {
    const department = this.departments.find((department) => {
      return department.target.id == id;
    });
    if (department != undefined) {
      let res = await this.deleteSubTarget(id, TargetType.Department, this.target.id);
      if (res.success) {
        this.departments = this.departments.filter((department) => {
          return department.target.id != id;
        });
      }
      return res.success;
    }
    logger.warn(consts.UnauthorizedError);
    return false;
  }
  public async deleteWorking(id: string): Promise<boolean> {
    const working = this.workings.find((working) => {
      return working.target.id == id;
    });
    if (working != undefined) {
      let res = await this.deleteSubTarget(id, TargetType.Working, this.target.id);
      if (res.success) {
        this.workings = this.workings.filter((working) => {
          return working.target.id != id;
        });
      }
      return res.success;
    }
    logger.warn(consts.UnauthorizedError);
    return false;
  }
  public async deleteGroup(id: string): Promise<boolean> {
    const group = this.joinedGroup.find((group) => {
      return group.target.id == id;
    });
    if (group) {
      let res = await kernel.recursiveDeleteTarget({
        id: id,
        typeName: TargetType.Group,
        subNodeTypeNames: [TargetType.Group],
      });
      if (res.success) {
        this.joinedGroup = this.joinedGroup.filter((group) => {
          return group.target.id != id;
        });
      }
      return res.success;
    }
    logger.warn(consts.UnauthorizedError);
    return false;
  }
  public async quitGroup(id: string): Promise<boolean> {
    const group = await this.joinedGroup.find((a) => {
      return a.target.id == id;
    });
    if (group != undefined) {
      const res = await kernel.recursiveExitAnyOfTeam({
        id,
        teamTypes: [TargetType.Group],
        targetId: this.target.id,
        targetType: this.target.typeName,
      });
      if (res.success) {
        this.joinedGroup = this.joinedGroup.filter((a) => {
          return a.target.id != id;
        });
      }
      return res.success;
    }
    logger.warn(consts.UnauthorizedError);
    return false;
  }
  public getDepartments = async (reload: boolean = false): Promise<IDepartment[]> => {
    if (!reload && this.departments.length > 0) {
      return this.departments;
    }
    const res = await this.getSubTargets([TargetType.Department]);
    if (res.success && res.data.result) {
      this.departments = res.data.result.map((a) => {
        return new Department(a, () => {
          this.departments = this.departments.filter((item) => {
            return item.id != a.id;
          });
        });
      });
    }
    return this.departments;
  };
  public async getWorkings(reload: boolean = false): Promise<IWorking[]> {
    if (!reload && this.workings.length > 0) {
      return this.workings;
    }
    const res = await this.getSubTargets([TargetType.Working]);
    if (res.success && res.data.result) {
      this.workings = res.data.result?.map((a) => {
        return new Working(a, () => {
          this.workings = this.workings.filter((item) => {
            return item.id != a.id;
          });
        });
      });
    }
    return this.workings;
  }
  public async getJoinedGroups(reload: boolean = false): Promise<IGroup[]> {
    if (!reload && this.joinedGroup.length > 0) {
      return this.joinedGroup;
    }
    const res = await this.getjoinedTargets([TargetType.Group], this.userId);
    if (res && res.result) {
      this.joinedGroup = res.result.map((a) => {
        return new Group(a, () => {
          this.joinedGroup = this.joinedGroup.filter((item) => {
            return item.id != a.id;
          });
        });
      });
    }
    return this.joinedGroup;
  }
  public async update(data: TargetParam): Promise<ICompany> {
    if (!validIsSocialCreditCode(data.code)) {
      logger.warn('请填写正确的代码!');
    }
    await super.update(data);
    return this;
  }
  public async applyJoinGroup(id: string): Promise<boolean> {
    const group = this.joinedGroup.find((group) => {
      return group.target.id == id;
    });
    if (group == undefined) {
      return await this.applyJoin(id, TargetType.Group);
    }
    logger.warn(consts.IsJoinedError);
    return false;
  }
  public async queryJoinApply(): Promise<schema.XRelationArray> {
    const res = await kernel.queryJoinTeamApply({
      id: this.target.id,
      page: {
        offset: 0,
        filter: '',
        limit: common.Constants.MAX_UINT_16,
      },
    });
    return res.data;
  }
  public async queryJoinApproval(): Promise<schema.XRelationArray> {
    const res = await kernel.queryTeamJoinApproval({
      id: this.target.id,
      page: {
        offset: 0,
        filter: '',
        limit: common.Constants.MAX_UINT_16,
      },
    });
    return res.data;
  }
  public async cancelJoinApply(id: string): Promise<boolean> {
    const res = await kernel.cancelJoinTeam({
      id,
      typeName: TargetType.Company,
      belongId: this.target.id,
    });
    return res.success;
  }
}
