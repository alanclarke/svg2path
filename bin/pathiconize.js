#!/usr/bin/env node


var convert = require('../lib/convert'),
	fs      = require('fs'),
	path    = require('path'),
	async   = require('async'),
	opts = require("nomnom")
		.option('file', {
			position: 0,
			list: true,
			help: 'the svg or nounproject file to convert'
		})
		.option('dir', {
			abbr: 'o',

			help: 'the directory to write the file[s] to.'
		})	
	   .parse();

var output_dir = opts.dir || false;

if (output_dir) {
	if (!fs.existsSync(output_dir)){
		fs.mkdirSync(output_dir);
	}
}


async.forEachLimit(opts.file, 5, process, function(err){
    if (err) console.log('Error: ', err);

});


function process(name, cb) {
	if ((/^http:\/\/thenounproject.com/i).test(name)) return processNounProject(name, cb);
	if ((/\.svg$/i).test(name)) return processFile(name, cb);
}


function processNounProject(name, cb){
	var jsdom = require("jsdom"),
		o_dir = output_dir;
	    if (!o_dir) o_dir = '.';	

	console.log('loading: ', name, ' please wait...');
	jsdom.env({
	  html: name,
	  scripts: ["http://code.jquery.com/jquery.js"],
	  done: function (errors, window) {
	    var $ = window.$;

	    var to_process = [];

	    $("section ul.icons li.icon").each(function() {
	    	var icon_id  = $(this).attr('id'),
	    		svg_elem = $(this).find('svg'),
	    		$meta    = $(this).find('.icon-meta'),
	    		name     = $meta.find('.icon-name a').text().replace(' ', '_'),
	    		dest     = destination(name + '-' + icon_id, o_dir);

	    	to_process.push({
	    		dest: dest,
	    		svg_elem: svg_elem
	    	})

	    });
		async.forEachLimit(to_process, 5, processOnlineSVG, function(err){
		    if (err) console.log('Error: ', err);
		});

	  }
	});	
	
}

function processOnlineSVG(details, cb) {
	console.log('writing: ', details.dest);
	var path_str = convert( details.svg_elem.html() );
	write(details.dest, path_str, cb);
}



function processFile(name, cb) {
	fs.readFile(name, "utf-8", function(err, data){
		if (err) return cb(err);		
		var path_str = convert(data);
		var dest = destination(name, output_dir);
		write(dest, path_str, cb);
	});	
}



function destination(original_name, o_dir) {
	if (o_dir) {
		var base = path.basename(original_name, '.svg');
		return path.join(o_dir, base + '.path');
	} else {
		return original_name.replace(/\.svg$/i, '.path');		
	}

}



function write(dest, path_str, callback) {
	fs.writeFile(dest, path_str, callback);
}

