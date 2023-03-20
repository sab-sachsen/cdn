import cors from 'cors';
import express, { type Application } from 'express';
import morgan from 'morgan';

import serveDirectoryMetadata from './actions/serve-directory-metadata';
import serveFileMetadata from './actions/serve-file-metadata';
import serveFile from './actions/serve-file';

import allowQuery from './middleware/allow-query';
import findEntry from './middleware/find-entry';
import noQuery from './middleware/no-query';
import requestLog from './middleware/request-log';
import validateFilename from './middleware/validate-filename';
import validatePackagePathname from './middleware/validate-package-pathname';
import validatePackageName from './middleware/validate-package-name';
import validatePackageVersion from './middleware/validate-package-version';

function createApp(callback: (app: Application) => void): Application {
  const app = express();
  callback(app);
  return app;
}

export default function createServer(): Application {
  return createApp(app => {
    app.disable('x-powered-by');
    app.enable('trust proxy');
    app.enable('strict routing');

    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    app.use(cors());
    app.use(express.static('public', { maxAge: '1y' }));

    app.use(requestLog);

    // We need to route in this weird way because Express
    // doesn't have a way to route based on query params.
    const metadataApp = createApp(app => {
      app.enable('strict routing');

      app.get(
        '*/',
        allowQuery(['meta']),
        validatePackagePathname,
        validatePackageName,
        validatePackageVersion,
        validateFilename,
        serveDirectoryMetadata
      );

      app.get(
        '*',
        allowQuery(['meta']),
        validatePackagePathname,
        validatePackageName,
        validatePackageVersion,
        validateFilename,
        serveFileMetadata
      );
    });

    app.use((req, res, next) => {
      if (req.query.meta != null) {
        metadataApp(req, res);
      } else {
        next();
      }
    });

    app.get(
      '*',
      noQuery(),
      validatePackagePathname,
      validatePackageName,
      validatePackageVersion,
      validateFilename,
      findEntry,
      serveFile
    );
  });
}
