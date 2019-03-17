/**
 * Channel service
 */

import { TChannelSlackRes } from "../types/channel";
import { WebClient } from "@slack/client";

/**
 * Slackのチャンネル一覧を取得する
 * @param accessToken - Slack Access Token
 */
export const findSlackChannels = async (accessToken: string) => {
  const slackClient = new WebClient(accessToken);
  return getSlackChannelsRes(slackClient);
};

/**
 * Common Function
 */

/**
 * Slackのチャンネル情報を取得し、レスポンス形式に整形する
 * @param slackClient - Slack Client
 */
const getSlackChannelsRes = async (slackClient: WebClient) => {
  const channelInfo = await slackClient.channels.list({
    exclude_archived: true,
    exclude_members: false
  });
  if (
    !channelInfo ||
    !channelInfo.channels ||
    channelInfo.channels.length === 0
  ) {
    throw { status: 404, code: "Channel not found" };
  }
  const channelsRes: TChannelSlackRes[] = channelInfo.channels.map(
    (channel: any) => {
      return {
        channelId: channel.id || "",
        channelName: channel.name || ""
      };
    }
  );
  return channelsRes;
};
