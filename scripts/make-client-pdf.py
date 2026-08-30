"""
Client-facing questionnaire — `python scripts/make-client-pdf.py`

Deliberately NOT the same document as the internal requirements list:

  - It is addressed to the client, so there is no "I need", no reference to
    the brief the client did not write, and no internal field names.
  - It asks questions instead of reporting defects. The internal version
    catalogues 45 contradictions found in the live sites; naming each one to
    the client invites a discussion about who caused them rather than an
    answer. Only the items that genuinely need a client decision appear here,
    rewritten as neutral questions.
  - It carries no characterisation of legal risk. Flagging that a placeholder
    registration number must not ship is our job; telling a client in writing
    that their site is legally exposed is not, and it is not a claim to put
    in a shareable document.

Keep both. Send this one; work from the other.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, KeepTogether, PageBreak)

INK      = colors.HexColor("#101614")
CANOPY   = colors.HexColor("#5F7355")
PAPER2   = colors.HexColor("#EBEEE8")
LINE     = colors.HexColor("#D7DBD3")
MUTED    = colors.HexColor("#78827C")

S = dict(
  h1   = ParagraphStyle("h1", fontName="Times-Roman", fontSize=30, leading=32, textColor=INK, spaceAfter=6),
  sub  = ParagraphStyle("sub", fontName="Helvetica", fontSize=10.5, leading=15, textColor=MUTED, spaceAfter=16),
  h2   = ParagraphStyle("h2", fontName="Times-Roman", fontSize=17, leading=20, textColor=INK, spaceBefore=18, spaceAfter=3),
  eyeb = ParagraphStyle("eyeb", fontName="Courier-Bold", fontSize=7.5, leading=11, textColor=CANOPY, spaceBefore=16, spaceAfter=2),
  h3   = ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=INK, spaceBefore=12, spaceAfter=3),
  body = ParagraphStyle("body", fontName="Helvetica", fontSize=9.3, leading=13.6, textColor=INK, spaceAfter=6),
  smal = ParagraphStyle("smal", fontName="Helvetica", fontSize=8.4, leading=12.2, textColor=MUTED, spaceAfter=5),
  cell = ParagraphStyle("cell", fontName="Helvetica", fontSize=8.4, leading=11.6, textColor=INK),
  cellb= ParagraphStyle("cellb", fontName="Helvetica-Bold", fontSize=8.4, leading=11.6, textColor=INK),
)
P = lambda t, s="body": Paragraph(t, S[s])

def ask(n, title, detail):
    rows = [[P(f"{n}", "cellb"), P(f"<b>{title}</b>", "cell")],
            ["",                 P(detail, "cell")]]
    t = Table(rows, colWidths=[9*mm, 152*mm])
    t.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),0), ("RIGHTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),1), ("BOTTOMPADDING",(0,0),(-1,-1),1),
        ("BOTTOMPADDING",(0,1),(-1,1),9),
        ("LINEBELOW",(0,1),(-1,1),0.4,LINE),
        ("TOPPADDING",(0,0),(-1,0),7),
    ]))
    return KeepTogether(t)

def table(headers, rows, widths):
    data=[[P(h,"cellb") for h in headers]]+[[P(c,"cell") for c in r] for r in rows]
    t=Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("BACKGROUND",(0,0),(-1,0),PAPER2),
        ("GRID",(0,0),(-1,-1),0.4,LINE),
        ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]))
    return t

def decorate(canvas, doc):
    canvas.saveState()
    w,h = A4
    canvas.setFillColor(MUTED); canvas.setFont("Courier",7)
    canvas.drawString(20*mm, 12*mm, "SUNPURE HOMES  /  NEW WEBSITE  /  INFORMATION REQUEST")
    canvas.drawRightString(w-20*mm, 12*mm, f"PAGE {doc.page}")
    canvas.setStrokeColor(LINE); canvas.setLineWidth(0.4)
    canvas.line(20*mm, 16*mm, w-20*mm, 16*mm)
    canvas.restoreState()

out = os.path.join(os.getcwd(), "Sunpure-Homes-Information-Request-CLIENT.pdf")
doc = BaseDocTemplate(out, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=22*mm,
        title="Sunpure Homes - Information Request",
        subject="Information needed to complete the new website")
doc.addPageTemplates([PageTemplate(id="main",
        frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")],
        onPage=decorate)])

F=[]
F.append(P("Information request", "h1"))
F.append(P("A short list of what we need from Sunpure Homes to finish the new website. "
           "Everything is grouped by what it unblocks. Partial answers are useful — each one "
           "lets a part of the site go live.", "sub"))

F.append(P("WHERE WE HAVE REACHED", "eyeb"))
F.append(P("All nine projects are built and browsable, with working filters and interactive plot "
           "plans for Fadal and Rare Earth including shortlisting and WhatsApp enquiry. The 3D "
           "model of each site is under way. The remaining work needs the information below.", "body"))
F.append(P("Where a detail was not available to us, we have left it off the site rather than "
           "guess at it. Nothing incorrect is published while these questions are open.", "smal"))

# ---------------------------------------------------------------- 1
F.append(P("1 - TO START THE 3D MAP OF MYSURU", "eyeb"))
F.append(P("Site locations", "h2"))
F.append(ask(1, "Latitude and longitude for each project",
    "The map places all nine projects on a 3D model of Mysuru. Six of the nine share the same "
    "neighbourhood name, so we need a point per site rather than an area. In Google Maps, "
    "right-click the site entrance and the first line of the menu is the coordinate pair — copy "
    "and paste it. Approximate is fine."))
F.append(Spacer(1,4))
F.append(table(["Project","Latitude, Longitude"],
    [[n,""] for n in ["Happiness 1","Happiness 2","H4","V4","Curve","Blessed","Meraki","Fadal","Rare Earth"]],
    [60*mm, 101*mm]))

# ---------------------------------------------------------------- 2
F.append(PageBreak())
F.append(P("2 - REQUIRED BEFORE LAUNCH", "eyeb"))
F.append(P("Registration and approvals", "h2"))
F.append(ask(2, "RERA registration number for each project",
    "The site is currently running on temporary numbers, each clearly marked on the page as "
    "unverified, so nothing misleading is published. We need the real number for each project "
    "before launch. If a project has no registration — the older completed projects may predate "
    "the requirement — please write \"none\" and the page will show \"Registration details on "
    "request\" instead. Each number belongs to one project only."))
F.append(Spacer(1,4))
F.append(table(["Project","RERA number, or \"none\""],
    [[n,""] for n in ["Happiness 1","Happiness 2","H4","V4","Curve","Blessed","Meraki","Fadal","Rare Earth"]],
    [60*mm, 101*mm]))

F.append(ask(3, "Fadal's address",
    "Two different addresses for Fadal are in circulation — one on Lalitadripura Road near "
    "Chamundi Hill, and one on KRS Main Road. Please confirm which is correct. No address is "
    "shown on the site until you do."))

F.append(ask(4, "Approvals for each project",
    "Each project page has a section for plan sanction, khata or land conversion, and the banks "
    "that have approved the project for home loans. Please tell us the status of each, per "
    "project, and we will show it. Buyers look for exactly this."))

F.append(ask(5, "Rights to the Mysore Palace photograph",
    "This is currently the main image on the home page. Please confirm who owns the photograph "
    "and that it can be used, or send a replacement — see item 9."))

# ---------------------------------------------------------------- 3
F.append(PageBreak())
F.append(P("3 - QUICK CONFIRMATIONS", "eyeb"))
F.append(P("Twelve short answers", "h2"))
F.append(P("While preparing the content we found some details recorded differently in different "
           "places. None are published on the new site until confirmed. A one-line answer to each "
           "releases that detail onto the page.", "body"))
F.append(Spacer(1,4))
F.append(table(["#","Question","Your answer"],
    [["a","H4 — villas or apartments?",""],
     ["b","H4 — under construction, or upcoming?",""],
     ["c","H4 — is the site at Vijayanagar 4th Stage, Basavanahalli?",""],
     ["d","Blessed — apartments, and 2 BHK only or 2 and 3 BHK?",""],
     ["e","Happiness 1 — how many units?",""],
     ["f","Happiness 2 — details of the two apartments among the 34 homes?",""],
     ["g","V4 — is it sold out, or still selling?",""],
     ["h","Rare Earth — is a swimming pool part of the offering?",""],
     ["i","Rare Earth — what plot sizes are available?",""],
     ["j","Fadal and Rare Earth — what is included on a plot?",""],
     ["k","Meraki — is Yadavagiri the correct spelling?",""],
     ["l","All projects — real distances to key landmarks?",""]],
    [8*mm, 88*mm, 65*mm]))
F.append(P("On (j): plot buyers build their own homes, so we have left interior finishes off those "
           "two pages. Please tell us what is actually provided — roads, drainage, water, power, "
           "compound wall, and so on.", "smal"))
F.append(P("On (l): we would like to publish accurate travel distances per project rather than a "
           "single shared list. A few landmarks per project is plenty.", "smal"))

# ---------------------------------------------------------------- 4
F.append(PageBreak())
F.append(P("4 - FILES TO SEND", "eyeb"))
F.append(P("Assets", "h2"))

F.append(ask(6, "Approved layout drawings for Fadal and Rare Earth",
    "The plot plans on the site are currently drawn to match your published totals — Rare Earth "
    "279 plots on 18 acres, Fadal 43 plots on 3 acres — but the individual plot positions are "
    "indicative, and every plan says so on the page. Your approved layout in any form (DWG, DXF, "
    "PDF, or a list of plot numbers with dimensions) makes both the plan and the 3D model real. "
    "This is the single most valuable file on this list."))

F.append(ask(7, "Current plot availability",
    "So buyers can see what is available, held and sold. A simple list of plot number against "
    "status is all we need, plus the name of whoever will keep it current."))

F.append(ask(8, "Photographs of the completed projects",
    "Happiness 2, Blessed and Meraki are complete but are currently shown with renders. "
    "Photographs of the finished buildings would serve them far better. For Meraki we have "
    "interiors only and no exterior view at all."))

F.append(ask(9, "A main image for the home page",
    "Ideally a wide photograph or a short clip of a completed Sunpure development. A landscape "
    "image at least 2,560 pixels wide, or a few seconds of video."))

F.append(ask(10, "A visual reference for the 3D",
    "If there is a particular look you want the 3D model to have, send an example — a link, "
    "screenshots, or a screen recording. If it is a video, timestamps help enormously. Without "
    "one we will build to the restrained, stylised style already used across the site."))

F.append(ask(11, "Logo and brand files",
    "The original vector logo files, both the horizontal and stacked versions, plus any brand "
    "guidelines. We are currently working from a copy recovered from the existing site."))

F.append(ask(12, "Brochures and price lists",
    "The current brochure for each project, so buyers can download it, and confirmation of how "
    "you would like price enquiries handled."))

# ---------------------------------------------------------------- 5
F.append(PageBreak())
F.append(P("5 - DECISIONS AND ACCESS", "eyeb"))
F.append(P("For your side to arrange", "h2"))

F.append(ask(13, "Access to the existing website",
    "There are two websites on the domain at present. To retire the old one without losing your "
    "search rankings, every existing address has to be redirected to its new home. Fadal in "
    "particular ranks on the older site. Access to the hosting or a Google Search Console export "
    "lets us capture the full list."))

F.append(ask(14, "What should happen to the existing blog posts",
    "For each post: keep it, rewrite it, or remove it. Until you decide they will be carried "
    "across but kept out of search results."))

F.append(ask(15, "Where enquiries should go",
    "Enquiries currently open WhatsApp to +91 96069 07153 or your sales email. Please confirm "
    "the address or system that should receive form enquiries, and who should be notified."))

F.append(ask(16, "Site visit bookings",
    "Whether you already use a scheduling tool, or whether a visit request should simply arrive "
    "as an email or WhatsApp message."))

F.append(ask(17, "Domain and hosting access",
    "Needed only at launch, but it has the longest lead time of anything here, so it is worth "
    "starting early."))

F.append(P("Already settled", "h3"))
for line in [
    "LinkedIn: linkedin.com/company/sunpure-homes will be used throughout.",
    "Tagline: \"Thoughtfully Built. Deeply Lived.\" is the only one on the new site.",
]:
    F.append(Paragraph(f'<font color="#5F7355">-</font> {line}',
             ParagraphStyle("n", parent=S["body"], leftIndent=8, spaceAfter=3)))

# ---------------------------------------------------------------- 6
F.append(PageBreak())
F.append(P("6 - IN PRIORITY ORDER", "eyeb"))
F.append(P("If you send nothing else, send these first", "h2"))
F.append(Spacer(1,4))
F.append(table(["#","What","What it unblocks","Done"],
    [["1","Coordinates for the nine projects","The 3D map of Mysuru",""],
     ["6","Approved layouts, Fadal and Rare Earth","Real plot plans and 3D models",""],
     ["2","RERA numbers","Launch readiness and search visibility",""],
     ["3","Fadal's address","Fadal's location on the site",""],
     ["7","Plot availability","Live plot status for buyers",""],
     ["-","The twelve confirmations in section 3","Details currently held back",""],
     ["8","Photographs of completed projects","Replaces renders on finished buildings",""],
     ["13","Access to the existing site","Protects your search rankings at launch",""],
     ["4","Approvals per project","The trust section on every page",""],
     ["9","Home page image","The first thing a visitor sees",""],
     ["12","Brochures and price lists","Enquiry capture",""],
     ["10","3D visual reference","How the 3D should look",""],
     ["15","Enquiry destination","Contact forms",""],
     ["5","Photograph rights","Clearance for the home page image",""],
     ["11","Logo files","Print quality and future use",""],
     ["14","Blog decision","The existing articles",""],
     ["16","Visit bookings","Site visit requests",""],
     ["17","Domain and hosting access","Launch",""]],
    [10*mm, 62*mm, 72*mm, 17*mm]))

doc.build(F)
print("written:", out, os.path.getsize(out)//1024, "KB")
