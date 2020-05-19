export enum Status {
  DRAFT,
  APPROVED,
  SENT
}

type User = {
  name: string;
  email: string;
};

export type ThankYou = {
  id?: string;
  text: string;
  author: User;
  recipient: User;
  status: Status;
};