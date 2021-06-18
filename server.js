require('dotenv').config()
const express = require('express')
const bodyparser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const { sendContactMail } = require('./util/contactMail')
const app = express()
var cors = require('cors')
const PORT = process.env.PORT || process.env.SERVER_PORT
const myDb = require('./database/db')
const axios = require('axios')

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
    const { currency, country } = req.body

    const apiKey = '230d7f66fcc54d2cf6de'

    const fromCurrency = 'USD'
    const toCurrency = currency
    const query = fromCurrency + '_' + toCurrency

    const url =
      'https://free.currconv.com/api/v7/convert?q=' +
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

app.listen(PORT, () => {
  console.log('The server is running on port: ' + PORT)
})
