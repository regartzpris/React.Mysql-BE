const express = require('express')

const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/taskRouter')


const app = express()
const port = process.env.PORT


//untuk heroku
app.get('/', (req, res) => {
    res.send(`<h1> API running on heroku port ${port}</h1>`)

})



app.use(express.json())
app.use(userRouter)
















app.listen(port, () => {
    console.log('Api Running at', port);
})