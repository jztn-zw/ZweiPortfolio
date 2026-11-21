from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/pdf/Jaztin_Contreras_CV_Updated_Projects.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
previous_text = PdfReader(str(ROOT / 'output/pdf/Jaztin_Contreras_CV_OpenAI.pdf')).pages[0].extract_text()
for name, file in [('Arial', 'arial.ttf'), ('Arial-Bold', 'arialbd.ttf'), ('Calibri-Bold', 'calibrib.ttf')]:
    pdfmetrics.registerFont(TTFont(name, 'C:/Windows/Fonts/' + file))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial', boldItalic='Arial-Bold')
INK = HexColor('#282f36')
BLUE = HexColor('#1b4b6c')
LINE = HexColor('#8da6b8')
LEFT, RIGHT, WIDTH = 51.84, 562.0, 510.16
c = canvas.Canvas(str(OUT), pagesize=(612, 792))
c.setTitle('Jaztin Abram A. Contreras - CV')
c.setAuthor('Jaztin Abram A. Contreras')
body = ParagraphStyle('Body', fontName='Arial', fontSize=9, leading=10.8, textColor=INK)
title = ParagraphStyle('Project', parent=body, fontName='Arial-Bold', fontSize=9.96, leading=12)
y = 690

def para(text, style=body, indent=0, after=0):
    global y
    p = Paragraph(text, style)
    _, h = p.wrap(WIDTH-indent, 792)
    p.drawOn(c, LEFT+indent, y-h)
    y -= h+after

def section(label, gap=9):
    global y
    y -= gap
    c.setFillColor(BLUE)
    c.setFont('Calibri-Bold', 10.56)
    c.drawString(LEFT, y-10, label)
    c.setStrokeColor(LINE)
    c.setLineWidth(.45)
    c.line(LEFT, y-14, RIGHT, y-14)
    y -= 19

def bullet(text):
    global y
    c.setFillColor(INK)
    c.setFont('Arial', 9)
    c.drawString(LEFT+18, y-8.3, '\u2022')
    para(text, indent=36)

def project(name, subtitle, bullets, link=None):
    global y
    para(escape(name), title)
    if link:
        c.linkURL(link, (LEFT,y,RIGHT,y+12), relative=0, thickness=0)
    para(escape(subtitle), after=2)
    for text in bullets:
        bullet(escape(text))
    y -= 3

# Same centered header, contact line, page size, typefaces and margins as the source.
c.setFillColor(HexColor('#163952'))
c.setFont('Arial-Bold', 18.96)
c.drawCentredString(306, 734, 'JAZTIN ABRAM A. CONTRERAS')
c.setFillColor(INK)
c.setFont('Arial', 9)
c.drawCentredString(306, 719, 'jaztinabramcontreras@gmail.com  |  +63 963 060 9520  |  Quezon, Philippines')
c.setFillColor(BLUE)
portfolio = 'Portfolio: jaztincontreras.vercel.app'
c.drawCentredString(306, 707, portfolio)
tw = pdfmetrics.stringWidth(portfolio, 'Arial', 9)
c.setStrokeColor(BLUE)
c.setLineWidth(.5)
c.line(306-tw/2, 705, 306+tw/2, 705)
c.linkURL('https://jaztincontreras.vercel.app/', (306-tw/2,705,306+tw/2,717), relative=0, thickness=0)

section('PROFESSIONAL PROFILE', gap=0)
para('Full-Stack Developer with hands-on experience building web, mobile, and Windows applications using React, TypeScript, Node.js, and Electron. Interested in building practical, user-focused digital experiences, bringing together interface design, application development, problem-solving, and continuous learning. Motivated to contribute to collaborative development work, strengthen technical foundations, and turn ideas into accessible web experiences.')

section('CORE COMPETENCIES')
para('Full-Stack Web Development | Responsive Web Design | Mobile &amp; Desktop Development | API Development | Database Integration | Workflow Automation | AI-Assisted Development | Machine Learning Fundamentals | Debugging &amp; Problem-Solving')

section('TECHNICAL PROFICIENCY')
for label, text in [
    ('Languages & Front End', 'HTML, CSS, JavaScript, TypeScript; React, Next.js, Tailwind CSS.'),
    ('Mobile & Desktop', 'React Native, Expo, Electron.'),
    ('Back End & Databases', 'Node.js, Express, Socket.IO; MySQL, SQLite, Supabase.'),
    ('CMS & Automation', 'WordPress, GoHighLevel (GHL), n8n.'),
    ('Tools & Collaboration', 'Git, GitHub, Visual Studio Code, Postman, Chrome DevTools, Figma.'),
    ('AI-Assisted Development', 'OpenAI (Codex, ChatGPT), Claude Code, Antigravity.'),
    ('Build & Deployment', 'Vite, Vercel, Render, Cloudflare Workers; Electron Forge, NSIS.'),
]:
    para('<b>'+escape(label)+':</b> '+escape(text), after=1)

