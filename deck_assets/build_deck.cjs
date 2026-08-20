const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Prashant';
pptx.subject = 'Nexus BlockBank hackathon pitch deck';
pptx.title = 'Nexus BlockBank — Trust Every Action';
pptx.company = 'Nexus BlockBank';
pptx.lang = 'en-IN';
pptx.theme = {
  headFontFace: 'Georgia',
  bodyFontFace: 'Aptos',
  lang: 'en-IN'
};
pptx.defineSlideMaster({
  title: 'NEWS',
  background: { color: 'F4EFE3' },
  objects: []
});

const C = {
  paper: 'F4EFE3', ink: '171712', red: 'D84A38', navy: '0E2236', mustard: 'E6B93F',
  green: '2E7D5B', greenPale: 'DDEAE1', blue: '2D5FA6', bluePale: 'DCE7F5',
  purple: '6D28D9', purplePale: 'EDE4FA', gray: '625F59', white: 'FFFFFF',
  line: '1D1D18', soft: 'EAE4D7', danger: 'B93B2D', dangerPale: 'F3DCD7'
};

const A = path.resolve(__dirname);
const IMG = {
  clientLogin: path.join(A, 'screens', 'client-login.png'),
  clientDash: path.join(A, 'screens', 'client-dashboard.png'),
  adminLogin: path.join(A, 'screens', 'admin-login.png'),
  adminDash: path.join(A, 'screens', 'admin-dashboard.png')
};

function txt(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h, margin: 0,
    fontFace: opts.fontFace || 'Aptos',
    fontSize: opts.fontSize || 12,
    color: opts.color || C.ink,
    bold: opts.bold || false,
    italic: opts.italic || false,
    align: opts.align || 'left',
    valign: opts.valign || 'mid',
    breakLine: false,
    fit: 'shrink',
    paraSpaceAfterPt: 0,
    ...opts
  });
}

function box(slide, x, y, w, h, fill = C.white, line = C.line, radius = 0) {
  slide.addShape(radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
    x, y, w, h, rectRadius: radius,
    fill: { color: fill }, line: { color: line, width: 1 }
  });
}

function rule(slide, x, y, w, color = C.line, width = 1.2) {
  slide.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color, width } });
}

function header(slide, section, page) {
  txt(slide, 'THE TRUST LEDGER', 0.5, 0.12, 2.0, 0.18, { fontFace: 'Courier New', fontSize: 7, bold: true });
  txt(slide, section.toUpperCase(), 4.45, 0.12, 4.45, 0.18, { fontSize: 7, bold: true, color: C.red, align: 'center' });
  txt(slide, `NEXUS BLOCKBANK   /   PAGE ${String(page).padStart(2, '0')}`, 10.2, 0.12, 2.65, 0.18, { fontFace: 'Courier New', fontSize: 6.5, color: C.gray, align: 'right' });
  rule(slide, 0.5, 0.48, 12.35, C.line, 1.1);
}

function tag(slide, text, x, y, w = 1.85, color = C.red) {
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.26, fill: { color }, line: { color } });
  txt(slide, text.toUpperCase(), x, y + 0.01, w, 0.22, { fontSize: 7, color: C.white, bold: true, align: 'center' });
}

function headline(slide, text, x, y, w, h, size = 27) {
  txt(slide, text, x, y, w, h, { fontFace: 'Georgia', fontSize: size, bold: true, valign: 'top', breakLine: true });
}

function imageFrame(slide, imagePath, x, y, w, h, border = C.line) {
  slide.addImage({ path: imagePath, x, y, w, h });
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: 'FFFFFF', transparency: 100 }, line: { color: border, width: 1 } });
}

function metric(slide, value, label, x, y, w, fill, color) {
  box(slide, x, y, w, 1.05, fill, C.line);
  txt(slide, value, x + 0.18, y + 0.14, w - 0.36, 0.38, { fontFace: 'Georgia', fontSize: 22, bold: true, color });
  rule(slide, x + 0.18, y + 0.6, w - 0.36, color, 2);
  txt(slide, label.toUpperCase(), x + 0.18, y + 0.69, w - 0.36, 0.24, { fontSize: 7.5, bold: true, valign: 'top' });
}

function footer(slide, text) {
  txt(slide, text, 0.5, 7.16, 12.35, 0.16, { fontFace: 'Courier New', fontSize: 6.3, color: C.gray, align: 'right' });
}

