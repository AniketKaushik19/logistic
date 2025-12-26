import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 14,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  table: {
    borderWidth: 1,
    borderColor: "#000",
  },

  row: {
    flexDirection: "row",
  },

  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
    flex: 1,
  },

  lastCell: {
    borderRightWidth: 0,
  },

  bold: {
    fontWeight: "bold",
  },

  center: {
    textAlign: "center",
  },

  headerText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  small: {
    fontSize: 8,
  },
});

export default function BillPDF({ bill }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ================= HEADER ================= */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.cell, { flex: 3 }]}>
              <Text style={[styles.headerText, styles.center]}>
                ANIKET KAUSHIK
              </Text>
              <Text style={[styles.center, styles.small]}>
                FLEET OWNERS & TRANSPORT CONTRACTORS
              </Text>
            </View>
            <View style={styles.cell}>
              <Text>Bill No</Text>
              <Text>{bill.billNo}</Text>
            </View>
            <View style={[styles.cell, styles.lastCell]}>
              <Text>Bill Date</Text>
              <Text>{bill.date}</Text>
            </View>
          </View>
        </View>

        {/* ================= PARTY ================= */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.cell, { flex: 4 }]}>
              <Text>To:</Text>
              <Text style={styles.bold}>{bill.party}</Text>
            </View>
            <View style={[styles.cell, styles.lastCell]}>
              <Text>GSTIN</Text>
            </View>
          </View>
        </View>

        {/* ================= TABLE HEADER ================= */}
        <View style={styles.table}>
          <View style={styles.row}>
            {[
              "S.No",
              "CN No",
              "CN Date",
              "From",
              "To",
              "Rate",
              "Freight",
              "Labour",
              "Detention",
              "Bonus",
              "Total",
            ].map((h, i) => (
              <Text
                key={i}
                style={[
                  styles.cell,
                  styles.bold,
                  i === 10 && styles.lastCell,
                ]}
              >
                {h}
              </Text>
            ))}
          </View>

          {/* ================= TABLE ROW ================= */}
          <View style={styles.row}>
            <Text style={styles.cell}>1</Text>
            <Text style={styles.cell}>{bill.cnNo}</Text>
            <Text style={styles.cell}>{bill.cnDate}</Text>
            <Text style={styles.cell}>{bill.from}</Text>
            <Text style={styles.cell}>{bill.to}</Text>
            <Text style={styles.cell}>FIXED</Text>
            <Text style={styles.cell}>{bill.amount}</Text>
            <Text style={styles.cell}>-</Text>
            <Text style={styles.cell}>-</Text>
            <Text style={styles.cell}>-</Text>
            <Text style={[styles.cell, styles.lastCell]}>
              {bill.amount}
            </Text>
          </View>
        </View>

        {/* ================= AMOUNT IN WORDS ================= */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.cell, { flex: 4 }]}>
              <Text>Rs. (In Words):</Text>
              <Text className="bold">Seven Hundred Only</Text>
            </View>
            <View style={[styles.cell, styles.lastCell]}>
              <Text>Total Freight ₹</Text>
              <Text style={styles.bold}>{bill.amount}</Text>
            </View>
          </View>
        </View>

        {/* ================= PAN ================= */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.cell, { flex: 4 }]}>
              <Text>Enclosed: 01 Page</Text>
            </View>
            <View style={[styles.cell, styles.lastCell]}>
              <Text>PAN No:</Text>
              <Text>{bill.pan}</Text>
            </View>
          </View>
        </View>

        {/* ================= SIGNATURE ================= */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.cell, { flex: 3, borderBottomWidth: 0 }]}>
              <Text />
            </View>
            <View
              style={[
                styles.cell,
                styles.lastCell,
                { borderBottomWidth: 0, alignItems: "center" },
              ]}
            >
              <Text>For ANIKET KAUSHIK</Text>
              <Text style={{ marginTop: 25 }}>Authorised Signatory</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
