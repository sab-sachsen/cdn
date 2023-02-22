import type { NextFunction, Request, Response } from 'express';
import createSearch from '../utils/create-search';

/**
 * Reject URLs with invalid query parameters to increase cache hit rates.
 */
export default function allowQuery(validKeys: string[] = []) {
  if (!Array.isArray(validKeys)) {
    validKeys = [validKeys];
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const keys = Object.keys(req.query);

    if (!keys.every(key => validKeys.includes(key))) {
      const newQuery = keys
        .filter(key => validKeys.includes(key))
        .reduce((query, key) => {
          query[key] = req.query[key];
          return query;
        }, {} as Request['query']);

      return res.redirect(302, req.baseUrl + req.path + createSearch(newQuery));
    }

    next();
  };
}
