function showPosters(posterListElement, posters, urlPrefix) {
    var filler2Class;
    posters.forEach(poster => {
        let posterDiv = document.createElement('a');
        posterDiv.setAttribute('class', 'poster-div');
        if (poster.url != undefined) {
            posterDiv.setAttribute('href', urlPrefix + poster.url);
        }

        let type = poster.details.type ?? poster.details.Type;

        var posterImgClass, titleClass;
        if (type == 'episode') {
            posterImgClass = 'poster-img-horizontal';
            filler2Class = 'filler2-horizontal';
            titleClass = 'title-horizontal';
        } else {
            posterImgClass = 'poster-img-vertical';
            filler2Class = 'filler2-vertical';
            titleClass = 'title-vertical';
        }

        let posterImg = document.createElement('img');
        posterImg.setAttribute('class', posterImgClass);
        let posterUrl = poster.details.poster ?? poster.details.Poster;
        if (posterUrl) {
            posterImg.setAttribute('src', posterUrl);
        } else {
            posterImg.setAttribute('src', '/assets/img/no-poster.png');
        }
        posterDiv.appendChild(posterImg);

        var firstRow, secondRow;

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
        }

        posterDiv.insertAdjacentHTML('beforeend', '<br><h6 class="' + titleClass + '">' + firstRow + '</h6>');
        posterDiv.insertAdjacentHTML('beforeend', '<span class="text-muted">' + secondRow + '</span>');
        posterListElement.appendChild(posterDiv);
    });

    for (let i = 0; i < 10; i++) {
        let filler1 = document.createElement('div');
        filler1.setAttribute('class', 'filler1');
        let filler2 = document.createElement('div');
        filler2.setAttribute('class', filler2Class);
        filler1.appendChild(filler2);
        posterListElement.appendChild(filler1);
    }
}