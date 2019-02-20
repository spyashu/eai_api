const elasticsearch = require('elasticsearch');
var contact_model = require('./models/contact')
var uuid = require('./models/uuid')

// instantiate an Elasticsearch client
const client = new elasticsearch.Client({
    hosts: ['http://localhost:9200']
});


// Searches all the documents with the input parameters
var client_search_all = function (pageSize, page, query) {
    query = query === ''? {} : query
    let body = {
        size: pageSize,
        from: page,
        query: query
    }
    return client.search({
        index: 'eai_api',
        body: body,
        type: 'contact'
    })
}

// Searches the index eai_api for the documents
// with the given uuid
var client_search = function (uuid) {
    let body = {
        size: 200,
        from: 0,
        query: {
            match: {
                "uuid": uuid
            }
        }
    }
    return client.search({
        index: 'eai_api',
        body: body,
        type: 'contact'
    })
}

// Creates a document in the index eai_api 
// With name, telephone and email information
// Makes a recurrsive call back to itself if 
// the uuid is already taken by some other document
var client_index = function (name, telephone, email) {
    var body = contact_model(name, telephone, email) 
    if (body) {
         client_search(body.uuid)
            .then(results => {
                console.log(results, "results", body)
                if (results.hits.total !== 0) {
                    return client_index(name, telephone, email)
                } else {
                    return client.index({
                        index: 'eai_api',
                        type: 'contact',
                        body: body
                    })
                }
            })
            .catch(err => {
                console.log(err)
                res.send([{"error":"Connection problem"}]);
            });
    } else {
    return false
    }
}

// TODO:
// Update functionality
// Unable to handle updates
var client_update = function (uuid, name, telephone, email) {
    var params = {}
    var source = "ctx._source.name=uuid;"
    if (name !== ''){ params["name"] = name; source += "ctx._source.name=name;" }
    if (telephone !== ''){ params["telephone"] = name; source += "ctx._source.telephone=telephone;" }
    if (email !== '') { params["email"] = name; source += "ctx._source.email=email;" }

    var body = {
        "script" : {
            "source": source,
            "lang": "painless",
            "params" : params
        }
    }
    return client.update({
        index: 'eai_api',
        type: 'contact',
        body: body
    })
}

// Deletes the contact with the provided uuid
var client_delete = async function (uuid) {
    var body = {
        query: {
            match: {
                "uuid": uuid
            }
        }
    }
    return await client.deleteByQuery({
        index: 'eai_api',
        type: 'contact',
        body: body
    })
}

// export the functions 
module.exports = { client_search, client_index, client_update ,client_delete, client_search_all }
