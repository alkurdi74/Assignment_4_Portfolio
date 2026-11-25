from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

root = Path(__file__).resolve().parents[1]
out = root / 'Assignment 4 Submission Report.docx'
doc = Document()
section = doc.sections[0]
section.top_margin = Inches(.7)
section.bottom_margin = Inches(.7)
section.left_margin = Inches(.8)
section.right_margin = Inches(.8)

styles = doc.styles
styles['Normal'].font.name = 'Aptos'
styles['Normal'].font.size = Pt(10)
styles['Normal'].font.color.rgb = RGBColor(35, 50, 67)
styles['Normal'].paragraph_format.space_after = Pt(6)
for style_name, size, color in [('Title', 26, '183A56'), ('Heading 1', 18, '183A56'), ('Heading 2', 13, '236A85')]:
    st = styles[style_name]
    st.font.name = 'Aptos Display' if style_name in ('Title','Heading 1') else 'Aptos'
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = RGBColor.from_string(color)
    st.paragraph_format.space_before = Pt(12 if style_name != 'Title' else 0)
    st.paragraph_format.space_after = Pt(6)


def shade(cell, fill='F0F5F8'):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), fill)
    tcPr.append(shd)


def screenshot(label, instruction, height=1.35):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    cell.width = Inches(6.7)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    shade(cell)
    row = table.rows[0]
    row.height = Inches(height)
    row.height_rule = 1
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(f'[INSERT SCREENSHOT: {label}]\n{instruction}')
    r.italic = True
    r.font.name = 'Aptos'
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(72, 96, 112)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def bullet(text):
    doc.add_paragraph(text, style='List Bullet')

# Cover page
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(58)
p = doc.add_paragraph('COMP229 Web Application Development', style='Subtitle')
p.runs[0].font.name = 'Aptos'
p.runs[0].font.size = Pt(13)
p.runs[0].font.color.rgb = RGBColor(35, 106, 133)
doc.add_paragraph('Assignment 4 Portfolio Application', style='Title')
p = doc.add_paragraph('Deployment, testing, and CI/CD evidence')
p.runs[0].font.size = Pt(15)
p.runs[0].font.color.rgb = RGBColor(80, 104, 120)
for _ in range(2): doc.add_paragraph('')
meta = doc.add_table(rows=4, cols=2)
meta.alignment = WD_TABLE_ALIGNMENT.LEFT
for row, (label, value) in zip(meta.rows, [
    ('Student', 'Mohamad Alkurdi'),
    ('Course', 'COMP229 – Web Application Development'),
    ('Demo URL', '[Add the public Render URL after deployment]'),
    ('GitHub repository', 'https://github.com/alkurdi74/Assignment_3_Portfolio_Submission'),
]):
    row.cells[0].text = label
    row.cells[1].text = value
    shade(row.cells[0], 'E5EEF3')
    for cell in row.cells:
        for para in cell.paragraphs:
            para.paragraph_format.space_after = Pt(3)
            for run in para.runs: run.font.size = Pt(9)
doc.add_paragraph('')
p = doc.add_paragraph('This report records the full-stack portfolio release and the evidence required to demonstrate its cloud deployment, database connection, role-based features, automated tests, performance, and continuous deployment. Replace each marked evidence box with a clean screenshot or recording reference after the live deployment is verified.')
p.paragraph_format.space_before = Pt(20)
doc.add_page_break()

# Architecture

doc.add_heading('Application and deployment', level=1)
doc.add_paragraph('The portfolio uses a React frontend and an Express API. The API stores portfolio records and account data in MongoDB Atlas. JWT sign-in identifies the account role: administrators can manage portfolio records, while regular users can view them. The public contact form saves submissions to the same database.')
doc.add_heading('Cloud release', level=2)
doc.add_paragraph('The Render Blueprint builds the React production assets and runs the Express server as one web service. GitHub Actions checks linting, builds the frontend, runs the API tests, then runs Cypress against the production-mode app with a disposable MongoDB database. Render deploys commits merged to the production branch.')
doc.add_paragraph('Public demo address: [Add the verified onrender.com URL]. Database: MongoDB Atlas, shared cluster in the region closest to the Render service. Credentials and signing keys are configured in the hosting dashboard and are not included in this report or repository.')
screenshot('Render deployment and public URL', 'Show the service as Live and the public onrender.com address. Keep environment values hidden.', 1.55)
screenshot('MongoDB Atlas collections', 'Show the project database and portfolio collections, with connection details and user information hidden.', 1.55)
doc.add_page_break()

