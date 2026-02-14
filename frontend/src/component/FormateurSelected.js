import React from 'react';

function FormateurSelect({
    groupId, day, slotId, planning, setPlanning, formateurs, occupiedFormateurs
}) {
    const selectedValue = planning[groupId]?.[day]?.[slotId]?.formateur || "";
    // console.log("#".repeat(10))
    // console.log('this for planning',planning)
    // console.log('this for formateurs',formateurs)
    // console.log('this for groupr id ', groupId)
    // console.log('this for day', day)
    // console.log('this for slot id ', slotId )
    const moduleSameSlot = planning[groupId]?.[day]?.[slotId]?.module || "";
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
                        formateur: value
                    }
                }
            }
        }));
    };

    return (
        <select
            value={selectedValue}
            onChange={handleChange}
            // Add 'selected' class if a value is chosen
            className={selectedValue ? "selected" : ""}
        >
            <option value="">--</option>
            {
                moduleSameSlot ?

                    formateurs.map((f, idx) => {
                        const formateurHisModul = JSON.parse(f.his_module)
                        const isBusyElsewhere = occupiedFormateurs.includes(f.nom);
                        const isDisabled = isBusyElsewhere && f.nom !== selectedValue;
                        if (formateurHisModul.includes(moduleSameSlot)) {
                            return (
                                <option
                                    key={idx}
                                    value={f.nom}
                                    disabled={isDisabled}
                                    style={isDisabled ? { color: 'gray', fontStyle: 'italic' } : {}}
                                >
                                    {f.nom} {isDisabled ? "(Occupied)" : ""}
                                </option>
                            );
                        }else{
                            return null
                        }
                    }) :
                    formateurs.map((f, idx) => {
                        const isBusyElsewhere = occupiedFormateurs.includes(f.nom);
                        const isDisabled = isBusyElsewhere && f.nom !== selectedValue;
                        return (
                            <option
                                key={idx}
                                value={f.nom}
                                disabled={isDisabled}
                                style={isDisabled ? { color: 'gray', fontStyle: 'italic' } : {}}
                            >
                                {f.nom} {isDisabled ? "(Occupied)" : ""}
                            </option>
                        );
                    })
            }
        </select>
    );
}

export default FormateurSelect;