// src/components/pdf/ReportPDF.js (NEW FILE)

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/logo.png'; // <-- Make sure you have a logo here

// Create styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#222',
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  logo: {
    width: 60,
    height: 60,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 5,
    marginBottom: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 3,
    padding: 8,
    width: '19%',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 8,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#eee',
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row"
  },
  tableColHeader: {
    width: "25%",
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
    fontSize: 9,
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableCol: {
    width: "25%",
    padding: 5,
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tableCell: {
    margin: "auto",
    fontSize: 8
  },
  alert: {
    backgroundColor: '#ffeded',
    borderLeftWidth: 3,
    borderLeftColor: '#e53e3e',
    padding: 6,
    marginBottom: 4,
    fontSize: 9,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});


const ReportPDF = ({ ip, data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Block 1: Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>IP Investigation Report</Text>
        {/* If you don't have a logo, you can comment out the next line */}
        <Image src={logo} style={styles.logo} /> 
      </View>
      <Text style={{fontSize: 12, marginBottom: 20}}>Analysis for IP Address: {ip}</Text>

      {/* Block 2: Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryContainer}>
            <View style={styles.statCard}><Text style={styles.statValue}>{data.summary.totalSessions}</Text><Text style={styles.statLabel}>Total Sessions</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{`${(data.summary.bytesSent / 1024).toFixed(2)} KB`}</Text><Text style={styles.statLabel}>Bytes Sent</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{`${(data.summary.bytesReceived / 1024).toFixed(2)} KB`}</Text><Text style={styles.statLabel}>Bytes Received</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{data.summary.osDetected}</Text><Text style={styles.statLabel}>OS Detected</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{data.summary.userAgent.substring(0, 20) || 'N/A'}</Text><Text style={styles.statLabel}>User Agent</Text></View>
        </View>
      </View>

      {/* Block 4: Sessions Table (Top 15) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
                <View style={{...styles.tableColHeader, width: '30%'}}><Text style={styles.tableCell}>Timestamp</Text></View>
                <View style={{...styles.tableColHeader, width: '10%'}}><Text style={styles.tableCell}>Proto</Text></View>
                <View style={{...styles.tableColHeader, width: '30%'}}><Text style={styles.tableCell}>Source</Text></View>
                <View style={{...styles.tableColHeader, width: '30%'}}><Text style={styles.tableCell}>Destination</Text></View>
            </View>
            {/* Table Body */}
            {data.sessionsTable.slice(0, 15).map((session, i) => (
                <View style={styles.tableRow} key={i}>
                    <View style={{...styles.tableCol, width: '30%'}}><Text style={styles.tableCell}>{session.timestamp}</Text></View>
                    <View style={{...styles.tableCol, width: '10%'}}><Text style={styles.tableCell}>{session.protocol}</Text></View>
                    <View style={{...styles.tableCol, width: '30%'}}><Text style={styles.tableCell}>{session.source}</Text></View>
                    <View style={{...styles.tableCol, width: '30%'}}><Text style={styles.tableCell}>{session.destination}</Text></View>
                </View>
            ))}
        </View>
      </View>

      {/* Block 5: Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Analysis</Text>
        <Text style={{fontSize: 10, marginBottom: 5}}>Suricata Alerts:</Text>
        {data.suricataAlerts.length > 0 ? (
          data.suricataAlerts.map((alert, i) => (
            <View style={styles.alert} key={i}>
                <Text>{`[Severity ${alert.alert.severity}] - ${alert.alert.signature}`}</Text>
            </View>
          ))
        ) : (
          <Text style={{fontSize: 9, fontStyle: 'italic'}}>No Suricata alerts found.</Text>
        )}
      </View>
      
      {/* Page Number */}
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default ReportPDF;
