import React, { useState } from 'react';
import '../App.css';
import FormateurSelect from './FormateurSelected';
import SalleSelect from './SalleSelect';
import ModuleSelect from './ModuleSelect';
import ImportData from './ImportData';

// ... imports ...

function Dashbord() {
    const [filiere, setFiliere] = useState();
    // that will store planing after every time we select from table 
    const [planning, setPlanning] = useState({});
    // this data we fetch from backend and containt nested object {formateure,group,modules,salls}
    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [dataValid, setValid] = useState(false);

    // this is fro Track if we are creating or updating
    const [isUpdateMode, setIsUpdateMode] = useState(false);

    const fetchData = async () => {
        try {
            const listRes = await fetch('http://localhost/php/time_table.php/backend/fetch_data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({filiere})
            });
            const listData = await listRes.json();
            // console.log(listData)
            setData(listData);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     console.log(planning)
    // },[planning])
    // ... conflict checkers (getOccupiedFormateurs, etc.) ...

    const sendPlanningToBackend = async () => {
        try {
            // Determine mode based on our state
            const currentMode = isUpdateMode ? 'update' : 'create';

            const response = await fetch("http://localhost/php/time_table.php/backend/insert-planning.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // SEND BOTH PLANNING AND MODE
                body: JSON.stringify({
                    planning: planning,
                    mode: currentMode
                })
            });

            const res = await response.json();

            if (res.status === "success") {
                setValid(true);
                setTimeout(() => setValid(false), 3000);

                // AFTER FIRST SUCCESSFUL SAVE, SWITCH TO UPDATE MODE
                // This ensures next click is treated as an update
                setIsUpdateMode(true);

                console.log("Saved successfully in mode:", currentMode);
            }
        } catch (error) {
            console.error("Error:", error);
        }
        setIsUpdateMode(false)
    };

    const ActiveModify = async () => {
        // Fetch Existing Planning
        const planRes = await fetch('http://localhost/php/time_table.php/backend/select_planning.php');
        const planResult = await planRes.json();

        if (planResult && planResult.data) {
            const savedPlan = typeof planResult.data === 'string'
                ? JSON.parse(planResult.data)
                : planResult.data;
            setPlanning(savedPlan);

            // IF WE FOUND DATA, WE ARE IN UPDATE MODE
            setIsUpdateMode(true);
        }
    }

    // ... rest of your JSX (render) ...

    // if (loading) return <div>Loading...</div>;
    // if (!data) return <div>No data available</div>;

    // --- CONFLICT CHECKERS ---
    const getOccupiedFormateurs = (day, slotId, currentGroupId, currentRoom) => {
        const occupied = [];
        // console.log( Object.keys(planning))
        // console.log(currentGroupId)

        Object.keys(planning).forEach((grpId) => {
            if (parseInt(grpId) !== currentGroupId) {
                const otherTeacher = planning[grpId]?.[day]?.[slotId]?.formateur;
                const otherRoom = planning[grpId]?.[day]?.[slotId]?.salle;

                if (otherTeacher) {
                    // RULE 1: If other group is in a physical room, teacher is 100% busy.
                    if (otherRoom !== "Teams") {
                        occupied.push(otherTeacher);
                    }
                    // RULE 2: If other group is in Teams, teacher is busy UNLESS we are also in Teams.
                    else if (otherRoom === "Teams") {
                        // If I am NOT in Teams (or haven't selected a room yet), I can't take this teacher.
                        if (currentRoom !== "Teams") {
                            occupied.push(otherTeacher);
                        }
                        // If I AM in Teams, don't push to occupied (Teacher remains available!)
                    }
                }
            }
        });
        return occupied;
    };

    const getOccupiedSalles = (day, slotId, currentGroupId) => {
        const occupied = [];
        Object.keys(planning).forEach((grpId) => {
            if (parseInt(grpId) !== currentGroupId) {
                const room = planning[grpId]?.[day]?.[slotId]?.salle;
                // IGNORE "Teams" - Multiple groups can be on Teams
                if (room && room !== "Teams") occupied.push(room);
            }
        });
        return occupied;
    };


    return (
        <>
            <h2 className="title">Gestion Emploi du Temps</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
                {dataValid && <span style={{ color: 'green', fontWeight: 'bold' }}>Data Saved Successfully!</span>}
                <button onClick={sendPlanningToBackend} className='btn-save'>Save Planning</button>
            </div>
            <label htmlFor="filiereSelect">Choisissez une filière:</label>
            <select name="filiere" id="filiereSelect" style={{ width: '100px' }} onChange={(e) => { setFiliere(e.target.value) }}>
                <option value="">-- Sélectionnez une option --</option>
                <option value="Développement Digital">Développement Digital</option>
                <option value="Gestion des Entreprises">Gestion des Entreprises</option>
                <option value="Technicien Spécialisé en Météo">Technicien Spécialisé en Météo</option>
                <option value="Gestion des Entreprises option">Gestion des Entreprises option</option>
                <option value="Développement Digital option W">Développement Digital option W</option>
                <option value="Infrastructure Digitale option">Infrastructure Digitale option</option>
                <option value="Infrastructure Digitale">Infrastructure Digitale</option>
                <option value="Certification Microsoft Office">Certification Microsoft Office</option>
                <option value="Assistant Administratif option">Assistant Administratif option</option>
            </select>
            <button style={{ padding: '6px 12px', marginLeft: '15px', }} onClick={fetchData}>valide</button>
            <br />
            <br />
            <br />
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th colSpan="2" rowSpan="3">Groupe / Type</th>
                            <th colSpan="4">Lundi</th>
                            <th colSpan="4">Mardi</th>
                            <th colSpan="4">Mercredi</th>
                            <th colSpan="4">Jeudi</th>
                            <th colSpan="4">Vendredi</th>
                            <th colSpan="4">Samedi</th>
                        </tr>
                        <tr>
                            {[...Array(6)].map((_, i) => (
                                <React.Fragment key={i}><th>S1</th><th>S2</th><th>S3</th><th>S4</th></React.Fragment>
                            ))}
                        </tr>
                        <tr>
                            {[...Array(6)].map((_, i) => (
                                <React.Fragment key={i}>
                                    <th><div className="vertical-text">08:30</div></th>
                                    <th><div className="vertical-text">11:00</div></th>
                                    <th><div className="vertical-text">13:30</div></th>
                                    <th><div className="vertical-text">16:00</div></th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>

                        {
                            data &&
                            data.groupes.map(group => (
                                <React.Fragment key={group.id}>
                                    {/* ROW 1: TEACHER */}
                                    <tr>
                                        <td rowSpan="3" className="group-name">{group.nom}</td>
                                        <td className="row-label">Formateur</td>

                                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                                            <React.Fragment key={day}>
                                                {['S1', 'S2', 'S3', 'S4'].map((slot, index) => {
                                                    const cellClass = (index < 2) ? "teacher" : "gray-bg";

                                                    // 1. GET CURRENT ROOM FOR THIS SLOT
                                                    const currentRoom = planning[group.id]?.[day]?.[slot]?.salle;

                                                    // 2. PASS CURRENT ROOM TO CHECKER
                                                    const occupiedList = getOccupiedFormateurs(day, slot, group.id, currentRoom);

                                                    return (
                                                        <td className={cellClass} key={slot}>
                                                            <FormateurSelect
                                                                groupName={group.nom}
                                                                groupId={group.id}
                                                                day={day}
                                                                slotId={slot}
                                                                planning={planning}
                                                                setPlanning={setPlanning}
                                                                formateurs={data.formateurs}
                                                                occupiedFormateurs={occupiedList}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                    {/* ROW 2: MODULE consol */}
                                    <tr>
                                        <td className="row-label">Module</td>
                                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                                            <React.Fragment key={day}>
                                                {['S1', 'S2', 'S3', 'S4'].map((slot, index) => {
                                                    const cellClass = (index < 2) ? "module" : "gray-bg";
                                                    return (
                                                        <td className={cellClass} key={slot}>
                                                            <ModuleSelect
                                                                groupId={group.id} day={day} slotId={slot}
                                                                planning={planning} setPlanning={setPlanning}
                                                                modules={data.modules}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                    {/* ROW 3: SALLE */}
                                    <tr>
                                        <td className="row-label">Salle</td>
                                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                                            <React.Fragment key={day}>
                                                {['S1', 'S2', 'S3', 'S4'].map((slot, index) => {
                                                    const cellClass = (index < 2) ? "room" : "gray-bg";
                                                    const occupiedRooms = getOccupiedSalles(day, slot, group.id);
                                                    return (
                                                        <td className={cellClass} key={slot}>
                                                            <SalleSelect
                                                                groupId={group.id}
                                                                day={day}
                                                                slotId={slot}
                                                                planning={planning}
                                                                setPlanning={setPlanning}
                                                                salles={data.salles}
                                                                occupiedSalles={occupiedRooms}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </React.Fragment>
                            ))}
                    </tbody>
                </table>
            </div>
            <button className='btn-save' onClick={ActiveModify} >modify last planning</button>

            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <ImportData />
        </>
    );
}

export default Dashbord;