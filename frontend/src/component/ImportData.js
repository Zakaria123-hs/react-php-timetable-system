import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ImportData() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setMessage('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let targetRows = [];

                for (let sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const sheetRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                    
                    if (sheetRows.length > 0) {
                        const keys = Object.keys(sheetRows[0]).map(k => k.trim().toUpperCase());
                        if (keys.includes('GROUPE') || keys.includes('MODULE')) {
                            targetRows = sheetRows;
                            break;
                        }
                    }
                }

                if (targetRows.length === 0) {
                    setMessage("❌ Error: Could not find required columns.");
                    setLoading(false);
                    return;
                }

                processAndSendData(targetRows);

            } catch (error) {
                setMessage("❌ Error reading the Excel file.");
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
            // Normalize headers to handle case sensitivity (e.g., 'groupe' vs 'Groupe')
            const row = {};
            Object.keys(rawRow).forEach(key => {
                row[key.trim().toLowerCase()] = rawRow[key];
            });

            const formateurName = row['formateur affecté présentiel actif'] || row['formateur']; 
            const groupeName = row['groupe'];
            const moduleName = row['module'];
            const filiere = row['filière'] || row['filiere'] || "";
            const anneeFormation = row['année de formation'] || row['annee de formation'] || "";
            const isRegional = row['régional'] || row['regional'] || 'N';
            const moduleType = isRegional.toString().trim().toUpperCase() === 'O' ? 'EFMR' : 'EFM';

            let heures = 0;
            const hoursKey = Object.keys(row).find(k => k.includes('mh totale'));
            if (hoursKey) heures = parseFloat(row[hoursKey]) || 0;

            // --- 1. EXTRACT GROUPS (Mapping Formateurs to them) ---
            if (groupeName) {
                if (!groupesMap[groupeName]) {
                    groupesMap[groupeName] = {
                        nom: groupeName,
                        filiere: filiere,
                        niveau: anneeFormation,
                        formateurs: new Set() // Using a Set to avoid duplicate teachers for the same group
                    };
                }
                if (formateurName) {
                    groupesMap[groupeName].formateurs.add(formateurName);
                }
            }

            // --- 2. EXTRACT MODULES ---
            if (moduleName) {
                if (!modulesMap[moduleName]) {
                    modulesMap[moduleName] = { 
                        nom: moduleName, 
                        heures_totale: heures, 
                        type: moduleType,
                        filiere: filiere
                    };
                }
            }

            // --- 3. EXTRACT TEACHERS ---
            if (formateurName) {
                if (!formateursMap[formateurName]) {
                    formateursMap[formateurName] = {
                        modules: new Set(),
                        groupes: new Set(),
                        filieres: new Set()
                    };
                }
                if (moduleName) formateursMap[formateurName].modules.add(moduleName);
                if (groupeName) formateursMap[formateurName].groupes.add(groupeName);
                if (filiere) formateursMap[formateurName].filieres.add(filiere);
            }
        });
        // console.log(formateursMap)
        // console.log(groupesMap)
        // console.log(modulesMap)

        // Format data for the backend
        const finalData = {
            // Convert group formateurs Set back to Array for JSON compatibility
            groupes: Object.values(groupesMap).map(g => ({
                ...g,
                formateurs: Array.from(g.formateurs) 
            })), 
            modules: Object.values(modulesMap), 
            formateurs: Object.keys(formateursMap).map(nom => ({
                nom: nom,
                his_module: Array.from(formateursMap[nom].modules), 
                his_group: Array.from(formateursMap[nom].groupes),
                his_filiere: Array.from(formateursMap[nom].filieres),
                max_heures: 30 
            }))
        };

        console.log("Final Processed Data:", finalData);

        try {
            const response = await fetch("http://localhost/php/time_table.php/backend/import_repartition.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData)
            });

            const result = await response.json();
            if (result.status === "success") {
                setMessage(`✅ Success! Added ${result.inserted} records.`);
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
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Import Répartition (Group-Teacher Link)</h3>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={loading} style={{ marginBottom: '15px' }} />
            {loading && <p style={{ color: '#2563eb', fontWeight: 'bold' }}>⏳ Processing relationship data...</p>}
            {message && <p style={{ fontWeight: 'bold', color: message.includes("Error") || message.includes("❌") ? "#dc2626" : "#16a34a" }}>{message}</p>}
        </div>
    );
}

export default ImportData;