import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#222222",
    lineHeight: 1.5,
  },
  header: { marginBottom: 18 },
  name: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#111111", lineHeight: 1.2 },
  contact: { fontSize: 9, marginTop: 3, color: "#444444" },
  date: { fontSize: 10, marginBottom: 14, color: "#444444" },
  paragraph: { marginBottom: 10 },
});

export function CoverLetterDocument({
  body,
  name,
  contact,
}: {
  body: string;
  name: string;
  contact: string;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <Document title={`${name} - Cover Letter`} author={name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {contact ? <Text style={styles.contact}>{contact}</Text> : null}
        </View>
        <Text style={styles.date}>{today}</Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
