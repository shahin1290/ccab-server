const AccessControl = require('accesscontrol')
const ac = new AccessControl()

exports.roles = (() => {
  // student user
  ac.grant('StudentUser')
    //profile DONE
    .readOwn('profile')
    .updateOwn('profile')
    // bootcamps
    .readAny('bootcamp')
    .readOwn('weeks') // to function that cheking the show
    .readOwn('days')
    // test and assignment
    .readOwn('task')
    .readOwn('Answer')
    .updateOwn('Answer')

    //request
    .readOwn('request')

    // services
    .readAny('service')

    //appointment
    .readAny('appointments')
    .createOwn('appointment')

    //session
    .readAny('sessions')

  // Viewer user
  ac.grant('ViewerUser').readAny('profile').readOwn('profile')

  // Instructor user
  ac.grant('InstructorUser')
    //profile
    .readAny('profile')
    .readOwn('profile')
    //session
    .readAny('sessions')
    .readOwn('session')
    .updateOwn('session')
    .deleteOwn('session')
    .createOwn('session')
    //appointment
    .readOwn('appointment')
    .readAny('appointments')
    // service category
    .readAny('serviceCategories')

    // service 
    .updateOwn('service')

  // Accountant user
  ac.grant('AccountantUser')
    //profile
    .readAny('profile')
    .readOwn('profile')
    //requests
    .readAny('request')
    .createAny('request')
    .updateAny('request')
    .deleteAny('request')

  // Mentor user
  ac.grant('MentorUser')
    // profiles
    .extend('ViewerUser')
    .extend('StudentUser')
    //bootcamp
    .updateOwn('bootcamp')
    .readAny('bootcamp')

    //weeks
    .readAny('weeks') // get week for sepecific bootcamp
    .createAny('weeks')
    .deleteAny('weeks')
    .updateAny('weeks')
    //days
    .createAny('days')
    .deleteAny('days')
    .updateAny('days')
    // test & Assignment
    .createOwn('task')
    .updateOwn('task')
    .readOwn('task')
    .deleteOwn('task')
    .readAny('Answer')

  // Admin user
  ac.grant('AdminUser')
    .extend('ViewerUser')
    .extend('StudentUser')
    .extend('MentorUser')
    .extend('InstructorUser')

    // Users
    .createAny('profile')
    .deleteAny('profile')
    .updateAny('profile')
    // Give access
    .createAny('accsess')

    // bootcamp
    .createAny('bootcamp')
    .deleteAny('bootcamp')
    .updateAny('bootcamp')
    //weeks
    .createAny('weeks')
    .deleteAny('weeks')
    .updateAny('weeks')
    //days
    .createAny('days')
    .deleteAny('days')
    .updateAny('days')
    // tasks
    .createAny('task')
    .deleteAny('task')
    .updateAny('task')
    //orders
    .readAny('order')
    //requests
    .readAny('request')
    .createAny('request')
    .updateAny('request')
    .deleteAny('request')
    //jobs
    .readAny('job')
    .updateAny('job')
    .deleteAny('job')
    // service
    .createAny('service')
    .deleteAny('service')
    .updateAny('service')

    // service category
    .readAny('serviceCategory')
    .createAny('serviceCategory')
    .deleteAny('serviceCategory')
    .updateAny('serviceCategory')
  return ac
})()
