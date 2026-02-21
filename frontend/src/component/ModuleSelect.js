import React from 'react';

function ModuleSelect({ 
    groupId, day, slotId, planning, setPlanning, modules 
}) {
    const selectedValue = planning[groupId]?.[day]?.[slotId]?.module || "";
    console.log(planning)
    console.log(modules)
    console.log(groupId)
    const handleChange = (e) => {
        const value = e.target.value;
        setPlanning(prev => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [day]: {
                    ...prev[groupId]?.[day],
                    [slotId]: {
                        ...prev[groupId]?.[day]?.[slotId],
                        module: value
                    }
                }
            }
        }));
    };

    return (
        <select 
            value={selectedValue} 
            onChange={handleChange} 
            // Append 'selected' if value exists
            className={`module-select ${selectedValue ? "selected" : ""}`}
        >
            <option value="">--</option>
            {modules.map((m, idx) => (
                <option key={idx} value={m.nom}>
                    {m.nom}
                </option>
            ))}
        </select>
    );
}

export default ModuleSelect;