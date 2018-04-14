// Register Service worker
if('serviceWorker' in navigator){
    
    navigator.serviceWorker.register('headlines/sw.js').then(function (reg) {
        console.log('Registration worked!', reg);

    }).catch(function (error) {
        console.log('Registration failed!', error);
    });

} else{
    console.log('Service workers are not supported!');
}

function openDataBase(){
    if (!navigator.serviceWorker) {
        return Promise.resolve();
    }

    return idb.open('headline', 1, function (upgradeDb) {
        var store = upgradeDb.createObjectStore('headlines', {
            keyPath: 'url'
        });
        store.createIndex('time-index', 'publishedAt');
    });

}
this._dbpromise = openDataBase();


var url =   'https://newsapi.org/v2/top-headlines?' +
            'country=ng&apiKey=43057e9dc66f4f749bd70f49d9a638ea';


var req = new Request(url);
fetch(req)
    .then(function(response) {
        return response.json();
    })
    .then(function (data) {
        // Display Fetched JSON but if page is already 
        // displaying Data from IndexDb Clear IDB content
        // and replace with newly fetched content.
        document.getElementById('contentDiv').innerHTML = ''; 
        console.log(data.articles);
        displayNews(data.articles);

        // Save Fetched content into IndexDB
        this._dbpromise.then(function(db){
        
            // Put each message into the 'headlines' object store
            var tx = db.transaction('headlines', 'readwrite');
            var store = tx.objectStore('headlines');

            data.articles.forEach(function(message) {  
                store.put(message);
            });

            // Keep only 30 latest headlines in index db and delete rest
            store.index('time-index').openCursor(null, 'prev').then(function(cursor){
                return cursor.advance(30);
            }).then(function deleteRest(cursor) {
                if (!cursor) return;
                cursor.delete();
                return cursor.continue().then(deleteRest);
            })

        });

    })
    .catch(function (error) { 
        console.log(error);
    });    

// Display content from IndexDB when user is offline
// Or having a bad connectivity.
this._dbpromise.then(function (db) {
    if (!db) return;
    // Get headlines from indexDB and pass them to displayNews()
    // in the order of date/time, starting with the latest.
    var index = db.transaction('headlines').objectStore('headlines').index('time-index');
    return index.getAll().then(function(messages) {
        console.log(messages);
        displayNews(messages.reverse());
    });
});
        
    

// Get 'two letter' country value from 'SELECT' options.
// Call onCountrySelect and pass a value of the two letter for the choosen country.
var selectCountry = document.getElementById('select_country');
selectCountry.onchange = function(){
    console.log(selectCountry.value);
    onCountrySelect(selectCountry.value);
};

// Do a new fetch with SELECTED value from country selection.
function onCountrySelect(country) {
    
    var url =   'https://newsapi.org/v2/top-headlines?' +
                'country='+country+'&' +
                'apiKey=43057e9dc66f4f749bd70f49d9a638ea';
    
    var req = new Request(url);
    fetch(req)
        .then(function(response) {
            return response.json();
        })
        .then(function (data) {
            // Clear formerly displayed data and display newly fetched data. 
            document.getElementById('contentDiv').innerHTML = ''; 
            console.log(data.articles);
            displayNews(data.articles);
            
        });
}

// Display Data
function displayNews(articles) {
    
    var contentDiv = document.getElementById('contentDiv');
    for (var i = 0; i < 9; i++) {
        var author = articles[i].author;
        
        var articleDiv = document.createElement('div');
        articleDiv.setAttribute('class', 'col-md-4 articleDiv');

        var sourceName = document.createElement('p');
        sourceName.setAttribute('class', 'news-source');
        sourceName.textContent = articles[i].source.name;

        var articleImage = document.createElement('img');
        articleImage.setAttribute('src', articles[i].urlToImage);
        articleImage.setAttribute('class', 'img-fluid rounded float-left');

        var title = document.createElement('h4');
        title.textContent = articles[i].title;

        var description = document.createElement('p');
        description.textContent = articles[i].description;

        var readMore = document.createElement('p');
        readMore.innerHTML = '<a class="btn btn-secondary" href="'+ articles[i].url +'" target="_blank" role="button">View details &raquo;</a>'

        articleDiv.appendChild(sourceName);
        articleDiv.appendChild(articleImage);
        articleDiv.appendChild(title);
        articleDiv.appendChild(description);
        articleDiv.appendChild(readMore);

        contentDiv.appendChild(articleDiv);
    }
}