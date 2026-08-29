const fs = require('fs');
const path = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/app/vendor/(dashboard)/analytics/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const apiCall = `
              onClick={async () => {
                if (confirm("Award top 3 customers bonus points for this month?")) {
                  try {
                    await api.post('/api/orders/vendor/analytics/award', {});
                    alert("Points awarded successfully!");
                  } catch (e) {
                    alert("Error awarding points");
                  }
                }
              }}
`;

code = code.replace(
  'onClick={() => {\n                alert("Top 3 customers have been awarded their bonus loyalty points!");\n              }}',
  apiCall
);

fs.writeFileSync(path, code);
