const express = require('express');
const fs = require("fs");
const imdb = require('imdb-api');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

const { config } = require('./config.js');


/****************************************************************************************/
const Transloadit = require('transloadit');

const transloadit = new Transloadit({
    authKey: config.TRANSLOADIT_AUTH_KEY,
    authSecret: config.TRANSLOADIT_AUTH_SECRET
});

const transloaditOptions = {
    params: {
        steps: {
            ':original': {
                robot: '/upload/handle',
            },
            converted: {
                use: ':original',
                robot: '/document/convert',
                result: true,
                format: 'vtt',
            }
        }
    }
};
/****************************************************************************************/
const request = require('request');

const rapidapiOptions = {
    method: 'GET',
    url: 'https://movie-database-imdb-alternative.p.rapidapi.com/',
    qs: { i: '', r: 'json' },
    headers: {
        'x-rapidapi-key': config.RAPIDAPI_KEY,
        'x-rapidapi-host': 'movie-database-imdb-alternative.p.rapidapi.com',
        useQueryString: true
    }
};
/****************************************************************************************/

/****************************************************************************************/


const htmlRoot = __dirname + '/assets/html/';

const libraryRoot = config.LIBRARY_ROOT;
const moviesRoot = libraryRoot + 'Movies/';
const tvshowsRoot = libraryRoot + 'TV Shows/';

let movieIndexMap = [];
let movieIndex = 0;

let subtitlesConvertList = [];

