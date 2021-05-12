const mongoose = require("mongoose");
const dbCon = async () => {
  mongoose.set("useCreateIndex", true);
  try {
    await mongoose.connect( process.env.MONGODB_URI || process.env.DB, {
      useCreateIndex:true,
      useUnifiedTopology:true,
      useNewUrlParser:true,
      useFindAndModify:false,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = dbCon;
