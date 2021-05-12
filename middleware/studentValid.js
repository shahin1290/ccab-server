const Bootcamp = require('../models/bootcampModel')

// protect route ==> only the valid bootcamp student can be accessed

const isValidStudent = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.findOne({
      students: { $elemMatch: { _id: req.user._id } }
    })

    if (bootcamps.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'User is not enrolled in any Bootcamps.'
      })
    }

    next()
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      message: 'Something went wrong'
    })
  }
}

module.exports = { isValidStudent }
