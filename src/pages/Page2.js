import React, { useEffect, useState } from 'react';

const Page2 = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/personal-info')
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h1>Page 2</h1>
            <h2>Personal Info</h2>
            <ul>
                {data.map((item) => (
                    <li key={item.id}>
                        ID: {item.id} - Name: {item.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Page2;
