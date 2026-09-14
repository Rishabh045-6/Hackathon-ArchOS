import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '        onClose={() => setSidebarOpen(false)} />',
  '        onClose={() => setSidebarOpen(false)} user={serverState?.user} />'
);

code = code.replace(
  '          onMenuClick={() => setSidebarOpen(true)} />',
  '          onMenuClick={() => setSidebarOpen(true)} user={serverState?.user} />'
);

fs.writeFileSync(file, code);
console.log('Done');
