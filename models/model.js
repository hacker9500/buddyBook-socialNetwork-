var mongoose = require('mongoose');


// chat model
var chatSchema = mongoose.Schema({
    chatID : mongoose.Schema.Types.ObjectId,
    chat : [{
	who: String,
	text: String
    }]
});

chatSchema.methods.getChat = function(){
    return this.chat;
};

chatSchema.methods.addMessage = function(message){
    this.chat.push(message);
    return true;
};


//person model
var personSchema = mongoose.Schema({
    name: String,
    password: String,
    feeds: [{
	personID: mongoose.Schema.Types.ObjectId,
	text: String,
	like: Number,
	time: String
    }],
    friends :[{
	friendId : mongoose.Schema.Types.ObjectId,
	name: String,
	chatId : mongoose.Schema.Types.ObjectId
    }]
});

personSchema.methods.getWall = function (){
    return this.feeds;
};

personSchema.methods.postFeed = function(feed,resp){
    feed.personID = this._id;
    this.feeds.splice(0,0,feed);
    this.save(function(err, user){
	console.log("->"+user.feeds[0]);
	resp.json(user.feeds[0]);
    });
};

personSchema.methods.friendList = function(){
    var dic = [];
    this.friends.forEach(friend => {
	dic.push(friend);
    });
    return dic;
};


personSchema.methods.getFeed = function (){
    //implementing feeds
    
};



// all the people on the network
var peopleList = mongoose.Schema({
    name: String,
    id: mongoose.Schema.Types.ObjectId
});

module.exports = function(){
    mongoose.connect("mongodb://localhost/socialNetwork");
    
    var db = mongoose.connection;
    db.on('error',console.error.bind(console, "connection error"));
    db.once('open',function(){
        console.log("connected");
    });
};

module.exports.chat = mongoose.model('chat',chatSchema);
module.exports.person = mongoose.model('Person',personSchema);
module.exports.peopleList = mongoose.model('peopleList',peopleList);









