import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import serveDirectoryMetadata from './actions/serve-directory-metadata.js';
import serveFileMetadata from './actions/serve-file-metadata.js';
import serveFile from './actions/serve-file.js';
import serveModule from './actions/serve-module.js';

import allowQuery from './middleware/allow-query.js';
import findEntry from './middleware/find-entry.js';
import noQuery from './middleware/no-query.js';
import requestLog from './middleware/request-log.js';
import validateFilename from './middleware/validate-filename.js';
import validatePackagePathname from './middleware/validate-package-pathname.js';
import validatePackageName from './middleware/validate-package-name.js';
import validatePackageVersion from './middleware/validate-package-version.js';

function createApp(callback) {
  const app = express();
  callback(app);
  return app;
}

export default function createServer() {
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
        allowQuery('meta'),
        validatePackagePathname,
        validatePackageName,
        validatePackageVersion,
        validateFilename,
        serveDirectoryMetadata
      );

      app.get(
        '*',
        allowQuery('meta'),
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

    // We need to route in this weird way because Express
    // doesn't have a way to route based on query params.
    const moduleApp = createApp(app => {
      app.enable('strict routing');

      app.get(
        '*',
        allowQuery('module'),
        validatePackagePathname,
        validatePackageName,
        validatePackageVersion,
        validateFilename,
        findEntry,
        serveModule
      );
    });

    app.use((req, res, next) => {
      if (req.query.module != null) {
        moduleApp(req, res);
      } else {
        next();
      }
    });

    // Send old */ requests to the new /browse UI.
    app.get('*/', (req, res) => {
      res.redirect(302, '/browse' + req.url);
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
