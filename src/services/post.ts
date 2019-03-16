/**
 * Post service
 */

import { TPostRes } from '../types/post';
import { TUserSlackRes } from '../types/user';
import { getSlackUsersRes } from '../services/user';
import { WebAPICallResult, WebClient } from '@slack/client';

export const findSlackPosts = async (
  channelId: string,
  accessToken: string
): Promise<TPostRes[]> => {
  const slackClient = new WebClient(accessToken);
  const users = await getSlackUsersRes(slackClient);
  const messages = await getSlackPosts(channelId, slackClient);
  const extractPosts = extractSlackPosts(messages);
  console.log(extractPosts.length);
  return formatSlackPosts(extractPosts, users, channelId);
  // return messages;
};

export const getSlackPosts = async (
  channelId: string,
  slackClient: WebClient
) => {
  const postInfo = await slackClient.channels.history({
    channel: channelId,
    count: 1000
  });
  if (!postInfo || !postInfo.messages || postInfo.messages.length === 0) {
    throw { status: 404, code: 'Post not found' };
  }
  return postInfo.messages.filter(message => {
    return !!message.user && message.user !== 'USLACKBOT';
  });
};

// const getSlackPosts = (
// 	users: TUserSlackRes[],
// 	messages: WebAPICallResult['messages'],
// 	channelId: string
// ) => {
//   return messages.filter(message => {
//     return !!message.user && message.user !== 'USLACKBOT';
//   })
//   .map(message => {
// 		const userId = message.user;
// 		let user = users.find((user: TUserSlackRes) => {
//       return user.userId === userId;
//     });
//     if (!user) {
//       user = {
//         userId: '',
//         userName: '',
//         userIcon: ''
//       }
//     }
// 		// return {
// 		// 	postId: `${userId}_${message.ts}`,
// 		// 	userName: user.userName,
// 		// 	userIcon: user.userIcon,
// 		// 	text: message.text,
// 		// 	type: message.files ? message.files[0].filetype : 'text',
// 		// 	attachedSourceUrls: message.files ? [message.files[0].url_private] : [],
// 		// 	postedAt: new Date(parseFloat(message.ts) * 1000),
// 		// 	media: 'slack',
// 		// 	sourceUrl: `https://aidemy.slack.com/archives/${channelId}/p${message.ts.replace('.', '')}`,
// 		// };
// 		return message;
//   });
// };

const extractSlackPosts = (messages: WebAPICallResult['messages']) => {
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
      return index < 25;
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
      return index < 25;
    });
  const extractedPosts = (extractedTextPosts.concat(extractedSourcePosts)).sort((msg1, msg2) => {
    if (msg1.reactionCount < msg2.reactionCount) return 1;
    if (msg1.reactionCount > msg2.reactionCount) return -1;
    return 0;
  })
  return extractedPosts;
};

const formatSlackPosts = (
  messages: WebAPICallResult['messages'],
  users: TUserSlackRes[],
  channelId: string
) => {
  return messages
    .map(message => {
      const userId = message.user;
      let user = users.find((user: TUserSlackRes) => {
        return user.userId === userId;
      });
      if (!user) {
        user = {
          userId: '',
          userName: '',
          userIcon: ''
        };
      }
      return {
        postId: `${userId}_${message.ts}`,
        userName: user.userName,
        userIcon: user.userIcon,
        text: message.text,
        type: message.files ? message.files[0].filetype : 'text',
        attachedSources: (message.files && message.files.length > 0) ? message.files.map((file: any) => {
          return {
            url: file.url_private,
            originalHeight: file.original_h,
            originalWidth: file.original_w
          };
        }) : [],
        postedAt: new Date(parseFloat(message.ts) * 1000),
        media: 'Slack',
        sourceUrl: `https://aidemy.slack.com/archives/${channelId}/p${message.ts.replace(
          '.',
          ''
        )}`,
        reactionCount: message.reactionCount
      };
      // return message;
    });
};
