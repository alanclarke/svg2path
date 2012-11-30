#!/usr/bin/env node


var convert = require('../lib/convert'),
	fs      = require('fs'),
	url     = require('url'),
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

	    // a collection page
	    $("section ul.icons li.icon").each(function() {
	    	var icon_id  = $(this).attr('id'),
	    		svg_elem = $(this).find('svg'),
	    		$meta    = $(this).find('.icon-meta'),
	    		iconname = $meta.find('.icon-name a').text().replace(' ', '_'),
	    		dest     = destination(iconname + '-' + icon_id, o_dir);

	    	if (icon_id.indexOf('otherIcon') < 0 && iconname.length > 0 && icon_id.length > 0 ) {
		    	to_process.push({
		    		dest: dest,
		    		svg_elem: svg_elem
		    	})
	    	}
	    });

	    // an individual icon page
	    $("#icon-container li.current span.icon svg").each(function() {

	    	var hash     = url.parse(name).hash,
	    		icon_id  = (/\d+/i).exec(hash)[0],
	    		svg_elem = $('#otherIcon-' + icon_id + ' svg'),
	    		iconname = $('h1.noun-name').text().replace(' ', '_'),
	    		dest     = destination(iconname + '-' + icon_id, o_dir);
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

