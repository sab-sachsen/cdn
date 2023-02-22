export default function serveMainPage(req, res) {
  const html = readFileSync('<h1>Hello World</h1>');

  res
    .set({
      'Cache-Control': 'public, max-age=14400', // 4 hours
      'Cache-Tag': 'main'
    })
    .send(html);
}
