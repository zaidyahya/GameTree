const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const { SESSION_OPTIONS } = require('./config/session.js');
const register = require('./routes/register.js');
const login = require('./routes/login.js');
const home = require('./routes/home.js');
const { catchAsync, notFound } = require('./middleware/errors.js');
const { active } = require('./middleware/auth.js');
const { IN_PROD } = require('./config/app.js');

const createApp = (store) => {
    console.log("Creating the App");

    const app = express();
    const server = http.createServer(app);

    app.use(express.json());

    if(IN_PROD){
        app.use(express.static(path.join(__dirname, '../../client/dist')));

        app.get('/*', (req, res) => {
            console.log('DEFAULT HIT!');
            res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
        });

        // Since we only use /, upon refresh on a different url doesn't make the file get sent - unlike above which matches on everything
        // app.use(express.static(path.join(__dirname, '../../client/dist')));
        // app.get("/", (req, res) => {
        //     console.log("Got hit?");
        //     res.sendFile(path.join(__dirname, '../../client/dist', "index.html"));
        // });
    }

    app.use(
        session({
            ...SESSION_OPTIONS,
            store 
        })
    )

    app.use(catchAsync(active)); //Middleware to enforce session timeout i.e. max session time
    app.use(login);
    app.use(register);

    //app.use(home);
    
    app.use(notFound);



    return server;
}

module.exports = { createApp };
