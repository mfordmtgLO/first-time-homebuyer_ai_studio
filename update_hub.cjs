const fs = require('fs');

let content = fs.readFileSync('src/components/RealtorCoBrandingHub.tsx', 'utf8');

// The replacement logic:
const newInviteKitCode = `
      {/* SUB-TAB 4: Invite & Outreach Kit */}
      {activeSubTab === "invite_realtor" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(() => {
            const smsBody = \`Hi \${selectedAgent?.name?.split(" ")[0]}! I just built a custom co-branded first-time homebuyer portal for us with live 2-1 buydown calculators, Oregon DPA grant lookups, and instant pre-qualification.\\n\\nTake a look: \${coBrandedUrl}\\n\\nWe can put this on our open house flyers this weekend! - \${currentLo.name}\`;
            const smsLink = \`sms:?body=\${encodeURIComponent(smsBody)}\`;
            
            const emailSubject = \`Co-Branded Homebuyer Portal & 2-1 Buydown Flyer Kit for \${selectedAgent?.name}\`;
            const emailBody = \`Hi \${selectedAgent?.name?.split(" ")[0]},\\n\\nI wanted to share a new marketing technology asset I created for our partnership: a dedicated co-branded digital portal that features both of our headshots, contact information, and interactive loan tools for your buyer clients.\\n\\nHere is your portal link: \${coBrandedUrl}\\n\\nTop features ready to use:\\n1. Live 2-1 Seller Rate Buydown Engine (shows buyers how to save $350-$500/mo without price cuts)\\n2. Oregon Bond & Flex DPA 3.5% Grant Finders\\n3. Co-branded Open House flyer generator with instant QR codes\\n\\nLet's connect this week to launch our next co-branded open house campaign.\\n\\nBest,\\n\${currentLo.name}\\n\${currentLo.company} (NMLS #\${currentLo.nmlsNumber})\`;
            
            // Note: encodeURIComponent is used for mailto links
            const mailtoLink = \`mailto:\${selectedAgent?.email || ''}?subject=\${encodeURIComponent(emailSubject)}&body=\${encodeURIComponent(emailBody)}\`;

            return (
              <>
                {/* SMS Invite Script */}
                <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                      1-Click Realtor Co-Brand SMS Invite
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(smsBody, "sms_invite")}
                        className="text-xs font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "sms_invite" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "sms_invite" ? "Copied" : "Copy"}</span>
                      </button>
                      <a
                        href={smsLink}
                        className="text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#3A4A3D] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Draft SMS
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-xs text-[#2D362E] font-sans leading-relaxed whitespace-pre-wrap">
                    {smsBody}
                  </div>
                </div>

                {/* Email Partnership Pitch */}
                <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                      Realtor Partnership Pitch Email
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(\`Subject: \${emailSubject}\\n\\n\${emailBody}\`, "email_invite")}
                        className="text-xs font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "email_invite" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "email_invite" ? "Copied" : "Copy"}</span>
                      </button>
                      <a
                        href={mailtoLink}
                        className="text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#3A4A3D] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Draft Email
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-xs text-[#2D362E] font-sans leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-[#4A5D4E]">Subject:</span> {emailSubject}
                    <br/><br/>
                    {emailBody}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
`;

content = content.replace(
  /\{\/\* SUB-TAB 4: Invite & Outreach Kit \*\/\}[\s\S]*?We can put this on our open house flyers this weekend! - \$\{currentLo\.name\}`\}[ \n]*<\/div>[ \n]*<\/div>[ \n]*\{\/\* Email Partnership Pitch \*\/\}[\s\S]*?\$\{currentLo\.nmlsNumber\}\)`\}[ \n]*<\/div>[ \n]*<\/div>[ \n]*<\/div>[ \n]*\)}/,
  newInviteKitCode.trim()
);

fs.writeFileSync('src/components/RealtorCoBrandingHub.tsx', content);
console.log("Successfully updated RealtorCoBrandingHub.tsx");
