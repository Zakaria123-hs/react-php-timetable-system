// import axios from 'axios';
import { React, useEffect, useState } from 'react';
import './App.css'

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/php/time_tableV2.php/backend/fetch_data.php');
                const data = await response.json();
                console.log('Data received:', data);
                setData(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data available</div>;

    return (
        <>
            <h2 className="title">Weekly Time Table</h2>
            <table>
                <thead>
                    <tr>
                        <th colSpan="2" rowSpan="3" className="header-block"></th>
                        <th colSpan="4">Lundi</th>
                        <th colSpan="4">Mardi</th>
                        <th colSpan="4">Mercredi</th>
                        <th colSpan="4">Jeudi</th>
                        <th colSpan="4">Vendredi</th>
                        <th colSpan="4">Samedi</th>
                    </tr>
                    <tr>
                        <th>SEANCE1</th><th>SEANCE2</th><th>SEANCE3</th><th>SEANCE4</th>
                        <th>SEANCE1</th><th>SEANCE2</th><th>SEANCE3</th><th>SEANCE4</th>
                        <th>SEANCE1</th><th>SEANCE2</th><th>SEANCE3</th><th>SEANCE4</th>
                        <th>SEANCE1</th><th>SEANCE2</th><th>SEANCE3</th><th>SEANCE4</th>
                        <th>SEANCE1</th><th>SEANCE2</th><th>SEANCE3</th><th>SEANCE4</th>
                        <th>SEANCE1</th><th>SEANCE2</th><th>SEANCE3</th><th>SEANCE4</th>
                    </tr>
                    <tr>
                        <th><div className="vertical-text">08h30-10h30</div></th>
                        <th><div className="vertical-text">10h30-13h00</div></th>
                        <th><div className="vertical-text">13:30-16:00</div></th>
                        <th><div className="vertical-text">16h00-18h30</div></th>
                        <th><div className="vertical-text">08h30-10h30</div></th>
                        <th><div className="vertical-text">10h30-13h00</div></th>
                        <th><div className="vertical-text">13:30-16:00</div></th>
                        <th><div className="vertical-text">16h00-18h30</div></th>
                        <th><div className="vertical-text">08h30-10h30</div></th>
                        <th><div className="vertical-text">10h30-13h00</div></th>
                        <th><div className="vertical-text">13:30-16:00</div></th>
                        <th><div className="vertical-text">16h00-18h30</div></th>
                        <th><div className="vertical-text">08h30-10h30</div></th>
                        <th><div className="vertical-text">10h30-13h00</div></th>
                        <th><div className="vertical-text">13:30-16:00</div></th>
                        <th><div className="vertical-text">16h00-18h30</div></th>
                        <th><div className="vertical-text">08h30-10h30</div></th>
                        <th><div className="vertical-text">10h30-13h00</div></th>
                        <th><div className="vertical-text">13:30-16:00</div></th>
                        <th><div className="vertical-text">16h00-18h30</div></th>
                        <th><div className="vertical-text">08h30-10h30</div></th>
                        <th><div className="vertical-text">10h30-13h00</div></th>
                        <th><div className="vertical-text">13:30-16:00</div></th>
                        <th><div className="vertical-text">16h00-18h30</div></th>
                    </tr>
                </thead>
                <tbody>

                    {
                        data.groupes.map(group =>
                            <React.Fragment key={group.id}>
                            <tr>
                                <td rowSpan="3" className="group-name">
                                    <select>
                                        <option>{group.nom}</option>
                                    </select>
                                </td>
                                <td className="row-label">FORMATEUR</td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td rowSpan="3" className="group-name">
                                    <select>
                                        <option>{group.nom}</option>
                                    </select>
                                </td>
                                <td className="row-label">FORMATEUR</td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td rowSpan="3" className="group-name">
                                    <select>
                                        <option>{group.nom}</option>
                                    </select>
                                </td>
                                <td className="row-label">FORMATEUR</td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td rowSpan="3" className="group-name">
                                    <select>
                                        <option>{group.nom}</option>
                                    </select>
                                </td>
                                <td className="row-label">FORMATEUR</td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td rowSpan="3" className="group-name">
                                    <select>
                                        <option>{group.nom}</option>
                                    </select>
                                </td>
                                <td className="row-label">FORMATEUR</td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td rowSpan="3" className="group-name">
                                    <select>
                                        <option>{group.nom}</option>
                                    </select>
                                </td>
                                <td className="row-label">FORMATEUR</td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="teacher">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>
                                <td className="gray-bg">
                                    <select>
                                        {
                                            data.formateurs.map(formateur =>
                                                <option>{formateur.nom}</option>
                                            )
                                        }
                                    </select>
                                </td>

                            </tr>
                            <tr>
                                <td className="row-label">MODULE</td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="pink-bg module"></td>
                    <td className="gray-bg"></td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>
                    <td className="pink-bg module"></td>
                    <td className="pink-bg module"></td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="gray-bg"></td>
                </tr>

                <tr>
                    <td className="row-label">SALLE</td>

                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="gray-bg"></td>

                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>
                    <td className="room"></td>
                    <td className="room"></td>

                    <td className="green-bg room"></td>
                    <td className="green-bg room"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="gray-bg"></td>
                </tr>
                    </React.Fragment>
                        )
                    }

                    {/* <tr>
                    <td className="row-label">MODULE</td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="pink-bg module"></td>
                    <td className="gray-bg"></td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>
                    <td className="pink-bg module"></td>
                    <td className="pink-bg module"></td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="module"></td>
                    <td className="gray-bg"></td>
                </tr>

                <tr>
                    <td className="row-label">SALLE</td>

                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="gray-bg"></td>

                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>
                    <td className="room"></td>
                    <td className="room"></td>

                    <td className="green-bg room"></td>
                    <td className="green-bg room"></td>
                    <td className="gray-bg"></td>
                    <td className="gray-bg"></td>

                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="room"></td>
                    <td className="gray-bg"></td>
                </tr> */}
                </tbody>
            </table >
        </>
    );
}

export default App