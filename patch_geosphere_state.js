const fs = require('fs');
const file = 'src/components/GeoSphereSyncHub.tsx';
let content = fs.readFileSync(file, 'utf8');

const stateInsert = `
  const [firestoreSyncCount, setFirestoreSyncCount] = useState<number | null>(null);
  const [isForceSyncing, setIsForceSyncing] = useState<boolean>(false);

  const fetchFirestoreCount = async () => {
    try {
      const snap = await getDoc(doc(db, "guides_state", "singleton"));
      if (snap.exists()) {
        const data = snap.data();
        if (data.syncedProperties) {
          setFirestoreSyncCount(data.syncedProperties.length);
        } else {
          setFirestoreSyncCount(0);
        }
      } else {
        setFirestoreSyncCount(0);
      }
    } catch (e) {
      console.warn("Could not fetch firestore count", e);
    }
  };

  React.useEffect(() => {
    fetchFirestoreCount();
  }, []);

  const handleForceReSync = async () => {
    setIsForceSyncing(true);
    try {
      const updatedGuidesState = {
        ...guidesState,
        syncedProperties: syncedListings
      };
      await setDoc(doc(db, "guides_state", "singleton"), updatedGuidesState);
      onUpdateGuidesState(updatedGuidesState);
      await fetchFirestoreCount();
      onTriggerToast("Live website successfully re-synced!");
    } catch (e) {
      console.error(e);
      onTriggerToast("Error syncing to live website.");
    } finally {
      setIsForceSyncing(false);
    }
  };
`;

content = content.replace(
  '  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: \'2-digit\', minute: \'2-digit\' }));',
  '  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: \'2-digit\', minute: \'2-digit\' }));\n' + stateInsert
);

fs.writeFileSync(file, content);
