import json, glob, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, KeepTogether, PageBreak)

INK      = colors.HexColor("#101614")
CANOPY   = colors.HexColor("#5F7355")
LATERITE = colors.HexColor("#B0722C")
PAPER2   = colors.HexColor("#EBEEE8")
LINE     = colors.HexColor("#D7DBD3")
MUTED    = colors.HexColor("#78827C")

S = dict(
  h1   = ParagraphStyle("h1", fontName="Times-Roman", fontSize=30, leading=32, textColor=INK, spaceAfter=6),
  sub  = ParagraphStyle("sub", fontName="Helvetica", fontSize=10.5, leading=15, textColor=MUTED, spaceAfter=18),
  h2   = ParagraphStyle("h2", fontName="Times-Roman", fontSize=17, leading=20, textColor=INK, spaceBefore=20, spaceAfter=3),
  eyeb = ParagraphStyle("eyeb", fontName="Courier-Bold", fontSize=7.5, leading=11, textColor=CANOPY, spaceBefore=16, spaceAfter=2),
  h3   = ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=INK, spaceBefore=11, spaceAfter=3),
  body = ParagraphStyle("body", fontName="Helvetica", fontSize=9.3, leading=13.6, textColor=INK, spaceAfter=6, alignment=TA_LEFT),
  smal = ParagraphStyle("smal", fontName="Helvetica", fontSize=8.4, leading=12.2, textColor=MUTED, spaceAfter=5),
  cell = ParagraphStyle("cell", fontName="Helvetica", fontSize=8.4, leading=11.6, textColor=INK),
  cellb= ParagraphStyle("cellb", fontName="Helvetica-Bold", fontSize=8.4, leading=11.6, textColor=INK),
  cellm= ParagraphStyle("cellm", fontName="Courier", fontSize=7.6, leading=11, textColor=INK),
  note = ParagraphStyle("note", fontName="Helvetica", fontSize=8.8, leading=12.8, textColor=INK, spaceAfter=4,
                        leftIndent=8, borderPadding=0),
)

P  = lambda t, s="body": Paragraph(t, S[s])
def ask(n, title, why, need):
    """One numbered request block."""
    rows = [[P(f"{n}", "cellb"), P(f"<b>{title}</b>", "cell")],
            ["",                 P(f'<font color="#78827C">Why:</font> {why}', "cell")],
            ["",                 P(f'<font color="#5F7355"><b>I need:</b></font> {need}', "cell")]]
    t = Table(rows, colWidths=[9*mm, 152*mm])
    t.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),0), ("RIGHTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),1), ("BOTTOMPADDING",(0,0),(-1,-1),1),
        ("BOTTOMPADDING",(0,2),(-1,2),9),
        ("LINEBELOW",(0,2),(-1,2),0.4,LINE),
        ("TOPPADDING",(0,0),(-1,0),7),
    ]))
    return KeepTogether(t)

def fill_table(headers, rows, widths):
    data=[[P(h,"cellb") for h in headers]]+[[P(c,"cellm" if i and c=="" else "cell") for i,c in enumerate(r)] for r in rows]
    t=Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("BACKGROUND",(0,0),(-1,0),PAPER2),
        ("GRID",(0,0),(-1,-1),0.4,LINE),
        ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]))
    return t

# ---------------------------------------------------------------- page frame
def decorate(canvas, doc):
    canvas.saveState()
    w,h = A4
    canvas.setFillColor(MUTED); canvas.setFont("Courier",7)
    canvas.drawString(20*mm, 12*mm, "SUNPURE HOMES  /  INFORMATION REQUIRED")
    canvas.drawRightString(w-20*mm, 12*mm, f"PAGE {doc.page}")
    canvas.setStrokeColor(LINE); canvas.setLineWidth(0.4)
    canvas.line(20*mm, 16*mm, w-20*mm, 16*mm)
    canvas.restoreState()

out = os.path.join(os.environ["OUT"], "Sunpure-Homes-Information-Required.pdf")
doc = BaseDocTemplate(out, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=22*mm,
        title="Sunpure Homes - Information Required",
        author="Website build", subject="Open questions and assets needed")
doc.addPageTemplates([PageTemplate(id="main",
        frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")],
        onPage=decorate)])

F=[]
F.append(P("Information required", "h1"))
F.append(P("Everything the Sunpure Homes website build needs from you, in one list. "
           "Prepared 29 August 2026, after Phases 0 to 2. Items are ordered by what "
           "blocks work first, then by what must be settled before the site can go live.", "sub"))

