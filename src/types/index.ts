export interface OrderFile {
  fileID: string;
  name: string;
  downloadURL?: string;
}

export interface Order {
  _id: string;
  pickupCode: string;
  createTime: number | string;
  color: string;
  sides: string;
  needsBinding: boolean;
  copies: number;
  remark?: string;
  status: 'pending' | 'completed';
  _openid: string;
  userUid?: string;
  files: OrderFile[];
}
