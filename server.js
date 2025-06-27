const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db.js');
const authRouter = require('./routes/authRouter.js');
const toolsRouter = require('./routes/toolsRouter.js');

dotenv.config()

const app = express()

app.use(cors(
    {
        origin: 'https://internal-tools-frontend.vercel.app',
        credentials: true
    }
));
app.use(express.json())

connectDB();

app.use('/api/auth', authRouter);
app.use('/api/tools', toolsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
