const fs = require('fs');
const file = '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/app/(auth)/signup/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
content = content.replace(
  "const [showPassword, setShowPassword] = useState(false);",
  "const [showPassword, setShowPassword] = useState(false);\n  const [showConfirmPassword, setShowConfirmPassword] = useState(false);\n  const [countryCode, setCountryCode]   = useState('');"
);

// 2. Geolocation with BigDataCloud and RestCountries
const geoOld = `    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
        },
        () => console.warn('Geolocation access denied')
      );
    }`;

const geoNew = `    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          try {
            const res = await fetch(\`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=\${position.coords.latitude}&longitude=\${position.coords.longitude}&localityLanguage=en\`);
            const data = await res.json();
            if (data.countryCode) {
              const rcRes = await fetch(\`https://restcountries.com/v3.1/alpha/\${data.countryCode}\`);
              const rcData = await rcRes.json();
              if (rcData && rcData[0] && rcData[0].idd) {
                const root = rcData[0].idd.root || '';
                const suffix = rcData[0].idd.suffixes?.[0] || '';
                setCountryCode(root + suffix);
              }
            }
          } catch (err) {
            console.error('Failed to get country code', err);
          }
        },
        () => console.warn('Geolocation access denied')
      );
    }`;
content = content.replace(geoOld, geoNew);

// 3. Update submit phone format
content = content.replace(
  "phone: phone.trim() || undefined,",
  "phone: phone.trim() ? `${countryCode} ${phone.trim()}`.trim() : undefined,"
);

// 4. Update Phone UI
const phoneUIOld = `{/* Phone Number */}
            <div>
              <label htmlFor="signup-phone" className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500/70" />
                <input
                  id="signup-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>
            </div>`;

const phoneUINew = `{/* Phone Number */}
            <div>
              <label htmlFor="signup-phone" className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="flex gap-2 relative">
                <div className="relative w-24 shrink-0">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500/70" />
                  <input
                    type="text"
                    readOnly
                    value={countryCode}
                    placeholder="+91"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl pl-10 pr-2 py-3 text-sm focus:outline-none transition-all font-medium cursor-not-allowed opacity-80"
                  />
                </div>
                <input
                  id="signup-phone"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\\d*$/.test(val)) setPhone(val);
                  }}
                  placeholder="9876543210"
                  className="flex-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>
            </div>`;
content = content.replace(phoneUIOld, phoneUINew);

// 5. Update Confirm Password UI
const confirmUIOld = `{/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              />
            </div>`;

const confirmUINew = `{/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="block text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>`;
content = content.replace(confirmUIOld, confirmUINew);

fs.writeFileSync(file, content);
console.log('Signup page patched successfully!');