F.append(P("HOW TO READ THIS", "eyeb"))
F.append(P("<b>Section A</b> stops work today. <b>Section B</b> is legal and must be right before launch. "
           "<b>Section C</b> lists every contradiction found in your current content — the site records all of "
           "them but shows none, so nothing wrong is published while they are open. "
           "<b>Sections D and E</b> are assets and decisions. <b>Section F</b> is a sheet you can fill in and send back.", "body"))
F.append(P("Nothing in this document is a guess. Where a value was unknown it was left out of the site rather "
           "than invented, which is why this list exists.", "smal"))

F.append(P("WHERE THE BUILD HAS REACHED", "eyeb"))
F.append(P("Phases 0 to 2 are complete and committed: nine project pages, working filters, and interactive plot "
           "plans for Fadal and Rare Earth with shortlisting and WhatsApp handoff. An automated crawl over 48 "
           "pages, 683 links and 188 images finds no broken link, no placeholder text and no image without a "
           "description. Phase 4, the per-project 3D, starts next because nothing blocks it. Phase 3, the city "
           "map, waits on item 1 below.", "body"))

# ------------------------------------------------------------------ SECTION A
F.append(P("SECTION A - BLOCKING NOW", "eyeb"))
F.append(P("The 3D city map cannot start", "h2"))
F.append(P("Phase 3 places all nine projects on a 3D model of Mysuru. It is the only part of the build that "
           "cannot begin without you.", "body"))
F.append(ask(1, "Latitude and longitude for all nine projects",
    "A neighbourhood name is not a location. Vijayanagar 4th Stage alone covers six of the nine projects, so "
    "pins placed from it would sit on top of each other in the wrong places. A pin at a guessed point is worse "
    "than no pin.",
    "Decimal degrees per project, for example 12.3052, 76.6394. In Google Maps, right-click the site and the "
    "first line of the menu is the coordinate pair - copy and paste it. Rooftop accuracy is not needed; the "
    "entrance gate is fine."))
F.append(Spacer(1,4))
F.append(fill_table(["Project","Latitude, Longitude"],
    [[n,""] for n in ["Happiness 1","Happiness 2","H4","V4","Curve","Blessed","Meraki","Fadal","Rare Earth"]],
    [60*mm, 101*mm]))

# ------------------------------------------------------------------ SECTION B
F.append(PageBreak())
F.append(P("SECTION B - LEGAL AND COMPLIANCE", "eyeb"))
F.append(P("Must be correct before launch", "h2"))

F.append(ask(2, "RERA registration numbers",
    "You asked for dummy numbers so the pages render, and they now do. Eight of the nine are placeholders and "
    "the site labels each one <b>\"Not yet verified - this number is a placeholder pending confirmation against "
    "the Karnataka RERA register. Do not rely on it.\"</b> Those eight are also held out of the sitemap. A RERA "
    "number is a statutory disclosure; an unlabelled fake one is a legal exposure, not a cosmetic issue.",
    "The real registration number for each project. If a project genuinely has no registration - the four "
    "completed projects may predate the 2017 Act - write \"none\" and the page will say \"Registration details "
    "on request\" instead. One number cannot cover two projects: your live site currently shows the same number "
    "on both Fadal and V4."))
F.append(Spacer(1,4))
F.append(fill_table(["Project","Status","Real RERA number, or \"none\""],
    [["Happiness 1","placeholder",""],["Happiness 2","placeholder",""],["H4","placeholder",""],
     ["V4","from your brief",""],["Curve","placeholder",""],["Blessed","placeholder",""],
     ["Meraki","placeholder",""],["Fadal","placeholder",""],["Rare Earth","placeholder",""]],
    [38*mm, 30*mm, 93*mm]))

F.append(ask(3, "Fadal's real address",
    "Your live Fadal page contradicts itself. The address block reads \"Lalitadripura Rd, Chamundi Hill, "
    "Mysuru 570028\". The copy on the same page places Fadal on KRS Main Road. Those are on opposite sides of "
    "Mysuru. The site currently shows no address for Fadal at all rather than pick one.",
    "The correct address, and confirmation of which of the two published versions is wrong so the other can be "
    "corrected at source."))

F.append(ask(4, "Rights to the Mysore Palace photograph",
    "It is the home page hero at your direction. It was already on your site, but it is a public landmark shot "
    "and nobody has confirmed who owns the photograph.",
    "The licence or the photographer's name. If neither exists, a replacement image - see item 9."))

F.append(ask(5, "Approvals detail per project",
    "The project pages have a built approvals section for plan sanction, khata or land conversion, and "
    "bank tie-ups. Nothing is published for any project, so those rows are currently hidden.",
    "For each project: is the plan sanctioned, is khata or conversion done, and which banks have approved it "
    "for home loans."))

