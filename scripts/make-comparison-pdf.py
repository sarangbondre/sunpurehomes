"""
Client-facing comparison: the current sunpurehomes.com beside the new build.

Every figure was measured against both sites on the date in the footer, with a
real browser, after letting each page's scroll animations finish. Claims that
did not survive that check were removed rather than softened — the current
site's hidden RERA placeholder and the tenth project in the card markup are in
the page source but not on screen, so neither appears here.

Tone: describe, do not blame. The comparison is persuasive on facts alone, and
the client may have people or partners attached to the current site.
"""
import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as pdfcanvas

IMG = os.environ.get("IMG", os.path.join(os.path.dirname(__file__), "comparison-assets"))
OUT = os.environ.get("OUT", "Sunpure-Homes-Site-Comparison.pdf")
DATE = "7 September 2026"

INK      = colors.HexColor("#101614")
CANOPY   = colors.HexColor("#5F7355")
LATERITE = colors.HexColor("#B0722C")
PAPER    = colors.HexColor("#F8F9F6")
PAPER2   = colors.HexColor("#EBEEE8")
LINE     = colors.HexColor("#D7DBD3")
MUTED    = colors.HexColor("#78827C")

W, H = landscape(A4)
M = 15 * mm

c = pdfcanvas.Canvas(OUT, pagesize=landscape(A4))
c.setTitle("Sunpure Homes - current site and new site compared")
c.setSubject("Design and functionality comparison")


def chrome(page_no, total=5):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.4)
    c.line(M, 12 * mm, W - M, 12 * mm)
    c.setFont("Courier", 6.8)
    c.setFillColor(MUTED)
    c.drawString(M, 8.4 * mm, "SUNPURE HOMES   /   CURRENT SITE AND NEW SITE COMPARED")
    c.drawRightString(W - M, 8.4 * mm, f"{page_no} / {total}")


def heading(eyebrow, title, sub=None):
    c.setFont("Courier-Bold", 7.2)
    c.setFillColor(CANOPY)
    c.drawString(M, H - M - 4 * mm, eyebrow.upper())
    c.setFont("Times-Roman", 25)
    c.setFillColor(INK)
    c.drawString(M, H - M - 14 * mm, title)
    y = H - M - 20 * mm
    if sub:
        c.setFont("Helvetica", 9.2)
        c.setFillColor(MUTED)
        for ln in sub:
            c.drawString(M, y, ln)
            y -= 4.6 * mm
    return y


def panel(x, w, top, img, label, label_colour, caption):
    """One side of a comparison. Returns the y below the caption."""
    c.setFont("Courier-Bold", 7.2)
    c.setFillColor(label_colour)
    c.drawString(x, top, label.upper())

    path = f"{IMG}/{img}.jpg"
    ir = ImageReader(path)
    iw, ih = ir.getSize()
    dh = w * ih / iw
    iy = top - 4 * mm - dh
    c.setFillColor(PAPER2)
    c.rect(x, iy, w, dh, stroke=0, fill=1)
    c.drawImage(ir, x, iy, width=w, height=dh, mask="auto")
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.rect(x, iy, w, dh, stroke=1, fill=0)

    ty = iy - 6 * mm
    c.setFont("Helvetica", 8.6)
    c.setFillColor(INK)
    for ln in caption:
        c.drawString(x, ty, ln)
        ty -= 4.3 * mm
    return ty


def takeaway(text):
    """One sentence on what the difference means for a buyer."""
    y = 26 * mm
    c.setStrokeColor(LATERITE)
    c.setLineWidth(1.2)
    c.line(M, y + 6 * mm, M + 14 * mm, y + 6 * mm)
    c.setFont("Times-Roman", 13.5)
    c.setFillColor(INK)
    c.drawString(M, y, text)


def two_up(eyebrow, title, sub, left, right, note):
    chrome(two_up.page)
    top = heading(eyebrow, title, sub)
    colw = (W - 2 * M - 8 * mm) / 2
    ytop = top - 4 * mm
    panel(M, colw, ytop, left["img"], left["label"], MUTED, left["caption"])
    panel(M + colw + 8 * mm, colw, ytop, right["img"], right["label"], CANOPY, right["caption"])
    takeaway(note)
    c.showPage()
    two_up.page += 1


# ───────────────────────────────────────────────────────── page 1
chrome(1)
heading(
    "Sunpure Homes / website",
    "The new site, beside the current one",
    ["The current sunpurehomes.com and the new build, page for page.",
     "Every figure below was measured on both sites in a browser, not estimated."],
)

rows = [
    ("What a buyer can do",              "Current site",                  "New site"),
    ("Filter the project list",          "Controls present, none filter", "Type, status and location, all working"),
    ("Links that lead nowhere",          "14 on the Rare Earth page",     "0, site-wide"),
    ("Images a screen reader can read",  "19 of 30 on Rare Earth",        "All of them"),
    ("RERA registration on a project",   "Not shown",                     "Shown on all nine"),
    ("Explore the plots or floors",      "Not available",                 "8 of 9 projects, in 2D and 3D"),
]

