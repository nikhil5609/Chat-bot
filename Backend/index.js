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
    })
    .catch((err) => {
        console.log("DB Connection failed: ", err);
    })

// Middleware
server.use(cors({
    origin: 'https://chat-bot-frontend-qrhg.onrender.com/',
    methods: ['GET', 'POST'],
    credentials: true
}));
server.use(express.json());

// Routes
server.use('/user', userRouter);
server.use('/', modelRouter);


server.listen(PORT, () => {
    console.log(`Server Running at PORT ${PORT}`);
})