/**
 * Channel Controller
 */

import { Request, Response, NextFunction } from "express";
import * as channelServices from "../services/channel";

/**
 * メディアのチャンネル一覧を取得する
 * @param req - リクエスト
 * @param res - レスポンス
 * @param next - コールバック引数
 */
export const findChannels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = req.query.media;
    const accessToken = req.query.accessToken;
    let result;
    if (media === "slack") {
        result = await channelServices.findSlackChannels(accessToken);
    } else {
      throw { status: 400, code: "Invalid type" };
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};
