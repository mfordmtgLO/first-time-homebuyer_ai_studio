const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `        <div ref={headerRef} className="sticky top-0 z-40 bg-[#F9F8F4]/98 backdrop-blur-md border-b border-[#EAE7E0]/80 shadow-md">
          <Navbar
            currentTab={activeTab}
            setCurrentTab={setActiveTab}
            activeMode={currentMode}
            setActiveMode={setCurrentMode}
            profile={profile}
            setProfile={setProfile}
            savedCount={properties.length}
            onOpenLoPortal={() => setShowLoPortal(true)}
            onOpenLeadBot={() => { setLeadBotSourceContext(undefined); setIsLeadBotOpen(true); }}
            onNavigateToGuides={handleNavigateToGuides}
            loName={guidesState.loanOfficer.name}
          />
          {/* Mobile Only: Horizontal Step Banner */}
          <div className="lg:hidden max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
            <StepNavigationBanner
              currentTab={activeTab}
              currentMode={currentMode}
              onNavigate={handleNavigate}
              onNavigateToGuides={handleNavigateToGuides}
              loanOfficerName={guidesState.loanOfficer.name}
              activeAgentName={activeAgent.name}
            />
          </div>
        </div>`;

const replace = `        <>
          <div ref={headerRef} className="sticky top-0 z-40 bg-[#F9F8F4]/98 backdrop-blur-md border-b border-[#EAE7E0]/80 shadow-md">
            <Navbar
              currentTab={activeTab}
              setCurrentTab={setActiveTab}
              activeMode={currentMode}
              setActiveMode={setCurrentMode}
              profile={profile}
              setProfile={setProfile}
              savedCount={properties.length}
              onOpenLoPortal={() => setShowLoPortal(true)}
              onOpenLeadBot={() => { setLeadBotSourceContext(undefined); setIsLeadBotOpen(true); }}
              onNavigateToGuides={handleNavigateToGuides}
              loName={guidesState.loanOfficer.name}
            />
          </div>
          {/* Mobile Only: Horizontal Step Banner */}
          {/* Note: Moved out of the sticky header so it scrolls away naturally on mobile, freeing up vertical space */}
          <div className="lg:hidden w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 bg-[#F9F8F4] border-b border-[#EAE7E0]/80 relative z-30 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)]">
            <StepNavigationBanner
              currentTab={activeTab}
              currentMode={currentMode}
              onNavigate={handleNavigate}
              onNavigateToGuides={handleNavigateToGuides}
              loanOfficerName={guidesState.loanOfficer.name}
              activeAgentName={activeAgent.name}
            />
          </div>
        </>`;

if (content.includes(target)) {
  content = content.replace(target, replace);
}

fs.writeFileSync('src/App.tsx', content);
