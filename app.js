"use strict";

/**
 * Module dependencies.
 */

var express = require('express'),
    path = require('path'),
    lib = require('./lib');

var app = module.exports = express.createServer();

// Configuration

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon(__dirname + '/favicon.ico'));
    app.use('/static', express['static'](__dirname + '/static', {maxAge: 1000 * 60 * 60 * 24 * 365}));
    app.use(express.logger('[:date] ":url" :status ":referrer" ":user-agent"'));
    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes
var tabs = lib.buildSubs({'Intro': {}, 'Skills': {}, 'Examples': {}, 'CV': {}, 'Contact': {}});

lib.each(tabs, function (tab, tabid) {
    if (path.existsSync(__dirname + '/' + tabid + '.js')) {
        tab.subs = lib.buildSubs(tab.title, require('./' + tabid))
    }
});

app.get('/:tab?/:sub?', function (req, res, next) {
    var cur_t = req.params.tab || 'intro',
        sub = req.params.sub,
        fragment = false;

    if (!tabs.hasOwnProperty(cur_t) ||
            (sub && !tabs[cur_t].subs.hasOwnProperty(sub))) {
        return next();
    }

    if (!req.accepts('html')) {
        if (req.accepts(lib.mimeType('focus'))) {
            fragment = 'focus';
        } else if (lib.mimeType('tab')) {
            fragment = 'tab';
        }
    }

    res.header('Vary', 'Accept');

    if (fragment) {
        // Do not use res.contentType since it performs a mime lookup which
        // resolves my personal mime type with application/octet-stream.
        res.header('Content-Type', lib.mimeType(fragment));
    }

    res.render(cur_t + (fragment === 'focus' && sub ? '_sub' : ''),
               {tabs: tabs, cur_t: cur_t, sub: sub,
                longTitle: sub ? tabs[cur_t].subs[sub].longTitle : tabs[cur_t].longTitle,
                linkTo: lib.linkTo.bind(undefined, tabs[cur_t].title),
                layout: !fragment});
});

app.listen(9002, '127.0.0.1');
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