# ------------------------------------------------------------------ SECTION C
F.append(PageBreak())
F.append(P("SECTION C - CONTENT CONTRADICTIONS", "eyeb"))
F.append(P("Found in your current content", "h2"))
F.append(P("Every one of these was found by comparing your brief against your two live sites. The new site "
           "records all of them internally and publishes none of them, so no visitor sees anything known to be "
           "wrong. Each needs a yes or no from you before the affected field can be shown.", "body"))

order = ["happiness-1","happiness-2","h4","v4","curve","blessed","meraki","fadal","rare-earth"]
projects = {}
for f in glob.glob("content/projects/*.json"):
    d=json.load(open(f)); projects[d["slug"]]=d

n=6
for slug in order:
    d=projects[slug]
    ws=[w for w in d.get("contentWarnings",[])]
    if not ws: continue
    blk=[P(f"{d['name']}", "h3")]
    for w in ws:
        w=(w.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
             .replace('"','&quot;'))
        blk.append(Paragraph(f'<font color="#B0722C">-</font> {w}', S["note"]))
    F.append(KeepTogether(blk))

# ------------------------------------------------------------------ SECTION D
F.append(PageBreak())
F.append(P("SECTION D - ASSETS NEEDED", "eyeb"))
F.append(P("Files to send", "h2"))

F.append(ask(6, "Surveyed layouts for Fadal and Rare Earth",
    "The plot plans on the site are generated. They match your published totals exactly - Rare Earth 279 plots "
    "on 18 acres, Fadal 43 plots from 1,163 to 2,493 sq ft on 3 acres - but plot positions and shapes are "
    "invented, and every plan says so on the page. The same file feeds the 3D scenes in Phase 4, so real "
    "drawings improve both at once.",
    "The approved layout drawing in any of: DWG or DXF, a georeferenced PDF, or a spreadsheet of plot numbers "
    "with corner coordinates and dimensions. This is the single highest-value file in this document."))

F.append(ask(7, "Live plot availability",
    "Availability is placeholder data and the page says so. This is the file your sales team owns - it is a "
    "simple list of plot number against available, held or sold.",
    "The current status of every plot at Fadal and Rare Earth, and the name of whoever will keep it updated."))

F.append(ask(8, "Photography of the completed projects",
    "Happiness 1 is the only project with real photographs. Happiness 2, Blessed and Meraki are marked "
    "completed but show renders of buildings that already exist. Meraki has seven images and every one is an "
    "interior - there is no photograph of the building.",
    "Photographs of Happiness 2, Blessed and Meraki as built, including at least one exterior of Meraki."))

F.append(ask(9, "Home page hero film or still",
    "The hero is currently the Mysore Palace photograph - a landmark, not a property you built. A wide shot of "
    "an actual Sunpure development would do far more work.",
    "A landscape image at least 2,560 pixels wide, or a short silent clip. Dropping it in is a one-line change."))

F.append(ask(10, "The visual reference for the 3D",
    "Section 10 of the brief was left blank. It points at an Instagram post, "
    "instagram.com/p/DcRG_k1gqa7/, which blocks automated access - I have not been able to see it. Without it "
    "the 3D will be built to the house style in the brief: stylised isometric, flat-shaded massing, matte "
    "materials, one soft sun, restrained green palette, slow camera.",
    "Either fill in the blank table in section 10 of the brief, or send a screen recording or screenshots of "
    "that post. If it is a video, timestamps are the most useful thing you can give me - \"0:04 camera "
    "descends\", \"0:06 plots highlight on hover\" converts straight into a specification."))

F.append(ask(11, "Logo and brand source files",
    "The logo on the site was extracted out of your live site's page code and cleaned up. It is sharp at any "
    "size, but it is a recovered copy rather than the original.",
    "The original vector logo files, both lockups, and any brand guideline document."))

F.append(ask(12, "Brochures and price lists",
    "Phase 5 builds the gated brochure download and the price list request, which are the main lead capture "
    "on each project page. Neither can be built against nothing.",
    "The current brochure PDF for each project, and confirmation of how you want price enquiries handled."))

# ------------------------------------------------------------------ SECTION E
F.append(PageBreak())
F.append(P("SECTION E - DECISIONS AND ACCESS", "eyeb"))
F.append(P("Things only you can decide", "h2"))

F.append(ask(13, "Every URL on the old WordPress site",
    "Fadal ranks in search on the old site, not the new one. Every old address has to redirect to its new home "
    "or that traffic is lost at launch. The brief lists nineteen redirects; there are almost certainly more.",
    "Either access to the old site's hosting or WordPress admin so the full list can be exported, or a "
    "Google Search Console export of indexed pages."))

