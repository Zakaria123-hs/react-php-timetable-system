import React, { useState } from 'react';
import jsPDF from 'jspdf';

// import ExportTimetableToPDF from './ExportTimetableToPDF';
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
                body: JSON.stringify({ filiere })
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
        exportTimetablePDF(planning, data.groupes)
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

    // const handleExportPDF = () => {
    //     if (Object.keys(planning).length === 0) {
    //         alert('Aucune donnée à exporter. Veuillez d\'abord créer un planning.');
    //         return;
    //     }
    //     ExportTimetableToPDF(planning, data, filiere);
    // };


    /**
     * Exports the timetable planning as a landscape A4 PDF.
     * Visually replicates the Excel-style screenshot layout.
     *
     * @param {Object} planning  - planning[groupId][day][slot] = { formateur, module, salle }
     * @param {Array}  groupes   - Array of group objects: [{ id, nom }, ...]
     */
    function exportTimetablePDF(planning, groupes) {
        if (!groupes || groupes.length === 0) {
            alert("Aucun groupe à exporter.");
            return;
        }
        if (!planning || Object.keys(planning).length === 0) {
            alert("Le planning est vide.");
            return;
        }
        // ─── DOCUMENT SETUP ───────────────────────────────────────────────
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const PAGE_W = 297;
        const PAGE_H = 210;
        const MARGIN = 4;

        // ─── COLORS ───────────────────────────────────────────────────────
        const COLOR_HEADER_BG = [41, 128, 185];   // blue
        const COLOR_HEADER_TEXT = [255, 255, 255];   // white
        const COLOR_GREEN_BG = [39, 174, 96];   // Teams green
        const COLOR_GREEN_TEXT = [255, 255, 255];
        const COLOR_GRAY_BG = [189, 195, 199];   // gray (S3/S4 disabled)
        const COLOR_WHITE_BG = [255, 255, 255];
        const COLOR_LABEL_BG = [236, 240, 241];   // light gray for row labels
        const COLOR_GROUP_BG = [52, 73, 94];    // dark for group name
        const COLOR_BORDER = [44, 62, 80];

        // ─── LAYOUT MEASUREMENTS ──────────────────────────────────────────
        const USABLE_W = PAGE_W - MARGIN * 2;

        // Left fixed columns
        const COL_GROUP_W = 18;   // "Groupe" column
        const COL_TYPE_W = 14;   // "Type" column (Formateur/Module/Salle)
        const LEFT_W = COL_GROUP_W + COL_TYPE_W;

        // Days & slots
        const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const SLOTS = ['S1', 'S2', 'S3', 'S4'];
        const TIMES = ['08:30', '11:00', '13:30', '16:00'];
        const ROW_TYPES = ['FORMATEUR', 'MODULE', 'SALLE'];

        const GRID_W = USABLE_W - LEFT_W;
        const TOTAL_COLS = DAYS.length * SLOTS.length;   // 24
        const SLOT_W = GRID_W / TOTAL_COLS;           // width of each slot cell

        // Row heights
        const ROW_H_HEADER1 = 7;    // "Lundi / Mardi …"
        const ROW_H_HEADER2 = 6;    // "S1 S2 S3 S4"
        const ROW_H_HEADER3 = 10;   // time labels (vertical)
        const HEADER_H = ROW_H_HEADER1 + ROW_H_HEADER2 + ROW_H_HEADER3;
        const ROW_H = 8;    // each data row (formateur / module / salle)
        const GROUP_H = ROW_H * ROW_TYPES.length;

        // ─── HELPERS ──────────────────────────────────────────────────────
        const setFill = (rgb) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        const setStroke = (rgb) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
        const setTextC = (rgb) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

        /**
         * Draw a cell (filled rect + border + centered text with wrapping).
         */
        function drawCell(x, y, w, h, text, opts = {}) {
            const {
                fillColor = COLOR_WHITE_BG,
                textColor = [30, 30, 30],
                fontSize = 5.5,
                bold = false,
                align = 'center',
                valign = 'middle',
                padding = 1,
                rotate = 0,         // degrees (90 for vertical text)
            } = opts;

            setFill(fillColor);
            setStroke(COLOR_BORDER);
            doc.setLineWidth(0.15);
            doc.rect(x, y, w, h, 'FD');

            if (!text) return;

            doc.setFontSize(fontSize);
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            setTextC(textColor);

            const str = String(text);

            if (rotate !== 0) {
                // Vertical text — rotate around cell center
                const cx = x + w / 2;
                const cy = y + h / 2;
                doc.saveGraphicsState();
                doc.text(str, cx, cy, {
                    angle: rotate,
                    align: 'center',
                    baseline: 'middle',
                });
                doc.restoreGraphicsState();
                return;
            }

            // Wrap text
            const maxW = w - padding * 2;
            const lines = doc.splitTextToSize(str, maxW);

            const lineHeight = fontSize * 0.4;
            const totalTextH = lines.length * lineHeight;

            let ty;
            if (valign === 'middle') ty = y + h / 2 - totalTextH / 2 + lineHeight / 2;
            else if (valign === 'top') ty = y + padding + lineHeight / 2;
            else ty = y + h - padding - totalTextH + lineHeight / 2;

            lines.forEach((line, i) => {
                let tx;
                const lineW = doc.getTextWidth(line);
                if (align === 'center') tx = x + w / 2 - lineW / 2;
                else if (align === 'left') tx = x + padding;
                else tx = x + w - padding - lineW;

                doc.text(line, tx, ty + i * lineHeight);
            });
        }

        // ─── PAGINATION LOGIC ─────────────────────────────────────────────
        // How many groups fit per page?
        const AVAIL_H = PAGE_H - MARGIN * 2 - HEADER_H;
        const GROUPS_PER_PG = Math.max(1, Math.floor(AVAIL_H / GROUP_H));

        // Split groupes into pages
        const pages = [];
        for (let i = 0; i < groupes.length; i += GROUPS_PER_PG) {
            pages.push(groupes.slice(i, i + GROUPS_PER_PG));
        }

        // ─── RENDER EACH PAGE ─────────────────────────────────────────────
        pages.forEach((pageGroups, pageIndex) => {
            if (pageIndex > 0) doc.addPage();

            const startX = MARGIN;
            const startY = MARGIN;

            // ── HEADER ROW 1: Title + Day names ──────────────────────────────
            let y = startY;

            // Top-left spanning cell (Group + Type labels header)
            drawCell(startX, y, LEFT_W, HEADER_H, 'Groupe / Type', {
                fillColor: COLOR_GROUP_BG,
                textColor: COLOR_HEADER_TEXT,
                fontSize: 6,
                bold: true,
            });

            // Day headers (each spans 4 slots)
            DAYS.forEach((day, di) => {
                const x = startX + LEFT_W + di * SLOTS.length * SLOT_W;
                const w = SLOTS.length * SLOT_W;
                drawCell(x, y, w, ROW_H_HEADER1, day, {
                    fillColor: COLOR_HEADER_BG,
                    textColor: COLOR_HEADER_TEXT,
                    fontSize: 6.5,
                    bold: true,
                });
            });

            // ── HEADER ROW 2: Slot names (S1–S4) ─────────────────────────────
            y += ROW_H_HEADER1;
            DAYS.forEach((_, di) => {
                SLOTS.forEach((slot, si) => {
                    const x = startX + LEFT_W + (di * SLOTS.length + si) * SLOT_W;
                    drawCell(x, y, SLOT_W, ROW_H_HEADER2, slot, {
                        fillColor: COLOR_HEADER_BG,
                        textColor: COLOR_HEADER_TEXT,
                        fontSize: 5.5,
                        bold: true,
                    });
                });
            });

            // ── HEADER ROW 3: Time labels (vertical) ─────────────────────────
            y += ROW_H_HEADER2;
            DAYS.forEach((_, di) => {
                SLOTS.forEach((_, si) => {
                    const x = startX + LEFT_W + (di * SLOTS.length + si) * SLOT_W;
                    drawCell(x, y, SLOT_W, ROW_H_HEADER3, TIMES[si], {
                        fillColor: COLOR_HEADER_BG,
                        textColor: COLOR_HEADER_TEXT,
                        fontSize: 5,
                        rotate: 90,
                    });
                });
            });

            // ── DATA ROWS ─────────────────────────────────────────────────────
            y += ROW_H_HEADER3;

            pageGroups.forEach((group) => {
                const groupY = y;

                // Group name cell (spans 3 rows)
                drawCell(startX, groupY, COL_GROUP_W, GROUP_H, group.nom, {
                    fillColor: COLOR_GROUP_BG,
                    textColor: COLOR_HEADER_TEXT,
                    fontSize: 5,
                    bold: true,
                });

                ROW_TYPES.forEach((rowType, ri) => {
                    const rowY = groupY + ri * ROW_H;

                    // Row type label
                    drawCell(startX + COL_GROUP_W, rowY, COL_TYPE_W, ROW_H, rowType, {
                        fillColor: COLOR_LABEL_BG,
                        textColor: [30, 30, 30],
                        fontSize: 5,
                        bold: false,
                        align: 'left',
                        padding: 1.5,
                    });

                    // Data cells
                    DAYS.forEach((day, di) => {
                        SLOTS.forEach((slot, si) => {
                            const cellX = startX + LEFT_W + (di * SLOTS.length + si) * SLOT_W;
                            const slotData = planning?.[group.id]?.[day]?.[slot] || {};

                            const isGray = si >= 2 && !slotData.formateur && !slotData.module && !slotData.salle;

                            let cellText = '';
                            if (rowType === 'FORMATEUR') cellText = slotData.formateur || '';
                            else if (rowType === 'MODULE') cellText = slotData.module || '';
                            else if (rowType === 'SALLE') cellText = slotData.salle || '';

                            const isTeams = slotData.salle === 'Teams';

                            let fillColor = isGray ? COLOR_GRAY_BG : COLOR_WHITE_BG;
                            let textColor = [30, 30, 30];
                            if (isTeams) {
                                fillColor = COLOR_GREEN_BG;
                                textColor = COLOR_GREEN_TEXT;
                            }

                            drawCell(cellX, rowY, SLOT_W, ROW_H, cellText, {
                                fillColor,
                                textColor,
                                fontSize: 5,
                                align: 'center',
                            });
                        });
                    });
                });

                y += GROUP_H;
            });

            // Page number footer
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            setTextC([100, 100, 100]);
            doc.text(
                `Page ${pageIndex + 1} / ${pages.length}`,
                PAGE_W - MARGIN,
                PAGE_H - 2,
                { align: 'right' }
            );
        });

        // ─── SAVE ─────────────────────────────────────────────────────────
        doc.save('emploi_du_temps.pdf');
    }

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