const express = require('express')

const userRouter = require('./routers/userRouter')


const app = express()
const port = 2010

app.use(express.json())
app.use(userRouter)
















app.listen(port, () => {
    console.log('Api Running at', port);
})