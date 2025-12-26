import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";


const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  border: {
    border: "1 solid #000",
  },

  header: {
    border: "1 solid #000",
    padding: 8,
    marginBottom: 6,
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
  },

  row: {
    flexDirection: "row",
  },

  cell: {
    borderRight: "1 solid #000",
    padding: 4,
  },

  label: {
    fontSize: 7,
    color: "#444",
  },

  value: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 2,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderBottom: "1 solid #000",
  },

  tableRow: {
    flexDirection: "row",
    minHeight: 30,
    borderBottom: "1 solid #000",
  },

  footerBox: {
    border: "1 solid #000",
    padding: 6,
    marginTop: 6,
  },

  sign: {
    marginTop: 25,
    textAlign: "right",
  },
});

export const BillPDF= ({bill}) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>ANIKET LOGISTIC</Text>
        <Text style={styles.subtitle}>
          Fleet Owners & Transport Contractors
        </Text>
      </View>

      {/* META ROW */}
      <View style={[styles.row, styles.border]}>
        <View style={[styles.cell, { width: "25%" }]}>
          <Text style={styles.label}>Bill No</Text>
          <Text style={styles.value}>{bill.billNo}</Text>
        </View>
        <View style={[styles.cell, { width: "25%" }]}>
          <Text style={styles.label}>Bill Date</Text>
          <Text style={styles.value}>{bill.billDate}</Text>
        </View>
        <View style={[styles.cell, { width: "25%" }]}>
          <Text style={styles.label}>Party Code</Text>
          <Text style={styles.value}>{bill.partyCode}</Text>
        </View>
        <View style={{ width: "25%", padding: 4 }}>
          <Text style={styles.label}>Vendor Code</Text>
          <Text style={styles.value}>{bill.vendorCode}</Text>
        </View>
      </View>

      {/* PARTY DETAILS */}
      <View style={[styles.border, { padding: 6, marginTop: 6 }]}>
        <Text>
          <Text style={styles.label}>To: </Text>
          {bill.customer}
        </Text>
        <Text>
          <Text style={styles.label}>Address: </Text>
          {bill.customerAddress}
        </Text>
        <Text>
          <Text style={styles.label}>GSTIN: </Text>
          {bill.customerGstin}
        </Text>
      </View>

      {/* CONSIGNMENT TABLE */}
      <View style={[styles.border, { marginTop: 8 }]}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { width: "5%" }]}>S.N</Text>
          <Text style={[styles.cell, { width: "12%" }]}>CN No</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Date</Text>
          <Text style={[styles.cell, { width: "12%" }]}>From</Text>
          <Text style={[styles.cell, { width: "12%" }]}>To</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Rate</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Freight</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Labour</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Bonus</Text>
          <Text style={{ width: "9%", padding: 4 }}>Total</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.cell, { width: "5%" }]}>1</Text>
          <Text style={[styles.cell, { width: "12%" }]}>{bill.billDate}</Text>
          <Text style={[styles.cell, { width: "10%" }]}>{bill.cnDate}</Text>
          <Text style={[styles.cell, { width: "12%" }]}>{bill.from}</Text>
          <Text style={[styles.cell, { width: "12%" }]}>{bill.to}</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Fixed</Text>
          <Text style={[styles.cell, { width: "10%" }]}>{bill.freight}</Text>
          <Text style={[styles.cell, { width: "10%" }]}>{bill.labour}</Text>
          <Text style={[styles.cell, { width: "10%" }]}>{bill.detention}</Text>
          <Text style={[styles.cell, { width: "10%" }]}>{bill.bonus}</Text>
          <Text style={{ width: "9%", padding: 4 }}>{bill.total}</Text>
        </View>
      </View>

      {/* AMOUNT & PAN */}
      <View style={[styles.row, { marginTop: 6 }]}>
        <View style={[styles.footerBox, { width: "70%" }]}>
          <Text>
            <Text style={styles.label}>Amount in Words: </Text>
            {""}
          </Text>
        </View>
        <View style={[styles.footerBox, { width: "30%" }]}>
          <Text>
            <Text style={styles.label}>PAN No: </Text>
            CPTPK5713K
          </Text>
        </View>
      </View>

      {/* ENCLOSED */}
      <View style={styles.footerBox}>
        <Text>
          Enclosed: 01 Page | No Acknowledgement for S.N 1
        </Text>
        <Text style={{ marginTop: 4 }}>
          Copy: <Text style={{ fontWeight: "bold" }}>Consignee Copy</Text>
        </Text>
      </View>

      {/* SIGN */}
      <View style={styles.sign}>
        <Text>For ANIKET KAUSHIK</Text>
        <Text style={{ marginTop: 20 }}>Bill Incharge</Text>
      </View>
    </Page>
  </Document>
);
