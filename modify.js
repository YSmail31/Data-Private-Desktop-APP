const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'Projects', 'siroko_v0.1', 'frontend', 'components', 'dashboardv2', 'chat-section.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The file has ~3500 lines. We want to remove a ton of unused state and functions from the ChatSection component.
// Instead of complex regex for React code, we can remove well-known unused blocks exactly string-by-string or chunk-by-chunk.

// Removing the translations blocks
content = content.replace(/    profile: \{[\s\S]*?(?=    overview: \{)/g, '');
content = content.replace(/    overview: \{[\s\S]*?(?=    desktop: \{)/g, '');
content = content.replace(/    desktop: \{[\s\S]*?(?=    apiKeys: \{)/g, '');
content = content.replace(/    apiKeys: \{[\s\S]*?(?=    apiDocs: \{)/g, '');
content = content.replace(/    apiDocs: \{[\s\S]*?(?=    chatbot: \{)/g, '');
content = content.replace(/ {4}chatbot: \{/g, '    chatbot: {');
content = content.replace(/    entityDetection: \{[\s\S]*?(?=\n  \},?\n  en: \{)/g, '');
content = content.replace(/    entityDetection: \{[\s\S]*?(?=\n  \}\n\})/g, '');

// Removing states
const linesToRemove = [
  'const [apiKeys, setApiKeys] = React.useState<any[]>([])',
  'const [selectedApiKey, setSelectedApiKey] = React.useState<string>("YOUR_API_KEY")',
  'const [isNewKeyModalOpen, setIsNewKeyModalOpen] = React.useState(false)',
  'const [createdKey, setCreatedKey] = React.useState<string | null>(null)',
  'const [newKeyData, setNewKeyData] = React.useState<{ name: string, type: string, expires_at: string | null, request_limit: number | null }>({',
  'name: "",',
  'type: "dev",',
  'expires_at: null,',
  'request_limit: null',
  '})',
  'const [isCreatingKey, setIsCreatingKey] = React.useState(false)',
  
  '// API Documentation Test State',
  'const [testResult, setTestResult] = React.useState<any>(null)',
  'const [isTestingApi, setIsTestingApi] = React.useState(false)',
  "const [selectedTestLang, setSelectedTestLang] = React.useState<'python' | 'javascript' | 'curl' | 'php'>('python')",
  'const [isTestSnippetCopied, setIsTestSnippetCopied] = React.useState(false)',
  'const [testPayload, setTestPayload] = React.useState<string>(JSON.stringify({',
  '"text": "Bonjour, je m\'appelle Jean Dupont et mon email est jean@exemple.com",',
  '"labels": [],',
  '"confidence_threshold": 0.3,',
  '}, null, 2))',
  
  'const [isEditingProfile, setIsEditingProfile] = React.useState(false)',
  'const [editedUser, setEditedUser] = React.useState({ full_name: "", company: "" })',
  'const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false)',
  'const [isChangingPassword, setIsChangingPassword] = React.useState(false)',
  'const [passwordData, setPasswordData] = React.useState({ old_password: "", new_password: "", confirm_password: "" })',
  'const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false)',
  'const [showOldPassword, setShowOldPassword] = React.useState(false)',
  'const [showNewPassword, setShowNewPassword] = React.useState(false)',
  'const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)',
  'const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false)',
  'const [isUpgradingPlan, setIsUpgradingPlan] = React.useState(false)',
  
  'const [detectionInput, setDetectionInput] = React.useState("")',
  'const [detectionResult, setDetectionResult] = React.useState("")',
  'const [originalDetectionResult, setOriginalDetectionResult] = React.useState("")',
  'const [isCopied, setIsCopied] = React.useState(false)',
  'const [detectedEntities, setDetectedEntities] = React.useState<any[]>([])',
  'const [detectionDuration, setDetectionDuration] = React.useState<number | null>(null)',
  'const [detectionThreshold, setDetectionThreshold] = React.useState<number>(0.1)',
  'const [selectedLabels, setSelectedLabels] = React.useState<string[]>([])',
  'const [expandedCategories, setExpandedCategories] = React.useState<string[]>([])',
  'const [detectionStats, setDetectionStats] = React.useState({',
  'total: 0,',
  'change: 0,',
  'requests: 0,',
  'requestsChange: 0,',
  'currentMonthRequests: 0,',
  'daily_usage: [] as { date: string, requests: number }[]',
  '})',
  'const [entitySidebarOpen, setEntitySidebarOpen] = React.useState(true)',
  
  'import {',
  'AreaChart,',
  'Area,',
  'XAxis,',
  'YAxis,',
  'CartesianGrid,',
  'Tooltip,',
  'ResponsiveContainer,',
  'Cell',
  "} from 'recharts'"
];

linesToRemove.forEach(line => {
  content = content.replace(line, '');
});

// Remove blocks of unused functions
const blocksToRemove = [
  /const handleUpdateProfile = async \(\) => {[\s\S]*?}\n  }/g,
  /const handleUpdatePassword = async \(\) => {[\s\S]*?}\n  }/g,
  /const handleUpgradePlan = async \(planName: string\) => {[\s\S]*?}\n  }/g,
  /const handleDeleteApiKey = async \(id: number\) => {[\s\S]*?}\n  }/g,
  /const handleCopyApiKey = \(keyValue: string\) => {[\s\S]*?}\n  }/g,
  /const handleCreateApiKey = async \(\) => {[\s\S]*?}\n  }/g,
  /const handleTestApi = async \(endpoint: string\) => {[\s\S]*?}\n  }/g,
  /const handleCopyTestSnippet = \(\) => {[\s\S]*?};/g,
  /const handleClearInput = \(\) => {[\s\S]*?}/g,
  /const handleDetection = async \(\) => {[\s\S]*?}\n  }/g,
  /const handleCopyResult = \(\) => {[\s\S]*?}/g,
  /const renderDetectionResult = \(\) => {[\s\S]*?}\n  }/g,
  /const toggleCategory = \(category: string\) => {[\s\S]*?}\n  }/g,
  /const toggleLabel = async \(label: string\) => {[\s\S]*?}\n  }/g,
  /const toggleAllInCategory = async \(category: string\) => {[\s\S]*?}\n  }/g,
  /const handleClearAllLabels = async \(\) => {[\s\S]*?}\n  }/g,
  /const dashboardStats = \[[\s\S]*?\]/g,
  /const recentActivity = \[[\s\S]*?\]/g,
  /const stats = \[[\s\S]*?\]/g,
  /\/\/ Initialiser la clé API choisie.*\n.*React.useEffect.*\n.*\n.*\n  }, \[apiKeys\]\)/g,
  /React.useEffect\(\(\) => {\n    if \(isMobile\) setEntitySidebarOpen\(false\)\n  }, \[isMobile\]\)/g,
  /const categoryIcons: Record<string, any> = \{[\s\S]*?\}/g,
  /\/\/ Rafraîchir les stats.*\n  React.useEffect\(\(\) => {\n    if \(activeTab === 'overview'\) {\n      fetchStats\(\)\n    }\n  }, \[activeTab\]\)/g,
  /const fetchStats = async \(\) => {[\s\S]*?}\n  }/g,
];

blocksToRemove.forEach(regex => {
  content = content.replace(regex, '');
});

// Remove some unused variables
content = content.replace(/const isTokenBased = .*?;/g, '');
content = content.replace(/const usageValue = .*?;/g, '');
content = content.replace(/const usageLimit = .*?;/g, '');
content = content.replace(/const usageLabel = .*?;/g, '');
content = content.replace(/const usagePercent = .*?;/g, '');


fs.writeFileSync(filePath, content, 'utf-8');
console.log('Modified file successfully');
