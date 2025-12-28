export  const calculateTotals = ({ rate, weight, advance }) => {
    const total = Number(rate || 0) * Number(weight || 0);
    const netBalance = total - Number(advance || 0);
  
    return {
      total,
      netBalance
    };
  };