section('PROJECT EXPERIENCE')
project('GreenWay - Web & Mobile Waste Management Platform',
        'Candelaria, Quezon | React, React Native, Expo, Node.js, Express, MySQL, Socket.IO', [
    'Built collection tracking, pickup schedules, resident reports, and local announcements for residents and collection teams.',
    'Connected web and mobile interfaces with APIs, map-based tracking, and real-time updates.'
], 'https://greenway-candelaria.vercel.app/')
project('VYORA - Windows Photo Booth & Website',
        'Live; in development | Electron, React, TypeScript, SQLite, Cloudflare Workers', [
    'Built an offline photo booth with custom frames, individual-shot retakes, a local photo library, and strip saving and printing.',
    'Created a download and setup website; packaged Windows installers with Electron Forge and NSIS for GitHub Releases.'
], 'https://vyorabooth.vyora.workers.dev/')
project('Everwell Veterinary Clinic - Website & Inquiry Automation',
        'Portfolio demo; draft workflow | WordPress, GoHighLevel', [
    'Built a clinic website linked to a contact form; configured inquiry notes, team email alerts, and confirmation emails.',
    'Tested form submissions and confirmation email delivery.'
])

section('EDUCATION')
para('<b>Bachelor of Science in Computer Science</b>')
para('Manuel S. Enverga University Foundation - Candelaria, Inc. (MSEUF-CI)')
para('Currently pursuing')

section('DEVELOPMENT APPROACH', gap=9)
for text in [
    'Plan work around the intended user experience and the purpose of the application before moving into implementation.',
    'Break larger development tasks into manageable steps, research unfamiliar concepts, and apply an iterative approach to improving the result.',
    'Review interfaces for clarity, consistency, and usability, with attention to how users navigate and interact with a web experience.',
    'Treat debugging and refinement as part of the development process, using issues discovered during review to guide improvements.',
]:
    bullet(text)

section('PROFESSIONAL STRENGTHS')
para('Curiosity and willingness to learn | Independent problem-solving | Creative thinking | Attention to user experience | Adaptability | Initiative | Detail-oriented project work')

assert y > 42, f'Content overflows: bottom={y}'
c.save()
doc = PdfReader(str(OUT))
assert len(doc.pages)==1
text = doc.pages[0].extract_text()
for expected in ['GreenWay', 'VYORA', 'Everwell', 'TECHNICAL PROFICIENCY', 'PROFESSIONAL STRENGTHS', 'EDUCATION', 'Currently pursuing']:
    assert expected in text
assert '\ufffd' not in text
# Preserve original wording outside the authorized sections.
original = PdfReader('C:/Users/Jaztin/Downloads/Jaztin_Contreras_CV.pdf').pages[0].extract_text()
def normalized(s):
    return ' '.join(s.replace('\ufffd', '').replace('\u2022', '').split())
for start, end in [('DEVELOPMENT APPROACH', 'PROFESSIONAL STRENGTHS'), ('PROFESSIONAL STRENGTHS', None)]:
    old = original.split(start, 1)[1]
    new = text.split(start, 1)[1]
    if end:
        old, new = old.split(end, 1)[0], new.split(end, 1)[0]
    assert normalized(old) == normalized(new), f'Unrequested section changed: {start}'
preserved_profile = original.split('Interested in building', 1)[1].split('CORE COMPETENCIES', 1)[0]
updated_profile = text.split('Interested in building', 1)[1].split('CORE COMPETENCIES', 1)[0]
assert normalized(preserved_profile) == normalized(updated_profile)
if previous_text:
    expected_text = previous_text.replace('Tested form submission and confirmation email delivery; full workflow execution remains unverified.', 'Tested form submissions and confirmation email delivery.')
    assert normalized(expected_text) == normalized(text), 'Content outside Everwell testing bullet changed'
render = pdfium.PdfDocument(str(OUT))
render[0].render(scale=1.7).to_pil().save(str(ROOT/'tmp/pdfs/updated.png'))
print(f'Output: {OUT}\nPages: {len(doc.pages)}\nBottom margin: {y:.1f}pt')
