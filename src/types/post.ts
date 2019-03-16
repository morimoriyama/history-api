
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
  sourceUrl: string; // e.g. "https://aidemy.slack.com/archives/C02HH1NL9/p1552718218082500"
};