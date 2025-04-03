const net = require("net");
const struct = require("python-struct"); 

exports.startTCPServer = (io, STREAM_PORT) => {
    const tcpServer = net.createServer((socket) => {
        console.log(`Python stream connected on port ${STREAM_PORT}`);
        let buffer = Buffer.alloc(0); 

        socket.on("data", (data) => {
            buffer = Buffer.concat([buffer, data]); 

            while (buffer.length >= 4) {
                const frameSize = struct.unpack("<L", buffer.slice(0, 4))[0];

                if (buffer.length >= frameSize + 4) { 
                    const frameData = buffer.slice(4, 4 + frameSize);

                    io.emit("image", frameData.toString("base64"));

                    buffer = buffer.slice(4 + frameSize);
                } else {
                    break; 
                }
            }
        });

        socket.on("close", () => console.log("Python stream disconnected"));
        socket.on("error", (err) => console.log("Socket error:", err));
    });

    tcpServer.listen(STREAM_PORT, () => console.log(`Listening for Python stream on port ${STREAM_PORT}`));
};
