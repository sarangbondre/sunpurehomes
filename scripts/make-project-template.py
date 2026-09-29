"""Writes the workbook the client fills in for each project.

Every row is a thing the website publishes. The "On the website now" column
is read from content/projects/*.json, so the sheet always shows what a
visitor sees today and the person filling it in only has to correct what is
wrong or fill what is blank.

Run:  python3 scripts/make-project-template.py
Needs openpyxl. Output: docs/client/Sunpure-website-project-details.xlsx
"""

from __future__ import annotations

import json
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "content" / "projects"
OUT = ROOT / "docs" / "client" / "Sunpure-website-project-details.xlsx"

INK = "1C1A18"
PAPER = "F4F0E7"
PAPER2 = "EAE3D5"
RED = "D40000"
LINE = "DED5C4"

TITLE = Font(name="Calibri", size=16, bold=True, color=INK)
H1 = Font(name="Calibri", size=12, bold=True, color="FFFFFF")
H2 = Font(name="Calibri", size=11, bold=True, color=INK)
BODY = Font(name="Calibri", size=11, color=INK)
MUTED = Font(name="Calibri", size=10, italic=True, color="6E675C")
NEEDED = Font(name="Calibri", size=11, bold=True, color=RED)

FILL_SECTION = PatternFill("solid", fgColor=INK)
FILL_HEAD = PatternFill("solid", fgColor=PAPER2)
FILL_ANSWER = PatternFill("solid", fgColor="FFFDF7")
THIN = Side(style="thin", color=LINE)
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")

COLUMNS = ["Section", "What the website shows", "On the website now", "Your answer / correction", "Notes"]
WIDTHS = [22, 34, 52, 46, 46]

MISSING = "— not on the website —"


def load() -> list[dict]:
    files = sorted(PROJECTS.glob("*.json"))
    return [json.loads(f.read_text()) for f in files]


def area(value) -> str:
    """As the website prints it — whole square feet."""
    if value is None:
        return ""
    if isinstance(value, list):
        return f"{round(value[0]):,} – {round(value[1]):,} sq ft"
    return f"{round(value):,} sq ft"


def style_row(ws, row: int, *, answerable: bool) -> None:
    for col in range(1, len(COLUMNS) + 1):
        cell = ws.cell(row=row, column=col)
        cell.alignment = WRAP
        cell.border = BOX
        if cell.font is None or cell.font.name is None:
            cell.font = BODY
    if answerable:
        ws.cell(row=row, column=4).fill = FILL_ANSWER


def section(ws, row: int, title: str, note: str = "") -> int:
    ws.cell(row=row, column=1, value=title).font = H1
    ws.cell(row=row, column=1).fill = FILL_SECTION
    for col in range(2, len(COLUMNS) + 1):
        ws.cell(row=row, column=col).fill = FILL_SECTION
    if note:
        cell = ws.cell(row=row, column=2, value=note)
        cell.font = Font(name="Calibri", size=10, italic=True, color="FFFFFF")
    ws.row_dimensions[row].height = 20
    return row + 1


def field(
    ws,
    row: int,
    label: str,
    value,
    note: str = "",
    *,
    required: bool = True,
    show_missing: bool = True,
) -> int:
    """One row. `show_missing` is off for rows that are a question to them,
    not something the website is missing."""
    ws.cell(row=row, column=2, value=label).font = H2
    shown = value if value not in (None, "", []) else (MISSING if show_missing else "")
    cell = ws.cell(row=row, column=3, value=shown)
    cell.font = NEEDED if shown == MISSING else BODY
    ws.cell(row=row, column=5, value=note).font = MUTED
    style_row(ws, row, answerable=required)
    return row + 1


def table(ws, row: int, headers: list[str], rows: list[list], blanks: int = 3) -> int:
    for i, head in enumerate(headers):
        cell = ws.cell(row=row, column=2 + i, value=head)
        cell.font = H2
        cell.fill = FILL_HEAD
        cell.border = BOX
        cell.alignment = WRAP
    row += 1
    for values in rows:
        for i, value in enumerate(values):
            cell = ws.cell(row=row, column=2 + i, value=value)
            cell.font = BODY
            cell.border = BOX
            cell.alignment = WRAP
        row += 1
    for _ in range(blanks):
        for i in range(len(headers)):
            cell = ws.cell(row=row, column=2 + i)
            cell.border = BOX
            cell.fill = FILL_ANSWER
            cell.alignment = WRAP
        row += 1
    return row + 1