# User features

doc.add_heading('Application features and access roles', level=1)
doc.add_paragraph('The portfolio pages display project and education records from the API. The contact form sends visitor entries to the database. After sign-in, the application reads the role returned by the server and presents administrator actions only to accounts with the admin role.')
doc.add_heading('Administrator record management', level=2)
doc.add_paragraph('Demonstrate a complete create, edit, and delete flow on a project or education record. After each change, show that the updated list reflects the database response.')
screenshot('Administrator create or edit result', 'Show the signed-in administrator, the record form, and the resulting saved or updated record.', 1.7)
doc.add_heading('Regular user read-only access', level=2)
doc.add_paragraph('Sign in with a regular account created through the signup form. Show that project or education entries remain visible and administrator-only write controls are absent.')
screenshot('Regular user read-only view', 'Show the signed-in user role and the portfolio list without Add, Edit, or Delete controls.', 1.6)
doc.add_heading('Contact form saved to the database', level=2)
doc.add_paragraph('Submit a sample contact message, then sign in as administrator and show the saved contact record. Use synthetic demo information only.')
screenshot('Contact submission', 'Show the successful form submission or saved contact record. Do not expose real personal information.', 1.6)
doc.add_page_break()

# Tests

doc.add_heading('Automated testing', level=1)
doc.add_paragraph('The CI workflow performs static checks and API/database tests. Cypress then exercises the production frontend and API using a temporary MongoDB service. The browser suite covers contact persistence, administrator project create/edit/delete, and read-only access for a regular account. CI test credentials are disposable and are not production credentials.')
doc.add_heading('Cypress end-to-end run', level=2)
doc.add_paragraph('Capture the GitHub Actions run with all test steps passing. Attach the Cypress recording from the workflow artifact or provide a path to the saved video. Add a screenshot of the test summary for the Word submission.')
screenshot('Cypress tests passing', 'Show the successful GitHub Actions Cypress step or the Cypress browser results.', 1.7)
screenshot('Cypress browser recording', 'Insert a frame from the admin project CRUD recording. Include the video filename or artifact link in the caption.', 1.7)
doc.add_heading('Performance review', level=2)
doc.add_paragraph('Record a desktop and mobile check after the public service is live. The production build serves minified frontend assets from the same origin as the API. Add a measured Lighthouse or browser performance summary if one was collected; do not claim a score without a report.')
screenshot('Performance and responsive check', 'Insert the real Lighthouse summary or a mobile-width browser screenshot. Add the date and any measured score.', 1.6)
doc.add_page_break()

# CI/CD

doc.add_heading('Continuous deployment evidence', level=1)
doc.add_paragraph('Assignment 4 asks for a content change committed on a new GitHub branch, merged into the production branch, and visible on the deployed portfolio. Capture the original page before the merge, then the changed page after Render completes the new deployment.')
doc.add_paragraph('Change demonstrated: [Describe the small content addition]. Branch: [Add branch name]. Merge commit: [Add commit or pull request link]. Deployment: [Add Render deploy time or event].')
screenshot('Before merge', 'Show the original live page before the new branch is merged.', 1.9)
screenshot('After merge and deployment', 'Refresh the same live page after the new content appears. Keep the URL visible.', 1.9)
doc.add_heading('Submission links', level=2)
doc.add_paragraph('Live demo: [Add verified Render URL]\nGitHub repository: https://github.com/alkurdi74/Assignment_3_Portfolio_Submission\nGitHub Actions run: [Add successful run URL]\nCypress video: [Add artifact or local filename]')
doc.add_paragraph('Before submission, replace every marked evidence box, verify all links, and remove any credentials, tokens, or personal contact data from screenshots.')

doc.save(out)
print(out)
