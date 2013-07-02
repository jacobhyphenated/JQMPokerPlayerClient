$.ajaxSetup({"timeout":5000});

var lastStatus = null;
var timer = null;

$("#select_game").on('pageinit', function(event){

	var serverExists = false;
	
	//Pre load poker page
	$.mobile.loadPage( "poker.html", { showLoadMsg: false } );
	
	$("#serverName").val(sessionStorage.serverName);
	
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
				sessionStorage.serverName = serverName;
				sessionStorage.gameId = gameId;
				sessionStorage.playerId = data.playerId;
				$.mobile.changePage("./poker.html", { transition: "slideup"});
			},
			error: function(){
				$("#invalidPopup").popup("open");
			}
		});//End Ajax
	});//End Join Game Button Click Handler
	
});//End Select Game Page Init

$("#select_game").on("pageshow",function(event){
	//If the game is already configured
	if(sessionStorage.serverName && sessionStorage.gameId && sessionStorage.playerId){
		$.mobile.changePage("./poker.html", {transition: "none", hashChange:false});
	}
});//End Select Game Page Show

$("#poker").on('pageinit', function(event){
	$("#action_group").hide();
	$("#card_wrapper").hide();
	$("#sit_in").hide();
	
	$("#leaveGameButton").on('click',function(event){
		sessionStorage.gameId = "";
		sessionStorage.playerId = "";
		window.clearInterval(timer);
		$.mobile.changePage("index.html", {transition: "slideup"});
	});
	
	$("#card1").on('click', function(event){
		if(lastStatus && lastStatus.card1){
			var src = ($("#card1").attr('src') == "img/card_bg.jpg")? "img/"+lastStatus.card1 + ".png" : "img/card_bg.jpg";
			$("#card1").attr("src",src);
		}
	});
	
	$("#card2").on('click', function(event){
		if(lastStatus && lastStatus.card2){
			var src = ($("#card2").attr('src') == "img/card_bg.jpg")? "img/"+lastStatus.card2 + ".png" : "img/card_bg.jpg";
			$("#card2").attr("src",src);
		}
	});
	
	$("#betslider").on('change', function(){
		var amountToCall = 0;
		if(lastStatus.amountToCall > 0){
			amountToCall = lastStatus.amountToCall;
		}
		var betTotal = parseInt(amountToCall) + parseInt($(this).val());
		$(".betButton .ui-btn-text").html("Bet " + betTotal);
	});
	
	$(".checkButton").on("click", function(){
		$.ajax({
			url: sessionStorage.serverName + "/check",
			type: "POST",
			data: {"gameId": sessionStorage.gameId, "playerId": sessionStorage.playerId },
			dataType: "jsonp",
			success: function(data) {
				if(!data.success){
					$("#actionBad").popup("open");
					return;
				}
				$("#status").html("Waiting");
				statusUpdate();
				postAction();
			},
			error: function(){
				$("#actionBad").popup("open");
			}
		});//end AJAX
	});//end check button
	
	$(".betButton").on("click", function(){
		var betAmount = $("#betslider").val();
		$.ajax({
			url: sessionStorage.serverName + "/bet",
			type: "POST",
			data: {"gameId": sessionStorage.gameId, "playerId": sessionStorage.playerId, "betAmount": betAmount },
			dataType: "jsonp",
			success: function(data) {
				if(!data.success){
					$("#actionBad").popup("open");
					return;
				}
				$("#status").html("Waiting");
				statusUpdate();
				postAction();
			},
			error: function(){
				$("#actionBad").popup("open");
			}
		});//end AJAX	
	});//End Bet Button
	
	$(".callButton").on("click", function(){
		$.ajax({
			url: sessionStorage.serverName + "/call",
			type: "POST",
			data: {"gameId": sessionStorage.gameId, "playerId": sessionStorage.playerId },
			dataType: "jsonp",
			success: function(data) {
				if(!data.success){
					$("#actionBad").popup("open");
					return;
				}
				$("#status").html("Waiting");
				statusUpdate();
				postAction();
			},
			error: function(){
				$("#actionBad").popup("open");
			}
		});//end AJAX
	});//end call button
	
	$(".foldButton").on("click", function(){
		$.ajax({
			url: sessionStorage.serverName + "/fold",
			type: "POST",
			data: {"gameId": sessionStorage.gameId, "playerId": sessionStorage.playerId },
			dataType: "jsonp",
			success: function(data) {
				if(!data.success){
					$("#actionBad").popup("open");
					return;
				}
				$("#status").html("Waiting");
				statusUpdate();
				postAction();
			},
			error: function(){
				$("#actionBad").popup("open");
			}
		});//end AJAX
	});//end fold button
	
	$(".sitInButton").on("click", function(){
		$("#sit_in").hide();
		$.ajax({
			url: sessionStorage.serverName + "/sitin",
			type: "POST",
			data: {"playerId": sessionStorage.playerId },
			dataType: "jsonp",
			success: function(data) {
				if(!data.success){
					$("#actionBad").popup("open");
					return;
				}
				$("#status").html("Waiting");
				statusUpdate();
				postAction();
			},
			error: function(){
				$("#actionBad").popup("open");
			}
		});//end AJAX
	});//end sit in button
	
});//End Poker Game Page Init

