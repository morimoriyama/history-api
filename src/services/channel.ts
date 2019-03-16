/**
 * Channel service
 */

import { TChannelSlackRes } from '../types/channel'
import { WebClient } from '@slack/client';

export const findSlackChannels = async (accessToken: string) => {
  const slackClient = new WebClient(accessToken);
  return await getSlackChannelsInfo(slackClient);
};

/**
 * Common Function
 */

export const getSlackChannelsInfo = async(slackClient: WebClient) => {
  const channelInfo = await slackClient.channels.list({ exclude_archived: true, exclude_members: false});
  if (!channelInfo || !channelInfo.channels || channelInfo.channels.length === 0){
    throw { status: 404, code: 'Channel not found' };
  }
  const channelsRes: TChannelSlackRes[] = channelInfo.channels.map((channel: any) => {
    return {
      channelId: channel.id || '',
      channelName: channel.name || ''
    };
  });
  return channelsRes;
}