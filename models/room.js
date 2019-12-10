var mongoose = require("mongoose");

var roomSchema = new mongoose.Schema({
	name:String,
	city:String,
	image:String,
	contact:String,
	desc:String,
	comments:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Comment"
		}
	]
});

module.exports = mongoose.model("Room", roomSchema);