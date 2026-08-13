from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from pathlib import Path

OUTPUT = str(Path(__file__).resolve().with_name("christopher-stassinos-cv.pdf"))

NAME = "Christopher Stassinos"
TITLE = "Cybersecurity Engineer"
CONTACT = "San Diego, CA  •  chrisstassinos@gmail.com  •  linkedin.com/in/christopher-stassinos  •  github.com/christopher-stassinos"

SUMMARY = (
    "Cybersecurity engineer with <b>5+ years of MSP and enterprise IT experience</b> across security operations, "
    "identity, endpoints, networking, and cloud-connected infrastructure. Hands-on with Huntress, Microsoft Defender XDR, "
    "Microsoft 365, Entra ID, Intune, Active Directory, ConnectWise PSA, and RMM platforms. "
    "Backed by Security+, Network+, AWS, Palo Alto, and IBM cybersecurity credentials plus home lab work "
    "in Splunk, Active Directory, pfSense, VMware, and packet analysis."
)

EXPERIENCE = [
    {
        "role": "MSP Support Engineer",
        "company": "724IT",
        "location": "San Diego, CA",
        "dates": "Jul 2026–Present",
        "bullets": [
            "Monitor and triage Huntress and Microsoft Defender XDR incidents and alerts, reviewing endpoint timelines, user and sign-in context, and indicators to document findings and coordinate containment, remediation, or escalation.",
            "Administer Microsoft 365, Entra ID, Intune, Active Directory, MFA, Conditional Access, and user/device lifecycle workflows including onboarding, offboarding, access changes, endpoint enrollment, and policy troubleshooting.",
            "Troubleshoot business networks and security infrastructure across TCP/IP, DNS, DHCP, Wi-Fi, VLANs, VPNs, switches, and firewalls while managing tickets and remote support through ConnectWise PSA and RMM tooling.",
        ],
    },
    {
        "role": "Slot Systems Technician",
        "company": "Jamul Casino",
        "location": "San Diego, CA",
        "dates": "2025–2026",
        "bullets": [
            "Configure, maintain, and troubleshoot slot systems across hardware diagnostics, device communication, IP addressing, and network connectivity in a high-availability casino environment.",
            "Restore uptime by isolating faults across hardware and network layers and coordinating practical fixes quickly during operational incidents.",
        ],
    },
    {
        "role": "Computer Engineer 2",
        "company": "Viejas Casino",
        "location": "San Diego, CA",
        "dates": "2022–2024",
        "bullets": [
            "Supported 1,500+ enterprise devices across Windows, macOS, Linux, iOS, and Android environments spanning endpoints, servers, printers, network hardware, and proprietary systems.",
            "Delivered cross-platform troubleshooting and end-user support across infrastructure, operational technology, and cloud-connected tools used in daily casino operations.",
        ],
    },
    {
        "role": "PC/LAN Technician",
        "company": "Sycuan Casino",
        "location": "San Diego, CA",
        "dates": "2021–2022",
        "bullets": [
            "Supported 1,000+ devices and resolved enterprise outages during overnight operations where independent troubleshooting and continuity were critical.",
            "Administered Active Directory users, permissions, and access-related requests while balancing user support with infrastructure troubleshooting.",
        ],
    },
]

PROJECTS = [
    {
        "name": "SIEM Home Lab",
        "stack": "Splunk • Windows Server Active Directory • VMware • pfSense",
        "bullets": [
            "Built a VMware-based security lab with Windows Server Active Directory, pfSense, and Splunk Free to centralize host, identity, and network telemetry.",
            "Collected Windows Event Logs, Sysmon telemetry, and AD audit data; simulated brute force, account lockout, and privilege escalation scenarios; and wrote Splunk searches to detect each event.",
        ],
    },
    {
        "name": "Network Traffic Analysis",
        "stack": "Wireshark • tcpdump • Kali Linux",
        "bullets": [
            "Captured and analyzed HTTP, FTP, DNS, ARP, and TCP traffic to identify cleartext credentials, ARP spoofing behavior, and other indicators useful for detection and incident investigation.",
        ],
    },
]

