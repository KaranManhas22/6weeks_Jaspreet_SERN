const fs = require('fs');
const path = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/app/vendor/(dashboard)/analytics/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const leaderboardHtml = `
        {/* Customer of the Month Leaderboard */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" /> Customer of the Month (Leaderboard)
            </h3>
            <button 
              onClick={() => {
                alert("Top 3 customers have been awarded their bonus loyalty points!");
              }}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> Award Top 3 Points
            </button>
          </div>

          <div className="space-y-4">
            {!(data.topCustomers && data.topCustomers.length) ? (
              <p className="text-center py-12 text-gray-500 text-sm italic">No customer data for this month yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.topCustomers.map((customer: any, index: number) => (
                  <div key={customer.id} className="relative bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center text-center border border-gray-100 dark:border-gray-800">
                    <div className={\`absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-lg \${
                      index === 0 ? 'bg-amber-400 text-white border-2 border-white' : 
                      index === 1 ? 'bg-gray-300 text-white border-2 border-white' :
                      'bg-orange-400 text-white border-2 border-white'
                    }\`}>
                      #{index + 1}
                    </div>
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-2 mb-3">
                      <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-black text-gray-900 dark:text-white text-lg">{customer.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{customer.email}</p>
                    
                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-4" />
                    
                    <div className="flex justify-between w-full text-sm">
                      <span className="text-gray-500 font-medium">Monthly Spend</span>
                      <span className="font-black text-emerald-500">{formatCurrency(customer.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between w-full text-xs mt-2">
                      <span className="text-gray-500 font-medium">Orders</span>
                      <span className="font-bold text-gray-900 dark:text-white">{customer.orderCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
`;

// Insert the leaderboard right before {/* Order Status Distribution */}
code = code.replace(
  '{/* Order Status Distribution */}',
  leaderboardHtml + '\n\n      {/* Order Status Distribution */}'
);

// We also need to add 'Award', 'User' imports if they don't exist
if (!code.includes('Award')) {
  code = code.replace('import { ', 'import { Award, User, ');
}

fs.writeFileSync(path, code);