// 01 — Cover
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Front Page / Trust Infrastructure', 1);
  tag(s, 'Special Edition', 0.5, 0.67, 1.8);
  headline(s, 'Banking that knows\nthe human, not just\nthe password.', 0.5, 1.18, 5.75, 1.78, 29);
  rule(s, 0.5, 3.72, 6.25, C.line, 2.2);
  txt(s, 'Nexus BlockBank adds a continuous trust layer to everyday banking—so sensitive actions are checked, explained and recorded in real time.', 0.5, 3.94, 6.25, 0.72, { fontSize: 13.2, valign: 'top', breakLine: true });
  imageFrame(s, IMG.clientDash, 7.05, 0.82, 5.8, 3.58);
  box(s, 7.35, 3.88, 4.98, 0.32, C.mustard, C.line);
  txt(s, 'REAL MVP SCREEN  /  CUSTOMER PORTAL  /  PORT 3000', 7.46, 3.92, 4.74, 0.18, { fontFace: 'Courier New', fontSize: 6.6, bold: true });
  metric(s, '<15 ms', 'Repository demo target for trust evaluation', 0.5, 5.35, 2.7, C.bluePale, C.blue);
  metric(s, '4 / 4', 'Automated test suites passed locally', 3.38, 5.35, 2.7, C.greenPale, C.green);
  box(s, 6.26, 5.35, 6.59, 1.05, C.white, C.line);
  txt(s, '■  INSIDE', 6.47, 5.55, 1.1, 0.17, { fontSize: 7.3, bold: true, color: C.red });
  txt(s, 'Live trust scores. Step-up controls. Dual-portal governance. Proofs for every critical action.', 6.47, 5.83, 5.95, 0.38, { fontSize: 11.5, bold: true, valign: 'top' });
  footer(s, 'PRASHANT  /  PROJECT LEAD & CORE DEVELOPER');
}

// 02 — Problem
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Problem Statement / Why Now', 2);
  tag(s, 'Problem Statement', 0.5, 0.67, 2.15);
  headline(s, 'A valid login can still become\na dangerous banking session.', 0.5, 1.08, 8.05, 0.95, 26);
  box(s, 9.1, 0.86, 3.75, 1.15, C.dangerPale, C.danger);
  txt(s, 'THE RISK BEGINS\nAFTER LOGIN.', 9.35, 1.02, 3.25, 0.78, { fontFace: 'Georgia', fontSize: 20, bold: true, color: C.danger, valign: 'top' });

  const cards = [
    ['01', 'LOGIN ≠ TRUST', 'Passwords and one-time checks cannot judge every transfer, device change or high-risk action.'],
    ['02', 'SILOED CONTROLS', 'Customer banking, fraud review and regulator oversight often live in separate tools.'],
    ['03', 'WEAK EVIDENCE', 'A blocked action without clear reasons creates disputes, slow reviews and audit friction.']
  ];
  cards.forEach((c, i) => {
    const x = 0.5 + i * 4.12;
    box(s, x, 2.42, 3.82, 2.0, i === 1 ? C.bluePale : C.white, C.line);
    txt(s, c[0], x + 0.2, 2.58, 0.45, 0.32, { fontFace: 'Georgia', fontSize: 17, bold: true, color: i === 1 ? C.blue : C.red });
    txt(s, c[1], x + 0.75, 2.59, 2.77, 0.25, { fontSize: 10, bold: true });
    rule(s, x + 0.2, 3.01, 3.42, i === 1 ? C.blue : C.red, 2);
    txt(s, c[2], x + 0.2, 3.2, 3.42, 0.9, { fontSize: 10.5, valign: 'top', breakLine: true });
  });

  txt(s, 'IMPACT CHAIN', 0.5, 4.78, 1.3, 0.2, { fontSize: 8, bold: true, color: C.red });
  const chain = [
    ['STOLEN OR SHIFTING SESSION', C.dangerPale, C.danger],
    ['UNUSUAL ACTION LOOKS VALID', C.soft, C.ink],
    ['FRAUD OR FALSE BLOCK', C.bluePale, C.blue],
    ['LOSS + AUDIT BURDEN', C.greenPale, C.green]
  ];
  chain.forEach((c, i) => {
    const x = 0.5 + i * 3.12;
    box(s, x, 5.12, 2.58, 0.82, c[1], C.line);
    txt(s, c[0], x + 0.18, 5.31, 2.22, 0.38, { fontSize: 8.5, bold: true, align: 'center', color: c[2] });
    if (i < 3) txt(s, '→', x + 2.67, 5.28, 0.25, 0.32, { fontSize: 18, bold: true, align: 'center' });
  });
  box(s, 0.5, 6.26, 12.35, 0.55, C.ink, C.ink);
  txt(s, 'THE REAL QUESTION:  DOES THIS ACTION STILL LOOK SAFE—RIGHT NOW?', 0.8, 6.4, 11.75, 0.22, { fontFace: 'Courier New', fontSize: 9.5, bold: true, color: C.paper, align: 'center' });
}

