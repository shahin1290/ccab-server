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
cron.schedule('0 2 * * *', async () => {
  const bootcamps = await Bootcamp.find()

  for (bootcamp of bootcamps) {
    const startDate = new Date(bootcamp.start_date).getTime()
    const today = new Date().setHours(0, 0, 0, 0)

    if (startDate <= today) {
      const students = bootcamp.students
      for (student of students) {
        //create previous performances from the start date
        const performances = await Performance.find({ student: student._id })

        if (performances.length === 0) {
          const differenceInDays = Math.ceil(
            (today - startDate) / (1000 * 3600 * 24)
          )

          new Array(differenceInDays + 1).fill(0).forEach(async (el, index) => {
            //Get today's date using the JavaScript Date object.
            let ourDate = new Date()

            //Change it so that it is  days in the past.
            let pastDate = ourDate.getDate() - index

            ourDate.setDate(pastDate)

            const newPerformance = new Performance({
              student: student._id,
              bootcamp: bootcamp._id,
              createdAt: ourDate,
              online: ourDate
            })
            await newPerformance.save()
          })
        } else {
          const newPerformance = new Performance({
            student: student._id,
            bootcamp: bootcamp._id
          })
          await newPerformance.save()
        }
      }
    }
  }
})

/* //schedule jobs
cron.schedule('* * * * *', async () => {
  const bootcamps = await Bootcamp.find()
  bootcamps.forEach((bootcamp) => {
    const start_date = bootcamp.start_date
    const current_date = new Date()

    const timePeriod = []

    for (let i = 0; i <= bootcamp.weeks; i++) {
      timePeriod.push(start_date.getTime() + 1000 * 60 * 60 * 24 * 7 * [i])
    }

    console.log(start_date, current_date)

    timePeriod.map(async (item, index) => {
      if (current_date.getTime() > item) {
        await Week.findOneAndUpdate(
          { name: `week${index + 1}` },
          { show: true }
        )
      }
    })

    //create empty answers for each student of this bootcamp for that quiz
    bootcamp.students.map(async (student) => {
      const user = await User.findOne(student._id)

      //send email to the mentor (submited Answer) .............>
      const toUser = { email: user.email, name: user.name }
      const subjet = 'Bootcamp content for this week is now opened'
      const html = {
        student: '',
        text:
          'We want to inform you that Bootcamp content for this week is now opened ',
        link: 'http://batch22server.ccab.tech/quiz/'
      }

      sendMail( toUser, subjet, html)
    })
  })
}) */

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
  socket.on('login', async function (data, callback) {
    // saving userId to object with socket ID
    users[socket.id] = data.userId

    await User.findByIdAndUpdate(data.userId, { status: 'online' })

    callback()
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

      const performance = await Performance.findOne({
        createdAt: { $gte: start, $lt: end },
        student: users[socket.id]
      })

      const onlineTimeSpent =
        performance.onlineTimeSpent +
        Math.trunc(
          (new Date().getTime() - new Date(performance.online).getTime()) / 1000
        )

      const update = {
        onlineTimeSpent,

        onlineScore:
          onlineTimeSpent > 14400
            ? 100
            : Math.trunc((onlineTimeSpent * 100) / 14400)
      }

      const updatedPerformance = await Performance.findOneAndUpdate(
        { createdAt: { $gte: start, $lt: end }, student: users[socket.id] },
        update,
        {
          new: true
        }
      )
    } catch (error) {
      console.log(error)
    }

    // remove saved socket from users object
    delete users[socket.id]
  })
})
