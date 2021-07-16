const Performance = require('../models/performanceModel')
const Day = require('../models/dayModel')
const Bootcamp = require('../models/bootcampModel')

//********** default route ************
//@des Get all Performance for specific account
//@route Get api/v2/Performance
//@accesss private (allow for all users)

exports.getAllPerformances = async (req, res, next) => {
  try {
    let performances

    if (req.user.user_type === 'AdminUser') {
      performances = await Performance.find()
    }

    if (req.user.user_type === 'StudentUser') {
      performances = await Performance.find({ student: req.user._id }).populate(
        'student',
        'name _id'
      )
    }

    if (!performances.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      data: performances
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des Get all Performance as admin
//@route Get api/v2/Performance/mange
//@accesss private (allow for all users)
exports.managePerformance = async (req, res, next) => {
  try {
    const Performance = await Performance.find()

    if (!Performance.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: Performance.length
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des POST new Performance for specific account
//@route POST api/v2/Performance
//@accesss private (allow for all users)
exports.newPerformance = async (req, res, next) => {
  try {
    const newPerformance = new Performance({
      student: req.user._id
    })
    const performance = await newPerformance.save()

    return res.status(201).json({
      success: true,
      data: performance
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des GET single Performance for specific account
//@route GET api/Performance/:id
//@accesss private (allow for Admin)
exports.performanceDetails = async (req, res) => {
  try {
    const id = req.params.id
    const Performance = await Performance.findOne({
      _id: id
    }).populate('student', 'name _id')

    if (!Performance) {
      return res
        .status(404)
        .json({ success: false, message: 'Performance is not found' })
    }

    return res.status(200).json({
      success: true,
      data: Performance
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + err })
  }
}

//@des PUT Update single Performance for specific account
//@route PUT api/v2/Performance/:id
//@accesss private (allow for Admin)
exports.updatePerformance = async function (req, res) {
  try {
    const id = req.params.id

    const { dayId, bootcampId } = req.body

    const day = await Day.findById(dayId)

    const performance = await Performance.findById(id)

    const course = await Bootcamp.findById(bootcampId)


    const update = {
      watchingLectures: [
        ...performance.watchingLectures,
        { lecture: day._id, course: bootcampId }
      ]
    }

    const updatedPerformance = await Performance.findOneAndUpdate(
      { _id: id },
      update,
      {
        new: true
      }
    )

    return res.status(200).json({
      success: true,
      data: updatedPerformance
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des DELETE single Performance for specific account
//@route DELETE api/v2/Performance/:id
//@accesss private (allow for Admin)
exports.deletePerformance = async function (req, res) {
  try {
    const { id } = req.params
    const Performance = await Performance.findById(id)

    if (!Performance)
      return res.status(404).json({
        message: "Performance doesn't  Exist In "
      })

    await Performance.deleteOne()

    return res.status(200).json({
      data: null,
      message: 'Performance hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
