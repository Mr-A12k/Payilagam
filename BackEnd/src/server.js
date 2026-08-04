require("dotenv").config();

const app = require("./app");
const http = require("http");
const { initializeSocket } = require("./config/socket");

const PORT =
  process.env.PORT || 5000;

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});