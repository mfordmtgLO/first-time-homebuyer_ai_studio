const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  
  const listings = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle commas inside quotes
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const values = row.map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length === 0 || values.join('') === '') continue;

    const getValue = (keyAliases) => {
      for (const alias of keyAliases) {
        const index = headers.findIndex(h => h.includes(alias));
        if (index !== -1 && values[index]) return values[index];
      }
      return undefined;
    };

    const priceStr = getValue(['price', 'amount', 'cost']) || '0';
    const price = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;

    const listing = {
      id: `csv-${Date.now()}-${i}`,
      title: getValue(['title', 'name']) || getValue(['address']) || 'Imported Property',
      address: getValue(['address', 'street']) || 'Unknown Address',
      city: getValue(['city']) || 'Unknown City',
      state: getValue(['state']) || 'OR',
      zip: getValue(['zip', 'postal']) || '00000',
      price,
      beds: parseInt(getValue(['bed']) || '0') || 0,
      baths: parseInt(getValue(['bath']) || '0') || 0,
      sqft: parseInt(getValue(['sqft', 'square', 'area']) || '0') || 0,
      yearBuilt: parseInt(getValue(['year', 'built']) || '0') || 0,
      propertyType: 'Single Family',
      status: 'saved',
      notes: 'Imported from CSV',
      daysOnMarket: parseInt(getValue(['dom', 'days']) || '0') || 0,
      hoaMonthly: parseInt(getValue(['hoa']) || '0') || 0,
      propertyTaxAnnual: parseInt(getValue(['tax']) || '0') || 0,
      isFavorite: false,
      overlayEligibility: {
        usdaEligible: String(getValue(['usda']) || '').toLowerCase() === 'true',
        lmiEligible: String(getValue(['lmi', 'firsthome', 'ohcs']) || '').toLowerCase() === 'true',
        lakeviewNationalEligible: String(getValue(['lakeview']) || '').toLowerCase() === 'true',
      }
    };
    listings.push(listing);
  }
  return listings;
};

console.log(parseCSV('Address,City,State,Zip,Price,USDA Eligible,LMI Eligible\n"123 Main St",Portland,OR,97204,"$450,000",true,false\n"456 Oak",Bend,OR,97702,"500000",false,true\n'));
