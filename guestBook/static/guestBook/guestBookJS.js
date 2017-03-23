var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")
var prevMode = 1
var mouse = {x: 0, y: 0};
var x1, y1 = 0
setupFn()
setColour()
setDrawMode(0)
loadCanvas()
loadDrawChoiceList()

function setupFn(){//sets mouse location so user can draw on canvas
    window.setTimeout(function() {document.getElementById("wrapper").style.visibility = "visible";}, 1000);
     
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    canvas.addEventListener('mousemove', function(e) {
          var pageOffset = getOffset(this)
          mouse.x = e.pageX - pageOffset.left
          mouse.y = e.pageY - pageOffset.top
        }, false);
}

function drawFilledCircle(x, y, r, color) {//takes center and radius, and draws a filled circle
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2*Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
}

var onPaint = function() {//reads background colour, and line width from document and draws line
    ctx.strokeStyle = document.getElementById("RGB").style.backgroundColor
    ctx.lineWidth = document.getElementById('lineWidth').value
    ctx.lineTo(mouse.x, mouse.y)
    ctx.stroke()
}

function getOffset(el) {//gets offset of element from window
  el = el.getBoundingClientRect();
  return {
    left: el.left + window.scrollX,
    top: el.top + window.scrollY
  }
}

$("#myRangeRed").mousemove(function () {//detects change in colour and sets RGB div
        $("#rVal").text($("#myRangeRed").val())
        setColour()
})

$("#myRangeGreen").mousemove(function () {//detects change in colour and sets RGB div
        $("#gVal").text($("#myRangeGreen").val())
        setColour()
})

$("#myRangeBlue").mousemove(function () {//detects change in colour and sets RGB div
        $("#bVal").text($("#myRangeBlue").val())
        setColour()
})

function setColour(){//reads colour settings from RGB sliders and sets RGB div background colour
    document.getElementById("RGB").style.backgroundColor = "rgb(" + $("#rVal").text() + ',' + $("#gVal").text() + ',' + $("#bVal").text() + ')'
}

function setDrawMode(drawMode){//changes settings when drawMode is changed
    prevMode = drawMode
    if (drawMode === 0){//free line
        canvas.addEventListener('mousedown', freeLineEvent, false);
    }
    else if (drawMode === 1){//straight line
		canvas.addEventListener('mousedown', straightLineEvent, false)
    }
    else if(drawMode === 2){//rect
        canvas.addEventListener('mousedown', rectEvent, false)  
    }
    else if (drawMode === 3){// circle
        canvas.addEventListener('mousedown', circEvent, false)
    }
    else if (drawMode === 4){// eraser
        canvas.addEventListener('mousedown', erasEvent, false)
    }
    return
}

function straightLineEvent(){//sets initial coordinates and adds event-listener to draw line
    x1 = mouse.x
    y1 = mouse.y
    canvas.addEventListener('mouseup', straightLineEventMouseUp, false)
}

function straightLineEventMouseUp(){//records destination coordinates and draws line
    ctx.beginPath()
    ctx.strokeStyle = document.getElementById("RGB").style.backgroundColor
    ctx.lineWidth = document.getElementById('lineWidth').value
    ctx.moveTo(x1, y1)
    ctx.lineTo(mouse.x, mouse.y)
    ctx.stroke()
    canvas.removeEventListener('mouseup', straightLineEventMouseUp)
}

function freeLineEvent(){//begins drawing as mouse moves, when mouse is up, drawing is stopped
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    canvas.addEventListener('mousemove', onPaint, false)
    canvas.addEventListener('mouseup', function() {canvas.removeEventListener('mousemove', onPaint)})
}

function rectEvent(){//takes initial coordinates and adds event to draw rectangle
    x1 = mouse.x
    y1 = mouse.y
    canvas.addEventListener('mouseup', rectEventMouseUp, false);
}

function rectEventMouseUp(){//gets final coordinates and draws rectangle
    ctx.fillStyle = document.getElementById("RGB").style.backgroundColor
    ctx.fillRect(x1, y1, mouse.x - x1, mouse.y - y1)
    canvas.removeEventListener('mouseup', rectEventMouseUp)
}

function circEvent(){//gets initial coordinates and adds event to draw a circle
    x1 = mouse.x
    y1 = mouse.y
    canvas.addEventListener('mouseup', circEventMouseUp, false)
}

function circEventMouseUp(){//gets final coordinates and calls fn to draw a circle
    drawFilledCircle(x1, y1, Math.sqrt(Math.pow((x1 - mouse.x), 2) + Math.pow((y1 - mouse.y), 2)), document.getElementById("RGB").style.backgroundColor)
    canvas.removeEventListener('mouseup', circEventMouseUp)
}

function erasEvent(){//gets initial coordinates and adds event to clear a rectangle
    x1 = mouse.x
    y1 = mouse.y
    canvas.addEventListener('mouseup', erase, false);
}

function erase(){//gets final coordinates and clears a rectangle on the user canvas
    ctx.clearRect(x1, y1, mouse.x - x1, mouse.y - y1)
    canvas.removeEventListener('mouseup', erase)
}

function removeEvents(prevMode){//removes event listeners set by previous drawing mode
    if (prevMode === 0){
        canvas.removeEventListener('mousedown', freeLineEvent);
    }
    if (prevMode === 1){
		canvas.removeEventListener('mousedown', straightLineEvent)
    }
    else if (prevMode === 2){
        canvas.removeEventListener('mousedown', rectEvent)
    }
    else if (prevMode === 3){
        canvas.removeEventListener('mousedown', circEvent)
    }
    else if (prevMode === 4){
        canvas.removeEventListener('mousedown', erasEvent)
    }
}

