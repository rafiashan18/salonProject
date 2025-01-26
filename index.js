const express = require('express')
const app = express()
const bodyParser = require("body-parser")
// routes
const userRoute = require('./routes/UserRoutes')


app.use(bodyParser.json())
app.use('/user', userRoute)

app.listen(3000, () => console.log('Server running on port 3000'));
