/**
 * User Controller
 */

import { Request, Response, NextFunction } from "express";
import * as userServices from "../services/user";

/**
 * メディアのユーザ一覧を取得する
 * @param req - リクエスト
 * @param res - レスポンス
 * @param next - コールバック引数
 */
export const findUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const media = req.query.media;
    const accessToken = req.query.accessToken;
    let result;
    if (media === "slack") {
      result = await userServices.findSlackUsers(accessToken);
    } else {
      throw { status: 400, code: "Invalid type" };
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * メディアのログインを行う
 * @param req - リクエスト
 * @param res - レスポンス
 * @param next - コールバック引数
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = req.query.media;
    let result;
    if (media === "slack") {
      result = await userServices.authorizeSlack(
        req.body.clientId,
        req.body.code
      );
    } else {
      throw { status: 400, code: "Invalid type" };
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};
