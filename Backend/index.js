const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const server = express();
const cors = require('cors');
const modelRouter = require('./Routes/modelRouter.js');
const userRouter = require('./Routes/userRouter.js');
const { main } = require('./DB_connect.js');
const PORT = process.env.PORT;

main()
    .then(() => {
        console.log("DB Connected Successfully");
        server.listen(PORT, () => {
            console.log(`Server Running at PORT ${PORT}`);
        })
    })
    .catch((err) => {
        console.log("DB Connection failed: ", err);
    })

// Middleware
server.use(cors());
server.use(express.json());

// Routes

server.get("/", (req, res) => res.send("Server is running"));
server.use('/user', userRouter);
server.use('/', modelRouter);


