var ChatManager = function () {
    var that = this;
    this.fromMsgTpl = _.template($('#from-msg-tpl').text());
    this.toMsgTpl = _.template($('#to-msg-tpl').text());

    if (window.localStorage) {
        $('#from').val(window.localStorage.getItem('from'));
        $('#to').val(window.localStorage.getItem('to'));
    }

    createjs.FlashPlugin.BASE_PATH = "/soundjs/" // Initialize the base path from this document to the Flash Plugin
    if (!createjs.SoundJS.checkPlugin(true)) {
        alert('sound error')
	return;
    }

    var manifest = [
	{src: "/sound/chat.mp3", id:1, data: 1},
	{src: "/sound/login.mp3", id:2, data: 1},
	{src: "/sound/logout.mp3", id:3, data: 1},
	{src: "/sound/error.mp3", id:4, data: 1}
    ];

    preload = new createjs.PreloadJS();
    preload.installPlugin(createjs.SoundJS);
    preload.loadManifest(manifest, true);

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

        var password = $("#password").val();

        if (!password) {
            alert("A senha é obrigatório")
            return;
        }
            

        if ((!this.from)||(!this.to)) {
            alert("Preencha todos os campos");
            return;
        }

        this.socket = io.connect(window.location.toString()+'?password='+password);
        this.socket.emit('login', {
            from: this.from,
            to: this.to
        });

        this.socket.on('error', function (){
            createjs.SoundJS.play(4, createjs.SoundJS.INTERRUPT_NONE, 0, 0, false, 1);
            alert("Erro na comunicação, a senha pode estar incorreta");
            window.location = '/';
        });

        this.socket.on('disconnect', function (){
            createjs.SoundJS.play(4, createjs.SoundJS.INTERRUPT_NONE, 0, 0, false, 1);
            alert("Erro na comunicação, recarregue a página");
        });

        this.socket.on('msg', function (data) {
            that.drawMsg(data);
        });

        this.socket.on('status', function (data) {
            that.setStatus(data.status);
        });

        $('#start').addClass('hide');
        $('#chat').removeClass('hide');

        //arquiva em cache do navegador o from e o to
        if (window.localStorage) {
            window.localStorage.setItem('from', this.from);
            window.localStorage.setItem('to', this.to);
        }
        
        $("#persons").text("Chat entre "+this.from+" e "+this.to);

        this.getMessages();
        
    },
    drawMsg: function (data) {
        if (data.from == this.from)
            var html = this.fromMsgTpl(data);
        else
            var html = this.toMsgTpl(data);

        $('#messages').append(html);

        $("#messages").animate({
            scrollTop: $("#messages")[0].scrollHeight
        }, 2000);

        createjs.SoundJS.play(1, createjs.SoundJS.INTERRUPT_NONE, 0, 0, false, 1);
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
            if (messages[i].from == this.from)
                var html = this.fromMsgTpl(messages[i]);
            else
                var html = this.toMsgTpl(messages[i]);

            $('#messages').append(html);
        }
        
        $("#messages").animate({
            scrollTop: $("#messages")[0].scrollHeight
        }, 2000);
        
    },
    setStatus: function(status) {
        if (status) {
            $('#status').text(this.to+' está online');
            createjs.SoundJS.play(2, createjs.SoundJS.INTERRUPT_NONE, 0, 0, false, 1);
        } else {
            $('#status').text(this.to+' está offline');
            createjs.SoundJS.play(3, createjs.SoundJS.INTERRUPT_NONE, 0, 0, false, 1);
        }
    }
};

$(function () {
    window.chat = new ChatManager();
});
