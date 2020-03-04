document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('run').onclick = function(){
      const req = new XMLHttpRequest();
      req.open("GET",'https://www.googleapis.com/books/v1/volumes?q=Harray+Potter&key=AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0', true);
      req.send();
      req.onload=function(){
        const json = JSON.parse(req.responseText);
        document.getElementById('json').innerHTML = JSON.stringify(json);
        //let output = json.items[1].volumeInfo.title;
        let html = "";
        json.items.forEach(function(val) {
          html += "<p>" + JSON.stringify(val.volumeInfo.title) + "</p>"
        });
        document.getElementById('output').innerHTML = html;
        console.log(output);
      };
    };
  });