
export type TPostRes = {
  postId: string;
  userName: string;
  userIcon: string;
  text: string;
  type: string;
  attachedSources: [{
    url: string;
    originalHeight: number;
    originalWidth: number;
  }];
  postedAt: Date;
  media: string; // e.g. "slack"
  sourceUrl: string;
};