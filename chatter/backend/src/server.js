    import express from "express";
    import {ENV} from "../config/env.js"
    import {connectDB} from "../config/db.js";
    import {clerkMiddleware} from "@clerk/express";
    import {serve} from "inngest/express"
    import {inngest, functions} from "../config/inngest.js";
    import chatRoute from "../routes/chatRoute.js";
    import "../instrument.mjs"
    import * as Sentry from "@sentry/node";
    import cors from "cors"
    import {Server} from "socket.io";
    import * as http from "node:http";
    import {version, validate} from 'uuid'

    //Temporary actions here
    // TODO: remove actions from server.js
    const ACTIONS = {
        JOIN: 'join',
        LEAVE: 'leave',
        SHARE_ROOMS: 'share-rooms',
        ADD_PEER: 'add-peer',
        REMOVE_PEER: 'remove-peer',
        RELAY_SDP: 'relay-sdp',
        RELAY_ICE: 'relay-ice',
        ICE_CANDIDATE: 'ice-candidate',
        SESSION_DESCRIPTION: 'session-description'
    }


    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {origin: "*"} // настройка CORS для фронтенда
    });

    app.use(clerkMiddleware()) //req.auth will be available in the req object
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
    }));
    app.use(express.json())


    function getClientRooms() {
        const {rooms} = io.sockets.adapter;

        return Array.from(rooms.keys()).filter(roomID => validate(roomID) && version(roomID) === 4);
    }

    // Исправленная часть серверного кода с socket.io
    io.on('connection', socket => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on(ACTIONS.JOIN, (join) => {
            const { room: roomID, user } = join;
            console.log(`${socket.id} joining room: ${roomID}:`, user);
            socket.user = user;


            const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

            console.log(`Current clients in room ${roomID}:`, clients);

            // Уведомляем всех существующих клиентов о новом пире
            clients.forEach(clientID => {
                const clientSocket = io.sockets.sockets.get(clientID);
                console.log(`Telling ${clientID} about new peer ${socket.id}`);
                io.to(clientID).emit(ACTIONS.ADD_PEER, {
                    peerID: socket.id,
                    user,
                    createOffer: false
                });

                console.log(`Telling ${socket.id} about existing peer ${clientID}`);
                socket.emit(ACTIONS.ADD_PEER, {
                    peerID: clientID,
                    user: clientSocket?.user ?? { id: clientID },
                    createOffer: true
                });
                console.log(`${socket.id}  ADD_PEER ${roomID}:`, user);

            });

            socket.join(roomID);
            console.log(`${socket.id} joined room ${roomID}`);
        });

        socket.on(ACTIONS.LEAVE, leaveRoom);
        socket.on('disconnecting', leaveRoom);

        socket.on(ACTIONS.RELAY_SDP, ({ peerID, sessionDescription,user }) => {
            console.log(`Relaying SDP from ${socket.id} to ${peerID}, type: ${sessionDescription.type}`);
            io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
                peerID: socket.id,
                user: socket.user,
                sessionDescription
            });
            console.log(`RELAY_DSP:`, user);

        });

        socket.on(ACTIONS.RELAY_ICE, ({ peerID, iceCandidate ,user}) => {

            console.log(`Relaying ICE from ${socket.id} to ${peerID}`);
            io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
                peerID: socket.id,
user: socket.user,
                iceCandidate
            });
            console.log(`RELAY_ICE:`, user);

        });

        function leaveRoom() {
            console.log(`${socket.id} leaving rooms`);
            const { rooms } = socket;

            Array.from(rooms).forEach((roomID) => {
                if (roomID === socket.id) return;

                const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);
                console.log(`Notifying clients in room ${roomID} about ${socket.id} leaving:`, clients);

                clients.forEach((clientID) => {
                    if (clientID !== socket.id) {
                        io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
                            peerID: socket.id,
                            user: socket.user

                        });
                    }
                });

                socket.leave(roomID);
            });
        }
    });
    app.get("/debug-sentry", (req, res) => {
        throw new Error("Sentry Errr")
    })

    app.get("/", (req, res) => {
        res.send("index")
    })

    app.use("/api/inngest", serve({client: inngest, functions}));
    app.use("/api/chat", chatRoute);

    Sentry.setupExpressErrorHandler(app)

    const startServer = async () => {
        try {
            await connectDB()
            if (ENV.NODE_ENV !== "production") {
                server.listen(ENV.PORT, () => {
                        console.log('server is on', ENV.PORT)
                        connectDB()
                    }
                )
            }
        } catch (e) {
            console.error(e)
            process.exit(1)
        }
    }
    startServer();

    export default app