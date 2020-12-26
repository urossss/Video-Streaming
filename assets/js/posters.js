let urlParts = document.URL.split('/');

if (urlParts[3] == 'movies') {
    posterListEndpoint = '/movie-list';
    urlPrefix = '/movies/';
} else if (urlParts[3] == 'tv-shows') {
    if (urlParts.length == 4 || (urlParts.length == 5 && urlParts[4] == '')) {
        posterListEndpoint = '/tv-show-list';
        urlPrefix = '/tv-shows/';
    } else {
        posterListEndpoint = '/episode-list/' + urlParts[4] + '/' + urlParts[5];
        urlPrefix = '/tv-shows/' + urlParts[4] + '/';
    }
}

$.getJSON(posterListEndpoint, list => {
    let posterListElement = document.getElementById('posterList');
    showPosters(posterListElement, list, urlPrefix);

    /**** Saving the lightweight version of the page (posters.html) ****/
    // let page = $("html").html();
    // let ind = page.indexOf('</head>');
    // let head = page.substr(0, ind + 7);
    // let body = page.substr(ind + 7);
    // body = body.replace(/href="/g, 'href="/lightweight');
    // page = head + '\n' + body;
    // let blob = new Blob([page], { type: "text/html;charset=utf-8" });
    // let parts = document.URL.split('/');
    // saveAs(blob, parts[parts.length - 1]);
});