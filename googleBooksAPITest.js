let resultMap = new Map();
let allAuthors = new Set();

function Book(title, authors, description, thumbnail) {
  this.title = title;
  this.authors = authors;
  this.description = description;
  this.thumbnail = thumbnail;
}

async function searchFor(searchText) {
  resultMap = new Map();
  allAuthors = new Set();
  const fetchRequest = `https://www.googleapis.com/books/v1/volumes?q=${searchText}&printType=books&maxResults=30&projection=lite&key=AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0`;
  //console.log(fetchRequest);
  const fetchResult = await fetch(fetchRequest);
  let json = await fetchResult.json();
  //let fullJson = JSON.stringify(json);
  //console.log(fullJson);
  json.items.forEach(function(val) {
    let title, authors, description, thumbnail = null;;
    if(val.volumeInfo != undefined) {
      if(val.volumeInfo.imageLinks != undefined && val.volumeInfo.imageLinks.thumbnail != undefined) {
        thumbnail = val.volumeInfo.imageLinks.thumbnail;
        if(val.volumeInfo.authors != undefined) {
          authors = val.volumeInfo.authors;
          authors.forEach(a => allAuthors.add(a));
        }
        title = val.volumeInfo.title;
        description = val.volumeInfo.description;
        resultMap.set(val.id, new Book(title, authors, description, thumbnail));
      }
    }
  });
  createOutput();
}

function createOutput() {
  let output = document.getElementById("output");
  output.innerHTML = "";
  for (let key of resultMap.keys()) {
    let book = resultMap.get(key);
    let container = document.createElement("DIV");
    container.setAttribute("class", "container");
    let favoriteButton = document.createElement("BUTTON");
    favoriteButton.setAttribute("class", "wishlistBtn")
    favoriteButton.innerHTML= "\u2606";
    let image = document.createElement("IMG");
    image.setAttribute("src", book.thumbnail);
    image.setAttribute("alt", book.title);
    image.setAttribute("title", book.title);
    container.setAttribute("id", key);
    image.onclick = function() {
      console.log(this.parentElement.id);
      let book2 = resultMap.get(this.parentElement.id);
      console.log(book2);
      document.getElementById("popupImage").setAttribute("src", book2.thumbnail);
      document.getElementById("popupImage").setAttribute("alt", book2.title);
      document.getElementById("popupTitel").innerText = book2.title;
      document.getElementById("popup").classList.add("fadeIn");
    };
    container.appendChild(image);
    container.appendChild(favoriteButton);
    output.appendChild(container);
  }
  let authorChoice = document.getElementById("authors");
  authorChoice.innerHTML = "";
  allAuthors.forEach(function(author)
  {
    let opt = document.createElement("option");
    opt.text= author;
    opt.value = author;
    authorChoice.appendChild(opt);
  });
}

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('run').onclick = async function(){
      let searchText = document.getElementById("searchText").value;
      searchText = searchText.replace(/ /g, '+');
      searchFor(searchText);
    };
    

    document.getElementById("popupCloseButton").onclick = function() {
      console.log("Close Popup");
      document.getElementById("popup").classList.remove("fadeIn");
    };

});
