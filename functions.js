var c = require('./constants.js'),
	{JSDOM} = require('jsdom'),
	dom = new JSDOM(c.HTML_TEXT),
	{document} = dom.window;
	tableBody = document.getElementsByTagName('tbody')[0];

exports.writeDocument = writeDocument;
exports.resetDoc = resetDoc;
exports.insertRow = insertRow;
exports.combineCols = combineCols;
exports.addSummary = addSummary;
exports.writeMsg = writeMsg;
exports.errorLogger = errorLogger;


function writeDocument()
{
	return dom.serialize();
}

function resetDoc()
{
	tableBody.innerHTML = '';
	document.getElementById('message').innerHTML = '';
}

function insertRow(err, row)
{
	if(err)
	{
		errorLogger(err);
		return;
	}
	
	var tableRow, add;
	
	tableRow = document.createElement('tr');
	
	add = val=>{createCell(tableRow, val);}
	
	add(row.jobs_name);
	add(row.applicant_name);
	add(linkTo(row.email, true));
	add(linkTo(row.website));
	add(row.skill_name);
	add(row.cover_letter);
	
	tableBody.appendChild(tableRow);
}

function createCell(container, value)
{
	if(typeof value === 'undefined') value = '---';
	var cell = document.createElement('td');
	cell.innerHTML = value;
	container.appendChild(cell);
}

function linkTo(text, isEmail)
{
	//don't link null/undefined
	if(!text) return text;
	var a = document.createElement('a');
	a.href = (isEmail? 'mailto:' : 'http://') + text;
	a.innerHTML = text;
	return a.outerHTML;
}

function combineCols()
{
	//a number of assumptions go into this method, mostly that identical text indicates references are identical (i.e., only one person in db named "Robert Jones")
	//at least, so long as they are adjacent. Considering the task at hand, I think it is an ok solution. A more serious need would merit a more robust approach
	var firstRow, homeCell, rows = tableBody.querySelectorAll('tr');
	for(var col=0; col<c.TOTCOLS; col++)
	{
		//don't combine skills (hack-y way of doing it, see comment above)
		if (col === c.SKILL_COL) continue;
		for(var row of rows) //for...of avoids meta properties like length
		{
			if(firstRow)
			{
				if(row.children[col].innerHTML === firstRow.children[col].innerHTML)
				{
					row.children[col].setAttribute(c.MARK_TO_DELETE, c.MARK_TO_DELETE);
					homeCell = firstRow.children[col];
					homeCell.setAttribute('rowspan', Number(homeCell.getAttribute('rowspan'))+1);
				}
				else
					firstRow = row;
			}
			else
				firstRow = row;
		}
	}
	
	//all spanning elements started without anything then were increased to 1, which is still not spanning
	//so all cells with a rowspan need to be increased by 1
	for(var homeCell of document.querySelectorAll(`[rowspan]`))
	{
		homeCell.setAttribute('rowspan', Number(homeCell.getAttribute('rowspan'))+1);
	}
	
	for(var markedElem of document.querySelectorAll(`[${c.MARK_TO_DELETE}]`))
	{
		markedElem.parentNode.removeChild(markedElem);
	}
}

function addSummary(numAppl, numSkills)
{
	var summary = document.createElement('tr');
	
	createCell(summary, `${numAppl} Applicants, ${numSkills} Unique Skills`);
	summary.firstChild.setAttribute('colspan', c.TOTCOLS);
	tableBody.appendChild(summary);
}

function writeMsg(msg)
{
	document.getElementById('message').innerHTML = msg;
}

function errorLogger(err)
{
	//some callbacks call with null argument if successful, must test for error
	if(err) console.log(err);
}