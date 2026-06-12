import re

with open('components/dashboardv2/chat-section.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'return\s*\(.*?</SidebarInset>', text, re.DOTALL)
if match:
    print("Found return via regex")
else:
    print("Not found")

# Let's just find the first eturn ( after DashboardPage
start = text.find('export function ChatSection(')
if start == -1:
    start = text.find('export default function DashboardPage(')
    
if start != -1:
    idx = text.find('return (', start)
    print(text[idx:idx+200])
