import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import axios from 'axios';

function BasicExample() {

    const [holdings, setHoldings] = useState([])

    useEffect(() => {
        const fetchHoldings = async () => {
            try {
                const response = await axios.get('http://localhost:3000/portfolio/9d26ad8f-56de-4ab4-a70d-fe9577f20e10/assets/stocks/');
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
                <td>${Math.round(holding.totalValue * 100) / 100}</td>
                <td>{Math.round(holding.gainLoss * 100) / 100}%</td>
            </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default BasicExample;