const movieList = fs.readdirSync(moviesRoot, { withFileTypes: true })
    .filter(dir => {
        if (!dir.isDirectory()) {
            return false;
        }
        let mp4Path = moviesRoot + dir.name + '/' + dir.name + '.mp4';
        return fs.existsSync(mp4Path);
    })
    .map(dir => {
        let data = {};

        let movieName = dir.name;
        let url = dir.name.toLowerCase();
        url = url.replace(/ /g, '-');
        if (url.length > 6 && url.charAt(url.length - 1) === ')' && url.charAt(url.length - 6) === '(') {
            url = url.substr(0, url.length - 6) + url.substr(url.length - 5, 4);
            movieName = movieName.substr(0, movieName.length - 7);
        }
        data.name = movieName;
        data.url = url;

        let ind = movieIndex++;
        movieIndexMap[url] = ind;
        data.index = ind;

        let videoPath = 'Movies%2F' + dir.name + '%2F' + dir.name + '.mp4';
        data.videoPath = videoPath;

        let srtPath = moviesRoot + dir.name + '/' + dir.name + '.srt';
        let vttPath = moviesRoot + dir.name + '/' + dir.name + '.vtt';

        data.vttPath = vttPath;
        data.subtitlesPath = 'Movies%2F' + dir.name + '%2F' + dir.name + '.vtt';

        data.hasSrt = fs.existsSync(srtPath);
        data.hasVtt = fs.existsSync(vttPath);
        if (data.hasSrt && !data.hasVtt) {
            // Upload .srt file to convert to .vtt
            // Send index as 'field' value to be able to handle multiple conversions at the same time
            transloadit.addFile(ind, srtPath);
            subtitlesConvertList.push(ind);
            console.log(srtPath);
        }

        let detailsPath = moviesRoot + dir.name + '/' + dir.name + '.info';
        data.hasDetails = fs.existsSync(detailsPath);
        if (data.hasDetails) {
            data.details = JSON.parse(fs.readFileSync(detailsPath));
        } else {
            imdb.get({ name: movieName }, { apiKey: config.IMDB_API_KEY })
                .then((imdbData) => {
                    data.details = imdbData;
                    data.hasDetails = true;
                    fs.writeFileSync(detailsPath, JSON.stringify(data.details));
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        return data;
    });

console.log('\n\nEND\n\n');

let tvshowIndexMap = [];
let tvshowIndex = 0;

const tvshowsList = fs.readdirSync(tvshowsRoot, { withFileTypes: true })
    .filter(dir => {
        return dir.isDirectory();
    })
    .map(dir => {
        let data = {};

        let name = dir.name;
        data.name = name;

        let url = name.toLowerCase();
        url = url.replace(/ /g, '-');
        data.url = url;

        let ind = tvshowIndex++;
        tvshowIndexMap[url] = ind;
        data.index = ind;

        let curPath = tvshowsRoot + name + '/';

        let detailsPath = curPath + name + '.info';
        data.hasDetails = fs.existsSync(detailsPath);
        if (data.hasDetails) {
            data.details = JSON.parse(fs.readFileSync(detailsPath));
        } else {
            let details = null;
            imdb.get({ name: name }, { apiKey: config.IMDB_API_KEY })
                .then((imdbData) => {
                    if (imdbData.series != true) {
                        console.warn('\'' + name + '\' is not a TV Show!');
                        // console.log(imdbData);
                        return;
                    }

                    details = imdbData;
                    return imdbData.episodes();
                })
                .then((episodes) => {
                    // console.log(episodes);
                    // console.log(episodes.length);
                    // console.log(episodes[0]);
                    // console.log(episodes[0].season);

                    let seasonCount = details.totalseasons;

                    details.episodes = [];
                    for (let i = 0; i < seasonCount; i++) {
                        details.episodes.push([]);
                    }

                    let finished = 0;

                    for (let i = 0; i < episodes.length; i++) {
                        let s = episodes[i].season;
                        let e = episodes[i].episode;
                        details.episodes[s - 1].push({});

                        rapidapiOptions.qs.i = episodes[i].imdbid;

                        request(rapidapiOptions, function (err, res, body) {
                            if (err) {
                                console.err(err);
                                return;
                            }

                            details.episodes[s - 1][e - 1] = JSON.parse(body);
                            finished++;

                            if (finished == episodes.length) {
                                details._episodes = null;
                                data.details = details;
                                fs.writeFileSync(detailsPath, JSON.stringify(data.details));
                                data.hasDetails = true;
                            }
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        // let test = fs.readdirSync(tvshowsRoot + dir.name, { withFileTypes: true })
        //     .filter(dir => {
        //         if (!dir.isDirectory()) {
        //             return false;
        //         }
        //     });

        return data;
    });

//console.log(tvshowsList);

if (subtitlesConvertList.length > 0) {
    console.log('Starting conversion for ' + subtitlesConvertList.length + ' subtitles');
    // Start the Transloadit Assembly to convert .srt subtitles to .vtt
    transloadit.createAssembly(transloaditOptions, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            let endpoint = result.status_endpoint;
            let done = false;
            let interval = setInterval(function () {
                fetch(endpoint, { method: 'Get' })
                    .then(res => res.json())
                    .then(json => {
                        if (json.ok == "ASSEMBLY_COMPLETED" && !done) {
                            done = true;
                            clearInterval(interval);

                            if (json.results.converted.length != subtitlesConvertList.length) {
                                console.log('CONVERSION FAILED: results length doesn\'t match request length');
                                return;
                            }

                            console.log('Conversion successful');

                            for (let i = 0; i < subtitlesConvertList.length; i++) {
                                let ind = parseInt(json.results.converted[i].field);
                                let vttUrl = json.results.converted[i].url;

                                fetch(vttUrl)
                                    .then(res => res.text())
                                    .then(text => {
                                        fs.writeFile(movieList[ind].vttPath, text, (err) => {
                                            movieList[ind].hasVtt = true;
                                            console.log(vttUrl + ' -> ' + movieList[ind].vttPath);
                                        });
                                    });
                            }
                        }
                    });
            }, 500);
        }
    });
}


app.get('/', (req, res) => {
    res.sendFile(htmlRoot + 'index.html');
});

app.get('/movies', (req, res) => {
    res.sendFile(htmlRoot + 'movies.html');
});

app.get('/movies/:id', (req, res) => {
    res.sendFile(htmlRoot + 'video.html');
});

app.get('/series', (req, res) => {
    res.sendFile(htmlRoot + 'series.html');
});

app.get('/video-details', (req, res) => {
    let url = req.query['url'];
    let parts = url.split('/');
    if (parts[3] == 'movies') { // movies
        let link = parts[4];
        let ind = movieIndexMap[link];
        let data = movieList[ind];
        res.send(data);
    } else { // series
        // todo
    }
});

app.get('/video/:name', (req, res) => {
    var videoName = req.params['name'];
    var videoFullPath = libraryRoot + videoName;

    const path = videoFullPath;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const CHUNK_SIZE = 1000000;
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] != '' ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
        const chunksize = end - start + 1;
        const file = fs.createReadStream(path, { start, end })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        // console.log(head);
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        res.status(400).send("Requires Range header");
    }
});

app.get('/subtitles/:name', (req, res) => {
    var subtitlesPath = req.params['name'];
    var subtitlesFullPath = libraryRoot + subtitlesPath;
    res.sendFile(subtitlesFullPath);
});

app.get('/movie-list', (req, res) => {
    res.json(movieList);
});

app.get('/test', (req, res) => {
    // imdb.get({ name: 'The Office' }, { apiKey: config.IMDB_API_KEY }).then((result) => {
    //     // console.log(results);
    //     // fs.writeFileSync(libraryRoot + 'The Office.info', JSON.stringify(results));
    //     return result.episodes();
    // }).then((episodes) => {
    //     // console.log(episodes);
    //     fs.writeFileSync(libraryRoot + 'The Office.episodes', JSON.stringify(episodes));
    // }).catch((err) => {
    //     console.log(err);
    // });


    // // Upload srt file
    // transloadit.addFile('srt_file', moviesRoot + '1917 (2019)/1917 (2019).srt')

    // // Start the Assembly to convert to vtt
    // transloadit.createAssembly(transloaditOptions, (err, result) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         let endpoint = result.status_endpoint;

    //         //let retryCount = 10;
    //         let done = false;
    //         let interval = setInterval(function () {
    //             console.log('fetch');
    //             //retryCount--;
    //             fetch(endpoint, { method: 'Get' })
    //                 .then(res => res.json())
    //                 .then(json => {
    //                     if (json.ok == "ASSEMBLY_COMPLETED" && !done) {
    //                         done = true;
    //                         clearInterval(interval);
    //                         console.log('SUCCESS');

    //                         let vttUrl = json.results.converted[0].url;
    //                         console.log(vttUrl);

    //                         fetch(vttUrl)
    //                             .then(res => res.text())
    //                             .then(text => {
    //                                 fs.writeFileSync('test.vtt', text);
    //                             });
    //                     }
    //                 });
    //         }, 500);
    //     }
    // });

    res.sendFile(htmlRoot + 'test.html');
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/assets/img/favicon.ico');
});

app.listen(port, '0.0.0.0', () => console.log(`Server started at http://localhost:${port}`));