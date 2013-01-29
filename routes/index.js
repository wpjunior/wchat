var message = require('../models/message');

exports.getMessages = function(req, res){
    var from = req.query.from,
    to = req.query.to;

    message.Message.find({
        $or: [{to: to, from: from},
              {from: to, to: from}]}, null, {
                  skip:0, // Starting Row
                  limit:10, // Ending Row
                  sort:{
                      date: -1
                  }
              }, function (err, docs) {
                  var out = [];
                  
                  docs.forEach(function (doc) {
                      var date = doc.date,
                      dateStr = (
                          date.getHours()+':'+
                              date.getMinutes()+':'+
                              date.getSeconds());

                      out.push({
                          from: doc.from,
                          msg: doc.msg,
                          date: dateStr
                      });
                  });

                  res.send(JSON.stringify(out));
              });
};
