const params = new URLSearchParams(window.location.search);
const query = params.get("query");
const idx = lunr(function () {
  // Search these fields
  this.ref("id");
  this.field("title", {
    boost: 15,
  });
  this.field("tags");
  this.field("content", {
    boost: 10,
  });

  // Add the documents from your search index to
  // provide the data to idx
  for (const key in window.store) {
    this.add({
      id: key,
      title: window.store[key].title,
      tags: window.store[key].tags,
      content: window.store[key].content,
    });
  }
});

const results = idx.search(query);

const searchResults = document.getElementById("results");
if (results.length) {
  let resultHtml = "";
  resultHtml += "<p>" + results.length + " results</p>"
  resultHtml += "<ul>"
  for (const n in results) {
    const item = store[results[n].ref];
    resultHtml += '<li><div class="bg-ctp-base rounded-md p-2 my-2 markdown">'
    resultHtml += item.display
    resultHtml += '<a href="' + item.url + '">Read more!</a>'
    resultHtml +="<div></li>"
  }
  resultHtml += '</ul>'
  searchResults.innerHTML = resultHtml;
  console.log(resultHtml)
} else {
  searchResults.innerHTML = "No results found.";
}
