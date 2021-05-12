const Bootcamp = require('../models/bootcampModel')

//********** Valid Student Check In a bootcamp ************

exports.checkIfStudentValid = async (bootcampId, userId) => {
  const bootcamp = await Bootcamp.findById(bootcampId)
  if (!bootcamp) return null
  return bootcamp.students.some((student) => student._id.equals(userId))
}