// 03 — Solution
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Solution / Continuous Trust', 3);
  tag(s, 'Solution', 0.5, 0.67, 1.35);
  headline(s, 'One trust decision for every sensitive action.', 0.5, 1.06, 9.0, 0.58, 26);
  txt(s, 'Nexus BlockBank quietly reads context, scores risk, takes the least disruptive action and leaves an explainable proof.', 0.5, 1.72, 10.8, 0.48, { fontSize: 12.5, valign: 'top' });

  const nodes = [
    { x: 0.5, w: 2.45, fill: C.bluePale, title: '1  READ SIGNALS', body: 'Behavior 35%\nDevice 35%\nContext 30%', color: C.blue },
    { x: 3.35, w: 2.45, fill: C.greenPale, title: '2  SCORE TRUST', body: '0–100 live score\nReason codes\nSession-aware', color: C.green },
    { x: 6.2, w: 2.55, fill: C.soft, title: '3  CHOOSE ACTION', body: 'Allow\nStep-up\nRestrict / revoke', color: C.red },
    { x: 9.15, w: 3.7, fill: C.purplePale, title: '4  RECORD PROOF', body: 'Audit event + SHA-256 proof hash + transaction metadata', color: C.purple }
  ];
  nodes.forEach((n, i) => {
    box(s, n.x, 2.48, n.w, 2.25, n.fill, C.line);
    txt(s, n.title, n.x + 0.18, 2.68, n.w - 0.36, 0.28, { fontSize: 9.5, bold: true, color: n.color });
    rule(s, n.x + 0.18, 3.11, n.w - 0.36, n.color, 2.1);
    txt(s, n.body, n.x + 0.18, 3.32, n.w - 0.36, 1.05, { fontFace: i === 0 ? 'Georgia' : 'Aptos', fontSize: i === 0 ? 15 : 12, bold: i === 0, valign: 'top', breakLine: true });
    if (i < nodes.length - 1) txt(s, '→', n.x + n.w + 0.1, 3.35, 0.3, 0.34, { fontSize: 19, bold: true, align: 'center' });
  });

  box(s, 0.5, 5.12, 12.35, 1.24, C.white, C.line);
  txt(s, 'THE DIFFERENTIATOR', 0.75, 5.36, 2.0, 0.22, { fontSize: 8, bold: true, color: C.red });
  txt(s, 'Authentication is no longer an entry gate. It becomes a continuous, evidence-based conversation with every banking action.', 2.75, 5.26, 9.55, 0.46, { fontFace: 'Georgia', fontSize: 16.5, bold: true, valign: 'top' });
  box(s, 0.75, 5.83, 2.0, 0.26, C.mustard, C.line);
  txt(s, 'LOW FRICTION FOR GENUINE USERS', 0.82, 5.87, 1.86, 0.14, { fontFace: 'Courier New', fontSize: 5.8, bold: true, align: 'center' });
  footer(s, 'CONTINUOUS TRUST  /  EXPLAINABLE ACTION  /  AUDITABLE PROOF');
}

// 04 — Customer experience
{
  const s = pptx.addSlide('NEWS');
  header(s, 'MVP / Customer Experience', 4);
  tag(s, 'Working Prototype', 0.5, 0.67, 2.05, C.green);
  headline(s, 'The trust layer stays quiet—\nuntil risk appears.', 0.5, 1.07, 4.45, 1.05, 24);
  txt(s, 'A familiar banking dashboard covers money movement, identity and proof without forcing users into a separate security tool.', 0.5, 2.32, 4.25, 0.62, { fontSize: 11.3, valign: 'top' });

  const mini = [
    ['EVERYDAY BANKING', 'Accounts · UPI · cards · loans'],
    ['IDENTITY', 'ZK-KYC vault · profile verification'],
    ['TRANSPARENCY', 'Trust badge · immutable audit logs']
  ];
  mini.forEach((m, i) => {
    const y = 3.2 + i * 0.95;
    box(s, 0.5, y, 4.15, 0.72, i === 1 ? C.bluePale : C.white, C.line);
    txt(s, m[0], 0.72, y + 0.13, 1.47, 0.18, { fontSize: 7.6, bold: true, color: i === 1 ? C.blue : C.red });
    txt(s, m[1], 2.08, y + 0.11, 2.3, 0.34, { fontSize: 9.5, bold: true });
  });

  imageFrame(s, IMG.clientDash, 4.96, 0.82, 7.89, 4.93);
  box(s, 5.26, 5.36, 7.02, 0.34, C.mustard, C.line);
  txt(s, 'REAL SCREENSHOT  /  CLIENT PORTAL  /  PORT 3000', 5.38, 5.43, 6.78, 0.16, { fontFace: 'Courier New', fontSize: 7, bold: true });
  box(s, 0.5, 6.3, 12.35, 0.5, C.ink, C.ink);
  txt(s, 'WHEN RISK RISES: STEP-UP VERIFICATION APPEARS. WHEN TRUST RETURNS: BANKING CONTINUES.', 0.72, 6.43, 11.9, 0.18, { fontFace: 'Courier New', fontSize: 8, bold: true, color: C.paper, align: 'center' });
}

