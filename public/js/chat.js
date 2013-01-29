var ChatManager = function () {
    var that = this;
    this.msgTpl = _.template($('#msg-tpl').text());

    $('#start-btn').click(function (e) {
        e.preventDefault();
        that.startChat();
        return false;
    });

    $('#send-msg').click(function (e) {
        e.preventDefault();
        that.sendMsg();
        return false;
    });
    
    $("#msg").keyup(function (e) {
        if (e.keyCode == 13)
            that.sendMsg();
    });
};


ChatManager.prototype = {
    sendMsg: function () {
        var msg = $("#msg").val();
        $("#msg").val('');

        this.socket.emit('msg', {'msg': msg});
    },
    startChat: function () {
        var that = this;
        this.from = $('#from').val();
        this.to = $('#to').val();

        if ((!this.from)||(!this.to)) {
            alert("Preencha todos os campos");
            return;
        }

        this.socket = io.connect(window.location.toString());
        this.socket.emit('login', {
            from: this.from,
            to: this.to
        });

        this.socket.on('msg', function (data) {
            that.drawMsg(data);
        });

        $('#start').addClass('hide');
        $('#chat').removeClass('hide');
        //TODO: arquivar em cache do navegador o from e o to

        $("#persons").text("Chat entre "+this.from+" e "+this.to);

        this.getMessages();
        
    },
    drawMsg: function (data) {
        var html = this.msgTpl(data);
        $('#messages').append(html);

        $("#messages").animate({
            scrollTop: $("#messages")[0].scrollHeight
        }, 2000);
    },
    getMessages: function () {
        var that = this;
        $.getJSON('.', {
            cmd: 'getMessages',
            from: this.from,
            to: this.to}, function (messages) {
                that.drawMessages(messages);
            });
    },
    drawMessages: function (messages) {
        for (var i=messages.length-1; i>=0; i--) {
            var html = this.msgTpl(messages[i]);
            $('#messages').append(html);
        }
        
        $("#messages").animate({
            scrollTop: $("#messages")[0].scrollHeight
        }, 2000);
        
    }
};

$(function () {
    window.chat = new ChatManager();
});
