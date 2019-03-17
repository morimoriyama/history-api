/**
 * User service
 */

import { TUserSlackRes } from "../types/user";
import rp from "request-promise";
import { slackClientSecret } from "../../config";
import { WebClient } from "@slack/client";

/**
 * Slackのユーザ一覧を取得する
 * @param accessToken - Slack Access Token
 */
export const findSlackUsers = async (
  accessToken: string
): Promise<TUserSlackRes[]> => {
  const slackClient = new WebClient(accessToken);
  return getSlackUsersRes(slackClient);
};

/**
 * Slackのログインを行う
 * @param clientId - Slack Cliend ID
 * @param code - Slack Verification Code
 */
export const authorizeSlack = async (clientId: string, code: string) => {
  const result = await rp({
    uri: "https://slack.com/api/oauth.access",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `client_id=${clientId}&client_secret=${slackClientSecret}&code=${code}`,
    method: "POST"
  });
  return JSON.parse(result);
};

/**
 * Common Function
 */

/**
 * Slackのユーザ情報を取得し、レスポンス形式に整形する
 * @param slackClient - Slack Client
 */
export const getSlackUsersRes = async (
  slackClient: WebClient
): Promise<TUserSlackRes[]> => {
  const userInfo = await slackClient.users.list({});
  if (!userInfo || !userInfo.members || userInfo.members.length === 0) {
    throw { status: 404, code: "User not found" };
  }
  const usersRes: TUserSlackRes[] = userInfo.members.map((member: any) => {
    return {
      userId: member.id || "",
      userName: member.name || "",
      userIcon: member.profile.image_512 || ""
    };
  });
  return usersRes;
};
