const params = new URLSearchParams(window.location.search);
const query = params.get("query");

let miniSearch = new MiniSearch({
  fields: ["title", "content", "tags"], // fields to index for full-text search
  storeFields: ["title", "display", "uri"], // fields to return with search results
});

fetch("/index.json")
  .then((response) => response.json())
  .then((data) => {
    miniSearch.addAll(data.index);

    let results = miniSearch.search(query);
    const searchResults = document.getElementById("results");

    if (results.length) {
      let resultHtml = "";
      resultHtml += "<p>" + results.length + " results</p>";
      resultHtml += "<ul>";
      for (const item of results) {
        resultHtml +=
          '<li><div class="bg-ctp-base rounded-md p-2 my-2 markdown">';
        resultHtml +=
          '<h1 class = "font-mono-casual font-black">' + item.title + "</h1>";
        resultHtml += item.display;
        resultHtml += '<a href="' + item.uri + '">Read more!</a>';
        resultHtml += "<div></li>";
      }
      resultHtml += "</ul>";
      searchResults.innerHTML = resultHtml;
    } else {
      searchResults.innerHTML = "No results found.";
    }
  })
  .catch((error) => console.log(error));
