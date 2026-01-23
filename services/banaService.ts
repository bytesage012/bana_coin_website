// Simulating a price fetch for the live ticker
export const fetchBanaPrice = async (): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Random price fluctuation simulation
  const basePrice = 0.00420;
  const fluctuation = (Math.random() * 0.00010) - 0.00005;
  return (basePrice + fluctuation).toFixed(6);
};