// 05 — Decision engine
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Technology / Decision Logic', 5);
  tag(s, 'Trust Engine', 0.5, 0.67, 1.65, C.blue);
  headline(s, 'Three signals. Four safe outcomes.', 0.5, 1.07, 7.4, 0.56, 26);
  txt(s, 'The rules are intentionally simple enough to explain to a customer, investigator or regulator.', 0.5, 1.72, 9.6, 0.34, { fontSize: 12 });

  const thresholds = [
    ['80–100', 'ALLOW', 'Low risk', 'Known device + strong signals', C.greenPale, C.green],
    ['50–79.9', 'STEP UP', 'Medium risk', 'Ask for extra proof', C.bluePale, C.blue],
    ['0–49.9', 'RESTRICT', 'High risk', 'Pause the sensitive action', C.dangerPale, C.danger],
    ['REVOKED', 'REVOKE', 'Admin override', 'Freeze access immediately', C.purplePale, C.purple]
  ];
  thresholds.forEach((t, i) => {
    const y = 2.42 + i * 0.89;
    box(s, 0.5, y, 7.72, 0.7, t[4], C.line);
    txt(s, t[0], 0.72, y + 0.14, 1.05, 0.25, { fontFace: 'Georgia', fontSize: i === 3 ? 10.5 : 15, bold: true, color: t[5] });
    txt(s, t[1], 2.0, y + 0.16, 1.28, 0.22, { fontSize: 9.5, bold: true, color: t[5] });
    txt(s, t[2], 3.38, y + 0.16, 1.42, 0.22, { fontSize: 9.5, bold: true });
    txt(s, t[3], 5.0, y + 0.14, 2.85, 0.28, { fontSize: 9.5, align: 'right' });
  });

  box(s, 8.6, 2.42, 4.25, 3.37, C.white, C.line);
  txt(s, 'WHAT THE ENGINE EXPLAINS', 8.86, 2.7, 3.73, 0.22, { fontSize: 8, bold: true, color: C.red });
  rule(s, 8.86, 3.09, 3.73, C.red, 2);
  const reasons = ['KNOWN ATTESTED DEVICE', 'UNUSUAL IP OR TIME', 'ANOMALOUS BEHAVIOR', 'SESSION TAKEOVER RISK'];
  reasons.forEach((r, i) => {
    box(s, 8.88, 3.36 + i * 0.5, 3.67, 0.34, i < 2 ? C.soft : C.dangerPale, C.line);
    txt(s, `0${i + 1}  ${r}`, 9.03, 3.43 + i * 0.5, 3.37, 0.15, { fontFace: 'Courier New', fontSize: 6.6, bold: true });
  });
  txt(s, 'Code-backed weights: behavior 35% · device 35% · context 30%.', 8.88, 5.46, 3.55, 0.22, { fontSize: 7.5, color: C.gray, italic: true });
  box(s, 0.5, 6.25, 12.35, 0.58, C.ink, C.ink);
  txt(s, 'CLEAR THRESHOLDS MAKE THE PROTOTYPE TESTABLE TODAY—AND TUNABLE WITH REAL DATA LATER.', 0.78, 6.41, 11.8, 0.18, { fontFace: 'Courier New', fontSize: 8.2, bold: true, color: C.paper, align: 'center' });
}

// 06 — Architecture
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Architecture / Built to Integrate', 6);
  tag(s, 'Architecture', 0.5, 0.67, 1.55, C.red);
  headline(s, 'A trust layer around the bank—not a replacement for it.', 0.5, 1.06, 10.5, 0.58, 25);
  txt(s, 'REST handles banking actions. WebSockets stream live trust. Portal isolation keeps customer and regulator privileges separate.', 0.5, 1.72, 11.8, 0.36, { fontSize: 11.8 });

  const y = 2.55;
  const arch = [
    { x: 0.5, w: 2.45, fill: C.greenPale, title: 'CLIENT PORTAL', sub: 'React · Vite\nPort 3000', color: C.green },
    { x: 3.43, w: 2.55, fill: C.bluePale, title: 'FASTAPI CORE', sub: 'REST + WebSocket\nPort 8000', color: C.blue },
    { x: 6.48, w: 2.55, fill: C.soft, title: 'TRUST ENGINE', sub: 'Weighted score\nReasoned action', color: C.red },
    { x: 9.51, w: 3.34, fill: C.purplePale, title: 'PROOF LAYER', sub: 'SHA-256 records\nBesu / Sepolia model', color: C.purple }
  ];
  arch.forEach((a, i) => {
    box(s, a.x, y, a.w, 1.55, a.fill, C.line);
    txt(s, a.title, a.x + 0.18, y + 0.25, a.w - 0.36, 0.24, { fontSize: 10, bold: true, color: a.color, align: 'center' });
    rule(s, a.x + 0.2, y + 0.63, a.w - 0.4, a.color, 2);
    txt(s, a.sub, a.x + 0.2, y + 0.8, a.w - 0.4, 0.48, { fontFace: 'Georgia', fontSize: 12, bold: true, align: 'center', valign: 'top' });
    if (i < arch.length - 1) txt(s, '⇄', a.x + a.w + 0.13, y + 0.54, 0.28, 0.35, { fontSize: 16, bold: true, align: 'center' });
  });

  box(s, 0.5, 4.6, 5.48, 1.56, C.white, C.line);
  txt(s, 'CENTRAL BANK GOVERNANCE', 0.76, 4.86, 3.3, 0.23, { fontSize: 9.5, bold: true, color: C.purple });
  txt(s, 'Separate React portal · Port 3001\nValidator health · AML · KYC review · revocation · audit', 0.76, 5.25, 4.82, 0.62, { fontSize: 10.5, bold: true, valign: 'top' });
  txt(s, '↗', 5.48, 4.55, 0.26, 0.28, { fontSize: 17, color: C.purple, bold: true });

  box(s, 6.48, 4.6, 6.37, 1.56, C.ink, C.ink);
  txt(s, 'PROTOTYPE BOUNDARY', 6.75, 4.87, 2.1, 0.2, { fontSize: 8.5, bold: true, color: C.mustard });
  txt(s, 'Current state is in-memory and blockchain data is simulated. Production requires durable encrypted storage, managed secrets, rate limits and real node connectivity.', 6.75, 5.23, 5.76, 0.66, { fontSize: 10.2, color: C.paper, valign: 'top' });
  footer(s, 'DESIGNED FOR INTEGRATION  /  EXPLICITLY LABELED AS A HACKATHON DEMO');
}

