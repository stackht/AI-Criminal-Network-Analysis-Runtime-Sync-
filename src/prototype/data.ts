/**
 * PROTOTYPE SYNTHETIC DATA — Operation Meridian (CASE-2026-041).
 *
 * Everything in this file is fictional/demo material. No real criminal data is
 * used. The dataset is fully deterministic (seeded PRNG) so every refresh and
 * every judge demo shows the same network, evidence and timeline.
 *
 * All screens read from these fixtures through derived helpers; no component
 * ever invents numbers at render time.
 */
import type { CaseMarker, EntityType, LocationEvent } from "../types";

export const PROTOTYPE_LABEL = "PROTOTYPE • SYNTHETIC DATA";

export const caseKey = "CASE-2026-041";
export const caseTitle = "OPERATION MERIDIAN";
export const caseClass = "RESTRICTED";
export const caseStatus = "ACTIVE";
export const casePriority = "HIGH";
export const caseMeta = {
  caseKey,
  title: caseTitle,
  status: "ACTIVE INVESTIGATION",
  classification: caseClass,
  opened: "14 AUG 2026",
  owner: "SIH INTELLIGENCE CELL",
  jurisdiction: "NATIONAL GRID — MH / GJ / DL / AP",
};

export type ProtoType = EntityType;

export type ProtoEntity = {
  id: string;
  name: string;
  type: ProtoType;
  risk: number;
  confidence: number;
  community: number;
  lastActivity: string;
  aliases: string[];
  phones?: string[];
  vehicles?: string[];
  organizations?: string[];
  locations?: string[];
  signals: string[];
  evidenceIds: string[];
};

export type ProtoRel = {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: number;
  community?: number;
};

export type EvidenceKind = "FIR" | "CDR" | "TRANSACTION" | "SURVEILLANCE" | "LOCATION" | "DOCUMENT" | "VEHICLE";

export type Evidence = {
  id: string;
  kind: EvidenceKind;
  title: string;
  source: string;
  timestamp: string;
  entities: string[];
  caseRef: typeof caseKey;
  integrity: { sha256: string; merkle: number; verified: boolean };
};

export type TimelineEvent = {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  entityIds: string[];
  evidenceId?: string;
  locationId?: string;
};

export type PotentialLink = {
  id: string;
  source: string;
  target: string;
  via: string;
  confidence: number;
  supporting_signals: string[];
  contradictory_signals: string[];
  evidence_ids: string[];
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "DEFERRED";
};

export type Anomaly = {
  id: string;
  kind: string;
  severity: "HIGH" | "MEDIUM";
  title: string;
  score: number;
  timestamp: string;
  entityIds: string[];
  evidenceIds: string[];
};

export type ChainRecord = {
  id: string;
  previous: string;
  current: string;
  timestamp: string;
  actor: string;
  operation: string;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026041);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const rint = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const E = (
  spec: Omit<ProtoEntity, "community" | "signals" | "evidenceIds"> & Partial<Pick<ProtoEntity, "signals" | "evidenceIds">>,
  community: number,
): ProtoEntity => ({
  community,
  signals: spec.signals ?? [],
  evidenceIds: spec.evidenceIds ?? [],
  ...spec,
});

const REL_TYPES = ["ASSOCIATED", "CO_OCCURRENCE", "SHARED_CHANNEL", "SECONDARY_LINK"];

