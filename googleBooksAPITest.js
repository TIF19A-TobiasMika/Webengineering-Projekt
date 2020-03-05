document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('run').onclick = function(){
      const req = new XMLHttpRequest();
      let searchText = document.getElementById("searchText").value;
      searchText = searchText.replace(/ /g, '+');
      //console.log(searchText);
      console.log('https://www.googleapis.com/books/v1/volumes?q=' + searchText + '&key=AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0');
      req.open("GET",'https://www.googleapis.com/books/v1/volumes?q=' + searchText + '&key=AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0', true);
      req.send();
      req.onload=function(){
        let json = JSON.parse(req.responseText);
        let fullJson = JSON.stringify(json);
        let output = document.getElementById('output');
        output.innerHTML = "";
        json.items.forEach(function(val) {
          let image = document.createElement("IMG");
          image.setAttribute("src", val.volumeInfo.imageLinks.thumbnail);
          image.setAttribute("alt", val.volumeInfo.title);
          output.appendChild(image);
        });
        console.log(output);
      };
    };
  });