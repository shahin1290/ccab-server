const AccessControl = require('accesscontrol')
const ac = new AccessControl()


exports.roles = (()=>{


    // student user 
    ac.grant("StudentUser")
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

    // Viewer user
    ac.grant("ViewerUser")
        .readAny('profile')
        .readOwn('profile')


    // Mentor user
    ac.grant("MentorUser")
        // profiles
        .extend('ViewerUser')
        .extend('StudentUser')
        //bootcamp
        .updateOwn('bootcamp')
        .readAny('bootcamp')

        //weeks 
        .readAny('weeks') // get week for sepecific bootcamp 
        .createAny("weeks")
        .deleteAny("weeks")
        .updateAny("weeks")
        //days
        .createAny("days")
        .deleteAny("days")
        .updateAny("days")
        // test & Assignment
        .createOwn('task')
        .updateOwn('task')
        .readOwn('task')
        .deleteOwn("task")
        .readAny('Answer')
        


    // Admin user
    ac.grant("AdminUser")
        .extend('ViewerUser')
        .extend('StudentUser')
        .extend('MentorUser')


        // Users
        .createAny("profile")
        .deleteAny("profile")
        .updateAny("profile")
        // Give access
        .createAny('accsess')

        // bootcamp
        .createAny("bootcamp")
        .deleteAny("bootcamp")
        .updateAny("bootcamp")
        //weeks
        .createAny("weeks")
        .deleteAny("weeks")
        .updateAny("weeks")
        //days
        .createAny("days")
        .deleteAny("days")
        .updateAny("days")
        // tasks
        .createAny("task")
        .deleteAny("task")
        .updateAny("task")
        
    
    return ac;
})();