def readme(wb: Workbook, projects: list[dict]) -> None:
    ws = wb.create_sheet("Read me first")
    ws.column_dimensions["A"].width = 4
    ws.column_dimensions["B"].width = 110
    ws["B2"] = "Sunpure Homes — website details, project by project"
    ws["B2"].font = TITLE
    lines = [
        "",
        "One sheet per project. Every row is something the website shows a buyer.",
        "",
        "How to fill it in",
        "  1. Read the “On the website now” column. That is exactly what the live page says today.",
        "  2. Where it is right, leave the answer column empty.",
        "  3. Where it is wrong or missing, write the correct value in “Your answer / correction”.",
        "  4. Rows in red say “— not on the website —”. Those are the gaps we would like to fill.",
        "  5. Tables (configurations, amenities, specifications, brands, nearby places) have blank rows at the",
        "     end — add as many as you need, or write “delete” beside a row that should come off the site.",
        "",
        "Words we use, so we mean the same thing",
        "  Built-up area — the figure the site publishes for every home. Say so if a figure is super built-up.",
        "  Carpet area — the figure RERA requires. Please give it where you have it.",
        "  Configuration — a kind of home: 2 BHK, 3 BHK, a plot size.",
        "  Status — ongoing (under construction), completed, or upcoming.",
        "",
        "What we especially need",
        "  •  Bathroom counts. The site currently shows one bathroom per bedroom because no file records them.",
        "  •  Confirmation that each area figure is built-up, not super built-up.",
        "  •  The brands for each project, and what each one supplies.",
        "  •  Logos for Koala, Astral Pipes, Ashirvad, Qcon RKB, SK Super Steel and Techtonics.",
        "  •  High-resolution images, and which of them are interiors.",
        "",
        "Anything you cannot confirm, please leave blank rather than guessing — the website says nothing",
        "rather than something unverified, and a RERA-registered page is the wrong place to estimate.",
        "",
        f"Projects in this workbook: {', '.join(p['name'] for p in projects)}.",
    ]
    row = 3
    for line in lines:
        cell = ws.cell(row=row, column=2, value=line)
        cell.font = H2 if line and not line.startswith(" ") and not line.endswith(".") else BODY
        cell.alignment = Alignment(wrap_text=False, vertical="top")
        row += 1
    ws.sheet_view.showGridLines = False


