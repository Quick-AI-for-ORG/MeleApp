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
const streamRoutes = require("./routes/streamRoutes");

const PORT = process.env.STREAMINGWEB||10000;
const STREAMPORT = process.env.STREAMINGPORT||30000;
const IP = process.env.IP;
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

startTCPServer(io, STREAMPORT);

server.listen(PORT, IP, () => console.log(`Web app running on ${IP}:${PORT}`));
