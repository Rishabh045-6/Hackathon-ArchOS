import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const accountsHeaderNew = `      <div className="p-6 lg:p-8 space-y-6 max-w-[900px]">
        
        <div className="w-full h-[140px] md:h-[180px] mb-6 overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-80" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154526-990dced4ea0d?q=80&w=2000&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-y-0 left-6 flex flex-col justify-center text-white">
            <h1 className="text-[28px] lg:text-[36px] font-medium leading-tight mb-1 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Financials & Accounts
            </h1>
            <p className="text-[13px] opacity-80">Track project expenses and manage profitability.</p>
          </div>
          <div className="absolute bottom-6 right-6">
            <button onClick={() => setAddOpen(true)} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-[12px] font-medium hover:bg-white/20 transition-colors shrink-0 rounded-sm shadow-sm">
              + Log Expense
            </button>
          </div>
        </div>`;

code = code.replace(
  /<div className="p-6 lg:p-8 space-y-6 max-w-\[900px\]">\s*<PageHeader eyebrow="Accounts" title="Track project finances"\s*action={<button onClick={\(\) => setAddOpen\(true\)} className="bg-\[#1A1918\] text-white px-4 py-2 text-\[12px\] font-semibold hover:bg-\[#2D2B29\] transition-colors">\+ Log Expense<\/button>} \/>/,
  accountsHeaderNew
);

fs.writeFileSync(file, code);
console.log('Fixed Accounts header replacement');