/* ------------------------------------------------------------------ */
/* Entities                                                            */
/* ------------------------------------------------------------------ */
const core: ProtoEntity[] = [
  E({ id: "ENT-0192", name: "Arjun Mehta", type: "Person", risk: 94, confidence: 88, lastActivity: "20 AUG 2026 16:04", aliases: ["AM", "Coordinator"], phones: ["+91 98XXXXXXXX · ENT-5001"], vehicles: ["MH-02-OPS-8811 · ENT-4001"], organizations: ["Northstar Logistics", "Apex Trading Group"], locations: ["Mumbai Central", "Navi Mumbai"], signals: ["Frequent interaction with Northstar Logistics", "Temporal overlap with 3 entities", "Unusual transaction clustering on escrow account"], evidenceIds: ["EVID-00482", "EVID-00491", "EVID-00514"] }, 1),
  E({ id: "ENT-0211", name: "Rohan Kapoor", type: "Person", risk: 89, confidence: 85, lastActivity: "20 AUG 2026 11:17", aliases: ["RK", "Regional"], phones: ["+91 91XXXXXXXX · ENT-5002"], organizations: ["Northstar Logistics"], locations: ["Surat", "Dubai"], signals: ["Regional coordination hub", "Recurring contact with field entities", "Offshore settlement visibility"], evidenceIds: ["EVID-00482", "EVID-00527"] }, 1),
  E({ id: "ENT-0187", name: "Sameer Khanna", type: "Person", risk: 91, confidence: 83, lastActivity: "20 AUG 2026 09:42", aliases: ["SK"], phones: ["+91 90XXXXXXXX"], vehicles: ["MH-04-VKN-2235 · ENT-4002"], organizations: ["Northstar Logistics"], locations: ["Pune", "Mumbai Central"], signals: ["Co-located with Arjun Mehta (90-min overlap)", "Logistics desk access on escrow account"], evidenceIds: ["EVID-00491", "EVID-00502"] }, 1),
  E({ id: "ENT-0332", name: "Vikram Rao", type: "Person", risk: 86, confidence: 80, lastActivity: "19 AUG 2026 18:40", aliases: ["VR"], vehicles: ["DL-01-KRT-7740 · ENT-4003"], phones: ["+91 88XXXXXXXX"], organizations: ["Meridian Imports"], locations: ["Navi Mumbai", "Dubai"], signals: ["Overseas import burst through Meridian Imports", "Port overlap with field entities"], evidenceIds: ["EVID-00533"] }, 3),
  E({ id: "ENT-0148", name: "Nisha Shah", type: "Person", risk: 84, confidence: 82, lastActivity: "19 AUG 2026 16:21", aliases: ["NS", "Finance"], phones: ["+91 87XXXXXXXX · ENT-5003"], organizations: ["Apex Trading Group"], locations: ["Ahmedabad", "Mumbai Central"], signals: ["Signatory on Apex operations account", "Financial documentation overlap"], evidenceIds: ["EVID-00533"] }, 2),
  E({ id: "ENT-0091", name: "Farhan Qureshi", type: "Person", risk: 72, confidence: 70, lastActivity: "19 AUG 2026 10:05", aliases: ["FQ"], organizations: ["Northstar Logistics"], locations: ["Hyderabad"], signals: ["Field contact with regional hub"], evidenceIds: [] }, 1),
  E({ id: "ENT-0244", name: "Meera Iyer", type: "Person", risk: 76, confidence: 74, lastActivity: "19 AUG 2026 08:20", aliases: ["MI"], organizations: ["Apex Trading Group"], locations: ["Bengaluru"], signals: ["Accounting link to Apex desks"], evidenceIds: [] }, 2),
  E({ id: "ENT-0318", name: "Kartik Deshmukh", type: "Person", risk: 81, confidence: 76, lastActivity: "19 AUG 2026 14:02", aliases: ["KD"], organizations: ["Meridian Imports"], locations: ["Pune"], signals: ["Import liaison reach"], evidenceIds: [] }, 3),
  E({ id: "ENT-0056", name: "Sanjay Patil", type: "Person", risk: 66, confidence: 62, lastActivity: "18 AUG 2026 22:10", aliases: ["SP"], locations: ["Navi Mumbai"], signals: ["Peripheral contact — awaiting corroboration"], evidenceIds: [] }, 1),
  E({ id: "ENT-0403", name: "Daniel Fernandes", type: "Person", risk: 78, confidence: 71, lastActivity: "18 AUG 2026 17:30", aliases: ["DF"], locations: ["Kochi"], signals: ["Port clearance overlap"], evidenceIds: [] }, 2),
  E({ id: "ENT-0027", name: "Priya Nair", type: "Person", risk: 61, confidence: 64, lastActivity: "18 AUG 2026 12:55", aliases: ["PN"], locations: ["Ahmedabad", "Bengaluru"], signals: ["Office proximity to finance desk"], evidenceIds: [] }, 2),
  E({ id: "ENT-1001", name: "Northstar Logistics", type: "Organization", risk: 82, confidence: 87, lastActivity: "20 AUG 2026 14:32", aliases: ["NST"], locations: ["Mumbai Central", "Navi Mumbai"], signals: ["Regional logistics backbone", "Escrow settlement concentration"], evidenceIds: ["EVID-00491"] }, 1),
  E({ id: "ENT-1002", name: "Apex Trading Group", type: "Organization", risk: 74, confidence: 84, lastActivity: "19 AUG 2026 18:40", aliases: ["APX"], locations: ["Dubai", "Pune"], signals: ["Overseas settlement channel"], evidenceIds: ["EVID-00533"] }, 2),
  E({ id: "ENT-1003", name: "Meridian Imports", type: "Organization", risk: 71, confidence: 81, lastActivity: "19 AUG 2026 16:21", aliases: ["MRD"], locations: ["Dubai", "Surat"], signals: ["Import corridor concentration"], evidenceIds: [] }, 3),
  E({ id: "ENT-1004", name: "Horizon Freight & Cargo", type: "Organization", risk: 64, confidence: 76, lastActivity: "19 AUG 2026 10:05", aliases: ["HRZ"], locations: ["Navi Mumbai"], signals: [] }, 1),
  E({ id: "ENT-1005", name: "Saffron Textiles Export", type: "Organization", risk: 58, confidence: 69, lastActivity: "18 AUG 2026 12:55", aliases: ["SFR"], locations: ["Surat"], signals: [] }, 3),
  E({ id: "ENT-2001", name: "Mumbai Central", type: "Location", risk: 12, confidence: 90, lastActivity: "20 AUG 2026 16:04", aliases: ["Mumbai Central Station"], signals: [] }, 1),
  E({ id: "ENT-2002", name: "Navi Mumbai", type: "Location", risk: 20, confidence: 90, lastActivity: "20 AUG 2026 09:42", aliases: ["Warehouse Zone 7"], signals: [] }, 1),
  E({ id: "ENT-2003", name: "Pune", type: "Location", risk: 18, confidence: 90, lastActivity: "19 AUG 2026 14:02", aliases: [], signals: [] }, 3),
  E({ id: "ENT-2004", name: "Surat", type: "Location", risk: 16, confidence: 90, lastActivity: "20 AUG 2026 11:17", aliases: [], signals: [] }, 3),
  E({ id: "ENT-2005", name: "Dubai", type: "Location", risk: 30, confidence: 82, lastActivity: "19 AUG 2026 18:40", aliases: [], signals: [] }, 3),
  E({ id: "ENT-2006", name: "New Delhi", type: "Location", risk: 10, confidence: 90, lastActivity: "18 AUG 2026 16:04", aliases: [], signals: [] }, 4),
  E({ id: "ENT-2007", name: "Ahmedabad", type: "Location", risk: 15, confidence: 90, lastActivity: "19 AUG 2026 16:21", aliases: [], signals: [] }, 2),
  E({ id: "ENT-2008", name: "Bengaluru", type: "Location", risk: 12, confidence: 90, lastActivity: "19 AUG 2026 08:20", aliases: [], signals: [] }, 2),
  E({ id: "ENT-2009", name: "Hyderabad", type: "Location", risk: 12, confidence: 90, lastActivity: "19 AUG 2026 10:05", aliases: [], signals: [] }, 1),
  E({ id: "ENT-2010", name: "Kochi", type: "Location", risk: 14, confidence: 90, lastActivity: "18 AUG 2026 17:30", aliases: [], signals: [] }, 2),
  E({ id: "ENT-3001", name: "ACC-47XX · Apex Operations", type: "Account", risk: 63, confidence: 86, lastActivity: "19 AUG 2026 18:40", aliases: ["Apex Cur. 1147"], signals: ["Operations account — signatory Nisha Shah"], evidenceIds: ["EVID-00533"] }, 2),
  E({ id: "ENT-3002", name: "ACC-21XX · Northstar Escrow", type: "Account", risk: 78, confidence: 88, lastActivity: "20 AUG 2026 14:32", aliases: ["NST Escrow 2211"], signals: ["Rapid transaction cluster (18 AUG)", "Controlled by Arjun Mehta"], evidenceIds: ["EVID-00491"] }, 1),
  E({ id: "ENT-3003", name: "ACC-88XX · Meridian Overseas", type: "Account", risk: 61, confidence: 82, lastActivity: "19 AUG 2026 16:21", aliases: ["MRD Overseas 8831"], signals: ["Overseas beneficiary channel"], evidenceIds: [] }, 3),
  E({ id: "ENT-3004", name: "ACC-10XX · Settlement Ledger", type: "Account", risk: 59, confidence: 83, lastActivity: "20 AUG 2026 11:17", aliases: ["Settlement 1080"], signals: [], evidenceIds: [] }, 1),
  E({ id: "ENT-3005", name: "ACC-56XX · Horizon Overdraft", type: "Account", risk: 54, confidence: 77, lastActivity: "19 AUG 2026 10:05", aliases: ["HRZ OD 5690"], signals: [], evidenceIds: [] }, 1),
  E({ id: "ENT-4001", name: "MH-02-OPS-8811", type: "Vehicle", risk: 46, confidence: 88, lastActivity: "20 AUG 2026 09:42", aliases: ["Grey SUV"], signals: ["Operated by Arjun Mehta"], evidenceIds: ["EVID-00502"] }, 1),
  E({ id: "ENT-4002", name: "MH-04-VKN-2235", type: "Vehicle", risk: 43, confidence: 84, lastActivity: "19 AUG 2026 14:02", aliases: ["White pick-up"], signals: ["Used by Sameer Khanna"], evidenceIds: [] }, 1),
  E({ id: "ENT-4003", name: "DL-01-KRT-7740", type: "Vehicle", risk: 41, confidence: 80, lastActivity: "19 AUG 2026 18:40", aliases: ["Black sedan"], signals: ["Tracked movement — Navi Mumbai / Delhi"], evidenceIds: [] }, 3),
  E({ id: "ENT-5001", name: "SIM · IMSI 4054052... , PLN +91 98", type: "Phone", risk: 58, confidence: 91, lastActivity: "20 AUG 2026 16:04", aliases: ["Arjun primary line"], signals: ["Geospatial handshake with ENT-0211"], evidenceIds: ["EVID-00482"] }, 1),
  E({ id: "ENT-5002", name: "SIM · IMSI 4054058... , PLN +91 91", type: "Phone", risk: 55, confidence: 88, lastActivity: "20 AUG 2026 11:17", aliases: ["Rohan regional line"], signals: ["Recurring call graph to ENT-5001"], evidenceIds: ["EVID-00482"] }, 1),
  E({ id: "ENT-5003", name: "SIM · IMSI 4054051... , PLN +91 87", type: "Phone", risk: 54, confidence: 86, lastActivity: "19 AUG 2026 18:40", aliases: ["Nisha active SIM"], signals: ["Overseas activity surge (Dubai towers)"], evidenceIds: ["EVID-00482"] }, 2),
];

