#!/usr/bin/env node


var convert = require('../lib/convert'),
	fs      = require('fs'),
	url     = require('url'),
	path    = require('path'),
	async   = require('async'),
	opts = require("nomnom")
		.option('svg', {
			position: 0,
			list: true,
			help: 'the svg file or nounproject page to convert'
		})
		.option('dir', {
			abbr: 'o',

			help: 'the directory to write the file[s] to.'
		})	
		.option('sheet', {
			abbr: 's',
			help: 'a json sprite sheet to add the icon to.'
		})
	   .parse();

var output_dir = opts.dir || false;
var sheet_file = opts.sheet || false;

if (output_dir) {
	if (!fs.existsSync(output_dir)){
		fs.mkdirSync(output_dir);
	}
}
if (sheet_file) {
	sheet_file = new Store(sheet_file);
}


async.forEachLimit(opts.svg, 5, process, function(err){
    if (err) console.log('Error: ', err);
    if (sheet_file) {
    	sheet_file.save();
    }
    console.log('done');
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
	    		iconname = $meta.find('.icon-name a').text().replace(' ', '_') + '-' + icon_id,
	    		dest     = destination(iconname , o_dir);

	    	if (icon_id.indexOf('otherIcon') < 0 && iconname.length > 0 && icon_id.length > 0 ) {
		    	to_process.push({
		    		dest: dest,
		    		svg_elem: svg_elem,
		    		name: iconname
		    	})
	    	}
	    });

	    // an individual icon page
	    $("#icon-container li.current span.icon svg").each(function() {

	    	var hash     = url.parse(name).hash,
	    		icon_id  = (/\d+/i).exec(hash)[0],
	    		svg_elem = $('#otherIcon-' + icon_id + ' svg'),
	    		iconname = $('h1.noun-name').text().replace(' ', '_')+ '-' + icon_id,
	    		dest     = destination(iconname , o_dir);
	    	to_process.push({
	    		dest: dest,
	    		svg_elem: svg_elem,
	    		name : iconname
	    	})
	    	
	    });
		async.forEachLimit(to_process, 5, processOnlineSVG, cb);
	  }
	});	
	
}

function processOnlineSVG(details, cb) {
	var path_str = convert( details.svg_elem.html() );
	write(details.dest, path_str, details.name, cb);
}



function processFile(name, cb) {
	fs.readFile(name, "utf-8", function(err, data){
		if (err) return cb(err);		
		var path_str = convert(data);
		var dest = destination(name, output_dir);
		var name = path.basename(name, '.svg');
		write(dest, path_str, name, cb);
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



function write(dest, path_str, name, callback) {
	if (sheet_file) {
		sheet_file.set(name, path_str);
	} else {
		fs.writeFile(dest, path_str, function(err) {
			if (err) return callback(err);			
		});
	}
	callback(null);
}


function Store(path) {
  this.path = path;
  if (!fs.existsSync(path)) {
  	fs.writeFileSync(path, JSON.stringify({}));
  	this.Store = {};
  } else {
  	this.Store = JSON.parse(fs.readFileSync(path));
  }
}

Store.prototype.get = function(key) {
  if (!key) return clone(this.Store);
  if (!this.Store[key]) return;
  return clone(this.Store[key]);
}

Store.prototype.set = function(key, value) {
  this.Store[key] = value;
}


Store.prototype.save = function() {
  console.log('writing: ', this.path);
  fs.writeFileSync(this.path, JSON.stringify(this.Store, null, 4));
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}




