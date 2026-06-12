import re

with open('app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the component signature
content = content.replace('export default function DashboardPage()', 'export function ChatbotSection()')

# Find where the Chatbot view starts and ends
start_chat_marker = '{/* VIEW: CHATBOT */}'
end_chat_marker = '{/* VIEW: DESKTOP */}'

chat_start = content.find(start_chat_marker)
chat_end = content.find(end_chat_marker)

if chat_start != -1 and chat_end != -1:
    chat_jsx = content[chat_start + len(start_chat_marker):chat_end]
    
    # The return statement is:
    # return (
    #     <SidebarProvider>...
    return_match = re.search(r'return\s*\(\s*<SidebarProvider>', content)
    
    if return_match:
        before_return = content[:return_match.start()]
        
        # We need to include Modals that Chatbot uses:
        # 1. isAiConfigModalOpen
        ai_config_modal = re.search(r'(<Dialog\s*open=\{isAiConfigModalOpen\}.*?</Dialog>)', content, re.DOTALL)
        ai_modal_jsx = ai_config_modal.group(1) if ai_config_modal else ""
        
        # 2. Popover for activeSelection
        popover_match = re.search(r'(\{activeSelection && activeSelection\.rect && \(\s*<Popover.*?</Popover>\s*\)\})', content, re.DOTALL)
        popover_jsx = popover_match.group(1) if popover_match else ""
        
        # Build the new return statement
        new_return = "  return (\n    <>\n" + chat_jsx + "\n" + ai_modal_jsx + "\n" + popover_jsx + "\n    </>\n  );\n}"
        
        # Change initial state of activeTab to 'chatbot' so it always renders
        before_return = re.sub(r'const \[activeTab, setActiveTab\] = React\.useState<.*?>\([\s\S]*?initialTab \|\| "overview"\s*\)', 'const [activeTab, setActiveTab] = React.useState<any>("chatbot")', before_return)
        
        with open('components/dashboardv2/chat-section.tsx', 'w', encoding='utf-8') as fw:
            fw.write(before_return + new_return)
        
        print("Successfully built chat-section.tsx")
    else:
        print("Return statement not found")
else:
    print("Chat markers not found")
        
