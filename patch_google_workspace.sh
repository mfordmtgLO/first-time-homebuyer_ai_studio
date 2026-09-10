sed -i 's/let subfolders = allFolders.filter/const subfolders = allFolders.filter/g' src/services/googleWorkspaceService.ts
sed -i 's/let files: any\[\] = \[\];/let files: any\[\];/g' src/services/googleWorkspaceService.ts
sed -i '/const isPdf = /d' src/services/googleWorkspaceService.ts
sed -i 's/let snippet = "";/let snippet: string;/g' src/services/googleWorkspaceService.ts
sed -i 's/let keyInsights: DriveFilePreviewData\["keyInsights"\] = \[\];/let keyInsights: DriveFilePreviewData\["keyInsights"\];/g' src/services/googleWorkspaceService.ts
sed -i 's/let checkpoints: string\[\] = \[\];/let checkpoints: string\[\];/g' src/services/googleWorkspaceService.ts
