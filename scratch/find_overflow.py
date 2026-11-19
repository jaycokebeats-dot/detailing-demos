with open('c:/Users/Jay/Documents/SecondBrain/Code/black-line-detailing/app/taller/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('activeTab === "cheques"')
pos2 = text.find('activeTab === "cheques"', pos+1)
print(text[pos2:pos2+2500])
