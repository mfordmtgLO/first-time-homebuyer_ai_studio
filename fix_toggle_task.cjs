const fs = require('fs');
let code = fs.readFileSync('src/components/RoadmapView.tsx', 'utf8');

code = code.replace(
  '  const filteredMilestones = selectedStage === "All"',
  `  const toggleTask = (milestoneId: string, taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let justCompletedMilestone: RoadmapMilestone | null = null;
    let newMilestonesState: RoadmapMilestone[] = [];

    setMilestones(prev => {
      const next = prev.map(m => {
        if (m.id !== milestoneId) return m;
        const updatedTasks = m.tasks.map(t => (t.id === taskId ? { ...t, done: !t.done } : t));
        const allDone = updatedTasks.every(t => t.done);
        
        if (allDone && !m.completed) {
          justCompletedMilestone = {
            ...m,
            tasks: updatedTasks,
            completed: true
          };
          
          if (e) {
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
          }
        }

        return {
          ...m,
          tasks: updatedTasks,
          completed: allDone
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

  const filteredMilestones = selectedStage === "All"`
);

fs.writeFileSync('src/components/RoadmapView.tsx', code);
