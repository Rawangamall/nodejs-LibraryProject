const express=require("express");
const router=express.Router();
const validateData=require("./../Core/Validation/memberData");
const memberController=require("./../Controllers/memberController");
const BookController=require("./../Controllers/BookController");

      
router.route("/member")
       .get(memberController.getAll)
      .post(validateData.memberArrayPOST,memberController.addMember)
      
router.route("/member/:_id")
        .patch(validateData.memberArrayPatch,memberController.updateMember)
        .delete(validateData.memberArrayDel,memberController.deleteMember)
        .get(memberController.getMember)

router.route("/member/getborrowed/:_id")
       .post(memberController.addBorrowbook)
       .get(memberController.getborrowedBooks)

router.route("/member/getread/:_id")
        .get(memberController.getReadBooks)
        .post(memberController.addReadbook)

module.exports=router;
router.route("/member/arrivedBooks/get")
       .get(memberController.getNewArrivedBooks)

 router.route("/member/getCurrentborrowed/:_id")
       .get(memberController.currentBorrowedBooks)
 

module.exports=router;
