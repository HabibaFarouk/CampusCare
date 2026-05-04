// index.js
// Let `.env` win over a stale PORT (etc.) left in the shell — dotenv defaults to not overriding.
require('dotenv').config({ override: true });
const http = require('http');
const app = require('./src/app');

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Close the other app (or old node.exe) or set PORT in .env to a free port.`
    );
    console.error('Windows: netstat -ano | findstr :' + PORT + '  then taskkill /PID <pid> /F');
  } else {
    console.error('Server failed to start:', err.message);
  }
  process.exit(1);
});
