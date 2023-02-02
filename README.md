# CDN based on [UNPKG](https://github.com/mjackson/unpkg)

This started out as a fork from [UNPKG](https://github.com/mjackson/unpkg),
but has since diverged quite a bit as it has been modified to fulfill our needs.

## Usage

### Running local stack

- Use correct Node version `nvm use`
- Install dependencies `npm install`
- Build `npm run build`
- Start locally in node `npm start`

### Run in Docker

> You must provide a `.env.docker` file in the root of your project. This file may contain
> variables to configure your instance, have a look at the [sample file `.env.docker.sample`](.env.docker.sample).

Simply run `npm run start:docker` and it will install dependencies, build and run the container.
