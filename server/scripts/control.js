$(document).ready(function() {
  var table = '';
  var visible = true;

  for (var i = 0; i < 9; i++) {
    table += '<tr>';
    for (var j= i*10+1; j < (i*10)+11; j++) {
      table += '<td class="td-'+j+'" class="text-center"><span>' + j + '</span></td>';
    }
    table += '</tr>';
  }
  $('#ticket > tbody').html(table);


  var socket = io('http://localhost:8080');
  var socket = io('http://samhousieplay.herokuapp.com');
  socket.on('heartbeat', function(data){
    if ('previous' in data) {
      $('td[class="^td"] span').removeClass('checked');
      var ticketNums = data.previous;
      if (ticketNums.length > 0) {
        for (var n in ticketNums) {
          $('td.td-'+ticketNums[n]+ '> span').addClass('checked');
        }
        $('#current').html(ticketNums[ticketNums.length-1]);
      }
      if (ticketNums.length >= 4) {
        $('#prev3').html(ticketNums[ticketNums.length-4]);
      }
      if (ticketNums.length >= 3) {
        $('#prev2').html(ticketNums[ticketNums.length-3]);
      }
      if (ticketNums.length >= 2) {
        $('#prev1').html(ticketNums[ticketNums.length-2]);
      }
    }
    if ('num' in data) {
      var num = data.num;
      $('#prev3').html($('#prev2').text());
      $('#prev2').html($('#prev1').text());
      $('#prev1').html($('#current').text());
      $('td.td-' + num + '> span').addClass('checked');
      $('#current').html(num);
    }

    if ('message' in data) {
      if (!visible) {
        $('.modal, .modal-backdrop').show();
        visible = true;
      }
      $('#message').html('<center><h1>'+ data.message +'</h1></center>');
    } else if ('timer' in data) {
      if (!visible) {
        $('.modal, .modal-backdrop').show();
        visible = true;
      }
      $('#message').html(function(){
        var obj = new Date(parseInt(data.timer) * 1000);
        var timer = obj.getUTCHours() +' : '+ obj.getUTCMinutes()+' : '+obj.getUTCSeconds();
        return '<center><h1> Time left to start the game: '+ timer +'</h1></center>';
      });
    }
	else if('chat' in data){
		var _chatHistry = $('#chat-list').html();
		$('#chat-list').html(function (){
			console.log(data.chat);
			return _chatHistry +='																						\
							<li class="right clearfix"><span class="chat-img pull-right"> 									\
                            <img src="http://satyr.io/80x60?text='+data.chat.split(":")[0][0]+'" alt="User Avatar" class="img-circle" /> 				\
                        </span> 																							\
                            <div class="chat-body clearfix"> 																\
                                <div class="header"> 																		\
                                    <strong class="primary-font">'+data.chat.split(":")[0]+'</strong> 	 					\
                                </div> 																						\
                                <p> '+ data.chat.split(":")[1] +'  </p>														\
                            </div>																							\
                        </li> ';
		});
		
	}
	else {
      if (visible) {
        $('.modal, .modal-backdrop').hide();
        visible = false;
      }
    }
  });

  $("#btn-chat").click(function(e) {
  e.preventDefault();
  $.ajax({
      type: "POST",
      url: "/chat?chat=" + $("#chat-Name").val()+":"+$("#btn-input").val(),           
  });
  $("#btn-input").val("");
  });

  socket.on('disconnect', function(){
    alert('You are offline');
  });  
});
