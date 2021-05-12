const { validationResult } = require('express-validator')
const Bootcamp = require('./../models/bootcampModel')
const Week = require('./../models/weekModel')
const Day = require('./../models/dayModel')
const fs = require('fs')

//********** Functions ************************************

//********** validation Resault ************

function getValidationResualt(req) {
  const error = validationResult(req)
  if (!error.isEmpty()) return error.array()
  return false
}

//********** is Name exist ************
const isNameExist = async (bootcampName) => {
  const bootcamp = await Bootcamp.find({ name: bootcampName })
  if (bootcamp.length) {
    return true
  }
  return false
}

//********** createNewWeeks  ************
const createNewWeeks = async (updatedBootcamp) => {
  for (let i = 1; i <= updatedBootcamp.weeks; i++) {
    const newWeek = new Week({
      name: `week${i}`,
      bootcamp: updatedBootcamp._id
    })
    await newWeek.save()
  }
}

//********** createNewWeeks  ************
const createNewDays = async (updatedBootcamp) => {
  for (let i = 1; i <= updatedBootcamp.weeks; i++) {
    const week = await Week.findOne({
      name: `week${i}`,
      bootcamp: updatedBootcamp._id
    })

    for (let j = 1; j <= 5; j++) {
      const newDay = new Day({
        name: `day${j}`,
        week: week._id,
        video_path:
          'https://player.vimeo.com/video/243885948?color=ffffff&title=0&byline=0&portrait=0'
      })
      await newDay.save()
    }
  }
}

//********** Functions End************************************

//********** default route ************
//@des Get all bootcamps for specific account
//@route Get api/v2/bootcamps
//@accesss private (allow for all users)

