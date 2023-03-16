const mongoose=require("mongoose");
require("./../Models/member");
require("../Models/BookModel");
require("../Models/EmpModel");
require("../Models/BookOperationModel");

const EmpSchema=mongoose.model("Employees");
const MemberSchema=mongoose.model("member");
const BookSchema=mongoose.model("Book");
const BookOperationSchema=mongoose.model("BookOperation");


exports.addBorrowbook=(request,response,next)=>{
    MemberSchema.findOne({_id:request.body.memberID})
    .then((result)=>{
        if(result != null )
        {
            BookSchema.findOne({_id:request.params._id})
            .then((res)=>{            
                if(res!=null){
                    if(res.available){
                      BookOperationSchema.find({ memberID:request.body.memberID,bookID:request.params._id,"returned":{$eq:false}}).then((check)=>{
                            console.log(check)
                            if(check == ""){
                                BookSchema.findOneAndUpdate({_id:request.params._id}, {$inc : {'noOfCurrentBorrowed' : 1,'noBorrowed' : 1}})
                                .then((res)=>{
                                    new BookOperationSchema({
                                    operation:"borrow",
                                    returned:false,
                                    memberID:request.body.memberID,
                                    employeeID:request.body.employeeID,
                                    bookID:request.params._id,
                                    startDate:Date(),
                                    expireDate:new Date(new Date().getTime()+(14*24*60*60*1000)),
                                    late:"Not late"
                            }).save()
                        .then((data)=>{
                                //show if available or not
                                   BookSchema.updateMany({},
                                   [{ $set: { available: { $lt: [{$subtract: [ { $sum: ['$noOfCurrentReading', '$noOfCurrentBorrowed'] },"$noOfCopies" ]},1] } } }])
                                   .then(result=>{console.log(available),response.status(200).json({result})})
                                .catch(error=>next(error))
                       
                            response.status(200).json({data});
                        })
                    })
                            }else{response.status(404).json({data:"This Book is already borrowed!"});}
                        })
}
        else{response.status(404).json({data:"This Book is not Avilable"});}
        }   
        else{response.status(404).json({data:"This Book is not Found"});}      
    })
    }
    else{
    response.status(404).json({data:"This member is not Found"});
    }
    })
    .catch(error=>{
    next(error);
    })
    }
    
    exports.addReadbook=(request,response,next)=>{
        MemberSchema.findOne({_id:request.params._id})
        .then((result)=>{
            if(result != null )
            {
                BookSchema.findOne({_id:request.body.bookID})
                .then((res)=>{            
                    if(res!=null){
                        if(res.available){
                            BookSchema.findOneAndUpdate({_id:request.body.bookID}, {$inc : {'noOfCurrentReading' : 1,'noReading' : 1}})
                            .then((res)=>{
                                new BookOperationSchema({
                                operation:"read",
                                returned:false,
                                memberID:request.params.memberID,
                                employeeID:request.body.employeeID,
                                bookID:request.body.bookID,
                                startDate:Date(),
                                expireDate:new Date(new Date().getTime()+(1*24*60*60*1000)),
            }).save()
            .then((data)=>{
                    //show if available or not
                       BookSchema.updateMany({},
                       [{ $set: { available: { $lt: [{$subtract: [ { $sum: ['$noOfCurrentReading', '$noOfCurrentBorrowed'] },"$noOfCopies" ]},0] } } }])
                       .then(result=>{console.log(available),response.status(200).json({result})})
                    .catch(error=>next(error))
           
                response.status(200).json({data});
            })
            .catch(error=>{
            next(error);
            })})}
            else{response.status(404).json({data:"This Book is not Avilable"});}
            }   
            else{response.status(404).json({data:"This Book is not Found"});}      
        })
        }
        else{
        response.status(404).json({data:"This member is not Found"});
        }
        })
        .catch(error=>{
        next(error);
        })
        }
                       
exports.getAll=(request,response)=>{
    BookOperationSchema.find({})
                    .then((data)=>{        
                        //member exceeds the return date of borrowed books
                        BookOperationSchema.updateMany({expireDate: { $lt: new Date()},operation:"borrow",returned:false}, [{ $set: { late: "Late: This book isn't returned yet"}}])
                        .then(data=>{console.log("done")}).catch(error=>next(error));  

                        response.status(200).json({data});
                        })
                    .catch(error=>{
                        next(error);
                    })
}

 exports.updateBookOperation=(request,response,next)=>{
    
            BookOperationSchema.updateOne({
                _id:request.params._id
            },{
                $set:{
                    operation:request.body.operation,
                    memberID:request.body.memberID,
                    bookID:request.body.bookID,
                    employeeID:request.body.employeeID,
                    expireDate:request.body.expireDate,
                    returned:request.body.returned,         
                }
            }).then(data=>{
                if(data.acknowledged==false)
                {
                
                    next(new Error("bookOperation not found"));
                }
                else
                response.status(200).json(data);
            })
            .catch(error=>next(error));
        }
        
 exports.deleteBookOperation=(request,response)=>{
            BookOperationSchema.deleteOne({_id:request.params._id})
            .then((result)=>{
                if(result.deletedCount !=0 ){
                    response.status(200).json({data:"deleted"});
                }
                else
                {   response.status(404).json({data:"delete Not Found"});}
            })
            .catch(error=>next(error));
        }
        
        exports.getBookOperation=(request,response,next)=>{
            BookOperationSchema.findOne({_id:request.params._id})
            .then((result)=>{
                if(result != null)
                {
                    response.status(200).json({result});
                }
                else{
                    response.status(404).json({result:"Not Found"});
                }
            })
            .catch(error=>{
                next(error);
            })
            }


