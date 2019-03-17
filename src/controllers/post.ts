/**
 * post Controller
 */

import { Request, Response, NextFunction } from "express";
import * as postServices from "../services/post";

/**
 * メディアの投稿一覧を取得する
 * @param req - リクエスト
 * @param res - レスポンス
 * @param next - コールバック引数
 */
export const findPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const media = req.query.media;
    const channelId = req.query.channelId;
    const accessToken = req.query.accessToken;
    let result;
    if (media === "slack") {
      result = await postServices.findSlackPosts(channelId, accessToken);
    } else {
      throw { status: 400, code: "Invalid type" };
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};
