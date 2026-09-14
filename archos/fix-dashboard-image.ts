import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const dashboardHeaderNew = `        <div className="w-full h-[180px] md:h-[220px] mb-8 overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-95" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-[28px] lg:text-[36px] font-medium leading-tight mb-1 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              {greeting}, {user?.name || 'Demo Admin'}
            </h1>
            <p className="text-[13px] opacity-80">Here's what's happening across your workspace.</p>
          </div>
        </div>`;

code = code.replace(
  /<div>\s*<h1 className="text-\[28px\] lg:text-\[32px\] font-medium text-\[#1A1918\] leading-tight mb-1\.5"\s*style={{ fontFamily: "'Instrument Serif', serif" }}>\s*\{greeting\}, \{user\?\.name \|\| 'Demo Admin'\}\s*<\/h1>\s*<p className="text-\[14px\] text-\[#9E9A95\]">Here's what's happening across your workspace\.<\/p>\s*<\/div>/,
  dashboardHeaderNew
);

fs.writeFileSync(file, code);
console.log('Fixed Dashboard header replacement');