exports.getAllBootcamps = async (req, res, next) => {
  try {
    const pageSize = 6
    const page = Number(req.query.pageNumber) || 1
    const count = await Bootcamp.countDocuments()
    var bootcamps
    //console.log(req.user);

    console.log('normal user  request')
    bootcamps = await Bootcamp.find({ published: true })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('mentor', 'name _id')
      .populate('students')

    if (!bootcamps.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: { bootcamps, page, pages: Math.ceil(count / pageSize) }
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des Get all bootcamps as admin
//@route Get api/v2/bootcamps/mange
//@accesss private (allow for all users)
exports.MangeBootcamp = async (req, res, next) => {
  try {
    const pageSize = 10
    const page = Number(req.query.pageNumber) || 1
    const count = await Bootcamp.countDocuments()
    var bootcamps
    //console.log(req.user);

    console.log('Admin user  request')
    bootcamps = await Bootcamp.find()
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('mentor', 'name _id')

    if (!bootcamps.length)
      return res
        .status(404)
        .json({ success: false, message: 'There is No Data Found' })

    return res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: { bootcamps, page, pages: Math.ceil(count / pageSize) }
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des POST new bootcamp for specific account
//@route POST api/v2/bootcamps
//@accesss private (allow for all users)
exports.newBootcamp = async (req, res, next) => {
  try {
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const bootcamps = await Bootcamp.find()
    console.log(`bootcamps ${bootcamps.length} ${req.user._id}`)

    // default new bootcamp
    const bootcamp = new Bootcamp()
    bootcamp.name = `bootcamp ${bootcamps.length + 1}`
    bootcamp.description =
      'The essence of this board is to provide a high-level overview of your bootcamp. This is the place to plan and track your progress. '
    bootcamp.mentor = req.user._id
    bootcamp.price = 1000
    bootcamp.seats = 10
    bootcamp.weeks = req.body.weeks
    bootcamp.img_path = '/uplods/img.png'
    bootcamp.video_path = 'https://www.youtube.com/watch?v=C0DPdy98e4c'
    //bootcamp.created_at =
    const savedbootcamp = await bootcamp.save()

    const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
      savedbootcamp._id,
      {
        end_date:
          savedbootcamp.start_date.getTime() +
          1000 * 60 * 60 * 24 * 7 * savedbootcamp.weeks
      }
    )

    //create weeks and days based on bootcamp
    await createNewWeeks(updatedBootcamp)
    await createNewDays(updatedBootcamp)

    return res.status(201).json({
      success: true,
      data: {
        _id: updatedBootcamp._id,
        name: updatedBootcamp.name,
        created_at: Bootcamp.getDate(updatedBootcamp.createdAt),
        description: updatedBootcamp.description,
        account_id: updatedBootcamp.account_id
      }
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ success: false, message: 'Server Error' + err })
  }
}

//@des GET single bootcamp for specific account
//@route GET api/bootcamp/:id
//@accesss private (allow for Admin)
exports.bootcampDetails = async (req, res) => {
  try {
    const id = req.params.id
    const bootcamp = await Bootcamp.findOne({
      _id: id
    })
      .populate('mentor', 'name _id')
      .populate('students')

    if (!bootcamp) {
      return res
        .status(404)
        .json({ success: false, message: 'bootcamp is not found' })
    }

    return res.status(200).json({
      success: true,
      data: bootcamp
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server error: ' + err })
  }
}

//@des PUT Update single bootcamp for specific account
//@route PUT api/v2/bootcamp/:id
//@accesss private (allow for Admin)
exports.updateBootcamp = async function (req, res) {
  try {
    console.log(req.body)
    const errors = getValidationResualt(req)
    if (errors.length)
      //returning only first error allways
      return res.status(400).json({ success: false, message: errors[0].msg })

    const id = req.params.id
    const bootcamp = await Bootcamp.findById(id)

    let update

    if (req.body.students) {
      update = { ...req.body, students: JSON.parse(req.body.students) }
    }

    if (req.body.info_list) {
      console.log(req.body.info_list)
      update = { ...update, info_list: req.body.info_list }
    }

    if (req.file) {
      update = { ...update, img_path: req.file.filename }
    }

    const updatedBootcamp = await Bootcamp.findOneAndUpdate(
      { _id: id },
      update,
      {
        new: true
      }
    )

    if (updatedBootcamp) {
      await Bootcamp.findByIdAndUpdate(updatedBootcamp._id, {
        end_date:
          updatedBootcamp.start_date.getTime() +
          1000 * 60 * 60 * 24 * 7 * updatedBootcamp.weeks
      })
      if (updatedBootcamp.weeks !== bootcamp.weeks) {
        // 1 delete week and day content for that bootcamp
        // 2 delete the image_path upload files for the bootcamp
        // 3 delete video path and element_text image file uploads from day

        const weeks = await Week.find({ bootcamp: bootcamp._id })

        await Week.deleteMany({ bootcamp: id })

        weeks.forEach(async (week) => {
          const days = await Day.find({ week: week._id })

          await Day.deleteMany({ week: week._id })

          days.forEach(async (day) => {
            //fs.unlinkSync(day.video_path)

            //check if day contains any image reference
            const imageElemntArr = day.source_code.filter(
              (item) => item.element_type === 'image'
            )

            //remove image from public folder
            if (imageElemntArr.length > 0) {
              imageElemntArr.forEach((el) => fs.unlinkSync(el.element_text))
            }
          })
        })

        //create weeks and days based on bootcamp
        await createNewWeeks(updatedBootcamp)
        await createNewDays(updatedBootcamp)
      }
    }
    return res.status(200).json({
      success: true,
      data: updatedBootcamp
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}

//@des DELETE single bootcamp for specific account
//@route DELETE api/v2/bootcamp/:id
//@accesss private (allow for Admin)
exports.deleteBootcamp = async function (req, res) {
  try {
    const { id } = req.params
    const bootcamp = await Bootcamp.findById(id)

    if (!bootcamp)
      return res.status(404).json({
        message: "bootcamp doesn't  Exist In "
      })

    await bootcamp.deleteOne()

    // 1 delete week and day content for that bootcamp
    // 2 delete the image_path upload files for the bootcamp
    // 3 delete video path and element_text image file uploads from day

    const weeks = await Week.find({ bootcamp: id })

    await Week.deleteMany({ bootcamp: id })

    weeks.forEach(async (week) => {
      const days = await Day.find({ week: week._id })

      await Day.deleteMany({ week: week._id })

      days.forEach(async (day) => {
        fs.unlinkSync(day.video_path)

        //check if day contains any image reference
        const imageElemntArr = day.source_code.filter(
          (item) => item.element_type === 'image'
        )

        //remove image from public folder
        if (imageElemntArr.length > 0) {
          imageElemntArr.forEach((el) => fs.unlinkSync(el.element_text))
        }
      })
    })

    return res.status(200).json({
      data: null,
      message: 'bootcamp hase been deleted',
      success: true
    })
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error : ' + err })
  }
}