const EXTRA_NAMES = [
  ["ENT-0111", "Ravi Menon"], ["ENT-0143", "Suresh Bhandari"], ["ENT-0170", "Imran Sheikh"],
  ["ENT-0204", "Pooja Choudhary"], ["ENT-0260", "Amit Trivedi"], ["ENT-0288", "Kunal Malhotra"],
  ["ENT-0326", "Shweta Joshi"], ["ENT-0351", "Aditya Ganapathy"], ["ENT-0383", "Ritu Verma"],
  ["ENT-0009", "Mohsin Alam"],
] as const;

export const COMMUNITY_COUNT = 6;

const extra: ProtoEntity[] = EXTRA_NAMES.map(([id, name], i) => {
  const community = 4 + (i % 3);
  return E({
    id,
    name,
    type: "Person",
    risk: rint(38, 68),
    confidence: rint(45, 70),
    lastActivity: `${17 + (i % 3)} AUG 2026 ${10 + (i % 8)}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60}`,
    aliases: [],
    signals: community === 4 && i < 2 ? ["Isolated cluster — connects to network only via Arjun Mehta"] : [],
  }, community);
});

export const entities: ProtoEntity[] = [...core, ...extra];

/* ------------------------------------------------------------------ */
/* Relationships                                                       */
/* ------------------------------------------------------------------ */
const REL_COUNT = 126;

const rels: ProtoRel[] = [];
let relSeq = 1;
const relPairs = new Set<string>();
const pushRel = (source: string, target: string, type: string, confidence: number) => {
  const pair = [source, target].sort().join("|");
  if (relPairs.has(pair)) return;
  relPairs.add(pair);
  rels.push({ id: `REL-${String(relSeq++).padStart(4, "0")}`, source, target, type, confidence });
};

const P2P: [string, string, string, number][] = [
  ["ENT-0192", "ENT-0211", "FREQUENT_CONTACT", 0.92],
  ["ENT-0192", "ENT-0187", "CO_SIGHTED_MUMBAI", 0.85],
  ["ENT-0192", "ENT-0148", "TEMPORAL_OVERLAP", 0.77],
  ["ENT-0211", "ENT-0187", "CO_LOCATED_SURAT", 0.81],
  ["ENT-0187", "ENT-0332", "SHARED_ORGANIZATION", 0.74],
  ["ENT-0332", "ENT-0211", "TRANSACTION_PAIR", 0.69],
  ["ENT-0148", "ENT-0244", "PROFESSIONAL_LINK", 0.8],
  ["ENT-0091", "ENT-0211", "RECURRING_CONTACT", 0.72],
  ["ENT-0056", "ENT-0192", "PERIPHERAL_CONTACT", 0.54],
  ["ENT-0403", "ENT-0332", "PORT_OVERLAP", 0.67],
  ["ENT-0027", "ENT-0148", "OFFICE_OVERLAP", 0.61],
];
P2P.forEach((r) => pushRel(r[0], r[1], r[2], r[3]));

const P2O: [string, string, string, number][] = [
  ["ENT-0192", "ENT-1001", "COORDINATOR", 0.88],
  ["ENT-0192", "ENT-1002", "TRANSACTION_OVERSIGHT", 0.71],
  ["ENT-0192", "ENT-1003", "FREQUENT_CONTACT", 0.66],
  ["ENT-0211", "ENT-1001", "REGIONAL_HEAD", 0.9],
  ["ENT-0187", "ENT-1001", "LOGISTICS_DESK", 0.83],
  ["ENT-0148", "ENT-1002", "FINANCE_DIRECTOR", 0.87],
  ["ENT-0332", "ENT-1003", "IMPORT_LIAISON", 0.78],
  ["ENT-0091", "ENT-1001", "FIELD_CONTACT", 0.69],
  ["ENT-0244", "ENT-1002", "ACCOUNTING_LINK", 0.71],
];
P2O.forEach((r) => pushRel(r[0], r[1], r[2], r[3]));

const P2A: [string, string, string, number][] = [
  ["ENT-0192", "ENT-3002", "CONTROLLED_BY", 0.9],
  ["ENT-0148", "ENT-3001", "SIGNATORY", 0.86],
  ["ENT-0332", "ENT-3003", "BENEFICIARY", 0.81],
  ["ENT-0211", "ENT-3004", "OPERATOR", 0.79],
  ["ENT-0187", "ENT-3005", "ACCESS", 0.68],
];
P2A.forEach((r) => pushRel(r[0], r[1], r[2], r[3]));

