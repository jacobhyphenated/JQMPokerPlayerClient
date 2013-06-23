var serverExists = false;
var gameObject = {};

$.ajaxSetup({"timeout":5000});

$("#select_game").on('pageinit', function(event){
	
	//Check Server Name for validity
	$("#serverName").on('keyup',function(){
		var serverName = $(this).val();
		$(this).closest('div').removeClass("greenbg");
		$(this).closest('div').addClass("redbg");
		serverExists = false;
		var jqServerField = $(this);
		//JSONP get request to bypass browser same domain issues.
		$.get(serverName + "/ping", function(data){
			if(data.success){
				jqServerField.closest('div').removeClass("redbg");
				jqServerField.closest('div').addClass("greenbg");
				serverExists = true;
			}
		}, "jsonp");
	});
	
	//Click the Join Game Button
	$("#joinGameButton").on("click", function(){
		var gameId = $("#gameId").val();
		var name = $("#name").val();
		if(!serverExists || !gameId || !name){
			$("#denyPopup").popup("open");
		}
		var serverName = $("#serverName").val();
		$.ajax({
			url: serverName + "/join",
			type: "POST",
			data: {"gameId": gameId, "playerName": name },
			dataType: "jsonp",
			success: function(data) {
				if(data.error){
					alert(data.error);
				}
				gameObject.serverName = serverName;
				gameObject.gameId = gameId;
				gameObject.playerId = data.playerId;
				//TODO transition
			},
			error: function(){
				$("#invalidPopup").popup("open");
			}
		});
		
	});
	
});
