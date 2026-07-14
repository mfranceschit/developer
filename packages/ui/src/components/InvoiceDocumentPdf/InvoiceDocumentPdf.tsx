import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { colors } from '../../tokens/colors';
import type { InvoiceDocumentProps, InvoicePartyInfo } from '../InvoiceDocument/InvoiceDocument';

const palette = {
  strong: colors.blue[700],
  body: colors.gray[800],
  muted: colors.gray[500],
  border: colors.gray[200],
  white: colors.white,
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: palette.white,
    color: palette.body,
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingVertical: 48,
    paddingHorizontal: 48,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 24, color: palette.strong, letterSpacing: -0.5 },
  headerMeta: { textAlign: 'right', fontSize: 11, color: palette.body },
  headerMutedLabel: { color: palette.muted },
  parties: { flexDirection: 'row', marginTop: 32 },
  party: { width: '50%', paddingRight: 24 },
  partyLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: palette.muted,
  },
  partyName: { marginTop: 4, fontSize: 11, fontFamily: 'Helvetica-Bold', color: palette.strong },
  partyLine: { fontSize: 9, color: palette.body, marginTop: 1 },
  table: { marginTop: 32 },
  thead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingBottom: 6,
  },
  th: { fontSize: 9, textTransform: 'uppercase', color: palette.muted },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: 6,
  },
  td: { fontSize: 10 },
  colQty: { width: '8%' },
  colDesc: { width: '46%' },
  colUnit: { width: '18%', textAlign: 'right' },
  colVat: { width: '10%', textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },
  totals: { marginTop: 24, flexDirection: 'row', justifyContent: 'flex-end' },
  totalsBox: { width: 220 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalsLabel: { color: palette.muted },
  totalsDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 6,
    marginTop: 3,
  },
  totalsDueText: { fontFamily: 'Helvetica-Bold', color: palette.strong },
  notes: { marginTop: 32, fontSize: 9, color: palette.muted },
});

function Party({ label, party }: { label: string; party: InvoicePartyInfo }) {
  return (
    <View style={styles.party}>
      <Text style={styles.partyLabel}>{label}</Text>
      <Text style={styles.partyName}>{party.name}</Text>
      {party.taxId ? <Text style={styles.partyLine}>Tax ID: {party.taxId}</Text> : null}
      <Text style={styles.partyLine}>{party.address}</Text>
      <Text style={styles.partyLine}>Phone: {party.phone}</Text>
      <Text style={styles.partyLine}>Email: {party.email}</Text>
    </View>
  );
}

export function InvoiceDocumentPdf({
  invoiceNumber,
  issueDate,
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.headerMeta}>
            <Text>
              <Text style={styles.headerMutedLabel}>Invoice Number </Text>
              {invoiceNumber}
            </Text>
            <Text>
              <Text style={styles.headerMutedLabel}>Issue Date </Text>
              {issueDate}
            </Text>
          </View>
        </View>

        <View style={styles.parties}>
          <Party label="Issuer" party={issuer} />
          <Party label="Bill To" party={billTo} />
        </View>

        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colUnit]}>Unit Price ({currency})</Text>
            <Text style={[styles.th, styles.colVat]}>VAT</Text>
            <Text style={[styles.th, styles.colTotal]}>Total ({currency})</Text>
          </View>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.td, styles.colUnit]}>
                {formatMoney(item.unitPrice, currency)}
              </Text>
              <Text style={[styles.td, styles.colVat]}>{taxRate}%</Text>
              <Text style={[styles.td, styles.colTotal]}>
                {formatMoney(item.quantity * item.unitPrice, currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text>{formatMoney(totals.subtotal, currency)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>VAT ({taxRate}%)</Text>
              <Text>{formatMoney(totals.vat, currency)}</Text>
            </View>
            <View style={styles.totalsDueRow}>
              <Text style={styles.totalsDueText}>Total Due</Text>
              <Text style={styles.totalsDueText}>{formatMoney(totals.total, currency)}</Text>
            </View>
          </View>
        </View>

        {notes ? <Text style={styles.notes}>{notes}</Text> : null}
      </Page>
    </Document>
  );
}