CERTIFICATIONS = (
    "CompTIA Security+ • CompTIA Network+ • AWS Solutions Architect Associate • AWS Cloud Practitioner • "
    "IBM Cybersecurity Analyst • Palo Alto Networks Associate"
)

SKILLS = (
    "<b>Security Operations:</b> Huntress, Microsoft Defender XDR, incident and alert triage, endpoint investigation, remediation<br/>"
    "<b>Identity & Endpoints:</b> Microsoft 365, Entra ID, Intune, Active Directory, MFA, Conditional Access, RMM<br/>"
    "<b>Networking & Firewalls:</b> TCP/IP, DNS, DHCP, VLANs, Wi-Fi, VPNs, pfSense, Palo Alto concepts, troubleshooting<br/>"
    "<b>Cloud & Tools:</b> AWS EC2, S3, VPC, ConnectWise PSA, Splunk, Sysmon, Wireshark, tcpdump, VMware"
)

EDUCATION = [
    "<b>B.S. IT Business Management</b> — Western Governors University (In Progress)",
    "<b>Network Security Program</b> — City College of San Francisco (Completed)",
]


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        leftMargin=0.58 * inch,
        rightMargin=0.58 * inch,
        topMargin=0.52 * inch,
        bottomMargin=0.5 * inch,
        title=f"{NAME} CV",
        author=NAME,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="CvName",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=20,
        alignment=TA_CENTER,
        textColor=colors.black,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="CvTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.3,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#222222"),
        spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name="CvContact",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.1,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#333333"),
        spaceAfter=7,
    ))
    styles.add(ParagraphStyle(
        name="CvSection",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.6,
        leading=11,
        textColor=colors.black,
        spaceBefore=5,
        spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name="CvBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.9,
        leading=9.5,
        textColor=colors.black,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="CvBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.7,
        leading=9.2,
        leftIndent=11,
        firstLineIndent=-6,
        bulletIndent=3,
        spaceAfter=1,
    ))
    styles.add(ParagraphStyle(
        name="CvRole",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.4,
        leading=10,
        textColor=colors.black,
        spaceAfter=1,
    ))
    styles.add(ParagraphStyle(
        name="CvMeta",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.7,
        leading=9,
        textColor=colors.HexColor("#333333"),
        spaceAfter=2,
    ))

    story = [
        Paragraph(NAME, styles["CvName"]),
        Paragraph(TITLE, styles["CvTitle"]),
        Paragraph(CONTACT, styles["CvContact"]),
        Paragraph("SUMMARY", styles["CvSection"]),
        Paragraph(SUMMARY, styles["CvBody"]),
        Paragraph("EXPERIENCE", styles["CvSection"]),
    ]

    for item in EXPERIENCE:
        block = [
            Paragraph(f"{item['role']}  |  {item['company']}  |  {item['location']}  |  {item['dates']}", styles["CvRole"]),
        ]
        for bullet in item["bullets"]:
            block.append(Paragraph(bullet, styles["CvBullet"], bulletText="•"))
        story.append(KeepTogether(block))

    story.extend([
        Paragraph("PROJECTS", styles["CvSection"]),
    ])

    for item in PROJECTS:
        block = [
            Paragraph(f"{item['name']}  |  {item['stack']}", styles["CvRole"]),
        ]
        for bullet in item["bullets"]:
            block.append(Paragraph(bullet, styles["CvBullet"], bulletText="•"))
        story.append(KeepTogether(block))

    story.extend([
        Paragraph("CERTIFICATIONS", styles["CvSection"]),
        Paragraph(CERTIFICATIONS, styles["CvBody"]),
        Paragraph("TECHNICAL SKILLS", styles["CvSection"]),
        Paragraph(SKILLS, styles["CvBody"]),
        Paragraph("EDUCATION", styles["CvSection"]),
    ])

    for line in EDUCATION:
        story.append(Paragraph(line, styles["CvBody"]))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT)
