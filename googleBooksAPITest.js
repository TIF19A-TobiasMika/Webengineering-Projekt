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
  let authorChoice = document.getElementById("authors");
  let authorFilter =
    authorChoice.selectedIndex === -1
      ? "none"
      : authorChoice.options[authorChoice.selectedIndex].value;
  let fetchRequest = "";
  if (authorFilter === "none") {
    fetchRequest = `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchText}&printType=books&maxResults=30&projection=lite&key=AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0`;
  } else {
    fetchRequest = `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchText}+inauthor:${authorFilter}&printType=books&maxResults=30&projection=lite&key=AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0`;
  }
  const fetchResult = await fetch(fetchRequest);
  let json = await fetchResult.json();
  //let fullJson = JSON.stringify(json);
  //console.log(fullJson);
  json.items.forEach(function(val) {
    let title,
      authors,
      description,
      thumbnail = null;
    if (val.volumeInfo != undefined) {
      if (
        val.volumeInfo.imageLinks != undefined &&
        val.volumeInfo.imageLinks.thumbnail != undefined
      ) {
        thumbnail = val.volumeInfo.imageLinks.thumbnail;
        if (val.volumeInfo.authors != undefined) {
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
  createAuthorChoice();
}

function createAuthorChoice() {
  let authorChoice = document.getElementById("authors");
  authorChoice.innerHTML = "";
  let defaultOpt = document.createElement("option");
  defaultOpt.text = "Egal";
  defaultOpt.value = "none";
  authorChoice.appendChild(defaultOpt);
  allAuthors.forEach(function(author) {
    let opt = document.createElement("option");
    opt.text = author;
    opt.value = author;
    authorChoice.appendChild(opt);
  });
}

function removeFavorite(id) {
  let favorites = getFavorites();
  //console.log(typeof favorites);
  favorites = favorites.filter(item => item !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function addFavorite(id) {
  let favorites = getFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
}

function getFavorites() {
  if (localStorage.getItem("favorites") != null) {
    return JSON.parse(localStorage.getItem("favorites"));
  } else {
    return [];
  }
}

function createOutput() {
  let output = document.getElementById("output");
  output.innerHTML = "";
  let favorites = getFavorites();
  for (let key of resultMap.keys()) {
    let book = resultMap.get(key);
    let container = document.createElement("DIV");
    container.setAttribute("class", "container");
    let favoriteButton = document.createElement("BUTTON");
    favoriteButton.setAttribute("class", "wishlistBtn");
    if (favorites.includes(key)) {
      favoriteButton.classList.add("checked");
    }
    favoriteButton.innerHTML = "\u2606";
    favoriteButton.onclick = function() {
      if (favoriteButton.classList.contains("checked")) {
        favoriteButton.classList.remove("checked");
        removeFavorite(this.parentElement.id);
      } else {
        favoriteButton.classList.add("checked");
        addFavorite(this.parentElement.id);
      }
    };
    let image = document.createElement("IMG");
    image.setAttribute("src", book.thumbnail);
    image.setAttribute("alt", book.title);
    image.setAttribute("title", book.title);
    container.setAttribute("id", key);
    image.onclick = function() {
      let b = resultMap.get(this.parentElement.id);
      console.log(b);
      document.getElementById("popupImage").setAttribute("src", b.thumbnail);
      document.getElementById("popupImage").setAttribute("alt", b.title);
      document.getElementById("popupTitel").innerText = b.title;
      document.getElementById("popup").classList.add("fadeIn");
    };
    container.appendChild(image);
    container.appendChild(favoriteButton);
    output.appendChild(container);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("run").onclick = async function() {
    let searchText = document.getElementById("searchText").value;
    searchText = searchText.replace(/ /g, "+");
    searchFor(searchText);
  };

  document.getElementById("popupCloseButton").onclick = function() {
    console.log("Close Popup");
    document.getElementById("popup").classList.remove("fadeIn");
  };
});
