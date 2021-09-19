const express = require("express");
const router = express.Router();
const promoController = require("../controllers/promoController");
const { AllowIfLogin, grantAccess } = require("../middleware/auth");

router
  .route("/")
  // get all the pormos
  .get(promoController.getPromos)
  // create a new pormo
  .post(AllowIfLogin, grantAccess("createAny", "promo"), promoController.new);

router
  .route("/:id")
  // specific pormo details
  .get(AllowIfLogin, promoController.view)
  // update a specific pormo
  .put(promoController.update)
  // delete a specific pormo
  .delete(
    AllowIfLogin,
    grantAccess("deleteAny", "promo"),
    promoController.delete
  );

module.exports = router;
