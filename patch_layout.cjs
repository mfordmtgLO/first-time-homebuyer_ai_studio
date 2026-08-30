const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. We replace the main wrapper and move headers OUT of the scroll container.
const targetStart = `  return (
    <div className="h-[100dvh] w-full bg-[#F9F8F4] text-[#2D362E] flex flex-col selection:bg-[#C18C5D]/25 selection:text-[#2D362E] font-sans antialiased overflow-hidden relative">
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative">
      {/* Top Sticky Navigation + Sticky Guided 4-Step Homebuyer Journey */}
      {!showLoPortal && (
        <>
          <div ref={headerRef} className="relative lg:sticky top-0 z-40 bg-[#F9F8F4]/98 backdrop-blur-md border-b border-[#EAE7E0]/80 shadow-md">
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
        </>
      )}

      {/* Main Layout Wrapper */}`;

const replaceStart = `  return (
    <div className="h-[100dvh] w-full bg-[#F9F8F4] text-[#2D362E] flex flex-col selection:bg-[#C18C5D]/25 selection:text-[#2D362E] font-sans antialiased overflow-hidden relative">
      
      {/* Top Navigation (Flex None - Pinned to Top) */}
      {!showLoPortal && (
        <div ref={headerRef} className="flex-none relative z-40 bg-[#F9F8F4]/98 backdrop-blur-md border-b border-[#EAE7E0]/80 shadow-md">
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
          <div className="lg:hidden w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 bg-[#F9F8F4] border-t border-[#EAE7E0]/80 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)]">
            <StepNavigationBanner
              currentTab={activeTab}
              currentMode={currentMode}
              onNavigate={handleNavigate}
              onNavigateToGuides={handleNavigateToGuides}
              loanOfficerName={guidesState.loanOfficer.name}
              activeAgentName={activeAgent.name}
            />
          </div>
        </div>
      )}

      {/* Scrollable Content Area (Flex 1) */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative scroll-smooth">
        {/* Main Layout Wrapper */}`;

if (content.includes(targetStart)) {
  content = content.replace(targetStart, replaceStart);
}

// 2. Remove pb-24 from main since MobileBottomNav is now a flex child
const mainTarget = `className={showLoPortal ? "flex-1 w-full min-h-screen p-0 m-0" : "flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 lg:pb-8 pb-24"}`;
const mainReplace = `className={showLoPortal ? "flex-1 w-full p-0 m-0" : "flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 pb-8"}`;

if (content.includes(mainTarget)) {
  content = content.replace(mainTarget, mainReplace);
}

// 3. Move MobileBottomNav outside of the scrollable container
const footerTarget = `        </footer>
      )}
      </div>
      <MobileBottomNav activeTab={activeTab} onNavigate={handleNavigate} />`;

const footerReplace = `        </footer>
      )}
      </div>
      
      {/* Bottom Nav (Flex None - Pinned to Bottom on Mobile) */}
      <MobileBottomNav activeTab={activeTab} onNavigate={handleNavigate} />`;

if (content.includes(footerTarget)) {
  content = content.replace(footerTarget, footerReplace);
}

fs.writeFileSync('src/App.tsx', content);
