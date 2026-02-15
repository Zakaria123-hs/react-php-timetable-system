import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ImportData() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setMessage(''); // Clear previous messages

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                // 1. Read the Excel File
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                console.log("Available sheets in Excel:", workbook.SheetNames);

                let targetRows = [];

                // 2. SMART SEARCH: Look through ALL sheets to find the right one
                for (let sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const sheetRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                    
                    if (sheetRows.length > 0) {
                        // Check the column names of the first row (converting to uppercase for safety)
                        const keys = Object.keys(sheetRows[0]).map(k => k.trim().toUpperCase());
                        
                        // If this sheet has a GROUPE or MODULE column, this is the one we want!
                        if (keys.includes('GROUPE') || keys.includes('MODULE')) {
                            console.log(`✅ Found correct data in sheet: "${sheetName}"`);
                            targetRows = sheetRows;
                            break; // Stop looking, we found it
                        }
                    }
                }

                if (targetRows.length === 0) {
                    setMessage("❌ Error: Could not find any sheet with 'Groupe' and 'Module' columns.");
                    setLoading(false);
                    return;
                }

                // 3. Send to our processor
                processAndSendData(targetRows);

            } catch (error) {
                console.error(error);
                setMessage("❌ Error reading the Excel file. Make sure it is a valid .xlsx file.");
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const processAndSendData = async (rows) => {
        const groupesMap = {}; 
        const modulesMap = {}; 
        const formateursMap = {}; 

        rows.forEach(rawRow => {
            // Trim spaces from headers just in case
            const row = {};
            Object.keys(rawRow).forEach(key => {
                row[key.trim()] = rawRow[key];
            });

            const formateurName = row['Formateur Affecté Présentiel Actif'] || row['Formateur']; 
            const groupeName = row['Groupe'];
            const moduleName = row['Module'];
            
            const filiere = row['filière'] || row['Filière'] || row['filiere'] || "";
            const anneeFormation = row['Année de formation'] || row['Annee de formation'] || "";

            // --- NEW: DYNAMIC MODULE TYPE (EFM vs EFMR) ---
            const isRegional = row['Régional'] || row['Regional'] || 'N';
            const moduleType = isRegional.trim().toUpperCase() === 'O' ? 'EFMR' : 'EFM';

            // Extract Hours
            let heures = 0;
            const hoursKey = Object.keys(row).find(k => k && k.toUpperCase().includes('MH TOTALE'));
            if (hoursKey) {
                heures = parseFloat(row[hoursKey]) || 0;
            }

            // --- EXTRACT GROUPS ---
            if (groupeName && !groupesMap[groupeName]) {
                groupesMap[groupeName] = {
                    nom: groupeName,
                    filiere: filiere,
                    niveau: anneeFormation
                };
            }

            // --- EXTRACT MODULES (Now with dynamic EFMR/EFM) ---
            if (moduleName) {
                if (!modulesMap[moduleName]) {
                    modulesMap[moduleName] = { 
                        nom: moduleName, 
                        heures_totale: heures, 
                        type: moduleType, // Uses the 'O' / 'N' logic here!
                        filiere: filiere
                    };
                } else if (moduleType === 'EFMR') {
                    // Safety check: If a module appears multiple times and ONE of them says 'O', 
                    // we upgrade the whole module to EFMR just to be safe.
                    modulesMap[moduleName].type = 'EFMR';
                }
            }

            // --- EXTRACT TEACHERS ---
            if (formateurName && moduleName) {
                if (!formateursMap[formateurName]) {
                    formateursMap[formateurName] = new Set();
                }
                formateursMap[formateurName].add(moduleName);
            }
        });

        // console.log("Groups Found:", groupesMap);
        // console.log("Teachers Found:", formateursMap);
        // console.log("Modules Found:", modulesMap);

        const finalData = {
            groupes: Object.values(groupesMap), 
            modules: Object.values(modulesMap), 
            formateurs: Object.keys(formateursMap).map(nom => ({
                nom: nom,
                his_module: Array.from(formateursMap[nom]), 
                max_heures: 30 
            }))
        };

        // Send to PHP Backend
        try {
            const response = await fetch("http://localhost/php/time_table.php/backend/import_repartition.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData)
            });

            const result = await response.json();
            if (result.status === "success") {
                setMessage("✅ Data imported successfully! Added " + result.inserted + " records.");
            } else {
                setMessage("❌ Database Error: " + result.message);
            }
        } catch (error) {
            setMessage("❌ Network Error: Could not connect to PHP server.");
        }
        
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', marginTop: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Import Répartition (Excel)</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
                Upload the OFPPT Excel file to automatically extract Groups, Modules, and Formateurs.
            </p>
            
            <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileUpload} 
                disabled={loading}
                style={{ marginBottom: '15px' }}
            />
            
            {loading && <p style={{ color: '#2563eb', fontWeight: 'bold' }}>⏳ Scanning Excel file...</p>}
            {message && <p style={{ fontWeight: 'bold', color: message.includes("Error") || message.includes("❌") ? "#dc2626" : "#16a34a" }}>{message}</p>}
        </div>
    );
}

export default ImportData;