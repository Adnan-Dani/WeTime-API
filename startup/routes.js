const chat = require('./../routes/chat');
const user = require('./../routes/UserRoutes');
module.exports = function (app) {
    app.use("/api/chat", chat);
    app.use("/api/user", user);
};

