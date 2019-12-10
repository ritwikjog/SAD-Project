var express =  require("express");
var app =  express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Room = require("./models/room");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");

mongoose.connect('mongodb+srv://ritwikjog:ritwik321@cluster0-d5shq.mongodb.net/test?retryWrites=true&w=majority',{
	useNewUrlParser:true,
	useCreateIndex:true
}).then(() =>{
	console.log('Connected!');
}).catch(err => {
	console.log(err.message);
});


app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});


seedDB();

app.use(require("express-session")({
		secret:"this is a secret",
		resave:false,
		saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
	
	res.render("landing");
});

app.get("/rooms", function(req, res){
	Room.find({}, function(err,rooms){
		if(err){
			console.log(err);
		}else{
			res.render("rooms/campgrounds", {rooms:rooms, currentUser:req.user});
		}
	});
});

app.post("/rooms", isLoggedIn, function(req,res){
	var name = req.body.name;
	var city = req.body.city;
	var image = req.body.image;
	var contact = req.body.contact;
	var desc = req.body.desc;
	var newRoom = {name:name, city:city, image:image, contact:contact, desc:desc};
	Room.create({
		
		name:name,
		city:city,
		image:image,
		contact:contact,
		desc:desc
		
	}, function(err,room){
		if(err){
			res.redirect("/rooms/new");
		}else{
			res.redirect("/rooms");
		}
	});
	//res.redirect("/rooms");
});

app.get("/rooms/new", function(req,res){
	res.render("rooms/new");
});

app.get("/rooms/:id/book", function(req,res){
	res.send("The room has been booked");
});

app.get("/rooms/:id",  function(req,res){
	Room.findById(req.params.id).populate("comments").exec(function(err, foundRoom){
		if(err){
			console.log(err);
		}else{
			console.log(foundRoom);
			res.render("rooms/show", {room:foundRoom});
		}
	});
});


app.get("/rooms/:id/comments/new",isLoggedIn, function(req,res){
	Room.findById(req.params.id, function(err, room){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {room:room});
		}
	});
});

app.post("/rooms/:id/comments", isLoggedIn,  function(req,res){
	Room.findById(req.params.id, function(err, room){
		if(err){
			console.log(err);
			res.redirect("/");
		}else{
			Comment.create(req.body.comment, function(err, comment){
			if(err){
				console.log(err);
			}else{
				room.comments.push(comment);
				room.save();
				res.redirect("/rooms/" + room._id);
			}
			});
		}
	});
});

app.get("/register", function(req,res){
	res.render("register");
});

app.post("/register", function(req,res){
	var newUser = new User({username:req.body.username});
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			console.log(err);
			res.render("register");
		}else{
			passport.authenticate("local")(req,res, function(){
				res.redirect("/rooms");
			});
		}
	});
});

app.get("/login", function(req,res){
	res.render("login");
});

app.post("/login", passport.authenticate("local", {successRedirect:"/rooms", failureRedirect:"/login"}),function(req,res){
	
});


app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/rooms");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect("/login"); 
		alert("Log in to continue!!");
	}
}

app.listen(3000, function(){
	
	console.log("Started Server");
	
});