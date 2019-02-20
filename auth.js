// Authorization can be done while POST, DELETE, PUT requests
// Variables and imports
var express = require('express')
var router = express.Router()
var contact_model = require('./models/contact')
var elastic = require('./data')

// Creates a contact with unique uuid
router.post('/contact', function (req, res) {
    var name = req.query["name"];
    var telephone = req.query['telephone']
    var email = req.query['email']
    var result = elastic.client_index(name, telephone, email)
    if (result !== false) {
        res.send({"success":"Created Successfully!"});
    } else {
        res.send([{"error": "Error in the values passed"}])
    }
})

// Delete based on uuid
router.delete('/contact/:param', async function (req, res) {
    elastic.client_delete(req.params.param)
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([{"error": "Unable to delete."}]);
        });
})

// Update based on uuid and contact information
router.put('/contact/:param', (req, res) => {
    var uuid = req.params.param
    var name = req.query['name'] === null? '' : req.query['name']
    var telephone = req.query['telephone'] === null? '' : req.query['telephone']
    var email = req.query['email'] === null? '' : req.query['email']
    
    elastic.client_update(uuid, name, telephone, email)
        .then(results => {
            res.send({"results":results.hits.hits});
        })
        .catch(err => {
            console.log(err)
            res.send([{"error": "Unable to update."}]);
        });
})

// Usually contains the authentication flag along with router information
var auth = { router, checkAuthenticated: true }
module.exports = auth