const A2O: [string, string, string, number][] = [
  ["ENT-3002", "ENT-1001", "ESCROW_ACCOUNT", 0.93],
  ["ENT-3001", "ENT-1002", "OPERATIONS_ACCOUNT", 0.91],
  ["ENT-3003", "ENT-1003", "OVERSEAS_ACCOUNT", 0.84],
  ["ENT-3004", "ENT-1001", "SETTLEMENT_ACCOUNT", 0.76],
];
A2O.forEach((r) => pushRel(r[0], r[1], r[2], r[3]));

const P2V: [string, string, string, number][] = [
  ["ENT-0192", "ENT-4001", "OPERATES", 0.88],
  ["ENT-0187", "ENT-4002", "USES", 0.8],
  ["ENT-0332", "ENT-4003", "TRACKED_MOVEMENT", 0.73],
];
P2V.forEach((r) => pushRel(r[0], r[1], r[2], r[3]));

const P2PH: [string, string, string, number][] = [
  ["ENT-0192", "ENT-5001", "PRIMARY_LINE", 0.94],
  ["ENT-0211", "ENT-5002", "RECURRING_LINK", 0.87],
  ["ENT-0148", "ENT-5003", "ACTIVE_SIM", 0.82],
];
P2PH.forEach((r) => pushRel(r[0], r[1], r[2], r[3]));

const P2L: [string, string, string, number][] = [
  ["ENT-0192", "ENT-2001", "SIGHTED", 0.9],
  ["ENT-0192", "ENT-2002", "FREQUENTS", 0.84],
  ["ENT-0211", "ENT-2004", "SIGHTED", 0.85],
  ["ENT-0211", "ENT-2005", "TRAVEL", 0.78],
  ["ENT-0187", "ENT-2003", "SIGHTED", 0.79],
  ["ENT-0187", "ENT-2001", "TEMPORAL_OVERLAP", 0.77],
  ["ENT-0332", "ENT-2002", "SIGHTED", 0.76],
  ["ENT-0332", "ENT-2005", "TRAVEL", 0.72],
  ["ENT-0148", "ENT-2007", "SIGHTED", 0.81],
  ["ENT-0148", "ENT-2001", "OFFICE_LINK", 0.74],
  ["ENT-0091", "ENT-2009", "SIGHTED", 0.63],
  ["ENT-0244", "ENT-2008", "WORK_PROXIMITY", 0.6],
  ["ENT-0403", "ENT-2010", "PORT_LINK", 0.68],
  ["ENT-0056", "ENT-2002", "PERIPHERAL", 0.52],
];
P2L.forEach((r) => pushRel(r[0], r[1], r[2], r[3]));

const O2L: [string, string, string, number][] = [
  ["ENT-1001", "ENT-2001", "HEADQUARTERS", 0.9],
  ["ENT-1001", "ENT-2002", "WAREHOUSE", 0.83],
  ["ENT-1002", "ENT-2005", "OVERSEAS_OFFICE", 0.87],
  ["ENT-1003", "ENT-2005", "IMPORT_HUB", 0.79],
  ["ENT-1002", "ENT-2003", "REGIONAL_OFFICE", 0.74],
  ["ENT-1003", "ENT-2004", "IMPORT_CORRIDOR", 0.73],
];
O2L.forEach((r) => pushRel(r[0], r[1], r[2], r[3]));

/* Deterministic filler edges to reach exactly 126 (internal consistency for
 * the demo counts). Ring edges guarantee every community is internally
 * connected. Communities C2/C3/C5 are anchored to the main hub through
 * Sameer/Rohan; C4 and C6 attach ONLY through Arjun Mehta — he is a genuine
 * structural bridge, so the what-if removal is a real fragmentation scenario
 * (not fabricated arithmetic) that matches the demo story. */
const HUB = ["ENT-0192", "ENT-0211", "ENT-0187"]; // main network bridges
const byCommunity = new Map<number, string[]>();
entities.forEach((e) => {
  if (!byCommunity.has(e.community)) byCommunity.set(e.community, []);
  byCommunity.get(e.community)!.push(e.id);
});

// 0) Deterministic cross-community anchors.
const ANCHOR: Record<number, string> = { 2: "ENT-0187", 3: "ENT-0211", 5: "ENT-0211" };
byCommunity.forEach((members, community) => {
  if (community === 1 || !members.length) return;
  if (community === 4 || community === 6) {
    pushRel("ENT-0192", members[0], "STRUCTURAL_BRIDGE", 0.92);
  } else {
    pushRel(ANCHOR[community], members[0], "CORRIDOR_LINK", 0.72);
  }
});

// 1) Guaranteed community rings (internal connectivity).
byCommunity.forEach((members) => {
  for (let i = 0; i < members.length - 1; i += 1) {
    pushRel(members[i], members[i + 1], "CO_MEMBERSHIP", 0.55 + rand() * 0.25);
  }
  if (members.length > 3) pushRel(members[0], members[members.length - 1], "CO_MEMBERSHIP", 0.55 + rand() * 0.25);
});

// 2) Deterministic filler until exactly REL_COUNT.
const need = REL_COUNT - rels.length;
let guard = 0;
while (rels.length < REL_COUNT && guard++ < 20000) {
  const within = rand() < 0.8;
  if (within) {
    const ca = 1 + Math.floor(rand() * COMMUNITY_COUNT);
    const listA = byCommunity.get(ca) ?? [];
    if (listA.length < 2) continue;
    let a = pick(listA);
    let b = pick(listA);
    if (a === b) continue;
    if (relPairs.has([a, b].sort().join("|"))) continue;
    pushRel(a, b, pick(REL_TYPES), 0.42 + rand() * 0.36);
  } else {
    const cb = 1 + Math.floor(rand() * COMMUNITY_COUNT);
    const listB = byCommunity.get(cb) ?? [];
    if (!listB.length) continue;
    const b = pick(listB);
    if (b === HUB[0]) continue;
    if (relPairs.has([HUB[0], b].sort().join("|"))) continue;
    pushRel(HUB[0], b, pick(REL_TYPES), 0.46 + rand() * 0.3);
  }
}
void need;

export const relationships: ProtoRel[] = rels;

