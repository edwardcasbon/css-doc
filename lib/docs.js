'use strict';

var fs = require('fs');
var handlebars = require('handlebars');
var docs = [];

var build = function build(config) {
    fs.readFile(config.src.css, 'utf8', function(error, data){
        var regex = /\/\*(.|\n)+?(?=\*\/)\*\/(.|\n)+?(?=\/\*|$)(.|\n|$)+?(?=\/\*|$)/gim;
        var blocks = data.match(regex);

        blocks.map(function(block) {
            docs.push(readBlock(block));
        });

        saveAsJson(docs, config.dest.dir + '/' + config.dest.json);
        saveAsHtml(docs, config.dest.dir + '/' + config.dest.html, config.src.template);
    });
}

var readBlock = function readBlock(block) {
    var doc = {};
    var hasCss = false;
    var heading = 'inline';
    var lines = block.split('\n');

    for(var i=0; i<lines.length; i++) {
        var line = lines[i];

        // If no comment, then it's css.
        if(line.charAt(0) !== '/' && line.charAt(0) !== ' ' && line.charAt(0) !== '' && !hasCss) {
            doc.css = line;
            doc.selector = getSelectorFromCSS(line);
            hasCss = true;
            break;
        }

        // Remove any lines that don't have content.
        line = (line.indexOf(' * ') === 0) ? line.slice(3) : line;
        line = (line.indexOf('/*') === 0) ? line.slice(2) : line;
        line = (line.indexOf(' */') === 0) ? line.slice(3) : line;
        line = (line.indexOf(' *') === 0) ? line.slice(2) : line;

        if('' !== line) {

            // if starts with @ then update heading var
            if(line.indexOf('@') === 0) {
                heading = line.substr(1, line.indexOf(' ') - 1);
                line = line.slice(line.indexOf(' '));
            }

            if(doc[heading] !== undefined) {
                doc[heading] += '\n' + line.trim();
            } else {
                doc[heading] = line.trim();
            }
        }
    }

    return doc;
}

var getSelectorFromCSS = function getSelectorFromCSS(css) {
    return css.substr(0, css.indexOf('{')).trim();
}

var saveAsJson = function saveAsJson(json, filename) {
    fs.writeFile(filename, JSON.stringify(json), function(err) {
        if(err) throw err;
        console.log('Saved as JSON.');
    });
}

var saveAsHtml = function saveAsHtml(json, filename, template) {
    fs.readFile(template, 'utf8', function(error, source) {
        var tpl = handlebars.compile(source);
        var context = {docs: json};
        var html = tpl(context);

        fs.writeFile(filename, html, function(err){
            if(err) throw err;
            console.log('Saved as HTML.');
        });
    });
}

exports.build = build;
