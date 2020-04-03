//Map um die Suchergebisse temporär zu speichern
let resultMap = new Map();
//Set um die Authoren zu filtern (Dopplungen werden vermieden)
let allAuthors = new Set();
//Google API Key
let apiKey = "AIzaSyCg0v6ii17dHIn0ZfQMIfMD0qshWRuFio0";

//Objekt für die relevanten infos eines Buches
function Book(title, authors, description, thumbnail) {
  this.title = title;
  this.authors = authors;
  this.description = description;
  this.thumbnail = thumbnail;
}

//API Suchanfrage
async function searchFor(searchText) {
  //Löscht Daten vorheriger Suchanfragen
  resultMap.clear();
  allAuthors.clear();
  let outputLabel = document.getElementById("outputLabel");
  let authorChoice = document.getElementById("authors");
  //Prüft ob nach einem bestimmten Author gesucht werden soll
  let authorFilter =
    authorChoice.selectedIndex === -1
      ? "none"
      : authorChoice.options[authorChoice.selectedIndex].value;
  //Type Filter
  let type = document.getElementById("type").value;
  let orderBy = document.getElementById("sort").checked ? "newest" : "relevance";
  let fetchRequest = "";
  if(document.getElementById("inTitle").checked) {
    searchText = `intitle:${searchText}`;
  }
  if (authorFilter === "none") {
    fetchRequest = `https://www.googleapis.com/books/v1/volumes?q=${searchText}&printType=${type}&orderBy=${orderBy}&maxResults=30&projection=lite&key=${apiKey}`;
  } else {
    fetchRequest = `https://www.googleapis.com/books/v1/volumes?q=${searchText}+inauthor:${authorFilter}&printType=${type}&orderBy=${orderBy}&maxResults=30&projection=lite&key=${apiKey}`;
  }
  console.log(fetchRequest);
  //Eigentliche API Abfrage
  const fetchResult = await fetch(fetchRequest);
  let json = await fetchResult.json();
  //console.log(json);
  //Falls Ergebnisse zurückkamen werden diese eingelesen und angezeigt
  if (json.totalItems > 0) {
    outputLabel.classList.remove("visible");
    json.items.forEach(parseVolume);
    createOutput();
    createAuthorChoice();
  } else {
    //Kam kein Ergebniss zurück wird dies angezeigt und der Filter versteckt
    outputLabel.innerHTML = "Kein Treffer gefunden";
    console.log(`Kein Treffer gefunden für ${searchText} Filter: printType=${type}, author:${authorFilter}, orderBy=${orderBy}`);
    outputLabel.classList.add("visible");
    document.getElementById("authorFilter").classList.remove("visible");
    document.getElementById("output").innerHTML = "";
  }
}

//Liest ein Buch ein und fügt es zur resultMap hinzu
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

//Füllt den Author Filter mit Optionen
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

//Löscht ein Buch aus den Favoriten hinzu und speichert das Favoriten Array im localStorage
function removeFavorite(id) {
  let favorites = getFavorites();
  //console.log(typeof favorites);
  favorites = favorites.filter(item => item !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

//Fügt ein Buch zu den Favoriten hinzu und speichert das Favoriten Array im localStorage
function addFavorite(id) {
  let favorites = getFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
}

//gibt das Favoriten Array aus dem localStorage oder falls nicht vorhandne ein leeres Array zurück
function getFavorites() {
  if (localStorage.getItem("favorites") != null) {
    return JSON.parse(localStorage.getItem("favorites"));
  } else {
    return [];
  }
}

//Gibt die Ergebnisse aus
function createOutput() {
  //console.log("creating Output");
  let output = document.getElementById("output");
  //Entfernt bisherigen Output
  output.innerHTML = "";
  let favorites = getFavorites();
  //Geht die Suchergebnisse durch
  for (let key of resultMap.keys()) {
    let book = resultMap.get(key);
    let container = document.createElement("DIV");
    container.setAttribute("class", "container");
    let favoriteButton = document.createElement("BUTTON");
    favoriteButton.setAttribute("class", "wishlistBtn");
    //Checked ob das Buch in den Favorieten ist
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
    //Wenn auf das Bild geclicked wird, werden die Buchinfos im Popup gesetzt und dieses angezeigt
    image.onclick = function() {
      let b = resultMap.get(this.parentElement.id);
      //console.log(b);
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

//Gibt ein p Element mit dem Authoren des Buchs zurück
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

//Gibt ein p Element mit dem Beschreibungstext des Buchs zurück
function GenerateDescription(book) {
  let description = document.createElement("p");
  description.setAttribute("class", "popUpDescriptionText");
  if (book.description !== undefined) {
    description.textContent = book.description;
  }
  return description;
}

//Lädt die Favorieten aus der API und zeigt sie an
async function loadFavorites() {
  console.log("Lade Favoriten...");
  document.getElementById("filter").classList.remove("visible");
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
  document.getElementById("filter").classList.add("visible");
  let searchText = document.getElementById("searchText").value;
  searchText = searchText.replace(/ /g, "+");
  await searchFor(searchText);
  console.log("searched for " + searchText);
}

async function filterChange() {
  let authorChoice = document.getElementById("authors");
  let slectedAuthor = authorChoice.value;
  await runSearch();
  //Sorgt dafür das der Author weiterhin ausgewählt bleibt
  document.querySelector(
    '#authors [value="' + slectedAuthor + '"]'
  ).selected = true;
}

//Setzt die Funktionen für die Eventlisteners und lädt die Favoriten falls vorhanden.
//Wird nach dem Laden des HTML Documents ausgeführt
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("run").onclick = runSearch;

  document.getElementById("searchText").onsearch = runSearch;

  document.getElementById("searchText").onchange = function() {
    let authorChoice = document.getElementById("authors").selectedIndex = 0;
  }

  document.getElementById("showWishListBtn").onclick = loadFavorites;

  document.getElementById("authors").onchange = filterChange;

  document.getElementById("type").onchange = function() {
    document.getElementById("authors").selectedIndex = 0;
    runSearch();
  };

  document.getElementById("sort").onchange = filterChange;

  document.getElementById("inTitle").onchange = filterChange;  

  document.getElementById("popupCloseButton").onclick = function() {
    //console.log("Close Popup");
    document.getElementById("popup").classList.remove("fadeIn");
  };

  //Passt den main Margin an die Headerheight an
  window.addEventListener("resize", function() {
    document.getElementById("main").style.marginTop = document.getElementById("header").offsetHeight + "px";
  });

  //lädt die Favoriten
  loadFavorites();
});
