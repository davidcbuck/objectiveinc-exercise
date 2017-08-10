exports.STATUS_OK = 200;
exports.PORT = 80;
exports.NOT_USED = [];
exports.TOTCOLS = 6;
exports.SKILL_COL = 4;
exports.MARK_TO_DELETE = 'deleteme'; //This value must be lower case! Attributes are set to lower when assigned. Actual value arbitrary
exports.HTML_TEXT = `<!DOCTYPE html>
						<div>
							<form action=".">
								<label>database path</label>
								<input name="path">
								<button type="submit">Summarize data</button>
							</form>
						</div>
						<div id="message"></div>
						<table>
							<thead>
								<tr>
									<th>Job</th>
									<th>Applicant Name</th>
									<th>Email Address</th>
									<th>Website</th>
									<th>Skills</th>
									<th>Cover Letter Paragraph</th>
								</tr>
							</thead>
							<tbody></tbody>
						</table>`;
//Queries
//Join all tables together for data aggregate; select distinct in case 1+ of tables has redundant tuples 
exports.SQL_JOINALL =  `SELECT DISTINCT jobs.name AS jobs_name, applicants.name AS applicant_name, skills.name AS skill_name, email, website, cover_letter 
						FROM (jobs
							JOIN (applicants
								JOIN skills
								ON applicant_id=applicants.id)
							ON jobs.id=job_id)
						ORDER BY jobs_name; applicant_name;`;
//counting for summary row
exports.SQL_COUNTAPPS = 'SELECT COUNT(*) AS total FROM applicants';
exports.SQL_COUNTSKILLS = 'SELECT COUNT(DISTINCT name) AS total FROM skills;';