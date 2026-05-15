const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace backgrounds
  content = content.replace(/backgroundColor:\s*['"]#f5f5f5['"]/g, "backgroundColor: '#f6f1ec'");
  content = content.replace(/backgroundColor:\s*['"]#ffffff['"]/g, "backgroundColor: '#fcfaf8'");
  content = content.replace(/backgroundColor:\s*['"]#fff['"]/g, "backgroundColor: '#fcfaf8'");
  content = content.replace(/backgroundColor:\s*['"]#007AFF['"]/g, "backgroundColor: '#e6dac3'");
  
  // Replace text colors
  content = content.replace(/color:\s*['"]#333333['"]/g, "color: '#1d1d1b'");
  content = content.replace(/color:\s*['"]#333['"]/g, "color: '#1d1d1b'");
  content = content.replace(/color:\s*['"]#666666['"]/g, "color: '#68645e'");
  content = content.replace(/color:\s*['"]#666['"]/g, "color: '#68645e'");
  content = content.replace(/color:\s*['"]#999999['"]/g, "color: '#949089'");
  content = content.replace(/color:\s*['"]#999['"]/g, "color: '#949089'");
  content = content.replace(/color:\s*['"]#007AFF['"]/g, "color: '#3a3532'");
  content = content.replace(/color:\s*['"]#000000['"]/g, "color: '#1d1d1b'");
  content = content.replace(/color:\s*['"]#000['"]/g, "color: '#1d1d1b'");
  content = content.replace(/color:\s*['"]#fff['"]/g, "color: '#1d1d1b'"); // FMDashboard header text
  
  // Replace border colors
  content = content.replace(/borderColor:\s*['"]#E8E8E8['"]/g, "borderColor: '#e6dac3'");
  content = content.replace(/borderColor:\s*['"]#ddd['"]/g, "borderColor: '#e6dac3'");
  content = content.replace(/borderColor:\s*['"]#ccc['"]/g, "borderColor: '#e6dac3'");
  content = content.replace(/borderBottomColor:\s*['"]#E8E8E8['"]/g, "borderBottomColor: '#e6dac3'");
  content = content.replace(/borderBottomColor:\s*['"]#f0f0f0['"]/g, "borderBottomColor: '#e6dac3'");
  content = content.replace(/borderTopColor:\s*['"]#e0e0e0['"]/g, "borderTopColor: '#e6dac3'");
  content = content.replace(/borderTopColor:\s*['"]#E8E8E8['"]/g, "borderTopColor: '#e6dac3'");

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      walk(file);
    } else if (file.endsWith('.js')) {
      replaceInFile(file);
    }
  });
}

walk('./mobile/src/screens');
