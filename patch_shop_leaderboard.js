const fs = require('fs');
const path = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/app/shop/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add state for leaderboard
if (!code.includes('showLeaderboard')) {
  code = code.replace(
    'const [isAdding, setIsAdding] = useState<string | null>(null);',
    'const [isAdding, setIsAdding] = useState<string | null>(null);\n  const [showLeaderboard, setShowLeaderboard] = useState(false);\n  const [leaderboardData, setLeaderboardData] = useState<any>(null);'
  );
}

// 2. Fetch leaderboard data
if (!code.includes('api.get(`/api/menu/vendor/${params.id}/leaderboard`)')) {
  code = code.replace(
    '        setVendorDetails(vendorInfo);',
    '        setVendorDetails(vendorInfo);\n\n        // Fetch leaderboard silently in background\n        api.get(`/api/menu/vendor/${params.id}/leaderboard`).then((res) => setLeaderboardData(res)).catch(console.error);'
  );
}

// 3. Add Leaderboard UI button under the vendor header
const buttonHtml = `
          {leaderboardData && (
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="mt-4 flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-2.5 px-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-bold rounded-xl border border-yellow-500/20 transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4" /> View Campus Kings Leaderboard
            </button>
          )}
`;
code = code.replace(
  '        </div>\n      </div>\n\n      {/* Category Navigation */}',
  '        </div>\n' + buttonHtml + '      </div>\n\n      {/* Category Navigation */}'
);

// 4. Add Leaderboard Modal
const modalHtml = `
      {/* Leaderboard Modal */}
      {showLeaderboard && leaderboardData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <button 
              onClick={() => setShowLeaderboard(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            
            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 rotate-3">
                <Trophy className="w-8 h-8 text-white -rotate-3" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Campus Kings</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">The top foodies of {vendorDetails?.name}</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-8">
              
              {/* Last Month Top 3 */}
              {leaderboardData.lastMonthTop3 && leaderboardData.lastMonthTop3.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" /> Defending Champions (Last Month)
                  </h3>
                  <div className="flex justify-center items-end gap-3 h-32 mb-4">
                    {/* 2nd Place */}
                    {leaderboardData.lastMonthTop3[1] && (
                      <div className="flex flex-col items-center w-1/3 animate-in fade-in slide-in-from-bottom-4 delay-100">
                        <span className="text-[10px] font-bold text-gray-500 truncate w-full text-center px-1">{leaderboardData.lastMonthTop3[1].name}</span>
                        <div className="w-full h-16 bg-gradient-to-t from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg border border-gray-300 dark:border-gray-600 flex items-start justify-center pt-2 relative mt-1">
                          <span className="font-black text-gray-500 text-lg">2</span>
                        </div>
                      </div>
                    )}
                    {/* 1st Place */}
                    {leaderboardData.lastMonthTop3[0] && (
                      <div className="flex flex-col items-center w-1/3 z-10 animate-in fade-in slide-in-from-bottom-6">
                        <div className="text-2xl mb-1">👑</div>
                        <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 truncate w-full text-center px-1">{leaderboardData.lastMonthTop3[0].name}</span>
                        <div className="w-full h-24 bg-gradient-to-t from-yellow-300 to-yellow-200 dark:from-yellow-600 dark:to-yellow-500 rounded-t-lg border border-yellow-400 dark:border-yellow-500 flex items-start justify-center pt-2 shadow-lg relative mt-1">
                          <span className="font-black text-yellow-700 dark:text-yellow-900 text-2xl">1</span>
                        </div>
                      </div>
                    )}
                    {/* 3rd Place */}
                    {leaderboardData.lastMonthTop3[2] && (
                      <div className="flex flex-col items-center w-1/3 animate-in fade-in slide-in-from-bottom-2 delay-200">
                        <span className="text-[10px] font-bold text-gray-500 truncate w-full text-center px-1">{leaderboardData.lastMonthTop3[2].name}</span>
                        <div className="w-full h-12 bg-gradient-to-t from-orange-200 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-t-lg border border-orange-300 dark:border-orange-800 flex items-start justify-center pt-1 relative mt-1">
                          <span className="font-black text-orange-600 dark:text-orange-400 text-base">3</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Month Top 10 */}
              <div>
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Live Rankings (This Month)
                </h3>
                {leaderboardData.currentMonthTop10 && leaderboardData.currentMonthTop10.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboardData.currentMonthTop10.map((user: any, idx: number) => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <span className={\`w-6 text-center font-black text-sm \${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300 dark:text-gray-600'}\`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-[10px] text-gray-500">{user.orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{user.spent.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500 italic py-4">No orders placed this month yet.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-[10px] text-gray-400 font-medium">Rank #1 at the end of the month to earn a massive loyalty bonus!</p>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '{/* Sticky Bottom Cart/Checkout Area */}',
  modalHtml + '\n\n      {/* Sticky Bottom Cart/Checkout Area */}'
);

if (!code.includes('Trophy')) {
  code = code.replace('import { MapPin', 'import { Trophy, Star, TrendingUp, MapPin');
}

fs.writeFileSync(path, code);
