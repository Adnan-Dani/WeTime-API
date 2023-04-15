var cors = require('cors')
module.exports = function (app) {
    app.use(cors({
        // origin: 'http://localhost:3000'
        origin: '*'
    }));
} 