/* ------------------------------------------------------------------ */
/* Potential links                                                     */
/* ------------------------------------------------------------------ */
export const potentialLinks: PotentialLink[] = [
  {
    id: "PLINK-01", source: "ENT-0192", target: "ENT-0211", via: "ENT-1001",
    confidence: 0.87, status: "PENDING",
    supporting_signals: ["Shared organization — Northstar Logistics", "Temporal overlap in Mumbai Central window", "Common intermediary (Logistics Desk)", "Structural similarity of contact patterns"],
    contradictory_signals: ["No independent corroborating source yet"],
    evidence_ids: ["EVID-00482", "EVID-00491", "EVID-00514"],
  },
  {
    id: "PLINK-02", source: "ENT-0192", target: "ENT-0148", via: "ENT-1002",
    confidence: 0.79, status: "PENDING",
    supporting_signals: ["Transaction oversight overlap", "Shared organization — Apex Trading Group", "Temporal overlap in Mumbai Central"],
    contradictory_signals: ["Financial documentation pending digitization"],
    evidence_ids: ["EVID-00533", "EVID-00482"],
  },
  {
    id: "PLINK-03", source: "ENT-0187", target: "ENT-0332", via: "ENT-1003",
    confidence: 0.74, status: "PENDING",
    supporting_signals: ["Shared organization — Meridian Imports", "Co-located transit pattern", "Port overlap proximity"],
    contradictory_signals: ["Movement records partially incomplete"],
    evidence_ids: ["EVID-00527"],
  },
  {
    id: "PLINK-04", source: "ENT-0056", target: "ENT-0091", via: "ENT-0192",
    confidence: 0.68, status: "PENDING",
    supporting_signals: ["Common intermediary", "Peripheral contact convergence"],
    contradictory_signals: ["Low-risk scores on both nodes"],
    evidence_ids: ["EVID-00502"],
  },
  {
    id: "PLINK-05", source: "ENT-0244", target: "ENT-0403", via: "ENT-0148",
    confidence: 0.63, status: "PENDING",
    supporting_signals: ["Professional link through Finance Desk", "Geographic separation with shared channel"],
    contradictory_signals: ["Requires analyst validation"],
    evidence_ids: [],
  },
  {
    id: "PLINK-06", source: "ENT-0111", target: "ENT-0192", via: "ENT-0056",
    confidence: 0.61, status: "PENDING",
    supporting_signals: ["Common intermediary", "Structural similarity of peripheral ties"],
    contradictory_signals: ["Identity confidence below threshold"],
    evidence_ids: [],
  },
  {
    id: "PLINK-07", source: "ENT-0027", target: "ENT-0148", via: "ENT-0244",
    confidence: 0.6, status: "PENDING",
    supporting_signals: ["Office overlap — Ahmedabad / Bengaluru", "Financial documentation overlap"],
    contradictory_signals: ["No call records yet"],
    evidence_ids: ["EVID-00533"],
  },
];

