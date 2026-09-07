const fs = require('fs');
let c = fs.readFileSync('src/components/LeadIntakeChatbot.tsx', 'utf8');

const targetStr = '<div className="p-3 bg-white border-t border-[#EAE7E0] space-y-1.5 shrink-0">';

const quickRepliesCode = `
          {/* Quick Replies for Ask AI */}
          {isCompleted && (
             <div className="px-3 pt-3 flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                 <button onClick={() => { setInputText("Should I continue renting or buy now?"); handleSendMessage(); }} className="shrink-0 px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full text-[10px] font-bold text-[#4A5D4E] hover:bg-[#F1EFE9] transition-colors shadow-sm whitespace-nowrap">⚖️ Rent vs. Buy Analysis</button>
                 <button onClick={() => { setInputText("What are today's mortgage interest rates?"); handleSendMessage(); }} className="shrink-0 px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full text-[10px] font-bold text-[#4A5D4E] hover:bg-[#F1EFE9] transition-colors shadow-sm whitespace-nowrap">📈 Current Rates</button>
                 <button onClick={() => { setInputText("How much down payment do I actually need?"); handleSendMessage(); }} className="shrink-0 px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full text-[10px] font-bold text-[#4A5D4E] hover:bg-[#F1EFE9] transition-colors shadow-sm whitespace-nowrap">💰 Down Payment Helper</button>
                 <button onClick={() => { setInputText("Can you estimate closing costs on a $400k home?"); handleSendMessage(); }} className="shrink-0 px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full text-[10px] font-bold text-[#4A5D4E] hover:bg-[#F1EFE9] transition-colors shadow-sm whitespace-nowrap">📝 Estimate Closing Costs</button>
             </div>
          )}
          <div className="p-3 bg-white border-t border-[#EAE7E0] space-y-1.5 shrink-0">
`;

if (c.includes(targetStr) && !c.includes('Rent vs. Buy Analysis')) {
  c = c.replace(targetStr, quickRepliesCode);
  fs.writeFileSync('src/components/LeadIntakeChatbot.tsx', c);
  console.log("Patched LeadIntakeChatbot.tsx");
} else {
  console.log("Could not find target or already patched");
}
