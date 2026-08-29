const fs = require('fs');
const path = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/components/CartSlideOver.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add cross-sell state
if (!code.includes('crossSellItem')) {
  code = code.replace(
    'const [useCredits, setUseCredits] = useState(false);',
    'const [useCredits, setUseCredits] = useState(false);\n  const [crossSellItem, setCrossSellItem] = useState<any>(null);'
  );

  // Add the effect to fetch cross sell
  const effectCode = `
  useEffect(() => {
    if (cartItems.length > 0 && vendorId) {
      api.post(\`/api/menu/vendor/\${vendorId}/cross-sell\`, {
        cartItemIds: cartItems.map(i => i.id)
      }).then(res => {
        setCrossSellItem(res.recommendation);
      }).catch(console.error);
    } else {
      setCrossSellItem(null);
    }
  }, [cartItems.length, vendorId]);
  `;
  
  code = code.replace(
    '// Address fields',
    effectCode + '\n  // Address fields'
  );

  // Add the UI right above the total summary
  const uiCode = `
          {/* Smart Cart Cross-Sell */}
          {crossSellItem && !cartItems.find(i => i.id === crossSellItem.id) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between shadow-inner animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm overflow-hidden">
                  {crossSellItem.imageUrl ? (
                    <img src={crossSellItem.imageUrl} alt={crossSellItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">Bought Together</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{crossSellItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  addItem(crossSellItem);
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> \${crossSellItem.price.toFixed(2)}
              </button>
            </div>
          )}
`;

  code = code.replace(
    '{/* Campus Credits System */}',
    uiCode + '\n          {/* Campus Credits System */}'
  );

  fs.writeFileSync(path, code);
}