// 07 — Governance
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Governance / Dual-Portal Control', 7);
  tag(s, 'Regulator View', 0.5, 0.67, 1.75, C.purple);
  headline(s, 'Customers bank. Regulators govern.\nThe roles never blur.', 0.5, 1.05, 4.35, 0.92, 24);
  txt(s, 'A separate command center gives authorized teams visibility and intervention without exposing controls to customers.', 0.5, 2.15, 4.15, 0.72, { fontSize: 11.3, valign: 'top' });

  const controls = [
    ['VALIDATORS', 'Node health + consensus'],
    ['AML + KYC', 'Alerts + review queue'],
    ['REVOCATION', 'Freeze credentials'],
    ['AUDIT', 'Trace every decision']
  ];
  controls.forEach((c, i) => {
    const x = 0.5 + (i % 2) * 2.06;
    const y = 3.2 + Math.floor(i / 2) * 1.05;
    box(s, x, y, 1.84, 0.82, i === 2 ? C.dangerPale : C.white, C.line);
    txt(s, c[0], x + 0.14, y + 0.12, 1.56, 0.18, { fontSize: 7.4, bold: true, color: i === 2 ? C.danger : C.purple });
    txt(s, c[1], x + 0.14, y + 0.38, 1.56, 0.25, { fontSize: 8.4, bold: true });
  });

  imageFrame(s, IMG.adminDash, 4.96, 0.82, 7.89, 4.93);
  box(s, 5.26, 5.36, 7.02, 0.34, C.mustard, C.line);
  txt(s, 'REAL SCREENSHOT  /  GOVERNANCE PORTAL  /  PORT 3001', 5.38, 5.43, 6.78, 0.16, { fontFace: 'Courier New', fontSize: 7, bold: true });
  box(s, 0.5, 6.3, 12.35, 0.5, C.ink, C.ink);
  txt(s, 'AUTHORIZATION IS AN ARCHITECTURAL BOUNDARY—NOT JUST A MENU ITEM.', 0.72, 6.43, 11.9, 0.18, { fontFace: 'Courier New', fontSize: 8.4, bold: true, color: C.paper, align: 'center' });
}

