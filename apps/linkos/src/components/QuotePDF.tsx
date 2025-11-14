import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Quote, QuoteItem, Customer, Lead } from '@wyalink/supabase-client'

// WyaLink Brand Colors
const COLORS = {
  primary: '#00254a', // WyaLink Blue
  secondary: '#36b1b3', // WyaLink Teal
  accent: '#f37021', // WyaLink Orange
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    600: '#4b5563',
    700: '#374151',
    900: '#111827',
  },
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: `3px solid ${COLORS.primary}`,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  quoteNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  quoteStatus: {
    fontSize: 11,
    color: COLORS.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  companyInfo: {
    fontSize: 9,
    color: COLORS.gray[600],
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '30%',
    fontSize: 10,
    color: COLORS.gray[600],
    fontWeight: 'bold',
  },
  infoValue: {
    width: '70%',
    fontSize: 10,
    color: COLORS.gray[900],
  },
  table: {
    marginTop: 15,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    padding: 10,
    fontSize: 9,
  },
  tableRowAlt: {
    backgroundColor: COLORS.gray[50],
  },
  colItem: {
    width: '40%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '20%',
    textAlign: 'right',
  },
  colTotal: {
    width: '25%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: 250,
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  totalRowFinal: {
    backgroundColor: COLORS.primary,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    paddingVertical: 8,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.gray[700],
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  notesSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.gray[50],
    borderLeft: `3px solid ${COLORS.secondary}`,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.gray[700],
    lineHeight: 1.5,
  },
  termsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: `1px solid ${COLORS.gray[200]}`,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  termsText: {
    fontSize: 8,
    color: COLORS.gray[600],
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: COLORS.gray[600],
    fontSize: 8,
    borderTop: `1px solid ${COLORS.gray[200]}`,
    paddingTop: 10,
  },
  accentBar: {
    height: 4,
    backgroundColor: COLORS.accent,
    marginBottom: 10,
  },
})

interface QuotePDFProps {
  quote: Quote & {
    customer?: Customer
    lead?: Lead
    quote_items?: QuoteItem[]
  }
}

const QuotePDF: React.FC<QuotePDFProps> = ({ quote }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const customerName =
    quote.customer
      ? `${quote.customer.first_name} ${quote.customer.middle_initial ? quote.customer.middle_initial + '. ' : ''}${quote.customer.last_name}`
      : quote.lead
      ? `${quote.lead.first_name || ''} ${quote.lead.last_name || ''}`.trim() || quote.lead.email
      : 'N/A'

  const customerEmail = quote.customer?.email || quote.lead?.email || 'N/A'
  const customerPhone = quote.customer?.phone || quote.lead?.phone || 'N/A'

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Accent Bar */}
        <View style={styles.accentBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.quoteNumber}>Quote #{quote.quote_number}</Text>
              <Text style={styles.quoteStatus}>
                Status: {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Text>
            </View>
            <View>
              <Text style={[styles.companyInfo, { fontWeight: 'bold', fontSize: 14, color: COLORS.primary }]}>
                WyaLink
              </Text>
              <Text style={styles.companyInfo}>Your Wireless Provider</Text>
              <Text style={styles.companyInfo}>support@wyalink.com</Text>
            </View>
          </View>
        </View>

        {/* Quote Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date Created:</Text>
            <Text style={styles.infoValue}>{formatDate(quote.created_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valid Until:</Text>
            <Text style={styles.infoValue}>{formatDate(quote.expires_at)}</Text>
          </View>
          {quote.accepted_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Accepted On:</Text>
              <Text style={styles.infoValue}>{formatDate(quote.accepted_at)}</Text>
            </View>
          )}
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {quote.customer_id ? 'Customer' : 'Lead'} Information
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{customerName}</Text>
          </View>
          {quote.customer?.company_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Company:</Text>
              <Text style={styles.infoValue}>{quote.customer.company_name}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{customerEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{customerPhone}</Text>
          </View>
          {quote.customer && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>
                {quote.customer.billing_address_line1}
                {quote.customer.billing_address_line2 && `, ${quote.customer.billing_address_line2}`}
                , {quote.customer.billing_city}, {quote.customer.billing_state} {quote.customer.billing_zip}
              </Text>
            </View>
          )}
        </View>

        {/* Quote Items */}
        {quote.quote_items && quote.quote_items.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Quote Items</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colItem}>Item</Text>
              <Text style={styles.colQuantity}>Qty</Text>
              <Text style={styles.colPrice}>Unit Price</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {quote.quote_items.map((item: any, index: number) => (
              <View
                key={item.id}
                style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
              >
                <View style={styles.colItem}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>{item.item_name}</Text>
                  {item.item_description && (
                    <Text style={{ fontSize: 8, color: COLORS.gray[600] }}>
                      {item.item_description}
                    </Text>
                  )}
                </View>
                <Text style={styles.colQuantity}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
                <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>
          {quote.discount_total > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: COLORS.accent }]}>Discount:</Text>
              <Text style={[styles.totalValue, { color: COLORS.accent }]}>
                -{formatCurrency(quote.discount_total)}
              </Text>
            </View>
          )}
          {quote.tax_total > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(quote.tax_total)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Total:</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Internal Notes</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Terms & Conditions */}
        {quote.terms && (
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{quote.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>WyaLink " Your Wireless Provider " www.wyalink.com</Text>
          <Text style={{ marginTop: 3 }}>
            Thank you for choosing WyaLink for your wireless needs!
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default QuotePDF
