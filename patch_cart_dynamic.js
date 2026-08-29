const fs = require('fs');
const path = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/components/CartSlideOver.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const discount = useCredits && campusCredits >= 50 ? 5 : 0;',
  'const discount = useCredits ? Math.min(campusCredits, baseTotal) : 0;'
);

code = code.replace(
  'appliedCredits: useCredits && campusCredits >= 50 ? 50 : 0',
  'appliedCredits: useCredits ? discount : 0'
);

code = code.replace(
  '<p className="text-xs text-orange-600 dark:text-orange-400 font-medium">10 points = $1.00</p>',
  '<p className="text-xs text-orange-600 dark:text-orange-400 font-medium">1 point = $1.00 Off</p>'
);

code = code.replace(
  '{useCredits ? \'- $5.00 Applied\' : (campusCredits >= 50 ? \'Redeem 50 pts\' : \'Need 50 pts\')}',
  '{useCredits ? `- $${discount.toFixed(2)} Applied` : (campusCredits > 0 ? \'Apply All pts\' : \'No pts yet\')}'
);

code = code.replace(
  'disabled={campusCredits < 50}',
  'disabled={campusCredits <= 0}'
);

code = code.replace(
  'campusCredits >= 50 ? \'bg-orange-200',
  'campusCredits > 0 ? \'bg-orange-200'
);

fs.writeFileSync(path, code);