// 08 — Innovation
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Innovation / Meaningful Difference', 8);
  tag(s, 'Innovation', 0.5, 0.67, 1.45, C.red);
  headline(s, 'Not another banking app. A missing trust layer.', 0.5, 1.06, 9.3, 0.58, 26);
  txt(s, 'The advantage is not one feature—it is the way identity, action and evidence stay connected.', 0.5, 1.72, 10.6, 0.35, { fontSize: 12.2 });

  const rows = [
    ['WHEN TRUST IS CHECKED', 'At login', 'Continuously during the session'],
    ['HOW RISK IS HANDLED', 'Generic block or alert', 'Allow · step-up · restrict · revoke'],
    ['WHAT THE TEAM SEES', 'A score without context', 'Reason codes + action history'],
    ['WHO CONTROLS WHAT', 'Shared operational surface', 'Isolated customer and regulator portals'],
    ['WHAT GETS RECORDED', 'Mutable application log', 'Hash-backed proof record in the prototype']
  ];
  box(s, 0.5, 2.36, 12.35, 0.52, C.ink, C.ink);
  txt(s, 'COMPARISON', 0.72, 2.51, 2.8, 0.18, { fontSize: 8, bold: true, color: C.paper });
  txt(s, 'CONVENTIONAL DIGITAL BANKING', 4.38, 2.51, 3.2, 0.18, { fontSize: 8, bold: true, color: C.paper });
  txt(s, 'NEXUS BLOCKBANK', 8.38, 2.51, 3.5, 0.18, { fontSize: 8, bold: true, color: C.mustard });
  rows.forEach((r, i) => {
    const y = 2.88 + i * 0.68;
    const fill = i % 2 ? C.soft : C.white;
    box(s, 0.5, y, 12.35, 0.68, fill, C.line);
    txt(s, r[0], 0.72, y + 0.18, 3.0, 0.22, { fontSize: 8.5, bold: true, color: C.red });
    txt(s, r[1], 4.38, y + 0.16, 3.2, 0.27, { fontSize: 9.5 });
    txt(s, r[2], 8.38, y + 0.15, 4.05, 0.3, { fontSize: 9.5, bold: true, color: C.green });
  });
  box(s, 0.5, 6.55, 12.35, 0.38, C.mustard, C.line);
  txt(s, 'DIFFERENTIATOR: TRUST FOLLOWS THE ACTION—AND THE EVIDENCE FOLLOWS THE TRUST.', 0.7, 6.64, 11.95, 0.18, { fontFace: 'Courier New', fontSize: 8.2, bold: true, align: 'center' });
}

// 09 — Evidence
{
  const s = pptx.addSlide('NEWS');
  header(s, 'MVP Evidence / What Works Today', 9);
  tag(s, 'Demo Evidence', 0.5, 0.67, 1.8, C.green);
  headline(s, 'Two live portals. One tested backend.', 0.5, 1.06, 8.6, 0.58, 26);
  txt(s, 'The repository runs as a public hackathon demonstration with real screens, authenticated flows and role isolation.', 0.5, 1.72, 10.8, 0.34, { fontSize: 12 });

  imageFrame(s, IMG.clientLogin, 0.5, 2.34, 3.52, 2.2);
  imageFrame(s, IMG.adminLogin, 4.25, 2.34, 3.52, 2.2);
  box(s, 8.0, 2.34, 4.85, 2.2, C.ink, C.ink);
  txt(s, '4 / 4', 8.3, 2.64, 2.1, 0.5, { fontFace: 'Georgia', fontSize: 28, bold: true, color: C.mustard });
  txt(s, 'AUTOMATED SUITES PASSED', 8.3, 3.18, 3.75, 0.22, { fontSize: 9, bold: true, color: C.paper });
  rule(s, 8.3, 3.57, 4.2, C.mustard, 2);
  txt(s, 'Authenticated customer flow\nAdmin / customer isolation\nAnonymous-access rejection\nTransaction input validation', 8.3, 3.73, 4.1, 0.62, { fontSize: 9.4, color: C.paper, valign: 'top' });

  const targets = [
    ['<15 ms', 'Trust evaluation'],
    ['84 ms', 'P95 finality'],
    ['3,450', 'TPS model'],
    ['4', 'Validator nodes']
  ];
  targets.forEach((t, i) => {
    const x = 0.5 + i * 3.12;
    box(s, x, 5.0, 2.58, 1.03, i === 0 ? C.bluePale : (i === 3 ? C.purplePale : C.white), C.line);
    txt(s, t[0], x + 0.18, 5.15, 2.22, 0.37, { fontFace: 'Georgia', fontSize: 18, bold: true, color: i === 3 ? C.purple : C.blue });
    txt(s, t[1].toUpperCase(), x + 0.18, 5.63, 2.22, 0.2, { fontSize: 7.3, bold: true });
  });
  box(s, 0.5, 6.39, 12.35, 0.45, C.dangerPale, C.danger);
  txt(s, 'HONEST LABEL: PERFORMANCE, THROUGHPUT AND BLOCKCHAIN FIGURES ARE REPOSITORY DEMO TARGETS—NOT PRODUCTION BENCHMARKS.', 0.72, 6.51, 11.9, 0.18, { fontFace: 'Courier New', fontSize: 7.2, bold: true, color: C.danger, align: 'center' });
}

