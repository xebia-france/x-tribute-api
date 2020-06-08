export enum Status {
  APPROVED = 'APPROVED',
  DELIVERED = 'DELIVERED',
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
    name: string;
  }
}

type User = {
  name: string;
  username: string;
};