/* ------------------------------------------------------------------ */
/* Anomalies                                                           */
/* ------------------------------------------------------------------ */
export const anomalies: Anomaly[] = [
  { id: "ANOM-01", kind: "TRANSACTION_CLUSTER", severity: "HIGH", title: "Rapid inbound cluster on ACC-21XX escrow", score: 94, timestamp: "2026-08-18T14:32:00Z", entityIds: ["ENT-0192", "ENT-3002", "ENT-0211"], evidenceIds: ["EVID-00491"] },
  { id: "ANOM-02", kind: "TEMPORAL_COINCIDENCE", severity: "HIGH", title: "3 entities co-located in a 90-minute Mumbai window", score: 89, timestamp: "2026-08-18T11:17:00Z", entityIds: ["ENT-0192", "ENT-0187", "ENT-0211"], evidenceIds: ["EVID-00514"] },
  { id: "ANOM-03", kind: "STRUCTURAL_BRIDGE", severity: "MEDIUM", title: "Arjun Mehta holds disproportionate bridge centrality", score: 86, timestamp: "2026-08-19T09:42:00Z", entityIds: ["ENT-0192"], evidenceIds: [] },
  { id: "ANOM-04", kind: "OVERSEAS_BURST", severity: "MEDIUM", title: "Active SIM burst across Dubai towers", score: 82, timestamp: "2026-08-19T18:40:00Z", entityIds: ["ENT-5003", "ENT-0148", "ENT-0332"], evidenceIds: ["EVID-00482"] },
];

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */
export const evidence: Evidence[] = [
  { id: "EVID-00482", kind: "CDR", title: "Communication record — ENT-0192 ↔ ENT-0211", source: "Synthetic CDR Dataset", timestamp: "2026-08-18T14:32:00Z", entities: ["ENT-0192", "ENT-0211", "ENT-5001", "ENT-5002"], caseRef: caseKey, integrity: { sha256: "9f2c1d4e8a1b3c6f0e2d5a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d", merkle: 21, verified: true } },
  { id: "EVID-00491", kind: "TRANSACTION", title: "Escrow ledger — ACC-21XX rapid inbound series", source: "Synthetic Bank Transaction Feed", timestamp: "2026-08-18T14:32:00Z", entities: ["ENT-3002", "ENT-0192", "ENT-0187"], caseRef: caseKey, integrity: { sha256: "1b2a3c4d5e6f70a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5", merkle: 22, verified: true } },
  { id: "EVID-00502", kind: "SURVEILLANCE", title: "Frames — Navi Mumbai warehouse approach", source: "Synthetic CCTV Dataset", timestamp: "2026-08-18T09:42:00Z", entities: ["ENT-0187", "ENT-0056", "ENT-4001"], caseRef: caseKey, integrity: { sha256: "a1b2c3d4e5f60798a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a", merkle: 23, verified: true } },
  { id: "EVID-00514", kind: "LOCATION", title: "Movement record — Mumbai Central co-location", source: "Synthetic Telecom Location Feed", timestamp: "2026-08-18T11:17:00Z", entities: ["ENT-0192", "ENT-0187", "ENT-0211"], caseRef: caseKey, integrity: { sha256: "8b1c2d3e4f50697a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4", merkle: 24, verified: true } },
  { id: "EVID-00527", kind: "CDR", title: "Communication record — ENT-0187 ↔ ENT-0332", source: "Synthetic CDR Dataset", timestamp: "2026-08-19T08:20:00Z", entities: ["ENT-0187", "ENT-0332", "ENT-5003"], caseRef: caseKey, integrity: { sha256: "c1d2e3f4a5b60789a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4", merkle: 25, verified: true } },
  { id: "EVID-00533", kind: "TRANSACTION", title: "Overseas settlement — Apex → Dubai corridor", source: "Synthetic Bank Transaction Feed", timestamp: "2026-08-19T16:21:00Z", entities: ["ENT-3001", "ENT-0148", "ENT-0332", "ENT-1002"], caseRef: caseKey, integrity: { sha256: "d1e2f3a4b5c60789a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5", merkle: 26, verified: true } },
  { id: "EVID-00546", kind: "LOCATION", title: "Geofence entry — Vicinity of Northstar HQ", source: "Synthetic Telecom Location Feed", timestamp: "2026-08-18T16:04:00Z", entities: ["ENT-0192", "ENT-1001"], caseRef: caseKey, integrity: { sha256: "e2f3a4b5c6d70989a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a4", merkle: 27, verified: true } },
  { id: "EVID-00559", kind: "DOCUMENT", title: "Cargo manifest — Meridian import batch 88", source: "Synthetic Customs Dataset", timestamp: "2026-08-19T10:05:00Z", entities: ["ENT-0332", "ENT-1003"], caseRef: caseKey, integrity: { sha256: "f3a4b5c6d7e80989b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6a", merkle: 28, verified: true } },
  { id: "EVID-00560", kind: "VEHICLE", title: "Expressway toll sequence — ENT-4001", source: "Synthetic Toll Dataset", timestamp: "2026-08-18T22:10:00Z", entities: ["ENT-4001", "ENT-0192"], caseRef: caseKey, integrity: { sha256: "a4b5c6d7e8f90989b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b", merkle: 29, verified: true } },
  { id: "EVID-00573", kind: "FIR", title: "Case intake — Operation Meridian anchor", source: "Synthetic Case Intake Record", timestamp: "2026-08-14T06:00:00Z", entities: ["ENT-0192"], caseRef: caseKey, integrity: { sha256: "b5c6d7e8f9a01898b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6c", merkle: 30, verified: true } },
  { id: "EVID-00584", kind: "SURVEILLANCE", title: "Ground frames — Surat corridor", source: "Synthetic CCTV Dataset", timestamp: "2026-08-19T14:02:00Z", entities: ["ENT-0211", "ENT-1003"], caseRef: caseKey, integrity: { sha256: "c6d7e8f9a0b12897b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6d", merkle: 31, verified: true } },
  { id: "EVID-00595", kind: "CDR", title: "Cell relay handshake — Pune desk", source: "Synthetic CDR Dataset", timestamp: "2026-08-19T08:20:00Z", entities: ["ENT-0187", "ENT-0318"], caseRef: caseKey, integrity: { sha256: "d7e8f9a0b1c23986b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6e", merkle: 32, verified: true } },
  { id: "EVID-00601", kind: "TRANSACTION", title: "Settlement sweep — Northstar escrow", source: "Synthetic Bank Transaction Feed", timestamp: "2026-08-20T11:17:00Z", entities: ["ENT-3002", "ENT-0211"], caseRef: caseKey, integrity: { sha256: "e8f9a0b1c2d34985b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6f", merkle: 33, verified: true } },
  { id: "EVID-00612", kind: "LOCATION", title: "Tracking — ENT-4003 Navi Mumbai → Delhi", source: "Synthetic ANPR Dataset", timestamp: "2026-08-19T18:40:00Z", entities: ["ENT-4003", "ENT-0332"], caseRef: caseKey, integrity: { sha256: "f9a0b1c2d3e45984b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6a", merkle: 34, verified: true } },
  { id: "EVID-00623", kind: "DOCUMENT", title: "Shareholding ledger — Apex Trading Group", source: "Synthetic Company Registry", timestamp: "2026-08-19T16:21:00Z", entities: ["ENT-1002", "ENT-0148"], caseRef: caseKey, integrity: { sha256: "0a1b2c3d4e56983b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b", merkle: 35, verified: true } },
  { id: "EVID-00634", kind: "VEHICLE", title: "Registrar record — ENT-4002", source: "Synthetic Vehicle Registry", timestamp: "2026-08-18T12:55:00Z", entities: ["ENT-4002", "ENT-0187"], caseRef: caseKey, integrity: { sha256: "1b2c3d4e5f67982b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6c", merkle: 36, verified: true } },
  { id: "EVID-00656", kind: "CDR", title: "Roaming burst — Dubai tower handoff", source: "Synthetic CDR Dataset", timestamp: "2026-08-19T18:40:00Z", entities: ["ENT-5003", "ENT-0148"], caseRef: caseKey, integrity: { sha256: "3d4e5f6a7b89080b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6e", merkle: 38, verified: false } },
  { id: "EVID-00667", kind: "SURVEILLANCE", title: "Ground observation — Kochi port gate", source: "Synthetic CCTV Dataset", timestamp: "2026-08-18T17:30:00Z", entities: ["ENT-0403", "ENT-2010"], caseRef: caseKey, integrity: { sha256: "4e5f6a7b8c90179b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6f", merkle: 39, verified: true } },
];

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */
export const timeline: TimelineEvent[] = [
  { id: "TL-001", timestamp: "2026-08-18T09:42:00Z", type: "ENTITY_MOVEMENT", description: "Entity movement detected — Navi Mumbai warehouse approach", entityIds: ["ENT-0187", "ENT-4001"], evidenceId: "EVID-00502", locationId: "LOC-2002" },
  { id: "TL-002", timestamp: "2026-08-18T11:17:00Z", type: "TEMPORAL_CLUSTER", description: "Temporal coincidence flagged — 3 entities, Mumbai Central window", entityIds: ["ENT-0192", "ENT-0187", "ENT-0211"], evidenceId: "EVID-00514", locationId: "LOC-2001" },
  { id: "TL-003", timestamp: "2026-08-18T14:32:00Z", type: "COMMUNICATION_EVENT", description: "Communication event — ENT-0192 ↔ ENT-0211 (CDR match)", entityIds: ["ENT-0192", "ENT-0211"], evidenceId: "EVID-00482", locationId: "LOC-2001" },
  { id: "TL-004", timestamp: "2026-08-18T14:32:00Z", type: "TRANSACTION_CLUSTER", description: "Rapid inbound cluster registered on ACC-21XX escrow", entityIds: ["ENT-3002", "ENT-0192"], evidenceId: "EVID-00491", locationId: "LOC-2002" },
  { id: "TL-005", timestamp: "2026-08-18T16:04:00Z", type: "POTENTIAL_LINK_GENERATED", description: "Potential relationship generated — PLINK-01 (87%)", entityIds: ["ENT-0192", "ENT-0211"], evidenceId: "EVID-00546" },
  { id: "TL-006", timestamp: "2026-08-18T22:10:00Z", type: "VEHICLE_EVENT", description: "Expressway toll sequence — ENT-4001", entityIds: ["ENT-4001", "ENT-0192"], evidenceId: "EVID-00560", locationId: "LOC-2002" },
  { id: "TL-007", timestamp: "2026-08-19T08:20:00Z", type: "ANALYST_REVIEW", description: "Analyst review initiated on PLINK-01 chain", entityIds: ["ENT-0192", "ENT-0211"], evidenceId: "EVID-00527" },
  { id: "TL-008", timestamp: "2026-08-19T08:20:00Z", type: "COMMUNICATION_EVENT", description: "Cell relay handshake — Pune desk", entityIds: ["ENT-0187", "ENT-0318"], evidenceId: "EVID-00595", locationId: "LOC-2003" },
  { id: "TL-009", timestamp: "2026-08-19T10:05:00Z", type: "ANOMALY_DETECTED", description: "Structural bridge anomaly — ENT-0192 centrality", entityIds: ["ENT-0192"], evidenceId: "EVID-00559" },
  { id: "TL-010", timestamp: "2026-08-19T14:02:00Z", type: "MOVEMENT", description: "Ground frames — Surat corridor", entityIds: ["ENT-0211", "ENT-1003"], evidenceId: "EVID-00584", locationId: "LOC-2004" },
  { id: "TL-011", timestamp: "2026-08-19T16:21:00Z", type: "TRANSACTION_EVENT", description: "Overseas settlement — Apex → Dubai corridor", entityIds: ["ENT-3001", "ENT-0148", "ENT-0332"], evidenceId: "EVID-00533", locationId: "LOC-2007" },
  { id: "TL-012", timestamp: "2026-08-19T18:40:00Z", type: "OVERSEAS_ACTIVITY", description: "Active SIM burst across Dubai towers — ENT-5003", entityIds: ["ENT-5003", "ENT-0148", "ENT-0332"], evidenceId: "EVID-00656", locationId: "LOC-2005" },
  { id: "TL-013", timestamp: "2026-08-20T08:20:00Z", type: "EVIDENCE_REGISTERED", description: "Roaming burst record registered with integrity chain", entityIds: ["ENT-5003"], evidenceId: "EVID-00656" },
  { id: "TL-014", timestamp: "2026-08-20T09:42:00Z", type: "CO_LOCATION", description: "Co-location — vehicle + person at warehouse zone", entityIds: ["ENT-0187", "ENT-4002"], evidenceId: "EVID-00634", locationId: "LOC-2002" },
  { id: "TL-015", timestamp: "2026-08-20T11:17:00Z", type: "TRANSACTION_EVENT", description: "Settlement sweep — Northstar escrow", entityIds: ["ENT-3002", "ENT-0211"], evidenceId: "EVID-00601", locationId: "LOC-2001" },
  { id: "TL-016", timestamp: "2026-08-20T14:32:00Z", type: "INTEGRITY_VERIFIED", description: "Batch 21–39 verified — chain status VALID", entityIds: [], evidenceId: "EVID-00482" },
  { id: "TL-017", timestamp: "2026-08-20T16:04:00Z", type: "EVIDENCE_GAP", description: "Gap flagged — PLINK-01 missing corroborating source", entityIds: ["ENT-0192", "ENT-0211"], evidenceId: "EVID-00514" },
];

