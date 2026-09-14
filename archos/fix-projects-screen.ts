import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldSig = `function ProjectsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {`;
const newSig = `function ProjectsScreen({ onNavigate, serverState }: { onNavigate: (s: Screen) => void; serverState?: any }) {`;
code = code.replace(oldSig, newSig);

const oldList = `{PROJECTS_LIST.map(p => {
            const pct = Math.round((p.spent / p.budget) * 100)`;

const newList = `{(serverState?.projects && serverState.projects.length > 0 ? serverState.projects.map((p: any) => ({
            name: p.name,
            client: 'Client',
            status: p.status === 'ACTIVE' ? 'Active' : 'Planning',
            budget: p.budget,
            spent: 0,
            tasks: 0,
            done: 0,
            highlight: true
          })) : []).map((p: any) => {
            const pct = p.budget ? Math.round((p.spent / p.budget) * 100) : 0`;

code = code.replace(oldList, newList);

code = code.replace(
  `case 'projects': return <ProjectsScreen onNavigate={navigate} />`,
  `case 'projects': return <ProjectsScreen onNavigate={navigate} serverState={serverState} />`
);

fs.writeFileSync(file, code);
console.log('ProjectsScreen fixed to use real DB data');
