export enum Status {
  APPROVED = 'APPROVED',
  DELIVERED = 'DELIVERED',
  DELIVERY_ERROR = 'DELIVERY_ERROR',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED'
}

export type ThankYou = {
  id?: string;
  createdAt?: Date;
  reviewedBy?: string;
  text: string;
  author: User;
  recipient: User;
  status: Status;
};

export type SlackProfile = {
  ok: boolean;
  user: {
    id: string;
    name: string;
  }
}

type User = {
  name: string;
  username: string;
};
