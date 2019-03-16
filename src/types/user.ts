
export type TUserSlackRes = {
  userId: string;
  userName: string;
  userIcon: string;
};

export type TUserSlackMap = {
  [userId: string]: {
    userName: string;
    userIcon: string;
  }
}
