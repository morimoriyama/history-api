import express from 'express';
import * as userController from './controllers/user';
import * as channelController from './controllers/channel';
import * as postController from './controllers/post';
import { NextFunction } from 'connect';

export const init = async (app: express.Application): Promise<void> => {
  app.get('/', async (_req, res, next) => {
    res.json({ msg: 'alive' });
  });
  app.post('/v1/oauth2/access', userController.auth);
  app.get('/v1/users', userController.findUsers);
  app.get('/v1/channels', channelController.findChannels);
  app.get('/v1/posts', postController.findPosts);

  // エラーが起きた場合のハンドリングを行う
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: NextFunction
    ) => {
      console.log(err);
      if (err && err.data && (err.data.error === 'invalid_auth' || err.data.error === 'not_authed')) {
        err.status = 401;
      }
      res.status(err.status || 500).json(err);
    }
  );
};
