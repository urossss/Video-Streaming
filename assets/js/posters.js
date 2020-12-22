let urlParts = document.URL.split('/');
let pageType = urlParts[urlParts.length - 1];

var posterListEndpoint, urlPrefix;
if (pageType == 'movies') {
    posterListEndpoint = '/movie-list';
    urlPrefix = '/movies/';
} else if (pageType == 'tv-shows') {
    posterListEndpoint = '/tv-show-list';
    urlPrefix = '/tv-shows/';
}

$.getJSON(posterListEndpoint, list => {
    console.log(list);
    let posterListDiv = document.getElementById('posterList');

    list.forEach(poster => {
        let posterDiv = document.createElement('a');
        posterDiv.setAttribute('class', 'poster-div');
        posterDiv.setAttribute('href', urlPrefix + poster.url);

        let posterImg = document.createElement('img');
        posterImg.setAttribute('class', 'poster-img');
        if (poster.hasDetails) {
            posterImg.setAttribute('src', poster.details.poster);
        }
        posterDiv.appendChild(posterImg);

        posterDiv.insertAdjacentHTML('beforeend', '<br/><h6 class="title" ">' + poster.name + '</h6>');
        posterListDiv.appendChild(posterDiv);
    });

    for (let i = 0; i < 15; i++) {
        let filler1 = document.createElement('div');
        filler1.setAttribute('class', 'filler1');
        let filler2 = document.createElement('div');
        filler2.setAttribute('class', 'filler2');
        filler1.appendChild(filler2);
        posterListDiv.appendChild(filler1);
    }
});