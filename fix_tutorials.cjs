const fs = require('fs');
let content = fs.readFileSync('server/api.ts', 'utf8');

// The file has a DEFAULT_SOCIAL_CONFIG object. I will just replace the specific matches using a regex or simple split.
// Easier way: string replace for facebook and instagram blocks.
let fbIndex = content.indexOf("facebook: {");
let igIndex = content.indexOf("instagram: {");

let pt1 = content.substring(0, fbIndex);
let pt2 = content.substring(fbIndex, igIndex);
let pt3 = content.substring(igIndex);

pt2 = pt2.replace("tutorialUrl: 'https://www.youtube.com/watch?v=zxEo8GfEG-c'", "tutorialUrl: ''");
pt3 = pt3.replace("tutorialUrl: 'https://www.youtube.com/watch?v=zxEo8GfEG-c'", "tutorialUrl: ''");

fs.writeFileSync('server/api.ts', pt1 + pt2 + pt3, 'utf8');
