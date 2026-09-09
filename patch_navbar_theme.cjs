const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const desktopTarget = `                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span className="text-[11px]">Full Screen</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>`;

const desktopReplacement = `                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span className="text-[11px]">Full Screen</span>
                  </>
                )}
              </button>
            )}
            
            {/* Theme Toggle (Desktop/Tablet) */}
            <ThemeToggle className="ml-1 h-7 w-7" />
          </div>
        </div>
      </div>`;

const mobileTarget = `              <Zap className="w-3 h-3" />
              <span>AI Prequal</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-[#606C5D] dark:text-slate-300 border border-[#EAE7E0] dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>`;

const mobileReplacement = `              <Zap className="w-3 h-3" />
              <span>AI Prequal</span>
            </button>
          )}
          <ThemeToggle className="h-8 w-8" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-[#606C5D] dark:text-slate-300 border border-[#EAE7E0] dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>`;

code = code.replace(desktopTarget, desktopReplacement);
code = code.replace(mobileTarget, mobileReplacement);

fs.writeFileSync('src/components/Navbar.tsx', code);
