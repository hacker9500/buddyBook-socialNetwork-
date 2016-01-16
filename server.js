var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var ejs = require("ejs");
var path = require("path");
var session = require("express-session");

var models = require("./models/model.js");
models();

// middleware of libs
app.use(bodyParser.json());
app.use(cookieParser());
var sess = session({
    name: "logStatus",
    secure: true,
    secret: "hello baby",
    resave: true,
    saveUninitialized: true
});
app.use(sess);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname + "/public")));
app.set("view engine",ejs);
app.engine('html',ejs.renderFile);
app.set("views", path.join(__dirname + "/views"));

//defining my middle-ware
var log = function (req,resp,next){
  console.log("in the logger user is"+typeof(req.session.user));
  next();
}
var auth = function (req,resp,next){
  console.log("auth ware");
  next();
}

var middleware = {
  logger : log,
  auth: auth,
};
app.use(middleware.logger);


//routing

app.get("/",function(req,resp){
  resp.redirect("/login");
});

app.get("/home",function(req,resp){
    console.log(req.session.user);
    if( typeof(req.session.user) == "undefined")
	resp.redirect("/login");
    else
	resp.render("home.html");
});

app.get("/login", function(req,resp){
  var sess = req.session;
  if(typeof(sess.user) == "undefined" )
    resp.render("login.html");
  else{
    console.log(sess.user.userName+" "+sess.user.password);
    resp.redirect("/home");
  }
});
app.post("/login",function(req,resp){
  console.log(req.body.user);
    console.log(req.body.password);
    var usr;
    models.person.find({name: req.body.user, password: req.body.password}).exec(function(err,user){
	if(err) console.log(err);
	usr = user[0];
	console.log(usr);
	
        if(typeof(usr) == "undefined"){
            console.log("1");
            console.log(usr);
            resp.redirect("/login");
        }
        else{
            req.session.user = {
                userName: usr.name,
                password: usr.password
            };
            resp.redirect("/home");
	}
    });
});
app.post("/logout",function(req,resp){
  delete req.session.user;
  resp.send("ok");
});
app.get("/signUp",function(req,resp){
    resp.render("signup.html");
});
app.post("/signUp",function(req,resp){
    var found = 0;
    models.person.find({name: req.body.user}).exec(function(err,users){
	if(users.length != 0){
	    resp.resirect("/signUp");
	    return;
	}
	
        else{
            var newUser = models.person();
            newUser.name = req.body.user;
            newUser.password = req.body.password;
            newUser.save(function(err,user){
                if(err) console.error(err);
                var peopleObject = new models.peopleList();
                peopleObject.id = user._id;
                peopleObject.name = user.name;
                peopleObject.save();
            });
            req.session.user = {
                userName: req.body.name,
                password: req.body.password
            };
            resp.redirect("/");
	}
    });
});

app.get("/homeFeed",function(req,resp){
    resp.json([]);
});

app.get("/wallFeed",function (req,resp){
    if(typeof(req.session.user) == "undefined"){
	resp.status(500).send('please login');
    }
    else{
	models.person.find({name: req.session.user.userName, password: req.session.user.password}).exec(function (err, user){
	    resp.json(user[0].getWall());
//	    console.log(user[0]);
	});
    }
});
app.post("/wallFeed",function (req,resp){
    if(typeof(req.session.user) == "undefined"){
        resp.status(500).send('please login');
    }
    else{
        models.person.find({name: req.session.user.userName, password: req.session.user.password}).exec(function (err, user){
	    var time = Date().toString();
	    var feed = {
                text: req.body.text,
                like: req.body.like,
                time: time
            };
	    user[0].postFeed(feed,resp);
            //console.log(user[0]);
        });
    }
});

function makeFriends(usr1Name,usr2Name){
    models.person.find({name: usr1Name}).exec(function(err,user){
	user = user[0];
	var found = 0;
	user.friends.forEach( friend => {
	    if(friend.name == usr2Name){
		found++;
	    }
	});
	if(found>0) return;
	
	// if they are not friends
	models.person.find({name: usr2Name}).exec(function (err,usr){
	    usr = usr[0];
	    console.log(usr);
	    var chatNew = models.chat();
	    var id;
	    chatNew.save(function(err,doc){
		console.log(doc);
		id = doc._id;
		doc.chatID = doc._id;
		doc.save();
		console.log(id);
		usr.friends.push({
                    friendId: user._id,
                    name: usr1Name,
                    chatId: id
                });
                user.friends.push({
                    friendId: usr._id,
                    name: usr2Name,
                    chatId: id
		});
		usr.save();
		user.save();
	    });
	    console.log(id);
	    
	    //usr.save();
	});
	//user.save();
    });
    
}

app.post("/friendFeed",function(req,resp){
    if(typeof(req.session.user) == "undefined"){
        resp.status(500).send('please login');
    }
    else{
        makeFriends(req.body.name,req.session.user.userName);
        models.person.find({name: req.body.name}).exec(function (err, user){
	    console.log(user[0]);
	    resp.json(user[0].getWall());
            //      console.log(user[0]);
        });
    }
});

app.post("/likeFeed",function(req,resp){
    models.person.findById(req.body.personID,function(err,user){
	user.feeds.forEach(feed => {
	    if(req.body._id == feed._id)
		feed.like++;
	});
	console.log(user.feeds);
	user.save();
	resp.send("ok");
    });
});

app.post("/friendList",function(req,resp){
    models.peopleList.find({name: req.body.name}).exec(function(err,doc){
	console.log(doc);
	resp.json(doc);
    });
});

app.get("/getFriends",function (req,resp){
    if( typeof(req.session.user) == "undefined")
	resp.redirect("/login");
	else{
	    models.person.find({name: req.session.user.userName, password: req.session.user.password}).exec(function(err,user){
		user = user[0];
		resp.json(user.friends);
	    });
	}
});
//end routing

//chat
var chat = require("./chat/chat.js");
chat(app,sess);
//end chat//

//listen
var PORT = 80;
//papp.listen(PORT, function(){
  //console.log("server started");
//});
