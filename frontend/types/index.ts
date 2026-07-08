export enum OwnerStatus {
  INVALID = 0,
  INVITED = 1,
  ACCEPTED = 2,
  DECLINED = 3,
}

export enum TransactionStatus {
  PENDING = 0,
  EXECUTED = 1,
  DECLINED = 2,
}

export interface Owner {
  id: number;
  address: string;
  status: OwnerStatus;
}

export interface Transaction {
  creator: string;
  recipient: string;
  amount: BigInt;
  index: BigInt;
  approvals: string[];
  status: TransactionStatus;
}