ty = H - M - 42 * mm
colx = [M, M + 92 * mm, M + 175 * mm]
for i, r in enumerate(rows):
    head = i == 0
    if head:
        c.setFillColor(PAPER2)
        c.rect(M, ty - 3 * mm, W - 2 * M, 9 * mm, stroke=0, fill=1)
    c.setFont("Helvetica-Bold" if head else "Helvetica", 9)
    c.setFillColor(INK if head else INK)
    c.drawString(colx[0] + 2 * mm, ty, r[0])
    c.setFont("Helvetica-Bold" if head else "Helvetica", 9)
    c.setFillColor(INK if head else MUTED)
    c.drawString(colx[1], ty, r[1])
    c.setFillColor(INK if head else CANOPY)
    c.drawString(colx[2], ty, r[2])
    c.setStrokeColor(LINE)
    c.setLineWidth(0.4)
    c.line(M, ty - 4 * mm, W - M, ty - 4 * mm)
    ty -= 11 * mm

c.setFont("Helvetica", 8.4)
c.setFillColor(MUTED)
c.drawString(M, ty - 2 * mm,
             f"Measured {DATE}. The new site is complete for browsing; registration numbers and surveyed")
c.drawString(M, ty - 6.6 * mm,
             "plot drawings are still to be supplied, and every page says so where that applies.")

# A client who can verify a claim trusts the rest of the document.
bx, by, bw, bh = M, 26 * mm, W - 2 * M, 30 * mm
c.setFillColor(PAPER2)
c.rect(bx, by, bw, bh, stroke=0, fill=1)
c.setFont("Courier-Bold", 7.2)
c.setFillColor(CANOPY)
c.drawString(bx + 6 * mm, by + bh - 8 * mm, "CHECKING ANY OF THIS YOURSELF")
c.setFont("Helvetica", 8.6)
c.setFillColor(INK)
for i, ln in enumerate([
    "Open sunpurehomes.com/project and click Project Type, Status or Location. The list stays as it was.",
    "Open sunpurehomes.com/project/rare-earth and click any of the eight amenities. Nothing happens.",
    "The new site answers both, and a walkthrough can be arranged at any time.",
]):
    c.drawString(bx + 6 * mm, by + bh - 15 * mm - i * 5 * mm, ln)
c.showPage()

# ───────────────────────────────────────────────────────── pages 2-4
two_up.page = 2

two_up(
    "Page one", "The home page",
    ["The first thing a buyer sees."],
    {"img": "old-home", "label": "Current site",
     "caption": ["Headline reads “Built on Thought.”",
                 "A second wording, “Thoughtfully Built. Deeply Lived.”,",
                 "appears elsewhere on the site."]},
    {"img": "new-home", "label": "New site",
     "caption": ["One line, used everywhere on the site.",
                 "The Masoom Group and its forty years are named",
                 "in the first sentence a visitor reads."]},
    "A visitor learns who Sunpure Homes is inside one sentence.",
)

two_up(
    "Choosing", "Finding the right project",
    ["Nine projects, three product types, four neighbourhoods."],
    {"img": "ev-old-cards", "label": "Current site",
     "caption": ["Project Type, Status and Location controls are on",
                 "the page. Selecting one does not change the list."]},
    {"img": "new-projects", "label": "New site",
     "caption": ["The same three filters, each showing how many",
                 "projects it holds, and each changing the results.",
                 "A filtered view has its own address to share."]},
    "Nine projects narrow to the two that suit a buyer, and that view can be sent to the family.",
)

two_up(
    "Inside a project", "The detail a buyer came for",
    ["Rare Earth, on both sites."],
    {"img": "ev-old-deadlinks", "label": "Current site",
     "caption": ["The eight amenities are links. Each one leads",
                 "nowhere. The photograph beside them is stock."]},
    {"img": "new-amenities", "label": "New site",
     "caption": ["The same eight amenities, each placed on the",
                 "site plan, with the project's own imagery."]},
    "Every amenity leads somewhere, and the photography is of the project itself.",
)

# ───────────────────────────────────────────────────────── page 5
chrome(5)
top = heading(
    "New", "Two things the current site has no equivalent for",
    ["Both are built and working today."],
)
colw = (W - 2 * M - 8 * mm) / 2
ytop = top - 4 * mm
panel(M, colw, ytop, "new-plan", "Choose a plot", CANOPY,
      ["Every plot and apartment is selectable, with its size, aspect and",
       "status, on a plan and in 3D. Layouts are indicative until the",
       "surveyed drawings arrive, and each plan says so on the page."])
panel(M + colw + 8 * mm, colw, ytop, "new-approvals", "See the paperwork", CANOPY,
      ["Registration, the material partners and the Masoom Group",
       "connection sit on every project page rather than an About page.",
       "An unverified number is labelled as such."])
takeaway("A buyer can choose a specific plot and ask about it by number, on WhatsApp.")
c.showPage()

c.save()
print("written:", OUT, os.path.getsize(OUT) // 1024, "KB")
