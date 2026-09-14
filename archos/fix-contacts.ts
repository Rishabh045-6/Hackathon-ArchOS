import fs from 'fs';

const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update ContactsScreen signature
code = code.replace(
  'function ContactsScreen({ onNavigate, expenses }: { onNavigate: (s: Screen) => void; expenses: Expense[] }) {',
  'function ContactsScreen({ onNavigate, expenses, user }: { onNavigate: (s: Screen) => void; expenses: Expense[]; user?: any }) {'
);

// Pass user to ContactsScreen in App switch
code = code.replace(
  '<ContactsScreen onNavigate={navigate} expenses={expenses} />',
  '<ContactsScreen onNavigate={navigate} expenses={expenses} user={serverState?.user} />'
);

fs.writeFileSync(file, code);
console.log('Fixed ContactsScreen');
