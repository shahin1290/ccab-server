const express = require("express");
const router = express.Router();
const serviceAppointmentController = require("../controllers/serviceAppointmentController");

router
  .route("/")
  // get all the weeks
  .get(serviceAppointmentController.getServiceAppointments)
  // create a new week
  .post(serviceAppointmentController.new);

module.exports = router;
