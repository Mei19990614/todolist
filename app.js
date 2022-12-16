//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-mei:<Password>@cluster0.uoeva3j.mongodb.net/todoDB");


const itemsSchema={
  name:String
};




const Item = mongoose.model("Item",itemsSchema);

const v1=new Item ({name:"Complete Web 2023"});
const v2=new Item ({name:"Wash clothes"});
const v3=new Item ({name:"Feed Doudou"});

const defaultItems= [v1,v2,v3];


const listSchema={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);



// Item.insertMany(defaultItems,function(err){
//   if (err){
//     console.log(err);
//   }else{
//     console.log("Successful save default into DB")
//   };
// });


app.get("/", function(req, res) {


  Item.find({},function(err, foundItems){
    if (foundItems.length===0){
    
          Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Successful save default into DB");
        };
        });
          res.redirect("/");}
    else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    });

});

app.get("/:customList", function(req,res){
  
  const customList=_.capitalize(req.params.customList);

  List.findOne({name:customList},function(err,foundList){

    if (!foundList){
      console.log("Doesn't exit, Create a new one!");
        const list= new List({name:customList,items: defaultItems});

        list.save();
        res.redirect("/"+customList);

    }else {
      // console.log("Exist!");

      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      };
    
  })  


  // const list= new List({name:customList,items: defaultItems});

  // list.save();

  });



app.post("/", function(req, res){

  const itemName= req.body.newItem;
  const listName= req.body.list;

  const item=new Item ({name:itemName});
   if (listName ==="Today"){

       item.save();
      res.redirect("/");

   }
   else{ 

      List.findOne({name:listName}, function(err,foundList){

        foundList.items.push(item);

        foundList.save();
        res.redirect("/"+listName);

      });

   };
  


});



app.post("/delete", function(req,res){

  const deleteItemID=req.body.checkbox;
  const deleteList=req.body.listName;

  if (deleteList ==="Today"){

      Item.findByIdAndRemove(deleteItemID,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Item from List:Today is Deleted Successful.");
        };
      });

      res.redirect("/");

   }
   else{ 

    List.findOneAndUpdate({name:deleteList },
      {$pull: {items:{_id:deleteItemID}} },
      function(err,foundList){
        if(!err){
          console.log("Item from List: "+deleteList+" is Deleted Successful.");
          res.redirect("/"+deleteList);
        };
      })

   };
  


});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
