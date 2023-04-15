const chat = require('./../routes/chat');

module.exports = function (app) {
    app.use("/api/chat", chat);
};

