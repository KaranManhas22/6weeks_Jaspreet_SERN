const fs = require('fs');
const path = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/app/shop/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const reviewsUI = `
                                  {/* VERIFIED REVIEWS */}
                                  {item.reviews && item.reviews.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <div className="flex items-center text-yellow-400">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 ml-1">
                                          {(item.reviews.reduce((acc, r) => acc + r.rating, 0) / item.reviews.length).toFixed(1)}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-gray-400">({item.reviews.length} reviews)</span>
                                      {item.reviews[0].comment && (
                                        <span className="text-[10px] text-gray-500 italic truncate max-w-[120px]">
                                          "{item.reviews[0].comment}"
                                        </span>
                                      )}
                                    </div>
                                  )}
`;

code = code.replace(
  '{item.description && (\n                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1.5">{item.description}</p>\n                                  )}',
  '{item.description && (\n                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1.5">{item.description}</p>\n                                  )}\n' + reviewsUI
);

fs.writeFileSync(path, code);
