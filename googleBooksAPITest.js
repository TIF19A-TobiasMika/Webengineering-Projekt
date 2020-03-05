let resultMap = new Map();

function Book(title, authors, description) {
  this.title = title;
  this.authors = authors;
  this.description = description;
}

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
    let favoriteButton = document.createElement("BUTTON");
    favoriteButton.setAttribute("class", "wishlistBtn")
    favoriteButton.innerHTML= "\u2606";
    let image = document.createElement("IMG");
    image.setAttribute("src", val.volumeInfo.imageLinks.thumbnail);
    image.setAttribute("alt", val.volumeInfo.title);
    image.setAttribute("title", val.volumeInfo.title);
    image.setAttribute("id", val.id);
    image.onclick = function() {
      let book = resultMap.get(this.id);
      console.log(book);
      document.getElementById("popup").classList.toggle("show");
    };
    container.appendChild(image);
    container.appendChild(favoriteButton);
    output.appendChild(container);
    resultMap.set(val.id, new Book(val.volumeInfo.title, val.volumeInfo.authors, val.volumeInfo.description));
  });
}

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('run').onclick = async function(){
      let searchText = document.getElementById("searchText").value;
      searchText = searchText.replace(/ /g, '+');
      getImages(searchText);
    };
    

    document.getElementById("popupCloseButton").onclick = function() {
      console.log("Close Popup");
      document.getElementById("popup").classList.toggle("show");
    };

});
