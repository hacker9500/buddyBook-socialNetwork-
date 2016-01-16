// test model

var models = require("./model.js");

models();

//var chatModel = new models.chat();

console.log(new models.chat());
console.log(new models.person());
console.log(new models.peopleList());
