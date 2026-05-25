const http = require('http');

const data = JSON.stringify({
  code: "// File: .claude-plugin/marketplace.json\n{\n  \"sha\": \"123\",\n  \"homepage\": \"https://kensho.com\"\n}",
  issues: [],
  persona: "Startup CTO",
  language: "json",
  isAlternative: false
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/review/repair',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});

req.on('error', console.error);
req.write(data);
req.end();
