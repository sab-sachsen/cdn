export default function getContentTypeHeader(type?: string): string | undefined {
  return type === 'application/javascript' ? type + '; charset=utf-8' : type;
}
