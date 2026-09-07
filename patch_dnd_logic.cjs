const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const target1 = `  const [toastMessage, setToastMessage] = useState<{title: string, body: React.ReactNode, type: 'up' | 'down' | 'success'} | null>(null);`;

const injection1 = `  const [toastMessage, setToastMessage] = useState<{title: string, body: React.ReactNode, type: 'up' | 'down' | 'success'} | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);`;

const target2 = `  const showExportSuccessToast = (type: 'CSV' | 'PDF') => {`;

const injection2 = `  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    setProperties(prev => {
      const newOrder = [...prev];
      const draggedIdx = newOrder.findIndex(p => p.id === draggedId);
      const targetIdx = newOrder.findIndex(p => p.id === targetId);
      
      if (draggedIdx !== -1 && targetIdx !== -1) {
        const [draggedItem] = newOrder.splice(draggedIdx, 1);
        newOrder.splice(targetIdx, 0, draggedItem);
      }
      return newOrder;
    });
    
    handleDragEnd();
  };

  const showExportSuccessToast = (type: 'CSV' | 'PDF') => {`;

c = c.replace(target1, injection1).replace(target2, injection2);
fs.writeFileSync('src/components/PropertyTracker.tsx', c);