def project_sheet(wb: Workbook, p: dict) -> None:
    ws = wb.create_sheet(p["name"][:31])
    for i, width in enumerate(WIDTHS, start=1):
        ws.column_dimensions[get_column_letter(i)].width = width
    ws.sheet_view.showGridLines = False

    ws["A1"] = p["name"]
    ws["A1"].font = TITLE
    ws["C1"] = "Fill in column D. Leave blank where the website is already right."
    ws["C1"].font = MUTED
    row = 3
    for i, head in enumerate(COLUMNS):
        cell = ws.cell(row=row, column=1 + i, value=head)
        cell.font = H2
        cell.fill = FILL_HEAD
        cell.border = BOX
    ws.freeze_panes = ws.cell(row=row + 1, column=1)
    row += 1

    loc = p["location"]
    scale = p["scale"]
    comp = p["compliance"]

    row = section(ws, row, "The project", "the top of the project page")
    row = field(ws, row, "Name", p["name"], "The title on the page and in the menu.")
    row = field(ws, row, "Type", p["type"], "villa, apartment or plot.")
    row = field(ws, row, "Status", p["status"], "ongoing, completed or upcoming.")
    row = field(ws, row, "Class", p.get("category"), 'Optional, e.g. "Premium apartments".', required=False)
    row = field(ws, row, "Tagline", p["tagline"], "One line under the name.")
    row = field(ws, row, "Headline", p.get("headline"), 'The large line, e.g. "A home for a fuller life."')
    row = field(ws, row, "Line about the homes", p.get("homesLine"), 'Beside the count, e.g. "Spacious 3 BHK homes with deep balconies."')
    row = field(ws, row, "Description", p["description"], "The paragraph under the headline.")
    row = field(ws, row, "Line under the configurations", p.get("configurationsNote"), 'e.g. "Well-proportioned homes designed for comfort, light and privacy."')

    row = section(ws, row, "Where it is", "shown on the page and used for directions")
    row = field(ws, row, "Locality", loc["label"], "Shown on the picture and on the project card.")
    row = field(ws, row, "Address", "\n".join(loc["addressLines"]), "One line per row. The “Get directions” link searches this.")
    coords = loc.get("coordinates")
    row = field(
        ws,
        row,
        "Map location",
        f"{coords['lat']}, {coords['lng']}" if coords else None,
        "Latitude, longitude. Only if you have the surveyed point.",
        required=False,
    )

    row = section(ws, row, "Scale", "the figures beside the description")
    row = field(ws, row, "Number of homes / plots", scale.get("unitCount"), "The published total.")
    row = field(ws, row, "What they are called", scale.get("unitNoun"), 'e.g. apartments, villas, plots.')
    row = field(ws, row, "Acres", scale.get("acres"), "Site area, if published.", required=False)
    row = field(ws, row, "Floors", scale.get("floors"), 'As you write it, e.g. "G+4".', required=False)
    row = field(ws, row, "Parking", scale.get("parking"), 'e.g. "Ground floor".', required=False)

    row = section(ws, row, "Configurations", "the cards or table under “How much”")
    row = table(
        ws,
        row,
        ["Configuration", "Built-up area", "Carpet area", "How many", "Facing", "Bedrooms", "Bathrooms", "Balcony"],
        [
            [
                c["label"],
                area(c.get("areaSqft")),
                area(c.get("carpetAreaSqft")),
                c.get("count", ""),
                c.get("facing", ""),
                "",
                "",
                c.get("balcony", ""),
            ]
            for c in p["configurations"]
        ],
    )

    if p.get("facings"):
        row = section(ws, row, "Facing, by flat", "shown under the configurations")
        row = table(ws, row, ["Flats", "Facing"], [[f["flats"], f["facing"]] for f in p["facings"]], blanks=2)

    row = section(ws, row, "Amenities", "the icon grid, and the site-wide amenities page")
    row = table(
        ws,
        row,
        ["Amenity, as it should read", "Anything to add (optional)"],
        [[a["name"], a.get("description", "")] for a in p["amenities"]],
        blanks=5,
    )

    row = section(ws, row, "Specifications", "the cards under “Built to”")
    spec_rows = [[g["group"], item] for g in p["specifications"] for item in g["items"]]
    row = table(ws, row, ["Group", "Item"], spec_rows or [["", ""]], blanks=5)

    row = section(ws, row, "Brands", "grouped by what each supplies")
    brand_rows = [[m["brand"], m["use"]] for m in p.get("materials", [])]
    row = table(
        ws,
        row,
        ["Brand", "What it supplies"],
        brand_rows or [[MISSING, "the site-wide brand list is used for this project"]],
        blanks=6,
    )

    row = section(ws, row, "Approvals", "the “Is it safe” card")
    row = field(ws, row, "RERA registration number", comp.get("reraNumber"), "Exactly as on the register.")
    row = field(
        ws,
        row,
        "Further RERA numbers",
        ", ".join(comp.get("reraAdditionalNumbers", [])) or None,
        "Extensions or phases registered separately.",
        required=False,
    )
    row = field(
        ws,
        row,
        "Is the number confirmed?",
        "yes" if comp.get("reraProvenance") == "verified" else "not yet — the page says so",
        "The page carries a warning until you confirm it.",
    )
    row = field(ws, row, "Plan sanction", comp.get("planSanction"), "Sanctioned, or not yet.", required=False)
    row = field(ws, row, "Khata", comp.get("khataConversion"), "Converted, or pending.", required=False)
    row = field(
        ws,
        row,
        "Banks that approved loans",
        ", ".join(comp.get("approvedBanks", [])) or None,
        "Only banks that have actually approved the project.",
        required=False,
    )

    row = section(ws, row, "Nearby", "the connectivity list")
    row = table(
        ws,
        row,
        ["Place", "Kind (work / education / retail / health / transport / leisure)", "Distance km", "Minutes"],
        [
            [c["name"], c["category"], c.get("distanceKm", ""), c.get("travelMinutes", "")]
            for c in p["connectivity"]
        ],
        blanks=6,
    )

    row = section(ws, row, "Pictures", "the sequence at the top, and the gallery tabs")
    row = table(
        ws,
        row,
        ["File on the website", "What it shows", "Exterior or interior"],
        [[g["src"].rsplit("/", 1)[-1], g["alt"], g["view"]] for g in p["gallery"]],
        blanks=4,
    )
    row = field(
        ws,
        row,
        "Higher-resolution files?",
        None,
        "Tell us where they are and we will replace the ones on the site.",
        show_missing=False,
    )
    row = field(
        ws,
        row,
        "Walkthrough video or 3D tour link",
        p.get("tour", {}).get("url") if isinstance(p.get("tour"), dict) else None,
        "A link we may embed.",
        required=False,
        show_missing=False,
    )

    warnings = p.get("contentWarnings") or []
    if warnings:
        row = section(ws, row, "Our open questions", "what we could not confirm for this project")
        for warning in warnings:
            ws.cell(row=row, column=2, value="Please confirm").font = H2
            ws.cell(row=row, column=3, value=warning).font = BODY
            style_row(ws, row, answerable=True)
            row += 1

    yes_no = DataValidation(type="list", formula1='"yes,no"', allow_blank=True)
    ws.add_data_validation(yes_no)
    for r in range(4, row):
        ws.row_dimensions[r].height = None


