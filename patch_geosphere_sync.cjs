const fs = require('fs');
const file = 'src/components/GeoSphereSyncHub.tsx';
let content = fs.readFileSync(file, 'utf8');

const newCode = `  const [firestoreSyncCount, setFirestoreSyncCount] = useState<number | null>(null);
  const [isForceSyncing, setIsForceSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<boolean>(false);

  const fetchFirestoreCount = async () => {
    try {
      setSyncError(false);
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
      setSyncError(true);
    }
  };`;

content = content.replace(
  /  const \[firestoreSyncCount, setFirestoreSyncCount\] = useState<number \| null>\(null\);\s+const \[isForceSyncing, setIsForceSyncing\] = useState<boolean>\(false\);\s+const fetchFirestoreCount = async \(\) => \{\s+try \{\s+const snap = await getDoc\(doc\(db, "guides_state", "singleton"\)\);\s+if \(snap\.exists\(\)\) \{\s+const data = snap\.data\(\);\s+if \(data\.syncedProperties\) \{\s+setFirestoreSyncCount\(data\.syncedProperties\.length\);\s+\} else \{\s+setFirestoreSyncCount\(0\);\s+\}\s+\} else \{\s+setFirestoreSyncCount\(0\);\s+\}\s+\} catch \(e\) \{\s+console\.warn\("Could not fetch firestore count", e\);\s+\}\s+\};/,
  newCode
);

const forceSyncCode = `  const handleForceReSync = async () => {
    setIsForceSyncing(true);
    setSyncError(false);
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
      setSyncError(true);
      onTriggerToast("Error syncing to live website.");
    } finally {
      setIsForceSyncing(false);
    }
  };`;

content = content.replace(
  /  const handleForceReSync = async \(\) => \{\s+setIsForceSyncing\(true\);\s+try \{\s+const updatedGuidesState = \{\s+\.\.\.guidesState,\s+syncedProperties: syncedListings\s+\};\s+await setDoc\(doc\(db, "guides_state", "singleton"\), updatedGuidesState\);\s+onUpdateGuidesState\(updatedGuidesState\);\s+await fetchFirestoreCount\(\);\s+onTriggerToast\("Live website successfully re-synced!"\);\s+\} catch \(e\) \{\s+console\.error\(e\);\s+onTriggerToast\("Error syncing to live website\."\);\s+\} finally \{\s+setIsForceSyncing\(false\);\s+\}\s+\};/,
  forceSyncCode
);

fs.writeFileSync(file, content);
