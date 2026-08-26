import sys
import math
from PIL import Image, ImageDraw, ImageFilter

def create_mike_ford_headshot(output_path):
    width, height = 800, 800
    img = Image.new('RGB', (width, height), '#1e40af') # Solid royal blue background
    draw = ImageDraw.Draw(img)

    # 1. Background gradient / studio light effect behind subject
    for r in range(450, 0, -5):
        alpha = int(255 * (1 - (r / 450)**1.5))
        color = (30 + int(30 * (1 - r/450)), 70 + int(40 * (1 - r/450)), 185 + int(40 * (1 - r/450)))
        draw.ellipse([400 - r, 350 - r, 400 + r, 350 + r], fill=color)

    # 2. Body / Suit Jacket (Charcoal Grey)
    # Left shoulder
    draw.polygon([(100, 800), (220, 520), (330, 540), (330, 800)], fill='#374151')
    # Right shoulder
    draw.polygon([(700, 800), (580, 520), (470, 540), (470, 800)], fill='#374151')
    # Suit center / jacket lapels
    draw.polygon([(220, 520), (330, 540), (350, 680), (250, 800)], fill='#1f2937') # Left lapel
    draw.polygon([(580, 520), (470, 540), (450, 680), (550, 800)], fill='#1f2937') # Right lapel

    # 3. Yellow Shirt V-neck & Collar
    draw.polygon([(330, 510), (470, 510), (420, 660), (380, 660)], fill='#fef08a') # Yellow shirt center
    # Left shirt collar
    draw.polygon([(320, 480), (380, 550), (350, 565), (310, 495)], fill='#fde047')
    # Right shirt collar
    draw.polygon([(480, 480), (420, 550), (450, 565), (490, 495)], fill='#fde047')

    # 4. Tie (Gold and Grey Paisley pattern)
    draw.polygon([(385, 530), (415, 530), (430, 780), (370, 780)], fill='#d97706') # Gold base
    # Paisley details on tie
    tie_draw = ImageDraw.Draw(img)
    for y_offset in range(540, 780, 25):
        tie_draw.ellipse([385, y_offset, 405, y_offset + 15], fill='#9ca3af', outline='#4b5563')
        tie_draw.ellipse([400, y_offset + 10, 418, y_offset + 22], fill='#fbbf24', outline='#b45309')

    # 5. Neck (Warm skin tone with subtle shading)
    draw.polygon([(340, 390), (460, 390), (475, 520), (325, 520)], fill='#e2b192')
    # Neck shadow under chin
    draw.polygon([(340, 390), (460, 390), (440, 435), (360, 435)], fill='#cc9474')

    # 6. Head & Face (Friendly bald head shape)
    # Lower head / jaw / cheeks
    draw.ellipse([270, 180, 530, 450], fill='#e8b899') # Face base
    # Upper bald skull (smooth dome)
    draw.ellipse([275, 120, 525, 360], fill='#ebd0bc') # Top bald dome highlight

    # Face contour shading
    # Ears
    draw.ellipse([250, 270, 280, 340], fill='#dfa988') # Left ear
    draw.ellipse([520, 270, 550, 340], fill='#dfa988') # Right ear
    draw.ellipse([255, 280, 275, 330], fill='#cb9272')
    draw.ellipse([525, 280, 545, 330], fill='#cb9272')

    # Eyes (Blue eyes)
    # Left eye socket / eye
    draw.ellipse([325, 270, 375, 292], fill='#ffffff')
    draw.ellipse([342, 273, 362, 290], fill='#2563eb') # Blue iris
    draw.ellipse([348, 278, 356, 285], fill='#000000') # Pupil
    draw.ellipse([352, 275, 356, 279], fill='#ffffff') # Eye catchlight

    # Right eye socket / eye
    draw.ellipse([425, 270, 475, 292], fill='#ffffff')
    draw.ellipse([438, 273, 458, 290], fill='#2563eb') # Blue iris
    draw.ellipse([444, 278, 452, 285], fill='#000000') # Pupil
    draw.ellipse([448, 275, 452, 279], fill='#ffffff') # Eye catchlight

    # Eyebrows (Light brown / blonde subtle tone)
    draw.arc([320, 250, 380, 270], start=190, end=350, fill='#b48a66', width=4)
    draw.arc([420, 250, 480, 270], start=190, end=350, fill='#b48a66', width=4)

    # Nose
    draw.line([(400, 270), (395, 330)], fill='#d49976', width=3)
    draw.arc([385, 320, 415, 340], start=10, end=170, fill='#b87d5a', width=3)

    # Mouth & Smile (Warm, approachable expression)
    draw.arc([350, 345, 450, 385], start=20, end=160, fill='#8a4332', width=4)
    draw.line([(350, 362), (450, 362)], fill='#a8533e', width=2)

    # Subtle stubble / clean-shaven shadow
    # Bald head specular highlights
    draw.ellipse([340, 140, 430, 190], fill='#f5e3d7') # Soft sheen on top of head

    # Save image
    img.save(output_path, 'JPEG', quality=95)
    print(f"Successfully generated Mike Ford headshot at {output_path}")

if __name__ == '__main__':
    create_mike_ford_headshot(sys.argv[1] if len(sys.argv) > 1 else 'public/mike-ford-headshot.jpg')