// 10 — Feasibility
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Feasibility / Path to Deployment', 10);
  tag(s, 'Feasibility', 0.5, 0.67, 1.45, C.blue);
  headline(s, 'Start beside the bank. Prove value. Then integrate.', 0.5, 1.06, 10.7, 0.82, 24);
  txt(s, 'The lowest-risk rollout begins as a decision layer for selected sensitive actions—not a core-banking replacement.', 0.5, 1.96, 10.9, 0.3, { fontSize: 11.6 });

  const phases = [
    ['NOW', 'HACKATHON DEMO', 'Local three-service stack\nIn-memory state\nSimulated proofs', '₹0 local infra', C.greenPale, C.green],
    ['NEXT', 'CONTROLLED PILOT', 'Durable database\nKMS + rate limits\nOne bank workflow', '₹25k–₹75k / month*', C.bluePale, C.blue],
    ['SCALE', 'ENTERPRISE ROLLOUT', 'Managed observability\nReal node connectivity\nRecovery + compliance', 'Load-priced', C.purplePale, C.purple]
  ];
  phases.forEach((p, i) => {
    const x = 0.5 + i * 4.13;
    box(s, x, 2.5, 3.8, 2.56, p[4], C.line);
    txt(s, p[0], x + 0.2, 2.71, 0.72, 0.22, { fontSize: 8, bold: true, color: p[5] });
    txt(s, p[1], x + 0.2, 3.04, 3.3, 0.28, { fontFace: 'Georgia', fontSize: 15, bold: true });
    rule(s, x + 0.2, 3.48, 3.4, p[5], 2);
    txt(s, p[2], x + 0.2, 3.68, 3.35, 0.72, { fontSize: 10.2, valign: 'top' });
    box(s, x + 0.2, 4.51, 3.4, 0.32, C.white, C.line);
    txt(s, p[3].toUpperCase(), x + 0.32, 4.58, 3.16, 0.16, { fontFace: 'Courier New', fontSize: 6.6, bold: true, align: 'center' });
    if (i < 2) txt(s, '→', x + 3.87, 3.56, 0.25, 0.3, { fontSize: 17, bold: true, align: 'center' });
  });

  box(s, 0.5, 5.43, 12.35, 1.1, C.white, C.line);
  txt(s, 'DEPLOYMENT GATES', 0.74, 5.68, 1.75, 0.2, { fontSize: 8.2, bold: true, color: C.red });
  txt(s, '01  Encrypted durable storage', 2.55, 5.65, 2.35, 0.22, { fontSize: 9, bold: true });
  txt(s, '02  Signed wallet nonce', 4.95, 5.65, 2.2, 0.22, { fontSize: 9, bold: true });
  txt(s, '03  Rate limits + lockout', 7.2, 5.65, 2.15, 0.22, { fontSize: 9, bold: true });
  txt(s, '04  Load / recovery / security tests', 9.4, 5.65, 3.05, 0.22, { fontSize: 9, bold: true });
  txt(s, '*Indicative small-pilot cloud estimate; validate after load testing and vendor selection.', 0.74, 6.15, 11.75, 0.18, { fontSize: 7.2, italic: true, color: C.gray });
  footer(s, 'FEASIBLE BECAUSE THE INTEGRATION SURFACE IS SMALL AND THE DECISION LOGIC IS EXPLICIT');
}

// 11 — Impact
{
  const s = pptx.addSlide('NEWS');
  header(s, 'Impact / Success Metrics', 11);
  tag(s, 'Impact', 0.5, 0.67, 1.15, C.green);
  headline(s, 'Safer actions. Fewer false alarms. Faster answers.', 0.5, 1.06, 10.4, 0.58, 26);
  txt(s, 'The pilot should be judged by measurable outcomes—not by blockchain vocabulary.', 0.5, 1.72, 9.7, 0.34, { fontSize: 12 });

  const kpis = [
    ['<100 ms', 'DECISION LATENCY', 'Keep security invisible in the customer journey.', C.bluePale, C.blue],
    ['100%', 'REASON-CODE COVERAGE', 'Every sensitive decision has an explanation.', C.greenPale, C.green],
    ['−30%', 'MANUAL REVIEW TARGET', 'Use step-up evidence to reduce avoidable investigations.', C.dangerPale, C.danger]
  ];
  kpis.forEach((k, i) => {
    const x = 0.5 + i * 4.13;
    box(s, x, 2.42, 3.8, 1.78, k[3], C.line);
    txt(s, k[0], x + 0.22, 2.65, 3.34, 0.46, { fontFace: 'Georgia', fontSize: 25, bold: true, color: k[4] });
    txt(s, k[1], x + 0.22, 3.16, 3.34, 0.18, { fontSize: 7.8, bold: true });
    rule(s, x + 0.22, 3.48, 3.34, k[4], 2);
    txt(s, k[2], x + 0.22, 3.64, 3.34, 0.36, { fontSize: 8.8, valign: 'top' });
  });

  box(s, 0.5, 4.66, 12.35, 1.5, C.white, C.line);
  txt(s, 'ROADMAP', 0.75, 4.92, 1.2, 0.2, { fontSize: 8.2, bold: true, color: C.red });
  const road = [
    ['01', 'CALIBRATE', 'Real anonymized session data'],
    ['02', 'PILOT', 'One sensitive banking workflow'],
    ['03', 'CONNECT', 'Durable ledger + real node'],
    ['04', 'EXPAND', 'Cross-bank trust portability']
  ];
  road.forEach((r, i) => {
    const x = 2.0 + i * 2.67;
    txt(s, r[0], x, 4.91, 0.34, 0.24, { fontFace: 'Georgia', fontSize: 13, bold: true, color: i === 3 ? C.purple : C.blue });
    txt(s, r[1], x + 0.42, 4.93, 1.58, 0.2, { fontSize: 8, bold: true });
    txt(s, r[2], x + 0.42, 5.29, 1.82, 0.38, { fontSize: 8.3, valign: 'top' });
    if (i < 3) txt(s, '→', x + 2.25, 5.15, 0.2, 0.22, { fontSize: 13, bold: true, align: 'center' });
  });
  box(s, 0.5, 6.48, 12.35, 0.4, C.mustard, C.line);
  txt(s, 'PROPOSED PILOT KPIs—TO BE VALIDATED WITH REAL BANK TRAFFIC.', 0.75, 6.58, 11.8, 0.17, { fontFace: 'Courier New', fontSize: 7.5, bold: true, align: 'center' });
}

