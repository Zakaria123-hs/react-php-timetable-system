import React, { useEffect, useState } from 'react';
import './stagiaire.css'; 

function Stagiaire() {
    const [planning, setPlanning] = useState({});
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Structure
                const structResponse = await fetch('http://localhost/php/time_table.php/backend/fetch_data.php');
                const structData = await structResponse.json();

                // 2. Fetch Planning
                const planResponse = await fetch('http://localhost/php/time_table.php/backend/select_planning.php');
                const planResult = await planResponse.json();

                setData(structData);

                if (planResult && planResult.data) {
                    const parsed = typeof planResult.data === 'string' ? JSON.parse(planResult.data) : planResult.data;
                    setPlanning(parsed);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return <div className="loading">Loading Timetable...</div>;
    if (!data) return <div className="error">No data available</div>;

    const getCellData = (groupId, day, slotId) => planning[groupId]?.[day]?.[slotId] || {};

    // Helper to check if data exists
    const hasData = (val) => val && val !== "-" && val !== "";
    console.log(data)
    return (
        <div className="stagiaire-view">
            <h2 className="title">Emploi du Temps</h2>
            <table>
                <thead>
                    <tr>
                        <th colSpan="2" rowSpan="3" style={{borderTopLeftRadius: '12px'}}>Groupe</th>
                        <th colSpan="4">Lundi</th>
                        <th colSpan="4">Mardi</th>
                        <th colSpan="4">Mercredi</th>
                        <th colSpan="4">Jeudi</th>
                        <th colSpan="4">Vendredi</th>
                        <th colSpan="4" style={{borderTopRightRadius: '12px'}}>Samedi</th>
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
                    data&&
                    data.groupes.map(group => (
                        <React.Fragment key={group.id}>
                            {/* --- ROW 1: FORMATEUR --- */}
                            <tr>
                                <td rowSpan="3" className="group-name">{group.nom}</td>
                                <td className="row-label">Formateur</td>
                                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                                    <React.Fragment key={day}>
                                        {['S1', 'S2', 'S3', 'S4'].map((slot, index) => {
                                            const val = getCellData(group.id, day, slot).formateur;
                                            // LOGIC: Gray if S3/S4 OR if empty
                                            const isGray = index >= 2 || !hasData(val);
                                            
                                            return (
                                                <td className={isGray ? "gray-bg" : "teacher"} key={slot}>
                                                    <span className="data-text teacher-text">
                                                        {val || "-"}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tr>

                            {/* --- ROW 2: MODULE --- */}
                            <tr>
                                <td className="row-label">Module</td>
                                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                                    <React.Fragment key={day}>
                                        {['S1', 'S2', 'S3', 'S4'].map((slot, index) => {
                                            const val = getCellData(group.id, day, slot).module;
                                            const isGray = index >= 2 || !hasData(val);
                                            return (
                                                <td className={isGray ? "gray-bg" : "module"} key={slot}>
                                                    <span className="data-text module-text">
                                                        {val || "-"}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tr>

                            {/* --- ROW 3: SALLE --- */}
                            <tr>
                                <td className="row-label">Salle</td>
                                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                                    <React.Fragment key={day}>
                                        {['S1', 'S2', 'S3', 'S4'].map((slot, index) => {
                                            const val = getCellData(group.id, day, slot).salle;
                                            const isGray = index >= 2 || !hasData(val);
                                            return (
                                                <td className={isGray ? "gray-bg" : "room"} key={slot}>
                                                    <span className="data-text room-text">
                                                        {val || "-"}
                                                    </span>
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
    );
}

export default Stagiaire;