document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('run').onclick = function(){
      const req = new XMLHttpRequest();
      let searchText = document.getElementById("searchText").value;
      searchText = searchText.replace(/ /g, '+');
      //console.log(searchText);
      console.log('http://openlibrary.org/search.json?q=' + searchText);
      req.open("GET",'http://openlibrary.org/search.json?q=' + searchText, true);
      req.send();
      req.onload=function(){
        let json = JSON.parse(req.responseText);
        let fullJson = JSON.stringify(json);
        console.log(fullJson);
        let output = document.getElementById('output');
        output.innerHTML = "";
        json.docs.forEach(function(val) {
          let image = document.createElement("IMG");
          image.setAttribute("src", "http://covers.openlibrary.org/b/ID/" + val.cover_i + "-M.jpg");
          image.setAttribute("alt", val.title_suggest);
          output.appendChild(image);
        });
        console.log(output);
      };
    };
  });