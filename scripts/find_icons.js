const fs = require('fs');
const path = require('path');

const iconsPath = path.join(__dirname, '../node_modules/@iconify-json/logos/icons.json');
const raw = fs.readFileSync(iconsPath, 'utf-8');
const data = JSON.parse(raw);

console.log('Root keys:', Object.keys(data));
if (data.width) console.log('Global width:', data.width);
if (data.height) console.log('Global height:', data.height);

const targets = [
  'microsoft-windows-icon', 'apple', 'android-icon', 'linux-tux',
  'chrome', 'safari', 'firefox', 'microsoft-edge', 'ubuntu'
];

const found = {};

targets.forEach(t => {
  let iconData = null;
  let originalKey = null;

  if (data.icons[t]) {
    iconData = data.icons[t];
    originalKey = t;
  } else {
    const keys = Object.keys(data.icons).filter(k => k.includes(t));
    const exactish = keys.find(k => k === t);
    const bestKey = exactish || keys[0];
    if (bestKey && data.icons[bestKey]) {
      iconData = data.icons[bestKey];
      originalKey = bestKey;
    }
  }

  if (iconData) {
    // Merge global dimensions if missing in icon
    found[t] = {
      ...iconData,
      width: iconData.width || data.width,
      height: iconData.height || data.height,
      _originalKey: originalKey
    };
  }
});

console.log('Found icons count:', Object.keys(found).length);
fs.writeFileSync('found_icons.json', JSON.stringify(found, null, 2));
console.log('Done');
