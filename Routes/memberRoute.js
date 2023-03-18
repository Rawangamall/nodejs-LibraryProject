const express=require("express");
const router=express.Router();
const validateMW=require("../Core/Validation/validateMW");
const AuthenticateMW=require("./../Core/auth/AuthenticateMW");
const validateData=require("./../Core/Validation/memberData");
const memberController=require("./../Controllers/memberController");
const BookController=require("./../Controllers/BookController");
const Operationcontroller=require("../Controllers/BookOperationController.js");

//const updatefirstLogin=require("../Controllers/memberController").updatefirstLogin;
const imageValidate=require("../Core/Validation/imageValidate").addIMG;
const removeimage=require("../Core/Validation/imageValidate").removeIMG;
const { checkBasicAdminAndEmp, checkBaAdminAndAdminAndEmp, checkBaAdminAndMemberAndEmp }=require("./../Core/auth/AuthenticateMW");
      
router.route("/members")
       .get(  validateMW ,memberController.getAll) //checkBaAdminAndAdminAndEmpforMember
       .post( checkBasicAdminAndEmp,validateMW,memberController.addMember)
       
router.route("/member/:_id")
        .patch(imageValidate,validateData.memberArrayPatch,memberController.updateMember)
        .get(checkBaAdminAndMemberAndEmp,validateData.memberIDParams,memberController.getMember)
        .delete(validateData.memberIDParams,removeimage,memberController.deleteMember) //checkBasicAdminAndEmp

router.route("/firstLogin/:_id")
        .patch(imageValidate,validateData.MemberfirstLogin,memberController.updatefirstLogin)
 
router.get("/searchForMember",memberController.searchForMember)        
        
 router.route("/member/currentBorrowedBooks/:_id")
       .get(checkBaAdminAndMemberAndEmp,validateMW,memberController.currentBorrowedBooks)

router.route("/member/borrowInfoOneMember/:_id")
       .get(memberController.borrowInfoOneMember)
      
module.exports=router;
