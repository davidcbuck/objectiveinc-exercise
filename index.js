const DB_DEFAULT_FILE = 'data/data.sqlite3';

const c = require('./constants.js'),
	func = require('./functions.js');
var http = require('http'),
	sqlite = require('sqlite3').verbose();

var tot_applicants, tot_skills;

http.createServer((request, response) =>
{
	//don't execute second time on favicon request
	if(request.url.match('favicon')) return;
	
	var db_path, loadDb, data, sql_apps, sql_skills, sql_join;
	//allow easy changing of databases for testing. As mentioned elsewhere, not the most robust code, but works demo purposes
	if(request.url.match('path='))
	{
		db_path = request.url.match(/path=(\.?%?\w+)+/);			//slash direction agnostic				url-encoded space
		if(db_path) db_path = db_path[0].replace('path=', '').replace('%2F','\\').replace('%5C', '\\').replace('+', ' ');
	}
	
	//get specified db or default if error
	loadDb = new Promise((resolve, reject)=>
	{
			data = new sqlite.Database(db_path, sqlite.OPEN_READONLY, e=>{if(e) reject(); resolve();});
	});
	loadDb.then(readDb, e=>
	{
		func.writeMsg('Path unresolved or not provided. Default database used.');
		(new Promise((resolve, reject)=>
		{
			data = new sqlite.Database(DB_DEFAULT_FILE, sqlite.OPEN_READONLY,  e=>{if(e) reject(); resolve();});
		})).then(readDb, func.errLogger);
	});
	
	function readDb()
	{
		//define query promises
		sql_apps = new Promise((resolve, reject)=>
		{
				data.get(c.SQL_COUNTAPPS, c.NOT_USED, (err, result)=>
				{
					if(err) reject();
					tot_applicants = result.total;
					resolve();
				});
		});
		sql_skills = new Promise((resolve, reject)=>
		{
				data.get(c.SQL_COUNTSKILLS, c.NOT_USED, (err, result)=>
						{
							if(err) reject();
							tot_skills = result.total;
							resolve();
						});
		});
		sql_join = new Promise((resolve, reject)=>
		{
				data.each(c.SQL_JOINALL, c.NOT_USED, func.insertRow, resolve);
		});
	
		Promise.all([sql_apps, sql_skills, sql_join]).then(respond, func.errorLogger);
	}
	
	function respond()
	{
		func.combineCols();
		func.addSummary(tot_applicants, tot_skills);
		response.statusCode = c.STATUS_OK;
		response.setHeader('Content-type','text/html');
		response.write(func.writeDocument());
		response.end();
		//reset for possible page refresh
		func.resetDoc();
	}
}).listen(c.PORT);