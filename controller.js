var message = require('./models/message');

var Controller = function (io, socket) {
    var that = this;

    this.io = io;
    this.socket = socket;
    this.from = null;
    this.to = null;

    this.socket.on('login', function (data) {
        that.from = data.from;
        that.to = data.to;
        that.socket.join(that.from);

        if (that.io.sockets.clients(that.to).length)
            that.socket.emit('status', {status: true});
        else
            that.socket.emit('status', {status: false});

        that.io.sockets.in(that.to).emit('status', {status: true});
    });

    this.socket.on('msg', function (data) {
        that.processMsg(data.msg);
    });

    this.socket.on('disconnect', function () {
        that.io.sockets.in(that.to).emit('status', {status: false});
    });

    
};

Controller.prototype = {
    constructor: Controller,
    processMsg: function (msg) {
        var date = new Date(),
        dateStr = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
        var msg = {
            from: this.from,
            msg: msg,
            date: dateStr
        };

        //Guarda as mensagens
        var instance = new message.Message();
        instance.from = this.from;
        instance.to = this.to;
        instance.msg = msg.msg;
        instance.date = date;
        instance.save(function (err) {
        });

        this.io.sockets.in(this.from).emit('msg', msg);
        this.io.sockets.in(this.to).emit('msg', msg);
    }
}

exports.Controller = Controller;