// 12 — Close
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  txt(s, 'THE TRUST LEDGER', 0.55, 0.35, 2.2, 0.2, { fontFace: 'Courier New', fontSize: 7.5, bold: true, color: C.paper });
  rule(s, 0.55, 0.73, 5.9, C.paper, 1.1);
  tag(s, 'The Closing Argument', 0.55, 1.07, 2.2, C.red);
  txt(s, 'Trust every action.\nNot just every login.', 0.55, 1.65, 5.75, 1.55, { fontFace: 'Georgia', fontSize: 30, bold: true, color: C.paper, valign: 'top' });
  txt(s, 'Nexus BlockBank makes digital banking safer without making it feel harder.', 0.55, 3.53, 5.6, 0.7, { fontSize: 15, bold: true, color: C.paper, valign: 'top' });
  box(s, 0.55, 4.62, 5.72, 1.05, C.paper, C.paper);
  txt(s, 'DEMO READY', 0.8, 4.83, 1.22, 0.18, { fontSize: 8.2, bold: true, color: C.red });
  txt(s, 'Client 3000  ·  API 8000  ·  Admin 3001', 2.12, 4.79, 3.7, 0.24, { fontFace: 'Courier New', fontSize: 8.2, bold: true });
  txt(s, 'Prashant  /  Project Lead & Core Developer', 0.8, 5.22, 4.9, 0.18, { fontSize: 8.2, bold: true, color: C.gray });
  txt(s, 'LIVE DECISION PATH', 7.3, 1.08, 4.9, 0.2, { fontSize: 8, bold: true, color: C.mustard });
  const closeNodes = [
    ['BEHAVIOR', C.green], ['DEVICE', C.blue], ['CONTEXT', C.mustard]
  ];
  closeNodes.forEach((n, i) => {
    box(s, 7.3, 1.55 + i * 0.82, 1.85, 0.55, C.paper, C.paper);
    txt(s, n[0], 7.48, 1.72 + i * 0.82, 1.5, 0.16, { fontFace: 'Courier New', fontSize: 7.2, bold: true, color: n[1], align: 'center' });
    txt(s, '→', 9.33, 1.69 + i * 0.82, 0.3, 0.2, { fontSize: 14, bold: true, color: C.paper, align: 'center' });
  });
  box(s, 9.82, 1.72, 2.45, 1.95, C.bluePale, C.paper);
  txt(s, 'TRUST\nCORE', 10.1, 2.14, 1.9, 0.68, { fontFace: 'Georgia', fontSize: 20, bold: true, color: C.navy, align: 'center', valign: 'mid' });
  rule(s, 10.1, 3.02, 1.9, C.blue, 2);
  txt(s, 'SCORE + REASONS', 10.1, 3.17, 1.9, 0.18, { fontFace: 'Courier New', fontSize: 6.3, bold: true, color: C.blue, align: 'center' });
  const outcomes = [['ALLOW', C.green], ['STEP-UP', C.mustard], ['RESTRICT', C.red], ['PROOF', C.purple]];
  outcomes.forEach((o, i) => {
    const x = 7.3 + (i % 2) * 2.55;
    const y = 4.43 + Math.floor(i / 2) * 0.83;
    box(s, x, y, 2.18, 0.55, C.paper, C.paper);
    txt(s, o[0], x + 0.17, y + 0.17, 1.84, 0.16, { fontFace: 'Courier New', fontSize: 7.2, bold: true, color: o[1], align: 'center' });
  });
  txt(s, '↑  ACTION + EVIDENCE', 9.3, 3.93, 2.25, 0.18, { fontFace: 'Courier New', fontSize: 6.4, bold: true, color: C.paper, align: 'center' });
  box(s, 7.3, 6.28, 4.72, 0.42, C.mustard, C.line);
  txt(s, 'REAL SYSTEM FLOW. CLEAR DECISIONS. AUDITABLE OUTPUT.', 7.49, 6.38, 4.34, 0.18, { fontFace: 'Courier New', fontSize: 6.6, bold: true, align: 'center' });
}

pptx.writeFile({ fileName: path.resolve(A, '..', 'Nexus_BlockBank_Hackathon_Deck.pptx') });
