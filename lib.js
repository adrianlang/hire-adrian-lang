module.exports = require('underscore');

module.exports.longTitle = function (tab, title) {
    return 'Hire Adrian Lang | ' + tab + (title ? ' | ' + title : '');
};

module.exports.mimeType = function (subtype) {
    return 'application/prs.de.adrianlang.hire.' + subtype;
};

module.exports.htmlEntities = function (str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};