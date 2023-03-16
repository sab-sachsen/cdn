<img src="https://github.com/sab-sachsen/cdn/raw/main/public/logo.svg" alt="SAB Logo" width="150px">

<img align="right" src="https://github.com/sab-sachsen/cdn/actions/workflows/workflow.yml/badge.svg">

---

# CDN based on [UNPKG](https://github.com/mjackson/unpkg)

This started out as a fork from [UNPKG](https://github.com/mjackson/unpkg),
but has since diverged quite a bit as it has been modified to fulfill our needs:

- Parameterized Registry URL for a [npm](https://www.npmjs.com/) compatible registry, like [Artifactory](https://www.jfrog.com/confluence/display/JFROG/JFrog+Artifactory) or [Nexus](https://www.sonatype.com/products/nexus-repository)
- Static index page, no client and browsing
- No legacy routes support
- Limit available scopes optionally, by setting `SCOPES` environment variable
- Dockerized with buildable releases/pre-build images
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

Run `npm run start:docker` to build and run the project with its containers.

Alternatively you can build the image yourself and run it:

```bash
$ docker compose up
```

### Linting

This package uses [ESLint](https://eslint.org/) for linting. You can run the linter with `npm run lint`.\
The ESLint config works out of the box with VS Codes [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

### Tests

Run the tests with `npm test`. Additionally, you can run the tests in watch mode with `npm run test:watch`.\
They are configured to work out of the box with VS Codes [Jest plugin](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest).

## Limiting available scopes

You can limit the available packages by setting the `SCOPES` environment variable. This is useful if you want to limit the available packages to a specific scope, e.g. `@some-scope`. Multiple scopes can be separated by a space, e.g. `@scope @another-scope`.

If no scope is defined, the whole package name is checked. Thus it is possible to limit the available packages to explicit packages as well, e.g. `lit express`.

## License

As the original [UNPKG](https://github.com/mjackson/unpkg), this project is licensed under the [GNU Affero General Public License](LICENSE).
