const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { AllowIfLogin, grantAccess } = require("../middleware/auth");
const {userValidatorChek ,
        AccessUserValidator,
        UpdateUserValidator,
        UpdateAnyUserValidator} = require("../middleware/userValid");


router     
      .route('/numbers')
            .get(userController.getUsersNumbers)

router.route("/")
      // private Route for admin and ViwerUser and Mentors : get all users 
      .get(AllowIfLogin, grantAccess('readAny','profile'), userController.getUsers)
      // private Route for admin : add new user ( student or viewer or mentor)
      .post(AllowIfLogin,userValidatorChek, grantAccess('createAny','profile'),userController.new )
router
    .route('/access')
    // private Route for admin : to give accesss for viewerUser to access specific users
      .post(AllowIfLogin,AccessUserValidator,grantAccess('createAny','accsess'),userController.giveAccess)

router
      .route("/profile")
      .get(AllowIfLogin,grantAccess('readOwn','profile'), userController.view)
      // public for all but the gust, update profile
      .put(AllowIfLogin, userController.update)
      // public for all users : Get own profile
      
    
router
  .route("/:id")
  //** strict the ViewerUser to see only his users */ */
  .get(AllowIfLogin,grantAccess('readAny','profile'), userController.viewUserProfile)
  // private Route for admin : deelte user 
  .delete(AllowIfLogin, grantAccess('deleteAny','profile'), userController.delete)
  // Private for Admin , update users profile, updating only roles
  .put(AllowIfLogin,grantAccess('updateAny','profile'), UpdateAnyUserValidator, userController.updateUser)


router 
    .route('/valid')
    // public for all clients 
        .post(userController.isTokenValid)



// public route for all clients
//router.route("/register").post( userValidatorChek, $add new functions for register new user );
router.route("/login").post(userValidatorChek, userController.login);
router.route("/register").post(userValidatorChek, userController.register);


module.exports = router;
