const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const net = require("net");
const dotenv = require("dotenv")
const path = require("path")
const bodyParser = require('body-parser');


dotenv.config({ path: "../../../.env" });


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const { startTCPServer } = require("./Utils/tcpService");
const streamRoutes = require("./Routes/streamRoutes");

const PORT = process.env.STREAMING_PORT || 10000;
const STREAM_PORT = process.env.RASPBERRY_PORT||30000;
const IP = process.env.IP || "localhost";
app.locals.IP = IP

app.use(express.static(path.join(__dirname, "UI/Public")));
app.set("views", "../../../UI/Views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", streamRoutes);

io.on("connection", (socket) => {
    console.log("Client connected to WebSocket");
});

startTCPServer(io, STREAM_PORT);

server.listen(PORT, IP, () => console.log(`Streaming Server is running on ${IP}:${PORT}`));
