function async_update(event, params) {
    var data = "ASYNC_EVENT=" + event + (typeof params != 'undefined' & params != '' ? params : '');
    var XMLHTTP = new XMLHttpRequest();
    XMLHTTP.open('POST', '', true);
    XMLHTTP.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    XMLHTTP.send(data);
    console.log(data)
    XMLHTTP.onload = function () {
        try {
            var response = JSON.parse(XMLHTTP.responseText);

            for (var key in response) {
                if (response.hasOwnProperty(key)) {
                    element_update(key, response[key]);
                }
            }
        }
        catch (e) {
        };
    }
}

function contact_submit(form) {
    var elements = form.getElementsByTagName('input');
    var param = '';
    for (var i = 0; i < elements.length; i++) {
        param += "&" + elements[i].name + "=" + elements[i].value;

    }
    console.log(param);
    async_update('CONTACT_SUBMIT', param);
}

function element_update(id, content) {
    document.getElementById(id).innerHTML = content;
}