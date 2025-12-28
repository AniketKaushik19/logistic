import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from "@react-pdf/renderer";

/* ---------------- FONT (Hindi) ---------------- */
Font.register({
  family: "Hindi",
  src: "/fonts/NotoSansDevanagari-Regular.ttf",
});

export default function FreightMemoPDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.memo}>FREIGHT MEMO</Text>
            <Text style={styles.title}>ANIKET LOGISTIC</Text>
            <Text style={styles.sub}>
              7/A Buddh Vihar Colony, Phase-2 Kotwali Road Chinhat, Lucknow-227105
            </Text>
          </View>
        </View>

        <Line />

        {/* ROW 1 */}
        <Row
          left="Challan No."
          leftValue={data.challanNo}
          right="Date"
          rightValue={data.date}
        />

        {/* ROW 2 */}
        <Row
          left="From"
          leftValue={data.from.toUpperCase()}
          right="G.R. No."
          rightValue={data.grNos.join(" / ").toUpperCase()}
        />

        {/* ROW 3 */}
        <Row
          left="Lorry NO."
          leftValue={data.lorryNo.toUpperCase()}
          right="To"
          rightValue={data.to.toUpperCase()}
        />

        {/* ROW 4 */}
        <Row3
          a="No. of Pkgs."
          b="Weight"
          c="Rate"
          av={data.packages}
          bv={data.weight}
          cv={data.rate}
        />

        {/* ROW 5 */}
        <Row3
          a="Total Lorry Hire Rs."
          b="Advance"
          c="Net Balance"
          av={`${data.total}`}
          bv={`${data.advance}`}
          cv={`${data.netBalance}`}
        />

        {/* SINGLE FIELDS */}
        <Single label="Rupee in words" value={data.amountInWords} />
        <Single label="Payable at" value={data.payableAt.toUpperCase()} />

        <Text style={styles.note}>
          After getting a clean Certificate of safe and sound delivery goods.
        </Text>

        <Single
          label="Driver's Name & Address"
          value={data.driverName.toUpperCase()}
        />
        <Single
          label="Owner's Name & Address"
          value={data.ownerName.toUpperCase()}
        />

        {/* VEHICLE */}
        <Row3
          a="Engine No."
          b="Chassis No."
          c="Driver Licence No."
          av={data.engineNo}
          bv={data.chassisNo}
          cv={data.licenceNo.toUpperCase()}
        />

        <Single label="Through" value={data.through.toUpperCase()} />

        {/* NOTES (Hindi) */}
        <View style={styles.notes}>
          <Text>1. माल भरने के बाद हर किस्म के नुकसान की जिम्मेदारी गाड़ी मालिक की होगी।</Text>
          <Text>2. यदि गाड़ी (Direct) न जाये तो बाकी किराया नहीं मिलेगा।</Text>
          <Text>3. माल हमारे (Destination Office) या पार्टी के मुताबिक खाली होगा।</Text>
          <Text>4. रविवार व अन्य छुट्टी के दिन माल खाली नहीं होगा।</Text>
          <Text>5. माल का भाड़ा (Destination Office) कांटे के मुताबिक मिलेगा।</Text>
        </View>

        {/* SIGNATURE */}
        <View style={styles.signRow}>
          <Text>Signature of Driver / Owner / Agent Clerk</Text>
          <Text>Signature of Challan</Text>
        </View>

      </Page>
    </Document>
  );
}
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  logo: {
    width: 45,
    height: 45,
    marginRight: 8,
  },

  headerText: {
    flex: 1,
    textAlign: "center",
  },

  memo: {
    fontSize: 9,
    letterSpacing: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  sub: {
    fontSize: 9,
  },

  line: {
    borderBottomWidth: 1,
    marginVertical: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  field: {
    width: "48%",
  },

  dotted: {
    borderBottomWidth: 1,
    borderStyle: "dotted",
    marginTop: 8,
  },

  row3: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  col3: {
    width: "32%",
  },

  single: {
    marginVertical: 8,
  },

  note: {
    marginVertical: 10,
  },

  notes: {
    marginTop: 10,
    fontSize: 8,
    fontFamily: "Hindi",
    lineHeight: 1.4,
  },

  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    fontSize: 9,
  },
});
const Line = () => <View style={styles.line} />;

const Field = ({ label, value, style }) => (
  <View style={[styles.field, style]}>
    <Text>{label}</Text>
    {value && <Text>{value}</Text>}
    <View style={styles.dotted} />
  </View>
);

const Row = ({ left, leftValue, right, rightValue }) => (
  <View style={styles.row}>
    <Field label={left} value={leftValue} />
    <Field label={right} value={rightValue} />
  </View>
);

const Row3 = ({ a, b, c, av, bv, cv }) => (
  <View style={styles.row3}>
    <Field label={a} value={av} style={styles.col3} />
    <Field label={b} value={bv} style={styles.col3} />
    <Field label={c} value={cv} style={styles.col3} />
  </View>
);

const Single = ({ label, value }) => (
  <View style={styles.single}>
    <Text>{label}</Text>
    {value && <Text>{value}</Text>}
    <View style={styles.dotted} />
  </View>
);

const CenterField = ({ label, value }) => (
  <View style={{ marginVertical: 8 }}>
    <Text style={{ textAlign: "center" }}>{label}</Text>
    {value && <Text style={{ textAlign: "center" }}>{value}</Text>}
    <View style={styles.dotted} />
  </View>
);
