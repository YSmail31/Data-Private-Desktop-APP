import re
with open('components/dashboardv2/chat-section.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the start of the return statement for DashboardPage
match = re.search(r'return\s*\(\s*<SidebarProvider>', text)
if match:
    # We want to keep everything before this return.
    prefix = text[:match.start()]
    
    # We want to extract just the chatbot part.
    chatbot_match = re.search(r'(\{/\*\s*VIEW:\s*CHATBOT\s*\*/\}.*?)\{/\*\s*VIEW:\s*DESKTOP\s*\*/\}', text, re.DOTALL)
    if chatbot_match:
        chatbot_jsx = chatbot_match.group(1)
        
        # In the chatbot_jsx, we see it starts with {activeTab === "chatbot" && (
        # We also want to render any Modals like isAiConfigModalOpen that was part of Chatbot
        modals_match = re.search(r'(<Dialog\s*open=\{isAiConfigModalOpen\}.*?)</SidebarInset>', text, re.DOTALL)
        modals_jsx = modals_match.group(1) if modals_match else ""
        
        popover_match = re.search(r'(\{activeSelection && activeSelection\.rect && \(\s*<Popover.*?)</SidebarInset>', text, re.DOTALL)
        popover_jsx = popover_match.group(1) if popover_match else ""
        
        # Replace the return statement
        new_return = "return (\n    <>\n" + chatbot_jsx + modals_jsx + popover_jsx + "\n    </>\n  );\n}"
        
        # But wait! The user has state variables and effects. We are leaving them intact.
        # But wait! activeTab might not be "chatbot" by default. 
        # The user has: const [activeTab, setActiveTab] = React.useState<...>(initialTab || "overview")
        # To make it render, we should force activeTab to be "chatbot".
        prefix = re.sub(r'const \[activeTab, setActiveTab\] = React\.useState<.*?>\(\s*.*?\|\|\s*"overview"\s*\)', 'const [activeTab, setActiveTab] = React.useState<any>("chatbot")', prefix)
        
        with open('components/dashboardv2/chat-section.tsx', 'w', encoding='utf-8') as fw:
            fw.write(prefix + new_return)
        print("Successfully extracted chatbot section.")
    else:
        print("Chatbot JSX not found.")
else:
    print("Return statement not found.")
