import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Useful for wrapping `async` request handlers in Express
 * so they automatically propagate errors.
 */
export default function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(error => {
      req.log.error(`Unexpected error in ${handler.name}!`);
      req.log.error(error.stack);

      next(error);
    });
  };
}
