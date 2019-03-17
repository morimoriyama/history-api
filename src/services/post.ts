/**
 * Post service
 */

import { TPostRes } from "../types/post";
import { TUserSlackRes } from "../types/user";
import { getSlackUsersRes } from "../services/user";
import { WebAPICallResult, WebClient } from "@slack/client";

/**
 * Slackの投稿一覧を取得する
 * @param channelId - Slack Channel ID
 * @param accessToken - Slack Access Token
 */
export const findSlackPosts = async (
  channelId: string,
  accessToken: string
): Promise<TPostRes[]> => {
  const slackClient = new WebClient(accessToken);
  const users = await getSlackUsersRes(slackClient);
  const messages = await getSlackMessages(channelId, slackClient);
  const extractPosts = extractSlackPosts(messages);
  return formatSlackPosts(extractPosts, users, channelId);
};

/**
 * Common Function
 */

/**
 * Slackの投稿を取得し、slackbotなど不要なものを削除する
 * @param channelId - Slack Channel ID
 * @param slackClient - Slack Client
 */
const getSlackMessages = async (channelId: string, slackClient: WebClient) => {
  const postInfo = await slackClient.channels.history({
    channel: channelId,
    count: 1000
  });
  if (!postInfo || !postInfo.messages || postInfo.messages.length === 0) {
    throw { status: 404, code: "Post not found" };
  }
  return postInfo.messages.filter(message => {
    return !!message.user && message.user !== "USLACKBOT";
  });
};

/**
 * Slackの投稿から、重要度の高いものを抽出する (今回は、単純にreactionが多いものを選定)
 * @param messages - Slack Messages
 */
const extractSlackPosts = (messages: WebAPICallResult["messages"]) => {
  const extractedTextPosts = messages
    .filter(message => {
      return !!message.files;
    })
    .map(message => {
      message.reactionCount = (message.reactions || []).reduce(
        (count: number, reaction: any) => {
          return count + reaction.count;
        },
        0
      );
      return message;
    })
    .sort((msg1, msg2) => {
      if (msg1.reactionCount < msg2.reactionCount) return 1;
      if (msg1.reactionCount > msg2.reactionCount) return -1;
      return 0;
    })
    .filter((_message: any, index: number) => {
      return index < 40;
    });

  const extractedSourcePosts = messages
    .filter(message => {
      return !message.files;
    })
    .map(message => {
      message.reactionCount = (message.reactions || []).reduce(
        (count: number, reaction: any) => {
          return count + reaction.count;
        },
        0
      );
      return message;
    })
    .sort((msg1, msg2) => {
      if (msg1.reactionCount < msg2.reactionCount) return 1;
      if (msg1.reactionCount > msg2.reactionCount) return -1;
      return 0;
    })
    .filter((_message: any, index: number) => {
      return index < 40;
    });
  const extractedPosts = extractedTextPosts
    .concat(extractedSourcePosts)
    .sort((msg1, msg2) => {
      if (msg1.reactionCount < msg2.reactionCount) return 1;
      if (msg1.reactionCount > msg2.reactionCount) return -1;
      return 0;
    });
  return extractedPosts;
};

/**
 * Slackの投稿をレスポンス形式に整形する
 * @param messages - Slack Messages
 * @param users - Slack Users
 * @param channelId - Slack Channel ID
 */
const formatSlackPosts = (
  messages: WebAPICallResult["messages"],
  users: TUserSlackRes[],
  channelId: string
) => {
  return messages.map(message => {
    const userId = message.user;
    let user = users.find((user: TUserSlackRes) => {
      return user.userId === userId;
    });
    if (!user) {
      user = {
        userId: "",
        userName: "",
        userIcon: ""
      };
    }
    return {
      postId: `${userId}_${message.ts}`,
      userName: user.userName,
      userIcon: user.userIcon,
      text: message.text,
      type: message.files ? message.files[0].filetype : "text",
      attachedSources:
        message.files && message.files.length > 0
          ? message.files.map((file: any) => {
              return {
                url: file.url_private,
                originalHeight: file.original_h,
                originalWidth: file.original_w
              };
            })
          : [],
      postedAt: new Date(parseFloat(message.ts) * 1000),
      media: "Slack",
      sourceUrl: `https://aidemy.slack.com/archives/${channelId}/p${message.ts.replace(
        ".",
        ""
      )}`,
      reactionCount: message.reactionCount
    };
  });
};