exports.borrowBYdate=async(request,response,next)=>{
        date = new Date();
        const Month = request.body.searchbyMonth
        let searchbyMonth = Number(Month)
        const searchbyYear= request.body.searchbyYear
       try{ 
        if(searchbyMonth != null && searchbyYear != null){
        searchDate=new Date(`${searchbyYear}-${searchbyMonth}-2`).toISOString().split('T')[0]
        EndDate=new Date(`${searchbyYear}-${searchbyMonth+1}-2`).toISOString().split('T')[0]
                  
         let BorrowedBooks_ByDate = await BookOperationSchema.find(
            {"startDate":{$gte:searchDate,$lt:EndDate},"operation":{$eq:"borrow"}})
            response.status(200).json({BorrowedBooks_ByDate});
         }else{
        CurrentMonth = new Date().toISOString().split('T')[0]
            let BorrowedBooks_CurrentMonth = await BookOperationSchema.find(
            {"startDate":{$gte:CurrentMonth},"operation":{$eq:"borrow"}})
            response.status(200).json({BorrowedBooks_CurrentMonth});
            }
        }catch(error)
        {
            next(error);
        }
    }

    exports.readingBYdate=async(request,response,next)=>{
        date = new Date();
        const Month = request.body.searchbyMonth
        let searchbyMonth = Number(Month);
        const searchbyYear= request.body.searchbyYear
       try{ 
        if(searchbyMonth != null && searchbyYear != null){
        searchDate=new Date(`${searchbyYear}-${searchbyMonth}-2`).toISOString().split('T')[0]
        EndDate=new Date(`${searchbyYear}-${searchbyMonth+1}-2`).toISOString().split('T')[0]
           
         let ReadBooks_ByDate = await BookOperationSchema.find(
            {"startDate":{$gte:searchDate,$lt:EndDate},"operation":{$eq:"read"}})
            response.status(200).json({ReadBooks_ByDate});
         }else{
        CurrentMonth = new Date().toISOString().split('T')[0]
            let ReadBooks_CurrentMonth = await BookOperationSchema.find(
            {"startDate":{$gte:CurrentMonth},"operation":{$eq:"read"}})
            response.status(200).json({ReadBooks_CurrentMonth});
            }
        }catch(error)
        {
            next(error);
        }
    }

    
exports.returnBorrowBook=(request,response,next)=>{
        BookSchema.findOneAndUpdate({_id:request.body.bookID}, {$inc : {'noOfCurrentBorrowed' : -1}}).then((res)=>{
        BookOperationSchema.updateOne({ "_id" : request.params._id} ,{
            $set:{ "returned" : request.body.returned}
        }).then(data=>{
            if(data.matchedCount==0)
            {
                next(new Error("This borrow operation is not found"));
            }
            else{
                   //show if available or not
                   BookSchema.updateMany({},
                [{ $set: { available: { $lt: [{$subtract: [ { $sum: ['$noOfCurrentReading', '$noOfCurrentBorrowed'] },"$noOfCopies" ]},0] } } }])
                .then(result=>{console.log(available),response.status(200).json({result})})
                .catch(error=>next(error))
                console.log(request.body.returned);
                response.status(200).json({data:"Updated!"});
            }
        })
        .catch(error=>next(error));
    })}

//g  borrowedbooks with employee responsible for borrowing
exports.borrowInfo=(request,response,next)=>{
    strID = request.params._id
    NumID=Number(strID)

    BookOperationSchema.aggregate( [
        {$match: {memberID:NumID, operation:"borrow"}},
                 {
          $lookup: {
                      from: 'books',
                      localField: 'bookID',
                      foreignField: '_id',
                      as: 'book'
                    }    
                  }
                  ,
                  {
          $lookup: {
                    from: 'employees',
                    localField: 'employeeID',
                    foreignField: '_id',
                    as: 'emp'
                 }    
                }
                  ,  
              {
                $project: { 
                          _id:0,
                          EmployeName: "$emp.firstName",
                          BookTitle: "$book.title"
                 }
              }
      ]).then(borrowedBook=>{
     if(borrowedBook != "")
{       
     response.status(200).json({borrowedBook});
}else{response.status(404).json({borrowedBook:"Borrowed Books Not Found"});}
    })
    .catch(error=>next(error));
}

 exports.returnReadBook=(request,response,next)=>{
        BookSchema.findOneAndUpdate({_id:request.body.bookID}, {$inc : {'noOfCurrentReading' : -1}}).then((res)=>{
        BookOperationSchema.updateOne({ "_id" : request.params._id} ,{
            $set:{ "returned" : request.body.returned}
        }).then(data=>{
            if(data.matchedCount==0)
            {
                next(new Error("This reading operation is not found"));
            }
            else{
                //show if available or not
                BookSchema.updateMany({},
                [{ $set: { available: { $lt: [{$subtract: [ { $sum: ['$noOfCurrentReading', '$noOfCurrentBorrowed'] },"$noOfCopies" ]},0] } } }])
                .then(result=>{console.log(available),response.status(200).json({result})})
                 .catch(error=>next(error))
                console.log(request.body.returned);
                response.status(200).json({data:"Updated!"});
            }
        })
        .catch(error=>next(error));
    })}
    

exports.makeSureOfReturnedRead=(request,response,next)=>{
    //make sure that book is returned before the end of the day
    BookOperationSchema.updateMany({
        expireDate: { $lt: new Date()},operation:"read",returned:false}, 
        [{ $set: { returned: true}}])
    .then(data=>{
        if(data.matchedCount!=0)
            response.status(200).json({data:"All read books are returned successfully"});
        else
            response.status(200).json({data:"All read books are already returned!"});
        })
    .catch(error=>next(error));
}