F.append(ask(14, "What happens to the blog",
    "The existing posts read as machine-generated and work against a premium positioning. They will be migrated "
    "with search engines told to ignore them, and flagged, rather than deleted quietly.",
    "For each post: rewrite, keep as is, or delete."))

F.append(ask(15, "Where enquiries should go",
    "Every enquiry route on the site currently opens WhatsApp to +91 96069 07153, or your sales email. Phase 5 "
    "adds forms, and a form needs a destination.",
    "The email address or CRM that should receive enquiries, and whether more than one person needs to be "
    "notified."))

F.append(ask(16, "Site visit booking",
    "The brief asks for a calendar booking on each project page.",
    "Whether you already use a scheduling tool, or whether a visit request should simply arrive as an email or "
    "WhatsApp message."))

F.append(ask(17, "Domain and hosting access, before launch",
    "The old and new sites currently share one domain, which is the root cause of most of the defects in "
    "section C. Retiring the old one properly needs DNS control.",
    "Access to the domain registrar and to whoever currently hosts both sites. Not needed until launch, but it "
    "has the longest lead time of anything here, so start it early."))

F.append(P("Already settled - no action needed", "h3"))
F.append(Paragraph('<font color="#5F7355">-</font> LinkedIn: linkedin.com/company/sunpure-homes is now the '
                   'single address used everywhere. The second one on your live site is retired.', S["note"]))
F.append(Paragraph('<font color="#5F7355">-</font> Tagline: "Thoughtfully Built. Deeply Lived." is the only one '
                   'on the site. The other three are gone.', S["note"]))
F.append(Paragraph('<font color="#5F7355">-</font> H4 location: taken from your live page as Vijayanagar 4th '
                   'Stage, Basavanahalli 570032. Confirm in section C if that is wrong.', S["note"]))

# ------------------------------------------------------------------ SECTION F
F.append(PageBreak())
F.append(P("SECTION F - ANSWER SHEET", "eyeb"))
F.append(P("Send this page back", "h2"))
F.append(P("If it is easier, reply to items by number rather than filling in the boxes. Partial answers are "
           "useful - each one unblocks something.", "body"))

F.append(P("Priority order", "h3"))
F.append(fill_table(["#","What","Unblocks","Done"],
    [["1","Coordinates for nine projects","The 3D city map, Phase 3",""],
     ["6","Surveyed layouts, Fadal and Rare Earth","Real plot plans and 3D scenes",""],
     ["10","The 3D visual reference","How the 3D should look",""],
     ["2","Real RERA numbers","Removes eight legal warnings; search visibility",""],
     ["3","Fadal's real address","Fadal's location on the site",""],
     ["7","Live plot availability","Plot status shown to buyers",""],
     ["8","Photography of completed projects","Replaces renders on built projects",""],
     ["13","Old site URL list","Keeps Fadal's search traffic at launch",""],
     ["9","Hero film or still","Replaces the Mysore Palace photograph",""],
     ["12","Brochures and price lists","Lead capture, Phase 5",""],
     ["15","Enquiry destination","Forms, Phase 5",""],
     ["5","Approvals per project","The trust section on each page",""],
     ["11","Logo source files","Print quality and future use",""],
     ["4","Palace photo rights","Legal clearance for the hero",""],
     ["14","Blog decision","What happens to old posts",""],
     ["16","Site visit booking","Booking, Phase 5",""],
     ["17","Domain and hosting access","Launch. Longest lead time",""]],
    [10*mm, 66*mm, 68*mm, 17*mm]))

F.append(Spacer(1,10))
F.append(P("Section C contradictions - confirm each", "h3"))
F.append(P("Reply against the project name in section C. The quickest wins, because they each unlock a field "
           "that is currently hidden:", "smal"))
for q in ["H4 - is it villas or apartments, and is it ongoing or upcoming?",
          "Blessed - apartments, and is it 2 BHK only or 2 and 3 BHK?",
          "Happiness 1 - how many units? Your site says 34, the same as Happiness 2.",
          "V4 - is it sold out? One of its own images is filenamed \"V4_Sold_Out\".",
          "Rare Earth - is there a swimming pool? An image shows one; your amenity list does not.",
          "Fadal and the other six - real travel distances, per project.",
          "Rare Earth and Fadal - what specifications actually apply to bare land?"]:
    F.append(Paragraph(f'<font color="#B0722C">-</font> {q}', S["note"]))



doc.build(F)
print("PDF written:", out, os.path.getsize(out)//1024, "KB")