function saveCanvasOriginal(){//checks if userName has been set, then sends post request saving source canvas and user drawing to server
    var userName = document.getElementById("exampleInputName").value
    if (userName == ""){alert("Please enter a user name to save your drawing.")}
    else{
        loadCanvas()
        var originalCanvas = document.getElementById('myOriginalCanvas')
        originalCanvas.getContext("2d").drawImage(canvas,0,0)//draw user drawing on original canvas
        var newOriginal = originalCanvas.toDataURL("image/png")
        var img = canvas.toDataURL("image/png")
        var csrftoken = getCookie('csrftoken');

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });

        $.ajax({
            type: "POST",
            url: "/guestBook/saveCanvas/",
            data:{ 
                "newOriginal": newOriginal,
                'userDrawing': img,
                "userName": userName,
            }//send combined and user drawing to be saved locally
        }).done(function(){console.log('saved')})
        //location.reload()
        ctx.clearRect(0,0,1600,900)
        loadCanvas()
        var myNode = document.createElement("option")
        myNode.value = userName
        myNode.appendChild(document.createTextNode(userName  + " - " + document.getElementById("drawingChoice").getElementsByTagName("option").length))
        document.getElementById("drawingChoice").appendChild(myNode)
        
    }
}

function saveCanvas(){//checks if userName has been set, then sends post request saving source canvas and user drawing to server
    var userName = document.getElementById("exampleInputName").value
    if (userName == ""){alert("Please enter a user name to save your drawing.")}
    else{
        loadCanvas()
        var csrftoken = getCookie('csrftoken');

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });

        var userImg = canvas.toDataURL("image/png")

        $.ajax({
            type: "POST",
            url: "/guestBook/saveCanvas/",
            data:{ 
                "userName": userName,
                'userDrawing': userImg,
            }//send user drawing to be saved locally
        }).done(function(){
            console.log('saved')
            loadDrawChoiceList()//load new contributing images
            ctx.clearRect(0,0,1600,900)
            createOriginal()
        })
    }
}

function loadCanvas(){//loads original canvas from server and draws on lower canvas
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
		beforeSend: function(xhr, settings) {
			if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});

    $.ajax({
        type: "POST",
        url: "/guestBook/loadCanvas/"
    }).done(function(originalCanvas){
        var myCtx = document.getElementById("myOriginalCanvas").getContext('2d')
        var img = new Image()
        img.onload = function(){myCtx.drawImage(img,0,0)}
        img.src = originalCanvas["originalCanvas"]
        })
}

function createOriginal(){//post request gets list of user drawings and draws each to lower canvas
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
		beforeSend: function(xhr, settings) {
			if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});

    $.ajax({
        type: "POST",
        url: "/guestBook/createCanvas/"
    }).done(function(newCanvas){
        myCtx = document.getElementById("myOriginalCanvas").getContext('2d')
        myCtx.fillStyle = "#FFFFFF"
        myCtx.fillRect(0,0,1600,900)
        var img = new Image()
        img.onload = function(){myCtx.drawImage(img,0,0)}
        for(let i = 0; i < newCanvas["userDrawings"].length; i++){
            img.src = newCanvas["userDrawings"][i]
            myCtx.drawImage(img,0,0)//is this necessary?
        }
        var newOriginal = document.getElementById("myOriginalCanvas").toDataURL("image/png")
        $.ajax({
            type: "POST",
            url: "/guestBook/setOriginal/",
            data: {
                "newOriginal": newOriginal
            }
        }).done(function(){
            console.log("we are here")
        })
    })
}

function resetCanvas(){//sets lower canvas to white rectangle, used for testing
    var myCtx = document.getElementById("myOriginalCanvas").getContext("2d")
    myCtx.fillStyle = "#ffffff"
    myCtx.fillRect(0,0,canvas.width, canvas.height)
}

function loadDrawing(){
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
		beforeSend: function(xhr, settings) {
			if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});

    $.ajax({
        type: "POST",
        url: "/guestBook/loadDrawing/",
        data: {
            "drawingChoice": document.getElementById("drawingChoice").value,
            }
        }).done(function(newBackground){
			myCtx = document.getElementById("myOriginalCanvas").getContext('2d')
            myCtx.fillStyle = "#ffffff"
            myCtx.fillRect(0,0,canvas.width, canvas.height)
            var img = new Image()
            img.onload = function(){myCtx.drawImage(img,0,0)}
            img.src = newBackground
        })
}

function loadDrawChoiceList(){
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
		beforeSend: function(xhr, settings) {
			if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});

    $.ajax({
        type: "POST",
        url: "/guestBook/loadList/",
    }).done(function(userNames){
        var myNode = document.getElementById("drawingChoice")
        while (myNode.firstChild){myNode.removeChild(myNode.firstChild)}
        var nameList = userNames["userNames"]
        var childNode = document.createElement("option")
        childNode.value = "All"
        childNode.appendChild(document.createTextNode("All"))
        myNode.appendChild(childNode)
        for(let i = 0; i < nameList.length; i++){
            childNode = document.createElement("option")
            childNode.value = nameList[i]
            childNode.appendChild(document.createTextNode(nameList[i] + " - " + (i+1)))
            myNode.appendChild(childNode)
            }
        })
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
