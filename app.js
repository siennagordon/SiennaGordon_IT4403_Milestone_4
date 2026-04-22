// =====================
// GLOBAL VARIABLES
// =====================
const API_KEY = "AIzaSyBF88Zj0i10ZawguX0YsCULIoLOgDvpCMs";
let currentQuery = "";
let currentStartIndex = 0;
const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 5;
let isLoading = false;


// =====================
// SEARCH BUTTON
// =====================
$("#search-button").on("click", function () {
    $("#search-button").prop("disabled", true);
console.log("CLICKED");
    const inputValue = $("#search-input").val();

    if (!inputValue || inputValue.trim() === "") {
        alert("Enter a search term");
        return;
    }

    const query = inputValue.trim();
    fetchBooks(query, 0);
});


// =====================
// FETCH BOOKS (MAIN)
// =====================
function fetchBooks(query, startIndex = 0) {

    if (isLoading) return;
    isLoading = true;

    if (!query || query.trim() === "") {
        $("#results-container").html("<p>Please enter a search term.</p>");
        isLoading = false;
        return;
    }

    currentQuery = query;

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${RESULTS_PER_PAGE}&key=${API_KEY}`;

    $("#results-container").html("<p>Loading...</p>");

    $.getJSON(apiUrl)
        .done(function (response) {

            if (!response.items || response.items.length === 0) {
                $("#results-container").html("<p>No results found.</p>");
                return;
            }

            renderBookResults(response.items);
            renderPagination(response.totalItems);
        })
        .fail(function (xhr, status, error) {
            console.log("STATUS:", status);
            console.log("ERROR:", error);
            console.log("STATUS CODE:", xhr.status);

            $("#results-container").html("<p>Failed to fetch data.</p>");
        })
        .always(function () {
            isLoading = false;
        });
}


// =====================
// RENDER RESULTS (MUSTACHE)
// =====================
function renderBookResults(books) {

    const template = $("#book-template").html();
    $("#results-container").empty();

    books.forEach(function (book) {

        const info = book.volumeInfo;

        const data = {
            id: book.id,
            title: info.title || "No Title",
            thumbnail: info.imageLinks?.thumbnail
                ? info.imageLinks.thumbnail.replace("http://", "https://")
                : "https://via.placeholder.com/150x200?text=No+Image"
        };

        const html = Mustache.render(template, data);
        $("#results-container").append(html);
    });
}


// =====================
// PAGINATION
// =====================
function renderPagination(totalItems) {

    $("#pagination-container").empty();

    const totalPages = Math.min(
        MAX_PAGES,
        Math.ceil(totalItems / RESULTS_PER_PAGE)
    );

    for (let page = 0; page < totalPages; page++) {

        const startIndex = page * RESULTS_PER_PAGE;

        const button = `
            <button class="pagination-button" data-start-index="${startIndex}">
                ${page + 1}
            </button>
        `;

        $("#pagination-container").append(button);
    }
}


// =====================
// PAGINATION CLICK
// =====================
$(document).on("click", ".pagination-button", function () {
if (isLoading) return;

    const startIndex = $(this).data("start-index");
    currentStartIndex = startIndex;

    fetchBooks(currentQuery, startIndex);
});


// =====================
// BOOK CLICK → DETAILS
// =====================
$(document).on("click", ".book-card", function () {

    const bookId = $(this).data("book-id");

    if (!bookId) {
        alert("Book ID missing!");
        return;
    }

    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

    $.getJSON(apiUrl, function (book) {

        const info = book.volumeInfo;

        const data = {
            title: info.title || "No Title",
            authors: info.authors ? info.authors.join(", ") : "Unknown Author",
            description: info.description || "No description available.",
            thumbnail: info.imageLinks?.thumbnail
                ? info.imageLinks.thumbnail.replace("http://", "https://")
                : "https://via.placeholder.com/150x200"
        };

        const template = $("#details-template").html();
        const html = Mustache.render(template, data);

        $("#details-container").html(html);
    });
});


// =====================
// LOAD FEATURED BOOKS
// =====================
function loadFeaturedBooks() {

const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=bestsellers&maxResults=10&key=${API_KEY}`;
    $.getJSON(apiUrl, function (response) {

        if (!response.items) return;

        const template = $("#book-template").html();
        $("#collection-container").empty();

        response.items.forEach(function (book) {

            const info = book.volumeInfo;

            const data = {
                id: book.id,
                title: info.title || "No Title",
                thumbnail: info.imageLinks?.thumbnail
                    ? info.imageLinks.thumbnail.replace("http://", "https://")
                    : "https://via.placeholder.com/150x200?text=No+Image"
            };

            const html = Mustache.render(template, data);
            $("#collection-container").append(html);
        });
    });
}


// =====================
// VIEW TOGGLES (GRID / LIST)
// =====================
$("#grid-view").click(function () {
    $("#results-container").removeClass("list-view").addClass("grid-view");
});

$("#list-view").click(function () {
    $("#results-container").removeClass("grid-view").addClass("list-view");
});


// =====================
// SECTION SWITCH (SEARCH / COLLECTION)
// =====================
$("#show-search").click(function () {
    $("#results-section").show();
    $("#collection-section").hide();
});

$("#show-collection").click(function () {
    $("#results-section").hide();
    $("#collection-section").show();
});


// =====================
// INITIAL LOAD
// =====================
$(document).ready(function () {
    loadFeaturedBooks();
});
