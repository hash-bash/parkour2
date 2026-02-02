import logging
from fpdf import FPDF, HTMLMixin
from fpdf.errors import FPDFUnicodeEncodingException

logger = logging.getLogger("db")

class PDF(FPDF):  # pragma: no cover
    def __init__(self, title="Title", font="Arial"):
        super().__init__()
        self.core_fonts_encoding = "UTF-8"
        self.title = title
        self.font = font

    def header(self):
        self.set_font(self.font, style="B", size=14)  # Arial bold 15
        self.cell(0, 10, self.title, align="C")  # Title
        self.ln(10)  # Line break

    def footer(self):
        self.set_y(-15)  # Position at 1.5 cm from bottom
        self.set_font(self.font, size=8)  # Arial 8
        # Page number
        self.cell(0, 10, "Page " + str(self.page_no()) + " of {nb}", 0, 0, "C")

    def info_row(self, title, value):
        self.set_font(self.font, style="B", size=11)
        self.cell(35, 10, title + ":")
        self.set_font(self.font, size=11)
        self.cell(0, 10, value)
        self.ln(6)

    def multi_info_row(self, title, value):
        self.set_font(self.font, style="B", size=11)
        self.ln(3)
        self.cell(35, 4, title + ":")
        self.set_font(self.font, size=11)
        self.multi_cell(0, 5, value)
        self.ln(6)

    def multi_checkbox_row(self, title, values):
        self.set_font(self.font, style="B", size=11)
        self.ln(3)
        self.cell(35, 4, title + ":")
        for i in range(len(values)):
            if i > 0:
                self.cell(35, 4, "")
            self.set_font("glyphicons", size=11)
            self.cell(1, 4, "")
            self.set_font(self.font, size=11)
            self.multi_cell(0, 5, values[i])
            self.ln(1)
        self.ln(1)

    def table_row(self, index, name, barcode, type, depth, bold=False):
        if bold:
            self.set_font(self.font, style="B", size=11)
        else:
            self.set_font(self.font, size=11)
        self.cell(10, 10, str(index))
        self.cell(60, 10, name)
        self.cell(40, 10, barcode)
        self.cell(35, 10, type)
        self.cell(0, 10, str(depth))
        self.ln(6)


class Report(FPDF, HTMLMixin):
    def __init__(self, title="Report", font="Arial"):
        self.core_fonts_encoding = "UTF-8"
        self.title = title
        self.font = font
        super().__init__()

    def header(self):
        self.set_font(family=self.font, size=8)
        self.set_text_color(r=189, g=189, b=189)
        self.cell(0, 10, "COMPLETE REPORT", align="L")
        self.cell(0, 10, "Deep Sequencing Facility @ MPI-IE, Freiburg", align="R")
        self.ln(10)

    def footer(self):
        self.set_y(-15)  # Position at 1.5 cm from bottom
        self.set_font(self.font, size=8)  # Arial 8
        # Page number
        self.cell(0, 10, "Page " + str(self.page_no()) + " of {nb}", 0, 0, "C")

    def page_header(self, text):
        self.set_font(family=self.font, style="B", size=12)
        self.cell(0, 10, text)
        self.ln(14)

    def text_block(self, text, style="", size=11, multi=False):
        self.set_font(family=self.font, style=style, size=size)
        if multi:
            self.multi_cell(0, 6, text)
        else:
            self.cell(0, 10, text)
        self.ln(6)

    def generate_html_table(self, data):
        if len(data) == 0:
            return ""

        columns = list(data[0].keys())
        length = len(columns)

        thead = "".join(
            map(
                lambda c: f'<th width="{100 // length}%" align="left">{c}</th>',
                columns,
            )
        )

        tbody = []
        for item in data:
            row = "".join(map(lambda x: f"<td>{x}</td>", item.values()))
            tbody.append(f"<tr>{row}</tr>")
        tbody = "".join(tbody)

        html = """
        <font face="Arial" size="10">
             <table border="0" width="100%">
                <thead>
                    <tr>{}</tr>
                </thead>
                <tbody>{}</tbody>
            </table>
        </font>
        """.format(thead, tbody)
        html = html.replace("\n", "")

        return html
