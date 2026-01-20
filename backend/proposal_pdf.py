"""
PDF rendering for AI-generated proposals.
Uses fpdf2 for lightweight PDF generation.
"""

from fpdf import FPDF
from typing import Dict, List

TITLE_FONT = {"family": "Arial", "style": "B", "size": 16}
SECTION_FONT = {"family": "Arial", "style": "B", "size": 12}
BODY_FONT = {"family": "Arial", "style": "", "size": 10}


def _sanitize_text(text: str) -> str:
    """Normalize text to Latin-1 safe characters for core fonts.

    Replaces common Unicode punctuation (em dashes, curly quotes, bullets)
    with ASCII equivalents and drops anything that still cannot be encoded.
    """
    replacements = {
        "—": "-",
        "–": "-",
        "…": "...",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "•": "-",
        "–": "-",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    # Final guard: drop characters not representable in latin-1
    return text.encode("latin-1", "ignore").decode("latin-1")


class ProposalPDF(FPDF):
    def header(self):
        self.set_font(TITLE_FONT["family"], TITLE_FONT["style"], TITLE_FONT["size"])
        self.cell(0, 10, "Infrastructure Proposal", ln=1)
        self.ln(2)


def _write_section(pdf: ProposalPDF, title: str, content: str):
    pdf.set_font(SECTION_FONT["family"], SECTION_FONT["style"], SECTION_FONT["size"])
    pdf.cell(0, 8, _sanitize_text(title), ln=1)
    pdf.set_font(BODY_FONT["family"], BODY_FONT["style"], BODY_FONT["size"])
    for line in content.split("\n"):
        pdf.multi_cell(0, 6, _sanitize_text(line))
    pdf.ln(3)


def build_proposal_pdf(
    proposal: Dict[str, str],
    cost_breakdown: List[Dict[str, float]],
    total_monthly: float,
    metadata: Dict[str, str],
) -> bytes:
    pdf = ProposalPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Metadata block
    pdf.set_font(BODY_FONT["family"], BODY_FONT["style"], BODY_FONT["size"])
    meta_lines = [
        f"Use Case: {metadata.get('use_case', 'N/A')}",
        f"Goal: {metadata.get('goal', 'N/A')}",
    ]
    for line in meta_lines:
        pdf.cell(0, 6, line, ln=1)
    pdf.ln(4)

    # Proposal sections
    _write_section(pdf, "Executive Summary", proposal.get("executive_summary", ""))
    _write_section(pdf, "Architecture Rationale", proposal.get("architecture_rationale", ""))
    _write_section(pdf, "Why These Components", proposal.get("component_choices", ""))
    _write_section(pdf, "Trade-offs vs Alternatives", proposal.get("tradeoffs", ""))
    _write_section(pdf, "Risk Mitigation", proposal.get("risks", ""))
    _write_section(pdf, "Next Steps", proposal.get("next_steps", ""))

    # Cost table
    pdf.set_font(SECTION_FONT["family"], SECTION_FONT["style"], SECTION_FONT["size"])
    pdf.cell(0, 8, "Cost Breakdown (Monthly)", ln=1)
    pdf.set_font(BODY_FONT["family"], BODY_FONT["style"], BODY_FONT["size"])
    pdf.cell(80, 6, "Service", border=1)
    pdf.cell(25, 6, "Count", border=1)
    pdf.cell(40, 6, "Unit $", border=1)
    pdf.cell(40, 6, "Subtotal $", border=1, ln=1)

    for item in cost_breakdown:
        pdf.cell(80, 6, _sanitize_text(str(item["service"])), border=1)
        pdf.cell(25, 6, str(item["count"]), border=1)
        pdf.cell(40, 6, f"{item['unit_monthly_usd']:.2f}", border=1)
        pdf.cell(40, 6, f"{item['subtotal_monthly_usd']:.2f}", border=1, ln=1)

    pdf.cell(145, 6, "Total", border=1)
    pdf.cell(40, 6, f"{total_monthly:.2f}", border=1, ln=1)

    output = pdf.output(dest="S")
    # fpdf2 may return str, bytes, or bytearray depending on version; normalize to bytes
    if isinstance(output, (bytes, bytearray)):
        return bytes(output)
    return output.encode("latin1")
