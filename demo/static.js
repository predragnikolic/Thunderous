import { promises, createReadStream } from 'node:fs';
import { extname, join } from 'node:path';

const MIME_TYPES = {
	default: 'application/octet-stream',
	html: 'text/html; charset=utf-8',
	css: 'text/css',
	js: 'text/javascript',
	png: 'image/png',
	jpg: 'image/jpeg',
	gif: 'image/gif',
	ico: 'image/x-icon',
	json: 'application/json',
	svg: 'image/svg+xml',
	webp: 'image/webp',
	woff: 'font/woff',
	woff2: 'font/woff2',
	ttf: 'font/ttf',
	otf: 'font/otf',
	eot: 'application/vnd.ms-fontobject',
	zip: 'application/zip',
	pdf: 'application/pdf',
	txt: 'text/plain',
};

const STATIC_PATH = join(process.cwd(), 'src');

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
	const filePath = join(STATIC_PATH, url);
	const pathTraversal = !filePath.startsWith(STATIC_PATH);
	const exists = await promises.access(filePath).then(...toBool);
	const found = !pathTraversal && exists;
	const ext = extname(filePath).substring(1).toLowerCase();
	const stream = found ? createReadStream(filePath) : null;
	return { found, ext, stream };
};

export const handleStatic = async (req, res) => {
	const file = await prepareFile(req.url);
	const statusCode = file.found ? 200 : 404;
	const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
	res.writeHead(statusCode, { 'Content-Type': mimeType });
	if (file.found) file.stream.pipe(res);
	else res.end();
};
