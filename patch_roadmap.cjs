const fs = require('fs');
let code = fs.readFileSync('src/components/RoadmapView.tsx', 'utf8');

code = code.replace(
  /const toggleTask = \(milestoneId: string, taskId: string\) => \{/,
  `const toggleMilestone = (milestoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let justCompletedMilestone: RoadmapMilestone | null = null;
    let newMilestonesState: RoadmapMilestone[] = [];

    setMilestones(prev => {
      const next = prev.map(m => {
        if (m.id !== milestoneId) return m;
        
        const allDone = m.tasks.every(t => t.done);
        const newDoneStatus = !allDone;
        const updatedTasks = m.tasks.map(t => ({ ...t, done: newDoneStatus }));
        
        if (newDoneStatus && !m.completed) {
          justCompletedMilestone = {
            ...m,
            tasks: updatedTasks,
            completed: true
          };
          
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { x, y },
            colors: ['#4A5D4E', '#F1EFE9', '#DEDAD2', '#2D362E', '#9A9488']
          });
        }
        
        return {
          ...m,
          tasks: updatedTasks,
          completed: newDoneStatus
        };
      });
      newMilestonesState = next;
      return next;
    });

    if (justCompletedMilestone) {
      const milestoneCompleted: RoadmapMilestone = justCompletedMilestone;
      const settings = getMilestoneAlertSettings();
      if (settings.enabled && settings.recipientEmail) {
        triggerMilestoneEmailNotification({
          milestone: milestoneCompleted,
          profile,
          milestones: newMilestonesState.length > 0 ? newMilestonesState : milestones,
          properties,
          loanOfficer,
          activeAgent,
          overrideEmail: settings.recipientEmail
        }).then(result => {
          if (result.success) {
            setActiveAlertToast({
              milestoneTitle: milestoneCompleted.title,
              stepNumber: milestoneCompleted.stepNumber,
              recipientEmail: settings.recipientEmail,
              sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setTimeout(() => {
              setActiveAlertToast(prev => (prev?.milestoneTitle === milestoneCompleted.title ? null : prev));
            }, 8000);
          }
        });
      }
    }
  };

  const toggleTask = (milestoneId: string, taskId: string, e?: React.MouseEvent) => {`
);

code = code.replace(
  /confetti\(\{[\s\S]*?origin: \{ y: 0\.7 \}\n\s*\}\);/,
  `if (e) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { x, y },
              colors: ['#4A5D4E', '#F1EFE9', '#DEDAD2', '#2D362E', '#9A9488']
            });
          } else {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.7 },
              colors: ['#4A5D4E', '#F1EFE9', '#DEDAD2', '#2D362E', '#9A9488']
            });
          }`
);

// Bind toggleTask event
code = code.replace(
  /onClick=\{\(\) => toggleTask\(step\.id, task\.id\)\}/,
  `onClick={(e) => toggleTask(step.id, task.id, e)}`
);

// Make the step badge clickable
code = code.replace(
  /<div\n\s*className=\{\`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors \$\{/,
  `<div
                    onClick={(e) => toggleMilestone(step.id, e)}
                    title={stepDone ? "Mark Milestone Incomplete" : "Mark Milestone Complete"}
                    className={\`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors cursor-pointer hover:scale-105 active:scale-95 \${`
);

fs.writeFileSync('src/components/RoadmapView.tsx', code);
