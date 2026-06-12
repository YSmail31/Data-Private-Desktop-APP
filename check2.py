with open('app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    
# Find 'export default function DashboardPage()'
start_idx = 0
for i, line in enumerate(lines):
    if 'export default function DashboardPage(' in line:
        start_idx = i
        break
        
# Find next 'return ('
for i in range(start_idx, len(lines)):
    if 'return (' in lines[i]:
        print('Line:', i)
        print(''.join(lines[i:i+30]))
        break