/* ------------------------------------------------------------------ */
/* Integrity chain                                                     */
/* ------------------------------------------------------------------ */
export const chainRecords: ChainRecord[] = [
  { id: "CH-018", previous: "0000...018", current: "4f8b...92c1", timestamp: "2026-08-18T14:32:00Z", actor: "INGEST-ENGINE", operation: "EVID-00482 REGISTERED" },
  { id: "CH-019", previous: "4f8b...92c1", current: "7a3e...1d0f", timestamp: "2026-08-18T14:32:00Z", actor: "FUSION-NODE", operation: "EVID-00491 REGISTERED" },
  { id: "CH-020", previous: "7a3e...1d0f", current: "c2d9...5a47", timestamp: "2026-08-19T09:42:00Z", actor: "ANOMALY ENGINE", operation: "ANOM-03 RAISED" },
  { id: "CH-021", previous: "c2d9...5a47", current: "0e6b...3f88", timestamp: "2026-08-19T18:40:00Z", actor: "ANALYST-CELL-07", operation: "EVID-00656 REGISTERED (OPEN)" },
];

/* ------------------------------------------------------------------ */
/* Integrity summary (synthetic, deterministic)                        */
/* ------------------------------------------------------------------ */
export const integritySummary = {
  chain_status: "VALID",
  evidence_registered: evidence.length,
  evidence_verified: evidence.filter((e) => e.integrity.verified).length,
  mismatches: evidence.filter((e) => !e.integrity.verified).length,
  audit_trail: "ACTIVE",
};

export const evidenceGaps = [
  { id: "GAP-01", subject: "PLINK-01 relationship", missing: "Missing corroborating source for Arjun ↔ Rohan link", priority: "HIGH", evidenceIds: ["EVID-00514"], recommend: "CDR triangulation + independent observation" },
  { id: "GAP-02", subject: "ENTITY ENT-0056", missing: "Sanjay Patil identity not independently confirmed", priority: "HIGH", evidenceIds: ["EVID-00502"], recommend: "Telecom + CCTV verification" },
  { id: "GAP-03", subject: "EVID-00656", missing: "Roaming record conflicts with onshore log — pending re-capture", priority: "MEDIUM", evidenceIds: ["EVID-00656"], recommend: "Re-fetch from provider, inspect audit chain" },
];

/* ------------------------------------------------------------------ */
/* Map markers (CaseMarker contract for the shared InvestigationMap)   */
/* ------------------------------------------------------------------ */
export const caseLocations: {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  importance: number;
  entityIds: string[];
}[] = [
  { id: "LOC-2001", name: "Mumbai Central", latitude: 18.9691, longitude: 72.8197, importance: 1, entityIds: ["ENT-0192", "ENT-0187", "ENT-0211", "ENT-0148", "ENT-1001"] },
  { id: "LOC-2002", name: "Navi Mumbai · Warehouse Zone 7", latitude: 19.033, longitude: 73.0297, importance: 0.92, entityIds: ["ENT-0192", "ENT-0332", "ENT-0056", "ENT-1001", "ENT-1004"] },
  { id: "LOC-2003", name: "Pune", latitude: 18.5204, longitude: 73.8567, importance: 0.82, entityIds: ["ENT-0187", "ENT-0318", "ENT-1002"] },
  { id: "LOC-2004", name: "Surat", latitude: 21.1702, longitude: 72.8311, importance: 0.78, entityIds: ["ENT-0211", "ENT-1003", "ENT-1005"] },
  { id: "LOC-2005", name: "Dubai", latitude: 25.2048, longitude: 55.2708, importance: 0.88, entityIds: ["ENT-0211", "ENT-0332", "ENT-0148", "ENT-1002", "ENT-1003", "ENT-5003"] },
  { id: "LOC-2006", name: "New Delhi", latitude: 28.6139, longitude: 77.209, importance: 0.66, entityIds: ["ENT-4003"] },
  { id: "LOC-2007", name: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, importance: 0.7, entityIds: ["ENT-0148", "ENT-0027", "ENT-1002"] },
  { id: "LOC-2008", name: "Bengaluru", latitude: 12.9716, longitude: 77.5946, importance: 0.62, entityIds: ["ENT-0244", "ENT-0027"] },
  { id: "LOC-2009", name: "Hyderabad", latitude: 17.385, longitude: 78.4867, importance: 0.6, entityIds: ["ENT-0091"] },
  { id: "LOC-2010", name: "Kochi", latitude: 9.9312, longitude: 76.2673, importance: 0.58, entityIds: ["ENT-0403"] },
  { id: "LOC-2011", name: "Goa", latitude: 15.2993, longitude: 74.124, importance: 0.4, entityIds: ["ENT-0403"] },
];

