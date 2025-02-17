const express = require('express');
const app = express();
const userRoute = require('./routes/UserRoutes')
const ServiceRoute=require('./routes/ServiceRoutes')
const AppointmentRoute=require('./routes/AppointmentRoutes')
const EmployeeRoutes=require('./routes/EmployeeRoutes')
const CartRoutes=require('./routes/CartRoutes')
const PaymentRoutes=require('./routes/PaymentRoutes')

const db = require('./db');
const bodyParser = require('body-parser');


app.use(bodyParser.json());  //body-parser middleware

//Routes
app.use('/user', userRoute)
app.use('/service', ServiceRoute)
app.use('/appointment', AppointmentRoute)
app.use('/employee', EmployeeRoutes)
app.use('/cart',CartRoutes)
app.use('/payment',PaymentRoutes)

//Port

app.listen(3000, () => console.log('Server running on port 3000'));
