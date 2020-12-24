function showPosters(posterListElement, posters, urlPrefix) {
    posters.forEach(poster => {
        let posterDiv = document.createElement('a');
        posterDiv.setAttribute('class', 'poster-div');
        if (poster.url != undefined) {
            posterDiv.setAttribute('href', urlPrefix + poster.url);
        }

        let posterImg = document.createElement('img');
        posterImg.setAttribute('class', 'poster-img');
        let posterUrl = poster.details.poster ?? poster.details.Poster;
        if (posterUrl) {
            posterImg.setAttribute('src', posterUrl);
        } else {
            posterImg.setAttribute('src', '/assets/img/no-poster.png');
        }
        posterDiv.appendChild(posterImg);

        var firstRow, secondRow;
        let type = poster.details.type ?? poster.details.Type;
        if (type == 'movie') {
            firstRow = poster.details.title;
            secondRow = poster.details.year;
        } else if (type == 'series') {
            firstRow = poster.details.title;
            secondRow = poster.details.totalseasons + ' season' + (poster.details.totalseasons > 1 ? 's' : '');
        } else if (type == 'season') {
            firstRow = poster.details.firstRow;
            secondRow = poster.details.secondRow;
        } else if (type == 'episode') {
            firstRow = poster.details.Title;
            secondRow = 'Episode ' + poster.details.Episode;

            let root = document.documentElement;
            root.style.setProperty('--width', window.getComputedStyle(document.documentElement).getPropertyValue('--width-horizontal'));
            root.style.setProperty('--height', window.getComputedStyle(document.documentElement).getPropertyValue('--height-horizontal'));
        }

        posterDiv.insertAdjacentHTML('beforeend', '<br><h6 class="title">' + firstRow + '</h6>');
        posterDiv.insertAdjacentHTML('beforeend', '<span class="text-muted">' + secondRow + '</span>');
        posterListElement.appendChild(posterDiv);
    });

    for (let i = 0; i < 10; i++) {
        let filler1 = document.createElement('div');
        filler1.setAttribute('class', 'filler1');
        let filler2 = document.createElement('div');
        filler2.setAttribute('class', 'filler2');
        filler1.appendChild(filler2);
        posterListElement.appendChild(filler1);
    }
}