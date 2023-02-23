<img src="https://github.com/sab-sachsen/cdn/raw/main/public/logo.svg" alt="SAB Logo" width="150px">

---

# CDN based on [UNPKG](https://github.com/mjackson/unpkg)

This started out as a fork from [UNPKG](https://github.com/mjackson/unpkg),
but has since diverged quite a bit as it has been modified to fulfill our needs:

- Parameterized Registry URL for a [npm](https://www.npmjs.com/) compatible registry, like [Artifactory](https://www.jfrog.com/confluence/display/JFROG/JFrog+Artifactory) or [Nexus](https://www.sonatype.com/products/nexus-repository)
- Static index page, no client and browsing
- No legacy routes support
- Dockerized with [pm2](https://pm2.keymetrics.io/)
- [Typescript](https://www.typescriptlang.org/) based
- Build tooling based on [esbuild](https://esbuild.github.io/)

## Usage

### Running local stack

- Optionally provide an `.env` file, see [sample file `.env.sample`](.env.sample)
- Use correct Node version, as declared in [`.nvmrc`](.nvmrc) or [`package.json`](package.json): `nvm use`.
- Install dependencies: `npm install`
- Build: `npm run build` or
- Start locally in node: `npm start`

### Run in Docker

> You must provide a `.env.docker` file in the root of your project. This file may contain variables to configure your instance.

Simply run `npm run start:docker` and it will install dependencies, build and run the container.

Or alternatively you can build the image yourself and run it:

```bash
$ docker compose up --build
```

### Tests

Run the tests with `npm test`. Additionally, you can run the tests in watch mode with `npm run test:watch`.


## License

As the original [UNPKG](https://github.com/mjackson/unpkg), this project is licensed under the [GNU Affero General Public License](LICENSE).
