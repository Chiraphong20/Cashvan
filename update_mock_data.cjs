const fs = require('fs');
const path = require('path');

try {
  const dataPath = path.join(__dirname, 'korat_zones.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const mockPath = path.join(__dirname, 'src', 'store', 'mockData.ts');
  let content = fs.readFileSync(mockPath, 'utf8');

  // Convert to JS object format
  const districtsString = JSON.stringify(data.districts, null, 2).replace(/"/g, "'");
  const tambonsString = JSON.stringify(data.subDistricts, null, 2).replace(/"/g, "'");

  const districtsReplacement = 'export const mockDistricts: Zone[] = ' + districtsString + ';';
  const tambonsReplacement = 'export const mockSubDistricts: Zone[] = ' + tambonsString + ';';

  content = content.replace(/export const mockDistricts: Zone\[\] = \[[\s\S]*?\];/m, districtsReplacement);
  content = content.replace(/export const mockSubDistricts: Zone\[\] = \[[\s\S]*?\];/m, tambonsReplacement);

  fs.writeFileSync(mockPath, content);
  console.log('Replaced in mockData.ts');
} catch (e) {
  console.error(e);
}
