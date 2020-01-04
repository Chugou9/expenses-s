const noteRoutes = require('./note_routes');

module.exports = function(server, db) {
    noteRoutes(server, db);
};