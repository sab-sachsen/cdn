import createServer from './create-server';

const server = createServer();
const origin = process.env.ORIGIN || 'http://localhost';
const port = process.env.PORT || '8080';

server.listen(port, () => {
  console.info(`Server running on ${origin}:${port}, Ctrl+C to quit`);
});
