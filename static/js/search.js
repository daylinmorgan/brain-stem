const params = new URLSearchParams(window.location.search);
const query = params.get("query");

let miniSearch = new MiniSearch({
  fields: ["title", "content", "tags"], // fields to index for full-text search
  storeFields: ["title", "display"], // fields to return with search results
});

miniSearch.addAll(documents);

let results = miniSearch.search(query);

const searchResults = document.getElementById("results");
if (results.length) {
  let resultHtml = "";
  resultHtml += "<p>" + results.length + " results</p>";
  resultHtml += "<ul>";
  for (const item of results) {
    resultHtml += '<li><div class="bg-ctp-base rounded-md p-2 my-2 markdown">';
    resultHtml += item.display;
    resultHtml += '<a href="' + item.id + '">Read more!</a>';
    resultHtml += "<div></li>";
  }
  resultHtml += "</ul>";
  searchResults.innerHTML = resultHtml;
} else {
  searchResults.innerHTML = "No results found.";
}
