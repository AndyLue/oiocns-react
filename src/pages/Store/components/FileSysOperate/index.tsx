import storeCtrl from '@/ts/controller/store';
import { IFileSystemItem } from '@/ts/core';
import React, { useEffect, useRef, useState } from 'react';
import { Input, message, Modal, Upload, UploadProps } from 'antd';
import CopyOrMoveModal from './CopyOrMove';
import ReleaseVersionModal from './ReleaseVersion';
import FilePreview from './FilePreview';
import { FileItemShare } from '@/ts/base/model';

interface IProps {
  operateKey?: string;
  operateTarget?: IFileSystemItem;
  operateDone: () => void;
}

/** 文件系统操作 */
const FileSysOperate: React.FC<IProps> = (props: IProps) => {
  const [newName, setNewName] = useState<string>('');
  const [modalType, setModalType] = useState<string>('');
  const [target, setTarget] = useState<IFileSystemItem>();
  const [preview, setPreview] = useState<FileItemShare>();
  const uploadRef = useRef<any>();
  useEffect(() => {
    if (props.operateTarget && props.operateKey) {
      executeOperate(props.operateKey, props.operateTarget);
      props.operateDone();
    }
  }, [props]);

  const executeOperate = async (key: string, target: IFileSystemItem) => {
    switch (key) {
      case '刷新':
        if (await target.loadChildren(true)) {
          message.success('刷新成功!');
        }
        break;
      case '删除':
        Modal.confirm({
          content: '确定删除吗?',
          onOk: async () => {
            if (await target.delete()) {
              message.success('删除成功!');
              storeCtrl.changCallback();
            }
          },
        });
        return;
      case '上传':
        setTarget(target);
        uploadRef.current.upload.uploader.onClick();
        return;
      case '发布版本':
        console.log('target', target);
        setTarget(target);
        setModalType(key);
        return;
      case '新建':
        setNewName('');
        setModalType(key);
        setTarget(target);
        return;
      case '重命名':
        setModalType(key);
        setTarget(target);
        setNewName(target.name);
        return;
      case '复制':
      case '移动':
        setModalType(key);
        setTarget(target);
        return;
      case '|新建':
        await target.create(newName);
        break;
      case '|重命名':
        await target.rename(newName);
        break;
      case '双击':
        if (target.target.isDirectory) {
          storeCtrl.currentKey = target.key;
          await target.loadChildren();
          storeCtrl.changCallback();
        } else {
          setPreview(target.shareInfo());
        }
        return;
    }
    storeCtrl.changCallback();
  };
  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    async customRequest(options) {
      const file = options.file as File;
      if (file && target) {
        if (await target.upload(file.name, file)) {
          storeCtrl.changCallback();
        }
      }
    },
  };
  return (
    <>
      {target && (
        <>
          <Modal
            title={modalType + '-[' + target.name + ']'}
            open={['新建', '重命名'].includes(modalType)}
            onCancel={() => setModalType('')}
            onOk={async () => {
              if (newName.length > 0) {
                await executeOperate('|' + modalType, target);
                setModalType('');
              }
            }}>
            <Input
              placeholder="新建文件夹"
              size="large"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
              }}
            />
          </Modal>
          <CopyOrMoveModal
            title={modalType + '-[' + target.name + ']'}
            open={['复制', '移动'].includes(modalType)}
            currentTaget={target}
            onChange={(success) => {
              setModalType('');
              if (success) {
                storeCtrl.changCallback();
              }
            }}
          />
          <ReleaseVersionModal
            title={modalType + '-[' + target.name + ']'}
            open={['发布版本'].includes(modalType)}
            currentTaget={target}
            onChange={(success) => {
              setModalType('');
              if (success) {
                storeCtrl.changCallback();
              }
            }}></ReleaseVersionModal>
        </>
      )}
      {preview && (
        <FilePreview share={preview} previewDone={() => setPreview(undefined)} />
      )}
      <Upload {...uploadProps} ref={uploadRef}></Upload>
    </>
  );
};

export default FileSysOperate;
