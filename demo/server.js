import { readFileSync } from 'fs';
import http from 'http';

http
	.createServer((req, res) => {
		if (req.url === '/index.js') {
			res.writeHead(200, { 'Content-Type': 'text/javascript' });
			const script = readFileSync(process.cwd() + '/src/index.js', 'utf8');
			res.write(script);
			res.end();
			return;
		}
		if (req.url === '/thunderous/index.js') {
			res.writeHead(200, { 'Content-Type': 'text/javascript' });
			const script = readFileSync(process.cwd() + '/src/thunderous/index.js', 'utf8');
			res.write(script);
			res.end();
			return;
		}
		res.writeHead(200, { 'Content-Type': 'text/html' });
		const home = readFileSync(process.cwd() + '/src/index.html', 'utf8');
		res.write(home);
		res.end();
	})
	.listen(3000);
