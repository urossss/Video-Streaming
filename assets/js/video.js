document.addEventListener("DOMContentLoaded", function (event) {
    $.getJSON('/video-details', {
        url: document.URL
    },
        video => {
            console.log(video);

            if (video.videoPath) {
                let videoPlayer = document.getElementById('videoPlayer');

                let videoSource = document.createElement('source');
                videoSource.setAttribute('type', 'video/mp4');
                videoSource.setAttribute('src', '/video/' + video.videoPath);
                videoPlayer.appendChild(videoSource);

                if (video.hasVtt) {
                    let subtitlesTrack = document.createElement('track');
                    subtitlesTrack.setAttribute('kind', 'subtitles');
                    subtitlesTrack.setAttribute('label', 'Default');
                    subtitlesTrack.setAttribute('src', '/subtitles/' + video.subtitlesPath);
                    videoPlayer.appendChild(subtitlesTrack);
                }

                document.getElementById('videoDiv').removeChild(document.getElementById('videoNotFound'));
            } else {
                document.getElementById('videoDiv').removeChild(document.getElementById('videoPlayer'));
            }

            if (video.hasDetails) {
                let d = video.details;

                let titleElement = document.getElementById('title');
                titleElement.insertAdjacentHTML('beforeend', d.title ?? d.Title + '&nbsp');

                let yearElement = document.getElementById('year');
                yearElement.insertAdjacentHTML('beforeend', '(' + (d.year ?? d.Year) + ')');

                let posterElement = document.getElementById('poster');
                if (d.poster ?? d.Poster) {
                    posterElement.setAttribute('src', d.poster ?? d.Poster);
                } else {
                    posterElement.setAttribute('src', '/assets/img/no-poster.png');
                }

                let type = d.type ?? d.Type;
                if (type == 'episode') {
                    posterElement.classList.add('main-poster-horizontal');

                    let posterDiv = document.getElementById('posterDiv');
                    posterDiv.setAttribute('class', 'col-12 col-lg-5');

                    let detailsDiv = document.getElementById('detailsDiv');
                    detailsDiv.setAttribute('class', 'col-12 col-lg-6');

                    let releasedElement = document.getElementById('released');
                    let releaseDate = d.Released;
                    if (releaseDate) {
                        if (releaseDate.charAt(0) == '0') {
                            releaseDate = releaseDate.substr(1);
                        }
                        releasedElement.insertAdjacentHTML('beforeend', releaseDate);
                    } else {
                        releasedWrapper.style.visibility = 'hidden';
                    }

                    yearElement.style.visibility = 'hidden';

                    let se = 'S' + (d.Season < 10 ? '0' : '') + d.Season +
                        'E' + (d.Episode < 10 ? '0' : '') + d.Episode + '<span class="text-muted"> | </span>';
                    let seElement = document.getElementById('season-episode');
                    seElement.insertAdjacentHTML('beforeend', se);

                    let prevEpisodeElement = document.getElementById('prevEpisode');
                    if (video.prevEpisode) {
                        prevEpisodeElement.setAttribute('href', video.prevEpisode);
                    } else {
                        prevEpisodeElement.classList.add('disabled');
                        prevEpisodeElement.classList.add('btn-outline-secondary');
                    }

                    let nextEpisodeElement = document.getElementById('nextEpisode');
                    if (video.nextEpisode) {
                        nextEpisodeElement.setAttribute('href', video.nextEpisode);
                    } else {
                        nextEpisodeElement.classList.add('disabled');
                        nextEpisodeElement.classList.add('btn-outline-secondary');
                    }
                } else {
                    posterElement.classList.add('main-poster-vertical');

                    let releasedWrapper = document.getElementById('released-wrapper');
                    releasedWrapper.style.visibility = 'hidden';

                    document.getElementById('videoDiv').removeChild(document.getElementById('adjacentEpisodes'));
                }

                let plotElement = document.getElementById('plot');
                plotElement.insertAdjacentHTML('beforeend', '' + (d.plot ?? d.Plot) + '<br>');

                let writerElement = document.getElementById('writer');
                writerElement.insertAdjacentHTML('beforeend', d.writer ?? d.Writer);

                let directorElement = document.getElementById('director');
                directorElement.insertAdjacentHTML('beforeend', d.director ?? d.Director);

                let genreElement = document.getElementById('genre');
                genreElement.insertAdjacentHTML('beforeend', d.genres ?? d.Genre);

                let castElement = document.getElementById('cast');
                castElement.insertAdjacentHTML('beforeend', d.actors ?? d.Actors);

                let durationElement = document.getElementById('duration');
                let duration = parseInt(d.runtime ?? d.Runtime);
                let hours = Math.floor(duration / 60), minutes = duration % 60;
                durationElement.insertAdjacentHTML('beforeend', (hours ? hours + 'h ' : '') + (minutes ? minutes + 'min' : ''));

                let ratedElement = document.getElementById('rated');
                ratedElement.insertAdjacentHTML('beforeend', d.rated ?? d.Rated);

                let ratingElement = document.getElementById('rating');
                ratingElement.insertAdjacentHTML('beforeend', d.rating ?? d.imdbRating);
            }

            /**** Saving the lightweight version of the page (video.html) ****/
            // let page = $("html").html();
            // let ind = page.indexOf('</head>');
            // let head = page.substr(0, ind + 7);
            // let body = page.substr(ind + 7);
            // head = head.substr(0, 307) + '</head>';
            // body = body.replace(/href="/g, 'href="/lightweight');
            // page = head + '\n' + body;
            // let blob = new Blob([page], { type: "text/html;charset=utf-8" });
            // let parts = document.URL.split('/');
            // saveAs(blob, parts[parts.length - 1]);
        });
});