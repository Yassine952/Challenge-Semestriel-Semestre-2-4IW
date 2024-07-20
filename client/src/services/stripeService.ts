import axios from 'axios';

export const createCheckoutSession = async (cartItems: any) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/stripe/create-checkout-session`,
    { cartItems },
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
  await axios.post(
    `${import.meta.env.VITE_API_URL}/cart/clear-after-payment`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
