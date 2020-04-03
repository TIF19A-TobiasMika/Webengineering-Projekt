let resultMap = new Map();
let allAuthors = new Set();
let apiKey = "AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0";

function Book(title, authors, description, thumbnail) {
  this.title = title;
  this.authors = authors;
  this.description = description;
  this.thumbnail = thumbnail;
}

async function searchFor(searchText) {
  resultMap.clear();
  allAuthors.clear();
  let outputLabel = document.getElementById("outputLabel");
  let authorChoice = document.getElementById("authors");
  let authorFilter =
    authorChoice.selectedIndex === -1
      ? "none"
      : authorChoice.options[authorChoice.selectedIndex].value;
  let fetchRequest = "";
  if (authorFilter === "none") {
    fetchRequest = `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchText}&printType=books&maxResults=30&projection=lite&key=${apiKey}`;
  } else {
    fetchRequest = `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchText}+inauthor:${authorFilter}&printType=books&maxResults=30&projection=lite&key=${apiKey}`;
  }
  const fetchResult = await fetch(fetchRequest);
  let json = await fetchResult.json();
  console.log(json);
  if (json.totalItems > 0) {
    outputLabel.classList.remove("visible");
    json.items.forEach(parseVolume);
    createOutput();
    createAuthorChoice();
  } else {
    outputLabel.innerText = `Kein Treffer für "${searchText}" gefunden`;
    outputLabel.classList.add("visible");
    document.getElementById("authorFilter").classList.remove("visible");
    document.getElementById("output").innerHTML = "";
  }
}

function parseVolume(val) {
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
  document.getElementById("authorFilter").classList.add("visible");
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
  //console.log("creating Output");
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
      favoriteButton.setAttribute("title", "Aus Favoriten entfernen");
      favoriteButton.classList.add("checked");
    } else {
      favoriteButton.setAttribute("title", "Zu Favoriten himzufügen");
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
      let authorPopUpList = document.getElementById("popupAuthors");
      authorPopUpList.innerHTML = "";
      authorPopUpList.appendChild(GenerateAuthorList(b));
      let descriptionPopUpList = document.getElementById("popupDescription");
      descriptionPopUpList.innerHTML = "";
      descriptionPopUpList.appendChild(GenerateDescription(b));
      document.getElementById("popup").classList.add("fadeIn");
    };
    container.appendChild(image);
    container.appendChild(favoriteButton);
    output.appendChild(container);
  }
}

function GenerateAuthorList(book) {
  let authorList = document.createElement("p");
  if (book.authors !== undefined) {
    for (let i = 0; i < book.authors.length; i++) {
      let listItem = document.createElement("p");
      listItem.textContent = book.authors[i];
      authorList.appendChild(listItem);
    }
  }
  return authorList;
}

function GenerateDescription(book) {
  let description = document.createElement("p");
  description.setAttribute("class", "popUpDescriptionText");

  if (book.description !== undefined) {
    description.textContent = book.description;
  }
  return description;
}

async function loadFavorites() {
  console.log("Lade Favoriten...");
  document.getElementById("authorFilter").classList.remove("visible");
  let favorites = getFavorites();
  let outputLabel = document.getElementById("outputLabel");
  outputLabel.classList.add("visible");
  if (favorites.length <= 0) {
    outputLabel.innerText = "Keine Favoriten gespeichert";
  } else {
    outputLabel.innerText = "Favoriten";
    resultMap.clear();
    allAuthors.clear();
    await Promise.all(
      favorites.map(async function(fav) {
        const fetchResult = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${fav}?key=${apiKey}`
        );
        let json = await fetchResult.json();
        parseVolume(json);
      })
    );
    //createAuthorChoice();
    createOutput();
  }
}

async function runSearch() {
  let searchText = document.getElementById("searchText").value;
  searchText = searchText.replace(/ /g, "+");
  await searchFor(searchText);
  console.log("searched for " + searchText);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("run").onclick = runSearch;

  document.getElementById("searchText").onsearch = runSearch;

  document.getElementById("popupCloseButton").onclick = function() {
    console.log("Close Popup");
    document.getElementById("popup").classList.remove("fadeIn");
  };

  document.getElementById("showWishListBtn").onclick = loadFavorites;

  document.getElementById("authors").onchange = async function() {
    let authorChoice = document.getElementById("authors");
    let slectedAuthor = authorChoice.value;
    await runSearch();
    document.querySelector(
      '#authors [value="' + slectedAuthor + '"]'
    ).selected = true;
  };

  document.getElementById("popupCloseButton").onclick = function() {
    console.log("Close Popup");
    document.getElementById("popup").classList.remove("fadeIn");
  };

  loadFavorites();
});
