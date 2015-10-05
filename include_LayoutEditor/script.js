
var DRAGGED_ELEMENT;
function dragover(event, element) {
    var rect = element.getBoundingClientRect();
    removePlaceholder();
    var allowed = element.parentNode.getAttribute('data-allowed-elements').split(' ');
    if (allowed.indexOf(DRAGGED_ELEMENT.getAttribute('data-element-type')) > -1 | allowed.indexOf('all') > -1) {
        var placeholder = createPlaceholder();
        var before = (event.clientY - rect.top <= (rect.bottom - rect.top) / 2) ? element : element.nextSibling;
        element.parentNode.insertBefore(placeholder, before);
    }
}

function removePlaceholder() {
    var element = document.getElementById('placeholder');
    if (typeof (element) != 'undefined' && element != null) {
        element.parentNode.removeChild(element);
    }
}

function drag(event, element) {
    var action = element.getAttribute('data-copy') == 'true' ? 'copy' : 'move';
    event.dataTransfer.effectAllowed = "move";
    if (element.id == "") {
        var d = new Date();
        element.id = "dragtemp-" + d.getTime();
    }
    DRAGGED_ELEMENT = element;
    event.dataTransfer.setData('action', action);
}

function drop(event) {
    var action = event.dataTransfer.getData('action');
    var element;
    if (action == 'copy') {
        element = DRAGGED_ELEMENT.cloneNode(true);
        element.removeAttribute('data-copy');
        RegisterDragEvents(element);
    } else {
        element = DRAGGED_ELEMENT;
    }
    this.parentNode.insertBefore(element, this);
    if (DRAGGED_ELEMENT.id.match(/^dragtemp-\d+$/)) {
        element.id = "";
    }
    this.parentNode.removeChild(this);
}

function createPlaceholder() {
    var placeholder = document.createElement('div');
    placeholder.setAttribute('id', 'placeholder');
    placeholder.addEventListener("dragenter", function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        placeholder.style.borderColor = 'blue';
    });
    placeholder.addEventListener("dragover", function (event) {
        event.dataTransfer.dropEffect = "move";
        event.preventDefault();
    });
    placeholder.addEventListener("dragleave", function () {
        placeholder.style.borderColor = 'red';
    });
    placeholder.addEventListener("drop", drop);


    return placeholder;
}

function RegisterDragEvents(element) {
    element.addEventListener('dragstart', function (event) {
        drag(event, this);
    });
    element.addEventListener('dragover', function (event) {
        dragover(event, this);
    });
    element.addEventListener('dragend', removePlaceholder);
}


document.addEventListener("DOMContentLoaded", function (event) {
    var elements = document.getElementsByTagName('*');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].hasAttribute('data-element-type')) {
            elements[i].draggable = true;
            RegisterDragEvents(elements[i]);
            if (elements[i].getAttribute('data-element-type') != 'section') {
                elements[i].setAttribute('data-copy', true);
                elements[i].innerHTML += '<div class="settings"><img src="http://lab.varubi.com/layouteditor/include/image/settings.png"  onclick="displaySettings(this.parentNode)"/><textarea></textarea></div>'
            }
        }
    };
    var placeholder = document.getElementById('initial-holder');
    placeholder.addEventListener("dragenter", function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        placeholder.style.borderColor = 'blue';
    });
    placeholder.addEventListener("dragover", function (event) {
        event.dataTransfer.dropEffect = "move";
        event.preventDefault();
    });
    placeholder.addEventListener("dragleave", function () {
        placeholder.style.borderColor = 'red';
    });
    placeholder.addEventListener("drop", drop);


});

function displaySettings(element) {
    element.getElementsByTagName('textarea')[0].style.display = element.getElementsByTagName('textarea')[0].style.display == 'block' ? 'none' : 'block';
}

function updatePage() {
    var JSONArray = new Array();
    var elements = document.getElementById('layout-elements').getElementsByTagName('div');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].hasAttribute('data-element-type')) {
            var type = elements[i].getAttribute('data-element-type');
            var name = elements[i].getAttribute('data-element-name');
            var value = '';
            if (elements[i].getAttribute('data-element-type').toLowerCase() == 'html') {
                value = elements[i].getElementsByTagName('textarea')[0].value;
            }
            JSONArray.push(jsonItem(type, name, value));
        }
    }
    var JSONSTRING = encodeURIComponent(JSON.stringify(JSONArray));
    console.log(JSONArray);
    var params = "json=" + JSONSTRING;
    var XMLHTTP = new XMLHttpRequest();
    XMLHTTP.open('POST', './include_LayoutEditor/update.cshtml', true);
    XMLHTTP.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    XMLHTTP.send(params);
    console.log(params)
    XMLHTTP.onload = function () {
        try {
            var d = new Date();
            document.getElementById('UpdateButton').innerHTML = 'Updated: ' + d.toLocaleTimeString();
        }
        catch (e) {
        };
    }
}

function jsonItem(type, name, value) {
    var a = new Object();
    a.Type = type;
    a.Name = name;
    a.Value = value;
    return a;
}


