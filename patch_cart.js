const fs = require('fs');
const path = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/components/CartSlideOver.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add campusCredits state
code = code.replace(
  "const [vendorUpi, setVendorUpi] = useState('bhatiajaspreet161@oksbi');",
  "const [vendorUpi, setVendorUpi] = useState('bhatiajaspreet161@oksbi');\n  const [campusCredits, setCampusCredits] = useState(0);\n  const [useCredits, setUseCredits] = useState(false);"
);

// Fetch campusCredits
code = code.replace(
  '  useEffect(() => {\n    if (vendorId) {',
  '  useEffect(() => {\n    api.get("/api/auth/me").then(res => {\n      if (res.campusCredits) setCampusCredits(res.campusCredits);\n    }).catch(console.error);\n    if (vendorId) {'
);

// Update total calculation
code = code.replace(
  'const total = getTotalPrice();',
  'const baseTotal = getTotalPrice();\n  const discount = useCredits && campusCredits >= 50 ? 5 : 0;\n  const total = Math.max(0, baseTotal - discount);'
);

// Add to placeOrder payload
code = code.replace(
  'isCOD: useCOD',
  'isCOD: useCOD,\n        appliedCredits: useCredits && campusCredits >= 50 ? 50 : 0'
);

// Add UI for Campus Credits in the total summary
const uiSnippet = `
          {/* Campus Credits System */}
          {campusCredits > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Campus Credits: {campusCredits}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">10 points = $1.00</p>
                </div>
              </div>
              <button
                disabled={campusCredits < 50}
                onClick={() => setUseCredits(!useCredits)}
                className={\`text-xs font-bold px-3 py-1.5 rounded-full transition-all \${useCredits ? 'bg-orange-500 text-white shadow-md' : campusCredits >= 50 ? 'bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-300' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}\`}
              >
                {useCredits ? '- $5.00 Applied' : (campusCredits >= 50 ? 'Redeem 50 pts' : 'Need 50 pts')}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">
`;

code = code.replace(
  '<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">',
  uiSnippet
);

fs.writeFileSync(path, code);
