document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('run').onclick = async function(){
      let searchText = document.getElementById("searchText").value;
      searchText = searchText.replace(/ /g, '+');
      getImages(searchText);
    };
  });

  async function getImages(searchText) {
      const fetchRequest = `https://www.googleapis.com/books/v1/volumes?q=${searchText}&printType=books&maxResults=30&projection=lite&key=AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0`;
      console.log(fetchRequest);
      const fetchResult = await fetch(fetchRequest);
      let json = await fetchResult.json();
      let fullJson = JSON.stringify(json);
      //console.log(fullJson);
      let output = document.getElementById('output');
      output.innerHTML = "";
      json.items.forEach(function(val) {
        let container = document.createElement("DIV");
        container.setAttribute("class", "container");
        let imageButton = document.createElement("BUTTON");
        let favoriteButton = document.createElement("BUTTON");
        favoriteButton.setAttribute("class", "wishlistBtn")
        let image = document.createElement("IMG");
        image.setAttribute("src", val.volumeInfo.imageLinks.thumbnail);
        image.setAttribute("alt", val.volumeInfo.title);
        container.appendChild(image);
        container.appendChild(favoriteButton);
        output.appendChild(container);
      });
      //console.log(output);
  }