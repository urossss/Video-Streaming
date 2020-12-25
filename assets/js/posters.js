let urlParts = document.URL.split('/');
console.log(urlParts);

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

console.log(posterListEndpoint);

$.getJSON(posterListEndpoint, list => {
    console.log('showing posters');
    console.log(list);
    let posterListElement = document.getElementById('posterList');
    showPosters(posterListElement, list, urlPrefix);
});