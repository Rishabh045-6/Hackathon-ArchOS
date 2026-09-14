import fs from 'fs';
const file = 'src/app/login/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix the parent container
code = code.replace(
  /<div className="flex bg-white" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif", minHeight: 'calc\\(100vh \/ 0\\.80\\)' }}>/,
  '<div className="flex bg-white min-h-screen" style={{ fontFamily: "\\'Inter\\', \\'DM Sans\\', sans-serif" }}>'
);

// Fix left panel width
code = code.replace(
  '<div className="w-full lg:w-1/2 flex flex-col px-8 lg:px-24 py-12 h-full justify-between">',
  '<div className="w-full md:w-[480px] shrink-0 flex flex-col px-8 lg:px-16 py-12 h-full justify-between">'
);

// Fix right panel visibility and flex
code = code.replace(
  '<div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#EAE8E3]">',
  '<div className="hidden md:block flex-1 relative overflow-hidden bg-[#EAE8E3] min-h-screen">'
);

fs.writeFileSync(file, code);
console.log('Fixed login page layout for smaller screens');
