import {
  Document,
  Font,
  G,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';

import { colors } from '../../tokens/colors';
import type { InvoiceDocumentProps, InvoicePartyInfo } from '../InvoiceDocument/InvoiceDocument';

// `URL` is a web-standard global (unlike `node:url`), so this stays safe if the module
// is pulled into a browser bundle via the barrel export — only Node ever calls Font.register.
const fontDir = new URL('../../../assets/fonts/', import.meta.url).pathname;

Font.register({
  family: 'Inter',
  fonts: [
    { src: `${fontDir}Inter-Regular.ttf`, fontWeight: 400 },
    { src: `${fontDir}Inter-SemiBold.ttf`, fontWeight: 600 },
    { src: `${fontDir}Inter-Bold.ttf`, fontWeight: 700 },
  ],
});

const palette = {
  navy: colors.blue[700],
  navyMid: colors.blue[600],
  blueMuted: colors.blue[300],
  blueSoft: colors.blue[100],
  blueWash: colors.blue[50],
  berrySoft: colors.berry[300],
  body: colors.gray[800],
  bodyMid: colors.gray[600],
  muted: colors.gray[500],
  border: colors.gray[200],
  trama: colors.gray[75],
  sand: colors.sand,
  bark: colors.bark,
  white: colors.white,
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// A4 = 595.28 × 841.89pt. Design was built at 794×1123px (96dpi); values are ×0.75.
const styles = StyleSheet.create({
  page: {
    backgroundColor: palette.white,
    color: palette.body,
    fontFamily: 'Inter',
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  header: {
    backgroundColor: palette.navy,
    color: palette.white,
    paddingVertical: 33,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordmark: { fontSize: 10.5, fontWeight: 600, letterSpacing: 3.6, color: palette.white },
  wordmarkSub: {
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: palette.blueMuted,
    marginTop: 1.5,
  },
  eyebrow: {
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.berrySoft,
  },
  invoiceNumber: { fontSize: 19.5, fontWeight: 700, letterSpacing: -0.3, marginTop: 1.5 },
  headerDates: { fontSize: 8.6, color: palette.blueSoft, marginTop: 9 },
  parties: { paddingTop: 36, paddingHorizontal: 48, flexDirection: 'row', gap: 36 },
  party: { width: '50%' },
  partyLabel: {
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.muted,
  },
  partyName: { fontWeight: 700, color: palette.navy, marginTop: 4.5 },
  partyLines: { fontSize: 8.6, color: palette.bodyMid, marginTop: 2, lineHeight: 1.6 },
  table: { paddingTop: 33, paddingHorizontal: 48 },
  thead: {
    flexDirection: 'row',
    backgroundColor: palette.blueWash,
    borderRadius: 3,
    paddingVertical: 7,
    paddingHorizontal: 9,
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: palette.navyMid,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: 8,
    paddingHorizontal: 9,
    fontSize: 9.4,
    backgroundColor: palette.white,
  },
  colQty: { width: '8%' },
  colDesc: { width: '46%' },
  colUnit: { width: '18%', textAlign: 'right' },
  colVat: { width: '10%', textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },
  bottom: {
    paddingTop: 21,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notes: { maxWidth: 255 },
  notesText: { fontSize: 8.6, color: palette.bodyMid, marginTop: 4 },
  totalsBox: { width: 195 },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 9.4,
  },
  totalsLabel: { color: palette.muted },
  totalsDue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: palette.navy,
    color: palette.white,
    borderRadius: 3,
    marginTop: 6,
    paddingVertical: 7.5,
    paddingHorizontal: 9,
    fontSize: 10.5,
    fontWeight: 700,
  },
  footer: {
    backgroundColor: palette.sand,
    paddingVertical: 12,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.9,
    color: palette.bark,
  },
  footerWordmark: { letterSpacing: 3.6, fontWeight: 600 },
});

// MFT monogram, 188×136 viewBox.
function Monogram({ size, fill }: { size: number; fill: string }) {
  return (
    <Svg width={size} height={(size * 136) / 188} viewBox="0 0 188 136">
      <Path d="M0 32C0 14.3269 14.3269 0 32 0V136H0V32Z" fill={fill} />
      <Path d="M83 109L49 109L49 0L83 0L83 109Z" fill={fill} />
      <Rect x={66} y={48} width={93} height={31} fill={fill} />
      <Path d="M100 0H163.285C176.737 0 187.642 10.9051 187.642 24.3571V31.0989H100V0Z" fill={fill} />
      <Rect x={100} y={93} width={31} height={43} fill={fill} />
    </Svg>
  );
}

// Trama letterhead scatter — px coords from the approved design, ×0.75 to pt.
// r rotates about the monogram center (94,68); s already includes the pt factor.
const TRAMA: Array<{ x: number; y: number; s: number; r: number }> = [
  { x: 68, y: 158, s: 0.34, r: 0 },   { x: 233, y: 199, s: 0.38, r: 90 },
  { x: 465, y: 161, s: 0.3, r: 180 }, { x: 353, y: 255, s: 0.41, r: 0 },
  { x: 105, y: 293, s: 0.38, r: 270 },{ x: 45, y: 390, s: 0.34, r: 90 },
  { x: 263, y: 360, s: 0.38, r: 180 },{ x: 503, y: 353, s: 0.34, r: 90 },
  { x: 180, y: 458, s: 0.41, r: 0 },  { x: 390, y: 443, s: 0.3, r: 270 },
  { x: 518, y: 491, s: 0.38, r: 0 },  { x: 90, y: 529, s: 0.34, r: 180 },
  { x: 30, y: 604, s: 0.38, r: 0 },   { x: 154, y: 585, s: 0.34, r: 90 },
  { x: 285, y: 570, s: 0.41, r: 180 },{ x: 420, y: 593, s: 0.34, r: 0 },
  { x: 521, y: 619, s: 0.38, r: 270 },{ x: 75, y: 679, s: 0.41, r: 180 },
  { x: 225, y: 664, s: 0.34, r: 0 },  { x: 353, y: 686, s: 0.38, r: 90 },
  { x: 484, y: 709, s: 0.34, r: 180 },{ x: 135, y: 754, s: 0.38, r: 270 },
  { x: 296, y: 769, s: 0.41, r: 0 },  { x: 450, y: 776, s: 0.34, r: 90 },
  { x: 41, y: 799, s: 0.3, r: 90 },
];

function Trama() {
  return (
    <Svg
      fixed
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={595.28}
      height={841.89}
      viewBox="0 0 595.28 841.89"
    >
      {TRAMA.map(({ x, y, s, r }, i) => (
        <G
          key={i}
          transform={`translate(${x},${y}) scale(${s}) translate(94,68) rotate(${r}) translate(-94,-68)`}
        >
          <Path d="M0 32C0 14.3269 14.3269 0 32 0V136H0V32Z" fill={palette.trama} />
          <Path d="M83 109L49 109L49 0L83 0L83 109Z" fill={palette.trama} />
          <Rect x={66} y={48} width={93} height={31} fill={palette.trama} />
          <Path d="M100 0H163.285C176.737 0 187.642 10.9051 187.642 24.3571V31.0989H100V0Z" fill={palette.trama} />
          <Rect x={100} y={93} width={31} height={43} fill={palette.trama} />
        </G>
      ))}
    </Svg>
  );
}

function Party({ label, party }: { label: string; party: InvoicePartyInfo }) {
  return (
    <View style={styles.party}>
      <Text style={styles.partyLabel}>{label}</Text>
      <Text style={styles.partyName}>{party.name}</Text>
      <View style={styles.partyLines}>
        {party.taxId ? <Text>Tax ID: {party.taxId}</Text> : null}
        <Text>{party.address}</Text>
        <Text>{party.phone}</Text>
        <Text>{party.email}</Text>
      </View>
    </View>
  );
}

export function InvoiceDocumentPdf({
  invoiceNumber,
  issueDate,
  dueDate,
  issuer,
  billTo,
  lineItems,
  currency,
  taxRate,
  totals,
  notes,
}: InvoiceDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Trama />

        <View style={styles.header}>
          <View style={styles.lockup}>
            <Monogram size={34.5} fill={palette.sand} />
            <View>
              <Text style={styles.wordmark}>mfranceschit</Text>
              <Text style={styles.wordmarkSub}>developer</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.eyebrow}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.headerDates}>
              Issued {issueDate}
              {dueDate ? ` · Due ${dueDate}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.parties}>
          <Party label="Issuer" party={issuer} />
          <Party label="Bill to" party={billTo} />
        </View>

        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colUnit}>Unit price</Text>
            <Text style={styles.colVat}>VAT</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colUnit}>{formatMoney(item.unitPrice, currency)}</Text>
              <Text style={styles.colVat}>{taxRate}%</Text>
              <Text style={styles.colTotal}>
                {formatMoney(item.quantity * item.unitPrice, currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.bottom}>
          <View style={styles.notes}>
            {notes ? (
              <>
                <Text style={styles.partyLabel}>Notes</Text>
                <Text style={styles.notesText}>{notes}</Text>
              </>
            ) : null}
          </View>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text>{formatMoney(totals.subtotal, currency)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>VAT ({taxRate}%)</Text>
              <Text>{formatMoney(totals.vat, currency)}</Text>
            </View>
            <View style={styles.totalsDue}>
              <Text>Total due</Text>
              <Text>
                {formatMoney(totals.total, currency)} {currency}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexGrow: 1 }} />

        <View style={styles.footer}>
          <Text style={styles.footerWordmark}>mfranceschit</Text>
          <Text>
            {issuer.email} · {issuer.phone}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
