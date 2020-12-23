document.addEventListener("DOMContentLoaded", function (event) {
    $.getJSON('/tv-show-details', {
        url: document.URL
    },
        res => {
            if (!res.valid) {
                window.location.replace('/');
                return;
            }

            let details = res.details;
            console.log(details);

            let titleElement = document.getElementById('title');
            titleElement.insertAdjacentHTML('beforeend', details.title + '&nbsp');

            let yearElement = document.getElementById('year');
            yearElement.insertAdjacentHTML('beforeend', '(' + details._yearData + ')');

            let posterElement = document.getElementById('poster');
            if (details.poster) {
                posterElement.setAttribute('src', details.poster);
            } else {
                posterElement.setAttribute('src', '/assets/img/no-poster.png');
            }

            let plotElement = document.getElementById('plot');
            plotElement.insertAdjacentHTML('beforeend', '<br>' + details.plot + '<br>');

            let writerElement = document.getElementById('writer');
            writerElement.insertAdjacentHTML('beforeend', details.writer);

            let genreElement = document.getElementById('genre');
            genreElement.insertAdjacentHTML('beforeend', details.genres);

            let castElement = document.getElementById('cast');
            castElement.insertAdjacentHTML('beforeend', details.actors);

            let episodesElement = document.getElementById('episodes');
            episodesElement.insertAdjacentHTML('beforeend', details.totalepisodes);

            let durationElement = document.getElementById('duration');
            let duration = parseInt(details.runtime);
            let hours = Math.floor(duration / 60), minutes = duration % 60;
            durationElement.insertAdjacentHTML('beforeend', (hours ? hours + 'h ' : '') + (minutes ? minutes + 'min' : ''));

            let ratedElement = document.getElementById('rated');
            ratedElement.insertAdjacentHTML('beforeend', details.rated);

            let ratingElement = document.getElementById('rating');
            ratingElement.insertAdjacentHTML('beforeend', details.rating);

            let posters = [];
            for (let i = 1; i <= details.totalseasons; i++) {
                let url = 'season-' + i;
                let firstRow = 'Season ' + i;
                let secondRow = details.seasonsdata[i - 1].episodes + ' episode' + (details.seasonsdata[i - 1].episodes > 1 ? 's' : '');
                let poster = details.seasonsdata[i - 1].poster;

                posters.push({
                    url: url,
                    details: {
                        type: 'season',
                        poster: poster,
                        firstRow: firstRow,
                        secondRow: secondRow
                    }
                });
            }
            let posterListElement = document.getElementById('posterList');
            showPosters(posterListElement, posters, document.URL + '/');
        });
});