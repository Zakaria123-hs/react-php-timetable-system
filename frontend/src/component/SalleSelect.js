import React from 'react';

function SalleSelect({ groupId, day, slotId, planning, setPlanning, salles, occupiedSalles }) {
    const selectedValue = planning[groupId]?.[day]?.[slotId]?.salle || "";

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
                        salle: value
                    }
                }
            }
        }));
    };

    return (
        <select 
            value={selectedValue} 
            onChange={handleChange} 
            className={`room-select ${selectedValue ? "selected" : ""}`}
        >
            <option value="">--</option>
            <option value="Teams" style={{color: '#2563eb', fontWeight: 'bold'}}>Teams (Distanciel)</option>
            <option disabled>──────────</option>
            {salles.map((s, idx) => {
                const isBusyElsewhere = occupiedSalles.includes(s.nom_salle);
                const isDisabled = isBusyElsewhere && s.nom_salle !== selectedValue;
                return (
                    <option 
                        key={idx} 
                        value={s.nom_salle}
                        disabled={isDisabled}
                        style={isDisabled ? { color: 'gray', fontStyle: 'italic' } : {}}
                    >
                        {s.nom_salle} {isDisabled ? "(Busy)" : ""}
                    </option>
                );
            })}
        </select>
    );
}
export default SalleSelect;