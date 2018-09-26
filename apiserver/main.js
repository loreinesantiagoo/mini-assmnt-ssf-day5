//load libs
const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');

const Giphy = require('./giphy');
// const bp = require('body-parser');

const GIPHY_KEY = '4DBIBgILWh8UCTzTAFwAf8YMftqF9kn2';

const resources = [' public', 'angular'];

//create an instance
const app = express();
const giphy = Giphy(GIPHY_KEY);

app.engine('hbs', hbs({ defaultLayout: false }));
app.set('view engine', 'hbs');
// app.set('views', path.join(__dirname, 'views'));


//define routes
app.get('/search', (req, resp) => {
    console.log('query=', req.query);
    giphy.search(req.query.searchTerm, req.query.resultCount)
        .then(result => {
            resp.status(200);
            resp.format({
                'text/html': () => {
                    resp.render('index', {
                        images: result.images,
                        searchTerm: req.query.seachTerm,
                        fromCache: !!result['fromCache']
                    
                    });
                },
                'application/json': () => {
                        resp.json(result);
                    }
                
            });
        })
        .catch(err => {
            resp.status(400).json({ error: err });
        })
}),

app.get(['/', '/index'], (req, resp) => {
    resp.status(200).type('text/html');
    resp.render('index');
})

for (let r of resources) {
    console.info(`Adding ${r} as static resource`)
    app.use(express.static(path.join(__dirname, r))); //will serve the static data
}
// Get //v1/gifs/search
app.get('/v1/gifs/search', (req, resp) => {
    resp.set('Cache-Control', 'fixed_width { url }');
})

//start the server
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;
app.listen(PORT, () => {
    console.info(`App started on ${PORT}`);
})
