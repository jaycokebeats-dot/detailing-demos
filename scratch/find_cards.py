import re

with open('c:/Users/Jay/Documents/SecondBrain/Code/black-line-detailing/app/taller/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

tabs = re.findall(r'activeTab === "([^"]+)"', text)
print('Tabs in page:', set(tabs))

for m in re.finditer(r'<FaTrash', text):
    start = max(0, m.start() - 300)
    end = min(len(text), m.end() + 300)
    print(f'=== FaTrash at pos {m.start()} ===')
    print(text[start:end])
    print('='*50)
