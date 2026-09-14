import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const badStateInit = "const [org, setOrg] = useState<OrgId>((serverState?.userOrganizations?.some((uo: any) => uo.organization.id === 'org_acme') ? 'acme' : serverState?.userOrganizations?.some((uo: any) => uo.organization.id === 'org_small') ? 'small' : 'acme'))";
const goodStateInit = "const [org, setOrg] = useState<OrgId>(serverState?.user?.organizationId === 'org_small' ? 'small' : 'acme')";

code = code.replace(badStateInit, goodStateInit);

fs.writeFileSync(file, code);
console.log('Fixed org state init');
