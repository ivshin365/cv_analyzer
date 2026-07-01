import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Cv } from "@/lib/ai/schemas";

/*
 * ATS-safe CV template: single column, Helvetica (a standard core PDF font),
 * real selectable text, standard section headings, no tables/columns/graphics.
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#222222",
    lineHeight: 1.4,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    // Explicit line height: the page-level lineHeight is not applied to this
    // larger font, so without this the headline collides up into the name.
    lineHeight: 1.2,
  },
  headline: { fontSize: 11, marginTop: 2, color: "#444444" },
  contact: { fontSize: 9, marginTop: 4, color: "#444444" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summary: { marginTop: 2 },
  expItem: { marginBottom: 8 },
  expHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  expDates: { fontSize: 9, color: "#555555" },
  expCompany: { fontSize: 10, color: "#333333", marginBottom: 2 },
  bulletRow: { flexDirection: "row", marginTop: 1 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  skillsText: { marginTop: 2 },
  eduItem: { marginBottom: 4 },
});

function contactLine(cv: Cv): string {
  return [cv.email, cv.phone, cv.location, ...cv.links]
    .filter(Boolean)
    .join("  •  ");
}

export function CvDocument({ cv }: { cv: Cv }) {
  return (
    <Document
      title={`${cv.fullName} - CV`}
      author={cv.fullName}
      subject="Curriculum Vitae"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{cv.fullName}</Text>
        {cv.headline ? <Text style={styles.headline}>{cv.headline}</Text> : null}
        <Text style={styles.contact}>{contactLine(cv)}</Text>

        {cv.summary ? (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{cv.summary}</Text>
          </View>
        ) : null}

        {cv.skills.length ? (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>{cv.skills.join(", ")}</Text>
          </View>
        ) : null}

        {cv.experience.length ? (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {cv.experience.map((exp, i) => (
              <View key={i} style={styles.expItem} wrap={false}>
                <View style={styles.expHeaderRow}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expDates}>
                    {exp.startDate}
                    {exp.endDate ? ` – ${exp.endDate}` : ""}
                  </Text>
                </View>
                <Text style={styles.expCompany}>
                  {[exp.company, exp.location].filter(Boolean).join(", ")}
                </Text>
                {exp.bullets.map((b, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {cv.education.length ? (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {cv.education.map((ed, i) => (
              <View key={i} style={styles.eduItem} wrap={false}>
                <View style={styles.expHeaderRow}>
                  <Text style={styles.expTitle}>{ed.degree}</Text>
                  <Text style={styles.expDates}>
                    {[ed.startDate, ed.endDate].filter(Boolean).join(" – ")}
                  </Text>
                </View>
                <Text style={styles.expCompany}>
                  {[ed.institution, ed.location].filter(Boolean).join(", ")}
                </Text>
                {ed.details ? <Text>{ed.details}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {cv.certifications.length ? (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {cv.certifications.map((c, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{c}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