def site_sheet(wb: Workbook, projects: list[dict]) -> None:
    ws = wb.create_sheet("Everything else")
    for i, width in enumerate(WIDTHS, start=1):
        ws.column_dimensions[get_column_letter(i)].width = width
    ws.sheet_view.showGridLines = False
    ws["A1"] = "The rest of the website"
    ws["A1"].font = TITLE
    row = 3
    for i, head in enumerate(COLUMNS):
        cell = ws.cell(row=row, column=1 + i, value=head)
        cell.font = H2
        cell.fill = FILL_HEAD
        cell.border = BOX
    row += 1

    row = section(ws, row, "Contact", "the header, the footer and every project page")
    row = field(ws, row, "Sales phone / WhatsApp", "+91 99169 00511", "One number for the whole site. The brochures carry four others.")
    row = field(ws, row, "Sales email", "sales@sunpurehomes.com", "Every “email us” link.")
    row = field(ws, row, "Office address", None, "Shown nowhere yet. Send it if it should be on the site.", required=False, show_missing=False)

    row = section(ws, row, "Follow", "the icons in the footer")
    for name in ["Instagram", "Facebook", "YouTube", "LinkedIn"]:
        row = field(
            ws,
            row,
            name,
            None,
            "One link each. Leave blank to keep it off the site.",
            required=False,
            show_missing=False,
        )

    row = section(ws, row, "The company", "the About page")
    row = field(ws, row, "Legal entity on the RERA registrations", None, "The brochures name MK Infra Holding; our file says M.K. Agrotech Pvt. Ltd.", show_missing=False)
    row = field(ws, row, "Cities outside Mysuru", None, "The About page says the practice works across India but names no other city.", show_missing=False)
    row = field(ws, row, "Directors and their titles", None, "Needed before any leadership section can go on the site.", required=False, show_missing=False)

    row = section(ws, row, "Privacy policy", "the /privacy page")
    row = field(ws, row, "Approved policy text", None, "Or the three facts below, and we will keep the interim text.", show_missing=False)
    row = field(ws, row, "Legal entity, grievance officer, retention period", None, "The interim policy names none of these.", show_missing=False)

    row = section(ws, row, "Brand logos we do not have", "the “Built with” list")
    row = table(
        ws,
        row,
        ["Brand", "Logo file (where to find it)"],
        [[name, ""] for name in ["Koala", "Astral Pipes", "Ashirvad", "Qcon RKB", "SK Super Steel", "Techtonics"]],
        blanks=4,
    )
    row = field(ws, row, "What does Koala supply?", None, "It is the one brand with no category, so it sits under “Also”.", show_missing=False)


def main() -> None:
    projects = load()
    wb = Workbook()
    wb.remove(wb.active)
    readme(wb, projects)
    for p in projects:
        project_sheet(wb, p)
    site_sheet(wb, projects)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print(f"wrote {OUT.relative_to(ROOT)} — {len(wb.sheetnames)} sheets")


if __name__ == "__main__":
    main()