$("#poker").on('pageshow', function(event){
	statusUpdate();
	timer = window.setInterval(statusUpdate, 2500);
});//End Poker Game Page shown

function statusUpdate(){
	$.ajax({
		url: sessionStorage.serverName + "/status",
		type: "POST",
		data: {"gameId": sessionStorage.gameId, "playerId": sessionStorage.playerId },
		dataType: "jsonp",
		success: function(data) {
			if(!data.status){
				$("#statusBad").popup("open");
				return;
			}
			updateWithStatus(data);
		},
		error: function(){
			$("#statusBad").popup("open");
		}
	});//end AJAX
}

function updateWithStatus(status){
	if(status.card1){
		$("#card_wrapper").show();
	}
	else{
		$("#card_wrapper").hide();
	}
	
	$("#status").html(getDisplayStatus(status.status));
	$("#chips").html("" + status.chips);
	
	if(lastStatus && (lastStatus.card1 != status.card1 || lastStatus.card2 != status.card2)){
		$("#card1").attr("src", "img/card_bg.jpg");
		$("#card2").attr("src", "img/card_bg.jpg");
	}
	
	if(status.status == "SIT_OUT_GAME"){
		$("#sit_in").show();
	}
	else{
		$("#sit_in").hide();
	}
	
	lastStatus = status;
	
	if(!(status.status == "ACTION_TO_CALL" || status.status == "ACTION_TO_CHECK")){
		$("#action_group").hide();
		return;
	}
	$("#action_group").show();
	
	var amountToCall = 0;
	if(status.amountToCall > 0){
		amountToCall = status.amountToCall;
		$(".callButton .ui-btn-text").html("Call " + status.amountToCall);
	}
	
	if(status.status == "ACTION_TO_CALL"){
		$("#check_layout").hide();
		$("#call_layout").show();
	}
	else{
		$("#call_layout").hide();
		$("#check_layout").show();
	}
	$("#betslider").attr("max", status.chips - amountToCall);
	$("#betslider").attr("min", amountToCall);
}

function postAction(){
	$("#betslider").val(0);
	$("#betslider").slider("refresh");
	$(".callButton .ui-btn-text").html("Call");
	$(".betButton .ui-btn-text").html("Bet");
}

function getDisplayStatus(statusCode){
	if(statusCode == "NOT_STARTED"){
		return "Not Started";
	}
	if(statusCode == "SEATING"){
		return "Seating";
	}
	if(statusCode == "WAITING"){
		return "Waiting";
	}
	if(statusCode == "ALL_IN"){
		return "All In";
	}
	if(statusCode == "LOST_HAND"){
		return "Lost Hand";
	}
	if(statusCode == "WON_HAND"){
		return "Won Hand";
	}
	if(statusCode == "POST_SB"){
		return "Small Blind";
	}
	if(statusCode == "POST_BB"){
		return "Big Blind";
	}
	if(statusCode == "ACTION_TO_CALL"){
		return "Call Bet";
	}
	if(statusCode == "ACTION_TO_CHECK"){
		return "Check or Bet";
	}
	if(statusCode == "SIT_OUT"){
		return "Out of Hand";
	}
	if(statusCode == "ELIMINATED"){
		return "Out of Game";
	}
	if(statusCode == "SIT_OUT_GAME"){
		return "Sitting Out";
	}
}

