var doc = require('./lib/docs.js');

var config = {
    src: {
        css: 'src/example.css',
        template: 'src/template.html'
    },
    dest: {
        dir: 'build',
        json: 'docs.json',
        html: 'docs.html'
    }
};

doc.build(config);
