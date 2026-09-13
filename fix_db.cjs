const fs = require('fs');
let content = fs.readFileSync('data/database.json', 'utf8');
let data = JSON.parse(content);
if (data.social_jobs_config) {
  let gmail = data.social_jobs_config.find(c => c.service === 'gmail');
  if (gmail) gmail.tutorialUrl = 'https://www.youtube.com/watch?v=zxEo8GfEG-c';
  
  let fb = data.social_jobs_config.find(c => c.service === 'facebook');
  if (fb && fb.tutorialUrl === 'https://www.youtube.com/watch?v=zxEo8GfEG-c') fb.tutorialUrl = '';
  
  let ig = data.social_jobs_config.find(c => c.service === 'instagram');
  if (ig && ig.tutorialUrl === 'https://www.youtube.com/watch?v=zxEo8GfEG-c') ig.tutorialUrl = '';
}
fs.writeFileSync('data/database.json', JSON.stringify(data, null, 2), 'utf8');
