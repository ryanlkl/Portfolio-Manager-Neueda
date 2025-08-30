import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

function BasicExample() {
    const user = useAuthStore((state) => state.user);
    const portfolioId = user.portfolio.id;
    const [holdings, setHoldings] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHoldings = async () => {
            try {
              console.log(user.portfolio.id)
                const response = await axios.get(`http://localhost:3000/portfolio/${portfolioId}/assets/stocks/`);
                setHoldings(response.data.stocks);
                console.log(response.data.stocks);
            } catch (error) {
                console.error("Error fetching holdings:", error);
            }
        };

        fetchHoldings();
    },[])

    const handleRowClick = (ticker) => {
      navigate(`/performance?ticker=${ticker}`)
    }

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
            <tr key={holding.id}
              onClick={() => handleRowClick(holding.ticker)}
              style={{ cursor: 'pointer' }}
            >
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