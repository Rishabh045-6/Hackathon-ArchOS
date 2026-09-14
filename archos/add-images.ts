import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Dashboard Image
const dashboardHeaderOld = `<h1 className="text-[28px] lg:text-[32px] font-medium text-[#1A1918] leading-tight mb-1.5"
          style={{ fontFamily: "'Instrument Serif', serif" }}>
          {greeting}, {user?.name || 'Demo Admin'}
        </h1>
        <p className="text-[14px] text-[#9E9A95]">Here's what's happening across your workspace.</p>`;

const dashboardHeaderNew = `<div className="w-full h-[180px] md:h-[220px] mb-8 overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">
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

if (!code.includes(dashboardHeaderNew)) {
  code = code.split(dashboardHeaderOld).join(dashboardHeaderNew);
  // Also remove the outer div wrapper for the old header to keep it clean
  code = code.replace(
    '        <div>\n' + dashboardHeaderNew + '\n        </div>',
    '        ' + dashboardHeaderNew
  );
}

// 2. ProjectDetail Image
const projectDetailOld = `<Breadcrumb items={[{ label: 'Projects', target: 'projects' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />
  
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[30px] lg:text-[34px] font-medium text-[#1A1918] leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>
            <div className="text-[15px] text-[#9E9A95] mt-1">ABC Interiors</div>
            <div className="mt-2.5"><StatusBadge label="Planning" /></div>
          </div>
          <button className="border border-[#E5E1D9] text-[#706B65] px-4 py-2 text-[12px] font-medium hover:border-[#C8C0B5] transition-colors shrink-0">
            Edit Project
          </button>
        </div>`;

const projectDetailNew = `<Breadcrumb items={[{ label: 'Projects', target: 'projects' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />

        <div className="w-full h-[220px] md:h-[280px] my-6 overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-95 mix-blend-multiply" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="text-white">
              <div className="text-[11px] font-semibold tracking-widest uppercase mb-1.5 text-white/70">ABC Interiors</div>
              <h1 className="text-[32px] lg:text-[40px] font-medium leading-none mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>
              <StatusBadge label="Planning" />
            </div>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-[12px] font-medium hover:bg-white/20 transition-colors shrink-0 rounded-sm">
              Edit Project
            </button>
          </div>
        </div>`;

code = code.split(projectDetailOld).join(projectDetailNew);

// 3. CRMDetail Image
const crmDetailOld = `<Breadcrumb items={[{ label: 'CRM', target: 'crm' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />
  
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[30px] lg:text-[34px] font-medium text-[#1A1918] leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>
            <div className="text-[15px] text-[#9E9A95] mt-1">ABC Interiors</div>
          </div>
          {!wonState && (
            <button onClick={handleWon}
              className="bg-[#2E6A42] text-white px-5 py-2 text-[13px] font-semibold hover:bg-[#235534] transition-colors shrink-0 shadow-sm">
              Mark as Won
            </button>
          )}
        </div>`;

const crmDetailNew = `<Breadcrumb items={[{ label: 'CRM', target: 'crm' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />

        <div className="w-full h-[220px] md:h-[280px] my-6 overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-95 mix-blend-multiply" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="text-white">
              <div className="text-[11px] font-semibold tracking-widest uppercase mb-1.5 text-white/70">ABC Interiors</div>
              <h1 className="text-[32px] lg:text-[40px] font-medium leading-none mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>
              {wonState && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E9F3EC] text-[#2E6A42] uppercase tracking-wider">Closed Won</span>}
            </div>
            {!wonState && (
              <button onClick={handleWon}
                className="bg-[#2E6A42] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#235534] transition-colors shrink-0 shadow-md rounded-sm">
                Mark as Won
              </button>
            )}
          </div>
        </div>`;

code = code.split(crmDetailOld).join(crmDetailNew);

fs.writeFileSync(file, code);
console.log('Added hero images!');
