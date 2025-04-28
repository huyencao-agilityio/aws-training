export interface UpdateUserEvent {
  context: {
    group: string;
    sub: string;
  };
  userId: string;
  body: {
    email?: string;
    [key: string]: any;
  };
}