export const meridianCaseMarker: CaseMarker = {
  caseId: caseKey,
  title: caseTitle,
  priority: casePriority,
  status: caseStatus,
  locationIds: caseLocations.map((l) => l.id),
  entityIds: entities.map((e) => e.id),
  eventIds: timeline.map((t) => t.id),
  locations: caseLocations.map((l) => ({
    id: l.id,
    caseId: caseKey,
    name: l.name,
    latitude: l.latitude,
    longitude: l.longitude,
    type: "unknown",
    importance: l.importance,
    timestamp: timeline.find((t) => t.locationId === l.id)?.timestamp ?? "",
    entityIds: l.entityIds,
    entityNames: l.entityIds.map((id) => entities.find((e) => e.id === id)?.name ?? id),
    eventIds: timeline.filter((t) => t.locationId === l.id).map((t) => t.id),
    observationCount: timeline.filter((t) => t.locationId === l.id).length,
    sourceCount: 2,
  })),
  events: timeline
    .filter((t) => t.locationId)
    .map((t) => ({
      id: t.id,
      caseId: caseKey,
      locationId: t.locationId!,
      timestamp: t.timestamp,
      type: t.type,
      entityIds: t.entityIds,
      description: t.description,
      sourceIds: t.evidenceId ? [t.evidenceId] : [],
    })),
  lastActivity: "2026-08-20T16:04:00Z",
};

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */
export const entityById = new Map(entities.map((e) => [e.id, e]));
export const relationshipById = new Map(relationships.map((r) => [r.id, r]));
export const evidenceById = new Map(evidence.map((e) => [e.id, e]));

export const netCounts = {
  entities: entities.length,
  relationships: relationships.length,
  evidence: evidence.length,
  communities: COMMUNITY_COUNT,
  potentialLinks: potentialLinks.length,
  anomalies: anomalies.length,
  gaps: evidenceGaps.length,
};

export const communityLabel: Record<number, string> = {
  1: "Mumbai Anchor Cluster",
  2: "Financial Corridor",
  3: "Import Axis",
  4: "Peripheral Ring A",
  5: "Peripheral Ring B",
  6: "Peripheral Ring C",
};

export function neighborsOf(id: string): string[] {
  const set = new Set<string>();
  for (const r of relationships) {
    if (r.source === id) set.add(r.target);
    if (r.target === id) set.add(r.source);
  }
  return [...set];
}

export function degreeOf(id: string): number {
  return relationships.reduce((n, r) => n + (r.source === id || r.target === id ? 1 : 0), 0);
}

export function entitiesOf(ids: string[]): ProtoEntity[] {
  return ids.map((id) => entityById.get(id)).filter((e): e is ProtoEntity => Boolean(e));
}

/** Real BFS component count over the relationship graph. */
export function componentCount(idsToRemove: Set<string>): number {
  const active = new Set(entities.map((e) => e.id));
  idsToRemove.forEach((id) => active.delete(id));
  const adjacency = new Map<string, string[]>();
  active.forEach((id) => adjacency.set(id, []));
  for (const r of relationships) {
    if (!active.has(r.source) || !active.has(r.target)) continue;
    adjacency.get(r.source)!.push(r.target);
    adjacency.get(r.target)!.push(r.source);
  }
  let count = 0;
  const seen = new Set<string>();
  for (const id of active) {
    if (seen.has(id)) continue;
    count += 1;
    const queue = [id];
    seen.add(id);
    while (queue.length) {
      const cur = queue.pop()!;
      for (const nxt of adjacency.get(cur) ?? []) {
        if (!seen.has(nxt)) {
          seen.add(nxt);
          queue.push(nxt);
        }
      }
    }
  }
  return count;
}

export type WhatIfResult = {
  subject: string;
  beforeRelationships: number;
  afterRelationships: number;
  downstream: number;
  communitiesBefore: number;
  communitiesAfter: number;
  fragmented: number;
  interpretation: string;
};

export function simulateRemoval(id: string): WhatIfResult {
  const deg = degreeOf(id);
  const beforeEdges = relationships.length;
  const beforeCommunities = componentCount(new Set());
  const afterCommunities = componentCount(new Set([id]));
  const reached = new Set<string>([id]);
  let frontier = neighborsOf(id);
  frontier.forEach((n) => reached.add(n));
  const affected = new Set<string>(reached);
  const affectedCommunities = new Set(
    entities.filter((e) => affected.has(e.id)).map((e) => e.community),
  );
  const fragmented = Math.max(0, afterCommunities - beforeCommunities);
  return {
    subject: id,
    beforeRelationships: beforeEdges,
    afterRelationships: beforeEdges - deg,
    downstream: affected.size - 1,
    communitiesBefore: beforeCommunities,
    communitiesAfter: afterCommunities,
    fragmented,
    interpretation: `Removing ${entityById.get(id)?.name ?? id} removes ${deg} relationships and affects ${affected.size - 1} directly-connected entities across ${affectedCommunities.size} communities. The network ${fragmented > 0 ? `splits into ${afterCommunities} components (+${fragmented})` : "stays connected"} - downstream investigation priorities must be re-weighted.`,
  };
}

export const entityTypeLabel: Record<ProtoType, string> = {
  Person: "PERSON",
  Organization: "ORGANIZATION",
  Vehicle: "VEHICLE",
  Phone: "PHONE",
  Location: "LOCATION",
  Account: "ACCOUNT",
};

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const mon = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${mon} ${d.getUTCFullYear()} · ${hh}:${mm}:${String(d.getUTCSeconds()).padStart(2, "0")} UTC`;
}

export function formatClock(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}