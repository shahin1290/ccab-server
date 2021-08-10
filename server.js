require('dotenv').config()
const express = require('express')
const bodyparser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const { sendContactMail } = require('./util/contactMail')
const app = express()
const cors = require('cors')
const PORT = process.env.PORT || process.env.SERVER_PORT
const myDb = require('./database/db')
const axios = require('axios')
const User = require('./models/userModel')
const Bootcamp = require('./models/bootcampModel')
const Performance = require('./models/performanceModel')
const cron = require('node-cron')
const Pusher = require('pusher');
myDb()

app.use(morgan('dev'))
app.use(express.json())

//include body-parser
app.use(bodyparser.urlencoded({ extended: true }))

/** static file **/
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.get('/', (req, res, next) => {
  res.send('Server Running...')
})


//pusher routes
const pusher = new Pusher({
  appId: "1245202",
  key: "91fac7eec05b86dbcbb5",
  secret: "f0833f5edb06ef6caa9d",
  cluster: "eu",
  useTLS: true
});

app.post('/update-editor', (req, res) => {
  pusher.trigger('editor', 'text-update', {
   ...req.body,
  });

  res.status(200).send('OK');
});

//contact mail
app.post('/contact', (req, res, next) => {
  try {
    sendContactMail(req.body)
    res.send('MESSAGE IS SUCCESSFULLY SENT')
  } catch (err) {
    res.send(err)
  }
})

//get currency and geo location
app.post('/currency-convert', async (req, res, next) => {
  try {
    const { currency, country, fromCurrency } = req.body

    const apiKey = '6068a971e6754bdf9d3b0ddc706779b0'

    const toCurrency = currency
    const query = fromCurrency + '_' + toCurrency

    const url =
      'https://api.currconv.com/api/v7/convert?q=' +
      query +
      '&compact=ultra&apiKey=' +
      apiKey

    const resp = await axios.get(url)

    const amount = resp.data[query]

    return res.status(200).json({
      success: true,
      data: { amount, country, currency }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: error
    })
  }
})

// create new empty performance for bootcamp students every night(12am)
cron.schedule('0 0 * * *', async () => {
  const bootcamps = await Bootcamp.find()
  for (bootcamp of bootcamps) {
    const startDate = new Date(bootcamp.start_date).getTime()
    const today = new Date().setHours(0, 0, 0, 0)
    if (startDate <= today) {
      const students = bootcamp.students
      for (student of students) {
        const newPerformance = new Performance({
          student: student._id,
          bootcamp: bootcamp._id
        })
        await newPerformance.save()
      }
    }
  }
})

const userRoutes = require('./routes/userRoutes')
const taskRoutes = require('./routes/taskRoutes')
const answerRoutes = require('./routes/answerRoutes')
const bootcampRoutes = require('./routes/bootcampRoutes')
const dayRoutes = require('./routes/dayRoutes')
const weekRoutes = require('./routes/weekRoutes')
const quizAnswerRoutes = require('./routes/quizAnswerRoutes')
const quizRoutes = require('./routes/quizRoutes')
const orderRoutes = require('./routes/orderRoutes')
const requestRoutes = require('./routes/requestRoutes')
const jobRoutes = require('./routes/jobRoutes')
const serviceRoutes = require('./routes/serviceRoutes')
const sessionRoutes = require('./routes/sessionRoutes')
const appointmentRoutes = require('./routes/appointmentRoutes')
const serviceCategoryRoutes = require('./routes/serviceCategoryRoutes')
const performanceRoutes = require('./routes/performanceRoutes')
const mediaCenterRoutes = require('./routes/mediaCenterRoutes')

app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/answers', answerRoutes)
app.use('/api/bootcamp', bootcampRoutes)
app.use('/api/content', dayRoutes)
app.use('/api/weeks', weekRoutes)
app.use('/api/quizAnswer', quizAnswerRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/request', requestRoutes)
app.use('/api/job', jobRoutes)
app.use('/api/service', serviceRoutes)
app.use('/api/session', sessionRoutes)
app.use('/api/appointment', appointmentRoutes)
app.use('/api/serviceCategory', serviceCategoryRoutes)
app.use('/api/performance', performanceRoutes)
app.use('/api/mediaCenter', mediaCenterRoutes)

const server = app.listen(PORT, () => {
  console.log('The server is running on port: ' + PORT)
})

const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
})

const users = {}

io.on('connection', function (socket) {
  socket.on('login', async function (data) {
    // saving userId to object with socket ID
    users[socket.id] = data.userId

    //update user online status
    await User.findByIdAndUpdate(data.userId, { status: 'online' })

    //create performance for the current date if the user login for the first time
    const performances = await Performance.find({ student: data.userId })

    if (performances.length === 0) {
      const enrolledBootcamps = await Bootcamp.find({ students: data.userId })

      for (bootcamp of enrolledBootcamps) {
        const startDate = new Date(bootcamp.start_date).getTime()
        const today = new Date().setHours(0, 0, 0, 0)

        if (startDate <= today) {
          const newPerformance = new Performance({
            student: data.userId,
            bootcamp: bootcamp._id
          })
          await newPerformance.save()
        }
      }
    }
  })

  socket.on('logout', async function (data) {
    await User.findByIdAndUpdate(data.userId, {
      status: 'offline'
    })
  })

  socket.on('disconnect', async function () {
    try {
      await User.findByIdAndUpdate(users[socket.id], {
        status: 'offline'
      })

      const start = new Date().setHours(0, 0, 0, 0)

      const end = new Date().setHours(23, 59, 59, 999)

      //update the online time spent for all courses
      const enrolledBootcamps = await Bootcamp.find({
        students: users[socket.id]
      })

      for (bootcamp of enrolledBootcamps) {
        const performance = await Performance.findOne({
          createdAt: { $gte: start, $lt: end },
          student: users[socket.id],
          bootcamp: bootcamp._id
        })

        const onlineTimeSpent =
          performance.onlineTimeSpent +
          Math.trunc(
            (new Date().getTime() - new Date(performance.online).getTime()) /
              1000
          )

        const update = {
          onlineTimeSpent,

          onlineScore:
            onlineTimeSpent > 14400
              ? 100
              : Math.trunc((onlineTimeSpent * 100) / 14400)
        }

        const updatedPerformance = await Performance.findOneAndUpdate(
          {
            createdAt: { $gte: start, $lt: end },
            student: users[socket.id],
            bootcamp: bootcamp._id
          },
          update,
          {
            new: true
          }
        )
      }
    } catch (error) {
      console.log(error)
    }

    // remove saved socket from users object
    delete users[socket.id]
  })
})
