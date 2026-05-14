const express=require('express')
const router =express.Router();
const controller=require("../controllers/feedbackControllers")
console.log(controller)

    const {submitFeedback}=require("../controllers/feedbackControllers")
    router.post("/feedback",submitFeedback)

    module.exports=router