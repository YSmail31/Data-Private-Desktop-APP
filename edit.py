import re

with open('app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make it export function ChatSection()
text = text.replace('export default function DashboardPage()', 'export function ChatSection()')

# Write back
with open('components/dashboardv2/chat-section.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
