import axios from 'axios';

export const createCheckoutSession = async (checkoutData: any) => {
  const token = localStorage.getItem('token');
  
  // Support pour l'ancien format (rétrocompatibilité)
  const requestData = Array.isArray(checkoutData) 
    ? { cartItems: checkoutData }
    : checkoutData;
  
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/stripe/create-checkout-session`,
    requestData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const clearCartAfterPayment = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/cart/clear-after-payment`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
