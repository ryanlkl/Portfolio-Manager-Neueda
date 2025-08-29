import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import axios from 'axios';

function BasicExample() {

    const [holdings, setHoldings] = useState([])

    useEffect(() => {
        const fetchHoldings = async () => {
            try {
                const response = await axios.get('http://localhost:3000/portfolio/0595ae83-c94f-4275-8fc5-bc3e9b7ff25a/assets/stocks/');
                setHoldings(response.data.stocks);
                console.log(response.data.stocks);
            } catch (error) {
                console.error("Error fetching holdings:", error);
            }
        };

        fetchHoldings();
    },[])

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Stock Name</th>
          <th>Ticker</th>
          <th>Volume</th>
          <th>Total Value</th>
          <th>Gain/Loss</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((holding) => (
            <tr key={holding.id}>
                <td>{holding.name}</td>
                <td>{holding.ticker}</td>
                <td>{holding.quantity}</td>
                <td>{holding.totalValue}</td>
                <td>{holding.gainLoss}</td>
            </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default BasicExample;