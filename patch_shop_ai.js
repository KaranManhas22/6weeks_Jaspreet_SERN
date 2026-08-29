const fs = require('fs');
const path = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/app/shop/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add AI state
if (!code.includes('aiQuery')) {
  code = code.replace(
    'const [leaderboardData, setLeaderboardData] = useState<any>(null);',
    'const [leaderboardData, setLeaderboardData] = useState<any>(null);\n  const [aiQuery, setAiQuery] = useState("");\n  const [isAiLoading, setIsAiLoading] = useState(false);\n  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);'
  );
}

// 2. Add AI handler function
if (!code.includes('handleAiSearch')) {
  const handler = `
  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await api.post(\`/api/menu/vendor/\${params.id}/ai-recommend\`, { query: aiQuery });
      if (res.items) {
        setAiRecommendations(res.items);
      }
    } catch (err) {
      console.error(err);
      alert("AI Recommendation failed.");
    } finally {
      setIsAiLoading(false);
    }
  };
  `;
  code = code.replace(
    'const filteredCategories =',
    handler + '\n  const filteredCategories ='
  );
}

// 3. Add AI UI above Categories
const aiUI = `
      {/* AI Vibe Search */}
      <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 shadow-lg shadow-purple-500/20">
        <div className="bg-white dark:bg-gray-950 rounded-xl p-5 sm:p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Ask the AI Waiter</h3>
          <p className="text-xs text-gray-500 mb-4">Don't know what to eat? Describe your mood or craving.</p>
          
          <form onSubmit={handleAiSearch} className="relative max-w-md mx-auto">
            <input 
              type="text" 
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g. 'I want something spicy for a late night snack'"
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button 
              type="submit" 
              disabled={isAiLoading || !aiQuery.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
          </form>

          {/* AI Results */}
          {aiRecommendations.length > 0 && (
            <div className="mt-6 text-left animate-in fade-in slide-in-from-top-4">
              <h4 className="text-xs font-black uppercase text-purple-500 tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> AI Recommended for you:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {aiRecommendations.map(item => (
                  <div key={item.id} className="border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{item.name}</h5>
                      <p className="text-purple-600 dark:text-purple-400 font-black text-sm my-1">₹{item.price}</p>
                    </div>
                    <button 
                      onClick={() => handleQuickAdd(item, item.price)}
                      className="mt-2 w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setAiRecommendations([])}
                className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                Clear recommendations
              </button>
            </div>
          )}
        </div>
      </div>
`;

if (!code.includes('Ask the AI Waiter')) {
  code = code.replace(
    '{/* Category Navigation */}',
    aiUI + '\n\n      {/* Category Navigation */}'
  );
  if (!code.includes('Sparkles')) {
    code = code.replace('import { Trophy', 'import { Sparkles, Trophy');
  }
  fs.writeFileSync(path, code);
}
